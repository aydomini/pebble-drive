/**
 * 数据库自动初始化
 * 在 Worker 首次启动时自动创建表结构
 */

// 数据库 schema（与 migrations/schema.sql 保持一致）
const SCHEMA = `
-- Files table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    uploadDate TEXT NOT NULL,
    downloadUrl TEXT NOT NULL
);

-- Shares table
CREATE TABLE IF NOT EXISTS shares (
    token TEXT PRIMARY KEY,
    fileId TEXT NOT NULL,
    password TEXT,
    downloadLimit INTEGER,
    downloadCount INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    expiresAt TEXT,
    FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_files_uploadDate ON files(uploadDate DESC);
CREATE INDEX IF NOT EXISTS idx_shares_fileId ON shares(fileId);
CREATE INDEX IF NOT EXISTS idx_shares_expiresAt ON shares(expiresAt);
`;

// 初始化状态（内存缓存，避免重复检查）
let isInitialized = false;

/**
 * 确保数据库已初始化
 * @param {Object} env - Cloudflare Workers 环境对象
 */
export async function ensureDatabase(env) {
    // 如果已初始化，跳过
    if (isInitialized) {
        return;
    }

    try {
        // 检查 files 表是否存在
        await env.DB.prepare('SELECT 1 FROM files LIMIT 1').first();

        // 表存在，标记为已初始化
        isInitialized = true;
        console.log('✅ Database already initialized');
    } catch (error) {
        // 表不存在，自动初始化
        console.log('📦 Initializing database...');

        try {
            // 执行 schema（D1 支持批量执行）
            const statements = SCHEMA
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0)
                .map(s => env.DB.prepare(s));

            await env.DB.batch(statements);

            isInitialized = true;
            console.log('✅ Database initialized successfully');
        } catch (initError) {
            console.error('❌ Database initialization failed:', initError);
            // 不抛出错误，让后续请求重试
        }
    }
}
