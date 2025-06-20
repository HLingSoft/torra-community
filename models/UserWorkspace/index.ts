import User from "../User"
import AV from '~/models/fake-av' // 上面那个本地适配器

import DayJS from "dayjs"
import cn from "dayjs/locale/zh-cn.js"
import relativeTime from "dayjs/plugin/relativeTime.js"

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumUserWorkspace {
  DESCRIPTION = "description",
  UPDATEDAT = "updatedAt",
  NAME = "name",
  OBJECTID = "objectId",
  CREATEDAT = "createdAt",
  USER = "user",
  ISDEFAULT = "isDefault",
}

class UserWorkspace extends AV.Object {
  static CLASSNAME = "UserWorkspace"
  public tempVars: Record<string, any> = {}

  constructor(initial?: any) {
    super(UserWorkspace.CLASSNAME, initial)
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

  get description(): string {
    return this.get("description")
  }

  set description(value: string | undefined) {
    this.set("description", value)
  }

  get name(): string {
    return this.get("name")
  }

  set name(value: string | undefined) {
    this.set("name", value)
  }

  get objectId(): string {
    return this.get("objectId")
  }

  set objectId(value: string | undefined) {
    this.set("objectId", value)
  }

  get user(): User {
    return this.get("user")
  }

  set user(value: User | undefined) {
    this.set("user", value)
  }

  get isDefault(): boolean {
    return this.get("isDefault")
  }
  set isDefault(value: boolean | undefined) {
    this.set("isDefault", value)
  }


  [key: `temp_${string}`]: any
}

AV.Object.register(UserWorkspace, UserWorkspace.CLASSNAME)
export default UserWorkspace
