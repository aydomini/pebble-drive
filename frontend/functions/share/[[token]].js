/**
 * 分享页面代理 - Cloudflare Pages Functions
 *
 * 功能：转发所有 /share/* 请求到真实后端
 *
 * [[token]] 是动态路由语法，匹配分享 Token：
 * - /share/Ab3x9K → your-backend.workers.dev/share/Ab3x9K
 *
 * 安全说明：
 * - BACKEND_URL 通过环境变量配置
 * - 完全隐藏后端 API 地址
 *
 * 性能优化：
 * - 移动端动态时间窗口（适应弱网）
 * - 时钟偏差容忍（支持时间不同步设备）
 * - Vary头优化（防止CDN缓存混乱）
 */

/**
 * 检测设备类型和网络状况（性能优化：只解析一次）
 */
function getDeviceInfo(request) {
    const ua = request.headers.get('User-Agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // 检测网络状况（通过 Save-Data 和 Downlink 头）
    const saveData = request.headers.get('Save-Data') === 'on';
    const downlink = request.headers.get('Downlink'); // 单位：Mbps
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

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // **Cache Busting 策略：使用时间戳参数绕过缓存**
    // 🔴 关键优化：只对GET请求检查时间戳（防止GET缓存）
    // POST请求不检查时间戳（允许用户停留任意时长）
    if (request.method === 'GET') {
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
                    'Vary': 'User-Agent, Save-Data'  // 防止CDN为不同设备返回相同缓存
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
            console.warn(`[Share Proxy] 异常时间戳：偏差 ${timestampAge}ms，强制更新`);
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
            console.log(`[Share Proxy] GET请求时间戳过旧：${timestampAge}ms > ${timeWindow}ms（${isMobile ? '移动端' : '桌面端'}${isSlowNetwork ? '，弱网' : ''}）`);
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
    }
    // POST/其他请求：不检查时间戳，直接代理到后端
    // 用户可以在密码页面停留任意时长，不影响提交

    // 获取真实后端地址
    const backendUrl = env.BACKEND_URL;

    if (!backendUrl) {
        console.error('[Share Proxy] BACKEND_URL 未配置');
        return new Response('配置错误：BACKEND_URL 未设置', {
            status: 500,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }

    // 构建目标 URL（包含时间戳参数）
    const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

    console.log(`[Share Proxy] ${request.method} ${url.pathname} -> ${targetUrl}`);

    try {
        // 转发请求
        const fetchOptions = {
            method: request.method,
            headers: request.headers,
            redirect: 'manual'
        };

        if (request.method !== 'GET' && request.method !== 'HEAD') {
            fetchOptions.body = request.body;
        }

        const response = await fetch(targetUrl, fetchOptions);

        // **强制禁用缓存（关键修复！）**
        // 即使后端返回了缓存控制头，也在代理层再次加强
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
        newHeaders.set('Pragma', 'no-cache');
        newHeaders.set('Expires', '0');
        newHeaders.set('X-Proxy-Time', Date.now().toString());

        // 性能优化：Vary头防止CDN为不同设备/网络返回错误缓存
        newHeaders.set('Vary', 'User-Agent, Save-Data');

        // 返回响应
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });

    } catch (error) {
        console.error('[Share Proxy Error]', error);
        return new Response('代理请求失败，请稍后重试', {
            status: 502,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}
