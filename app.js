/**
 * Demo 模式检测和 API 拦截
 */
const DEMO_MODE = window.DEMO_MODE === true;

if (DEMO_MODE) {
    console.log('🎭 Demo Mode Active - Using mock data');

    // 拦截 fetch，使用模拟数据
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // 登录请求
        if (url.includes('/api/login')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(window.DEMO_API.login())
            });
        }

        // 获取文件列表
        if (url.includes('/api/files')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(window.DEMO_API.getFiles())
            });
        }

        // 获取存储信息
        if (url.includes('/api/storage/quota')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(window.DEMO_API.getStorage())
            });
        }

        // 下载文件
        if (url.includes('/api/download')) {
            const fileId = new URL(url, location.origin).searchParams.get('id');
            return window.DEMO_API.download(fileId)
                .then(content => ({
                    ok: true,
                    text: () => Promise.resolve(content),
                    blob: () => Promise.resolve(new Blob([content]))
                }))
                .catch(error => ({
                    ok: false,
                    json: () => Promise.resolve({ error: error.message })
                }));
        }

        // 上传/删除/分享 - 返回错误
        if (url.includes('/api/upload') || url.includes('/api/delete') || url.includes('/api/share')) {
            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    error: 'This feature is disabled in demo mode',
                    message: 'Demo 模式不支持此功能'
                })
            });
        }

        // 其他请求使用原始 fetch
        return originalFetch(url, options);
    };
}

/**
 * 主题管理类
 */
class ThemeManager {
    constructor() {
        this.theme = this.getTheme();
        this.applyTheme(this.theme);
    }

