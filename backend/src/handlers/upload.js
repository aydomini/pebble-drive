/**
 * 文件上传处理器
 */
import { generateFileId } from '../utils/id.js';
import { uploadToR2, getR2StorageUsage } from '../services/r2.js';
import { saveFileMetadata } from '../services/database.js';
import { createErrorResponse } from '../middleware/error.js';
import { getValidatedConfig, validateFileSize, validateFileType } from '../services/config.js';
import { checkUploadRateLimit, incrementUploadCount } from '../services/rateLimit.js';

export async function handleUpload(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        // 获取验证后的配置
        const config = getValidatedConfig(env);

        // 获取客户端 IP（用于速率限制）
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';

        // 1. 检查上传速率限制
        const rateLimitCheck = await checkUploadRateLimit(env, clientIP, config);
        if (!rateLimitCheck.allowed) {
            return new Response(JSON.stringify({
                error: '上传频率超过限制',
                message: `您在 ${Math.floor(config.uploadRateWindow / 60)} 分钟内已上传 ${rateLimitCheck.currentCount} 次，超过限制（${config.uploadRateLimit} 次）`,
                retryAfter: rateLimitCheck.retryAfter,
                details: {
                    currentCount: rateLimitCheck.currentCount,
                    limit: config.uploadRateLimit,
                    windowSeconds: config.uploadRateWindow
                }
            }), {
                status: 429, // 429 Too Many Requests
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Retry-After': rateLimitCheck.retryAfter
                }
            });
        }

        // 解析上传的文件
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return createErrorResponse('未提供文件', 400);
        }

        const fileName = file.name;
        const fileSize = file.size;
        const contentType = file.type || 'application/octet-stream';

        // 2. 验证文件大小
        const sizeValidation = validateFileSize(fileSize, config);
        if (!sizeValidation.valid) {
            return new Response(JSON.stringify({
                error: sizeValidation.error,
                details: sizeValidation.details
            }), {
                status: 413, // 413 Payload Too Large
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 3. 验证文件类型
        const typeValidation = validateFileType(fileName, config);
        if (!typeValidation.valid) {
            return new Response(JSON.stringify({
                error: typeValidation.error,
                details: typeValidation.details
            }), {
                status: 415, // 415 Unsupported Media Type
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 4. 检查存储配额
        const r2Usage = await getR2StorageUsage(env);
        const currentUsage = r2Usage.totalSize;
        const remainingSpace = config.storageQuotaBytes - currentUsage;

        if (fileSize > remainingSpace) {
            const usedGB = (currentUsage / (1024 * 1024 * 1024)).toFixed(2);
            const remainingGB = (remainingSpace / (1024 * 1024 * 1024)).toFixed(2);
            const fileGB = (fileSize / (1024 * 1024 * 1024)).toFixed(2);

            return new Response(JSON.stringify({
                error: '存储空间不足',
                message: `当前已使用 ${usedGB} GB，剩余 ${remainingGB} GB，无法上传 ${fileGB} GB 的文件`,
                details: {
                    quotaGB: config.storageQuotaGB,
                    usedGB: parseFloat(usedGB),
                    remainingGB: parseFloat(remainingGB),
                    fileGB: parseFloat(fileGB)
                }
            }), {
                status: 413, // 413 Payload Too Large
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 5. 生成唯一文件ID并上传
        const fileId = generateFileId();

        // 上传到 R2
        await uploadToR2(env, fileId, file, contentType);

        // 保存文件元数据到 D1
        const metadata = {
            id: fileId,
            name: fileName,
            size: fileSize,
            type: contentType,
            uploadDate: new Date().toISOString(),
            downloadUrl: '/api/download?id=' + fileId
        };

        await saveFileMetadata(env, metadata);

        // 6. 增加上传计数（速率限制）
        await incrementUploadCount(env, clientIP, config);

        return new Response(JSON.stringify(metadata), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({
            error: error.message,
            details: error.stack
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

