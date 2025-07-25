// src/services/users/users.hooks.ts
import { HookContext } from '@feathersjs/feathers'
import UserWorkspace from '~~/models/UserWorkspace'
import UserWorkflowVariable from '~~/models/UserWorkflowVariable'
import UserFinance from '~~/models/UserFinance'

// 当用户创建或者更新后，都触发一次
const afterSaveUser = async (context: HookContext) => {
    // 新创建的或者更新的用户实例
    const user = context.result

    // 如果已经初始化过，跳过
    if (user._initializedWorkspace) {
        return context
    }

    // 1) 默认工作区
    const defaultWorkspace = new UserWorkspace()
    defaultWorkspace.user = user
    defaultWorkspace.name = '默认工作流空间'
    defaultWorkspace.isDefault = true
    defaultWorkspace.description = '默认工作流空间'
    await defaultWorkspace.save()

    // 2) 工作流变量
    const uv = new UserWorkflowVariable()
    uv.user = user
    uv.variables = []
    uv.validated = true
    await uv.save()

    // 3) 财务记录
    const uf = new UserFinance()
    uf.user = user
    uf.balance = 0
    uf.currency = 'CNY'
    uf.tokenBalance = 0
    uf.totalTokenConsume = 0
    uf.totalRecharge = 0

    await uf.save()

    // 标记已初始化，防止二次触发（可选）
    context.result._initializedWorkspace = true
    return context
}

export default {
    before: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [afterSaveUser],
        update: [afterSaveUser],
        patch: [afterSaveUser],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
}
