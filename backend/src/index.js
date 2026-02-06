/**
 * PebbleDrive Backend API
 * Cloudflare Workers Entry Point
 */
import { corsMiddleware, addCorsHeaders } from './middleware/cors.js';
import { errorHandler } from './middleware/error.js';
import { handleRoute } from './routes.js';
import { ensureDatabase } from './utils/db-init.js';
import { cacheBustingMiddleware, addNoCacheHeaders } from './middleware/cache-busting.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS 预检请求
        if (request.method === 'OPTIONS') {
            return corsMiddleware();
        }

        try {
            // 自动初始化数据库（首次请求时执行）
            await ensureDatabase(env);

            // 🔴 关键路由：分享和下载（需要防缓存）
            // 迁移自 Pages Functions，确保缓存控制正常工作
            if (url.pathname.startsWith('/share/') || url.pathname.startsWith('/download/')) {
                // 防缓存中间件（时间戳重定向）
                const cacheBustingResponse = cacheBustingMiddleware(request);
                if (cacheBustingResponse) {
                    return cacheBustingResponse;
                }

                // 转发到后端 API 处理
                const response = await handleRoute(request, env);

                // 添加强制防缓存头
                return addNoCacheHeaders(response);
            }

            // API 路由（/api/* 路径）
            if (url.pathname.startsWith('/api/')) {
                const response = await handleRoute(request, env);
                return addCorsHeaders(response);
            }

            // 静态文件路由（Frontend，仅在一体化部署时可用）
            if (env.ASSETS) {
                return env.ASSETS.fetch(request);
            }

            // 如果没有 ASSETS（分离部署模式），返回 API-only 提示
            if (url.pathname === '/' || url.pathname === '') {
                return new Response(JSON.stringify({
                    message: 'PebbleDrive Backend API',
                    version: '1.3.2',
                    endpoints: '/api/*',
                    docs: 'https://github.com/aydomini/pebble-drive'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 404
            return new Response('Not Found', { status: 404 });
        } catch (error) {
            // 错误处理
            const errorResponse = errorHandler(error);
            return addCorsHeaders(errorResponse);
        }
    }
};
