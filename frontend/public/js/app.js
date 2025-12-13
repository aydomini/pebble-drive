/**
 * 应用版本信息
 */
const APP_VERSION = '1.3.0';
const GITHUB_REPO_URL = 'https://github.com/aydomini/pebble-drive';

/**
 * DEMO 模式配置
 * 启用后，任意密码都可以登录，所有功能使用 mock 数据
 */
const DEMO_MODE = true;

/**
 * DEMO 模式的 mock 数据
 * 使用 Blob URL 来支持预览
 */
const MOCK_FILES = [
    {
        id: 'demo-1',
        name: 'README.md',
        size: 2456,
        type: 'text/markdown',
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        downloadUrl: URL.createObjectURL(new Blob([
            '# PebbleDrive Demo\n\n',
            '欢迎使用 PebbleDrive 演示模式！\n\n',
            '## 功能特性\n\n',
            '- ✅ 文件上传（拖拽/点击）\n',
            '- ✅ 文件预览（Markdown、代码、图片、PDF）\n',
            '- ✅ 文件分享（密码保护、限时、限次数）\n',
            '- ✅ 多语言支持（中/英文）\n',
            '- ✅ 深色模式\n\n',
            '## 演示说明\n\n',
            '这是一个完全在浏览器本地运行的演示版本：\n\n',
            '- 所有操作仅在内存中进行\n',
            '- 刷新页面后数据重置\n',
            '- 无需后端服务器\n\n',
            '## 开始使用\n\n',
            '1. 尝试上传文件\n',
            '2. 点击文件预览\n',
            '3. 切换语言和主题\n',
            '4. 体验分享功能\n'
        ], { type: 'text/markdown' }))
    },
    {
        id: 'demo-2',
        name: 'example.js',
        size: 5230,
        type: 'application/javascript',
        uploadDate: new Date(Date.now() - 172800000).toISOString(),
        downloadUrl: URL.createObjectURL(new Blob([
            '/**\n',
            ' * PebbleDrive Demo - 示例 JavaScript 代码\n',
            ' */\n\n',
            'class FileManager {\n',
            '    constructor() {\n',
            '        this.files = [];\n',
            '        console.log("FileManager initialized");\n',
            '    }\n\n',
            '    async uploadFile(file) {\n',
            '        console.log(`Uploading: ${file.name}`);\n',
            '        // 模拟上传逻辑\n',
            '        return {\n',
            '            id: Date.now(),\n',
            '            name: file.name,\n',
            '            size: file.size\n',
            '        };\n',
            '    }\n\n',
            '    deleteFile(id) {\n',
            '        this.files = this.files.filter(f => f.id !== id);\n',
            '        console.log(`File ${id} deleted`);\n',
            '    }\n',
            '}\n\n',
            'export default FileManager;\n'
        ], { type: 'application/javascript' }))
    },
    {
        id: 'demo-3',
        name: 'demo-image.png',
        size: 125678,
        type: 'image/png',
        uploadDate: new Date(Date.now() - 259200000).toISOString(),
        // 1x1 透明 PNG 图片的 base64
        downloadUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
        id: 'demo-4',
        name: 'config.json',
        size: 892,
        type: 'application/json',
        uploadDate: new Date(Date.now() - 345600000).toISOString(),
        downloadUrl: URL.createObjectURL(new Blob([
            '{\n',
            '  "app": {\n',
            '    "name": "PebbleDrive",\n',
            '    "version": "1.3.0",\n',
            '    "description": "轻量级云存储"\n',
            '  },\n',
            '  "features": {\n',
            '    "upload": true,\n',
            '    "preview": true,\n',
            '    "share": true,\n',
            '    "search": true\n',
            '  },\n',
            '  "limits": {\n',
            '    "maxFileSize": "100MB",\n',
            '    "storageQuota": "10GB"\n',
            '  }\n',
            '}\n'
        ], { type: 'application/json' }))
    },
    {
        id: 'demo-5',
        name: 'styles.css',
        size: 3456,
        type: 'text/css',
        uploadDate: new Date(Date.now() - 432000000).toISOString(),
        downloadUrl: URL.createObjectURL(new Blob([
            '/**\n',
            ' * PebbleDrive Demo - 示例 CSS 样式\n',
            ' */\n\n',
            ':root {\n',
            '    --primary-color: #3b82f6;\n',
            '    --secondary-color: #8b5cf6;\n',
            '    --text-color: #1f2937;\n',
            '    --bg-color: #ffffff;\n',
            '}\n\n',
            '.container {\n',
            '    max-width: 1200px;\n',
            '    margin: 0 auto;\n',
            '    padding: 2rem;\n',
            '}\n\n',
            '.card {\n',
            '    background: var(--bg-color);\n',
            '    border-radius: 0.5rem;\n',
            '    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n',
            '    padding: 1.5rem;\n',
            '}\n\n',
            '.button-primary {\n',
            '    background: var(--primary-color);\n',
            '    color: white;\n',
            '    padding: 0.5rem 1rem;\n',
            '    border-radius: 0.375rem;\n',
            '    transition: all 0.2s;\n',
            '}\n\n',
            '.button-primary:hover {\n',
            '    background: #2563eb;\n',
            '    transform: translateY(-2px);\n',
            '}\n'
        ], { type: 'text/css' }))
    }
];

/**
 * Cloudflare Turnstile 配置
 * 启用 Turnstile 人机验证保护
 * 配置方法：见 README 安全配置章节
 *
 * 注意：Turnstile 验证为必需的安全组件
 */
window.TURNSTILE_SITE_KEY = window.VITE_TURNSTILE_SITE_KEY || ''; // 从 index.html 中注入

/**
 * 分片上传类（极简 KV 版本）
 * 支持大文件上传（最大 5GB），每个分片最大 50MB
 * KV 操作：仅 3 次（初始化 1 PUT + 完成 1 GET + 1 DELETE）
 */
class ChunkedUploader {
    constructor(file, apiEndpoint, token, i18n) {
        this.file = file;
        this.apiEndpoint = apiEndpoint;
        this.token = token;
        this.i18n = i18n; // 添加 i18n 支持
        this.CHUNK_SIZE = 50 * 1024 * 1024; // 50MB 每块
        this.totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
        this.uploadedParts = []; // 前端维护已上传的分片
        this.onProgress = null; // 进度回调
        this.canceled = false; // 取消标志
        this.currentXhr = null; // 当前的上传请求
        this.uploadId = null; // 上传会话 ID（用于中止）
        this.fileId = null; // 文件 ID（用于中止）
    }

    /**
     * 取消上传
     */
    async cancel() {
        this.canceled = true;

        // 中止当前的 XHR 请求
        if (this.currentXhr) {
            this.currentXhr.abort();
        }

        // 调用后端 API 清理 R2 和 KV 资源
        if (this.uploadId && this.fileId) {
            try {
                const response = await fetch(`${this.apiEndpoint}/upload/abort`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({
                        uploadId: this.uploadId,
                        fileId: this.fileId
                    })
                });

                if (response.ok) {
                    console.log(`[分片上传] R2 资源已清理 - uploadId: ${this.uploadId}`);
                } else {
                    console.warn(`[分片上传] 清理失败，但上传已取消 - uploadId: ${this.uploadId}`);
                }
            } catch (error) {
                console.warn(`[分片上传] 无法连接到服务器清理资源: ${error.message}`);
            }
        }
    }

    /**
     * 开始上传
     */
    async upload() {
        try {
            // 步骤1：初始化分片上传
            console.log(`[${this.i18n.t('chunkedUploadStart')}] ${this.file.name} - ${(this.file.size / 1024 / 1024).toFixed(2)}MB, ${this.totalChunks} chunks`);
            const { uploadId, fileId } = await this.initUpload();

            // 保存 uploadId 和 fileId（用于取消时中止上传）
            this.uploadId = uploadId;
            this.fileId = fileId;

            // 步骤2：上传所有分片
            for (let i = 0; i < this.totalChunks; i++) {
                // 检查是否已取消
                if (this.canceled) {
                    throw new Error(this.i18n.t('uploadCanceled') || '上传已取消');
                }

                const chunk = this.getChunk(i);
                const { etag, partNumber } = await this.uploadChunk(
                    chunk, uploadId, fileId, i + 1
                );

                // 前端维护状态（不依赖后端 KV）
                this.uploadedParts.push({ partNumber, etag });

                // 保存到 localStorage（断点续传支持）
                this.saveProgress(uploadId, fileId);

                // 更新进度
                const progress = ((i + 1) / this.totalChunks * 100).toFixed(1);
                if (this.onProgress) {
                    this.onProgress({
                        uploaded: i + 1,
                        total: this.totalChunks,
                        percent: progress
                    });
                }

                console.log(`[${this.i18n.t('chunkedUploadProgress')}] ${i + 1}/${this.totalChunks} (${progress}%)`);
            }

            // 步骤3：完成上传
            console.log(`[${this.i18n.t('chunkedUploadMerging')}]`);
            const result = await this.completeUpload(uploadId, fileId, this.uploadedParts);

            // 清理 localStorage
            this.clearProgress(uploadId);

            console.log(`[${this.i18n.t('chunkedUploadSuccess')}] ${fileId}`);
            return result;

        } catch (error) {
            console.error(`[${this.i18n.t('chunkedUploadFailed')}]`, error);
            throw error;
        }
    }

    /**
     * 获取指定索引的分片
     */
    getChunk(index) {
        const start = index * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, this.file.size);
        return this.file.slice(start, end);
    }

    /**
     * 初始化分片上传
     */
    async initUpload() {
        const response = await fetch(`${this.apiEndpoint}/upload/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({
                fileName: this.file.name,
                fileSize: this.file.size,
                fileType: this.file.type,
                totalChunks: this.totalChunks
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || this.i18n.t('chunkedInitFailed'));
        }

        return response.json();
    }

    /**
     * 上传单个分片（使用 XMLHttpRequest 以支持取消）
     */
    async uploadChunk(chunk, uploadId, fileId, partNumber) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('uploadId', uploadId);
            formData.append('fileId', fileId);
            formData.append('partNumber', partNumber);

            const xhr = new XMLHttpRequest();
            this.currentXhr = xhr; // 保存当前请求

            xhr.open('POST', `${this.apiEndpoint}/upload/chunk`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);

            xhr.onload = () => {
                this.currentXhr = null;
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(this.i18n.t('chunkedPartFailed').replace('{partNumber}', partNumber)));
                    }
                } else {
                    reject(new Error(this.i18n.t('chunkedPartFailed').replace('{partNumber}', partNumber)));
                }
            };

            xhr.onerror = () => {
                this.currentXhr = null;
                reject(new Error(this.i18n.t('chunkedPartFailed').replace('{partNumber}', partNumber)));
            };

            xhr.onabort = () => {
                this.currentXhr = null;
                reject(new Error(this.i18n.t('uploadCanceled') || '上传已取消'));
            };

            xhr.send(formData);
        });
    }

    /**
     * 完成分片上传
     */
    async completeUpload(uploadId, fileId, parts) {
        const response = await fetch(`${this.apiEndpoint}/upload/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ uploadId, fileId, parts })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || this.i18n.t('chunkedCompleteFailed'));
        }

        return response.json();
    }

    /**
     * 保存上传进度到 localStorage（断点续传）
     */
    saveProgress(uploadId, fileId) {
        try {
            localStorage.setItem(`upload:${uploadId}`, JSON.stringify({
                fileId,
                fileName: this.file.name,
                fileSize: this.file.size,
                uploadedParts: this.uploadedParts,
                lastUpdate: Date.now()
            }));
        } catch (e) {
            console.warn('无法保存上传进度:', e);
        }
    }

    /**
     * 清理上传进度
     */
    clearProgress(uploadId) {
        try {
            localStorage.removeItem(`upload:${uploadId}`);
        } catch (e) {
            console.warn('无法清理上传进度:', e);
        }
    }
}

