# 🌟 PebbleDrive - 轻量级云存储

**中文** | [English](README_EN.md) | **[🎭 在线 Demo](https://aydomini.github.io/pebble-drive/)**

> 🚀 **5分钟部署，完全免费的私人云盘**
>
> **无服务器架构** | **全球 CDN 加速** | **企业级安全防护**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/)

---

## 📋 项目特性

### 🎯 核心功能
- 🚀 **无服务器架构** - Cloudflare Workers 全球边缘部署，免费 10 万次请求/天
- 📦 **三存储系统** - R2 (文件，10GB 免费) + D1 (元数据，5GB 免费) + KV (会话/速率限制)
- 📤 **智能上传** - 拖拽上传，单文件最大 5GB，支持分片上传，断点续传
- 🔍 **高级管理** - 文件搜索、排序、分页，智能存储配额管理
- 🔗 **安全分享** - 密码保护 (SHA-256)、限时链接、下载次数限制、速率限制防暴力破解
- 👁️ **全能预览** - 图片、PDF、Markdown、40+ 种代码语言、SVG、纯文本
- 🔐 **企业级安全** - Turnstile 人机验证、JWT 认证、IP 速率限制、账户锁定、密码哈希存储
- 🌍 **多语言** - 中/英/日自适应切换
- 🌓 **深色模式** - 自适应主题，支持系统偏好
- 📱 **响应式设计** - 完美适配桌面/平板/手机

### 🏗️ 技术架构

**数据流**：
```
用户 → Pages (前端) → Workers (API) → R2 (文件) + D1 (元数据) + KV (限流/会话)
```

**三存储系统设计**：

| 存储 | 用途 | 优势 | 免费额度 |
|-----|------|------|---------|
| **R2** | 文件内容 | 无出站流量费、全球 CDN、大文件友好 | 10GB 存储 |
| **D1** | 结构化数据 | 复杂查询、事务支持、外键关联 | 5GB 数据库 |
| **KV** | 键值数据 | 毫秒级读写、全球分布、速率限制 | 1GB 存储 |

### 💻 技术栈

**前端**
- Vite 5.x + Vanilla JavaScript ES6+
- TailwindCSS (原子化 CSS)
- Marked.js (Markdown) + Highlight.js (代码高亮)

**后端**
- Cloudflare Workers (V8 引擎)
- R2 + D1 + KV 三存储
- JWT + Turnstile 安全认证
- RESTful API

**部署**
- GitHub Actions 自动化 CI/CD
- Wrangler CLI 工具链
- 跨平台部署脚本 (Node.js)

---

## 🚀 快速开始

### ⚡ 一键部署（3分钟）

```bash
# 1. 克隆项目
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login

# 4. 一键部署
npm run deploy
```

**🎉 完成！** 脚本会自动：
- ✅ 检查环境和登录状态
- ✅ 引导你选择配置预设
- ✅ 自动部署后端和前端
- ✅ 输出访问地址

**📝 首次部署后需要设置密码：**
```bash
cd backend
echo "your-password" | npx wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET
```

---

### 📚 详细文档

| 文档 | 说明 |
|------|------|
| **[DEPLOY.md](DEPLOY.md)** | 完整部署指南（本地/GitHub Actions/手动） |
| **[CHANGELOG.md](CHANGELOG.md)** | 版本更新日志和功能说明 |
| **[在线 Demo](https://aydomini.github.io/pebble-drive/)** | 在线演示（无需部署） |

---

## 📖 API 文档

<details>
<summary><b>点击展开查看 API 接口</b></summary>

### 认证
```http
POST /api/login
Content-Type: application/json

{ "password": "your-password" }
```

### 文件操作
```http
POST   /api/upload              # 上传文件
POST   /api/upload/init         # 分片上传初始化
POST   /api/upload/chunk        # 上传分片
POST   /api/upload/complete     # 完成分片上传
POST   /api/upload/abort        # 中止分片上传
GET    /api/files               # 文件列表（支持分页、搜索、排序）
GET    /api/download?id=xxx     # 下载文件
DELETE /api/delete?id=xxx       # 删除文件
```

### 分享功能
```http
POST /api/share
Content-Type: application/json

{
  "fileId": "xxx",
  "password": "optional",      // 可选，SHA-256 哈希存储
  "expiry": 3600,             // 秒，可选
  "downloadLimit": 10         // 次数，可选
}

GET /share/:token              # 访问分享链接
POST /share/:token/verify      # 验证密码（速率限制 5次/小时）
```

### 配置
```http
GET /api/config/limits         # 获取上传限制配置
GET /api/storage/quota         # 存储配额信息
```

</details>

---

## ❓ 常见问题

<details>
<summary><b>Q1: 如何修改登录密码？</b></summary>

```bash
cd backend
echo "new-password" | npx wrangler secret put AUTH_PASSWORD
```
无需重新部署，立即生效。
</details>

<details>
<summary><b>Q2: 超出免费额度怎么办？</b></summary>

超出后按量付费，成本极低：
- Workers: $0.50/百万请求
- R2: $0.015/GB 存储 + $0.01/GB 出站
- D1: $0.75/GB 数据库
- KV: $0.50/GB 存储 + $0.50/百万次读 + $5.00/百万次写

个人使用场景：约 10GB 存储 + 1000 次上传/月 = **约 $0.20/月**
</details>

<details>
<summary><b>Q3: 如何配置自定义域名？</b></summary>

### 后端 API 域名
1. Cloudflare Dashboard → Workers → Triggers → Custom Domains
2. 添加域名（如 `storage.yourdomain.com`）

### 前端域名
1. Cloudflare Dashboard → Pages → Custom domains
2. 添加域名（如 `file.yourdomain.com`）

### 重新构建前端
```bash
cd frontend
VITE_API_BASE_URL=https://storage.yourdomain.com \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```

详细配置参考 [DEPLOY.md](DEPLOY.md)
</details>

<details>
<summary><b>Q4: 支持哪些文件预览？</b></summary>

- **图片**：JPG, PNG, GIF, WebP, SVG
- **文档**：PDF, Markdown
- **代码**：JavaScript/TypeScript, Python, Java, Go, Rust, C/C++, HTML/CSS, JSON, YAML, SQL, Vue, React 等 40+ 种
- **其他**：TXT 纯文本
</details>

<details>
<summary><b>Q5: 如何备份数据？</b></summary>

```bash
# 备份数据库
wrangler d1 export pebble-drive-db --output=backup.sql

# 查看 R2 文件列表
wrangler r2 object list pebble-drive-storage
```
</details>

<details>
<summary><b>Q6: 部署失败怎么办？</b></summary>

**常见问题排查：**

1. **登录失败** - 检查 `VITE_API_BASE_URL` 环境变量是否正确设置
2. **Turnstile 验证失败** - 确认域名已添加到 Turnstile 配置
3. **文件上传失败** - 检查 R2 存储桶绑定和权限
4. **数据库错误** - 确认 D1 数据库已初始化表结构

详细排查指南参考 [DEPLOY.md](DEPLOY.md) 的"故障排查"章节。
</details>

---

## 🔧 可用命令

### 部署相关
```bash
npm run deploy   # 一键部署（推荐）
npm run upgrade  # 自动升级
npm run check    # 部署前检查
```

### 开发相关
```bash
npm run dev:backend   # 启动后端开发服务器
npm run dev:frontend  # 启动前端开发服务器
npm run build         # 构建前端
```

---

## 🗺️ 路线图

- [ ] 视频/音频预览
- [ ] 文件夹支持
- [ ] 批量操作
- [ ] Office 文档预览
- [ ] 移动端 App

---

## 📄 许可证

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
