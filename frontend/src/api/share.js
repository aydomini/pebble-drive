/**
 * 分享 API
 */
import { APIClient } from './client.js';

export class ShareAPI extends APIClient {
    /**
     * 创建分享链接
     */
    async create(shareData) {
        const response = await this.post('/api/share', shareData);
        return response.json();
    }

    /**
     * 访问分享链接
     */
    getShareUrl(token) {
        return this.baseURL + '/share/' + token;
    }
}
