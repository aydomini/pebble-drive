/**
 * 配置信息处理器
 * 向前端提供上传限制配置信息（公开 API，无需认证）
 */
import { getValidatedConfig } from '../services/config.js';

/**
 * 获取上传限制配置
 * GET /api/config/limits
 */
export async function handleConfigLimits(request, env) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({
            error: 'Method not allowed'
        }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        // 获取验证后的配置
        const config = getValidatedConfig(env);

        // 返回前端需要的配置信息
        const response = {
            maxFileSizeMB: config.maxFileSizeMB,
            maxFileSizeBytes: config.maxFileSizeBytes,
            storageQuotaGB: config.storageQuotaGB,
            storageQuotaBytes: config.storageQuotaBytes,
            blockedExtensions: config.blockedExtensions,
            uploadRateLimit: config.uploadRateLimit,
            uploadRateWindow: config.uploadRateWindow,
            uploadRateWindowMinutes: Math.floor(config.uploadRateWindow / 60),
            // 友好的提示信息
            hints: {
                maxFileSize: `最大文件大小：${config.maxFileSizeMB}MB`,
                blockedTypes: `禁止上传：${config.blockedExtensions.join(', ')}`,
                rateLimit: `上传限制：${config.uploadRateLimit} 次/${Math.floor(config.uploadRateWindow / 60)} 分钟`
            }
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300' // 缓存 5 分钟
            }
        });

    } catch (error) {
        console.error('获取配置失败：', error);
        return new Response(JSON.stringify({
            error: '获取配置失败',
            message: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
