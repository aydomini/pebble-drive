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
