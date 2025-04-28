// server/middleware/cors.ts
export default defineEventHandler((event) => {
    const origin = getHeader(event, 'origin') || '*';

    // 允许的来源（你可以在这里限制具体域名）
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin);
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');

    // 允许的方法
    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // 允许的请求头
    setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 如果是预检请求（OPTIONS），直接返回 200
    if (getMethod(event) === 'OPTIONS') {
        event.node.res.statusCode = 200;
        event.node.res.end();
    }
});
