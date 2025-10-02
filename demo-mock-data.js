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
            downloadUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
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

    // 模拟 SVG 内容
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
  <circle cx="50" cy="50" r="40" fill="#3B82F6"/>
  <text x="50" y="60" text-anchor="middle" fill="white" font-size="40" font-family="Arial">PD</text>
</svg>`
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
            }
        }
        return Promise.reject(new Error('File not found'));
    },

    share: (fileId, options) => {
        return Promise.reject(new Error('Share disabled in demo mode'));
    }
};

console.log('🎭 Demo Mode Active - Using mock data');