/**
 * 主题管理类
 */
class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.applyTheme(this.theme);
        this.setupSystemThemeListener();
    }

    /**
     * 从 localStorage 获取主题，若未设置则自动检测系统主题
     */
    getTheme() {
        const savedTheme = localStorage.getItem('pebbledrive_theme');

        // 如果用户已经手动设置过主题，使用用户设置
        if (savedTheme) {
            return savedTheme;
        }

        // 否则，检测系统主题偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * 监听系统主题变化
     */
    setupSystemThemeListener() {
        if (!window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // 监听系统主题切换
        mediaQuery.addEventListener('change', (e) => {
            // 只有在用户未手动设置主题时，才自动跟随系统主题
            const savedTheme = localStorage.getItem('pebbledrive_theme');
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.theme = newTheme;
                this.applyTheme(newTheme);
                console.log(`系统主题已切换为 ${newTheme} 模式`);
            }
        });
    }

    /**
     * 保存主题到 localStorage
     */
    setTheme(theme) {
        localStorage.setItem('pebbledrive_theme', theme);
        this.theme = theme;
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            // 切换 highlight.js 主题
            document.getElementById('hljs-light')?.setAttribute('disabled', 'disabled');
            document.getElementById('hljs-dark')?.removeAttribute('disabled');
        } else {
            document.documentElement.classList.remove('dark');
            // 切换 highlight.js 主题
            document.getElementById('hljs-dark')?.setAttribute('disabled', 'disabled');
            document.getElementById('hljs-light')?.removeAttribute('disabled');
        }
        // 延迟更新图标，确保 DOM 已加载
        setTimeout(() => this.updateThemeIcon(theme), 0);
    }

    /**
     * 更新主题图标
     */
    updateThemeIcon(theme) {
        const darkIcon = document.querySelector('#themeToggle .dark-icon');
        const lightIcon = document.querySelector('#themeToggle .light-icon');

        if (darkIcon && lightIcon) {
            if (theme === 'dark') {
                darkIcon.classList.add('hidden');
                lightIcon.classList.remove('hidden');
            } else {
                darkIcon.classList.remove('hidden');
                lightIcon.classList.add('hidden');
            }
        }
    }

    /**
     * 切换主题
     */
    toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.applyTheme(newTheme);
    }
}

/**
 * 国际化管理类
 */
class I18nManager {
    constructor() {
        this.lang = this.getLang();
        this.translations = {
            zh: {
                // 登录界面
                appTitle: 'PebbleDrive',
                appSubtitle: '轻量级云存储',
                accessPassword: '访问密码',
                passwordPlaceholder: '请输入访问密码',
                loginBtn: '登录',
                loginError: '密码错误',

                // 主界面
                myFiles: '我的文件',
                upload: '上传文件',
                storageInfo: '存储详情',
                uploadArea: '点击或拖拽',
                uploadHint: '最大 100MB',
                searchPlaceholder: '搜索...',
                sortByName: '名称',
                sortBySize: '大小',
                sortByDate: '日期',

                // 文件操作
                fileName: '文件名',
                fileSize: '大小',
                uploadTime: '上传时间',
                actions: '操作',
                preview: '文件预览',
                download: '下载',
                share: '分享',
                delete: '删除',

                // 分享设置
                shareSettings: '分享设置',
                advancedShareSettings: '高级分享设置',
                enablePassword: '启用密码保护',
                sharePassword: '分享密码',
                passwordPlaceholderShare: '请输入6位数字密码',
                enableDownloadLimit: '启用下载次数限制',
                downloadLimit: '下载次数',
                enableExpiry: '启用有效期限制',
                expiryDays: '有效期（天）',
                createShareLink: '创建分享链接',
                generateShareLink: '生成分享链接',
                shareSuccess: '分享链接已创建',
                copyLink: '复制链接',
                cancel: '取消',
                close: '关闭',
                shareLink: '分享链接',
                copyLinkManually: '自动复制失败，请手动复制以下链接',
                shareLinkCopied: '分享链接已复制到剪贴板',
                linkCopied: '链接已复制',
                setExpiry: '设置过期时间',
                limitDownloads: '限制下载次数',
                setPassword: '设置访问密码',
                enterPassword: '输入访问密码',
                downloadLimitPlaceholder: '下载次数限制',
                oneHour: '1 小时',
                oneDay: '1 天',
                sevenDays: '7 天',
                thirtyDays: '30 天',

                // 存储信息
                totalUsed: '已使用',
                totalQuota: '总容量',
                usagePercentage: '使用率',
                fileCount: '文件数',
                unlimited: '无限制',

                // 提示信息
                uploadSuccess: '上传成功',
                uploadFailed: '上传失败',
                uploadCanceled: '上传已取消',
                cancelUpload: '取消上传',
                deleteConfirm: '确定要删除这个文件吗？',
                deleteSuccess: '删除成功',
                deleteFailed: '删除失败',
                copy: '复制',
                copySuccess: '已复制到剪贴板',
                copyFailed: '复制失败',
                refreshSuccess: '文件列表已刷新',

                // 上传限制提示（新增）
                fileTypeNotAllowed: '以下文件类型不允许上传：',
                fileSizeExceeded: '以下文件超过大小限制：',
                fileInfo: '（{size}，超过限制 {maxSize}）',
                noFilesSelected: '未选择任何文件',
                uploadConfigLoaded: '上传配置已加载',
                maxFileSize: '最大文件大小',
                blockedTypes: '禁止上传',
                rateLimit: '上传限制',
                perHour: '次/小时',

                // 文件预览
                closePreview: '关闭预览',
                svgRendered: 'SVG 渲染效果',
                svgSource: 'SVG 源代码',
                selectFileToPreview: '选择文件查看预览',
                supportedFormats: '支持图片、PDF、Markdown、代码等格式',
                fileType: '类型：',
                fileSize: '大小：',
                uploadDate: '上传时间：',
                svgVectorImage: 'SVG 矢量图',
                imageFile: '图片文件',
                pdfDocument: 'PDF 文档',
                markdownFile: 'Markdown 文件',
                codeFile: '代码文件',
                textFile: '文本文件',
                unknownFile: '未知文件',

                // 按钮
                logout: '登出',
                refresh: '刷新文件列表',
                themeToggle: '切换主题',
                langToggle: '切换语言',
                downloadFile: '下载文件',
                shareFileBtn: '分享文件',
                noPreviewAvailable: '此文件类型不支持在线预览',
                loading: '加载中...',

                // 错误消息
                cannotLoadSvg: '无法加载 SVG 代码',
                cannotLoadMarkdown: '无法加载 Markdown 内容',
                cannotLoadCode: '无法加载代码内容',
                cannotLoadText: '无法加载文本内容',

                // 操作消息
                downloading: '正在下载',
                downloadSuccess: '下载成功',
                downloadFailed: '下载失败',
                deleteConfirm: '确定要删除这个文件吗？',
                deleted: '已删除',
                deleteFailed: '删除失败',
                uploadSuccess: '上传成功',
                uploadFailed: '上传失败',

                // 空状态
                emptyState: '暂无文件，拖拽或选择文件开始上传',
                noSearchResults: '没有找到匹配的文件',

                // 分页
                showingFiles: '显示',
                totalFiles: '共',
                files: '个文件',
                previousPage: '上一页',
                nextPage: '下一页',

                // 登录安全
                loggingIn: '登录中...',
                loginBlocked: '登录已锁定，请 {seconds} 秒后重试',
                loginBlockedInitial: '密码错误次数过多，已锁定 {seconds} 秒',
                remainingAttempts: '剩余尝试次数',

                // 分片上传
                chunkedUploadStart: '开始上传',
                chunkedUploadProgress: '进度',
                chunkedUploadMerging: '所有分片上传完成，开始合并...',
                chunkedUploadSuccess: '上传成功',
                chunkedUploadFailed: '上传失败',
                chunkedUploadUsing: '文件大小：{size}MB，使用分片上传',
                chunkedInitFailed: '初始化失败',
                chunkedPartFailed: '分片 {partNumber} 上传失败',
                chunkedCompleteFailed: '完成上传失败',

                // 上传进度
                uploadProgressTitle: '上传进度',

                // DEMO 模式
                demoLoginHint: '💡 演示模式：输入任意密码即可登录体验',
                demoBanner: '📍 演示模式：任意密码可登录，所有操作仅在浏览器本地进行，刷新后数据重置'
            },
            en: {
                // Login screen
                appTitle: 'PebbleDrive',
                appSubtitle: 'Lightweight Cloud Storage',
                accessPassword: 'Access Password',
                passwordPlaceholder: 'Enter access password',
                loginBtn: 'Login',
                loginError: 'Incorrect password',

                // Main interface
                myFiles: 'My Files',
                upload: 'Upload File',
                storageInfo: 'Storage Info',
                uploadArea: 'Click or Drag',
                uploadHint: 'Max 100MB',
                searchPlaceholder: 'Search...',
                sortByName: 'Name',
                sortBySize: 'Size',
                sortByDate: 'Date',

                // File operations
                fileName: 'File Name',
                fileSize: 'Size',
                uploadTime: 'Upload Time',
                actions: 'Actions',
                preview: 'File Preview',
                download: 'Download',
                share: 'Share',
                delete: 'Delete',

                // Share settings
                shareSettings: 'Share Settings',
                advancedShareSettings: 'Advanced Share Settings',
                enablePassword: 'Enable Password Protection',
                sharePassword: 'Share Password',
                passwordPlaceholderShare: 'Enter 6-digit password',
                enableDownloadLimit: 'Enable Download Limit',
                downloadLimit: 'Download Limit',
                enableExpiry: 'Enable Expiry',
                expiryDays: 'Expiry (Days)',
                createShareLink: 'Create Share Link',
                generateShareLink: 'Generate Share Link',
                shareSuccess: 'Share link created',
                copyLink: 'Copy Link',
                cancel: 'Cancel',
                close: 'Close',
                shareLink: 'Share Link',
                copyLinkManually: 'Auto copy failed, please copy the link manually',
                shareLinkCopied: 'Share link copied to clipboard',
                linkCopied: 'Link copied',
                setExpiry: 'Set expiry time',
                limitDownloads: 'Limit downloads',
                setPassword: 'Set access password',
                enterPassword: 'Enter access password',
                downloadLimitPlaceholder: 'Download limit',
                oneHour: '1 Hour',
                oneDay: '1 Day',
                sevenDays: '7 Days',
                thirtyDays: '30 Days',

                // Storage info
                totalUsed: 'Used',
                totalQuota: 'Total',
                usagePercentage: 'Usage',
                fileCount: 'Files',
                unlimited: 'Unlimited',

                // Messages
                uploadSuccess: 'Upload successful',
                uploadFailed: 'Upload failed',
                uploadCanceled: 'Upload canceled',
                cancelUpload: 'Cancel upload',
                deleteConfirm: 'Are you sure you want to delete this file?',
                deleteSuccess: 'Deleted successfully',
                deleteFailed: 'Delete failed',
                copy: 'Copy',
                copySuccess: 'Copied to clipboard',
                copyFailed: 'Copy failed',
                refreshSuccess: 'File list refreshed',

                // Upload limits (new)
                fileTypeNotAllowed: 'The following file types are not allowed:',
                fileSizeExceeded: 'The following files exceed the size limit:',
                fileInfo: '({size}, exceeds limit {maxSize})',
                noFilesSelected: 'No files selected',
                uploadConfigLoaded: 'Upload configuration loaded',
                maxFileSize: 'Max file size',
                blockedTypes: 'Blocked types',
                rateLimit: 'Upload limit',
                perHour: 'times/hour',

                // File preview
                closePreview: 'Close Preview',
                svgRendered: 'SVG Rendered',
                svgSource: 'SVG Source Code',
                selectFileToPreview: 'Select a file to preview',
                supportedFormats: 'Supports images, PDF, Markdown, code and more',
                fileType: 'Type:',
                fileSize: 'Size:',
                uploadDate: 'Upload Time:',
                svgVectorImage: 'SVG Vector Image',
                imageFile: 'Image File',
                pdfDocument: 'PDF Document',
                markdownFile: 'Markdown File',
                codeFile: 'Code File',
                textFile: 'Text File',
                unknownFile: 'Unknown File',

                // Buttons
                logout: 'Logout',
                refresh: 'Refresh file list',
                themeToggle: 'Toggle theme',
                langToggle: 'Switch language',
                downloadFile: 'Download File',
                shareFileBtn: 'Share File',
                noPreviewAvailable: 'This file type does not support online preview',
                loading: 'Loading...',

                // Error messages
                cannotLoadSvg: 'Cannot load SVG code',
                cannotLoadMarkdown: 'Cannot load Markdown content',
                cannotLoadCode: 'Cannot load code content',
                cannotLoadText: 'Cannot load text content',

                // Operation messages
                downloading: 'Downloading',
                downloadSuccess: 'Download successful',
                downloadFailed: 'Download failed',
                deleteConfirm: 'Are you sure you want to delete this file?',
                deleted: 'Deleted',
                deleteFailed: 'Delete failed',
                uploadSuccess: 'Upload successful',
                uploadFailed: 'Upload failed',

                // Empty state
                emptyState: 'No files yet, drag or select files to upload',
                noSearchResults: 'No matching files found',

                // Pagination
                showingFiles: 'Showing',
                totalFiles: 'of',
                files: 'files',
                previousPage: 'Previous',
                nextPage: 'Next',

                // Login Security
                loggingIn: 'Logging in...',
                loginBlocked: 'Login locked, please try again in {seconds} seconds',
                loginBlockedInitial: 'Too many failed attempts, locked for {seconds} seconds',
                remainingAttempts: 'Remaining attempts',

                // Chunked Upload
                chunkedUploadStart: 'Upload started',
                chunkedUploadProgress: 'Progress',
                chunkedUploadMerging: 'All chunks uploaded, merging...',
                chunkedUploadSuccess: 'Upload successful',
                chunkedUploadFailed: 'Upload failed',
                chunkedUploadUsing: 'File size: {size}MB, using chunked upload',
                chunkedInitFailed: 'Initialization failed',
                chunkedPartFailed: 'Chunk {partNumber} upload failed',
                chunkedCompleteFailed: 'Failed to complete upload',

                // 上传进度
                uploadProgressTitle: 'Upload Progress',

                // DEMO Mode
                demoLoginHint: '💡 Demo Mode: Enter any password to login',
                demoBanner: '📍 Demo Mode: All operations are local, data resets on refresh'
            }
        };
        // 延迟应用语言，确保 DOM 已加载
        setTimeout(() => this.applyLanguage(this.lang), 0);
    }

