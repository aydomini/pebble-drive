/**
 * 文件下载处理器
 */
import { getFromR2 } from '../services/r2.js';
import { getFileById } from '../services/database.js';
import { createErrorResponse } from '../middleware/error.js';

export async function handleDownload(request, env) {
    if (request.method !== 'GET') {
        return createErrorResponse('Method not allowed', 405);
    }

    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');

    if (!fileId) {
        return createErrorResponse('File ID required', 400);
    }

    try {
        // 从 R2 获取文件
        const file = await getFromR2(env, fileId);

        // 获取文件元数据
        const metadata = await getFileById(env, fileId);

        const headers = new Headers();
        const contentType = file.httpMetadata?.contentType || 'application/octet-stream';
        headers.set('Content-Type', contentType);
        headers.set('Content-Length', file.size.toString());

        // 对于可预览的文件类型，使用 inline；否则使用 attachment
        const previewableTypes = ['application/pdf', 'image/', 'text/', 'video/', 'audio/'];
        const isPreviewable = previewableTypes.some(type => contentType.includes(type));

        if (isPreviewable) {
            headers.set('Content-Disposition', `inline; filename="${metadata?.name || 'download'}"`);
        } else {
            headers.set('Content-Disposition', `attachment; filename="${metadata?.name || 'download'}"`);
        }

        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(file.body, { headers });

    } catch (error) {
        console.error('Download error:', error);
        return createErrorResponse(error.message, 404);
    }
}
