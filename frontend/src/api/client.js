/**
 * API 客户端基类
 */
export class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL || window.location.origin;
    }

    async request(path, options = {}) {
        const url = this.baseURL + path;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return response;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async get(path) {
        return this.request(path, { method: 'GET' });
    }

    async post(path, body) {
        return this.request(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }

    async delete(path) {
        return this.request(path, { method: 'DELETE' });
    }
}