    /**
     * 从 localStorage 获取语言
     */
    getLang() {
        return localStorage.getItem('pebbledrive_lang') || 'zh';
    }

    /**
     * 保存语言到 localStorage
     */
    setLang(lang) {
        localStorage.setItem('pebbledrive_lang', lang);
        this.lang = lang;
    }

    /**
     * 获取翻译文本
     */
    t(key) {
        return this.translations[this.lang][key] || key;
    }

    /**
     * 应用语言
     */
    applyLanguage(lang) {
        // 更新所有带 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // 更新所有带 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // 更新所有带 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    }

    /**
     * 切换语言
     */
    toggle() {
        const newLang = this.lang === 'zh' ? 'en' : 'zh';
        this.setLang(newLang);
        this.applyLanguage(newLang);
        // 语言切换按钮保持图标样式（不需要更新内容）
        // 图标样式通用于所有语言，无需动态修改
    }
}

/**
 * 认证管理类
 */
class AuthManager {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        this.token = this.getToken();
    }

    /**
     * 从 localStorage 获取 token
     */
    getToken() {
        return localStorage.getItem('pebbledrive_token');
    }

    /**
     * 保存 token 到 localStorage
     */
    setToken(token) {
        localStorage.setItem('pebbledrive_token', token);
        this.token = token;
    }

    /**
     * 删除 token
     */
    removeToken() {
        localStorage.removeItem('pebbledrive_token');
        this.token = null;
    }

