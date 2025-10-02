/**
 * 分享处理器
 */
import { generateShareToken } from '../utils/token.js';
import { createShareRecord, getShareRecord, incrementDownloadCount } from '../services/database.js';
import { getFileById } from '../services/database.js';
import { getFromR2 } from '../services/r2.js';
import { createErrorResponse } from '../middleware/error.js';

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

        const baseUrl = request.url.replace('/api/share', '');
        const shareUrl = baseUrl + '/share/' + shareToken;

        // 计算过期时间
        let expiresAt = null;
        if (expiry && expiry > 0) {
            expiresAt = new Date(Date.now() + expiry * 1000).toISOString();
        }

        // 保存分享信息到 D1
        await createShareRecord(env, {
            token: shareToken,
            fileId: fileId,
            password: password || null,
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
                try {
                    const body = await request.json();
                    const inputPassword = body.password;

                    // 验证密码
                    if (inputPassword !== share.password) {
                        return new Response(JSON.stringify({ error: '密码错误' }), {
                            status: 401,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }

                    // 密码正确，继续下载流程（不要 return，让代码继续执行）
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <i class="fas fa-lock text-blue-600 text-2xl"></i>
                </div>
                <h1 class="text-2xl font-bold text-gray-900">此文件受密码保护</h1>
                <p class="text-gray-600 mt-2">请输入访问密码以查看文件</p>
            </div>

            <form id="passwordForm" class="space-y-4">
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        访问密码
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="请输入密码"
                        required
                        autofocus
                    >
                </div>

                <button
                    type="submit"
                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    <i class="fas fa-unlock mr-2"></i>验证并访问
                </button>

                <div id="error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    <span id="errorMessage">密码错误，请重试</span>
                </div>
            </form>

            <div class="mt-6 text-center text-sm text-gray-500">
                <i class="fas fa-shield-alt mr-1"></i>
                由 PebbleDrive 提供安全保护
            </div>
        </div>
    </div>

    <script>
        document.getElementById('passwordForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');
            const submitBtn = e.target.querySelector('button[type="submit"]');

            // 显示加载状态
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>验证中...';
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
                            filename = matches[1];
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
                    submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i>下载成功！';
                    submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    submitBtn.classList.add('bg-green-600');
                } else {
                    // 密码错误
                    throw new Error('密码错误');
                }
            } catch (error) {
                errorDiv.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-unlock mr-2"></i>验证并访问';
            }
        });
    </script>
</body>
</html>`;
}
