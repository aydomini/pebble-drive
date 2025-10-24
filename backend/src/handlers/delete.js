/**
 * 文件删除处理器
 */
import { deleteFromR2 } from '../services/r2.js';
import { deleteFileMetadata } from '../services/database.js';
import { createErrorResponse } from '../middleware/error.js';

export async function handleDelete(request, env) {
    if (request.method !== 'DELETE') {
        return createErrorResponse('Method not allowed', 405);
    }

    const url = new URL(request.url);
    const fileId = url.searchParams.get('id');

    if (!fileId) {
        return createErrorResponse('File ID required', 400);
    }

    try {
        // 从 R2 删除文件
        await deleteFromR2(env, fileId);

        // 从 D1 删除元数据
        await deleteFileMetadata(env, fileId);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Delete error:', error);
        return createErrorResponse(error.message, 500);
    }
}
