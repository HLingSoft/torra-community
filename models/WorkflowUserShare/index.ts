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
export enum EnumWorkflowUserShare {
  UPDATEDAT = "updatedAt",
  EDITABLE = "editable",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  ISONLINE = "isOnline",
  WORKFLOW = "workflow",
  VALIDATED = "validated",
  USER = "user",
  FROMUSER = "fromUser",
}

class WorkflowUserShare extends AV.Object {
  static _CLASSNAME = "WorkflowUserShare"
  public tempVars: Record<string, any> = {}

  static _SCHEMA = {
    editable: 'boolean',
    isOnline: 'boolean',
    workflow: 'pointer',
    validated: 'boolean',
    user: 'pointer',
    fromUser: 'pointer',
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
    return "WorkflowUserShare"
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

  get editable(): boolean {
    return this.get("editable")
  }

  set editable(value: boolean | undefined) {
    this.set("editable", value)
  }

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  get isOnline(): boolean {
    return this.get("isOnline")
  }

  set isOnline(value: boolean | undefined) {
    this.set("isOnline", value)
  }

  get workflow(): Workflow {
    return this.get("workflow")
  }

  set workflow(value: Workflow | undefined) {
    this.set("workflow", value)
  }

  get validated(): boolean {
    return this.get("validated")
  }

  set validated(value: boolean | undefined) {
    this.set("validated", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }


  get fromUser(): User {
    return this.get("fromUser")
  }

  set fromUser(value: User | undefined) {
    this.set("fromUser", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(WorkflowUserShare, "WorkflowUserShare")
export default WorkflowUserShare
