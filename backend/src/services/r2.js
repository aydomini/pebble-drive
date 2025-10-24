/**
 * R2 存储服务 - R2 操作封装
 */

/**
 * 获取 R2 存储桶使用情况（通过列出所有对象计算）
 */
export async function getR2StorageUsage(env) {
    try {
        // 列出所有对象
        const listed = await env.R2_BUCKET.list();

        let totalSize = 0;
        let objectCount = 0;

        // 遍历所有对象计算总大小
        for (const object of listed.objects) {
            totalSize += object.size || 0;
            objectCount++;
        }

        // 处理分页（如果对象超过1000个）
        let truncated = listed.truncated;
        let cursor = listed.cursor;

        while (truncated) {
            const nextList = await env.R2_BUCKET.list({ cursor });
            for (const object of nextList.objects) {
                totalSize += object.size || 0;
                objectCount++;
            }
            truncated = nextList.truncated;
            cursor = nextList.cursor;
        }

        return {
            totalSize,
            objectCount
        };
    } catch (error) {
        console.error('Failed to get R2 storage usage:', error);
        return {
            totalSize: 0,
            objectCount: 0
        };
    }
}

/**
 * 上传文件到 R2
 */
export async function uploadToR2(env, fileId, file, contentType) {
    const r2Response = await env.R2_BUCKET.put(fileId, file, {
        httpMetadata: {
            contentType: contentType
        }
    });

    if (!r2Response) {
        throw new Error('Failed to upload file to R2');
    }

    return r2Response;
}

/**
 * 从 R2 获取文件
 */
export async function getFromR2(env, fileId) {
    const file = await env.R2_BUCKET.get(fileId);

    if (!file) {
        throw new Error('File not found in R2');
    }

    return file;
}

/**
 * 从 R2 删除文件
 */
export async function deleteFromR2(env, fileId) {
    await env.R2_BUCKET.delete(fileId);
}
