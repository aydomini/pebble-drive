/**
 * 速率限制服务 - 使用 Cloudflare KV
 *
 * 采用渐进式惩罚策略：
 * - 阶段 1（轻度）：3 次失败/5分钟 → 锁定 1 分钟
 * - 阶段 2（中度）：6 次失败/15分钟 → 锁定 5 分钟
 * - 阶段 3（重度）：10 次失败/1小时 → 锁定 30 分钟
 */

const RATE_LIMIT_CONFIG = {
    // 阶段 1：轻度警告（可能是手误）
    light: {
        maxAttempts: 3,
        windowSeconds: 300,      // 5 分钟
        penaltySeconds: 60,      // 锁定 1 分钟
        message: "密码错误 3 次，请 1 分钟后重试"
    },

    // 阶段 2：中度防护（疑似攻击）
    medium: {
        maxAttempts: 6,          // 累计 6 次
        windowSeconds: 900,      // 15 分钟
        penaltySeconds: 300,     // 锁定 5 分钟
        message: "检测到异常行为，IP 已锁定 5 分钟"
    },

    // 阶段 3：严厉打击（确认攻击）
    heavy: {
        maxAttempts: 10,         // 累计 10 次
        windowSeconds: 3600,     // 1 小时
        penaltySeconds: 1800,    // 锁定 30 分钟
        message: "检测到暴力破解，IP 已锁定 30 分钟"
    }
};

/**
 * 检查 IP 速率限制（渐进式惩罚）
 * @param {Object} env - 环境变量
 * @param {string} ip - 客户端 IP
 * @returns {Promise<Object>} - { allowed: boolean, stage: string, message: string, remainingSeconds: number }
 */
export async function checkIPRateLimit(env, ip) {
    const key = `login_rate:${ip}`;
    const data = await env.RATE_LIMIT_KV.get(key, 'json');

    if (!data) {
        // 首次登录尝试
        return { allowed: true, stage: null, attempts: 0 };
    }

    const now = Date.now();

    // 检查是否被锁定
    if (data.blockedUntil && now < data.blockedUntil) {
        const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000);
        return {
            allowed: false,
            stage: data.stage,
            message: data.message || '登录已被锁定',
            remainingSeconds,
            attempts: data.attempts || 0
        };
    }

    // 清理过期的尝试记录
    const attempts = (data.attempts || []).filter(timestamp => {
        // 保留 1 小时内的所有尝试记录（用于最严格的阶段判断）
        return (now - timestamp) < RATE_LIMIT_CONFIG.heavy.windowSeconds * 1000;
    });

    // 判断当前应该触发哪个阶段的限制
    const stage = determineStage(attempts, now);

    if (stage) {
        const config = RATE_LIMIT_CONFIG[stage];
        // 触发速率限制，锁定 IP
        const blockedUntil = now + (config.penaltySeconds * 1000);

        await env.RATE_LIMIT_KV.put(key, JSON.stringify({
            attempts,
            blockedUntil,
            stage,
            message: config.message
        }), {
            expirationTtl: config.penaltySeconds + RATE_LIMIT_CONFIG.heavy.windowSeconds
        });

        return {
            allowed: false,
            stage,
            message: config.message,
            remainingSeconds: config.penaltySeconds,
            attempts: attempts.length
        };
    }

    // 未触发限制
    return {
        allowed: true,
        stage: null,
        attempts: attempts.length
    };
}

/**
 * 判断应该触发哪个阶段的限制
 * @param {Array<number>} attempts - 尝试时间戳数组
 * @param {number} now - 当前时间戳
 * @returns {string|null} - 'heavy' | 'medium' | 'light' | null
 */
function determineStage(attempts, now) {
    // 检查阶段 3（重度）：1 小时内 10 次
    const heavyWindow = now - (RATE_LIMIT_CONFIG.heavy.windowSeconds * 1000);
    const heavyAttempts = attempts.filter(t => t > heavyWindow);
    if (heavyAttempts.length >= RATE_LIMIT_CONFIG.heavy.maxAttempts) {
        return 'heavy';
    }

    // 检查阶段 2（中度）：15 分钟内 6 次
    const mediumWindow = now - (RATE_LIMIT_CONFIG.medium.windowSeconds * 1000);
    const mediumAttempts = attempts.filter(t => t > mediumWindow);
    if (mediumAttempts.length >= RATE_LIMIT_CONFIG.medium.maxAttempts) {
        return 'medium';
    }

    // 检查阶段 1（轻度）：5 分钟内 3 次
    const lightWindow = now - (RATE_LIMIT_CONFIG.light.windowSeconds * 1000);
    const lightAttempts = attempts.filter(t => t > lightWindow);
    if (lightAttempts.length >= RATE_LIMIT_CONFIG.light.maxAttempts) {
        return 'light';
    }

    return null; // 未触发任何限制
}

/**
 * 记录 IP 登录尝试
 * @param {Object} env - 环境变量
 * @param {string} ip - 客户端 IP
 * @param {boolean} success - 是否登录成功
 */
export async function recordIPAttempt(env, ip, success) {
    const key = `login_rate:${ip}`;

    if (success) {
        // 登录成功，清空所有记录
        await env.RATE_LIMIT_KV.delete(key);
        return;
    }

    // 登录失败，记录尝试
    const data = await env.RATE_LIMIT_KV.get(key, 'json') || { attempts: [] };
    const now = Date.now();

    // 清理 1 小时之前的旧记录
    const attempts = (data.attempts || []).filter(timestamp => {
        return (now - timestamp) < RATE_LIMIT_CONFIG.heavy.windowSeconds * 1000;
    });

    // 添加当前尝试
    attempts.push(now);

    // 保存到 KV，TTL 设置为 1 小时（覆盖最长窗口）
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({
        attempts
    }), {
        expirationTtl: RATE_LIMIT_CONFIG.heavy.windowSeconds
    });
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
