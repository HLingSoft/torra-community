import { defineEventHandler, readBody } from '#imports'
import { randomUUID } from 'node:crypto'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
// import type { StructuredTool } from 'langchain/tools'
import type { MessageContent } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'
console.log('🔥 MCP Server 文件加载了')

const baseURL = 'https://ai.api.kop-consulting.com/1.1'
const headers = {
    'X-LC-Id': 'PJzs8QFcTK2dtmtlmL5cuNIL-gzGzoHsz',
    'X-LC-Key': 'HtGNqnAaLM1ks9tEJ9yHq2td,master',
    'Content-Type': 'application/json',
}

type LeanField = {
    type?: string
    comment?: string
    className?: string
}
type ClassSchemas = Record<string, Record<string, LeanField>>

async function getAllClasses(): Promise<ClassSchemas> {
    const resp = await fetch(`${baseURL}/schemas`, { headers })
    return await resp.json()
}

function extractEnumMapFromComment(comment: string): Record<string, number> {
    const map: Record<string, number> = {}
    const regex = /(\d+)\s*([^\d，,]+)/g
    let match
    while ((match = regex.exec(comment)) !== null) {
        const [, code, label] = match
        map[label.trim()] = parseInt(code, 10)
    }
    return map
}



// 提取 LLM 返回的 MessageContent 中的文本
function extractText(content: MessageContent): string {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === 'string') return item
                if (item.type === 'text') return item.text
                return ''
            })
            .join('')
    }
    if ((content as any)?.type === 'text') return (content as any).text
    return ''
}
export async function getUserHints(question: string): Promise<string[]> {

    /* ① 让 LLM 判断有没有“人名”并抽取文本 */
    const llm = new ChatOpenAI({ modelName: 'gpt-4.1', apiKey: 'sk-sXW78QiqIJCIc48ueZwg3fIlYmb2PWye22yL13mYOdPxdSiU', configuration: { baseURL: 'https://api.openai-proxy.org/v1' } })

    const llmResp = await llm.invoke([
        {
            role: "system",
            content: `你是信息抽取助手。从中文或英文句子里提取“人名”。
      - 如果句子里根本没提到具体的人名，返回 []。
      - 如果有多个名字，用数组列出，按出现顺序。
      示例：
      输入：张三负责这个任务吗？
      输出：["张三"]

      输入：辉总和 Kevin 都在看文档
      输出：["辉总","Kevin"]`,
        },
        { role: "user", content: question },
    ]);
    // console.log("🔍 LLM 判断人名:", llmResp);
    let names: string[] = [];
    try {
        names = JSON.parse(extractText(llmResp.content));
        // console.log("🔍 LLM 抽取人名:", names);
    } catch {
        // console.warn("⚠️ LLM 抽取人名 JSON 解析失败：", llmResp.content);
        return [];
    }

    if (names.length === 0) return [];              // 没人名，直接返回空

    /* ② 用抽到的名字去 LeanCloud 做精准 regex */
    const ors = names.flatMap((name) => [
        { realName: { $regex: name, $options: "i" } },
        { nickname: { $regex: name, $options: "i" } },
    ]);

    const where = encodeURIComponent(JSON.stringify({ $or: ors }));
    const url = `${baseURL}/classes/P_User?where=${where}&limit=5`;

    const { results = [] } = await fetch(url, { headers }).then((r) => r.json());

    return results.map(
        (u: any) => `${u.realName || u.nickname}(objectId=${u.objectId})`
    );
    // const whereProjectMember = encodeURIComponent(
    //     JSON.stringify({
    //         project: projectPointers.length === 1 ? projectPointers[0] : { $in: projectPointers }
    //     })
    // );




    // const urlProjectMember = `${baseURL}/classes/ProjectMember?where=${whereProjectMember}&limit=1000&include=user`;
    // // console.log("🔍 LLM 获取项目成员 URL:", urlProjectMember)
    // const resultJson = await fetch(urlProjectMember, { headers })
    // const resultsProjectMember = await resultJson.json()


    // // console.log("🔍 LLM 获取项目成员:", resultsProjectMember);
    // //通过 user.objectId 去重
    // const uniqueProjectMember = new Map<string, any>()
    // resultsProjectMember.forEach((item: any) => {
    //     const userId = item.user.objectId
    //     if (!uniqueProjectMember.has(userId)) {
    //         uniqueProjectMember.set(userId, item)
    //     }
    // })
    // // console.log("🔍 LLM 获取项目成员:", uniqueProjectMember);

    // //获取这些用户的基本信息，objectId 和 nickname|realName

    // const usersProjectMember = Array.from(uniqueProjectMember.values()).map((item: any) => {
    //     const user = item.user
    //     return {
    //         objectId: user.objectId,
    //         nickname: user.nickname,
    //         realName: user.realName,
    //         projectName: item.project.name,
    //         projectId: item.project.objectId,
    //         projectRoleName: item.projectRole.name,
    //     }
    // })

    // // console.log("🔍 LLM 获取项目成员:", usersProjectMember);
    // const result = usersProjectMember.map((user) => `${user.realName || user.nickname} (objectId=${user.objectId})`)
    // console.log("🔍 LLM 获取项目成员:", result);
    // return result

}
// 使用大模型判断是否需要生成 where，并生成完整查询参数
async function generateWhereByLLM({
    question,

    userId,
    userHints = []
}: {
    question: string

    userId: string
    userHints?: string[]
}): Promise<{
    where?: Record<string, any>
    order?: string
    limit?: number
    include?: string
    __count?: boolean
}> {
    const llm = new ChatOpenAI({ modelName: 'gpt-4.1', apiKey: 'sk-sXW78QiqIJCIc48ueZwg3fIlYmb2PWye22yL13mYOdPxdSiU', configuration: { baseURL: 'https://api.openai-proxy.org/v1' } })
    const today = new Date().toISOString().split('T')[0]

    const fetchDynamicInstructionResult = await fetch(`${baseURL}/classes/Character/6792704928a55b4285ac1160`, { headers })
    const json = await fetchDynamicInstructionResult.json()

    const dynamicInstruction = json.instructions

    console.log("🔍已知用户映射（供选择 objectId）：", `${userHints.join("\n")}`)
    const systemMessage = `

 

⚠️已知用户映射（供选择 objectId）：${userHints.join("\n")}

⚠️ 当前登录用户的 objectId 是：${userId}

⚠️ 如果问题中提到“我”的时候，请用如下格式加上 user 条件：
"user": {
  "__type": "Pointer",
  "className": "P_User",
  "objectId": "${userId}"
}



今天的日期是 "${today}"，如需比较，请使用格式：
{
  "deadline": {
    "$gte": {
      "__type": "Date",
      "iso": "${today}T00:00:00.000Z"
    }
  }
}


## EXAMPLES
 

-----接下来是你的能力说明和案例-----

${dynamicInstruction}



---反复校验 where语法是否正确，确保能在 LeanCloud 上执行。---
1、确保如果有日期字段，使用 ISO 格式
2、确保如果有 enum 字段，使用数字值
3、确保如果有 objectId 字段，使用 数字+字母的结合。

比如:
{
   "user": {
      "__type": "Pointer",
      "className": "P_User",
      "objectId": "测试账户"  //错误，必须是数字+字母的结合
    }
}


{
   "project": {
      "__type": "Pointer",
      "className": "Project",
      "objectId": "测试账户"  //错误，必须是数字+字母的结合
    }
}

 `

    // console.log("🔍 LLM 系统提示:", systemMessage)
    // 再生成实际查询参数
    const result = await llm.invoke([
        {
            role: 'system',


            content: systemMessage,

        },
        { role: 'user', content: `用户的问题：${question}` },
    ])

    const raw = extractText(result.content)
    try {
        return JSON.parse(raw)
    } catch {
        console.warn('⚠️ 无法解析 LLM 返回的 JSON：', raw)
        return {}
    }
}

