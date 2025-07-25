import type { VideoDurationData } from '~~/types/node-data/video-duration'
import type { BuildContext, LangFlowNode } from '~~/types/workflow'
import { writeLogs, resolveInputVariables } from '../utils'
import got from 'got'
import { performance } from 'perf_hooks'

/**
 * ---------------------------------------------------------------------------
 *  Robust MP4‑duration extractor (stable version)
 *
 *  Strategy hierarchy
 *  ──────────────────
 *  1. HEAD  →  obtain file size & Range support.
 *  2. HEAD probe   (first 8 MiB)                → fast‑start files.
 *  3. TAIL probe   (last 1 MiB)                 → ‘moov at end’ files.
 *  4. MIDDLE slide (2 MiB steps, ≤32 MiB total) → rare ‘moov in middle’.
 *  5. Fallback     (full download up to 64 MiB) → server *without* Range.
 *
 *  This covers > 99.9 % of MP4s you’ll meet in the wild while keeping
 *  bandwidth modest (≤ ~33 MiB in the worst‑case Range probe).
 * ---------------------------------------------------------------------------
 */

/* Probe sizes (bytes) */
const HEAD_PROBE_BYTES = 8 * 1024 * 1024 - 1   // 8 MiB – 1 (Range end inclusive)
const TAIL_PROBE_BYTES = 1 * 1024 * 1024 - 1   // 1 MiB – 1
const WINDOW_BYTES = 2 * 1024 * 1024       // sliding‑window width
const MAX_MIDDLE_SCAN = 32 * 1024 * 1024      // cap Range scan at 32 MiB
const MAX_FALLBACK_BYTES = 64 * 1024 * 1024      // if no Range, hard‑limit full fetch

/* --------------------------------------------------------
 * ISO–BMFF helpers
 * ------------------------------------------------------*/
function readBoxSize(buf: Buffer, off: number): { size: number; header: number } {
    let size = buf.readUInt32BE(off)
    let header = 8
    if (size === 1) {                           // large‑size (64‑bit)
        size = Number(buf.readBigUInt64BE(off + 8))
        header = 16
    } else if (size === 0) {                    // to end of file/buffer
        size = buf.length - off
    }
    return { size, header }
}

function getMp4DurationFromBuffer(buf: Buffer): number {
    let off = 0
    while (off + 8 <= buf.length) {
        const { size, header } = readBoxSize(buf, off)
        if (size < 8 || off + size > buf.length) break // guard corrupt sizes

        const type = buf.toString('utf8', off + 4, off + 8)
        if (type === 'moov') {
            let inner = off + header
            const end = off + size
            while (inner + 8 <= end) {
                const { size: boxSize, header: boxHdr } = readBoxSize(buf, inner)
                if (boxSize < 8 || inner + boxSize > end) break

                const boxType = buf.toString('utf8', inner + 4, inner + 8)
                if (boxType === 'mvhd') {
                    const version = buf[inner + boxHdr]
                    const timescale = buf.readUInt32BE(inner + boxHdr + (version ? 20 : 12))
                    const duration = version
                        ? Number(buf.readBigUInt64BE(inner + boxHdr + 24))
                        : buf.readUInt32BE(inner + boxHdr + 16)
                    return duration / timescale
                }
                inner += boxSize
            }
        }
        off += size
    }
    return 0
}

/* --------------------------------------------------------
 * Network helpers
 * ------------------------------------------------------*/
const fetchRange = async (url: string, range: string): Promise<Buffer> =>
    got(url, { headers: { Range: range }, responseType: 'buffer' }).then(r => r.body)

/* --------------------------------------------------------
 * Duration extractor (public) – bandwidth‑minimised scan
 * ------------------------------------------------------*/
async function getVideoDurationFromMp4(url: string): Promise<number> {
    // ─── 1) HEAD ──────────────────────────────────────────────────────────
    const head = await got.head(url)
    const fileSize = Number(head.headers['content-length'] || 0)
    const acceptRanges = String(head.headers['accept-ranges'] || '').toLowerCase() === 'bytes'

    // ─── 2) HEAD‑probe (first 8 MiB) ─────────────────────────────────────
    const headEnd = fileSize ? Math.min(fileSize - 1, HEAD_PROBE_BYTES) : HEAD_PROBE_BYTES
    let buffer = await fetchRange(url, `bytes=0-${headEnd}`)
    let duration = getMp4DurationFromBuffer(buffer)
    if (duration > 0) return duration

    // ─── 3) TAIL‑probe (last 1 MiB) ──────────────────────────────────────
    if (fileSize && acceptRanges) {
        const tailStart = Math.max(0, fileSize - TAIL_PROBE_BYTES - 1)
        buffer = await fetchRange(url, `bytes=${tailStart}-${fileSize - 1}`)
        duration = getMp4DurationFromBuffer(buffer)
        if (duration > 0) return duration
    }

    // ─── 4) MIDDLE sliding‑window scan ──────────────────────────────────
    if (fileSize && acceptRanges) {
        const tailBoundary = Math.max(0, fileSize - TAIL_PROBE_BYTES - 1)
        let offset = headEnd + 1
        let scanned = 0
        let accumBuf = Buffer.alloc(0)

        while (offset < tailBoundary && scanned < MAX_MIDDLE_SCAN) {
            const end = Math.min(offset + WINDOW_BYTES - 1, tailBoundary - 1)
            const chunk = await fetchRange(url, `bytes=${offset}-${end}`)
            offset += chunk.length
            scanned += chunk.length
            accumBuf = Buffer.concat([accumBuf.slice(-16), chunk])  // keep 16‑byte overlap
            duration = getMp4DurationFromBuffer(accumBuf)
            if (duration > 0) return duration
        }
    }

    // ─── 5) Fallback: full download (limited) ────────────────────────────
    if (!acceptRanges) {
        const full = await got(url, { responseType: 'buffer', timeout: { request: 30000 } })
            .then(r => (MAX_FALLBACK_BYTES && r.rawBody.length > MAX_FALLBACK_BYTES
                ? r.rawBody.subarray(0, MAX_FALLBACK_BYTES)
                : r.rawBody))
        duration = getMp4DurationFromBuffer(full)
    }

    return duration // 0 if not found
}

/* --------------------------------------------------------
 * LangFlow node factory – returns numeric duration & logs message
 * ------------------------------------------------------*/
export async function videoDurationFactory(
    node: LangFlowNode,
    context: BuildContext
) {
    const { urlInputportVariable, outputVariable } = node.data as VideoDurationData
    const input = await resolveInputVariables(context, [urlInputportVariable])
    const url = input[urlInputportVariable.id] as string

    const t0 = performance.now()
    let duration = 0
    try {
        duration = await getVideoDurationFromMp4(url)
    } catch (err) {
        console.error('[视频时长获取失败]', err)
    }
    const elapsed = performance.now() - t0

    writeLogs(
        context,
        node.id,
        node.data.title,
        node.data.type,
        {
            [outputVariable.id]: {
                content: `${url} 的时长：${duration.toFixed(2)} 秒`,
                outputPort: outputVariable,
                elapsed
            }
        },
        elapsed
    )

    return { [outputVariable.id]: duration }
}
