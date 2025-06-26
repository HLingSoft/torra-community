/* -------------------------------------------------------------------------- */
/*  Loop factory – run-all-in-one-call (最终版，无 continue)                   */
/* -------------------------------------------------------------------------- */

import type {
    LangFlowNode,
    BuildContext,

    DAGRunResult
} from '~/types/workflow';
import type { LoopData } from '@/types/node-data/loop';
import * as _ from 'lodash-es';
import {
    resolveInputVariables,
    isWrappedRunnable,
    collectLoopBodyNodes,
    writeLogs
} from '../utils';
import { executeDAG } from '../../langchain/builder';


/** 判断一个对象是不是 DAGRunResult */
function isDag(o: any): o is DAGRunResult {
    return o && typeof o === 'object' && 'statusCode' in o && 'output' in o
}
async function autoResolve(val: any): Promise<any> {
    let cur: any = val
    let depth = 0
    while (true) {
        depth++
        // console.log(`[autoResolve] depth ${depth}`, cur)

        if (isDag(cur)) { cur = cur.output; continue }

        if (isWrappedRunnable(cur)) {
            console.log('[autoResolve] invokeIfAvailable')
            const next = await cur.invokeIfAvailable?.()
            // 防护：避免 next === cur 造成死循环
            if (next === cur) {
                console.warn('[autoResolve] invoke returned self, break')
                return next
            }
            cur = next
            continue
        }

        if (Array.isArray(cur)) { return Promise.all(cur.map(autoResolve)) }

        return cur
    }
}
// function collectLoopBodyNodes(
//     json: LangFlowJson,
//     loopId: string,
//     itemPortId: string,        // ↱  loop.item
//     itemResultPortId: string,  // ↳  loop.itemResult
// ) {

//     // ① 终点节点 = itemResult 的 *直接* target（可能有多条线）
//     const endNodes = json.edges
//         .filter(e => e.source === loopId && e.sourceHandle === itemResultPortId)
//         .map(e => e.target);


//     const body = new Set<string>();
//     const stack = json.edges
//         .filter(e => e.source === loopId && e.sourceHandle === itemPortId)
//         .map(e => e.target);

//     while (stack.length) {
//         const nid = stack.pop()!;
//         if (nid === loopId || body.has(nid)) continue;

//         body.add(nid);            // 记录本节点

//         // 如果已经到 “终点节点” 就停止向后扩散
//         if (endNodes.includes(nid)) continue;

//         json.edges
//             .filter(e => e.source === nid)
//             .forEach(e => stack.push(e.target));
//     }

//     // 把“终点节点”本身也放进循环体（它在上一轮里已经加了，但若 itemResult 没连线则为空）
//     endNodes.forEach(n => body.add(n));

//     return body;
// }


/** Loop 节点工厂（一次性跑完整个列表） */
export async function loopFactory(
    node: LangFlowNode,
    context: BuildContext,
) {

    const t0 = performance.now()
    const {
        listDataInputVariable,
        loopItemResultInputVariable,
        itemOutputVariable,
        doneOutputVariable,
    } = node.data as LoopData;

    /* 1. 解析循环输入列表 ---------------------------------------------------- */
    const vars = await resolveInputVariables(context, [listDataInputVariable]);
    const list: unknown[] = vars[listDataInputVariable.id];
    if (!Array.isArray(list)) throw new Error('Loop 入参必须是数组');

    /* 2. 计算子流程节点集合 --------------------------------------------------- */
    const bodyNodeIds = collectLoopBodyNodes(
        context.json,
        node.id,
        itemOutputVariable.id,
        loopItemResultInputVariable.id,
    );
    const customNodeIds = [...bodyNodeIds];


    /* 3. 顺序遍历列表，一次性跑完整个子流程 -------------------------------- */
    const results: any = [];


    for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        // console.log(`[Loop] item ${idx + 1}/${list.length} processing…`, item);


        (context.results[node.id] ??= {})[itemOutputVariable.id] = item;

        const subRun = await executeDAG(context.json, item as string, 'loop', context.userId, context.workflowId, {
            results: _.cloneDeep(context.results),
            customNodeIds,              // 只跑循环体
        }) as DAGRunResult;
        if (subRun.statusCode !== 200) {

            throw new Error(`Loop item ${idx + 1} failed: ${subRun.errorMessage || 'Unknown error'}`);
        }

        const resolved = await autoResolve(subRun);

        results.push(resolved);
    }


    const elapsed = performance.now() - t0

    // ✅ 添加结构化日志（仅记录 doneOutput）
    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [doneOutputVariable.id]: {
                content: results,
                outputPort: doneOutputVariable,
                elapsed
            }
        },
        elapsed
    )

    /* 4. 返回聚合结果（无需 continue 字段） ---------------------------------- */
    return {
        [itemOutputVariable.id]: {},           // 占位，无实际意义
        [doneOutputVariable.id]: results     // 聚合后的结果数组

    }
}
