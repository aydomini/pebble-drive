/**
 * 防缓存中间件
 *
 * 迁移自 Pages Functions（share/download 代理）
 * 功能：
 * - 时间戳重定向（_t 参数）
 * - 动态时间窗口（移动端/弱网优化）
 * - 时钟偏差容忍
 * - 强制 no-cache 头
 */

/**
 * 检测设备类型和网络状况
 */
function getDeviceInfo(request) {
    const ua = request.headers.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // 检测网络状况（通过 Save-Data 和 Downlink 头）
    const saveData = request.headers.get('Save-Data') === 'on';
    const downlink = request.headers.get('Downlink');
    const isSlowNetwork = saveData || (downlink && parseFloat(downlink) < 1.0);

    return { isMobile, isSlowNetwork };
}

/**
 * 获取动态时间窗口（毫秒）
 * - 桌面端快速网络：1000ms（1秒）
 * - 移动端正常网络：3000ms（3秒）
 * - 移动端弱网：5000ms（5秒）
 */
function getTimeWindow(isMobile, isSlowNetwork) {
    if (isSlowNetwork) return 5000;  // 弱网：5秒
    if (isMobile) return 3000;       // 移动端：3秒
    return 1000;                     // 桌面端：1秒
}

/**
 * 防缓存中间件
 *
 * @param {Request} request - 原始请求
 * @returns {Response|null} - 如果需要重定向则返回 Response，否则返回 null
 */
export function cacheBustingMiddleware(request) {
    // 只对 GET 请求检查时间戳（防止 GET 缓存）
    // POST 请求不检查（允许用户在密码页面停留任意时长）
    if (request.method !== 'GET') {
        return null;
    }

    const url = new URL(request.url);
    const currentTimestamp = url.searchParams.get('_t');

    // 如果没有时间戳，添加并重定向
    if (!currentTimestamp) {
        url.searchParams.set('_t', Date.now().toString());
        return new Response(null, {
            status: 307,
            headers: {
                'Location': url.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Vary': 'User-Agent, Save-Data'
            }
        });
    }

    // 性能优化：只解析一次设备信息
    const { isMobile, isSlowNetwork } = getDeviceInfo(request);
    const timeWindow = getTimeWindow(isMobile, isSlowNetwork);

    // 时钟偏差容忍：使用绝对值处理时钟不同步（快/慢都能处理）
    const now = Date.now();
    const timestamp = parseInt(currentTimestamp);
    const timestampAge = Math.abs(now - timestamp);

    // 防御异常值：如果时间戳偏差超过1小时，视为无效（可能是恶意构造）
    const MAX_AGE = 3600000; // 1小时
    if (timestampAge > MAX_AGE) {
        console.warn(`[Cache Busting] 异常时间戳：偏差 ${timestampAge}ms，强制更新`);
        url.searchParams.set('_t', now.toString());
        return new Response(null, {
            status: 307,
            headers: {
                'Location': url.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Vary': 'User-Agent, Save-Data'
            }
        });
    }

    // 检查时间戳是否过旧（动态时间窗口）
    if (timestampAge > timeWindow) {
        console.log(`[Cache Busting] GET请求时间戳过旧：${timestampAge}ms > ${timeWindow}ms（${isMobile ? '移动端' : '桌面端'}${isSlowNetwork ? '，弱网' : ''}）`);
        url.searchParams.set('_t', now.toString());
        return new Response(null, {
            status: 307,
            headers: {
                'Location': url.toString(),
                'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Vary': 'User-Agent, Save-Data'
            }
        });
    }

    // 时间戳有效，继续处理请求
    return null;
}

/**
 * 为响应添加强制防缓存头
 *
 * @param {Response} response - 原始响应
 * @returns {Response} - 添加了防缓存头的新响应
 */
export function addNoCacheHeaders(response) {
    const newHeaders = new Headers(response.headers);

    // 强制禁用缓存
    newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    newHeaders.set('Pragma', 'no-cache');
    newHeaders.set('Expires', '0');
    newHeaders.set('X-Proxy-Time', Date.now().toString());

    // 性能优化：Vary头防止CDN为不同设备/网络返回错误缓存
    newHeaders.set('Vary', 'User-Agent, Save-Data');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}
