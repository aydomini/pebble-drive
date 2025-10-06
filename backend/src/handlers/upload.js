/**
 * 文件上传处理器
 */
import { generateFileId } from '../utils/id.js';
import { uploadToR2, getR2StorageUsage } from '../services/r2.js';
import { saveFileMetadata } from '../services/database.js';
import { createErrorResponse } from '../middleware/error.js';

export async function handleUpload(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return createErrorResponse('No file provided', 400);
        }

        const fileSize = file.size;

        // 检查存储配额（如果设置了 STORAGE_QUOTA_GB）
        if (env.STORAGE_QUOTA_GB) {
            const quotaGB = parseInt(env.STORAGE_QUOTA_GB);
            const totalQuota = quotaGB * 1024 * 1024 * 1024; // 转换为字节

            // 获取当前存储使用情况
            const r2Usage = await getR2StorageUsage(env);
            const currentUsage = r2Usage.totalSize;
            const remainingSpace = totalQuota - currentUsage;

            // 检查剩余空间是否足够
            if (fileSize > remainingSpace) {
                const usedGB = (currentUsage / (1024 * 1024 * 1024)).toFixed(2);
                const remainingGB = (remainingSpace / (1024 * 1024 * 1024)).toFixed(2);
                const fileGB = (fileSize / (1024 * 1024 * 1024)).toFixed(2);

                return new Response(JSON.stringify({
                    error: '存储空间不足',
                    message: `当前已使用 ${usedGB} GB，剩余 ${remainingGB} GB，无法上传 ${fileGB} GB 的文件`,
                    details: {
                        quotaGB,
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
        }

        // 生成唯一文件ID
        const fileId = generateFileId();
        const fileName = file.name;
        const contentType = file.type || 'application/octet-stream';

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

