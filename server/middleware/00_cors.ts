// server/middleware/00_cors.ts           ▲ 在文件名前加个 00，确保最先执行
export default defineEventHandler((event) => {
    const origin = getHeader(event, 'origin') || '*'

    // 1. Origin 与 Allow-Credentials 搭配：必须回显具体域名
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')

    // 2. 建议把空格去掉，全部小写更保险
    setHeader(
        event,
        'Access-Control-Allow-Methods',
        'get,post,put,delete,options'
    )
    setHeader(
        event,
        'Access-Control-Allow-Headers',
        'content-type,authorization,x-user-id,torra-user-id'
    )

    if (getMethod(event) === 'OPTIONS') {
        setResponseStatus(event, 204)
        return ''
    }
})
