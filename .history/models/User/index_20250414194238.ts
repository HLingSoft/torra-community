import DayJS from 'dayjs'

import cn from 'dayjs/locale/zh-cn.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import AV from 'leancloud-storage'

DayJS.extend(relativeTime)

DayJS.locale({
  ...cn,
  weekStart: 1,
})

// 定义所有的属性作为枚举
export enum EnumUser {
  ROLE = 'role',
  UPDATEDAT = 'updatedAt',
  MINIAPP_OPENID = 'miniapp_openId',
  PHONE = 'phone',
  SORTINDEX = 'sortIndex',
  NAME = 'name',
  OBJECTID = 'objectId',
  CREATEDAT = 'createdAt',
  MP_OPENID = 'mp_openId',
  AVATAR = 'avatar',
  ISSUBSCRIBE = 'isSubscribe',
  ISVERIFIEDUSER = 'isVerifiedUser',
  GENDER = 'gender',
  VALIDATED = 'validated',
  USER = 'user',
  UNIONID = 'unionid',
}

class User extends AV.Object {
  static LEANCLOUD_CLASSNAME = 'HL_User'
  public tempVars: Record<string, unknown> = {}

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
      set(target, prop: string | symbol, value: unknown) {
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
    return 'HL_User'
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

  /**
   * 备注:0 超级管理员 1 管理员 2 超级 VIP 3 普通付费用户 4 普通用户
   * 默认值:4
   * 是否只读:false
   * 类的JSON说明:{"auto_increment":false,"comment":"0 超级管理员 1 管理员 2 超级 VIP 3 普通付费用户 4 普通用户","default":4,"hidden":false,"read_only":false,"required":false,"type":"Number"}
   */
  get role(): number {
    return this.get('role')
  }

  set role(value: number | undefined) {
    this.set('role', value)
  }

  get miniapp_openId(): string {
    return this.get('miniapp_openId')
  }

  set miniapp_openId(value: string | undefined) {
    this.set('miniapp_openId', value)
  }

  get phone(): string {
    return this.get('phone')
  }

  set phone(value: string | undefined) {
    this.set('phone', value)
  }

  get sortIndex(): number {
    return this.get('sortIndex')
  }

  set sortIndex(value: number | undefined) {
    this.set('sortIndex', value)
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

  get mp_openId(): string {
    return this.get('mp_openId')
  }

  set mp_openId(value: string | undefined) {
    this.set('mp_openId', value)
  }

  get avatar(): string {
    return this.get('avatar')
  }

  set avatar(value: string | undefined) {
    this.set('avatar', value)
  }

  get isSubscribe(): boolean {
    return this.get('isSubscribe')
  }

  set isSubscribe(value: boolean | undefined) {
    this.set('isSubscribe', value)
  }

  get isVerifiedUser(): boolean {
    return this.get('isVerifiedUser')
  }

  set isVerifiedUser(value: boolean | undefined) {
    this.set('isVerifiedUser', value)
  }

  /**
   * 备注:0 未知  1、男 2 女
   * 默认值:未设置
   * 是否只读:false
   * 类的JSON说明:{"auto_increment":false,"comment":"0 未知  1、男 2 女","default":0,"hidden":false,"read_only":false,"required":false,"type":"Number"}
   */
  get gender(): number {
    return this.get('gender')
  }

  set gender(value: number | undefined) {
    this.set('gender', value)
  }

  get validated(): boolean {
    return this.get('validated')
  }

  set validated(value: boolean | undefined) {
    this.set('validated', value)
  }

  get user(): AV.User {
    return this.get('user')
  }

  set user(value: AV.User | undefined) {
    this.set('user', value)
  }

  get unionid(): string {
    return this.get('unionid')
  }

  set unionid(value: string | undefined) {
    this.set('unionid', value)
  }

  [key: `temp_${string}`]: unknown
}

AV.Object.register(User, 'HL_User')
export default User