    /**
     * 检查是否已登录
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * 登录
     * 需要 Turnstile 验证
     */
    async login(password) {
        // DEMO 模式：任意密码都返回成功
        if (DEMO_MODE) {
            console.log('[DEMO 模式] 登录成功，任意密码均可');
            const mockToken = 'demo-token-' + Date.now();
            this.setToken(mockToken);
            return {
                token: mockToken,
                message: 'Demo 模式登录成功'
            };
        }

        // 检查 Turnstile 配置
        if (!window.TURNSTILE_SITE_KEY) {
            throw new Error('Turnstile验证未配置，请联系管理员');
        }

        // 获取 Turnstile token
        const turnstileToken = this.getTurnstileToken();
        if (!turnstileToken) {
            throw new Error('请完成人机验证后重试');
        }

        const response = await fetch(`${this.apiEndpoint}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, turnstileToken })
        });

        // 检查响应是否有内容
        const text = await response.text();
        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error('服务器返回了无效的响应');
        }

        if (!response.ok) {
            throw new Error(data.message || '登录失败');
        }

        this.setToken(data.token);
        return data;
    }

    /**
     * 登出
     */
    logout() {
        this.removeToken();
    }

    /**
     * 获取认证 headers
     */
    getAuthHeaders() {
        if (!this.token) {
            return {};
        }
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }
}

class PebbleDrive {
    constructor() {
        this.files = [];
        this.selectedFileId = null; // 当前选中的文件ID
        this.activeUploads = new Map(); // 保存正在上传的对象 (fileName -> {xhr|uploader, type})

        // 上传限制配置（从后端获取）
        this.uploadConfig = {
            maxFileSizeMB: 100, // 默认值
            maxFileSizeBytes: 100 * 1024 * 1024,
            storageQuotaGB: 10,
            blockedExtensions: ['.exe', '.sh', '.bat', '.cmd'],
            uploadRateLimit: 50,
            uploadRateWindow: 3600,
            hints: {
                maxFileSize: '最大文件大小：100MB',
                blockedTypes: '禁止上传：.exe, .sh, .bat, .cmd',
                rateLimit: '上传限制：50 次/60 分钟'
            }
        };

        // 分页状态
        this.pagination = {
            currentPage: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0
        };

        // 搜索和排序状态
        this.searchTerm = '';
        this.sortBy = 'uploadDate';
        this.sortOrder = 'desc';

        // 登录失败限制（前端限制，已移至后端）
        // this.loginAttempts = 0;
        // this.loginBlockedUntil = 0;
        // this.maxLoginAttempts = 3;
        // this.blockDuration = 60000; // 60 秒

        // Turnstile Widget ID
        this.turnstileWidgetId = null;

        // Use environment variable or fallback to relative path
        const apiBase = (typeof window !== 'undefined' && window.ENV_API_BASE_URL)
            ? window.ENV_API_BASE_URL
            : '';
        this.apiEndpoint = apiBase + '/api';

        // 初始化主题管理器
        this.theme = new ThemeManager();

        // 初始化国际化管理器
        this.i18n = new I18nManager();

        // 初始化认证管理器
        this.auth = new AuthManager(this.apiEndpoint);

        this.init();
    }

    init() {
        // 设置版本号链接
        this.setupVersionLinks();

        // 检查是否已登录
        if (!this.auth.isAuthenticated()) {
            this.showLoginScreen();
        } else {
            this.showAppScreen();
        }
    }

    /**
     * 设置版本号链接
     */
    setupVersionLinks() {
        const loginVersionLink = document.getElementById('loginVersionLink');
        const appVersionLink = document.getElementById('appVersionLink');

        if (loginVersionLink) {
            loginVersionLink.href = GITHUB_REPO_URL;
            loginVersionLink.textContent = `v${APP_VERSION}`;
        }

        if (appVersionLink) {
            appVersionLink.href = GITHUB_REPO_URL;
            appVersionLink.textContent = `v${APP_VERSION}`;
        }
    }

    /**
     * 显示登录界面
     */
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
        this.setupLoginEventListeners();
        this.initTurnstile();
    }

    /**
     * 初始化 Turnstile
     * 需要 Turnstile 配置和加载
     */
    initTurnstile() {
        // DEMO 模式：跳过 Turnstile 初始化
        if (DEMO_MODE) {
            console.log('[DEMO 模式] 跳过 Turnstile 验证');
            const container = document.getElementById('turnstile-container');
            if (container) {
                container.classList.add('hidden');
            }
            return;
        }

        // 检查 Turnstile 配置
        if (!window.TURNSTILE_SITE_KEY) {
            console.error('Turnstile未配置，无法初始化验证组件');
            const loginError = document.getElementById('loginError');
            const loginErrorText = document.getElementById('loginErrorText');
            if (loginError && loginErrorText) {
                loginErrorText.textContent = 'Turnstile验证未配置，请联系管理员';
                loginError.classList.remove('hidden');
            }
            return;
        }

        // 如果已经初始化过，重置 widget 而不是重新创建
        if (this.turnstileWidgetId !== null && window.turnstile) {
            try {
                window.turnstile.reset(this.turnstileWidgetId);
                console.log('Turnstile组件已重置');
                return;
            } catch (error) {
                console.error('Turnstile重置失败，将重新创建:', error);
                // 重置失败，清除旧的 widget ID，继续创建新的
                this.turnstileWidgetId = null;
            }
        }

        // 等待 Turnstile 脚本加载（异步脚本需要时间）
        const waitForTurnstile = () => {
            if (!window.turnstile) {
                console.log('等待 Turnstile 脚本加载...');
                setTimeout(waitForTurnstile, 100); // 每 100ms 检查一次
                return;
            }

            // Turnstile 脚本已加载，开始初始化
            this.renderTurnstile();
        };

        waitForTurnstile();
    }

    /**
     * 渲染 Turnstile 组件
     */
    renderTurnstile() {
        const container = document.getElementById('turnstile-container');
        if (!container) {
            console.error('Turnstile容器未找到');
            return;
        }

        // 清空容器内容（移除旧的 widget）
        container.innerHTML = '';

        // 确保容器可见（必须先移除 hidden 才能正确测量宽度）
        container.classList.remove('hidden');

        // 使用 requestAnimationFrame 确保浏览器完成布局计算后再测量宽度
        // 添加 setTimeout 作为额外保险，确保 DOM 完全渲染
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    // 获取当前语言（Turnstile 支持的语言代码）
                    const langMap = {
                        'zh': 'zh-CN',  // 中文
                        'en': 'en',     // 英文
                        'ja': 'ja'      // 日文
                    };
                    const currentLang = this.i18n ? this.i18n.lang : 'zh';
                    const turnstileLang = langMap[currentLang] || 'auto';

                    // 获取父表单的实际宽度（更可靠）
                    const loginForm = document.getElementById('loginForm');
                    const formWidth = loginForm ? loginForm.offsetWidth : 0;
                    const containerWidth = container.offsetWidth;
                    const viewportWidth = window.innerWidth;

                    console.log(`视口宽度: ${viewportWidth}px, 表单宽度: ${formWidth}px, 容器宽度: ${containerWidth}px`);

                    // 混合策略：
                    // 1. 容器宽度 >= 300px：使用 flexible 模式，自适应填充容器
                    // 2. 容器宽度 < 300px：使用 normal 模式 + CSS 缩放
                    let turnstileSize;
                    let needScale = false;

                    if (containerWidth >= 300) {
                        // 大屏幕：使用 flexible 自适应
                        turnstileSize = 'flexible';
                        console.log(`容器宽度 ${containerWidth}px >= 300px，使用 flexible 模式`);
                    } else {
                        // 小屏幕：使用 normal + 缩放
                        turnstileSize = 'normal';
                        needScale = true;
                        const scale = containerWidth / 300;
                        console.log(`容器宽度 ${containerWidth}px < 300px，使用 normal 模式 + 缩放 ${scale.toFixed(2)}`);
                        container.dataset.scale = scale.toFixed(3);
                    }

                    console.log(`选择 Turnstile 尺寸: ${turnstileSize}`);

                    // 使用 block 布局
                    container.style.display = 'block';

                    // 渲染 Turnstile widget
                    this.turnstileWidgetId = window.turnstile.render('#turnstile-container', {
                        sitekey: window.TURNSTILE_SITE_KEY,
                        theme: this.theme.theme === 'dark' ? 'dark' : 'light',
                        language: turnstileLang,
                        size: turnstileSize
                    });

                    console.log('Turnstile组件初始化成功, widgetId:', this.turnstileWidgetId);

                    // 如果需要缩放，渲染后应用
                    if (needScale && container.dataset.scale) {
                        setTimeout(() => {
                            const turnstileWidget = container.querySelector('div');
                            if (turnstileWidget) {
                                const scale = parseFloat(container.dataset.scale);
                                turnstileWidget.style.transform = `scale(${scale})`;
                                turnstileWidget.style.transformOrigin = '0 0';
                                // 调整容器高度以适应缩放后的内容
                                const originalHeight = 65; // normal 模式高度
                                container.style.height = `${originalHeight * scale}px`;
                                console.log(`已应用缩放 ${scale}，容器高度调整为 ${originalHeight * scale}px`);
                            }
                        }, 100); // 等待 Turnstile 完全渲染
                    }
                } catch (error) {
                    console.error('Turnstile组件初始化失败:', error);
                    const loginError = document.getElementById('loginError');
                    const loginErrorText = document.getElementById('loginErrorText');
                    if (loginError && loginErrorText) {
                        loginErrorText.textContent = 'Turnstile验证组件初始化失败，请刷新页面重试';
                        loginError.classList.remove('hidden');
                    }
                }
            }, 50); // 等待 50ms 确保 DOM 完全渲染
        });
    }

    /**
     * 获取 Turnstile token
     * 需要 Turnstile 验证
     */
    getTurnstileToken() {
        // DEMO 模式：返回假 token
        if (DEMO_MODE) {
            console.log('[DEMO 模式] 跳过 Turnstile 验证，返回假 token');
            return 'demo-token-' + Date.now();
        }

        // 检查 Turnstile 是否配置
        if (!window.TURNSTILE_SITE_KEY) {
            throw new Error('Turnstile验证未配置，请联系管理员');
        }

        // 检查 Turnstile 是否加载
        if (!window.turnstile) {
            throw new Error('Turnstile验证组件未加载，请刷新页面重试');
        }

        // 检查 widget 是否渲染
        if (this.turnstileWidgetId === null) {
            throw new Error('Turnstile验证组件未初始化，请刷新页面重试');
        }

        const token = window.turnstile.getResponse(this.turnstileWidgetId);
        if (!token) {
            throw new Error('请完成人机验证后重试');
        }

        return token;
    }

    /**
     * 重置 Turnstile
     */
    resetTurnstile() {
        if (!window.turnstile || this.turnstileWidgetId === null) {
            return;
        }
        window.turnstile.reset(this.turnstileWidgetId);
    }

    /**
     * 显示主应用界面
     */
    async showAppScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'flex';

        // 加载上传配置（优先级最高，影响文件上传逻辑）
        await this.loadUploadConfig();

        this.setupEventListeners();
        this.loadFiles();
        this.updateStorageInfo();
        this.setupMobilePreview();
    }

    /**
     * 设置登录界面事件监听器
     */
    setupLoginEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginError = document.getElementById('loginError');
        const loginErrorText = document.getElementById('loginErrorText');

        loginForm.onsubmit = async (e) => {
            e.preventDefault();

            const passwordInput = document.getElementById('loginPassword');
            const password = passwordInput.value;

            // 显示加载状态
            loginBtn.disabled = true;
            loginBtnText.textContent = this.i18n.t('loggingIn');
            loginError.classList.add('hidden');

            try {
                // DEMO 模式：直接调用 login 函数，不走 API
                if (DEMO_MODE) {
                    console.log('[DEMO 模式] 使用本地登录，跳过 API 调用');
                    await this.auth.login(password);

                    // 登录成功 - 显示主应用界面（包含所有初始化）
                    console.log('[DEMO 模式] 登录成功，初始化主界面');
                    await this.showAppScreen();

                    // 恢复按钮状态
                    loginBtn.disabled = false;
                    loginBtnText.textContent = this.i18n.t('loginBtn');
                    return;
                }

                // 获取 Turnstile token（如果已配置）
                const turnstileToken = this.getTurnstileToken();

                // 调用登录 API
                const response = await fetch(`${this.apiEndpoint}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        password,
                        turnstileToken
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    // 处理各种错误
                    if (response.status === 429 || response.status === 423) {
                        // IP 速率限制或账户锁定
                        const seconds = data.remainingSeconds || 0;
                        loginErrorText.textContent = data.message || `请 ${seconds} 秒后重试`;
                    } else {
                        // 密码错误等其他错误
                        loginErrorText.textContent = data.message || '登录失败';
                    }
                    loginError.classList.remove('hidden');

                    // 重置 Turnstile
                    this.resetTurnstile();

                    // 清空密码输入框
                    passwordInput.value = '';
                    passwordInput.focus();
                    return;
                }

                // 登录成功
                this.auth.setToken(data.token);
                this.showAppScreen();

            } catch (error) {
                console.error('Login error:', error);
                loginErrorText.textContent = '登录失败，请稍后重试';
                loginError.classList.remove('hidden');

                // 重置 Turnstile
                this.resetTurnstile();

                // 清空密码输入框
                passwordInput.value = '';
                passwordInput.focus();
            } finally {
                // 恢复按钮状态
                loginBtn.disabled = false;
                loginBtnText.textContent = this.i18n.t('loginBtn');
            }
        };
    }

    setupEventListeners() {
        const dragArea = document.getElementById('dragArea');
        const fileInput = document.getElementById('fileInput');
        const refreshBtn = document.getElementById('refreshBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const searchInput = document.getElementById('searchInput');
        const sortBy = document.getElementById('sortBy');
        const fileModal = document.getElementById('fileModal');
        const closeModal = document.getElementById('closeModal');
        const themeToggle = document.getElementById('themeToggle');
        const langToggle = document.getElementById('langToggle');

        // 拖拽事件
        dragArea.addEventListener('dragover', this.handleDragOver.bind(this));
        dragArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dragArea.addEventListener('drop', this.handleDrop.bind(this));

        // 点击虚线区域打开文件选择
        dragArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // 刷新按钮（同时刷新文件列表、配置和存储信息）
        refreshBtn.addEventListener('click', async () => {
            await this.loadUploadConfig(); // 重新加载上传配置
            this.loadFiles(); // 重新加载文件列表
            this.updateStorageInfo(); // 更新存储信息
            this.showToast(this.i18n.t('refreshSuccess'), 'success');
        });

        // 登出按钮
        logoutBtn.addEventListener('click', () => {
            this.auth.logout();
            // 清空密码输入框
            const passwordInput = document.getElementById('loginPassword');
            if (passwordInput) {
                passwordInput.value = '';
            }
            this.showLoginScreen();

            // 重新初始化 Turnstile 以适配当前主题和语言
            if (window.TURNSTILE_SITE_KEY) {
                // 延迟执行，确保登录界面已显示
                setTimeout(() => {
                    this.initTurnstile();
                }, 100);
            }
        });

        // 主题切换按钮
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.theme.toggle();
                // 如果在登录界面，更新 Turnstile 主题
                if (!this.auth.isAuthenticated() && this.turnstileWidgetId !== null) {
                    this.initTurnstile();
                }
            });
        }

        // 语言切换按钮
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.i18n.toggle();
                // 重新渲染文件列表以更新界面文本
                this.filterFiles();
                // 更新上传提示（使用后端配置的动态值）
                this.updateUploadHints();
                // 更新上传进度条的按钮文本
                this.updateUploadProgressTitles();
                // 重新渲染当前预览的文件（如果有选中的文件）
                if (this.selectedFileId) {
                    this.showFilePreview(this.selectedFileId);
                }
                // 如果在登录界面，更新 Turnstile 语言
                if (!this.auth.isAuthenticated() && this.turnstileWidgetId !== null) {
                    this.initTurnstile();
                }
            });
        }

        // 搜索和排序
        searchInput.addEventListener('input', this.debounce(this.filterFiles.bind(this), 300));
        sortBy.addEventListener('change', this.sortFiles.bind(this));

        // 文件列表容器点击事件 - 使用事件委托处理文件选择和取消预览
        const fileList = document.getElementById('fileList');
        if (fileList) {
            fileList.addEventListener('click', (e) => {
                // 检查是否点击了文件项或其子元素
                const fileItem = e.target.closest('.file-item');

                if (fileItem) {
                    // 点击了文件项 - 选择文件或取消选择
                    const fileId = fileItem.getAttribute('data-file-id');
                    this.selectFile(fileId);
                } else {
                    // 点击了空白处 - 取消选择
                    if (this.selectedFileId) {
                        this.selectedFileId = null;
                        this.clearPreview();
                        this.updateFileHighlight();
                    }
                }
            });
        }

        // 模态框
        closeModal.addEventListener('click', () => this.hideModal());
        fileModal.addEventListener('click', (e) => {
            if (e.target === fileModal) this.hideModal();
        });
    }

    /**
     * 获取带认证的文件 Blob URL
     * 用于 img、iframe 等无法设置 header 的标签
     */
    async getAuthenticatedBlobUrl(fileId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/download?id=${fileId}`, {
                headers: {
                    ...this.auth.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error('下载失败');
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Get blob URL error:', error);
            return null;
        }
    }

    /**
     * 加载上传限制配置（从后端获取）
     */
    async loadUploadConfig() {
        // DEMO 模式：使用默认配置
        if (DEMO_MODE) {
            console.log('[DEMO 模式] 使用默认上传配置');
            this.updateUploadHints();
            return;
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/config/limits`);

            if (response.ok) {
                const config = await response.json();
                this.uploadConfig = config;
                console.log('上传配置已加载：', config);

                // 更新上传区域的提示信息
                this.updateUploadHints();
            } else {
                console.warn('加载配置失败，使用默认配置');
            }
        } catch (error) {
            console.error('加载配置错误：', error);
            // 使用构造函数中的默认配置
        }
    }

    /**
     * 更新上传区域的提示信息（支持多语言）
     */
    updateUploadHints() {
        const dragArea = document.getElementById('dragArea');
        if (!dragArea) return;

        // 使用 data-i18n 属性精确匹配提示元素
        const hint = dragArea.querySelector('[data-i18n="uploadHint"]');
        if (hint) {
            // 根据当前语言更新文字
            const maxSizeMB = this.uploadConfig.maxFileSizeMB;
            if (this.i18n.lang === 'zh') {
                hint.textContent = `最大 ${maxSizeMB}MB`;
            } else {
                hint.textContent = `Max ${maxSizeMB}MB`;
            }
        }
    }

    /**
     * 更新上传进度条按钮的多语言文本
     */
    updateUploadProgressTitles() {
        // 更新所有取消按钮的 title
        const cancelButtons = document.querySelectorAll('.cancel-upload-btn');
        cancelButtons.forEach(btn => {
            btn.title = this.i18n.t('cancelUpload') || '取消上传';
        });

        // 更新所有关闭失败按钮的 title
        const closeButtons = document.querySelectorAll('.close-failed-btn');
        closeButtons.forEach(btn => {
            btn.title = this.i18n.t('close') || '关闭';
        });
    }

    setupMobilePreview() {
        const closeMobilePreview = document.getElementById('closeMobilePreview');
        if (closeMobilePreview) {
            closeMobilePreview.addEventListener('click', () => {
                document.getElementById('mobilePreviewModal').classList.add('hidden');
            });
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('dragArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('dragArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('dragArea').classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        this.uploadFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.uploadFiles(files);
        e.target.value = ''; // 清空input以允许重复选择同一文件
    }

    async uploadFiles(files) {
        // 使用动态配置进行验证
        const maxSize = this.uploadConfig.maxFileSizeBytes;
        const blockedExtensions = this.uploadConfig.blockedExtensions;

        // 分类文件：有效、超大、禁止类型
        const validFiles = [];
        const oversizedFiles = [];
        const blockedFiles = [];

        files.forEach(file => {
            const fileName = file.name.toLowerCase();
            const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            // 检查文件类型
            if (blockedExtensions.includes(extension)) {
                blockedFiles.push({ name: file.name, reason: `${this.i18n.t('blockedTypes')}（${extension}）` });
                return;
            }

            // 检查文件大小
            if (file.size > maxSize) {
                oversizedFiles.push({
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    maxSize: this.formatFileSize(maxSize)
                });
                return;
            }

            validFiles.push(file);
        });

        // 显示友好的错误提示
        if (blockedFiles.length > 0) {
            const names = blockedFiles.map(f => f.name).join(', ');
            this.showToast(
                `${this.i18n.t('fileTypeNotAllowed')}${names}`,
                'error'
            );
        }

        if (oversizedFiles.length > 0) {
            const details = oversizedFiles.map(f =>
                `${f.name}${this.i18n.t('fileInfo').replace('{size}', f.size).replace('{maxSize}', f.maxSize)}`
            ).join(', ');
            this.showToast(
                `${this.i18n.t('fileSizeExceeded')}${details}`,
                'warning'
            );
        }

        // 没有有效文件
        if (validFiles.length === 0) {
            if (blockedFiles.length === 0 && oversizedFiles.length === 0) {
                this.showToast(this.i18n.t('noFilesSelected'), 'info');
            }
            return;
        }

        // 上传有效文件（批量并行上传，每批最多3个文件）
        this.showUploadProgress(validFiles);

        const CONCURRENT_UPLOADS = 3; // 最多同时上传3个文件
        for (let i = 0; i < validFiles.length; i += CONCURRENT_UPLOADS) {
            const batch = validFiles.slice(i, i + CONCURRENT_UPLOADS);
            await Promise.all(batch.map(file => this.uploadFile(file)));
        }

        setTimeout(() => {
            document.getElementById('uploadProgress').classList.add('hidden');
            this.loadFiles();
        }, 1000);
    }

    showUploadProgress(files) {
        const progressContainer = document.getElementById('uploadProgress');
        const progressList = document.getElementById('progressList');

        progressContainer.classList.remove('hidden');
        progressList.innerHTML = '';

        files.forEach(file => {
            const progressItem = document.createElement('div');
            progressItem.className = 'bg-blue-50 dark:bg-gray-700 rounded p-1.5 mb-1';
            progressItem.setAttribute('data-file-upload', file.name);
            progressItem.innerHTML = `
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate flex-1">${file.name}</span>
                    <div class="flex items-center gap-1 ml-1">
                        <span class="text-[9px] text-gray-500 dark:text-gray-400">${this.formatFileSize(file.size)}</span>
                        <button class="cancel-upload-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                                data-file-name="${file.name}"
                                title="${this.i18n.t('cancelUpload') || '取消上传'}"
                                style="display: inline-flex; padding: 2px; min-width: 16px;">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div class="progress-bar bg-blue-600 dark:bg-blue-500 h-1 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            `;
            progressList.appendChild(progressItem);

            // 为取消按钮添加事件监听器
            const cancelBtn = progressItem.querySelector('.cancel-upload-btn');
            cancelBtn.addEventListener('click', () => {
                this.cancelUpload(file.name);
            });
        });
    }

    /**
     * 取消上传
     */
    cancelUpload(fileName) {
        const uploadInfo = this.activeUploads.get(fileName);
        if (!uploadInfo) {
            return;
        }

        // 根据类型取消上传
        if (uploadInfo.type === 'xhr') {
            // 普通上传（< 100MB）
            uploadInfo.xhr.abort();
        } else if (uploadInfo.type === 'chunked') {
            // 分片上传（>= 100MB）
            uploadInfo.uploader.cancel();
        }

        // 从 Map 中移除
        this.activeUploads.delete(fileName);

        // 移除进度条 UI
        const progressItem = document.querySelector(`[data-file-upload="${fileName}"]`);
        if (progressItem) {
            progressItem.remove();
        }

        // 提示用户
        this.showToast(`${fileName} ${this.i18n.t('uploadCanceled') || '上传已取消'}`, 'warning');

        // 如果没有正在上传的文件了，隐藏进度容器
        if (this.activeUploads.size === 0) {
            const progressContainer = document.getElementById('uploadProgress');
            progressContainer.classList.add('hidden');
        }
    }

    /**
     * 标记上传为失败状态
     * @param {string} fileName - 文件名
     */
    markUploadAsFailed(fileName) {
        const progressItem = document.querySelector(`[data-file-upload="${fileName}"]`);
        if (!progressItem) {
            return;
        }

        // 更新背景色为红色
        progressItem.className = 'bg-red-50 dark:bg-red-900/20 rounded p-1.5 mb-1 border border-red-200 dark:border-red-800';

        // 更新进度条为红色
        const progressBar = progressItem.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.className = 'progress-bar bg-red-500 dark:bg-red-600 h-1 rounded-full';
        }

        // 将取消按钮改为关闭按钮
        const cancelBtn = progressItem.querySelector('.cancel-upload-btn');
        if (cancelBtn) {
            // 更新按钮样式和提示
            cancelBtn.title = this.i18n.t('close') || '关闭';
            cancelBtn.className = 'close-failed-btn text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs';

            // 移除旧的事件监听器（通过替换元素）
            const newBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newBtn, cancelBtn);

            // 添加新的关闭事件
            newBtn.addEventListener('click', () => {
                progressItem.remove();

                // 检查是否还有进度条
                const progressList = document.getElementById('progressList');
                if (progressList && progressList.children.length === 0) {
                    const progressContainer = document.getElementById('uploadProgress');
                    progressContainer.classList.add('hidden');
                }
            });
        }

        // 添加失败图标
        const sizeSpan = progressItem.querySelector('.text-\\[9px\\]');
        if (sizeSpan) {
            sizeSpan.insertAdjacentHTML('afterend',
                '<span class="text-[9px] text-red-600 dark:text-red-400 ml-1">✗ ' + this.i18n.t('uploadFailed') + '</span>'
            );
        }
    }

    async uploadFile(file) {
        // DEMO 模式：模拟上传
        if (DEMO_MODE) {
            return new Promise((resolve) => {
                console.log('[DEMO 模式] 模拟上传文件:', file.name);

                // 模拟上传进度
                let progress = 0;
                const progressItem = document.querySelector(`[data-file-upload="${file.name}"]`);

                const interval = setInterval(() => {
                    progress += 20;
                    if (progressItem) {
                        const progressBar = progressItem.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.width = progress + '%';
                        }
                    }

                    if (progress >= 100) {
                        clearInterval(interval);

                        // 添加到文件列表
                        const mockFile = {
                            id: 'demo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            uploadDate: new Date().toISOString(),
                            downloadUrl: URL.createObjectURL(file) // 使用 Blob URL 用于预览
                        };

                        this.files.push(mockFile);
                        this.showToast(`${file.name} ${this.i18n.t('uploadSuccess')}`, 'success');
                        this.renderFileList();
                        this.updateStorageInfo();
                        resolve(mockFile);
                    }
                }, 200); // 每200ms增加20%
            });
        }

        // 判断是否需要使用分片上传（>= 100MB）
        const CHUNKED_UPLOAD_THRESHOLD = 100 * 1024 * 1024; // 100MB

        if (file.size >= CHUNKED_UPLOAD_THRESHOLD) {
            // 使用分片上传
            return this.uploadFileChunked(file);
        }

        // 使用普通上传（< 100MB）
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // 保存到 activeUploads（用于取消）
            this.activeUploads.set(file.name, { xhr, type: 'xhr' });

            // 监听上传进度
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    // 找到对应文件的进度条
                    const progressItem = document.querySelector(`[data-file-upload="${file.name}"]`);
                    if (progressItem) {
                        const progressBar = progressItem.querySelector('.progress-bar');
                        if (progressBar) {
                            progressBar.style.width = percent + '%';
                        }
                    }
                }
            });

            // 上传完成
            xhr.addEventListener('load', () => {
                // 从 activeUploads 中移除
                this.activeUploads.delete(file.name);

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const fileInfo = JSON.parse(xhr.responseText);
                        this.files.push(fileInfo);
                        this.showToast(`${file.name} ${this.i18n.t('uploadSuccess')}`, 'success');
                        this.renderFileList();
                        this.updateStorageInfo();
                        resolve(fileInfo);
                    } catch (error) {
                        console.error('Parse response error:', error);
                        this.showToast(`${this.i18n.t('uploadFailed')}: ${error.message}`, 'error');
                        this.markUploadAsFailed(file.name); // 标记为失败
                        reject(error);
                    }
                } else {
                    const errorMsg = this.i18n.t('uploadFailed');
                    this.showToast(`${file.name} ${errorMsg}`, 'error');
                    this.markUploadAsFailed(file.name); // 标记为失败
                    reject(new Error(errorMsg));
                }
            });

            // 上传失败
            xhr.addEventListener('error', () => {
                // 从 activeUploads 中移除
                this.activeUploads.delete(file.name);

                const errorMsg = this.i18n.t('uploadFailed');
                console.error('Upload error:', file.name);
                this.showToast(`${file.name} ${errorMsg}`, 'error');
                this.markUploadAsFailed(file.name); // 标记为失败
                reject(new Error(errorMsg));
            });

            // 上传取消
            xhr.addEventListener('abort', () => {
                // 从 activeUploads 中移除
                this.activeUploads.delete(file.name);

                const errorMsg = this.i18n.t('uploadCanceled') || '上传已取消';
                // 取消时不显示 toast（在 cancelUpload 中已显示）
                reject(new Error(errorMsg));
            });

            xhr.open('POST', `${this.apiEndpoint}/upload`);

            // 添加认证头
            const authHeaders = this.auth.getAuthHeaders();
            if (authHeaders.Authorization) {
                xhr.setRequestHeader('Authorization', authHeaders.Authorization);
            }

            xhr.send(formData);
        });
    }

    /**
     * 分片上传大文件（>= 100MB）
     */
    async uploadFileChunked(file) {
        try {
            // 创建分片上传器（传入 i18n 支持）
            const uploader = new ChunkedUploader(
                file,
                this.apiEndpoint,
                this.auth.getToken(),
                this.i18n // 添加 i18n 支持
            );

            // 保存到 activeUploads（用于取消）
            this.activeUploads.set(file.name, { uploader, type: 'chunked' });

            // 设置进度回调
            uploader.onProgress = ({ uploaded, total, percent }) => {
                // 更新进度条
                const progressItem = document.querySelector(`[data-file-upload="${file.name}"]`);
                if (progressItem) {
                    const progressBar = progressItem.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = percent + '%';
                    }
                }

                // 显示分片进度
                console.log(`[${this.i18n.t('chunkedUploadProgress')}] ${file.name}: ${uploaded}/${total} (${percent}%)`);
            };

            // 开始上传
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            console.log(this.i18n.t('chunkedUploadUsing').replace('{size}', sizeMB));
            const result = await uploader.upload();

            // 从 activeUploads 中移除（上传成功）
            this.activeUploads.delete(file.name);

            // 上传成功
            this.files.push(result);
            this.showToast(`${file.name} ${this.i18n.t('uploadSuccess')}`, 'success');
            this.renderFileList();
            this.updateStorageInfo();

            return result;

        } catch (error) {
            // 从 activeUploads 中移除（上传失败）
            this.activeUploads.delete(file.name);

            // 如果是取消错误，不显示toast（在 cancelUpload 中已显示）
            if (!error.message.includes('取消') && !error.message.includes('canceled')) {
                console.error(`[${this.i18n.t('chunkedUploadFailed')}]`, error);
                this.showToast(`${file.name} ${this.i18n.t('uploadFailed')}: ${error.message}`, 'error');
                this.markUploadAsFailed(file.name); // 标记为失败
            }
            throw error;
        }
    }

    async loadFiles() {
        try {
            // DEMO 模式：返回 mock 数据
            if (DEMO_MODE) {
                console.log('[DEMO 模式] 使用 mock 文件数据');
                this.files = [...MOCK_FILES]; // 复制 mock 数据
                this.pagination = {
                    currentPage: 1,
                    pageSize: 50,
                    total: MOCK_FILES.length,
                    totalPages: 1
                };
                this.renderFileList();
                this.renderPagination();
                this.updateStorageInfo();
                return;
            }

            // 构建查询参数
            const params = new URLSearchParams({
                page: this.pagination.currentPage,
                pageSize: this.pagination.pageSize,
                search: this.searchTerm,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            });

            // 调用 API 加载文件列表
            const response = await fetch(`${this.apiEndpoint}/files?${params}`, {
                headers: {
                    ...this.auth.getAuthHeaders()
                }
            });

            const data = await response.json();

            // 更新分页信息和文件列表
            this.files = data.files || [];
            this.pagination = {
                currentPage: data.page,
                pageSize: data.pageSize,
                total: data.total,
                totalPages: data.totalPages
            };

            this.renderFileList();
            this.renderPagination();
            this.updateStorageInfo();
        } catch (error) {
            console.error('Load files error:', error);
            this.showToast('加载文件列表失败', 'error');
        }
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');

        if (this.files.length === 0) {
            fileList.innerHTML = `
                <div id="emptyState" class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <i class="fas fa-folder-open text-3xl mb-2"></i>
                    <p class="text-xs">${this.i18n.t('emptyState')}</p>
                </div>
            `;
            // 清空预览区域
            this.clearPreview();
            return;
        }

        fileList.innerHTML = this.files.map(file => `
            <div class="file-item px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${this.selectedFileId === file.id ? 'bg-blue-100 dark:bg-gray-700' : ''}"
                 data-file-id="${file.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <i class="fas ${this.getFileIcon(file.type)} text-xl ${this.getFileIconColor(file.type)} flex-shrink-0"></i>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">${file.name}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                ${this.formatFileSize(file.size)}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1 flex-shrink-0" onclick="event.stopPropagation()">
                        <button onclick="app.downloadFile('${file.id}')" class="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded" title="${this.i18n.t('download')}">
                            <i class="fas fa-download text-sm"></i>
                        </button>
                        <button onclick="app.shareFile('${file.id}')" class="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded" title="${this.i18n.t('share')}">
                            <i class="fas fa-share text-sm"></i>
                        </button>
                        <button onclick="app.deleteFile('${file.id}')" class="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded" title="${this.i18n.t('delete')}">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    selectFile(fileId) {
        // 如果点击的是已选中的文件，则取消选择
        if (this.selectedFileId === fileId) {
            this.selectedFileId = null;
            this.clearPreview();
            this.updateFileHighlight();
        } else {
            // 选中新文件
            this.selectedFileId = fileId;
            this.showFilePreview(fileId);
            this.updateFileHighlight();
        }
    }

    // 更新文件列表中的高亮状态（不重新渲染整个列表）
    updateFileHighlight() {
        const fileList = document.getElementById('fileList');
        if (!fileList) return;

        // 移除所有文件项的高亮
        const allItems = fileList.querySelectorAll('.file-item');
        allItems.forEach(item => {
            item.classList.remove('bg-blue-100', 'dark:bg-gray-700');
        });

        // 添加当前选中文件的高亮
        if (this.selectedFileId) {
            const selectedItem = fileList.querySelector(`[data-file-id="${this.selectedFileId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('bg-blue-100', 'dark:bg-gray-700');
            }
        }
    }

    clearPreview() {
        const previewArea = document.getElementById('previewArea');
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <i class="fas fa-file-alt text-4xl mb-3"></i>
                    <p class="text-sm">${this.i18n.t('selectFileToPreview')}</p>
                    <p class="text-xs mt-1">${this.i18n.t('supportedFormats')}</p>
                </div>
            `;
        }
    }

    showFilePreview(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const previewArea = document.getElementById('previewArea');
        const mobilePreviewArea = document.getElementById('mobilePreviewArea');
        const mobilePreviewModal = document.getElementById('mobilePreviewModal');

        const isImage = file.type.startsWith('image/') && !file.name.endsWith('.svg');
        const isSVG = file.name.endsWith('.svg') || file.type === 'image/svg+xml';
        const isPDF = file.type.includes('pdf');
        const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown');
        const isCode = this.isCodeFile(file.name) && !isSVG; // SVG 单独处理
        const isText = file.type.startsWith('text/') || file.name.endsWith('.txt');

        let previewHTML = '';

        if (isSVG) {
            // SVG 文件预览 - 同时显示渲染效果和代码
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0 relative">
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col gap-3">
                        <!-- SVG 渲染预览 -->
                        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center" style="min-height: 200px;">
                            <img class="svgImage-${file.id} max-w-full max-h-64 object-contain"
                                 alt="${file.name}">
                        </div>
                        <!-- SVG 代码预览（带复制按钮） -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 relative">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">${this.i18n.t('svgSource')}</span>
                            </div>
                            <!-- 复制按钮：初始隐藏，内容加载完成后显示 -->
                            <button onclick="app.copyTextToClipboard('.svgPreview-${file.id}')"
                                    class="copy-btn-${file.id} absolute top-11 right-5 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all z-20 border border-gray-200 dark:border-gray-600 opacity-0 pointer-events-none"
                                    title="${this.i18n.t('copy')}">
                                <i class="fas fa-copy text-sm"></i>
                            </button>
                            <pre class="whitespace-pre-wrap break-words"><code class="svgPreview-${file.id} language-xml text-xs">${this.i18n.t('loading')}</code></pre>
                        </div>
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('svgVectorImage')}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载 SVG 图片和代码
            setTimeout(async () => {
                try {
                    // 加载 SVG 图片（使用 blob URL）
                    const blobUrl = await this.getAuthenticatedBlobUrl(file.id);
                    if (blobUrl) {
                        const imgElements = document.querySelectorAll(`.svgImage-${file.id}`);
                        imgElements.forEach(img => {
                            img.src = blobUrl;
                        });
                    }

                    // 加载 SVG 代码
                    let text;
                    if (DEMO_MODE && file.downloadUrl) {
                        // DEMO 模式：直接使用 Blob URL
                        const response = await fetch(file.downloadUrl);
                        text = await response.text();
                    } else {
                        // 正常模式：从 API 获取
                        const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                            headers: {
                                ...this.auth.getAuthHeaders()
                            }
                        });
                        text = await response.text();
                    }
                    const previewElements = document.querySelectorAll(`.svgPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
                        hljs.highlightElement(el);
                    });

                    // 显示复制按钮（淡入效果）
                    const copyBtns = document.querySelectorAll(`.copy-btn-${file.id}`);
                    copyBtns.forEach(btn => {
                        btn.classList.remove('opacity-0', 'pointer-events-none');
                        btn.classList.add('opacity-100');
                    });
                } catch (error) {
                    const previewElements = document.querySelectorAll(`.svgPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = this.i18n.t('cannotLoadSvg');
                    });
                }
            }, 0);
        } else if (isImage) {
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0">
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto min-h-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                        <img class="imagePreview-${file.id} max-w-full max-h-full object-contain rounded-lg shadow-lg"
                             alt="${file.name}">
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('imageFile')}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载图片（使用 blob URL）
            setTimeout(async () => {
                const blobUrl = await this.getAuthenticatedBlobUrl(file.id);
                if (blobUrl) {
                    const imgElements = document.querySelectorAll(`.imagePreview-${file.id}`);
                    imgElements.forEach(img => {
                        img.src = blobUrl;
                    });
                }
            }, 0);
        } else if (isPDF) {
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0">
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto min-h-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <iframe class="pdfPreview-${file.id} w-full h-full"
                                frameborder="0"></iframe>
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('pdfDocument')}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载 PDF（使用 blob URL）
            setTimeout(async () => {
                const blobUrl = await this.getAuthenticatedBlobUrl(file.id);
                if (blobUrl) {
                    const iframeElements = document.querySelectorAll(`.pdfPreview-${file.id}`);
                    iframeElements.forEach(iframe => {
                        iframe.src = blobUrl;
                    });
                }
            }, 0);
        } else if (isMarkdown) {
            // Markdown文件预览 - 异步加载并渲染
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0 relative">
                    <!-- 复制按钮：固定在外层容器右上角，不随滚动移动 -->
                    <button onclick="app.copyTextToClipboard('.markdownRaw-${file.id}')"
                            class="copy-btn-${file.id} absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all z-20 border border-gray-200 dark:border-gray-600 opacity-0 pointer-events-none"
                            title="${this.i18n.t('copy')}">
                        <i class="fas fa-copy text-sm"></i>
                    </button>
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-white dark:bg-gray-800 rounded-lg p-4">
                        <!-- 隐藏的原始文本存储 -->
                        <div class="markdownRaw-${file.id}" style="display: none;"></div>
                        <div class="markdown-preview markdownPreview-${file.id} text-sm text-gray-800 dark:text-gray-100">${this.i18n.t('loading')}</div>
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('markdownFile')}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载并渲染 Markdown
            setTimeout(async () => {
                try {
                    let text;
                    if (DEMO_MODE && file.downloadUrl) {
                        // DEMO 模式：直接使用 Blob URL
                        const response = await fetch(file.downloadUrl);
                        text = await response.text();
                    } else {
                        // 正常模式：从 API 获取
                        const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                            headers: {
                                ...this.auth.getAuthHeaders()
                            }
                        });
                        text = await response.text();
                    }

                    // 保存原始文本到隐藏元素（用于复制）
                    const rawElements = document.querySelectorAll(`.markdownRaw-${file.id}`);
                    rawElements.forEach(el => {
                        el.textContent = text;
                    });

                    // 使用 marked 库渲染 Markdown
                    const html = marked.parse(text);
                    const previewElements = document.querySelectorAll(`.markdownPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.innerHTML = html;
                        // 对代码块进行语法高亮
                        el.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });
                    });

                    // 显示复制按钮（淡入效果）
                    const copyBtns = document.querySelectorAll(`.copy-btn-${file.id}`);
                    copyBtns.forEach(btn => {
                        btn.classList.remove('opacity-0', 'pointer-events-none');
                        btn.classList.add('opacity-100');
                    });
                } catch (error) {
                    const previewElements = document.querySelectorAll(`.markdownPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = this.i18n.t('cannotLoadMarkdown');
                    });
                }
            }, 0);
        } else if (isCode) {
            // 代码文件预览 - 异步加载并高亮
            const language = this.getCodeLanguage(file.name);
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0 relative">
                    <!-- 复制按钮：固定在外层容器右上角，不随滚动移动 -->
                    <button onclick="app.copyTextToClipboard('.codePreview-${file.id}')"
                            class="copy-btn-${file.id} absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all z-20 border border-gray-200 dark:border-gray-600 opacity-0 pointer-events-none"
                            title="${this.i18n.t('copy')}">
                        <i class="fas fa-copy text-sm"></i>
                    </button>
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <pre class="m-0 whitespace-pre-wrap break-words"><code class="codePreview-${file.id} ${language} text-xs">${this.i18n.t('loading')}</code></pre>
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('codeFile')} (${language.toUpperCase()})</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载并高亮代码
            setTimeout(async () => {
                try {
                    let text;
                    if (DEMO_MODE && file.downloadUrl) {
                        // DEMO 模式：直接使用 Blob URL
                        const response = await fetch(file.downloadUrl);
                        text = await response.text();
                    } else {
                        // 正常模式：从 API 获取
                        const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                            headers: {
                                ...this.auth.getAuthHeaders()
                            }
                        });
                        text = await response.text();
                    }
                    const previewElements = document.querySelectorAll(`.codePreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
                        hljs.highlightElement(el);
                    });

                    // 显示复制按钮（淡入效果）
                    const copyBtns = document.querySelectorAll(`.copy-btn-${file.id}`);
                    copyBtns.forEach(btn => {
                        btn.classList.remove('opacity-0', 'pointer-events-none');
                        btn.classList.add('opacity-100');
                    });
                } catch (error) {
                    const previewElements = document.querySelectorAll(`.codePreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = this.i18n.t('cannotLoadCode');
                    });
                }
            }, 0);
        } else if (isText) {
            // TXT文件预览 - 异步加载内容
            previewHTML = `
                <div class="flex-1 flex flex-col min-h-0 relative">
                    <!-- 复制按钮：固定在外层容器右上角，不随滚动移动 -->
                    <button onclick="app.copyTextToClipboard('.textPreview-${file.id}')"
                            class="copy-btn-${file.id} absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all z-20 border border-gray-200 dark:border-gray-600 opacity-0 pointer-events-none"
                            title="${this.i18n.t('copy')}">
                        <i class="fas fa-copy text-sm"></i>
                    </button>
                    <!-- 可滚动的预览内容区域 -->
                    <div class="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <pre class="textPreview-${file.id} text-xs text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words font-mono">${this.i18n.t('loading')}</pre>
                    </div>
                    <!-- 固定的信息和按钮区域 -->
                    <div class="flex-shrink-0 mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">${file.name}</h3>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileType')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.i18n.t('textFile')}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div class="col-span-2">
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                        <div class="flex gap-2 mt-3">
                            <button onclick="app.downloadFile('${file.id}')"
                                    class="flex-1 bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition">
                                <i class="fas fa-download mr-1"></i>${this.i18n.t('download')}
                            </button>
                            <button onclick="app.shareFile('${file.id}')"
                                    class="flex-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition">
                                <i class="fas fa-share mr-1"></i>${this.i18n.t('share')}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 异步加载文本内容 - 使用 class 选择器以支持桌面端和移动端
            setTimeout(async () => {
                try {
                    let text;
                    if (DEMO_MODE && file.downloadUrl) {
                        // DEMO 模式：直接使用 Blob URL
                        const response = await fetch(file.downloadUrl);
                        text = await response.text();
                    } else {
                        // 正常模式：从 API 获取
                        const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                            headers: {
                                ...this.auth.getAuthHeaders()
                            }
                        });
                        text = await response.text();
                    }
                    // 更新所有匹配的预览元素（桌面端和移动端）
                    const previewElements = document.querySelectorAll(`.textPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
                    });

                    // 显示复制按钮（淡入效果）
                    const copyBtns = document.querySelectorAll(`.copy-btn-${file.id}`);
                    copyBtns.forEach(btn => {
                        btn.classList.remove('opacity-0', 'pointer-events-none');
                        btn.classList.add('opacity-100');
                    });
                } catch (error) {
                    // 更新所有匹配的预览元素
                    const previewElements = document.querySelectorAll(`.textPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = this.i18n.t('cannotLoadText');
                    });
                }
            }, 0);
        } else {
            previewHTML = `
                <div class="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                        <i class="fas ${this.getFileIcon(file.type)} text-2xl ${this.getFileIconColor(file.type)}"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate max-w-full">${file.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-xs mb-4">${this.i18n.t('unknownFile')}</p>
                    <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 max-w-md w-full">
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('fileSize')}</span>
                                <span class="text-gray-900 dark:text-gray-100 font-medium">${this.formatFileSize(file.size)}</span>
                            </div>
                            <div>
                                <span class="text-gray-600 dark:text-gray-400">${this.i18n.t('uploadDate')}</span>
                                <span class="text-gray-900 dark:text-gray-100 font-medium">${this.formatDate(file.uploadDate)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2 justify-center">
                        <button onclick="app.downloadFile('${file.id}')"
                                class="bg-blue-600 text-white px-4 py-2 text-xs rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-download mr-1"></i>${this.i18n.t('downloadFile')}
                        </button>
                        <button onclick="app.shareFile('${file.id}')"
                                class="bg-green-600 text-white px-4 py-2 text-xs rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-share mr-1"></i>${this.i18n.t('shareFileBtn')}
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-4">${this.i18n.t('noPreviewAvailable')}</p>
                </div>
            `;
        }

        // 更新桌面端预览（如果存在）
        if (previewArea) {
            previewArea.innerHTML = previewHTML;
        }

        // 更新移动端预览并显示模态框（如果在移动设备上）
        if (mobilePreviewArea && mobilePreviewModal) {
            mobilePreviewArea.innerHTML = previewHTML;
            // 检查是否是移动设备（屏幕宽度 < 768px）
            if (window.innerWidth < 768) {
                mobilePreviewModal.classList.remove('hidden');
            }
        }
    }

    async downloadFile(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        try {
            this.showToast(`${this.i18n.t('downloading')} ${file.name}...`, 'info');

            // 使用 fetch 带认证下载
            const response = await fetch(`${this.apiEndpoint}/download?id=${fileId}`, {
                headers: {
                    ...this.auth.getAuthHeaders()
                }
            });

            if (!response.ok) {
                throw new Error(this.i18n.t('downloadFailed'));
            }

            // 创建 blob 并下载
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showToast(`${file.name} ${this.i18n.t('downloadSuccess')}`, 'success');
        } catch (error) {
            this.showToast(`${this.i18n.t('downloadFailed')}: ${error.message}`, 'error');
        }
    }

    async shareFile(fileId) {
        // 显示高级分享模态框
        this.showAdvancedShareModal(fileId);
    }

    showAdvancedShareModal(fileId) {
        const file = this.files.find(f => f.id === fileId);
        if (!file) return;

        const modal = document.getElementById('fileModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = this.i18n.t('advancedShareSettings');
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    <div class="flex items-center space-x-2">
                        <i class="fas ${this.getFileIcon(file.type)} text-xl ${this.getFileIconColor(file.type)}"></i>
                        <span class="font-medium text-gray-900 dark:text-gray-100">${file.name}</span>
                    </div>
                </div>

                <div class="space-y-3">
                    <div>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="shareEnableExpiry" class="rounded">
                            <span class="text-sm text-gray-700 dark:text-gray-300">${this.i18n.t('setExpiry')}</span>
                        </label>
                        <div id="shareExpiryOptions" class="mt-2 ml-6 hidden">
                            <select id="shareExpirySelect" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-gray-100">
                                <option value="3600">${this.i18n.t('oneHour')}</option>
                                <option value="86400">${this.i18n.t('oneDay')}</option>
                                <option value="604800">${this.i18n.t('sevenDays')}</option>
                                <option value="2592000">${this.i18n.t('thirtyDays')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="shareEnableLimit" class="rounded">
                            <span class="text-sm text-gray-700 dark:text-gray-300">${this.i18n.t('limitDownloads')}</span>
                        </label>
                        <div id="shareLimitOptions" class="mt-2 ml-6 hidden">
                            <input type="number" id="shareLimitInput" min="1" max="100" value="10"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-gray-100"
                                   placeholder="${this.i18n.t('downloadLimitPlaceholder')}">
                        </div>
                    </div>

                    <div>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" id="shareEnablePassword" class="rounded">
                            <span class="text-sm text-gray-700 dark:text-gray-300">${this.i18n.t('setPassword')}</span>
                        </label>
                        <div id="sharePasswordOptions" class="mt-2 ml-6 hidden">
                            <input type="password" id="sharePasswordInput"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-gray-100"
                                   placeholder="${this.i18n.t('enterPassword')}">
                        </div>
                    </div>
                </div>

                <div class="flex space-x-3 pt-4 border-t dark:border-gray-600">
                    <button onclick="app.createAdvancedShare('${file.id}')"
                            class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-share mr-2"></i>${this.i18n.t('generateShareLink')}
                    </button>
                    <button onclick="app.hideModal()"
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700 dark:text-gray-100">
                        ${this.i18n.t('cancel')}
                    </button>
                </div>
            </div>
        `;

        // 设置复选框切换事件
        setTimeout(() => {
            document.getElementById('shareEnableExpiry').addEventListener('change', (e) => {
                document.getElementById('shareExpiryOptions').classList.toggle('hidden', !e.target.checked);
            });
            document.getElementById('shareEnableLimit').addEventListener('change', (e) => {
                document.getElementById('shareLimitOptions').classList.toggle('hidden', !e.target.checked);
            });
            document.getElementById('shareEnablePassword').addEventListener('change', (e) => {
                document.getElementById('sharePasswordOptions').classList.toggle('hidden', !e.target.checked);
            });
        }, 0);

        modal.classList.remove('hidden');
    }

    async createAdvancedShare(fileId) {
        try {
            const options = { fileId };

            // 获取过期时间
            if (document.getElementById('shareEnableExpiry').checked) {
                options.expiry = parseInt(document.getElementById('shareExpirySelect').value);
            }

            // 获取下载次数限制
            if (document.getElementById('shareEnableLimit').checked) {
                const limit = parseInt(document.getElementById('shareLimitInput').value);
                if (limit > 0) {
                    options.downloadLimit = limit;
                }
            }

            // 获取密码
            if (document.getElementById('shareEnablePassword').checked) {
                const password = document.getElementById('sharePasswordInput').value.trim();
                if (password) {
                    options.password = password;
                }
            }

            // 调用 API 创建分享链接
            const response = await fetch(`${this.apiEndpoint}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.auth.getAuthHeaders()
                },
                body: JSON.stringify(options)
            });

            if (!response.ok) {
                throw new Error('创建分享链接失败');
            }

            const data = await response.json();

            // 复制链接到剪贴板（兼容 Safari）
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(data.shareUrl);
                } else {
                    // 降级方案：使用传统方法
                    const textArea = document.createElement('textarea');
                    textArea.value = data.shareUrl;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
            } catch (clipboardError) {
                // 如果复制失败，显示分享链接供用户手动复制
                console.warn('Clipboard failed:', clipboardError);
                this.showShareLinkModal(data.shareUrl);
                return; // 不继续执行后续的 toast 和 hideModal
            }

            // 显示成功消息
            let message = this.i18n.t('shareLinkCopied') || '分享链接已复制到剪贴板';
            if (options.expiry) {
                const hours = options.expiry / 3600;
                const days = hours / 24;
                if (days >= 1) {
                    message += ` (${days}天后过期)`;
                } else {
                    message += ` (${hours}小时后过期)`;
                }
            }
            if (options.downloadLimit) {
                message += ` (限${options.downloadLimit}次下载)`;
            }
            if (options.password) {
                message += ' (需要密码)';
            }

            this.showToast(message, 'success');
            this.hideModal();

        } catch (error) {
            console.error('Share error:', error);
            this.showToast('分享失败: ' + error.message, 'error');
        }
    }

    showShareLinkModal(shareUrl) {
        const modal = document.getElementById('fileModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = this.i18n.t('shareLink') || '分享链接';
        modalContent.innerHTML = `
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ${this.i18n.t('copyLinkManually') || '自动复制失败，请手动复制以下链接'}
            </p>
            <div class="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                <input type="text"
                       id="shareLinkInput"
                       value="${shareUrl}"
                       readonly
                       class="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 outline-none select-all"
                       onclick="this.select()">
            </div>
            <div class="flex space-x-3">
                <button onclick="app.copyShareLinkManually()"
                        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-copy mr-2"></i>${this.i18n.t('copyLink') || '复制链接'}
                </button>
                <button onclick="app.hideModal()"
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 dark:bg-gray-700 dark:text-gray-100">
                    ${this.i18n.t('close') || '关闭'}
                </button>
            </div>
        `;

        modal.classList.remove('hidden');

        // 自动选中链接
        setTimeout(() => {
            document.getElementById('shareLinkInput')?.select();
        }, 100);
    }

    copyShareLinkManually() {
        const input = document.getElementById('shareLinkInput');
        input.select();
        try {
            document.execCommand('copy');
            this.showToast(this.i18n.t('linkCopied') || '链接已复制', 'success');
            this.hideModal();
        } catch (err) {
            this.showToast(this.i18n.t('copyFailed') || '复制失败，请手动选择复制', 'error');
        }
    }

    /**
     * 复制文本到剪贴板（用于预览区域）
     */
    async copyTextToClipboard(elementSelector) {
        try {
            // 获取元素
            const element = document.querySelector(elementSelector);
            if (!element) {
                throw new Error('Element not found');
            }

            // 获取文本内容
            const text = element.textContent || element.innerText;

            // 尝试使用现代 Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // 降级方案：使用传统方法
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            this.showToast(this.i18n.t('copySuccess') || '已复制到剪贴板', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast(this.i18n.t('copyFailed') || '复制失败', 'error');
        }
    }

    async deleteFile(fileId) {
        if (!confirm(this.i18n.t('deleteConfirm'))) return;

        const file = this.files.find(f => f.id === fileId);
        if (file) {
            try {
                // DEMO 模式：直接从本地数组删除
                if (DEMO_MODE) {
                    console.log('[DEMO 模式] 模拟删除文件:', file.name);
                    this.files = this.files.filter(f => f.id !== fileId);
                    this.renderFileList();
                    this.updateStorageInfo();
                    this.showToast(`${file.name} ${this.i18n.t('deleted')}`, 'success');
                    return;
                }

                // 调用 API 删除文件
                const response = await fetch(`${this.apiEndpoint}/delete?id=${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        ...this.auth.getAuthHeaders()
                    }
                });

                if (!response.ok) {
                    throw new Error(this.i18n.t('deleteFailed'));
                }

                this.files = this.files.filter(f => f.id !== fileId);
                this.renderFileList();
                this.updateStorageInfo();
                this.showToast(`${file.name} ${this.i18n.t('deleted')}`, 'success');
            } catch (error) {
                console.error('Delete error:', error);
                this.showToast(`${this.i18n.t('deleteFailed')}: ${error.message}`, 'error');
            }
        }
    }

    hideModal() {
        document.getElementById('fileModal').classList.add('hidden');
    }

    filterFiles() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        this.searchTerm = searchTerm;
        this.pagination.currentPage = 1; // 重置到第一页
        this.loadFiles();
    }

    sortFiles() {
        const sortBy = document.getElementById('sortBy').value;
        this.sortBy = sortBy;
        this.pagination.currentPage = 1; // 重置到第一页
        this.loadFiles();
    }

    renderPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;

        const { currentPage, totalPages, total } = this.pagination;

        if (total === 0 || totalPages === 0) {
            paginationContainer.innerHTML = '';
            return;
        }

        // 计算显示的页码范围
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let paginationHTML = '<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">';

        // 左侧：文件统计
        const startItem = (currentPage - 1) * this.pagination.pageSize + 1;
        const endItem = Math.min(currentPage * this.pagination.pageSize, total);
        paginationHTML += `<div class="text-xs">${this.i18n.t('showingFiles')} ${startItem}-${endItem} / ${this.i18n.t('totalFiles')} ${total} ${this.i18n.t('files')}</div>`;

        // 右侧：分页按钮
        paginationHTML += '<div class="flex items-center space-x-1">';

        // 上一页按钮
        paginationHTML += `
            <button
                onclick="app.goToPage(${currentPage - 1})"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                ${currentPage === 1 ? 'disabled' : ''}
            >
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 第一页
        if (startPage > 1) {
            paginationHTML += `
                <button onclick="app.goToPage(1)" class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs">1</button>
            `;
            if (startPage > 2) {
                paginationHTML += '<span class="px-1">...</span>';
            }
        }

        // 页码按钮
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage;
            paginationHTML += `
                <button
                    onclick="app.goToPage(${i})"
                    class="px-2 py-1 rounded text-xs ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
                >
                    ${i}
                </button>
            `;
        }

        // 最后一页
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<span class="px-1">...</span>';
            }
            paginationHTML += `
                <button onclick="app.goToPage(${totalPages})" class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs">${totalPages}</button>
            `;
        }

        // 下一页按钮
        paginationHTML += `
            <button
                onclick="app.goToPage(${currentPage + 1})"
                class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                ${currentPage === totalPages ? 'disabled' : ''}
            >
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationHTML += '</div></div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        if (page < 1 || page > this.pagination.totalPages) return;
        this.pagination.currentPage = page;
        this.loadFiles();
    }

    renderFilteredFiles(files) {
        const fileList = document.getElementById('fileList');

        if (files.length === 0) {
            fileList.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <i class="fas fa-search text-3xl mb-2"></i>
                    <p class="text-xs">${this.i18n.t('noSearchResults')}</p>
                </div>
            `;
            return;
        }

        // 使用临时数组来渲染，不影响原始数据
        const tempFiles = this.files;
        this.files = files;
        this.renderFileList();
        this.files = tempFiles;
    }

    async updateStorageInfo() {
        try {
            // DEMO 模式：返回 mock 存储信息
            if (DEMO_MODE) {
                const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
                document.getElementById('storageUsed').textContent = this.formatFileSize(totalSize);
                document.getElementById('storageTotal').textContent = '10 GB';
                return;
            }

            // 调用存储配额API获取总容量和已用空间
            const response = await fetch(`${this.apiEndpoint}/storage/quota`, {
                headers: {
                    ...this.auth.getAuthHeaders()
                }
            });
            const data = await response.json();

            // 更新已用存储（智能单位）
            const usedText = this.formatFileSize(data.totalUsed);
            document.getElementById('storageUsed').textContent = usedText;

            // 更新总容量（如果设置了配额则显示，否则显示"无限"）
            if (data.unlimited || !data.totalQuota) {
                document.getElementById('storageTotal').textContent = '∞';
            } else {
                const totalText = this.formatFileSize(data.totalQuota);
                document.getElementById('storageTotal').textContent = totalText;
            }
        } catch (error) {
            console.error('Failed to update storage info:', error);
            // 出错时使用文件列表计算
            const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
            document.getElementById('storageUsed').textContent = this.formatFileSize(totalSize);
            document.getElementById('storageTotal').textContent = '10 GB';
        }
    }

    getFileIcon(type) {
        if (type.startsWith('image/')) return 'fa-file-image';
        if (type.startsWith('video/')) return 'fa-file-video';
        if (type.startsWith('audio/')) return 'fa-file-audio';
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('word')) return 'fa-file-word';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fa-file-excel';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'fa-file-powerpoint';
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'fa-file-archive';
        if (type.includes('text')) return 'fa-file-alt';
        return 'fa-file';
    }

    getFileIconColor(type) {
        if (type.startsWith('image/')) return 'text-green-600';
        if (type.startsWith('video/')) return 'text-purple-600';
        if (type.startsWith('audio/')) return 'text-pink-600';
        if (type.includes('pdf')) return 'text-red-600';
        if (type.includes('word')) return 'text-blue-600';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'text-green-600';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-600';
        if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return 'text-yellow-600';
        if (type.includes('text')) return 'text-gray-600';
        return 'text-gray-500';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);

        // 根据语言返回完整的日期时间格式
        if (this.i18n.lang === 'zh') {
            // 中文格式：2025-10-02 14:30
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
            // 英文格式：Oct 2, 2025, 2:30 PM
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = document.getElementById('toastIcon');
        const toastMessage = document.getElementById('toastMessage');

        // 设置图标和颜色
        const iconClasses = {
            success: 'fa-check-circle text-green-500',
            error: 'fa-times-circle text-red-500',
            warning: 'fa-exclamation-circle text-yellow-500',
            info: 'fa-info-circle text-blue-500'
        };

        toastIcon.className = `fas ${iconClasses[type]}`;
        toastMessage.textContent = message;

        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    isCodeFile(filename) {
        const codeExtensions = [
            'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
            'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala',
            'html', 'css', 'scss', 'sass', 'less', 'xml', 'json', 'yaml', 'yml',
            'sh', 'bash', 'sql', 'r', 'lua', 'perl', 'dart', 'vue',
            'svelte', 'astro', 'prisma', 'graphql', 'proto'
        ];
        const ext = filename.split('.').pop().toLowerCase();
        return codeExtensions.includes(ext);
    }

    getCodeLanguage(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'h': 'c',
            'hpp': 'cpp',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            'xml': 'xml',
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'sh': 'bash',
            'bash': 'bash',
            'sql': 'sql',
            'r': 'r',
            'lua': 'lua',
            'perl': 'perl',
            'dart': 'dart',
            'vue': 'vue',
            'svelte': 'svelte',
            'astro': 'astro',
            'prisma': 'prisma',
            'graphql': 'graphql',
            'proto': 'protobuf'
        };
        return languageMap[ext] || 'plaintext';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化应用
const app = new PebbleDrive();