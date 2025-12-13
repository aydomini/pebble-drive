/**
 * 中止分片上传处理器
 * 中止 R2 Multipart Upload 并清理 KV
 * KV 操作：1 次 DELETE
 */
import { createErrorResponse } from '../middleware/error.js';

export async function handleUploadAbort(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const { uploadId, fileId } = await request.json();

        // 验证输入
        if (!uploadId || !fileId) {
            return createErrorResponse('缺少必要参数（uploadId 和 fileId）', 400);
        }

        console.log(`[分片上传] 中止请求 - fileId: ${fileId}, uploadId: ${uploadId}`);

        // 中止 R2 Multipart Upload
        const bucket = env.R2_BUCKET;

        try {
            // 恢复 multipart upload 会话
            const multipartUpload = bucket.resumeMultipartUpload(fileId, uploadId);

            // 中止上传
            await multipartUpload.abort();

            console.log(`[分片上传] R2 multipart upload 已中止 - fileId: ${fileId}`);
        } catch (r2Error) {
            // R2 中止失败不应阻断清理流程
            // 可能原因：upload 已完成、已中止、或24小时过期
            console.warn(`[分片上传] R2 中止警告（可能已过期）: ${r2Error.message}`);
        }

        // 清理 KV 临时数据（KV 操作 #1: DELETE）
        try {
            await env.RATE_LIMIT_KV.delete(`upload:${uploadId}`);
            console.log(`[分片上传] KV 临时数据已清理 - uploadId: ${uploadId}`);
        } catch (kvError) {
            console.warn(`[分片上传] KV 清理警告: ${kvError.message}`);
        }

        console.log(`[分片上传] 中止成功 - fileId: ${fileId}`);

        return new Response(JSON.stringify({
            success: true,
            message: '分片上传已中止'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[分片上传] 中止失败:', error);
        return createErrorResponse(`中止上传失败: ${error.message}`, 500);
    }
}
