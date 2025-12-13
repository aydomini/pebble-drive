/**
 * 路由配置
 */
import { handleUpload } from './handlers/upload.js';
import { handleUploadInit } from './handlers/uploadInit.js';
import { handleUploadChunk } from './handlers/uploadChunk.js';
import { handleUploadComplete } from './handlers/uploadComplete.js';
import { handleUploadAbort } from './handlers/uploadAbort.js';
import { handleListFiles } from './handlers/files.js';
import { handleDownload } from './handlers/download.js';
import { handleDelete } from './handlers/delete.js';
import { handleShare, handleShareAccess } from './handlers/share.js';
import { handleStorageQuota } from './handlers/storage.js';
import { handleLogin } from './handlers/login.js';
import { handleConfigLimits } from './handlers/configLimits.js';
import { requireAuth } from './middleware/auth.js';

/**
 * 路由映射表
 * requireAuth: true 的路由需要认证
 */
export const routes = {
    '/api/login': { handler: handleLogin, requireAuth: false },
    '/api/config/limits': { handler: handleConfigLimits, requireAuth: false }, // 公开配置API
    '/api/upload': { handler: handleUpload, requireAuth: true },
    '/api/upload/init': { handler: handleUploadInit, requireAuth: true }, // 分片上传：初始化
    '/api/upload/chunk': { handler: handleUploadChunk, requireAuth: true }, // 分片上传：上传分片
    '/api/upload/complete': { handler: handleUploadComplete, requireAuth: true }, // 分片上传：完成
    '/api/upload/abort': { handler: handleUploadAbort, requireAuth: true }, // 分片上传：中止
    '/api/files': { handler: handleListFiles, requireAuth: true },
    '/api/download': { handler: handleDownload, requireAuth: true },
    '/api/delete': { handler: handleDelete, requireAuth: true },
    '/api/share': { handler: handleShare, requireAuth: true },
    '/api/storage/quota': { handler: handleStorageQuota, requireAuth: true }
};

/**
 * 路由处理
 */
export async function handleRoute(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理分享访问（无需认证）
    if (path.startsWith('/share/')) {
        const shareToken = path.substring(7);
        return handleShareAccess(request, env, shareToken);
    }

    // 处理API路由
    const route = routes[path];
    if (route) {
        // 检查是否需要认证
        if (route.requireAuth) {
            const authError = await requireAuth(request, env);
            if (authError) {
                return authError; // 返回 401 错误
            }
        }

        return route.handler(request, env);
    }

    // 404
    return new Response('Not Found', { status: 404 });
}
