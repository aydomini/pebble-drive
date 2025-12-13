/**
 * 分片上传初始化处理器
 * 创建 R2 Multipart Upload 并返回 uploadId
 * KV 操作：1 次 PUT
 */
import { generateFileId } from '../utils/id.js';
import { createErrorResponse } from '../middleware/error.js';
import { getValidatedConfig } from '../services/config.js';

export async function handleUploadInit(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const { fileName, fileSize, fileType, totalChunks } = await request.json();

        // 验证输入
        if (!fileName || !fileSize || !totalChunks) {
            return createErrorResponse('缺少必要参数', 400);
        }

        // 获取验证后的配置
        const config = getValidatedConfig(env);

        // 验证文件大小（最大 5GB = R2 限制）
        const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
        if (fileSize > MAX_FILE_SIZE) {
            return createErrorResponse(`文件超过 5GB 限制（当前：${(fileSize / 1024 / 1024 / 1024).toFixed(2)}GB）`, 400);
        }

        // 验证文件大小是否符合配置限制
        if (fileSize > config.maxFileSizeBytes) {
            return createErrorResponse(
                `文件超过配置限制（最大：${config.maxFileSizeMB}MB，当前：${(fileSize / 1024 / 1024).toFixed(2)}MB）`,
                400
            );
        }

        // 生成文件 ID
        const fileId = generateFileId();

        // 创建 R2 Multipart Upload
        const bucket = env.R2_BUCKET;
        const multipartUpload = await bucket.createMultipartUpload(fileId);
        const uploadId = multipartUpload.uploadId;

        console.log(`[分片上传] 初始化成功 - fileId: ${fileId}, uploadId: ${uploadId}, 文件名: ${fileName}, 大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB, 分片数: ${totalChunks}`);

        // 临时存储上传基本信息到 KV（24小时过期）
        // ⚠️ 注意：不存储 uploadedParts，由前端维护状态
        await env.RATE_LIMIT_KV.put(
            `upload:${uploadId}`,
            JSON.stringify({
                fileId,
                fileName,
                fileSize,
                fileType,
                totalChunks,
                createdAt: Date.now()
            }),
            { expirationTtl: 86400 } // 24 小时自动过期
        );

        return new Response(JSON.stringify({
            success: true,
            uploadId,
            fileId,
            message: '分片上传初始化成功'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('[分片上传] 初始化失败:', error);
        return createErrorResponse(`初始化失败: ${error.message}`, 500);
    }
}
