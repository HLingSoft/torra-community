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
export enum EnumUserFinance {
  UPDATEDAT = "updatedAt",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  CURRENCY = "currency",
  BALANCE = "balance",
  TOKENBALANCE = "tokenBalance",
  TOTALRECHARGE = "totalRecharge",
  USER = "user",
  TOTALTOKENCONSUME = "totalTokenConsume",
}

class UserFinance extends AV.Object {
  static _CLASSNAME = "UserFinance"

  static _SCHEMA = {
    balance: 'number',   // REAL
    tokenBalance: 'number',
    totalRecharge: 'number',
    totalTokenConsume: 'number',
    currency: 'string',   // TEXT
    user: 'pointer',  // TEXT(JSON)  ↔  User 实例
    tags: 'array',    // TEXT(JSON)
    extra: 'object',   // TEXT(JSON)
    location: 'point',    // TEXT(JSON) 或 lat/lng
    vip: 'boolean',  // INTEGER(1)
    createdAt: 'date',     // DATETIME
  }


  public tempVars: Record<string, any> = {}

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
    return "UserFinance"
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

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  get currency(): string {
    return this.get("currency")
  }

  set currency(value: string | undefined) {
    this.set("currency", value)
  }

  /**
   * 备注:这个是钱
   * 默认值:未设置
   * 是否只读:false
   * 类的JSON说明:{"auto_increment":false,"comment":"这个是钱","default":0,"hidden":false,"read_only":false,"required":false,"type":"Number"}
   */
  get balance(): number {
    return this.get("balance")
  }

  set balance(value: number | undefined) {
    this.set("balance", value)
  }

  get tokenBalance(): number {
    return this.get("tokenBalance")
  }

  set tokenBalance(value: number | undefined) {
    this.set("tokenBalance", value)
  }

  get totalRecharge(): number {
    return this.get("totalRecharge")
  }

  set totalRecharge(value: number | undefined) {
    this.set("totalRecharge", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }

  get totalTokenConsume(): number {
    return this.get("totalTokenConsume")
  }

  set totalTokenConsume(value: number | undefined) {
    this.set("totalTokenConsume", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(UserFinance, "UserFinance")
export default UserFinance
