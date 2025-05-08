import Workflow from "../Workflow"
import WorkflowHistory from "../WorkflowHistory"
import User from "../User"
import AV from "leancloud-storage"

import DayJS from "dayjs"
import cn from "dayjs/locale/zh-cn.js"
import relativeTime from "dayjs/plugin/relativeTime.js"

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumWorkflowRunLog {
  UPDATEDAT = "updatedAt",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  WORKFLOW = "workflow",
  LOGS = "logs",
  VALIDATED = "validated",
  USER = "user",
  CHANNEL = "channel",
  NAME = "name",
  VERSION = "version",
  WORKFLOWHISTORY = "history",
  TIMES = "times",
  RESULT = "result",
}

class WorkflowRunLog extends AV.Object {
  static LEANCLOUD_CLASSNAME = "WorkflowRunLog"
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
    return "WorkflowRunLog"
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



  get name(): string {
    return this.get("name")
  }
  set name(value: string | undefined) {
    this.set("name", value)
  }



  get workflowHistory(): WorkflowHistory {
    return this.get("history")
  }
  set workflowHistory(value: WorkflowHistory | undefined) {
    this.set("history", value)
  }

  get times(): number {
    return this.get("times")
  }
  set times(value: number | undefined) {
    this.set("times", value)
  }

  get result(): any {
    return this.get("result")
  }

  set result(value: any | undefined) {
    this.set("result", value)
  }

  get logs(): Array<any> {
    return this.get("logs")
  }
  set logs(value: Array<any> | undefined) {
    this.set("logs", value)
  }

  get channel(): string {
    return this.get("channel")
  }

  set channel(value: string | undefined) {
    this.set("channel", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(WorkflowRunLog, "WorkflowRunLog")
export default WorkflowRunLog
