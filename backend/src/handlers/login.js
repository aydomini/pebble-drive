import { generateToken } from '../middleware/auth.js';

/**
 * 处理登录请求
 * POST /api/login
 * Body: { password: string }
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

        // 解析请求体
        const { password } = await request.json();

        if (!password) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: '请提供密码'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 验证密码
        if (password !== env.AUTH_PASSWORD) {
            return new Response(JSON.stringify({
                error: 'Unauthorized',
                message: '密码错误'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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
