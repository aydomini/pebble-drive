/**
 * 完成分片上传处理器
 * 完成 R2 Multipart Upload，保存元数据，清理 KV
 * KV 操作：1 次 GET + 1 次 DELETE = 2 次
 */
import { createErrorResponse } from '../middleware/error.js';
import { saveFileMetadata } from '../services/database.js';

export async function handleUploadComplete(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const { uploadId, fileId, parts } = await request.json();

        // 验证输入
        if (!uploadId || !fileId || !parts || !Array.isArray(parts)) {
            return createErrorResponse('缺少必要参数或参数格式错误', 400);
        }

        // 验证 parts 格式
        for (const part of parts) {
            if (!part.partNumber || !part.etag) {
                return createErrorResponse('分片信息格式错误（需要 partNumber 和 etag）', 400);
            }
        }

        console.log(`[分片上传] 完成中 - fileId: ${fileId}, uploadId: ${uploadId}, parts: ${parts.length}`);

        // 从 KV 获取上传基本信息（KV 操作 #1: GET）
        const uploadInfoStr = await env.RATE_LIMIT_KV.get(`upload:${uploadId}`);
        if (!uploadInfoStr) {
            return createErrorResponse('上传会话不存在或已过期', 404);
        }

        const uploadInfo = JSON.parse(uploadInfoStr);

        // 验证分片数量
        if (parts.length !== uploadInfo.totalChunks) {
            return createErrorResponse(
                `分片数量不匹配（预期：${uploadInfo.totalChunks}，实际：${parts.length}）`,
                400
            );
        }

        // 验证 fileId 匹配
        if (fileId !== uploadInfo.fileId) {
            return createErrorResponse('文件 ID 不匹配', 400);
        }

        // 按 partNumber 排序（R2 要求）
        const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

        // 完成 R2 Multipart Upload
        const bucket = env.R2_BUCKET;

        // 恢复 multipart upload 会话
        const multipartUpload = bucket.resumeMultipartUpload(fileId, uploadId);

        // 完成上传并合并分片
        await multipartUpload.complete(sortedParts);

        console.log(`[分片上传] R2 合并完成 - fileId: ${fileId}`);

        // 生成下载 URL
        const downloadUrl = `/api/download?id=${fileId}`;

        // 保存元数据到 D1
        await saveFileMetadata(env, {
            id: fileId,
            name: uploadInfo.fileName,
            size: uploadInfo.fileSize,
            type: uploadInfo.fileType || 'application/octet-stream', // 默认类型
            uploadDate: new Date().toISOString(), // 添加上传时间
            downloadUrl
        });

        console.log(`[分片上传] 元数据已保存 - fileId: ${fileId}, 文件名: ${uploadInfo.fileName}`);

        // 清理 KV 临时数据（KV 操作 #2: DELETE）
        await env.RATE_LIMIT_KV.delete(`upload:${uploadId}`);

        console.log(`[分片上传] 完成成功 - fileId: ${fileId}, 大小: ${(uploadInfo.fileSize / 1024 / 1024).toFixed(2)}MB`);

        // 返回与普通上传一致的格式
        const metadata = {
            id: fileId,
            name: uploadInfo.fileName,
            size: uploadInfo.fileSize,
            type: uploadInfo.fileType || 'application/octet-stream',
            uploadDate: new Date().toISOString(),
            downloadUrl
        };

        return new Response(JSON.stringify(metadata), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[分片上传] 完成失败:', error);

        // R2 特定错误处理
        if (error.message && error.message.includes('NoSuchUpload')) {
            return createErrorResponse('上传会话不存在或已过期', 404);
        }

        if (error.message && error.message.includes('InvalidPart')) {
            return createErrorResponse('部分分片无效，请重新上传', 400);
        }

        return createErrorResponse(`完成上传失败: ${error.message}`, 500);
    }
}
