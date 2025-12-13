/**
 * 分片上传处理器（极简版）
 * 直接上传分片到 R2，不读取或更新 KV
 * KV 操作：0 次（方案 A 的核心优化）
 */
import { createErrorResponse } from '../middleware/error.js';

export async function handleUploadChunk(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const formData = await request.formData();

        // 获取参数
        const chunk = formData.get('chunk');
        const uploadId = formData.get('uploadId');
        const fileId = formData.get('fileId');
        const partNumber = parseInt(formData.get('partNumber'));

        // 验证输入
        if (!chunk || !uploadId || !fileId || !partNumber) {
            return createErrorResponse('缺少必要参数', 400);
        }

        // 验证分片编号
        if (partNumber < 1 || partNumber > 10000) {
            return createErrorResponse('分片编号无效（范围：1-10000）', 400);
        }

        // 获取分片数据
        const chunkBuffer = await chunk.arrayBuffer();
        const chunkSize = chunkBuffer.byteLength;

        console.log(`[分片上传] 上传中 - fileId: ${fileId}, part: ${partNumber}, size: ${(chunkSize / 1024 / 1024).toFixed(2)}MB`);

        // 直接上传分片到 R2（不读取或更新 KV）
        const bucket = env.R2_BUCKET;

        // 恢复 multipart upload 会话
        const multipartUpload = bucket.resumeMultipartUpload(fileId, uploadId);

        // 上传分片
        const uploadedPart = await multipartUpload.uploadPart(partNumber, chunkBuffer);

        console.log(`[分片上传] 上传成功 - fileId: ${fileId}, part: ${partNumber}, etag: ${uploadedPart.etag}`);

        // 返回 etag 给前端（前端自己维护状态）
        return new Response(JSON.stringify({
            success: true,
            partNumber,
            etag: uploadedPart.etag,
            message: `分片 ${partNumber} 上传成功`
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[分片上传] 上传失败:', error);

        // R2 特定错误处理
        if (error.message && error.message.includes('NoSuchUpload')) {
            return createErrorResponse('上传会话不存在或已过期，请重新开始上传', 404);
        }

        return createErrorResponse(`分片上传失败: ${error.message}`, 500);
    }
}
