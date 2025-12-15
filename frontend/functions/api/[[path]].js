/**
 * API 统一代理 - Cloudflare Pages Functions
 *
 * 功能：转发所有 /api/* 请求到真实后端，完全隐藏后端地址
 *
 * [[path]] 是动态路由语法，匹配所有子路径：
 * - /api/login → your-backend.workers.dev/api/login
 * - /api/files → your-backend.workers.dev/api/files
 * - /api/upload/init → your-backend.workers.dev/api/upload/init
 *
 * 安全说明：
 * - BACKEND_URL 通过环境变量配置，不硬编码在代码中
 * - 开源项目需在 wrangler.toml（.gitignore）或 Cloudflare Dashboard 中配置
 */

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // **Cache Busting 策略（仅对 GET 请求）**
    // POST/PUT/DELETE 请求不会被缓存
    // GET 请求（如 /api/files）可能被缓存，添加时间戳强制刷新
    if (request.method === 'GET' && !url.searchParams.has('_t')) {
        url.searchParams.set('_t', Date.now().toString());
        return Response.redirect(url.toString(), 302);
    }

    // 获取真实后端地址（从环境变量）
    // 必须在 wrangler.toml 或 Cloudflare Dashboard 中配置 BACKEND_URL
    const backendUrl = env.BACKEND_URL;

    if (!backendUrl) {
        console.error('[API Proxy] BACKEND_URL 未配置');
        return new Response(JSON.stringify({
            error: 'Configuration Error',
            message: 'BACKEND_URL 未配置，请在 wrangler.toml 或 Cloudflare Dashboard 中设置'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }

    // 构建目标 URL（保留路径和查询参数）
    const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

    console.log(`[API Proxy] ${request.method} ${url.pathname} -> ${targetUrl}`);

    try {
        // 转发请求到真实后端
        const fetchOptions = {
            method: request.method,
            headers: request.headers,
            redirect: 'manual'
        };

        // 只有 GET 和 HEAD 方法没有 body
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            fetchOptions.body = request.body;
        }

        const response = await fetch(targetUrl, fetchOptions);

        // 创建新响应（保留所有 headers 和响应体）
        const newResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });

        // 添加 CORS 头（如果需要）
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return newResponse;

    } catch (error) {
        console.error('[API Proxy Error]', error);
        return new Response(JSON.stringify({
            error: 'Proxy Error',
            message: '代理请求失败，请稍后重试'
        }), {
            status: 502,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
}