// 判断是否有实质查询字段（非 __count）
// function shouldInjectWhere(where: Record<string, any>): boolean {
//     return Object.keys(where).some((key) => key !== '__count')
// }

export async function registerLeancloudQueryTools(
    server: McpServer,
    userId: string,
    allSchemas: ClassSchemas,
    projectPointers: { __type: string; className: string; objectId: string }[]
) {
    const allowList = [
        'Milestone', 'Task', "ProjectMember", 'RFI', 'RFIReply',
        'TaskReply', 'Post', 'PostCommnet', 'CostTracking', 'CostTrackingCategory',
        'Document', 'DocumentCategory'
    ]

    // 在 for (const [className, fields]...) 内改写如下：
    for (const [className, fields] of Object.entries(allSchemas)) {
        if (!allowList.includes(className)) continue

        const rawShape: z.ZodRawShape = {
            question: z.string().describe('用户自然语言的问题')
        }
        const fieldPromptParts: string[] = []

        for (const [key, field] of Object.entries(fields)) {
            const comment = field.comment ?? ''
            const enumMap = extractEnumMapFromComment(comment)

            if (Object.keys(enumMap).length > 0) {
                const lines = Object.entries(enumMap).map(([label, value]) => `- ${value} = ${label}`)
                fieldPromptParts.push(`Field \`${key}\` status meanings:\n${lines.join('\n')}`)
            }
        }
        const inputSchema = z.object({ question: z.string() })
        const toolDescription = `查询 ${className} 记录。\n可以直接用自然语言提问，如"有几个",“最临近的${className}有哪些？”“多少个未完成的？”\n`

        server.tool(
            `query_${className}`,
            toolDescription,
            rawShape,
            async (args) => {
                const { question } = inputSchema.parse(args)

                console.log('🔍 LLM 问题:', question)
                // const enumHints = fieldPromptParts.join('\n\n')
                // 1. 先把可能的人查出来
                const userHints = await getUserHints(question)
                console.log('🔍 LLM 字段提示:', userHints)
                const queryParams = await generateWhereByLLM({ question, userId, userHints })
                const shouldQuery =
                    !!queryParams?.where || queryParams?.__count || queryParams?.limit || queryParams?.order || queryParams?.include;

                if (!shouldQuery) {
                    console.log("❌ LLM 判断无需查询，已中止请求");
                    return {
                        content: [
                            {
                                type: "text",
                                text: "🔎 该问题无需访问数据库，仅供参考或解释用途。",
                            },
                        ],
                    };
                }
                const queryFilter = {
                    ...queryParams.where,
                    project: projectPointers.length === 1 ? projectPointers[0] : { $in: projectPointers }
                }

                // if (className !== 'P_User') {
                //     queryFilter.project = projectPointers.length === 1 ? projectPointers[0] : { $in: projectPointers }
                // }

                const paramsObj: Record<string, string> = {
                    where: JSON.stringify(queryFilter)
                }
                if (queryParams.__count) {
                    paramsObj.count = '1'
                    paramsObj.limit = '0'
                } else if (typeof queryParams.limit === 'number') {
                    paramsObj.limit = String(queryParams.limit)
                }
                if (queryParams.order) paramsObj.order = queryParams.order
                if (queryParams.include) paramsObj.include = queryParams.include

                const queryString = Object.entries(paramsObj).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
                const url = `${baseURL}/classes/${className}?${queryString}`

                console.log(`🔍 LeanCloud URL: ${url}`)
                console.log('🔍 解码后的查询参数:', JSON.stringify({ where: queryFilter, ...queryParams }, null, 2))

                const resp = await fetch(url, { headers })
                const json = await resp.json()
                console.log('🔍 LeanCloud 查询结果:', json)

                return {
                    content: [
                        {
                            type: 'text',
                            text: queryParams.__count
                                ? `📊 共 ${json.count ?? 0} 个 ${className} 记录符合条件`
                                : JSON.stringify(json.results ?? [], null, 2)
                        }
                    ]
                }
            }
        )
    }


}

