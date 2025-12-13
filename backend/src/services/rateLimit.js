/**
 * 速率限制服务 - 使用 Cloudflare KV
 */

const RATE_LIMIT_CONFIG = {
    // IP 速率限制：每个 IP 每 5 分钟最多 5 次登录尝试
    loginAttemptsPerWindow: 5,
    rateLimitWindow: 300, // 5 分钟（秒）
    loginBlockDuration: 900, // 15 分钟（秒）

    // 账户锁定：3 次失败后锁定
    maxLoginFailures: 3,
    accountLockDuration: 60 // 60 秒
};

/**
 * 检查 IP 速率限制
 */
export async function checkIPRateLimit(env, ip) {
    const key = `ip_rate:${ip}`;
    const data = await env.RATE_LIMIT_KV.get(key, 'json');

    if (!data) {
        return { allowed: true, remaining: RATE_LIMIT_CONFIG.loginAttemptsPerWindow };
    }

    const now = Date.now();

    // 检查是否被锁定
    if (data.blockedUntil && now < data.blockedUntil) {
        const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000);
        return {
            allowed: false,
            reason: 'ip_blocked',
            remainingSeconds,
            message: `IP 已被锁定，请 ${remainingSeconds} 秒后重试`
        };
    }

    // 检查速率限制窗口（5 分钟）
    const windowStart = now - (RATE_LIMIT_CONFIG.rateLimitWindow * 1000);
    const recentAttempts = (data.attempts || []).filter(t => t > windowStart);

    if (recentAttempts.length >= RATE_LIMIT_CONFIG.loginAttemptsPerWindow) {
        // 超过速率限制，锁定 IP
        const blockedUntil = now + (RATE_LIMIT_CONFIG.loginBlockDuration * 1000);
        await env.RATE_LIMIT_KV.put(key, JSON.stringify({
            attempts: [],
            blockedUntil
        }), { expirationTtl: RATE_LIMIT_CONFIG.loginBlockDuration });

        return {
            allowed: false,
            reason: 'rate_limit_exceeded',
            remainingSeconds: RATE_LIMIT_CONFIG.loginBlockDuration,
            message: `登录尝试过于频繁，IP 已被锁定 ${RATE_LIMIT_CONFIG.loginBlockDuration / 60} 分钟`
        };
    }

    return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.loginAttemptsPerWindow - recentAttempts.length
    };
}

/**
 * 记录 IP 登录尝试
 */
export async function recordIPAttempt(env, ip, success) {
    const key = `ip_rate:${ip}`;
    const data = await env.RATE_LIMIT_KV.get(key, 'json') || { attempts: [] };

    const now = Date.now();
    const windowStart = now - (RATE_LIMIT_CONFIG.rateLimitWindow * 1000); // 5 分钟窗口

    // 清理旧记录，只保留最近 5 分钟的
    const recentAttempts = (data.attempts || []).filter(t => t > windowStart);

    if (success) {
        // 登录成功，清空记录
        await env.RATE_LIMIT_KV.delete(key);
    } else {
        // 登录失败，记录尝试
        recentAttempts.push(now);
        await env.RATE_LIMIT_KV.put(key, JSON.stringify({
            attempts: recentAttempts
        }), { expirationTtl: RATE_LIMIT_CONFIG.rateLimitWindow }); // 5 分钟过期
    }
}

/**
 * 检查账户锁定状态
 */
export async function checkAccountLock(env) {
    const key = 'account_lock';
    const data = await env.RATE_LIMIT_KV.get(key, 'json');

    if (!data) {
        return { locked: false, failures: 0 };
    }

    const now = Date.now();

    // 检查是否被锁定
    if (data.lockedUntil && now < data.lockedUntil) {
        const remainingSeconds = Math.ceil((data.lockedUntil - now) / 1000);
        return {
            locked: true,
            remainingSeconds,
            message: `账户已被锁定，请 ${remainingSeconds} 秒后重试`
        };
    }

    // 锁定已过期，重置失败次数
    if (data.lockedUntil && now >= data.lockedUntil) {
        await env.RATE_LIMIT_KV.delete(key);
        return { locked: false, failures: 0 };
    }

    return { locked: false, failures: data.failures || 0 };
}

/**
 * 记录账户登录失败
 */
export async function recordAccountFailure(env, success) {
    const key = 'account_lock';

    if (success) {
        // 登录成功，清空失败记录
        await env.RATE_LIMIT_KV.delete(key);
        return;
    }

    const data = await env.RATE_LIMIT_KV.get(key, 'json') || { failures: 0 };
    const failures = (data.failures || 0) + 1;

    if (failures >= RATE_LIMIT_CONFIG.maxLoginFailures) {
        // 达到失败次数上限，锁定账户
        const now = Date.now();
        const lockedUntil = now + (RATE_LIMIT_CONFIG.accountLockDuration * 1000);

        await env.RATE_LIMIT_KV.put(key, JSON.stringify({
            failures,
            lockedUntil
        }), { expirationTtl: RATE_LIMIT_CONFIG.accountLockDuration });
    } else {
        // 记录失败次数
        await env.RATE_LIMIT_KV.put(key, JSON.stringify({
            failures
        }), { expirationTtl: 300 }); // 5 分钟过期
    }

    return {
        failures,
        remainingAttempts: RATE_LIMIT_CONFIG.maxLoginFailures - failures
    };
}

