/**
 * CORS 中间件
 */
export function corsMiddleware() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

/**
 * 添加 CORS 头到响应
 */
export function addCorsHeaders(response) {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