const sessions: Record<string, { server: McpServer, transport: StreamableHTTPServerTransport }> = {}

export default defineEventHandler(async (event) => {
    const req = event.node.req
    const res = event.node.res

    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const rawProjectIds = url.searchParams.getAll('projectId')

    if (!rawProjectIds || rawProjectIds.length === 0) {
        res.statusCode = 400
        res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32001,
                message: 'Missing required projectIds in URL. Example: ?projectId=abc123&projectId=def456'
            },
            id: null
        }))
        return
    }

    // 接收客户端送来的 token
    const token = req.headers["authorization"] as string | undefined;
    // console.log('🔑 MCP Token:', token)
    if (!token) {
        res.statusCode = 401
        res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32002,
                message: 'Unauthorized: Missing token in headers'
            },
            id: null
        }))
        return
    }

    const projectPointers = rawProjectIds.map(id => ({
        __type: 'Pointer',
        className: 'Project',
        objectId: id
    }))

    const body = await readBody(event)
    const json = typeof body === 'string' ? JSON.parse(body) : body
    const sessionId = req.headers['mcp-session-id'] as string | undefined
    const userId = token.replace('Bearer ', '')
    let transport: StreamableHTTPServerTransport
    let server: McpServer

    if (sessionId && sessions[sessionId]) {
        ({ server, transport } = sessions[sessionId])
    } else if (!sessionId && isInitializeRequest(json)) {
        server = new McpServer({ name: 'mcp-xmj-leancloud-db', version: '1.0.0' })

        server.tool(
            'echo',
            'Echo message',
            { msg: z.string() },
            async ({ msg }) => ({ content: [{ type: 'text', text: `Echo: ${msg}` }] })
        )
        server.tool(
            'project',
            '获取项目基本信息（基于当前 projectId）',
            {}, // 无需传参
            async () => {
                if (!projectPointers?.length) {
                    throw new Error('No projectId provided')
                }

                const where = encodeURIComponent(JSON.stringify({
                    objectId: { $in: projectPointers.map(p => p.objectId) }
                }))
                const url = `${baseURL}/classes/Project?where=${where}&limit=100`

                console.log(`🔍 Project 查询 URL: ${url}`)

                const resp = await fetch(url, { headers })
                const json = await resp.json()

                return {
                    content: [
                        {
                            type: 'text',
                            text: `${JSON.stringify(json.results ?? [], null, 2)}`
                        }
                    ]
                }
            }
        )
        const schemas = await getAllClasses()
        await registerLeancloudQueryTools(server, userId, schemas, projectPointers)

        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => {
                sessions[id] = { transport, server }
            }
        })

        await server.connect(transport)

        transport.onclose = () => {
            if (transport.sessionId) delete sessions[transport.sessionId]
        }

        if (!transport.sessionId) {
            transport.sessionId = randomUUID()
            sessions[transport.sessionId] = { transport, server }
        }
    } else {
        res.statusCode = 400
        res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided'
            },
            id: null
        }))
        return
    }

    await transport.handleRequest(req, res, json)
})
