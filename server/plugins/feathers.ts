// server/plugins/feathers.ts
import { fromNodeMiddleware } from 'h3'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { allModels } from '~~/models'
import expressFeathers, { rest, json, urlencoded } from '@feathersjs/express'
import { feathers } from '@feathersjs/feathers'
import { AV } from '~~/models/fake-av'  // 注意这里要和你的路径一致
import { initDB } from '~~/server/feathers/db'
import { ensureService, registerAllNow } from '~~/server/feathers/auto-register'
import userHooks from '~~/server/feathers/services/user/index.hooks'
import workflowHooks from '~~/server/feathers/services/workflow/index.hooks'
import User from '~~/models/User'
import Workflow from '~~/models/Workflow'
export default defineNitroPlugin(async (nitro: any) => {
    await initDB()

    // 1) Feathers +（来自 @feathersjs/express 的）express 实例
    const app = expressFeathers(feathers())

    // 2) ★★★ 关键：加上 body 解析，否则 server.create 的 keys 永远是 []
    app.use(json())
    app.use(urlencoded({ extended: true }))

    app.configure(rest())

    // ─── 新增这一段 ─────────────────────────────────────────────────────────
    // 把 allModels 里所有的 Class 都显式 register 一遍
    for (const ModelClass of allModels) {
        // 每个 model 文件里如果有 static _CLASSNAME，就用它
        const name = (ModelClass as any)._CLASSNAME
            || (ModelClass as any).serviceName
            || ModelClass.name
        AV.Object.register(ModelClass as any, name)
    }


    await registerAllNow(app)

    // 自动绑定扫描到的 hooks
    app.service(User._CLASSNAME).hooks(userHooks)
    app.service(Workflow._CLASSNAME).hooks(workflowHooks)
    nitro.router.use('/feathers/**', fromNodeMiddleware(
        async (req: IncomingMessage, res: ServerResponse) => {
            const match = req.url?.match(/^\/feathers\/([^/?]+)/)
            if (match?.[1]) {
                await ensureService(app as any, match[1]) // 懒注册
            }

            // 去掉前缀再交给 Feathers
            req.url = req.url?.replace(/^\/feathers/, '') || '/'

            console.log('🛬 Feathers request', req.method, req.url)

            await new Promise<void>((resolve, reject) => {
                res.once('finish', resolve)
                res.once('close', resolve)
                res.once('error', reject)
                    ; (app as any)(req, res)
            })
        }
    ))

    console.log('🛫 Feathers ready @ /feathers/**')
})
