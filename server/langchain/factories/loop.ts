/* -------------------------------------------------------------------------- */
/*  Loop factory – run-all-in-one-call (最终版，无 continue)                   */
/* -------------------------------------------------------------------------- */

import type {
    LangFlowNode,
    BuildContext,
    DAGStepInfo,
    DAGRunResult
} from '~~/types/workflow';
import type { LoopData } from '~~/types/node-data/loop';
import * as _ from 'lodash-es';
import {
    resolveInputVariables,

    collectLoopBodyNodes,
    writeLogs
} from '../utils';
import { executeDAG } from '../builder';


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

        // if (isWrappedRunnable(cur)) {
        //     // console.log('[autoResolve] invokeIfAvailable')
        //     const next = await cur.invokeIfAvailable?.()
        //     // 防护：避免 next === cur 造成死循环
        //     if (next === cur) {
        //         console.warn('[autoResolve] invoke returned self, break')
        //         return next
        //     }
        //     cur = next
        //     continue
        // }

        if (Array.isArray(cur)) { return Promise.all(cur.map(autoResolve)) }

        return cur
    }
}


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
    // console.log(`[Loop] 开始执行循环节点: ${node.id} (${node.data.title})`, loopItemResultInputVariable);

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

        (context.results[node.id] ??= {})[itemOutputVariable.id] = item;

        const subRun = await executeDAG(
            context.json, item as string, 'loop', context.variables,
            context.userId, context.workflowId,
            {
                results: _.cloneDeep(context.results), customNodeIds, onStep(step) {
                    writeLogs(
                        context,
                        step.nodeId,
                        step.nodeTitle,
                        step.nodeType,
                        Object.fromEntries(
                            step.ports.map(p => [p.portId, {
                                content: p.content,
                                outputPort: itemOutputVariable, // ✅ 传入这个字段！
                                elapsed: p.elapsed
                            }])
                        ),
                        step.elapsed,
                        {
                            loopNodeId: node.id,
                            loopNodeTitle: node.data.title,
                            loopItem: item,
                        }
                    );

                    context.onStep?.({
                        ...step,
                        loopContext: {
                            loopNodeId: node.id,
                            loopNodeTitle: node.data.title,
                            currentItemValue: item,
                            currentItemIndex: idx,
                        },
                    });
                },
            }
        ) as DAGRunResult;

        /* A) executeDAG 自己就失败 */
        if (subRun.statusCode !== 200) {
            throw new Error(subRun.output);
        }

        /* B) 子 DAG 某节点返回 { error } */
        const errNode = Object.entries(subRun.results)
            .find(([, v]) => v && typeof v === 'object' && 'error' in v);
        if (errNode) {
            const [nid, val] = errNode;
            throw new Error(`Loop body node ${nid} error: ${val.error}`);
        }

        /* C) 正常分支 */
        const resolved = await autoResolve(subRun);
        results.push(resolved);
    }
    // console.log(`[Loop] 所有 ${list.length} 个项已处理完毕，结果：`, results);

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
