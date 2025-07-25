// cloudflare-r2-upload.ts
import { Buffer } from "buffer";  // Node.js 自带
import type { BuildContext, LangFlowNode, NodeFactory } from "~~/types/workflow";
import { updatePortLog, resolveInputVariables, writeLogs } from "../utils";
import { StructuredTool } from "langchain/tools";

import { z } from "zod";
import { EXT_MIME_MAP, SaveToFileCloudflareData } from "~~/types/node-data/save-file-to-cloudflare";

const normDomain = (d: string) => d.replace(/^https?:\/\//, "").replace(/\/$/, "");

function getExtAndMime(ft?: string, def = "png") {
    if (!ft) return { ext: def, mime: EXT_MIME_MAP[def] };
    let ext = ft.replace(/^\./, "").toLowerCase();
    if (ext.includes("/")) ext = ext.split("/").pop() as string;
    return { ext, mime: EXT_MIME_MAP[ext] || "application/octet-stream" };
}

async function putObject(opts: {
    accountId: string;
    bucket: string;
    token: string;
    key: string;
    body: Buffer;
    contentType: string;
}) {
    const { accountId, bucket, token, key, body, contentType } = opts;
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/objects/${encodeURIComponent(key)}`;
    // —— 核心：把 Buffer 转成 Uint8Array ——  
    const uint8 = new Uint8Array(body);
    // （Buffer 有 iterator，所以上面会复制所有字节到一个“纯”Uint8Array）

    // console.log("Uploading →", token, url, "bytes:", body.byteLength);
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": contentType,
            "Content-Length": String(body.byteLength),

        },
        body: uint8,  // Uint8Array 会被识别为 ArrayBufferView
    });
    // —— 新增：打印一下 status + raw body ——  
    // const respText = await res.text();
    // console.log("R2 PUT status:", res.status, "body:", respText);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`R2 upload failed ${res.status}: ${text}`);
    }
}

export class SaveToCloudflareFileTool extends StructuredTool {
    name = "save-to-cloudflare-file";
    description = "Upload base64 to Cloudflare R2 and return public URL";
    schema = z.object({ data: z.string(), fileType: z.string().optional() });
    private publicDomain: string;

    constructor(
        private ext: string,
        private mime: string,
        private ctx: BuildContext,
        private nodeId: string,
        private portId: string,
        private accountId: string,
        private token: string,
        private bucket: string,
        pd: string
    ) {
        super();
        this.publicDomain = normDomain(pd);
    }

    async _call({ data, fileType }: { data: string; fileType?: string }) {
        const { ext, mime } = getExtAndMime(fileType || this.ext);
        const fname = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        // 直接用 Node Buffer 解码 Base64
        const buffer = Buffer.from(data, "base64");

        await putObject({
            accountId: this.accountId,
            bucket: this.bucket,
            token: this.token,
            key: fname,
            body: buffer,
            contentType: mime,
        });

        const url = `https://${this.publicDomain}/${fname}`;
        updatePortLog(this.ctx, this.nodeId, this.portId, { content: url, elapsed: 0 });
        return url;
    }
}

export const saveToFileCloudflareFactory: NodeFactory = async (node, ctx) => {
    const t0 = performance.now();
    const cfg = node.data as SaveToFileCloudflareData;
    const v = await resolveInputVariables(ctx, [
        cfg.inputInputVariable,
        cfg.accountIdInputPortVariable,
        cfg.tokenInputPortVariable,
        cfg.bucketInputPortVariable,
        cfg.publicUrlInputPortVariable,
    ]);
    const base64 = v[cfg.inputInputVariable.id] as string;
    const accountId = v[cfg.accountIdInputPortVariable.id] as string;
    const token = v[cfg.tokenInputPortVariable.id] as string;
    const bucket = v[cfg.bucketInputPortVariable.id] as string;
    const publicDomain = normDomain(v[cfg.publicUrlInputPortVariable.id] as string);
    const { ext, mime } = getExtAndMime(cfg.fileType || "png");
    const out = cfg.outputVariable.id;
    const fname = `${Date.now()}_${node.id}.${ext}`;
    const buffer = Buffer.from(base64, "base64");
    await putObject({ accountId, bucket, token, key: fname, body: buffer, contentType: mime });
    const result = `https://${publicDomain}/${fname}`;

    const tool = new SaveToCloudflareFileTool(ext, mime, ctx, node.id, out, accountId, token, bucket, publicDomain);
    const elapsed = performance.now() - t0;
    writeLogs(
        ctx,
        node.id,
        cfg.title,
        cfg.type,
        {
            [out]: { content: `R2 URL: ${result}`, outputPort: cfg.outputVariable, elapsed },
            [cfg.toolOutputVariable.id]: { content: "", outputPort: cfg.toolOutputVariable, elapsed },
        },
        elapsed
    );

    return { [out]: result, [cfg.toolOutputVariable.id]: tool };
};
