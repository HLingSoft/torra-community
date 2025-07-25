/* ------------------------------------------------------------------ */
/* models/fake-av.ts                                                 */
/* ------------------------------------------------------------------ */

import { nanoid } from 'nanoid'
import { $fetch } from 'ofetch'

/* ------------------------------------------------------------------ */
/* 运行期配置                                                          */
/* ------------------------------------------------------------------ */
let API_BASE = ''       // Feathers REST 根：   {baseURL}/feathers
let FILE_API = '/api/upload'

export function init(options: { baseURL: string; fileEndpoint?: string }) {
    API_BASE = options.baseURL.replace(/\/$/, '') + '/feathers'
    if (options.fileEndpoint) FILE_API = options.fileEndpoint
}

/* ------------------------------------------------------------------ */
/* 存储所有注册信息                                                    */
/* ------------------------------------------------------------------ */
const registeredClasses = new Set<string>()
const classMap = new Map<string, typeof AVObjectFeathers>()
const classSchemas = new Map<string, Record<string, any>>()
// 新增：别名映射（小写属性或 Service 别名 -> 真正的 Service 名称）
const aliasMap = new Map<string, string>()

/* ------------------------------------------------------------------ */
/* 通用数据接口                                                        */
/* ------------------------------------------------------------------ */
export interface AVData {
    objectId: string
    createdAt: Date | string
    updatedAt: Date | string
    [key: string]: any
}

const shouldIgnoreKey = (k: string) =>
    k === 'tempVars' || k.startsWith('temp_') || k.startsWith('_')

const stripTemps = (d: Record<string, any>) => {
    const o: Record<string, any> = {}
    for (const k of Object.keys(d)) {
        if (shouldIgnoreKey(k)) continue
        o[k] = d[k]
    }
    return o
}
/* ------------------------------------------------------------------ */
/* LC.File 兼容实现（支持 File / Blob / {base64} / ArrayBuffer）      */
/* ------------------------------------------------------------------ */
export class AVFile {
    private _name: string
    private _file: File | Blob
    private _url: string | null = null
    private _saved = false

    /**
     * @param name  文件名
     * @param data  File | Blob | {base64:string} | ArrayBuffer | Uint8Array
     * @param mime  可选 MIME，当 data 为 base64/Buffer 时使用
     */
    constructor(
        name: string,
        data: File | Blob | { base64: string } | ArrayBuffer | Uint8Array,
        mime = 'application/octet-stream'
    ) {
        this._name = name

        if (data instanceof File || data instanceof Blob) {
            this._file = data
        } else if ('base64' in (data as any)) {
            this._file = AVFile._blobFromBase64((data as any).base64, mime)
        } else {
            // ArrayBuffer / Uint8Array
            this._file = new Blob([data as any], { type: mime })
        }
    }

    /* 把纯 base64（可带 dataURL 头）转成 Blob */
    private static _blobFromBase64(b64: string, mime: string): Blob {
        const clean = b64.replace(/^data:[^;]+;base64,/, '')
        const bin = atob(clean)
        const buf = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
        return new Blob([buf], { type: mime })
    }

    async save(): Promise<this> {
        const formData = new FormData()
        formData.append(
            'file',
            this._file as any,
            (this._file as any).name ?? this._name
        )

        const res = await fetch(FILE_API, { method: 'POST', body: formData })
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

        const json = await res.json()
        if (!json?.url) throw new Error('Upload response missing url')

        this._url = json.url
        this._saved = true
        return this
    }

    url() { return this._url }
    name() { return this._name }
    toJSON() { return this._url }
    get isAVFile() { return true }
}


/* ------------------------------------------------------------------ */
/* hydrate：兼容你的 Model 构造                                       */
/* ------------------------------------------------------------------ */
function hydrateInstance(Cls: any, raw: any) {
    const ins: any = new Cls()
    if (ins && ins.data && raw && typeof raw === 'object') {
        Object.assign(ins.data, raw)
    }
    try { ins._persisted = true } catch { }
    return ins
}

