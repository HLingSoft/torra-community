import type { PromptTemplateData } from '~~/types/node-data/prompt-template'
import type {
  BuildContext,
  LangFlowNode,
  InputPortVariable,
} from '~~/types/workflow'

import { PromptTemplate } from '@langchain/core/prompts'
import { resolveInputVariables, writeLogs } from '../utils'

/**
 * PromptTemplate 节点工厂函数
 * @param node    - LangFlowNode
 * @param context - DAG 运行上下文
 */
export async function promptTemplateFactory(
  node: LangFlowNode,
  context: BuildContext
) {
  const t0 = performance.now()

  try {
    /*************** 1. 读取节点数据 ***************/
    const data = node.data as PromptTemplateData
    const variableDefs = (data.inputVariables as InputPortVariable[]) || []
    const variableNames = variableDefs.map(v => v.name.trim())

    /*************** 2. 解析输入并字符串化 ***************/
    const inputById = await resolveInputVariables(context, variableDefs)
    // console.log(`🔍 node ${node.id} input variables:`, inputById)

    const flattened: Record<string, string> = {}
    for (const [id, raw] of Object.entries(inputById)) {
      // const v = Array.isArray(raw) ? raw[0] : raw
      flattened[id] = normalize(raw)
    }

    /*************** 3. ID → 变量名映射 ***************/
    const inputByName: Record<string, string> = {}
    for (const [id, str] of Object.entries(flattened)) {
      const def = variableDefs.find(v => v.id === id)
      const name = (def?.name || id).trim()
      inputByName[name] = str
    }
    // console.log(`🔍 node ${node.id} input values:`, inputByName)

    /*************** 4. 转义模板里的展示用花括号 ***************/
    const safeTemplate = escapeBracesStrict(data.template, variableNames)

    /*************** 5. 构建 PromptTemplate ***************/
    const promptTemplate = PromptTemplate.fromTemplate(safeTemplate)

    /*************** 6. 差集校验 ***************/

    // 6. 差集校验（对变量名做一次 trim）
    const varsInTpl = promptTemplate.inputVariables.map(v => v.trim())
    const missing = varsInTpl.filter(v => !(v in inputByName))
    if (missing.length) {
      throw new Error(`模板变量未提供：${missing.join(', ')}`)
    }
    /*************** 7. 渲染 ***************/
    const runnable = await promptTemplate.partial(inputByName)
    // const finalPrompt = await runnable.invoke({})

    /*************** 7. 渲染（直接 format 更简单） ***************/
    const finalPrompt = await promptTemplate.format(inputByName)  // ⬅️ 返回 string
    // console.log(
    //   `🔍 node ${node.id} prompt:`,
    //   finalPrompt
    // )

    /*************** 8. 写日志 & 返回 ***************/
    const outputPortId = data.outputVariable.id
    const elapsed = performance.now() - t0

    writeLogs(
      context,
      node.id,
      data.title,
      data.type,
      {
        [outputPortId]: {
          content: finalPrompt.slice(0, 100) + '...(内容过长已截断)',
          outputPort: data.outputVariable,
          elapsed,
        },
        [data.promptOutputVariable.id]: {
          content: runnable,
          outputPort: data.promptOutputVariable,
          elapsed,
        },
      },
      elapsed
    )


    return {
      [outputPortId]: finalPrompt,
      [data.promptOutputVariable.id]: runnable,
    }
  } catch (err: any) {
    console.error(`PromptTemplate ${node.id} Error:`, err)
    throw new Error(`PromptTemplate 生成失败: ${err.message}`)
  }
}

/* ------------------------------------------------------------------ */
/* 辅助函数                                                             */
/* ------------------------------------------------------------------ */

/** 把各种类型统一序列化成字符串 */
function normalize(val: unknown): string {
  if (Array.isArray(val)) {
    return val.map(v => normalize(v)).join('\n')
  }
  if (typeof val === 'number' || typeof val === 'string') return String(val)
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return String(val)
  }
}


/**
 * 只把 *单层* { … }（且不在白名单里）转成 {{ … }}
 * 1. {{xxx}}  直接跳过：原模板已转义
 * 2. {xxx   } {  xxx} 先 trim 再判断
 */
function escapeBracesStrict(tpl: string, keepVars: string[]): string {
  const keep = new Set(keepVars.map(v => v.trim()))

  return tpl.replace(
    /{{[^{}]*}}|{([^{}]+)}/g,               // ❶ 先整体匹配
    (match, inner) => {
      // ❷ 如果是 {{…}}，直接返回（保持原状）
      if (match.startsWith('{{')) return match

      // ❸ 这里一定是单层 { … }
      const name = (inner ?? '').trim()
      return /^\w+$/.test(name) && keep.has(name)   // 是合法占位符？
        ? match                                     //   → 保留单层
        : `{{${inner}}}`                            //   → 双写转义
    }
  )
}
