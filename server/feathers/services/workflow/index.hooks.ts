import { HookContext } from '@feathersjs/feathers'
import Workflow from '~~/models/Workflow'
import WorkflowHistory, { EnumWorkflowHistory } from '~~/models/WorkflowHistory'
import WorkflowRunLog from '~~/models/WorkflowRunLog'
import User from '~~/models/User'
import AV from '~~/models/fake-av'
/** 计算下一个版本号 */
const nextVersion = (currentVersion?: string): string => {
    if (!currentVersion || currentVersion.trim() === '') return '1.0.0'
    const parts = currentVersion.split('.').map(Number)
    if (parts.length !== 3) throw new Error('Version format must be "x.y.z"')

    let [major, minor, patch] = parts
    patch++
    if (patch > 9) {
        patch = 0
        minor++
    }
    if (minor > 9) {
        minor = 0
        major++
    }

    return `${major}.${minor}.${patch}`
}

/** 保存 Workflow 的历史记录 */
const saveWorkflowHistory = async (workflow: Workflow, user: User) => {
    const latest = await new AV.Query(WorkflowHistory)
        .equalTo(EnumWorkflowHistory.WORKFLOW, workflow)
        .descending(EnumWorkflowHistory.CREATEDAT)
        .first()

    const wh = new WorkflowHistory()
    wh.workflow = workflow
    wh.name = workflow.name
    wh.edges = workflow.edges
    wh.nodes = workflow.nodes
    wh.user = user
    wh.version = nextVersion(latest?.version)
    await wh.save()
}

const afterCreateOrUpdate = async (context: HookContext) => {
    const workflow = context.result as Workflow
    const user = context.params?.user as User
    if (!user) return context

    await saveWorkflowHistory(workflow, user)
    console.log('[hook] workflow history saved:', workflow.objectId)
    return context
}

const afterPatch = async (context: HookContext) => {
    const updatedKeys = context.data ? Object.keys(context.data) : []
    if (!updatedKeys.includes('nodes') && !updatedKeys.includes('edges')) {
        return context
    }

    const workflow = context.result as Workflow
    const user = context.params?.user as User
    if (!user) return context

    await saveWorkflowHistory(workflow, user)
    console.log('[hook] workflow patch triggered version update:', workflow.objectId)
    return context
}

const afterRemove = async (context: HookContext) => {
    const workflow = context.result as Workflow
    if (!workflow) return context

    // 删除历史
    const histories = await new AV.Query(WorkflowHistory)
        .equalTo(EnumWorkflowHistory.WORKFLOW, workflow)
        .limit(1000)
        .find()
    await Promise.all(histories.map(h => h.destroy()))

    // 删除运行日志
    const logs = await new AV.Query(WorkflowRunLog)
        .equalTo(EnumWorkflowHistory.WORKFLOW, workflow)
        .limit(1000)
        .find()
    await Promise.all(logs.map(l => l.destroy()))

    console.log('[hook] workflow removed + cleaned:', workflow.objectId)
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
        remove: [],
    },
    after: {
        all: [],
        find: [],
        get: [],
        create: [afterCreateOrUpdate],
        update: [afterCreateOrUpdate],
        patch: [afterPatch],
        remove: [afterRemove],
    },
    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [],
    },
}
