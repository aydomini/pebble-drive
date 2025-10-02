# 🌟 PebbleDrive - 轻量级云存储

**中文** | [English](README_EN.md) | **[🎭 在线 Demo](https://aydomini.github.io/pebble-drive/demo.html)**

> 基于 Cloudflare Workers + R2 + D1 的现代化云存储解决方案
>
> **完全免费部署** | **全球 CDN 加速** | **智能存储管理**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/demo.html)

---

## 📋 项目特性

### 核心功能
- 🚀 **无服务器架构** - Cloudflare Workers 全球边缘部署，免费 10 万次请求/天
- 📦 **双存储系统** - R2 存储文件（10GB 免费）+ D1 存储元数据（5GB 免费）
- 📤 **拖拽上传** - 支持多文件上传，单文件最大 100MB
- 🔗 **高级分享** - 密码保护、限时链接、限制下载次数
- 👁️ **文件预览** - 支持图片、PDF、Markdown、40+ 种代码语言、SVG
- 🌍 **多语言界面** - 中文/English 切换
- 🌓 **深色模式** - 自适应主题切换
- 📱 **响应式设计** - 桌面/移动端完美适配

### 技术架构
```
用户 → Cloudflare Pages (前端) → Workers (后端) → R2 (文件) + D1 (元数据)
```

**为什么需要 R2 和 D1？**

| 存储 | 用途 | 优势 |
|-----|------|------|
| **R2** | 文件内容 | 无出站流量费用、全球 CDN、10GB 免费 |
| **D1** | 文件元数据 | 复杂查询、事务支持、外键关联、5GB 免费 |

**工作流程**：上传 → 文件存 R2 → 元数据存 D1 → 分享验证 → 返回文件

### 技术栈
- **前端**: Vite + Vanilla JS + TailwindCSS
- **后端**: Cloudflare Workers + R2 + D1
- **部署**: GitHub Actions + Wrangler CLI

---

## 🚀 快速开始

### 方式一：GitHub Actions 自动部署（推荐）

**适合：Fork 后自动部署，推送代码即可**

1. **Fork 本项目**到你的 GitHub 账号

2. **设置 GitHub Secrets**（Settings → Secrets → Actions）
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
   - `PAGES_PROJECT_NAME` - Pages 项目名（可选，默认 `pebble-drive`）

3. **创建 Cloudflare 资源并配置**
   ```bash
   wrangler r2 bucket create pebble-drive-storage
   wrangler d1 create pebble-drive-db
   # 编辑 backend/wrangler.toml，替换 database_id
   ```

4. **推送代码，触发自动部署**
   ```bash
   git add .
   git commit -m "Configure database_id"
   git push
   ```

5. **部署成功后，设置环境变量**
   ```bash
   cd backend
   echo "your-password" | wrangler secret put AUTH_PASSWORD
   echo "your-secret" | wrangler secret put AUTH_TOKEN_SECRET
   echo "10" | wrangler secret put STORAGE_QUOTA_GB
   ```

### 方式二：一键部署脚本

**适合：本地一键部署**

```bash
# 1. 克隆项目
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. 登录 Cloudflare
wrangler login

# 3. 创建资源
wrangler r2 bucket create pebble-drive-storage
wrangler d1 create pebble-drive-db
# ⚠️ 记录返回的 database_id

# 4. 配置数据库
cd backend
cp wrangler.toml.example wrangler.toml
# 编辑 wrangler.toml，替换 database_id 为步骤3返回的值

# 5. 初始化数据库
wrangler d1 execute pebble-drive-db --file=./migrations/schema.sql

# 6. 运行部署脚本（自动部署）
cd ..
./deploy.sh
```

部署脚本会自动：
- 部署后端 Worker
- 提示设置环境变量（密码、密钥、配额）
- 自动获取 Worker URL 并构建前端
- 部署前端到 Pages

### 方式三：手动部署

<details>
<summary>点击展开手动部署步骤</summary>

```bash
# 前置步骤 1-5 与一键部署相同

# 6. 设置环境变量
cd backend
echo "your-password" | wrangler secret put AUTH_PASSWORD
echo "your-jwt-secret" | wrangler secret put AUTH_TOKEN_SECRET
echo "10" | wrangler secret put STORAGE_QUOTA_GB  # 可选

# 7. 部署后端
npm install
wrangler deploy
# 记录输出的 Worker URL

# 8. 部署前端
cd ../frontend
npm install
VITE_API_BASE_URL=https://YOUR-WORKER-URL.workers.dev npm run build
npx wrangler pages deploy dist --project-name=pebble-drive
```

