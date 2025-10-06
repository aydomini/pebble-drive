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
