import type { Server as WebSocketServer } from 'ws'
import 'nitropack'

// 扩展 NitroApp 类型，添加 wss 属性
declare module 'nitropack' {
  interface NitroApp {
    wss?: WebSocketServer
  }
}
