/**
 * 文件上传处理器
 */
import { generateFileId } from '../utils/id.js';
import { uploadToR2 } from '../services/r2.js';
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

        // 生成唯一文件ID
        const fileId = generateFileId();
        const fileName = file.name;
        const fileSize = file.size;
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
