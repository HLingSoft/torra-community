import type { SaveToFileLCData } from '~~/types/node-data/save-file-to-local'
import { EXT_MIME_MAP } from '~~/types/node-data/save-file-to-local'
import type { BuildContext, LangFlowNode, NodeFactory, OutputPortVariable } from '~~/types/workflow'

import { resolveInputVariables, writeLogs, updatePortLog } from '../utils'
import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import AV from '~~/models/fake-av'


function isHttpUrl(str: string): boolean {
    return /^https?:\/\/[^\s]+$/i.test(str);
}

async function fetchUrlToBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString('base64');
}

function getExtAndMime(fileType?: string, defaultExt = 'png') {
    if (!fileType) return { ext: defaultExt, mime: EXT_MIME_MAP[defaultExt] };
    const ext = fileType.toLowerCase().replace(/^\./, '');
    return { ext, mime: EXT_MIME_MAP[ext] || 'application/octet-stream' };
}

export const saveToFileLCFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    try {
        try {
            AV.init({ baseURL: 'http://localhost:3000' }) // 这里的 baseURL 应该是你的 API 地址
        } catch (error) {
            console.info(`🔍 SaveToFileLC node ${node.id} LocalHost SDK already initialized`);

        }

        // console.log(`🔍 SaveToFileLC node ${node.id} initialized LocalHost SDK`);

        const t0 = performance.now();
        const data = node.data as SaveToFileLCData;

        // 统一解析所有输入端口
        const inputValues = await resolveInputVariables(context, [data.inputInputVariable]);
        const inputValue = inputValues[data.inputInputVariable.id] as string;
        const outputVar = data.outputVariable as OutputPortVariable;

        const outputPortId = outputVar.id;
        const fileType = data.fileType || 'png';
        // console.log(`🔍 SaveToFileLC node ${node.id} input:`, inputValue, `fileType: ${fileType}`);
        const { ext, mime } = getExtAndMime(fileType);
        // console.log(`🔍 Save to LocalHost File: ${inputValue}, type: ${fileType}, ext: ${ext}, mime: ${mime}`);

        let base64Data: string;
        let fileName = `${Date.now()}_${node.id}.${fileType}`

        const value = inputValue;

        if (isHttpUrl(value)) {
            // 下载 url 内容转 base64
            base64Data = await fetchUrlToBase64(value);
            // fileName = `${Date.now()}_${node.id}.${ext}`;  // 强制用 fileType 的 ext
        } else {
            base64Data = value;
            // fileName = `${Date.now()}_${node.id}.${ext}`;  // ✅ 同样强制使用扩展名

        }

        const file = new AV.File(fileName, { base64: base64Data }, mime);
        await file.save();
        // console.log(`🔍 LocalHost File URL: ${file.url()}`);

        // 创建 Tool 实例
        const customTool = new SaveToLocalHostFileTool(
            ext,
            mime,
            context,
            node.id,
            outputPortId,

        )


        const elapsed = performance.now() - t0;
        // 结构化写入日志
        writeLogs(
            context,
            node.id,
            data.title,
            data.type,
            {
                [outputPortId]: {
                    content: `LocalHost File URL: ${file.url()}`,
                    outputPort: outputVar,
                    elapsed
                },
                [data.toolOutputVariable.id]: {
                    content: '',
                    outputPort: data.toolOutputVariable,
                    elapsed
                }
            },
            elapsed
        );
        return {
            [outputPortId]: file.url(),
            [data.toolOutputVariable.id]: customTool
        }
    } catch (error: any) {
        console.error(`SaveToFileLC node ${node.id} error:`, error);
        throw new Error(`SaveToFileLC 节点执行失败: ${error.message}`);
    }

}
class SaveToLocalHostFileTool extends StructuredTool {
    name = "save-to-leancloud-file";
    description = "Saves base64 data or a file URL as a LocalHost file and returns the shareable file URL.";
    schema = z.object({
        data: z.string().describe("待保存的 base64 数据或 https 文件 URL"),
        fileType: z.string().optional().describe("文件类型，例如 png、jpg 等")
    });

    constructor(
        private ext: string,
        private mime: string,
        private context: BuildContext,
        private nodeId: string,
        private portId: string,

    ) {
        super();
    }

    async _call(inputs: { data: string; fileType?: string }) {
        const t0 = performance.now();

        let { ext, mime } = getExtAndMime(inputs.fileType || this.ext);
        let fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        let base64Data: string;

        if (isHttpUrl(inputs.data)) {
            base64Data = await fetchUrlToBase64(inputs.data);
            const urlExt = inputs.data.split('.').pop()?.split(/\?|#/)[0] || ext;
            fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${urlExt}`;
        } else {
            base64Data = inputs.data;
        }

        const file = new AV.File(fileName, { base64: base64Data }, mime);
        await file.save();

        const elapsed = performance.now() - t0;
        // 更新日志
        updatePortLog(
            this.context,
            this.nodeId,
            this.portId,
            {
                content: `LocalHost File URL: ${file.url()}`,
                elapsed
            }
        );


        return file.url();
    }
}