/**
 * 获取客户端 IP
 */
export function getClientIP(request) {
    // Cloudflare 提供的真实 IP
    return request.headers.get('CF-Connecting-IP') ||
           request.headers.get('X-Forwarded-For')?.split(',')[0] ||
           '0.0.0.0';
}

/**
 * ===============================================
 * 上传速率限制功能（新增）
 * ===============================================
 */

/**
 * 检查上传速率限制
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} clientIP - 客户端 IP 地址
 * @param {Object} config - 配置对象
 * @returns {Promise<Object>} { allowed: boolean, currentCount: number, retryAfter: number }
 */
export async function checkUploadRateLimit(env, clientIP, config) {
    const key = `upload:rate:${clientIP}`;
    const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）

    try {
        // 从 KV 获取当前计数
        const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

        if (!data) {
            // 首次上传，允许
            return {
                allowed: true,
                currentCount: 0,
                retryAfter: 0
            };
        }

        const { count, windowStart } = data;
        const windowEnd = windowStart + config.uploadRateWindow;

        // 检查窗口是否已过期
        if (now >= windowEnd) {
            // 窗口已过期，重置计数
            return {
                allowed: true,
                currentCount: 0,
                retryAfter: 0
            };
        }

        // 检查是否超过限制
        if (count >= config.uploadRateLimit) {
            const retryAfter = windowEnd - now;
            return {
                allowed: false,
                currentCount: count,
                retryAfter: retryAfter
            };
        }

        // 未超过限制
        return {
            allowed: true,
            currentCount: count,
            retryAfter: 0
        };

    } catch (error) {
        console.error('速率限制检查失败：', error);
        // 出错时允许上传（避免误拦截）
        return {
            allowed: true,
            currentCount: 0,
            retryAfter: 0
        };
    }
}

/**
 * 增加上传计数
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} clientIP - 客户端 IP 地址
 * @param {Object} config - 配置对象
 */
export async function incrementUploadCount(env, clientIP, config) {
    const key = `upload:rate:${clientIP}`;
    const now = Math.floor(Date.now() / 1000);

    try {
        const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });

        let newData;
        if (!data) {
            // 首次上传
            newData = {
                count: 1,
                windowStart: now
            };
        } else {
            const { count, windowStart } = data;
            const windowEnd = windowStart + config.uploadRateWindow;

            if (now >= windowEnd) {
                // 窗口已过期，重置
                newData = {
                    count: 1,
                    windowStart: now
                };
            } else {
                // 增加计数
                newData = {
                    count: count + 1,
                    windowStart: windowStart
                };
            }
        }

        // 保存到 KV，设置过期时间为窗口结束时间
        const ttl = config.uploadRateWindow + 60; // 额外 60 秒缓冲
        await env.RATE_LIMIT_KV.put(key, JSON.stringify(newData), {
            expirationTtl: ttl
        });

    } catch (error) {
        console.error('速率限制计数失败：', error);
        // 出错时不影响上传流程
    }
}

/**
 * 重置指定 IP 的上传计数（管理功能）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} clientIP - 客户端 IP 地址
 */
export async function resetUploadCount(env, clientIP) {
    const key = `upload:rate:${clientIP}`;
    try {
        await env.RATE_LIMIT_KV.delete(key);
        return { success: true };
    } catch (error) {
        console.error('重置速率限制失败：', error);
        return { success: false, error: error.message };
    }
}

/**
 * 获取指定 IP 的上传统计信息（管理功能）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @param {string} clientIP - 客户端 IP 地址
 * @param {Object} config - 配置对象
 * @returns {Promise<Object>} 统计信息
 */
export async function getUploadStats(env, clientIP, config) {
    const key = `upload:rate:${clientIP}`;
    try {
        const data = await env.RATE_LIMIT_KV.get(key, { type: 'json' });
        if (!data) {
            return {
                count: 0,
                windowStart: null,
                windowEnd: null,
                remaining: config.uploadRateLimit
            };
        }

        const { count, windowStart } = data;
        const windowEnd = windowStart + config.uploadRateWindow;

        return {
            count,
            windowStart,
            windowEnd,
            remaining: Math.max(0, windowEnd - Math.floor(Date.now() / 1000)),
            limit: config.uploadRateLimit
        };
    } catch (error) {
        console.error('获取上传统计失败：', error);
        return null;
    }
}
