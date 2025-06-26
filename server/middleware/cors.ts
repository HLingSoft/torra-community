// server/middleware/cors.ts
export default defineEventHandler((event) => {
    const origin = getHeader(event, 'origin') || '*';

    setHeader(event, 'Access-Control-Allow-Origin', origin);
    setHeader(event, 'Access-Control-Allow-Credentials', 'true');
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');


    if (getMethod(event) === 'OPTIONS') {
        setResponseStatus(event, 204);
        return ''; // 终止中间件处理
    }
});
