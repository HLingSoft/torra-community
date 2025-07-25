import User from "../User"
import AV from "../fake-av"

import DayJS from "dayjs"
import cn from "dayjs/locale/zh-cn.js"
import relativeTime from "dayjs/plugin/relativeTime.js"

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumPayment {
  AMOUNT = "amount",
  UPDATEDAT = "updatedAt",
  CONTENT = "content",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  CHANNEL = "channel",
  PREPAY_ID = "prepay_id",
  SUCCESS = "success",
  VALIDATED = "validated",
  ATTACH = "attach",
  MP_OPENID = "mp_openid",
  USER = "user",
}

class Payment extends AV.Object {
  static _CLASSNAME = "Payment"
  public tempVars: Record<string, any> = {}
  static _SCHEMA = {
    amount: 'number',
    content: 'string',
    channel: 'string',
    prepay_id: 'string',
    success: 'boolean',
    validated: 'boolean',
    attach: 'string',
    mp_openid: 'string',
    user: 'pointer',
  } as const
  constructor() {
    super()
    return new Proxy(this, {
      get(target, prop: string | symbol) {
        // 如果 prop 是 symbol，直接返回默认行为
        if (typeof prop !== "string") {
          return Reflect.get(target, prop)
        }

        // 如果是动态属性，则从 tempVars 中获取
        if (prop.startsWith("temp_")) {
          return target.tempVars[prop]
        }

        // 否则尝试从原始对象获取
        return Reflect.get(target, prop)
      },
      set(target, prop: string | symbol, value: any) {
        // 如果 prop 是 symbol，直接返回默认行为
        if (typeof prop !== "string") {
          return Reflect.set(target, prop, value)
        }

        // 如果是动态属性，则存储到 tempVars 中
        if (prop.startsWith("temp_")) {
          target.tempVars[prop] = value
        } else {
          // 否则设置到原始对象
          Reflect.set(target, prop, value)
        }
        return true
      },
    })
  }

  get leanCloudClassName(): string {
    return "Payment"
  }

  get createdAtShort(): string {
    return `${DayJS(this.createdAt).format("MM-DD HH")}点`
  }

  get createdAtLong(): string {
    return DayJS(this.createdAt).format("YYYY-MM-DD HH:mm:ss")
  }

  get relativeTimeShort(): string {
    return DayJS(this.updatedAt).fromNow()
  }

  get relativeTimeCreatedAt(): string {
    return DayJS(this.createdAt).fromNow()
  }

  get createdAtWeekDay(): string {
    return `星期${DayJS(this.createdAt).format("dd")}`
  }

  get updatedAtWeekDay(): string {
    return `星期${DayJS(this.updatedAt).format("dd")}`
  }

  get updatedAtShort(): string {
    return `${DayJS(this.updatedAt).format("MM-DD HH")}点`
  }

  get updatedAtLong(): string {
    return DayJS(this.updatedAt).format("YYYY-MM-DD HH:mm:ss")
  }

  get amount(): number {
    return this.get("amount")
  }

  set amount(value: number | undefined) {
    this.set("amount", value)
  }

  get content(): string {
    return this.get("content")
  }

  set content(value: string | undefined) {
    this.set("content", value)
  }

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  get channel(): string {
    return this.get("channel")
  }

  set channel(value: string | undefined) {
    this.set("channel", value)
  }

  get prepay_id(): string {
    return this.get("prepay_id")
  }

  set prepay_id(value: string | undefined) {
    this.set("prepay_id", value)
  }

  get success(): boolean {
    return this.get("success")
  }

  set success(value: boolean | undefined) {
    this.set("success", value)
  }

  get validated(): boolean {
    return this.get("validated")
  }

  set validated(value: boolean | undefined) {
    this.set("validated", value)
  }

  get attach(): string {
    return this.get("attach")
  }

  set attach(value: string | undefined) {
    this.set("attach", value)
  }

  get mp_openid(): string {
    return this.get("mp_openid")
  }

  set mp_openid(value: string | undefined) {
    this.set("mp_openid", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(Payment, "Payment")
export default Payment
