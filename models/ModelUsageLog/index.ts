import AV from '~/models/fake-av' // 上面那个本地适配器
import User from "../User"
import DayJS from "dayjs"
import cn from "dayjs/locale/zh-cn.js"
import relativeTime from "dayjs/plugin/relativeTime.js"
import type Workflow from "../Workflow"

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumModelUsageLog {
  CALLTYPE = "callType",
  UPDATEDAT = "updatedAt",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  TOTALTOKENS = "totalTokens",
  BASEURL = "baseUrl",
  USERPROMPT = "userPrompt",
  SYSTEMPROMPT = "systemPrompt",
  DURATIONMS = "durationMs",
  COMPLETIONTOKENS = "completionTokens",
  HISTORYMESSAGES = "historyMessages",
  PROMPTTOKENS = "promptTokens",
  ASSISTANTMESSAGE = "assistantMessage",
  MODEL = "model",
}

class ModelUsageLog extends AV.Object {
  static CLASSNAME = "ModelUsageLog"
  public tempVars: Record<string, any> = {}

  constructor(initial?: any) {
    super(ModelUsageLog.CLASSNAME, initial)
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
    return "ModelUsageLog"
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

  get callType(): string {
    return this.get("callType")
  }

  set callType(value: string | undefined) {
    this.set("callType", value)
  }

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  get totalTokens(): number {
    return this.get("totalTokens")
  }

  set totalTokens(value: number | undefined) {
    this.set("totalTokens", value)
  }

  get baseUrl(): string {
    return this.get("baseUrl")
  }

  set baseUrl(value: string | undefined) {
    this.set("baseUrl", value)
  }

  get userPrompt(): string {
    return this.get("userPrompt")
  }

  set userPrompt(value: string | undefined) {
    this.set("userPrompt", value)
  }

  get systemPrompt(): string {
    return this.get("systemPrompt")
  }

  set systemPrompt(value: string | undefined) {
    this.set("systemPrompt", value)
  }

  get durationMs(): number {
    return this.get("durationMs")
  }

  set durationMs(value: number | undefined) {
    this.set("durationMs", value)
  }

  get completionTokens(): number {
    return this.get("completionTokens")
  }

  set completionTokens(value: number | undefined) {
    this.set("completionTokens", value)
  }

  get historyMessages(): string {
    return this.get("historyMessages")
  }

  set historyMessages(value: string | undefined) {
    this.set("historyMessages", value)
  }

  get promptTokens(): number {
    return this.get("promptTokens")
  }

  set promptTokens(value: number | undefined) {
    this.set("promptTokens", value)
  }

  get assistantMessage(): string {
    return this.get("assistantMessage")
  }

  set assistantMessage(value: string | undefined) {
    this.set("assistantMessage", value)
  }

  get model(): string {
    return this.get("model")
  }

  set model(value: string | undefined) {
    this.set("model", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }

  get workflow(): Workflow {
    return this.get("workflow")
  }

  set workflow(value: Workflow | undefined) {
    this.set("workflow", value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(ModelUsageLog, ModelUsageLog.CLASSNAME)
export default ModelUsageLog
