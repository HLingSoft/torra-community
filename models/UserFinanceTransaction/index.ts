import Workflow from "../Workflow"
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
export enum EnumUserFinanceTransaction {
  AMOUNT = "amount",
  UPDATEDAT = "updatedAt",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  TYPE = "type",
  NOTE = "note",
  CURRENCY = "currency",
  WORKFLOW = "workflow",
  USER = "user",
}

class UserFinanceTransaction extends AV.Object {
  static _CLASSNAME = "UserFinanceTransaction"
  public tempVars: Record<string, any> = {}

  static _SCHEMA = {
    amount: 'number',
    type: 'string',
    note: 'string',
    currency: 'string',
    workflow: 'pointer',
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
    return "UserFinanceTransaction"
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

  /**
   * 备注: 充值的金额
   * 默认值:未设置
   * 是否只读:false
   * 类的JSON说明:{"auto_increment":false,"comment":" 充值的金额","default":0,"hidden":false,"read_only":false,"required":false,"type":"Number"}
   */
  get amount(): number {
    return this.get("amount")
  }

  set amount(value: number | undefined) {
    this.set("amount", value)
  }

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  /**
   * 备注:类型 ("recharge" / "consume")
   * 默认值:未设置
   * 是否只读:false
   * 类的JSON说明:{"comment":"类型 (\"recharge\" / \"consume\")","hidden":false,"read_only":false,"required":false,"type":"String"}
   */
  get type(): string {
    return this.get("type")
  }

  set type(value: string | undefined) {
    this.set("type", value)
  }

  get note(): string {
    return this.get("note")
  }

  set note(value: string | undefined) {
    this.set("note", value)
  }

  get currency(): string {
    return this.get("currency")
  }

  set currency(value: string | undefined) {
    this.set("currency", value)
  }

  get workflow(): Workflow {
    return this.get("workflow")
  }

  set workflow(value: Workflow | undefined) {
    this.set("workflow", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(UserFinanceTransaction, "UserFinanceTransaction")
export default UserFinanceTransaction
