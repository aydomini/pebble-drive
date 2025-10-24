/**
 * PebbleDrive Backend API
 * Cloudflare Workers Entry Point
 */
import { corsMiddleware, addCorsHeaders } from './middleware/cors.js';
import { errorHandler } from './middleware/error.js';
import { handleRoute } from './routes.js';

export default {
    async fetch(request, env, ctx) {
        // CORS 预检请求
        if (request.method === 'OPTIONS') {
            return corsMiddleware();
        }

        try {
            // 路由处理
            const response = await handleRoute(request, env);
            // 添加 CORS 头到所有响应
            return addCorsHeaders(response);
        } catch (error) {
            // 错误处理
            const errorResponse = errorHandler(error);
            return addCorsHeaders(errorResponse);
        }
    }
};
