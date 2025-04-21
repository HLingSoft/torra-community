import type User from '../User'
import DayJS from 'dayjs'

import cn from 'dayjs/locale/zh-cn.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import AV from 'leancloud-storage'
import type UserWorkspace from '../UserWorkspace'

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumWorkflow {
  DESCRIPTION = 'description',
  UPDATEDAT = 'updatedAt',
  NAME = 'name',
  OBJECTID = 'objectId',
  CREATEDAT = 'createdAt',
  ICON = 'icon',
  NODES = 'nodes',
  USER = 'user',
  EDGES = 'edges',
  WORKSPACE = 'workspace',
}

class Workflow extends AV.Object {
  static LEANCLOUD_CLASSNAME = 'Workflow'
  public tempVars: Record<string, any> = {}

  constructor() {
    super()
    return new Proxy(this, {
      get(target, prop: string | symbol) {
        // 如果 prop 是 symbol，直接返回默认行为
        if (typeof prop !== 'string') {
          return Reflect.get(target, prop)
        }

        // 如果是动态属性，则从 tempVars 中获取
        if (prop.startsWith('temp_')) {
          return target.tempVars[prop]
        }

        // 否则尝试从原始对象获取
        return Reflect.get(target, prop)
      },
      set(target, prop: string | symbol, value: any) {
        // 如果 prop 是 symbol，直接返回默认行为
        if (typeof prop !== 'string') {
          return Reflect.set(target, prop, value)
        }

        // 如果是动态属性，则存储到 tempVars 中
        if (prop.startsWith('temp_')) {
          target.tempVars[prop] = value
        }
        else {
          // 否则设置到原始对象
          Reflect.set(target, prop, value)
        }
        return true
      },
    })
  }

  get leanCloudClassName(): string {
    return 'Workflow'
  }

  get createdAtShort(): string {
    return `${DayJS(this.createdAt).format('MM-DD HH')}点`
  }

  get createdAtLong(): string {
    return DayJS(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
  }

  get relativeTimeShort(): string {
    return DayJS(this.updatedAt).fromNow()
  }

  get relativeTimeCreatedAt(): string {
    return DayJS(this.createdAt).fromNow()
  }

  get createdAtWeekDay(): string {
    return `星期${DayJS(this.createdAt).format('dd')}`
  }

  get updatedAtWeekDay(): string {
    return `星期${DayJS(this.updatedAt).format('dd')}`
  }

  get updatedAtShort(): string {
    return `${DayJS(this.updatedAt).format('MM-DD HH')}点`
  }

  get updatedAtLong(): string {
    return DayJS(this.updatedAt).format('YYYY-MM-DD HH:mm:ss')
  }

  get description(): string {
    return this.get('description')
  }

  set description(value: string | undefined) {
    this.set('description', value)
  }

  get name(): string {
    return this.get('name')
  }

  set name(value: string | undefined) {
    this.set('name', value)
  }

  get objectId(): string {
    return this.get('objectId')
  }

  set objectId(value: string | undefined) {
    this.set('objectId', value)
  }

  get icon(): string {
    return this.get('icon')
  }

  set icon(value: string | undefined) {
    this.set('icon', value)
  }

  get nodes(): any[] {
    return this.get('nodes')
  }

  set nodes(value: any[] | undefined) {
    this.set('nodes', value)
  }

  get user(): User {
    return this.get('user')
  }

  set user(value: User | undefined) {
    this.set('user', value)
  }

  get edges(): any[] {
    return this.get('edges')
  }

  set edges(value: any[] | undefined) {
    this.set('edges', value)
  }

  get workspace(): UserWorkspace {
    return this.get('workspace')
  }

  set workspace(value: UserWorkspace | undefined) {
    this.set('workspace', value)
  }

  [key: `temp_${string}`]: any
}

AV.Object.register(Workflow, 'Workflow')
export default Workflow
