/**
 * 分享处理器
 */
import { generateShareToken, hashPassword } from '../utils/token.js';
import { createShareRecord, getShareRecord, incrementDownloadCount } from '../services/database.js';
import { getFileById } from '../services/database.js';
import { getFromR2 } from '../services/r2.js';
import { createErrorResponse } from '../middleware/error.js';
import { isRateLimited, recordFailedAttempt, resetRateLimit, getClientIP } from '../utils/ratelimit.js';

/**
 * 生成分享链接
 */
export async function handleShare(request, env) {
    if (request.method !== 'POST') {
        return createErrorResponse('Method not allowed', 405);
    }

    try {
        const { fileId, password, expiry, downloadLimit } = await request.json();

        if (!fileId) {
            return createErrorResponse('File ID required', 400);
        }

        // 生成唯一的分享令牌（最多尝试 10 次）
        let shareToken;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            shareToken = generateShareToken(fileId);
            const existing = await getShareRecord(env, shareToken);
            if (!existing) {
                break; // Token 是唯一的
            }
            attempts++;
        }

        if (attempts >= maxAttempts) {
            return createErrorResponse('Failed to generate unique share token', 500);
        }

        // 使用自定义域名（如果配置）或当前请求 URL
        const customDomain = env.SHARE_DOMAIN;
        const baseUrl = customDomain || request.url.replace('/api/share', '');
        const shareUrl = baseUrl + '/share/' + shareToken;

        // 计算过期时间
        let expiresAt = null;
        if (expiry && expiry > 0) {
            expiresAt = new Date(Date.now() + expiry * 1000).toISOString();
        }

        // 哈希密码（如果提供）
        const hashedPassword = await hashPassword(password);

        // 保存分享信息到 D1
        await createShareRecord(env, {
            token: shareToken,
            fileId: fileId,
            password: hashedPassword,
            downloadLimit: downloadLimit || null,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt
        });

        return new Response(JSON.stringify({ shareUrl }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Share error:', error);
        return createErrorResponse(error.message, 500);
    }
}

/**
 * 处理分享访问
 */
export async function handleShareAccess(request, env, shareToken) {
    try {
        // 查找分享记录
        const share = await getShareRecord(env, shareToken);

        if (!share) {
            return new Response('分享链接不存在或已过期', { status: 404 });
        }

        // 检查是否过期
        if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
            return new Response('分享链接已过期', { status: 410 });
        }

        // 检查下载次数限制
        if (share.downloadLimit && share.downloadCount >= share.downloadLimit) {
            return new Response('下载次数已达上限', { status: 403 });
        }

        // 如果有密码保护
        if (share.password) {
            // GET 请求：显示密码输入页面
            if (request.method === 'GET') {
                return new Response(getPasswordPage(shareToken), {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            }

            // POST 请求：验证密码
            if (request.method === 'POST') {
                // 获取客户端 IP
                const clientIP = getClientIP(request);

                // 检查速率限制
                const limited = await isRateLimited(env, shareToken, clientIP);
                if (limited) {
                    return new Response(JSON.stringify({ error: '尝试次数过多，请1小时后再试' }), {
                        status: 429,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                try {
                    const body = await request.json();
                    const inputPassword = body.password;

                    // 哈希输入的密码并与存储的哈希值比较
                    const inputHash = await hashPassword(inputPassword);
                    if (inputHash !== share.password) {
                        // 记录失败尝试
                        const attempts = await recordFailedAttempt(env, shareToken, clientIP);
                        const maxAttempts = 5;
                        const remaining = Math.max(0, maxAttempts - attempts);

                        return new Response(JSON.stringify({
                            error: '密码错误',
                            attempts: attempts,
                            remaining: remaining,
                            maxAttempts: maxAttempts
                        }), {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    // 密码正确，重置速率限制
                    await resetRateLimit(env, shareToken, clientIP);

                    // 继续下载流程（不要 return，让代码继续执行）
                } catch (error) {
                    return new Response(JSON.stringify({ error: '请求格式错误' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        // 增加下载次数
        await incrementDownloadCount(env, shareToken);

        // 获取文件信息
        const file = await getFileById(env, share.fileId);

        if (!file) {
            return new Response('文件不存在', { status: 404 });
        }

        // 从 R2 获取文件
        const r2File = await getFromR2(env, file.id);

        const headers = new Headers();
        headers.set('Content-Type', r2File.httpMetadata?.contentType || 'application/octet-stream');
        headers.set('Content-Length', r2File.size.toString());
        headers.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(file.name) + '"');
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(r2File.body, { headers });

    } catch (error) {
        console.error('Share access error:', error);
        return new Response('访问失败', { status: 500 });
    }
}

function getPasswordPage(shareToken) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>密码保护 - PebbleDrive</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        // 主题管理
        function getTheme() {
            const saved = localStorage.getItem('pebbledrive_theme');
            if (saved) return saved;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        }

        function applyTheme(theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        // 语言管理
        const i18n = {
            zh: {
                title: '此文件受密码保护',
                subtitle: '请输入访问密码以查看文件',
                passwordLabel: '访问密码',
                passwordPlaceholder: '请输入密码',
                submitButton: '验证并访问',
                verifying: '验证中...',
                downloadSuccess: '下载成功！',
                errorMessage: '密码错误',
                errorWithRemaining: '密码错误，剩余 {remaining} 次尝试机会',
                rateLimitError: '尝试次数过多，请1小时后再试',
                poweredBy: '由 PebbleDrive 提供安全保护'
            },
            en: {
                title: 'This file is password protected',
                subtitle: 'Please enter the access password to view the file',
                passwordLabel: 'Access Password',
                passwordPlaceholder: 'Enter password',
                submitButton: 'Verify and Access',
                verifying: 'Verifying...',
                downloadSuccess: 'Download successful!',
                errorMessage: 'Incorrect password',
                errorWithRemaining: 'Incorrect password. {remaining} attempts remaining',
                rateLimitError: 'Too many attempts. Please try again in 1 hour',
                poweredBy: 'Secured by PebbleDrive'
            }
        };

        function getLang() {
            const saved = localStorage.getItem('pebbledrive_lang');
            if (saved) return saved;
            const browserLang = navigator.language.toLowerCase();
            return browserLang.startsWith('zh') ? 'zh' : 'en';
        }

        function t(key) {
            const lang = getLang();
            return i18n[lang][key] || i18n.en[key];
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            applyTheme(getTheme());

            // 更新文本
            document.title = t('title') + ' - PebbleDrive';
            document.getElementById('pageTitle').textContent = t('title');
            document.getElementById('pageSubtitle').textContent = t('subtitle');
            document.getElementById('passwordLabel').textContent = t('passwordLabel');
            document.getElementById('passwordInput').placeholder = t('passwordPlaceholder');
            document.getElementById('submitBtnText').innerHTML = '<i class="fas fa-unlock mr-2"></i>' + t('submitButton');
            document.getElementById('errorMessage').textContent = t('errorMessage');
            document.getElementById('poweredBy').innerHTML = '<i class="fas fa-shield-alt mr-1"></i>' + t('poweredBy');
        });
    </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4 transition-colors duration-200">
    <div class="max-w-md w-full">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors duration-200">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 transition-colors duration-200">
                    <i class="fas fa-lock text-blue-600 dark:text-blue-400 text-2xl"></i>
                </div>
                <h1 id="pageTitle" class="text-2xl font-bold text-gray-900 dark:text-gray-100">此文件受密码保护</h1>
                <p id="pageSubtitle" class="text-gray-600 dark:text-gray-400 mt-2">请输入访问密码以查看文件</p>
            </div>

            <form id="passwordForm" class="space-y-4">
                <div>
                    <label id="passwordLabel" for="passwordInput" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        访问密码
                    </label>
                    <input
                        type="password"
                        id="passwordInput"
                        name="password"
                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
                        placeholder="请输入密码"
                        required
                        autofocus
                    >
                </div>

                <button
                    type="submit"
                    id="submitBtn"
                    class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
                >
                    <span id="submitBtnText"><i class="fas fa-unlock mr-2"></i>验证并访问</span>
                </button>

                <div id="error" class="hidden bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm transition-colors duration-200">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorMessage">密码错误，请重试</span>
                </div>
            </form>

            <div id="poweredBy" class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <i class="fas fa-shield-alt mr-1"></i>
                由 PebbleDrive 提供安全保护
            </div>
        </div>
    </div>

    <script>
        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('passwordInput').value;
            const errorDiv = document.getElementById('error');
            const submitBtn = document.getElementById('submitBtn');
            const submitBtnText = document.getElementById('submitBtnText');

            // 显示加载状态
            submitBtn.disabled = true;
            submitBtnText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + t('verifying');
            errorDiv.classList.add('hidden');

            try {
                // 调用后端验证密码
                const response = await fetch(window.location.href, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    // 密码正确，下载文件
                    const blob = await response.blob();
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = 'download';

                    if (contentDisposition) {
                        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
                        if (matches && matches[1]) {
                            // 解码URL编码的文件名
                            try {
                                filename = decodeURIComponent(matches[1]);
                            } catch (e) {
                                filename = matches[1]; // 解码失败则使用原始值
                            }
                        }
                    }

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    // 显示成功消息
                    submitBtnText.innerHTML = '<i class="fas fa-check mr-2"></i>' + t('downloadSuccess');
                    submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'dark:bg-blue-700', 'dark:hover:bg-blue-600');
                    submitBtn.classList.add('bg-green-600', 'dark:bg-green-600');
                } else {
                    // 处理不同的错误状态
                    let errorMessage = t('errorMessage');

                    if (response.status === 429) {
                        // 速率限制
                        errorMessage = t('rateLimitError');
                        submitBtn.disabled = true; // 禁用按钮
                        errorDiv.querySelector('#errorMessage').textContent = errorMessage;
                        errorDiv.classList.remove('hidden');
                    } else if (response.status === 401) {
                        // 密码错误
                        const data = await response.json().catch(() => ({}));

                        // 显示剩余次数
                        if (data.remaining !== undefined && data.remaining > 0) {
                            errorMessage = t('errorWithRemaining').replace('{remaining}', data.remaining);
                        } else if (data.remaining === 0) {
                            errorMessage = t('rateLimitError');
                            submitBtn.disabled = true;
                        } else {
                            errorMessage = data.error || t('errorMessage');
                        }

                        errorDiv.querySelector('#errorMessage').textContent = errorMessage;
                        errorDiv.classList.remove('hidden');

                        if (data.remaining > 0) {
                            submitBtn.disabled = false;
                            submitBtnText.innerHTML = '<i class="fas fa-unlock mr-2"></i>' + t('submitButton');
                        }
                    } else {
                        // 其他错误
                        throw new Error('Request failed');
                    }
                }
            } catch (error) {
                errorDiv.querySelector('#errorMessage').textContent = t('errorMessage');
                errorDiv.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtnText.innerHTML = '<i class="fas fa-unlock mr-2"></i>' + t('submitButton');
            }
        });
    </script>
</body>
</html>`;
}