/* ------------------------------------------------------------------ */
/* AVObjectFeathers                                                   */
/* ------------------------------------------------------------------ */
export class AVObjectFeathers {
    static serviceName = ''
    data: AVData
    public _persisted = false
    /** 每个子类必须覆写自己的字段类型 */
    static _SCHEMA: Record<string, string>
    constructor(init: Partial<AVData> = {}) {
        const now = new Date()
        this.data = {
            objectId: init.objectId ?? nanoid(16),
            createdAt: init.createdAt ?? now,
            updatedAt: init.updatedAt ?? now,
            ...init
        }
        this._persisted = !!init.createdAt
    }

    static createWithoutData<T = any>(
        Cls: new (...args: any[]) => T,
        objectId: string
    ): T {
        const ins: any = new Cls({ objectId })
        ins._persisted = true
        return ins
    }

    get createdAt() { return new Date(this.data.createdAt) }
    set createdAt(v) { this.data.createdAt = v }
    get updatedAt() { return new Date(this.data.updatedAt) }
    set updatedAt(v) { this.data.updatedAt = v }

    get(key: string) { return (this.data as any)[key] }
    set(key: string, v: any): void {
        (this.data as any)[key] = v
    }

    toJSON() {
        return JSON.parse(JSON.stringify(this.serialize(this.data)))
    }

    get _svc() {
        return (this.constructor as typeof AVObjectFeathers).serviceName
    }

    harvestInstanceProps() {
        for (const k of Object.keys(this as any)) {
            if (k === 'data' || k === '_persisted') continue
            if (shouldIgnoreKey(k)) continue
            const v = (this as any)[k]
            if (typeof v === 'function') continue
            (this.data as any)[k] = v
        }
    }

    serialize(d: any) {
        const out: any = {}
        for (const k of Object.keys(d)) {
            if (shouldIgnoreKey(k)) continue
            const v = d[k]

            if (v instanceof Date) {
                out[k] = v.toISOString()
            } else if (v && typeof v === 'object' && (v as any).isAVFile) {
                out[k] = (v as AVFile).url()
            } else if (v instanceof AVObjectFeathers) {
                // 如果它是 Point（或其他 AVObjectFeathers），都只存 objectId
                out[k] = {
                    __type: 'Pointer',
                    className: v._svc,
                    objectId: v.data.objectId
                }
            } else {
                out[k] = v
            }
        }
        return out
    }

    async save(): Promise<this> {
        const url = `${API_BASE}/${this._svc}`
        this.harvestInstanceProps()
        this.data.updatedAt = new Date()

        // console.log('[fake-av] saving', this._svc, Object.keys(this.data))
        try {
            if (!this._persisted) {
                const created = await $fetch<AVData>(url, {
                    method: 'POST',
                    body: this.serialize(this.data)
                })
                this.data = created
                this._persisted = true
            } else {
                const patched = await $fetch<AVData>(`${url}/${this.data.objectId}`, {
                    method: 'PATCH',
                    body: this.serialize(this.data)
                })
                this.data = patched
            }
        } catch (e: any) {
            console.error('[AV.save] error', e)
        }
        return this
    }

    async destroy() {
        if (!this.data.objectId) return
        await $fetch(`${API_BASE}/${this._svc}/${this.data.objectId}`, { method: 'DELETE' })
        this._persisted = false
    }

    async fetch() {
        if (!this.data.objectId) return this
        const url = `${API_BASE}/${this._svc}/${this.data.objectId}`
        const data = await $fetch<Partial<AVData>>(url)
        Object.assign(this.data, stripTemps(data as any))
        this._persisted = true
        return this
    }

    static query(this: any) { return new LCQueryFeathers(this) }
}

