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
- 📤 **智能上传** - 拖拽上传，简单上传最大 200MB，分片上传最大 5GB
- 🔗 **灵活分享** - 标准链接/短链接切换，密码保护，限时限次下载
- 👁️ **文件预览** - 图片、PDF、Markdown、代码高亮、SVG
- 🔐 **安全防护** - SHA-256 哈希、速率限制、Turnstile 人机验证
- 🌍 **多语言** - 中文/英文自适应
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

### 方式 1：一键部署（Backend + Frontend）⭐ 最简单

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aydomini/pebble-drive)

**🎉 真正的一键部署！点击按钮后**：

1. 登录 Cloudflare 账号
2. 系统自动创建资源（D1、R2、KV）
3. ✅ **自动构建并部署 Frontend**
4. ✅ **自动部署 Backend API**
5. ✅ **数据库自动初始化**
6. ✅ **使用临时密码**：`TEMP_PASSWORD_CHANGE_ME`

**访问地址**：`https://pebble-drive.{your-subdomain}.workers.dev`

**架构说明**：

- 📦 前后端合并部署到**单个 Worker**（使用 Workers Assets）
- ✅ 统一域名（无跨域问题）
- ✅ 代码仍然分离（frontend/ + backend/ 独立开发）
- ✅ **防缓存逻辑已迁移**：从 Pages Functions 迁移到 Worker 中间件
- ⚠️ 代码大小限制：1MB 压缩后（当前 ~700KB，充足）

**🔧 技术细节**：

防缓存机制（分享/下载核心功能）：
- ✅ 时间戳重定向（`_t` 参数防止浏览器缓存）
- ✅ 动态时间窗口（桌面1秒/移动3秒/弱网5秒）
- ✅ 时钟偏差容忍（支持客户端时间不同步）
- ✅ 强制 no-cache 头（确保下载次数限制生效）

**⚠️ 重要：修改默认密码**（强烈推荐）

应用已可用，但使用的是**临时密码**。请立即修改：

1. **方式A：在 Cloudflare Dashboard 修改**（推荐）
   - 访问：[Workers & Pages](https://dash.cloudflare.com/) → `pebble-drive-api` → Settings → Variables
   - 修改 `AUTH_PASSWORD` 为你的安全密码
   - 修改 `AUTH_TOKEN_SECRET` 为随机字符串（如：`openssl rand -base64 32` 生成）

2. **方式B：使用 CLI 修改**（更安全）

   ```bash
   cd backend

   # 覆盖为安全密码
   echo "your-secure-password" | npx wrangler secret put AUTH_PASSWORD

   # 覆盖为随机 JWT 密钥
   openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET

   # 配置 Turnstile（可选）
   echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY
   ```

---

### 方式 2：GitHub Actions 一键部署 ⭐ 推荐新手

[![Deploy with GitHub Actions](https://img.shields.io/badge/Deploy-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](../../actions/workflows/deploy.yml)

1. **Fork 本项目**到你的 GitHub 账号
2. **配置 GitHub Secrets**（Settings → Secrets and variables → Actions）：
   - `CLOUDFLARE_API_TOKEN`：[获取 API Token](https://dash.cloudflare.com/profile/api-tokens)
   - `CLOUDFLARE_ACCOUNT_ID`：[查看 Account ID](https://dash.cloudflare.com/)
   - `TURNSTILE_SITE_KEY`（可选）：[创建 Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)

3. **点击 Actions** → **Deploy PebbleDrive** → **Run workflow**
   - 可选配置：文件大小限制、存储配额、上传限制、项目名称

4. **配置登录密码**（在本地运行）：

   ```bash
   cd backend
   echo "your-password" | npx wrangler secret put AUTH_PASSWORD
   openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET
   ```

🎉 完成！访问部署输出的 URL 即可使用。

---

### 方式 3：本地命令行部署

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

---

### 📊 部署模式对比

| 特性 | 方式 1：一键部署 | 方式 2/3：分离部署 |
|------|----------------|------------------|
| **部署复杂度** | ⭐⭐⭐⭐⭐ 最简单 | ⭐⭐⭐ 需配置多项 |
| **部署时间** | ~2分钟 | ~16分钟 |
| **域名** | 单一域名 | 两个域名（需配置 BACKEND_URL） |
| **防缓存实现** | Worker 中间件 | Pages Functions |
| **适用场景** | 新手、快速部署 | 大型项目、团队协作 |

**推荐**：90% 的用户适合使用**方式 1（一键部署）**

---

📚 **详细部署指南**：[DEPLOY.md](DEPLOY.md)

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [DEPLOY.md](DEPLOY.md) | 完整部署指南（后端/前端/短链接配置） |
| [CHANGELOG.md](CHANGELOG.md) | 版本更新日志 |

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