    /**
     * 从 localStorage 获取主题
     */
    getTheme() {
        return localStorage.getItem('pebbledrive_theme') || 'light';
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
                deleteConfirm: '确定要删除这个文件吗？',
                deleteSuccess: '删除成功',
                deleteFailed: '删除失败',
                copySuccess: '已复制到剪贴板',
                copyFailed: '复制失败',
                refreshSuccess: '文件列表已刷新',

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
                noSearchResults: '没有找到匹配的文件'
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
                deleteConfirm: 'Are you sure you want to delete this file?',
                deleteSuccess: 'Deleted successfully',
                deleteFailed: 'Delete failed',
                copySuccess: 'Copied to clipboard',
                copyFailed: 'Copy failed',
                refreshSuccess: 'File list refreshed',

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
                noSearchResults: 'No matching files found'
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
        // 更新语言切换按钮文本
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.innerHTML = `<span class="text-sm font-semibold">${newLang === 'zh' ? '中/EN' : 'EN/中'}</span>`;
        }
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
     */
    async login(password) {
        const response = await fetch(`${this.apiEndpoint}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
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
        // 检查是否已登录
        if (!this.auth.isAuthenticated()) {
            this.showLoginScreen();
        } else {
            this.showAppScreen();
        }
    }

    /**
     * 显示登录界面
     */
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
        this.setupLoginEventListeners();
    }

    /**
     * 显示主应用界面
     */
    showAppScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'flex';
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
            loginBtnText.textContent = '登录中...';
            loginError.classList.add('hidden');

            try {
                await this.auth.login(password);
                // 登录成功，显示主界面
                this.showAppScreen();
            } catch (error) {
                // 显示错误
                loginErrorText.textContent = error.message;
                loginError.classList.remove('hidden');
                // 清空密码输入框
                passwordInput.value = '';
                // 重新聚焦到密码输入框
                passwordInput.focus();
            } finally {
                // 恢复按钮状态
                loginBtn.disabled = false;
                loginBtnText.textContent = '登录';
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

        // 刷新按钮
        refreshBtn.addEventListener('click', () => {
            this.loadFiles();
            this.showToast(this.i18n.t('refreshSuccess'), 'success');
        });

        // 登出按钮
        logoutBtn.addEventListener('click', () => {
            this.auth.logout();
            this.showLoginScreen();
        });

        // 主题切换按钮
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.theme.toggle();
            });
        }

        // 语言切换按钮
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.i18n.toggle();
                // 重新渲染文件列表以更新界面文本
                this.filterFiles();
            });
        }

        // 搜索和排序
        searchInput.addEventListener('input', this.debounce(this.filterFiles.bind(this), 300));
        sortBy.addEventListener('change', this.sortFiles.bind(this));

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
        const validFiles = files.filter(file => file.size <= 100 * 1024 * 1024); // 100MB限制

        if (validFiles.length !== files.length) {
            this.showToast('部分文件超过100MB限制，已自动过滤', 'warning');
        }

        if (validFiles.length === 0) return;

        this.showUploadProgress(validFiles);

        for (const file of validFiles) {
            await this.uploadFile(file);
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
            progressItem.innerHTML = `
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-[10px] font-medium text-gray-700 dark:text-gray-200 truncate flex-1">${file.name}</span>
                    <span class="text-[9px] text-gray-500 dark:text-gray-400 ml-1">${this.formatFileSize(file.size)}</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div class="progress-bar bg-blue-600 dark:bg-blue-500 h-1 rounded-full transition-all" style="width: 0%"></div>
                </div>
            `;
            progressList.appendChild(progressItem);
        });
    }

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 调用 API 上传文件
            const response = await fetch(`${this.apiEndpoint}/upload`, {
                method: 'POST',
                headers: {
                    ...this.auth.getAuthHeaders()
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(this.i18n.t('uploadFailed'));
            }

            const fileInfo = await response.json();
            this.files.push(fileInfo);
            this.showToast(`${file.name} ${this.i18n.t('uploadSuccess')}`, 'success');
            this.renderFileList();
            this.updateStorageInfo();

        } catch (error) {
            console.error('Upload error:', error);
            this.showToast(`${this.i18n.t('uploadFailed')}: ${error.message}`, 'error');
        }
    }

    async loadFiles() {
        try {
            // 调用 API 加载文件列表
            const response = await fetch(`${this.apiEndpoint}/files`, {
                headers: {
                    ...this.auth.getAuthHeaders()
                }
            });
            this.files = await response.json();

            this.renderFileList();
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
                 data-file-id="${file.id}"
                 onclick="app.selectFile('${file.id}')">
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
            this.renderFileList(); // 重新渲染以更新高亮状态
        } else {
            // 选中新文件
            this.selectedFileId = fileId;
            this.showFilePreview(fileId);
            this.renderFileList(); // 重新渲染以更新高亮状态
        }
    }

    clearPreview() {
        const previewArea = document.getElementById('previewArea');
        if (previewArea) {
            previewArea.innerHTML = `
                <div class="flex items-center justify-center h-full text-gray-400">
                    <div class="text-center">
                        <i class="fas fa-file text-6xl mb-4"></i>
                        <p class="text-sm">选择文件以预览</p>
                    </div>
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 flex flex-col gap-3 overflow-auto">
                        <!-- SVG 渲染预览 -->
                        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center" style="min-height: 200px;">
                            <img class="svgImage-${file.id} max-w-full max-h-64 object-contain"
                                 alt="${file.name}">
                        </div>
                        <!-- SVG 代码预览 -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">${this.i18n.t('svgSource')}</span>
                            </div>
                            <pre class="overflow-auto" style="max-height: 300px;"><code class="svgPreview-${file.id} language-xml text-xs">${this.i18n.t('loading')}</code></pre>
                        </div>
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex-shrink-0">
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
                    const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                        headers: {
                            ...this.auth.getAuthHeaders()
                        }
                    });
                    const text = await response.text();
                    const previewElements = document.querySelectorAll(`.svgPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
                        hljs.highlightElement(el);
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                        <img class="imagePreview-${file.id} max-w-full max-h-full object-contain rounded-lg shadow-lg"
                             alt="${file.name}">
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <iframe class="pdfPreview-${file.id} w-full h-full"
                                frameborder="0"></iframe>
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg overflow-hidden p-4">
                        <div class="markdown-preview markdownPreview-${file.id} text-sm text-gray-800 dark:text-gray-100 h-full overflow-auto">${this.i18n.t('loading')}</div>
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
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
                    const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                        headers: {
                            ...this.auth.getAuthHeaders()
                        }
                    });
                    const text = await response.text();
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden p-3">
                        <pre class="h-full overflow-auto m-0"><code class="codePreview-${file.id} ${language} text-xs">${this.i18n.t('loading')}</code></pre>
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
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
                    const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                        headers: {
                            ...this.auth.getAuthHeaders()
                        }
                    });
                    const text = await response.text();
                    const previewElements = document.querySelectorAll(`.codePreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
                        hljs.highlightElement(el);
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
                <div class="w-full h-full flex flex-col">
                    <div class="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden p-3">
                        <pre class="textPreview-${file.id} text-xs text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono h-full overflow-auto">${this.i18n.t('loading')}</pre>
                    </div>
                    <div class="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
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
                    const response = await fetch(`${this.apiEndpoint}/download?id=${file.id}`, {
                        headers: {
                            ...this.auth.getAuthHeaders()
                        }
                    });
                    const text = await response.text();
                    // 更新所有匹配的预览元素（桌面端和移动端）
                    const previewElements = document.querySelectorAll(`.textPreview-${file.id}`);
                    previewElements.forEach(el => {
                        el.textContent = text;
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
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                        <i class="fas ${this.getFileIcon(file.type)} text-2xl ${this.getFileIconColor(file.type)}"></i>
                    </div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate px-4">${file.name}</h3>
                    <p class="text-gray-600 dark:text-gray-400 text-xs mb-4">${this.i18n.t('unknownFile')}</p>
                    <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 max-w-md mx-auto">
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
                            <span class="text-sm text-gray-700">${this.i18n.t('limitDownloads')}</span>
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
                            <span class="text-sm text-gray-700">${this.i18n.t('setPassword')}</span>
                        </label>
                        <div id="sharePasswordOptions" class="mt-2 ml-6 hidden">
                            <input type="password" id="sharePasswordInput"
                                   class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-gray-100"
                                   placeholder="${this.i18n.t('enterPassword')}">
                        </div>
                    </div>
                </div>

                <div class="flex space-x-3 pt-4 border-t">
                    <button onclick="app.createAdvancedShare('${file.id}')"
                            class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        <i class="fas fa-share mr-2"></i>${this.i18n.t('generateShareLink')}
                    </button>
                    <button onclick="app.hideModal()"
                            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
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

            // 复制链接到剪贴板
            await navigator.clipboard.writeText(data.shareUrl);

            // 显示成功消息
            let message = '分享链接已复制到剪贴板';
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

    async deleteFile(fileId) {
        if (!confirm(this.i18n.t('deleteConfirm'))) return;

        const file = this.files.find(f => f.id === fileId);
        if (file) {
            try {
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
        const filteredFiles = this.files.filter(file =>
            file.name.toLowerCase().includes(searchTerm)
        );
        this.renderFilteredFiles(filteredFiles);
    }

    sortFiles() {
        const sortBy = document.getElementById('sortBy').value;
        let sortedFiles = [...this.files];

        switch(sortBy) {
            case 'name':
                sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
                sortedFiles.sort((a, b) => b.size - a.size);
                break;
            case 'date':
                sortedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
                break;
        }

        this.files = sortedFiles;
        this.renderFileList();
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