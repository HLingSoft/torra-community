/* ------------------------------------------------------------------ */
/* server/feathers/auto-register.ts                                   */
/* ------------------------------------------------------------------ */
import type { Application, Params } from '@feathersjs/feathers'
import { nanoid } from 'nanoid'
import { AV } from '~~/models/fake-av'
import { DB, sql, mongoose } from '~~/server/feathers/db'


type AnyObj = Record<string, any>

// 保留字段 & 忽略规则
const RESERVED = new Set(['objectId', 'createdAt', 'updatedAt'])
const shouldIgnoreKey = (k: string) =>
    k === 'tempVars' || k.startsWith('temp_') || k.startsWith('_')

/** 把非原始类型（object/array）序列化成字符串 */
const isPrimitive = (v: any) =>
    v === null || ['string', 'number', 'boolean'].includes(typeof v)

const stringifyObjectsForSql = (d: AnyObj) => {
    for (const k of Object.keys(d)) {
        if (RESERVED.has(k) || shouldIgnoreKey(k)) continue
        const v = d[k]
        if (!isPrimitive(v)) {
            d[k] = JSON.stringify(v ?? null)
        }
    }
    return d
}

/** 时间字段处理 */
const touchTimestamps = (d: AnyObj, isCreate: boolean) => {
    const now = new Date()
    if (isCreate && !d.createdAt) d.createdAt = now
    d.updatedAt = now
}
const normalizeDates = (d: AnyObj) => {
    for (const k of Object.keys(d)) {
        if (d[k] instanceof Date) d[k] = d[k].toISOString()
    }
    return d
}

/** 去掉 temp_ 系列字段 */
const stripTemps = (d: AnyObj) => {
    const o: AnyObj = {}
    for (const k of Object.keys(d)) {
        if (shouldIgnoreKey(k)) continue
        o[k] = d[k]
    }
    return o
}

/** 创建表，如果不存在 */
const ensureSqlTable = async (table: string) => {
    if (await sql!.schema.hasTable(table)) return
    await sql!.schema.createTable(table, t => {
        t.string('objectId').primary()
        t.dateTime('createdAt')
        t.dateTime('updatedAt')
    })

}

/** 增列（改进版：使用schema推断） */

const addSqlCols = async (table: string, schema: Record<string, string>) => {
    if (!schema) return

    // ① 读出已存在的列
    const raw = await sql!.raw(
        DB === 'mysql'
            ? `SHOW COLUMNS FROM \`${table}\``
            : `PRAGMA table_info(${table})`
    )
    const existing = new Set(
        (DB === 'mysql' ? raw[0] : raw).map((c: any) => c.Field || c.name)
    )

    // ② LocalHost → SQL 类型映射
    const typeMap: Record<string, string> = DB === 'mysql'
        ? {
            number: 'DOUBLE',
            boolean: 'TINYINT(1)',
            date: 'DATETIME',
            string: 'TEXT',
            file: 'TEXT',   // 存 URL
            array: 'TEXT',   // JSON 字符串
            object: 'TEXT',   // JSON 字符串
            any: 'TEXT',   // 任意
            pointer: 'TEXT',   // {"__type":"Pointer",…}
            point: 'TEXT',   // {"__type":"Geo",…}
        }
        : {
            number: 'REAL',
            boolean: 'INTEGER', // 0/1
            date: 'DATETIME',
            string: 'TEXT',
            file: 'TEXT',
            array: 'TEXT',
            object: 'TEXT',
            any: 'TEXT',
            pointer: 'TEXT',
            point: 'TEXT',
        }

    // ③ 找出缺失列
    const missing: Array<{ key: string; type: string }> = []
    for (const [key, lcType] of Object.entries(schema)) {
        if (existing.has(key)) continue
        missing.push({
            key,
            type: typeMap[lcType] || 'TEXT', // 不认识的统统用 TEXT
        })
    }

    // ④ 逐个 ALTER TABLE 新增
    for (const { key, type } of missing) {
        await sql!.raw(
            DB === 'mysql'
                ? `ALTER TABLE \`${table}\` ADD COLUMN \`${key}\` ${type}`
                : `ALTER TABLE "${table}" ADD COLUMN "${key}" ${type}`
        )
    }
}




/** 解析并保留 Feathers 的 where/limit/sort/populate */
const normalizeSqlQuery = (raw: AnyObj = {}) => {
    const q: {
        where: AnyObj
        limit?: number
        sort?: Record<string, 1 | -1>
        populate?: string[]
    } = { where: {} }

    for (const [k, v] of Object.entries(raw)) {
        if (k === '$limit') {
            q.limit = Number(v)
        } else if (k === '$sort') {
            q.sort = typeof v === 'string' ? JSON.parse(v) : (v as any)
        } else if (k === '$populate') {
            q.populate = Array.isArray(v) ? v : [v]
        } else if (typeof v === 'object' && v && '$in' in v) {
            q.where[k] = sql!.raw('?? in (?)', [k, (v as any).$in])
        } else {
            q.where[k] = v
        }
    }
    return q
}

