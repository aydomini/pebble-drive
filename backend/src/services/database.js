/**
 * 数据库服务 - D1 操作封装
 */

/**
 * 初始化数据库表
 */
export async function initDatabase(env) {
    try {
        await env.DB.prepare('SELECT COUNT(*) FROM files').first();
    } catch (tableError) {
        console.log('Database table not found, creating schema...');

        // 创建 files 表
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS files (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                size INTEGER NOT NULL,
                type TEXT NOT NULL,
                uploadDate TEXT NOT NULL,
                downloadUrl TEXT NOT NULL
            )
        `).run();

        // 创建 shares 表
        await env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS shares (
                token TEXT PRIMARY KEY,
                fileId TEXT NOT NULL,
                password TEXT,
                downloadLimit INTEGER,
                downloadCount INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                expiresAt TEXT,
                FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
            )
        `).run();

        console.log('Database tables created successfully');
    }
}

/**
 * 保存文件元数据
 */
export async function saveFileMetadata(env, metadata) {
    await env.DB.prepare(`
        INSERT INTO files (id, name, size, type, uploadDate, downloadUrl)
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
        metadata.id,
        metadata.name,
        metadata.size,
        metadata.type,
        metadata.uploadDate,
        metadata.downloadUrl
    ).run();
}

/**
 * 获取所有文件
 */
export async function getAllFiles(env) {
    const { results } = await env.DB.prepare(`
        SELECT id, name, size, type, uploadDate, downloadUrl
        FROM files
        ORDER BY uploadDate DESC
    `).all();

    return results || [];
}

/**
 * 根据ID获取文件
 */
export async function getFileById(env, fileId) {
    return await env.DB.prepare(`
        SELECT * FROM files WHERE id = ?
    `).bind(fileId).first();
}

/**
 * 删除文件元数据
 */
export async function deleteFileMetadata(env, fileId) {
    await env.DB.prepare('DELETE FROM files WHERE id = ?').bind(fileId).run();
}

/**
 * 创建分享记录
 */
export async function createShareRecord(env, shareData) {
    await env.DB.prepare(`
        INSERT INTO shares (token, fileId, password, downloadLimit, downloadCount, createdAt, expiresAt)
        VALUES (?, ?, ?, ?, 0, ?, ?)
    `).bind(
        shareData.token,
        shareData.fileId,
        shareData.password || null,
        shareData.downloadLimit || null,
        shareData.createdAt,
        shareData.expiresAt
    ).run();
}

/**
 * 获取分享记录
 */
export async function getShareRecord(env, token) {
    return await env.DB.prepare(`
        SELECT * FROM shares WHERE token = ?
    `).bind(token).first();
}

/**
 * 更新下载计数
 */
export async function incrementDownloadCount(env, token) {
    await env.DB.prepare(`
        UPDATE shares SET downloadCount = downloadCount + 1 WHERE token = ?
    `).bind(token).run();
}
