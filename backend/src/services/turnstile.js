/**
 * Cloudflare Turnstile 验证服务
 */

/**
 * 验证 Turnstile token
 * @param {string} token - 前端返回的 token
 * @param {object} env - 环境变量
 * @param {string} clientIP - 客户端 IP
 * @returns {Promise<boolean>} - 验证是否成功
 */
export async function verifyTurnstile(token, env, clientIP) {
    // 需要 Turnstile 配置
    if (!env.TURNSTILE_SECRET_KEY) {
        throw new Error('Turnstile secret key not configured');
    }

    if (!token) {
        return false;
    }

    try {
        const verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

        const response = await fetch(verifyEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret: env.TURNSTILE_SECRET_KEY,
                response: token,
                remoteip: clientIP
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Turnstile verification successful');
            return true;
        } else {
            console.warn('Turnstile verification failed:', data['error-codes']);
            return false;
        }
    } catch (error) {
        console.error('Turnstile verification error:', error);
        // 验证失败时，为了安全起见返回 false
        return false;
    }
}
