/**
 * 生成分享令牌
 */
export function generateShareToken(fileId) {
    // 使用更强的随机性：时间戳 + 多个随机数
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    const data = timestamp + random1 + random2 + fileId;
    // 使用更长的 token 并取中间部分以增加随机性
    const encoded = btoa(data).replace(/[+/=]/g, '');
    const start = Math.floor(Math.random() * (encoded.length - 16));
    return encoded.substring(start, start + 16);
}
