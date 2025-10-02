/**
 * 存储配额处理器
 */
import { getAllFiles } from '../services/database.js';
import { getR2StorageUsage } from '../services/r2.js';

export async function handleStorageQuota(request, env) {
    try {
        // 从数据库获取文件列表
        const files = await getAllFiles(env);

        // 从 R2 获取实际存储使用情况（Cloudflare API）
        const r2Usage = await getR2StorageUsage(env);
        const totalUsed = r2Usage.totalSize;

        // 从环境变量获取软限制配额（用于前端显示和限制），如果未设置则为 Cloudflare R2 免费套餐的 10GB
        let quotaGB = null;
        let totalQuota = null;
        let usagePercentage = '0.00';
        let remainingSpace = null;

        if (env.STORAGE_QUOTA_GB) {
            quotaGB = parseInt(env.STORAGE_QUOTA_GB);
            totalQuota = quotaGB * 1024 * 1024 * 1024;
            usagePercentage = totalQuota > 0 ? ((totalUsed / totalQuota) * 100).toFixed(2) : '0.00';
            remainingSpace = totalQuota - totalUsed;
        }

        return new Response(JSON.stringify({
            totalQuota,
            totalUsed,
            quotaGB,
            usagePercentage,
            remainingSpace,
            fileCount: files.length,
            r2ObjectCount: r2Usage.objectCount,
            unlimited: quotaGB === null
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('Failed to get storage quota:', error);

        // 出错时返回默认配额10GB
        const defaultQuota = 10 * 1024 * 1024 * 1024;
        return new Response(JSON.stringify({
            totalQuota: defaultQuota,
            totalUsed: 0,
            quotaGB: 10,
            usagePercentage: '0.00',
            remainingSpace: defaultQuota,
            fileCount: 0,
            r2ObjectCount: 0,
            unlimited: false
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
