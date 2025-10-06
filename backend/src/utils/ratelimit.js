/**
 * 速率限制工具
 * 用于防止暴力破解分享链接密码
 */

/**
 * 检查是否超过速率限制
 * @param {object} env - 环境变量
 * @param {string} shareToken - 分享令牌
 * @param {string} ip - 客户端 IP
 * @param {number} maxAttempts - 最大尝试次数（默认 5 次）
 * @param {number} windowSeconds - 时间窗口（默认 3600 秒 = 1 小时）
 * @returns {Promise<boolean>} - true 表示已超过限制
 */
export async function isRateLimited(env, shareToken, ip, maxAttempts = 5, windowSeconds = 3600) {
    const key = `ratelimit:share:${shareToken}:${ip}`;

    try {
        const attemptsStr = await env.RATE_LIMIT_KV.get(key);
        const attempts = attemptsStr ? parseInt(attemptsStr) : 0;

        return attempts >= maxAttempts;
    } catch (error) {
        console.error('Rate limit check error:', error);
        return false; // 出错时不阻止访问
    }
}

/**
 * 记录失败的密码尝试
 * @param {object} env - 环境变量
 * @param {string} shareToken - 分享令牌
 * @param {string} ip - 客户端 IP
 * @param {number} windowSeconds - 时间窗口（默认 3600 秒 = 1 小时）
 */
export async function recordFailedAttempt(env, shareToken, ip, windowSeconds = 3600) {
    const key = `ratelimit:share:${shareToken}:${ip}`;

    try {
        const attemptsStr = await env.RATE_LIMIT_KV.get(key);
        const currentAttempts = attemptsStr ? parseInt(attemptsStr) : 0;
        const newAttempts = currentAttempts + 1;

        await env.RATE_LIMIT_KV.put(key, newAttempts.toString(), {
            expirationTtl: windowSeconds
        });

        return newAttempts;
    } catch (error) {
        console.error('Record failed attempt error:', error);
        return 0;
    }
}

/**
 * 重置速率限制（密码验证成功后调用）
 * @param {object} env - 环境变量
 * @param {string} shareToken - 分享令牌
 * @param {string} ip - 客户端 IP
 */
export async function resetRateLimit(env, shareToken, ip) {
    const key = `ratelimit:share:${shareToken}:${ip}`;

    try {
        await env.RATE_LIMIT_KV.delete(key);
    } catch (error) {
        console.error('Reset rate limit error:', error);
    }
}

/**
 * 获取客户端 IP 地址
 * @param {Request} request - 请求对象
 * @returns {string} - IP 地址
 */
export function getClientIP(request) {
    // Cloudflare Workers 提供的真实 IP
    return request.headers.get('CF-Connecting-IP') ||
           request.headers.get('X-Forwarded-For')?.split(',')[0] ||
           request.headers.get('X-Real-IP') ||
           '0.0.0.0';
}
