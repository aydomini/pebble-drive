import { generateToken } from '../middleware/auth.js';
import {
    checkIPRateLimit,
    recordIPAttempt,
    getClientIP
} from '../services/rateLimit.js';
import { verifyTurnstile } from '../services/turnstile.js';

/**
 * 处理登录请求
 * POST /api/login
 * Body: { password: string, turnstileToken: string }
 */
export async function handleLogin(request, env) {
    try {
        // 检查必需的环境变量
        if (!env.AUTH_PASSWORD || !env.AUTH_TOKEN_SECRET) {
            return new Response(JSON.stringify({
                error: 'Server Error',
                message: '服务器认证未配置，请联系管理员'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 需要Turnstile配置
        if (!env.TURNSTILE_SECRET_KEY) {
            return new Response(JSON.stringify({
                error: 'Server Error',
                message: 'Turnstile验证未配置，请联系管理员启用安全验证'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 获取客户端 IP
        const clientIP = getClientIP(request);

        // 检查 IP 速率限制（渐进式惩罚）
        const rateCheck = await checkIPRateLimit(env, clientIP);
        if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'Rate Limit Exceeded',
                message: rateCheck.message,
                remainingSeconds: rateCheck.remainingSeconds,
                stage: rateCheck.stage,
                attempts: rateCheck.attempts
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 解析请求体
        const { password, turnstileToken } = await request.json();

        if (!password) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: '请提供密码'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 验证 Turnstile token
        if (!turnstileToken) {
            return new Response(JSON.stringify({
                error: 'Missing Captcha',
                message: '请完成人机验证后重试'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const isValid = await verifyTurnstile(turnstileToken, env, clientIP);
        if (!isValid) {
            return new Response(JSON.stringify({
                error: 'Invalid Captcha',
                message: '验证码验证失败，请刷新页面重试'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 验证密码
        const passwordCorrect = password === env.AUTH_PASSWORD;

        if (!passwordCorrect) {
            // 记录失败尝试
            await recordIPAttempt(env, clientIP, false);

            // 获取当前尝试次数（用于提示用户）
            const updatedCheck = await checkIPRateLimit(env, clientIP);

            return new Response(JSON.stringify({
                error: 'Unauthorized',
                message: '密码错误',
                attempts: updatedCheck.attempts || 0
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 登录成功 - 清除失败记录
        await recordIPAttempt(env, clientIP, true);

        // 生成 token
        const token = await generateToken(env.AUTH_TOKEN_SECRET);

        return new Response(JSON.stringify({
            success: true,
            token: token,
            expiresIn: 30 * 24 * 60 * 60 // 30天（秒）
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: '登录失败，请稍后重试'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
