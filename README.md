# 🌟 PebbleDrive - 轻量级云存储

**中文** | [English](README_EN.md) | **[🎭 在线 Demo](https://aydomini.github.io/pebble-drive/)**

> 🚀 **基于 Cloudflare Workers 的免费私人云盘**
>
> **无服务器架构** | **全球 CDN 加速** | **企业级安全**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/)

---

## 📋 核心特性

- 🚀 **无服务器架构** - Cloudflare Workers 边缘计算，免费 10 万次请求/天
- 📦 **三存储系统** - R2 (文件) + D1 (元数据) + KV (速率限制)
- 📤 **智能上传** - 拖拽上传，最大 200MB，支持断点续传
- 🔗 **灵活分享** - 标准链接/短链接切换，密码保护，限时限次下载
- 👁️ **文件预览** - 图片、PDF、Markdown、代码高亮、SVG
- 🔐 **安全防护** - SHA-256 哈希、速率限制、Turnstile 人机验证
- 🌍 **多语言** - 中文/英文/日文自适应
- 🌓 **主题切换** - 亮色/暗色模式
- 📱 **响应式** - 完美适配桌面/平板/手机

---

## 🏗️ 技术架构

```
用户 → Pages (前端) → Workers (后端) → R2 + D1 + KV
```

| 存储 | 用途 | 免费额度 |
|-----|------|---------|
| **R2** | 文件内容，无出站流量费 | 10GB |
| **D1** | 文件元数据，支持复杂查询 | 5GB |
| **KV** | 速率限制，毫秒级读写 | 1GB |

**技术栈**：Vite + Vanilla JS + TailwindCSS + Cloudflare Workers

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. 登录 Cloudflare
npx wrangler login

# 3. 一键部署
npm run deploy

# 4. 设置密码（首次必需）
cd backend
echo "your-password" | npx wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET
```

🎉 完成！访问输出的 URL 即可使用。

📚 **详细部署指南**：[DEPLOY.md](DEPLOY.md)

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [DEPLOY.md](DEPLOY.md) | 完整部署指南（后端/前端/短链接配置） |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新日志 |

---

## 💡 主要 API

<details>
<summary><b>点击查看 API 端点</b></summary>

**认证**
```http
POST /api/login
Body: { "password": "your-password" }
```

**文件操作**
```http
POST   /api/upload         # 上传文件
GET    /api/files          # 文件列表
GET    /api/download?id=x  # 下载文件
DELETE /api/delete?id=x    # 删除文件
```

**分享**
```http
POST /api/share
Body: {
  "fileId": "xxx",
  "password": "optional",     # 可选密码保护
  "expiry": 3600,            # 可选有效期（秒）
  "downloadLimit": 10        # 可选下载次数
}

GET  /share/:token           # 访问分享链接
POST /share/:token/verify    # 密码验证
```

</details>

---

## ❓ 常见问题

<details>
<summary><b>如何修改登录密码？</b></summary>

```bash
cd backend
echo "new-password" | npx wrangler secret put AUTH_PASSWORD
```
立即生效，无需重新部署。
</details>

<details>
<summary><b>如何配置自定义域名？</b></summary>

在 Cloudflare Dashboard 中配置自定义域名后，重新构建前端：
```bash
cd frontend
VITE_API_BASE_URL=https://your-backend-domain.com \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```
详见 [DEPLOY.md](DEPLOY.md)
</details>

<details>
<summary><b>支持哪些文件预览？</b></summary>

- **图片**：JPG, PNG, GIF, WebP, SVG
- **文档**：PDF, Markdown
- **代码**：JavaScript, Python, Java, Go, Rust, C/C++, JSON, YAML, SQL 等 40+ 种
- **其他**：纯文本
</details>

<details>
<summary><b>如何备份数据？</b></summary>

```bash
# 导出数据库
wrangler d1 export pebble-drive-db --output=backup.sql

# 查看 R2 文件
wrangler r2 object list pebble-drive-storage
```
</details>

更多问题参考 [DEPLOY.md](DEPLOY.md) 的"常见问题"章节。

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

感谢以下开源项目和服务：

- [Cloudflare Workers](https://workers.cloudflare.com/) - 无服务器平台
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [Vite](https://vitejs.dev/) - 前端构建工具
- [Marked.js](https://marked.js.org/) - Markdown 解析器
- [Highlight.js](https://highlightjs.org/) - 代码高亮
- [FontAwesome](https://fontawesome.com/) - 图标库

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=aydomini/pebble-drive&type=Date)](https://star-history.com/#aydomini/pebble-drive&Date)

---

**Built with ❤️ using Cloudflare Workers**
