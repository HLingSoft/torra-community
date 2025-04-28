import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import type { FlowNode, BuildContext } from '~/types/workflow'
import type { APIToolData } from '~/types/node-data/api-tool'
import { resolveInputVariables } from '../../langchain/resolveInput'
import { nanoid } from "nanoid";
function sanitizeToolName(name: string): string {
    let cleaned = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // 移除重音
        .replace(/[^\w]/g, '_')          // 非单词字符换成 _
        .replace(/^_+|_+$/g, '')          // 去掉开头/结尾的 _
        .toLowerCase();

    // 如果清理后为空或太短，就随机生成一个
    if (!cleaned || cleaned.length < 3) {
        const randomSuffix = nanoid(6);
        cleaned = `tool_${randomSuffix}`;
    }

    return cleaned;
}
class HttpRequestTool extends StructuredTool<z.ZodObject<{}>> {
    name: string;
    description: string;
    schema = z.object({}); // ✅ 这里是空对象，不用 optional

    private defaultInput: {
        url: string;
        method: "GET" | "POST" | "PUT" | "DELETE";
        token?: string;
        body?: Record<string, any>;
    };

    constructor({
        name,
        description,
        url,
        method,
        token,
        body,
    }: {
        name: string;
        description: string;
        url: string;
        method: "GET" | "POST" | "PUT" | "DELETE";
        token?: string;
        body?: Record<string, any>;
    }) {
        super();
        this.name = name;
        this.description = description;
        this.defaultInput = { url, method, token, body };
    }

    async _call(_: unknown): Promise<string> {
        const { url, method, token, body } = this.defaultInput;

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const requestOptions: RequestInit = { method, headers };
        if (method !== "GET" && body) {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                const errorText = await response.text();
                return `Error ${response.status}: ${errorText}`;
            }
            const contentType = response.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                const result = await response.json();
                return JSON.stringify(result, null, 2);
            } else {
                const text = await response.text();
                return text.trim() || "Request succeeded but returned an empty response.";
            }
        } catch (error: any) {
            return `Request failed: ${error.message || error}`;
        }
    }
}

export async function apiToolFactory(node: FlowNode, context: BuildContext) {
    const data = node.data as APIToolData;
    const {
        toolNameVariable,
        toolDescriptionVariable,
        methodType,
        urlInputVariable,
        bodyVariable,
        tokenVariable,
        toolOutputVariable
    } = data;

    // 解析输入
    const inputValues = await resolveInputVariables(context, [toolNameVariable, toolDescriptionVariable, urlInputVariable, bodyVariable, tokenVariable]);
    const url = inputValues[urlInputVariable.name];
    const body = inputValues[bodyVariable.name];
    const token = inputValues[tokenVariable.name];
    const toolName = inputValues[toolNameVariable.name] || "http_request_tool";
    const toolDescription = inputValues[toolDescriptionVariable.name] || "Make authorized HTTP requests (GET, POST) to a given API endpoint.";

    // 🔥 这里断言成四种允许的 method 类型！
    const method = (methodType.toUpperCase() as "GET" | "POST" | "PUT" | "DELETE");

    // console.log('apiToolFactory', toolName, toolDescription, methodType, method, url, token, body);

    // 初始化真正的 Tool
    const tool = new HttpRequestTool({
        name: toolName,
        description: toolDescription,
        url,
        method,
        token,
        body
    });

    return {
        [toolOutputVariable.id]: tool,
    };
}
