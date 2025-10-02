/**
 * 认证中间件 - 简单密码保护
 *
 * 环境变量：
 * - AUTH_PASSWORD: 管理密码（通过 wrangler secret 设置）
 * - AUTH_TOKEN_SECRET: JWT 签名密钥（通过 wrangler secret 设置）
 */

/**
 * 生成简单的 JWT token
 * @param {string} secret - 签名密钥
 * @returns {string} - JWT token
 */
export function generateToken(secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30天过期
    };

    // Base64URL 编码
    const base64UrlEncode = (obj) => {
        return btoa(JSON.stringify(obj))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // 使用 Web Crypto API 生成签名
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    ).then(key => {
        return crypto.subtle.sign(
            'HMAC',
            key,
            new TextEncoder().encode(signatureInput)
        );
    }).then(signature => {
        const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
        return `${signatureInput}.${base64Signature}`;
    });
}

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @param {string} secret - 签名密钥
 * @returns {Promise<boolean>} - 是否有效
 */
export async function verifyToken(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        const signatureInput = `${encodedHeader}.${encodedPayload}`;

        // 验证签名
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // 将 base64url 签名转换回 ArrayBuffer
        const signature = Uint8Array.from(
            atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
            c => c.charCodeAt(0)
        );

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            signature,
            new TextEncoder().encode(signatureInput)
        );

        if (!isValid) return false;

        // 检查过期时间
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return false; // token 已过期
        }

        return true;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

/**
 * 认证中间件 - 保护 API 端点
 * @param {Request} request - 请求对象
 * @param {Object} env - 环境变量
 * @returns {Response|null} - 如果认证失败返回 401，成功返回 null
 */
export async function requireAuth(request, env) {
    // 获取 Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
            error: 'Unauthorized',
            message: '缺少认证令牌'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const token = authHeader.substring(7); // 去掉 "Bearer " 前缀
    const secret = env.AUTH_TOKEN_SECRET;

    if (!secret) {
        console.error('AUTH_TOKEN_SECRET not configured');
        return new Response(JSON.stringify({
            error: 'Server Error',
            message: '服务器认证配置错误'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const isValid = await verifyToken(token, secret);

    if (!isValid) {
        return new Response(JSON.stringify({
            error: 'Unauthorized',
            message: '认证令牌无效或已过期'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return null; // 认证成功
}
