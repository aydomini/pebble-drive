-- 数据库迁移脚本：升级 shares 表以支持高级分享功能
-- 适用于 2025-10-02 之前部署的项目
--
-- 此脚本会：
-- 1. 创建新的 shares 表（包含所有必需列）
-- 2. 迁移旧数据
-- 3. 删除旧表并重命名新表
-- 4. 重建索引
--
-- 使用方法：
--   wrangler d1 execute pebble-drive-db --file=./migrations/migrate_shares.sql --remote

-- 1. 创建新表结构
CREATE TABLE shares_new (
    token TEXT PRIMARY KEY,
    fileId TEXT NOT NULL,
    password TEXT,
    downloadLimit INTEGER,
    downloadCount INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    expiresAt TEXT,
    FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
);

-- 2. 迁移旧数据（兼容新旧表结构）
INSERT INTO shares_new (token, fileId, createdAt, expiresAt, password, downloadLimit, downloadCount)
SELECT
    token,
    fileId,
    createdAt,
    CASE WHEN expiresAt = '' THEN NULL ELSE expiresAt END as expiresAt,
    NULL as password,
    NULL as downloadLimit,
    0 as downloadCount
FROM shares;

-- 3. 删除旧表
DROP TABLE shares;

-- 4. 重命名新表
ALTER TABLE shares_new RENAME TO shares;

-- 5. 重建索引
CREATE INDEX IF NOT EXISTS idx_shares_fileId ON shares(fileId);
CREATE INDEX IF NOT EXISTS idx_shares_expiresAt ON shares(expiresAt);
