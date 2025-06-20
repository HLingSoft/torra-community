import * as cheerio from 'cheerio'
import type { URLData } from '@/types/node-data/url'
import type { BuildContext, LangFlowNode, NodeFactory } from '~/types/workflow'
import { writeLog, resolveInputVariables, wrapRunnable } from '../resolveInput'
import { RunnableLambda } from "@langchain/core/runnables";
async function fetchWithTimeout(url: string, timeoutMs = 10000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(id)
        return res
    } catch (err) {
        clearTimeout(id)
        throw err
    }
}
async function fetchUrlRecursive(
    url: string,
    depth: number,
    visited: Set<string>,
    options: { maxDepth: number; preventOutside?: boolean; format: 'Text' | 'HTML' },
    rootDomain: string
): Promise<{ url: string; content: string; html: string }[]> {
    if (depth === 0 || visited.has(url)) return []
    visited.add(url)
    try {
        // 用 Nuxt3 原生 fetch，不用 axios
        const res = await fetchWithTimeout(url, 10000)
        const html = await res.text()
        const content = options.format === 'HTML'
            ? html
            : cheerio.load(html).text()

        // 提取所有 a 标签 href
        const $ = cheerio.load(html)
        const links: string[] = []
        $('a[href]').each((_, el) => {
            let href = $(el).attr('href')
            if (!href) return
            if (!/^https?:\/\//.test(href)) {
                try {
                    href = new URL(href, url).href
                } catch { }
            }
            // 限定域名
            if (
                options.preventOutside &&
                !href.startsWith(rootDomain)
            ) return
            links.push(href)
        })

        // 递归子页面
        let children: { url: string; content: string; html: string }[] = []
        if (depth > 1) {
            for (const link of links) {
                const subDocs = await fetchUrlRecursive(link, depth - 1, visited, options, rootDomain)
                children = children.concat(subDocs)
            }
        }

        return [{ url, content, html }].concat(children)
    } catch (e) {
        return []
    }
}

export const urlFactory: NodeFactory = async (
    node: LangFlowNode,
    context: BuildContext
) => {
    const {
        maxDepth = 1,
        urlInputVariable,
        outputVariable,

    } = node.data as URLData

    const inputValues = await resolveInputVariables(context, [urlInputVariable])
    let inputUrl = inputValues[urlInputVariable.id] as string
    if (!inputUrl) throw new Error('URL required')

    if (!/^https?:\/\//.test(inputUrl)) inputUrl = 'http://' + inputUrl
    const rootDomain = new URL(inputUrl).origin
    const preventOutside = true
    const format = 'Text'
    const visited = new Set<string>()
    // const docs = await fetchUrlRecursive(
    //     inputUrl,
    //     maxDepth,
    //     visited,
    //     { maxDepth, preventOutside, format },
    //     rootDomain
    // )



    // 封装成 runnable
    const urlFetchRunnable = RunnableLambda.from(async () => {
        const docs = await fetchUrlRecursive(
            inputUrl,
            maxDepth,
            visited,
            { maxDepth, preventOutside, format },
            rootDomain
        )
        return docs.map(doc => ({
            url: doc.url,
            content: doc.content,
        }))
    })



    // 用 wrapRunnable 进行封装
    const wrapped = wrapRunnable(
        urlFetchRunnable,
        node.id,
        context.onRunnableElapsed,
        {
            context,
            portId: outputVariable.id,
            logFormat: res => ({
                type: "url-fetch",
                data: res,
            }),
        }
    )

    return {
        [outputVariable.id]: wrapped
    }
}
