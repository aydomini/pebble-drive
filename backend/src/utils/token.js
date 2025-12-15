/**
 * 生成分享令牌（6位Base62格式）
 * Base62: 0-9, a-z, A-Z（62个字符）
 * 6位可以表示 62^6 = 56,800,235,584 种组合
 */
export function generateShareToken(fileId) {
    // Base62 字符集
    const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // 使用 Web Crypto API 生成加密安全的随机数
    const array = new Uint8Array(6);
    crypto.getRandomValues(array);

    // 将随机字节转换为 Base62 字符
    let token = '';
    for (let i = 0; i < 6; i++) {
        // 使用模运算将字节映射到 Base62 字符集
        token += BASE62_CHARS[array[i] % 62];
    }

    return token;
}

/**
 * 使用 SHA-256 哈希密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} - 哈希后的密码（十六进制字符串）
 */
export async function hashPassword(password) {
    if (!password) return null;

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
