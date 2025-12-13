/**
 * 配置管理服务
 * 负责读取、验证和管理上传限制配置
 */

/**
 * 默认配置值
 * 即使环境变量未设置，也会使用这些默认值保证系统安全
 */
const DEFAULT_CONFIG = {
    MAX_FILE_SIZE_MB: 100,           // 单文件最大 100MB
    STORAGE_QUOTA_GB: 10,            // 总存储配额 10GB
    BLOCKED_EXTENSIONS: '.exe,.sh,.bat,.cmd,.com,.scr,.msi,.dll,.vbs,.ps1', // 危险文件类型
    UPLOAD_RATE_LIMIT: 50,           // 每小时最多 50 次上传
    UPLOAD_RATE_WINDOW: 3600,        // 速率限制窗口（秒）
};

/**
 * 获取上传限制配置
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Object} 完整的配置对象
 */
export function getUploadConfig(env) {
    const config = {
        maxFileSizeMB: parseInt(env.MAX_FILE_SIZE_MB || DEFAULT_CONFIG.MAX_FILE_SIZE_MB),
        maxFileSizeBytes: 0, // 将在下面计算
        storageQuotaGB: parseInt(env.STORAGE_QUOTA_GB || DEFAULT_CONFIG.STORAGE_QUOTA_GB),
        storageQuotaBytes: 0, // 将在下面计算
        blockedExtensions: parseExtensions(env.BLOCKED_EXTENSIONS || DEFAULT_CONFIG.BLOCKED_EXTENSIONS),
        uploadRateLimit: parseInt(env.UPLOAD_RATE_LIMIT || DEFAULT_CONFIG.UPLOAD_RATE_LIMIT),
        uploadRateWindow: parseInt(env.UPLOAD_RATE_WINDOW || DEFAULT_CONFIG.UPLOAD_RATE_WINDOW),
    };

    // 计算字节值
    config.maxFileSizeBytes = config.maxFileSizeMB * 1024 * 1024;
    config.storageQuotaBytes = config.storageQuotaGB * 1024 * 1024 * 1024;

    return config;
}

/**
 * 解析文件扩展名列表
 * @param {string} extensionsStr - 逗号分隔的扩展名字符串
 * @returns {Array} 扩展名数组（小写，带点）
 */
function parseExtensions(extensionsStr) {
    return extensionsStr
        .split(',')
        .map(ext => {
            ext = ext.trim().toLowerCase();
            // 确保扩展名以点开头
            return ext.startsWith('.') ? ext : '.' + ext;
        })
        .filter(ext => ext.length > 1); // 过滤空值
}

/**
 * 验证配置合法性
 * @param {Object} config - 配置对象
 * @throws {Error} 配置非法时抛出错误
 */
export function validateConfig(config) {
    const errors = [];

    // 验证文件大小限制
    if (config.maxFileSizeMB <= 0) {
        errors.push('MAX_FILE_SIZE_MB 必须大于 0');
    }
    if (config.maxFileSizeMB > 5000) {
        errors.push('MAX_FILE_SIZE_MB 不能超过 5000MB（5GB）');
    }

    // 验证存储配额
    if (config.storageQuotaGB <= 0) {
        errors.push('STORAGE_QUOTA_GB 必须大于 0');
    }
    if (config.storageQuotaGB > 10000) {
        errors.push('STORAGE_QUOTA_GB 不能超过 10000GB（10TB）');
    }

    // 验证速率限制
    if (config.uploadRateLimit <= 0) {
        errors.push('UPLOAD_RATE_LIMIT 必须大于 0');
    }
    if (config.uploadRateLimit > 10000) {
        errors.push('UPLOAD_RATE_LIMIT 不能超过 10000');
    }

    // 验证速率窗口
    if (config.uploadRateWindow <= 0) {
        errors.push('UPLOAD_RATE_WINDOW 必须大于 0');
    }
    if (config.uploadRateWindow > 86400) {
        errors.push('UPLOAD_RATE_WINDOW 不能超过 86400 秒（24小时）');
    }

    // 验证文件扩展名格式
    if (!Array.isArray(config.blockedExtensions)) {
        errors.push('BLOCKED_EXTENSIONS 格式错误');
    }

    if (errors.length > 0) {
        throw new Error('配置验证失败：\n' + errors.join('\n'));
    }
}

/**
 * 获取并验证配置（统一入口）
 * @param {Object} env - Cloudflare Workers 环境变量
 * @returns {Object} 验证后的配置对象
 */
export function getValidatedConfig(env) {
    try {
        const config = getUploadConfig(env);
        validateConfig(config);
        return config;
    } catch (error) {
        console.error('配置错误：', error.message);

        // 智能回退：超出限制的值自动调整到最大允许值
        const config = getUploadConfig(env);

        // 修正超出限制的文件大小（最大 5GB = Cloudflare R2 限制）
        if (config.maxFileSizeMB > 5000) {
            console.warn(`MAX_FILE_SIZE_MB (${config.maxFileSizeMB}MB) 超过限制，已调整为 5000MB (5GB)`);
            config.maxFileSizeMB = 5000;
            config.maxFileSizeBytes = 5000 * 1024 * 1024;
        } else if (config.maxFileSizeMB <= 0) {
            config.maxFileSizeMB = DEFAULT_CONFIG.MAX_FILE_SIZE_MB;
            config.maxFileSizeBytes = config.maxFileSizeMB * 1024 * 1024;
        }

        // 修正超出限制的存储配额（最大 10TB）
        if (config.storageQuotaGB > 10000) {
            console.warn(`STORAGE_QUOTA_GB (${config.storageQuotaGB}GB) 超过限制，已调整为 10000GB (10TB)`);
            config.storageQuotaGB = 10000;
            config.storageQuotaBytes = 10000 * 1024 * 1024 * 1024;
        } else if (config.storageQuotaGB <= 0) {
            config.storageQuotaGB = DEFAULT_CONFIG.STORAGE_QUOTA_GB;
            config.storageQuotaBytes = config.storageQuotaGB * 1024 * 1024 * 1024;
        }

        // 修正速率限制
        if (config.uploadRateLimit > 10000 || config.uploadRateLimit <= 0) {
            config.uploadRateLimit = DEFAULT_CONFIG.UPLOAD_RATE_LIMIT;
        }
        if (config.uploadRateWindow > 86400 || config.uploadRateWindow <= 0) {
            config.uploadRateWindow = DEFAULT_CONFIG.UPLOAD_RATE_WINDOW;
        }

        console.warn('已应用修正后的配置');
        return config;
    }
}

/**
 * 检查文件大小是否超过限制
 * @param {number} fileSize - 文件大小（字节）
 * @param {Object} config - 配置对象
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateFileSize(fileSize, config) {
    if (fileSize > config.maxFileSizeBytes) {
        return {
            valid: false,
            error: `文件大小超过限制（最大 ${config.maxFileSizeMB}MB）`,
            details: {
                fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
                maxSizeMB: config.maxFileSizeMB
            }
        };
    }
    return { valid: true };
}

/**
 * 检查文件类型是否被禁止
 * @param {string} fileName - 文件名
 * @param {Object} config - 配置对象
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateFileType(fileName, config) {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.')).toLowerCase();

    if (config.blockedExtensions.includes(extension)) {
        return {
            valid: false,
            error: `此文件类型（${extension}）不允许上传`,
            details: {
                extension: extension,
                blockedExtensions: config.blockedExtensions
            }
        };
    }

    return { valid: true };
}