</details>

---

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 是否必需 | 默认值 |
|--------|------|----------|--------|
| `AUTH_PASSWORD` | 登录密码 | ✅ 必需 | - |
| `AUTH_TOKEN_SECRET` | JWT 密钥 | ✅ 必需 | - |
| `STORAGE_QUOTA_GB` | 存储配额(GB) | ❌ 可选 | `∞` (无限) |

**说明：**
- 一键部署脚本会自动提示设置
- 手动部署参考上方"手动部署"步骤 6
- 本地开发在 `backend/.dev.vars` 文件中配置

**常见错误：**
- 🚫 登录报错 "JSON.parse error" → 忘记设置 `AUTH_PASSWORD` 或 `AUTH_TOKEN_SECRET`
- 🚫 前端网络错误 → 构建时忘记设置 `VITE_API_BASE_URL`

### wrangler.toml 配置

```toml
name = "pebble-drive-api"
main = "src/index.js"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pebble-drive-storage"

[[d1_databases]]
binding = "DB"
database_name = "pebble-drive-db"
database_id = "your-database-id"  # 替换为实际值
```

---

## 📖 API 文档

### 认证
```http
POST /api/login
Content-Type: application/json

{ "password": "your-password" }
```

### 文件操作
```http
POST   /api/upload          # 上传文件
GET    /api/files           # 文件列表
GET    /api/download?id=xxx # 下载文件
DELETE /api/delete?id=xxx   # 删除文件
```

### 分享功能
```http
POST /api/share
Content-Type: application/json

{
  "fileId": "xxx",
  "password": "optional",      // 可选
  "expiry": 3600,             // 秒，可选
  "downloadLimit": 10         // 次数，可选
}
```

### 存储配额
```http
GET /api/storage/quota

Response: {
  "totalQuota": 10737418240,
  "totalUsed": 1024000,
  "quotaGB": 10,
  "usagePercentage": "0.01",
  "unlimited": false
}
```


## ❓ 常见问题

<details>
<summary><b>Q1: 完全免费吗？</b></summary>

是的！Cloudflare 免费额度：
- Workers: 100,000 请求/天
- R2: 10GB 存储 + 无出站流量费
- D1: 5GB 数据库
- Pages: 无限部署

超出后按量付费，成本极低。
</details>

<details>
<summary><b>Q2: 如何修改文件大小限制？</b></summary>

编辑 `frontend/public/js/app.js`：
```javascript
const validFiles = files.filter(file => file.size <= 200 * 1024 * 1024); // 改为 200MB
```
</details>

<details>
<summary><b>Q3: 支持哪些文件预览？</b></summary>

- **图片**：JPG, PNG, GIF, WebP, SVG
- **文档**：PDF, Markdown
- **代码**：40+ 种语言（JS/TS/Python/Go/Rust 等）
- **其他**：支持下载
</details>

<details>
<summary><b>Q4: 如何修改登录密码？</b></summary>

```bash
cd backend
echo "new-password" | wrangler secret put AUTH_PASSWORD
```

无需重新部署，立即生效。
</details>

<details>
<summary><b>Q5: 如何自定义域名？</b></summary>

1. Cloudflare Dashboard → Workers → Custom Domains
2. 添加后端域名：`api.yourdomain.com`
3. Pages → Custom Domains → 添加前端域名：`drive.yourdomain.com`
4. 重新构建前端：
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com npm run build
   npx wrangler pages deploy dist
   ```
</details>

<details>
<summary><b>Q6: 如何备份数据？</b></summary>

```bash
# 备份数据库
wrangler d1 export pebble-drive-db --output=backup.sql

# 查看 R2 文件
wrangler r2 bucket list pebble-drive-storage

# 监控日志
wrangler tail pebble-drive-api
```
</details>

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

[Cloudflare Workers](https://workers.cloudflare.com/) · [TailwindCSS](https://tailwindcss.com/) · [FontAwesome](https://fontawesome.com/) · [Vite](https://vitejs.dev/)

---

**Built with ❤️ using Cloudflare Workers**
