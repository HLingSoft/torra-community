import { nanoid } from 'nanoid'

type AllDocsRow<T> = { doc: T }
type Plain = Record<string, any>

// --------- 工具函数 ---------
function toPlain(obj: any) {
    return JSON.parse(JSON.stringify(obj))
}

// --------- AVObjectLocal ---------
export class AVObjectLocal {
    static dbMap: Record<string, any> = {}
    static classMap: Record<string, any> = {}

    data: Plain = {}
    _className: string
    _dbReady: Promise<void>

    constructor(className: string, initial?: Plain) {
        // 支持 super(data) 直接传 data
        if (typeof className === 'object') {
            initial = className
            className = (this.constructor as any).CLASSNAME || this.constructor.name
        }
        this._className = className
        this._dbReady = this.initDB(className)
        this.data = initial ? toPlain(initial) : {}

        // objectId/_id
        if (!this.data.objectId && !this.data._id) {
            const oid = nanoid(16)
            this.data.objectId = oid
            this.data._id = oid
        } else if (!this.data.objectId) {
            this.data.objectId = this.data._id
        } else if (!this.data._id) {
            this.data._id = this.data.objectId
        }
        this.data.createdAt = this.data.createdAt || new Date().toISOString()
        this.data.updatedAt = this.data.updatedAt || new Date().toISOString()
    }

    async initDB(className: string) {
        if (typeof window === 'undefined') throw new Error('只能在浏览器端使用 pouchdb-browser')
        if (!AVObjectLocal.dbMap[className]) {
            const mod = await import('pouchdb-browser')
            AVObjectLocal.dbMap[className] = new mod.default(className)
        }
    }

    get createdAt() { return this.data.createdAt }
    get updatedAt() { return this.data.updatedAt }

    get db() {
        return AVObjectLocal.dbMap[this._className]
    }

    get(key: string) {
        return this.data[key]
    }

    set(key: string, value: any) {
        // 存关联对象时自动转 objectId（如 user/workspace 字段）
        if (value && typeof value === 'object' && value.objectId) {
            this.data[key] = value.objectId
        } else {
            this.data[key] = value
        }
        if (key !== 'updatedAt') this.data.updatedAt = new Date().toISOString()
    }

    toJSON() {
        return {
            __AV: true, // 标记这是 AVObjectLocal 对象
            _className: this._className,
            ...toPlain(this.data),
        }
    }
    static fromJSON(obj: { _className: string, data: Plain }) {
        const Cls = AVObjectLocal.classMap[obj._className]
        if (!Cls) throw new Error(`Unregistered class: ${obj._className}`)
        return new Cls(obj.data)
    }
    async save() {
        await this._dbReady
        if (!this.data.objectId && !this.data._id) {
            const oid = nanoid(16)
            this.data.objectId = oid
            this.data._id = oid
        }
        this.data.updatedAt = new Date().toISOString()
        if (!this.data.createdAt) this.data.createdAt = this.data.updatedAt

        const plain = toPlain(this.data)
        try {
            const old = await this.db.get(plain._id)
            plain._rev = old._rev
            await this.db.put(plain)
        } catch (e: any) {
            if (e.status === 404) {
                await this.db.put(plain)
            } else {
                throw e
            }
        }
        try {
            const latest = await this.db.get(plain._id)
            this.data._rev = latest._rev
        } catch { }
        return this
    }

    async destroy() {
        await this._dbReady
        try { await this.db.remove(this.data._id) } catch { }
    }

    // --------- 静态方法 ---------
    static register(cls: any, className: string) {
        AVObjectLocal.classMap[className] = cls
        cls.CLASSNAME = className
    }

    static async ensureDb(className?: string): Promise<any> {
        const name = className || (this as any).CLASSNAME || this.name
        if (!AVObjectLocal.dbMap[name]) {
            const mod = await import('pouchdb-browser')
            AVObjectLocal.dbMap[name] = new mod.default(name)
        }
        return AVObjectLocal.dbMap[name]
    }

    static getClassName(this: any) {
        return this.CLASSNAME || this.name
    }

    static async all<T = any>(this: any): Promise<T[]> {
        const className = this.getClassName()
        const db = await AVObjectLocal.ensureDb(className)
        const docs = await db.allDocs({ include_docs: true })
        const Cls = AVObjectLocal.classMap[className] || this
        return docs.rows.map((row: AllDocsRow<any>) => new Cls(row.doc))
    }

    static async find<T = any>(this: any, objectId: string): Promise<T | null> {
        const className = this.getClassName()
        const db = await AVObjectLocal.ensureDb(className)
        const Cls = AVObjectLocal.classMap[className] || this
        try {
            const doc = await db.get(objectId)
            return new Cls(doc)
        } catch { return null }
    }
}

// --------- LCQuery ---------
export class LCQuery<T = any> {
    private classType: any
    private filters: Array<{ key: string; value: any }> = []
    private _sortKey: string | null = null
    private _sortDesc: boolean = false
    private _includes: string[] = []
    private _limit: number | null = null

    constructor(classType: any) { this.classType = classType }
    limit(n: number) { this._limit = n; return this }

    equalTo(key: string, value: any) {
        // 自动转 objectId
        if (value && typeof value === 'object' && value.objectId) value = value.objectId
        this.filters.push({ key, value })
        return this
    }

    descending(key: string) { this._sortKey = key; this._sortDesc = true; return this }
    ascending(key: string) { this._sortKey = key; this._sortDesc = false; return this }
    include(field: string) { this._includes.push(field); return this }

    static getId(val: any) {
        return val && typeof val === 'object' && val.objectId ? val.objectId : val
    }

    static isSameRef(a: any, b: any): boolean {
        // 只比 objectId 或值
        return LCQuery.getId(a) === LCQuery.getId(b)
    }

    async find(): Promise<T[]> {
        let all = await this.classType.all()
        all = all.filter((obj: any) =>
            this.filters.every(f => LCQuery.isSameRef(obj.get(f.key), f.value))
        )
        if (this._sortKey) {
            all = all.sort((a: any, b: any) => {
                const v1 = a.get(this._sortKey!)
                const v2 = b.get(this._sortKey!)
                if (v1 === v2) return 0
                if (this._sortDesc) return v1 < v2 ? 1 : -1
                return v1 > v2 ? 1 : -1
            })
        }
        if (this._limit !== null) all = all.slice(0, this._limit)
        return all.slice() // 返回新数组，防止 Proxy 问题
    }
    async first(): Promise<T | null> {
        const results = await this.find()
        return results.length > 0 ? results[0] : null
    }
    async get(objectId: string): Promise<T | null> {
        return await this.classType.find(objectId)
    }
}

// --------- 统一出口 ---------
const LC = {
    Object: AVObjectLocal,
    Query: LCQuery,
}
export default LC
