// Demo 模式模拟数据
window.DEMO_MODE = true;
window.DEMO_DATA = {
    // 模拟文件列表
    files: [
        {
            id: 'demo-1',
            name: 'README.md',
            size: 2048,
            type: 'text/markdown',
            uploadDate: new Date('2024-10-01T10:00:00').toISOString(),
            downloadUrl: '#'
        },
        {
            id: 'demo-2',
            name: 'project-demo.png',
            size: 524288,
            type: 'image/png',
            uploadDate: new Date('2024-10-01T11:30:00').toISOString(),
            downloadUrl: '#'
        },
        {
            id: 'demo-3',
            name: 'example.js',
            size: 4096,
            type: 'application/javascript',
            uploadDate: new Date('2024-10-01T14:20:00').toISOString(),
            downloadUrl: '#'
        },
        {
            id: 'demo-4',
            name: 'document.pdf',
            size: 1048576,
            type: 'application/pdf',
            uploadDate: new Date('2024-10-02T09:15:00').toISOString(),
            downloadUrl: '#'
        },
        {
            id: 'demo-5',
            name: 'logo.svg',
            size: 8192,
            type: 'image/svg+xml',
            uploadDate: new Date('2024-10-02T16:45:00').toISOString(),
            downloadUrl: '#'
        }
    ],

    // 模拟存储配额
    storage: {
        totalQuota: 10737418240, // 10GB
        totalUsed: 1638400,      // ~1.5MB
        quotaGB: 10,
        usagePercentage: '0.01',
        unlimited: false
    },

    // 模拟 Markdown 内容
    markdownContent: `# PebbleDrive Demo

欢迎体验 **PebbleDrive** 演示版本！

## ✨ 功能展示

这是一个纯前端演示页面，展示了 PebbleDrive 的界面和交互功能。

### 支持的功能
- ✅ 文件列表展示
- ✅ 文件预览（Markdown、代码、图片、SVG）
- ✅ 深色模式切换
- ✅ 中英文切换
- ✅ 响应式设计

### 限制说明
- ❌ 无法真实上传/下载文件（Demo 模式）
- ❌ 无法创建分享链接
- ℹ️ 所有数据均为模拟数据

## 🚀 完整功能

要体验完整功能，请参考 [部署文档](https://github.com/aydomini/pebble-drive#readme) 自行部署。

---

**Built with ❤️ using Cloudflare Workers**`,

    // 模拟 JavaScript 代码
    jsCode: `// PebbleDrive Demo Code
function uploadFile(file) {
    return fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        console.log('Upload success:', data);
    })
    .catch(error => {
        console.error('Upload failed:', error);
    });
}`,

    // 模拟 SVG 内容（更明显的图形 - 蓝色圆圈 + PD 文字 + 边框）
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- 背景 -->
  <rect width="200" height="200" fill="#f0f9ff"/>
  <!-- 外边框 -->
  <rect x="10" y="10" width="180" height="180" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <!-- 蓝色圆圈 -->
  <circle cx="100" cy="100" r="60" fill="#3b82f6"/>
  <!-- 内圆 -->
  <circle cx="100" cy="100" r="45" fill="#60a5fa"/>
  <!-- 文字 PD -->
  <text x="100" y="120" text-anchor="middle" fill="white" font-size="50" font-family="Arial, sans-serif" font-weight="bold">PD</text>
  <!-- 副标题 -->
  <text x="100" y="185" text-anchor="middle" fill="#3b82f6" font-size="14" font-family="Arial, sans-serif">PebbleDrive Demo</text>
</svg>`,

    // 模拟 PNG 图片数据（彩色渐变方块，更明显）
    pngDataUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%233b82f6'/%3E%3Ctext x='100' y='90' text-anchor='middle' fill='white' font-size='24' font-family='Arial' font-weight='bold'%3EDEMO PNG%3C/text%3E%3Ctext x='100' y='120' text-anchor='middle' fill='white' font-size='16' font-family='Arial'%3EPebbleDrive%3C/text%3E%3Ctext x='100' y='145' text-anchor='middle' fill='white' font-size='14' font-family='Arial'%3ETest Image%3C/text%3E%3C/svg%3E`,

    // 模拟 PDF 文档 URL（使用公开的测试 PDF）
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf'
};

// 模拟 API 调用
window.DEMO_API = {
    login: (password) => {
        return Promise.resolve({
            success: true,
            token: 'demo-token-12345',
            message: 'Demo mode - Any password works!'
        });
    },

    getFiles: () => {
        return Promise.resolve(window.DEMO_DATA.files);
    },

    getStorage: () => {
        return Promise.resolve(window.DEMO_DATA.storage);
    },

    upload: (file) => {
        return Promise.reject(new Error('Upload disabled in demo mode'));
    },

    delete: (fileId) => {
        return Promise.reject(new Error('Delete disabled in demo mode'));
    },

    download: (fileId) => {
        const file = window.DEMO_DATA.files.find(f => f.id === fileId);
        if (file) {
            // 根据文件类型返回模拟内容
            if (file.name === 'README.md') {
                return Promise.resolve(window.DEMO_DATA.markdownContent);
            } else if (file.name === 'example.js') {
                return Promise.resolve(window.DEMO_DATA.jsCode);
            } else if (file.name === 'logo.svg') {
                return Promise.resolve(window.DEMO_DATA.svgContent);
            } else if (file.name === 'project-demo.png') {
                return Promise.resolve(window.DEMO_DATA.pngDataUrl);
            } else if (file.name === 'document.pdf') {
                return Promise.resolve(window.DEMO_DATA.pdfUrl);
            }
        }
        return Promise.reject(new Error('File not found'));
    },

    share: (fileId, options) => {
        return Promise.reject(new Error('Share disabled in demo mode'));
    }
};

console.log('🎭 Demo Mode Active - Using mock data');