/* ------------------------------------------------------------------ */
/* 查询类                                                              */
/* ------------------------------------------------------------------ */
class LCQueryFeathers {
    constructor(private Cls: any) { }

    private f: Record<string, any> = {}
    private ord?: Record<string, 1 | -1>
    private lim?: number
    private inc: string[] = []

    equalTo(k: string, v: any) {
        this.f[k] = v && typeof v === 'object' && v.objectId ? v.objectId : v
        return this
    }

    containedIn(k: string, a: any[]) { this.f[k] = { $in: a }; return this }
    ascending(k: string) { this.ord = { [k]: 1 }; return this }
    descending(k: string) { this.ord = { [k]: -1 }; return this }
    limit(n: number) { this.lim = n; return this }
    include(...fields: string[]) { this.inc.push(...fields); return this }

    private params() {
        const p: any = { ...this.f }
        if (this.ord) p.$sort = this.ord
        if (this.lim) p.$limit = this.lim
        if (this.inc.length) p.$populate = this.inc
        return p
    }

    async find(): Promise<any[]> {
        const url = `${API_BASE}/${this.Cls.serviceName}`
        const { data = [] } = await $fetch<{ data?: any[] }>(url, { params: this.params() })
            .catch(() => ({ data: [] }))
        return data.map(raw => hydrateInstance(this.Cls, raw))
    }

    async first(): Promise<any | null> {
        this.limit(1)
        const a = await this.find()
        return a[0] ?? null
    }

    async get(id: string): Promise<any> {
        const url = `${API_BASE}/${this.Cls.serviceName}/${id}`
        const data = await $fetch<any>(url, { params: this.params() })
        return hydrateInstance(this.Cls, data)
    }
}

/* ------------------------------------------------------------------ */
/* LocalHost 风格 extend / register                                   */
/* ------------------------------------------------------------------ */
function extend(className: string) {
    return class extends AVObjectFeathers {
        static override serviceName = className
    }
}

function register(Cls: typeof AVObjectFeathers, className: string) {
    // 1) 正常注册
    Cls.serviceName = className
    registeredClasses.add(className)
    classMap.set(className, Cls)

    // 2) 别名：className 本身 + 小写
    aliasMap.set(className, className)
    aliasMap.set(className.toLowerCase(), className)

    // // 3) 从 getter/setter 反射字段，做 schema
    // const proto = Cls.prototype
    // const descs = Object.getOwnPropertyDescriptors(proto)
    // const schema: Record<string, any> = {}
    // for (const [key, desc] of Object.entries(descs)) {
    //     if (key === 'constructor') continue
    //     if (key.startsWith('temp_') || key.startsWith('_')) continue
    //     if (typeof desc.get === 'function' && typeof desc.set === 'function') {
    //         schema[key] = null
    //         aliasMap.set(key, className)
    //         aliasMap.set(key.toLowerCase(), className)
    //     }
    // }
    // classSchemas.set(className, schema)
}

/* ------------------------------------------------------------------ */
/* 导出（包含 File & 注册映射）                                        */
/* ------------------------------------------------------------------ */
export const AV = {
    Object: Object.assign(AVObjectFeathers, {
        extend,
        register: (Cls: any, n: string) => register(Cls, n),
        createWithoutData: AVObjectFeathers.createWithoutData
    }),
    Query: LCQueryFeathers,
    File: AVFile,
    init,
    _classes: registeredClasses,
    _classMap: classMap,
    _classSchemas: classSchemas,
    _aliasMap: aliasMap   // ← 新增别名映射
}

export default AV

/* ------------------------------------------------------------------ */
/* 全局补丁                                                            */
/* ------------------------------------------------------------------ */
declare global {
    interface Array<T> {
        forEach(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): void
    }
    interface Object {
        save(): Promise<any>
        destroy(): Promise<void>
        fetch(): Promise<any>
        _svc?: string
        createdAt: Date
        updatedAt: Date
    }
}
