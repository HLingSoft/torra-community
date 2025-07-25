/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PUBLIC_API_URL?: string       // ← 这里加你需要的字段
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
