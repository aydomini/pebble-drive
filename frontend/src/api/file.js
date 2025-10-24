/**
 * 文件 API
 */
import { APIClient } from './client.js';

export class FileAPI extends APIClient {
    /**
     * 上传文件
     */
    async upload(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(this.baseURL + '/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return response.json();
    }

    /**
     * 获取文件列表
     */
    async list() {
        const response = await this.get('/api/files');
        return response.json();
    }

    /**
     * 下载文件
     */
    getDownloadUrl(fileId) {
        return this.baseURL + '/api/download?id=' + fileId;
    }

    /**
     * 删除文件
     */
    async delete(fileId) {
        const response = await this.delete('/api/delete?id=' + fileId);
        return response.json();
    }

    /**
     * 获取存储配额
     */
    async getStorageQuota() {
        const response = await this.get('/api/storage/quota');
        return response.json();
    }
}