/** 自动尝试 JSON.parse，看是不是存储的 Array/Object */
function tryParseJSONField(v: any) {
    if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
        try { return JSON.parse(v) } catch { }
    }
    return v
}
// 抽出来的 helper
// 抽象出的 populate hydrating helper
async function hydratePopulate(rows: AnyObj[], fields: string[]) {

    for (const field of fields) {

        for (const [i, row] of rows.entries()) {
            const rawVal = tryParseJSONField(row[field])

            if (
                !rawVal ||
                typeof rawVal !== 'object' ||
                rawVal.__type !== 'Pointer' ||
                !rawVal.className ||
                !rawVal.objectId
            ) {

                continue
            }

            const className = rawVal.className
            const objectId = rawVal.objectId

            let childRow: AnyObj | undefined
            try {
                childRow = await sql!(className).where({ objectId }).first()
            } catch (e) {
                console.error(`  ❌ [row ${i}] error querying "${className}":`, e)
                continue
            }

            if (!childRow) {

                row[field] = null
                continue
            }

            // JSON.parse 子字段
            for (const k of Object.keys(childRow)) {
                childRow[k] = tryParseJSONField(childRow[k])
            }

            // 包成实例
            const Cls = AV._classMap.get(className)!
            const inst = Cls.createWithoutData(Cls, objectId)
            Object.assign(inst.data, childRow)

            row[field] = inst
        }
    }
}


/** 构造 SQLite/MySQL Service，支持 populate + JSON.parse */
const makeSqlService = (table: string) => ({
    async find(params?: Params) {
        const q = normalizeSqlQuery(params?.query as AnyObj)
        await ensureSqlTable(table)

        // 1) 原始查询 + 2) JSON.parse ... （保持不变）
        let rows = await sql!(table)/*…*/
        rows.forEach(r => Object.keys(r).forEach(k => r[k] = tryParseJSONField(r[k])))

        // 3) 统一调用 helper
        if (q.populate?.length) {
            await hydratePopulate(rows, q.populate)
        }

        return { data: rows }
    },

    async get(id: string, params?: Params) {
        const q = normalizeSqlQuery(params?.query as AnyObj)
        await ensureSqlTable(table)

        const row = (await sql!(table).where({ objectId: id }).first()) || {}
        Object.keys(row).forEach(k => row[k] = tryParseJSONField(row[k]))

        if (q.populate?.length) {
            // 注意：get 只有一个对象，但我们也可以给它一个长度为 1 的数组来复用 helper
            await hydratePopulate([row], q.populate)
        }

        return row
    },

    async create(d: AnyObj = {}) {
        d.objectId ??= nanoid(16)
        touchTimestamps(d, true)
        normalizeDates(d)
        d = stripTemps(d)
        d = stringifyObjectsForSql(d)

        await addSqlCols(table, d)
        await sql!(table).insert(d)
        return d
    },

    async patch(id: string, d: AnyObj = {}) {
        if (!d || Object.keys(d).length === 0) {
            return this.get(id)
        }
        touchTimestamps(d, false)
        normalizeDates(d)
        d = stripTemps(d)
        d = stringifyObjectsForSql(d)

        await addSqlCols(table, d)
        await sql!(table).where({ objectId: id }).update(d)
        return this.get(id)
    },

    async remove(id: string) {
        await sql!(table).where({ objectId: id }).del()
        return { objectId: id }
    }
})

/** 构造 Mongo Service（保持不变） */
const makeMongoService = (name: string) => {
    const coll = () => mongoose!.connection.db!.collection(name)
    return {
        async find(p?: Params) {
            const q = { ...(p?.query ?? {}) }
            const cursor = coll().find(q)
            if (typeof q.$limit === 'number') cursor.limit(q.$limit)
            if (q.$sort && typeof q.$sort === 'object') cursor.sort(q.$sort)
            const data = await cursor.toArray()
            return { data }
        },
        async get(id: string) {
            return coll().findOne({ objectId: id })
        },
        async create(d: AnyObj = {}) {
            d.objectId ??= nanoid(16)
            touchTimestamps(d, true)
            normalizeDates(d)
            d = stripTemps(d)
            await coll().insertOne(d)
            return d
        },
        async patch(id: string, d: AnyObj = {}) {
            touchTimestamps(d, false)
            normalizeDates(d)
            d = stripTemps(d)
            await coll().updateOne({ objectId: id }, { $set: d })
            return coll().findOne({ objectId: id })
        },
        async remove(id: string) {
            await coll().deleteOne({ objectId: id })
            return { objectId: id }
        }
    }
}





/** 按需注册（支持 alias → 真正 serviceName） */
export const ensureService = async (app: Application, name: string) => {
    const real = AV._classes.has(name)
        ? name
        : AV._aliasMap.get(name) || name

    try {
        app.service(name)
        return
    } catch { }

    if (!AV._classes.has(real)) {
        console.warn(`[ensureService] Neither "${name}" nor alias→"${real}" was registered`)
    }

    if (DB === 'mongo') {
        app.use(name, makeMongoService(real))
    } else {
        await ensureSqlTable(real)
        app.use(name, makeSqlService(real))
    }


}
// ─── 启动时：一次性建表+增列 ───────────────────────────────────────
export const registerAllNow = async (app: any) => {
    for (const svc of AV._classes) {
        await ensureService(app, svc)
        const Cls = AV._classMap.get(svc)!

        // 同时兼容 SCHEMA / _SCHEMA
        const schema: Record<string, string> | undefined =
            (Cls as any)._SCHEMA

        if (!schema || typeof schema !== 'object')
            throw new Error(`[AV] Model "${svc}" 必须声明 static SCHEMA 或 _SCHEMA`)

        AV._classSchemas.set(svc, schema)
        await addSqlCols(svc, schema)
    }
}
