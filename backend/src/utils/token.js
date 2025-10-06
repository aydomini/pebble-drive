/**
 * 生成分享令牌（使用加密安全的随机数）
 */
export function generateShareToken(fileId) {
    // 使用 Web Crypto API 生成加密安全的随机 token
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // 转换为十六进制字符串
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // 返回 16 个字符的 token
    return token.substring(0, 16);
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
