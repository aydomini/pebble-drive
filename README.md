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

### 核心功能
- 🚀 **无服务器架构** - Cloudflare Workers 全球边缘部署，免费 10 万次请求/天
- 📦 **三存储系统** - R2 存储文件（10GB 免费）+ D1 存储元数据（5GB 免费）+ KV 存储会话和速率限制
- 📤 **拖拽上传** - 支持多文件上传，单文件最大 100MB，智能分页列表
- 🔗 **高级分享** - 密码保护（SHA-256哈希）、限时链接、限制下载次数、访问统计、速率限制防暴力破解
- 👁️ **全能预览** - 支持图片、PDF、Markdown、40+ 种代码语言、SVG（双重预览）、纯文本
- 🔐 **企业级安全** - 多层防护：分享密码哈希存储、加密安全随机Token、IP速率限制（5次/小时）、账户锁定机制、Cloudflare Turnstile 人机验证、JWT 身份认证
- 🌍 **多语言界面** - 中/英/日多语言自适应切换
- 🌓 **深色模式** - 自适应主题切换，支持系统偏好
- 📱 **完美响应式** - 桌面/平板/移动端全适配
- ⚡ **极优性能** - 全球 CDN 加速，毫秒级响应，离线缓存支持

### 技术架构
```
用户 → Cloudflare Pages (前端) → Workers (后端 API) → R2 (文件) + D1 (元数据) + KV (会话/限流)
```

**为什么需要三种存储？**

| 存储 | 用途 | 优势 |
|-----|------|------|
| **R2** | 文件内容 | 无出站流量费、全球 CDN、10GB 免费、大文件友好 |
| **D1** | 结构化数据 | 复杂查询、事务支持、外键关联、5GB 免费、类 SQL |
| **KV** | 键值数据 | 毫秒级读写、全球分布、速率限制、会话管理 |

**完整工作流程**：
```
上传文件 → Turnstile验证 → 文件存R2 → 元数据存D1 → 会话存KV → 生成分享链接
访问分享 → 限流检查 → 权限验证 → D1查询 → R2获取文件 → 返回内容
```

### 技术栈

**前端技术**
- **构建工具**: Vite 5.x - 极速开发服务器和优化构建
- **核心框架**: Vanilla JavaScript ES6+ - 零依赖，极致性能
- **UI 框架**: TailwindCSS 3.x - 原子化 CSS，快速开发
- **预览库**: Marked.js (Markdown)、Highlight.js (代码高亮)
- **图标库**: Font Awesome 6.x - 丰富图标资源
- **国际化**: 自定义 i18n 系统

**后端技术**
- **运行时**: Cloudflare Workers (V8 引擎)
- **存储服务**: R2 (对象存储) + D1 (SQLite) + KV (键值存储)
- **安全认证**: JWT + Cloudflare Turnstile
- **API 设计**: RESTful API，OpenAPI 3.0 规范

**部署与运维**
- **CI/CD**: GitHub Actions - 自动化部署流水线
- **CLI 工具**: Wrangler 2.x - Cloudflare 官方工具链
- **监控**: Cloudflare Analytics - 实时性能监控
- **版本控制**: Git + GitHub - 代码版本管理

---

## 🚀 快速开始

### 📋 部署前准备

**必须准备的资源（免费）：**
- Cloudflare 账号（用于 Workers、R2、D1、KV）
- Turnstile 站点（人机验证，免费）

**可选资源：**
- GitHub 账号（用于 GitHub Actions 自动部署）

**🎯 选择适合你的部署方式：**

| 方式 | 难度 | 适合人群 | 耗时 |
|------|------|----------|------|
| **方式一：Cloudflare Dashboard 部署** | ⭐ 简单 | 完全新手，不想用命令行 | 10-15 分钟 |
| **方式二：GitHub Actions 自动部署** | ⭐⭐ 中等 | 懂 Git 基础，想要自动化 | 5-10 分钟 |
| **方式三：本地安全部署** | ⭐⭐⭐ 进阶 | 注重隐私，熟悉命令行 | 3-5 分钟 |
| **方式四：手动部署** | ⭐⭐⭐⭐ 高级 | 开发者，需要完全控制 | 15-20 分钟 |

---

<details>
<summary>

### 方式一：Cloudflare Dashboard 部署（🌟 最简单，强烈推荐新手）

**适合：完全不懂命令行的新手，全程鼠标点击完成**

</summary>

#### 📝 前置准备

1. **注册 Cloudflare 账号**
   - 访问 [Cloudflare](https://dash.cloudflare.com/sign-up)
   - 使用邮箱注册（完全免费）

2. **下载项目代码**
   - 访问 [项目主页](https://github.com/aydomini/pebble-drive)
   - 点击绿色 **Code** 按钮 → **Download ZIP**
   - 解压到本地文件夹

---

#### 第 1 步：创建 Turnstile 人机验证（2 分钟）

1. 登录 Cloudflare，访问 [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 点击 **Add site** 按钮
3. 填写配置：
   - **Site name**: `pebble-drive`（随便起名）
   - **Domains**: `*.pages.dev`（Cloudflare Pages 的通配符域名）
   - **Widget type**: 选择 **Managed Challenge**
4. 点击 **Create** 创建
5. **📋 记录两个密钥**（稍后会用）：
   - **Site Key**（以 `0x4AAAAAAA` 开头）
   - **Secret Key**（以 `0x4AAAAAAA` 开头）

---

#### 第 2 步：创建 R2 存储桶（1 分钟）

1. 在 Cloudflare Dashboard，点击左侧 **R2**
2. 如果首次使用，点击 **Purchase R2 Plan**（选择免费计划）
3. 点击 **Create bucket** 按钮
4. 输入名称：`pebble-drive-storage`
5. 区域选择：**Automatic**
6. 点击 **Create bucket**

---

#### 第 3 步：创建 D1 数据库（2 分钟）

1. 在 Cloudflare Dashboard，点击左侧 **Workers & Pages** → **D1**
2. 点击 **Create database** 按钮
3. 输入名称：`pebble-drive-db`
4. 点击 **Create**
5. **📋 记录 Database ID**（在数据库详情页右侧显示）

**初始化数据库结构：**
1. 在数据库详情页，点击 **Console** 标签
2. 将以下 SQL 复制粘贴到输入框：

```sql
-- 文件表
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    uploadDate INTEGER NOT NULL,
    downloadUrl TEXT NOT NULL
);

-- 分享表
CREATE TABLE IF NOT EXISTS shares (
    token TEXT PRIMARY KEY,
    fileId TEXT NOT NULL,
    password TEXT,
    downloadLimit INTEGER,
    downloadCount INTEGER DEFAULT 0,
    expiresAt INTEGER,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (fileId) REFERENCES files(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_uploadDate ON files(uploadDate DESC);
CREATE INDEX IF NOT EXISTS idx_shares_fileId ON shares(fileId);
CREATE INDEX IF NOT EXISTS idx_shares_expiresAt ON shares(expiresAt);
```

3. 点击 **Execute** 执行

---

#### 第 4 步：创建 KV 命名空间（1 分钟）

1. 在 Cloudflare Dashboard，点击左侧 **Workers & Pages** → **KV**
2. 点击 **Create namespace** 按钮
3. 输入名称：`RATE_LIMIT_KV`
4. 点击 **Add**
5. **📋 记录 Namespace ID**（在列表中显示）

---

#### 第 5 步：部署后端 Worker（3 分钟）

1. 在 Cloudflare Dashboard，点击左侧 **Workers & Pages**
2. 点击 **Create application** → **Create Worker**
3. 输入名称：`pebble-drive-api`
4. 点击 **Deploy**（先部署默认代码）
5. 部署成功后，点击 **Edit code** 按钮

**上传后端代码：**
1. 删除右侧编辑器中的所有代码
2. 打开你下载的项目文件夹 → `backend/src/index.js`
3. 复制所有内容，粘贴到编辑器
4. 点击右上角 **Save and Deploy**

**绑定资源：**
1. 返回 Worker 详情页，点击 **Settings** → **Variables**
2. 滚动到 **R2 Bucket Bindings**，点击 **Add binding**：
   - Variable name: `R2_BUCKET`
   - R2 bucket: 选择 `pebble-drive-storage`
   - 点击 **Save**

3. 滚动到 **D1 Database Bindings**，点击 **Add binding**：
   - Variable name: `DB`
   - D1 database: 选择 `pebble-drive-db`
   - 点击 **Save**

4. 滚动到 **KV Namespace Bindings**，点击 **Add binding**：
   - Variable name: `RATE_LIMIT_KV`
   - KV namespace: 选择 `RATE_LIMIT_KV`
   - 点击 **Save**

**设置环境变量（Secrets）：**
1. 在同一页面，滚动到 **Environment Variables**
2. 点击 **Add variable**，依次添加（类型选 **Encrypt**）：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `AUTH_PASSWORD` | `你的登录密码` | 登录密码，自己设置 |
   | `AUTH_TOKEN_SECRET` | `随机32位字符串` | JWT 密钥，随机生成 |
   | `TURNSTILE_SECRET_KEY` | `第1步的Secret Key` | Turnstile 密钥 |
   | `STORAGE_QUOTA_GB` | `10` | 存储配额（可选） |

3. 点击 **Save and Deploy**

**📋 记录 Worker 地址**：
- 在 Worker 详情页顶部，复制你的 Worker URL
- 格式：`https://pebble-drive-api.你的账号.workers.dev`

---

#### 第 6 步：部署前端 Pages（2 分钟）

1. 在 Cloudflare Dashboard，点击左侧 **Workers & Pages**
2. 点击 **Create application** → **Pages** → **Upload assets**
3. 输入项目名称：`pebble-drive`
4. 点击 **Create project**

**准备前端文件：**
1. 打开项目文件夹 → `frontend/public/index.html`
2. 找到第 333 行附近的这段代码：
   ```javascript
   window.ENV_API_BASE_URL = '%VITE_API_BASE_URL%';
   ```
3. 替换为：
   ```javascript
   window.ENV_API_BASE_URL = 'https://pebble-drive-api.你的账号.workers.dev';
   ```
   （使用第 5 步记录的 Worker 地址）

4. 找到第 337 行附近的这段代码：
   ```javascript
   window.VITE_TURNSTILE_SITE_KEY = '%VITE_TURNSTILE_SITE_KEY%';
   ```
5. 替换为：
   ```javascript
   window.VITE_TURNSTILE_SITE_KEY = '0x4AAAAAAA你的Site Key';
   ```
   （使用第 1 步记录的 Site Key）

6. 保存文件

**上传前端：**
1. 将整个 `frontend/public` 文件夹压缩为 ZIP
2. 在 Pages 上传页面，拖拽 ZIP 文件上传
3. 点击 **Deploy site**

**✅ 完成！**

访问你的 Pages 地址（格式：`https://你的项目名.pages.dev`），使用第 5 步设置的密码登录！

---

#### 🔧 更新 Turnstile 域名（重要）

部署成功后，需要将 Pages 域名添加到 Turnstile 配置：

1. 访问 [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 点击你创建的 `pebble-drive` 站点
3. 在 **Domains** 中，添加你的 Pages 域名（如：`你的项目名.pages.dev`）
4. 删除之前的 `*.pages.dev` 通配符（更安全）
5. 点击 **Save**

</details>

---

<details>
<summary>

### 方式二：GitHub Actions 自动部署（适合懂 Git 的用户）

**适合：新手用户，一键全自动部署**

</summary>

#### 第1步：Fork 项目
1. 访问 [项目主页](https://github.com/aydomini/pebble-drive)
2. 点击右上角 **Fork** 按钮
3. 选择你的 GitHub 账号

#### 第2步：创建必需的 Cloudflare 资源
```bash
# 安装 Wrangler CLI（如果未安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建存储桶（存放文件）
wrangler r2 bucket create pebble-drive-storage

# 创建数据库（存放元数据）
wrangler d1 create pebble-drive-db
# 📝 复制返回的 database_id（类似：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）

# 创建 KV 命名空间（速率限制）
wrangler kv namespace create RATE_LIMIT_KV
# 📝 复制返回的 id（类似：xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx）

# 创建预览环境 KV
wrangler kv namespace create RATE_LIMIT_KV --preview
# 📝 复制返回的 preview_id
```

#### 第3步：配置项目文件
1. 在 GitHub 仓库中，进入 `backend/` 目录
2. 复制 `wrangler.toml.example` 为 `wrangler.toml`
3. 编辑 `wrangler.toml`，替换以下内容：
   ```toml
   # 找到这一行，替换为你的 database_id
   database_id = "你的-database-id-这里"

   # 找到这两行，替换为你的 KV id
   id = "你的-kv-id-这里"
   preview_id = "你的-preview-kv-id-这里"
   ```

#### 第4步：配置 GitHub Secrets
在 GitHub 仓库中：
1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下密钥：

| Secret 名称 | 值 | 获取方式 |
|------------|-----|----------|
| `CLOUDFLARE_API_TOKEN` | 你的 API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | 你的账户 ID | Cloudflare Dashboard → 右侧边栏 |
| `TURNSTILE_SITE_KEY` | Turnstile Site Key | 第5步创建后获取 |

#### 第5步：创建 Turnstile（人机验证）
1. 访问 [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 点击 **Add site**
3. 配置如下：
   - **Site name**: `pebble-drive`
   - **Domains**: `*.pages.dev`（Cloudflare Pages 通配符域名）
   - **Widget type**: Managed Challenge
4. 创建后记录：
   - **Site Key** (以 `0x4AAAAAAA` 开头)
   - **Secret Key** (以 `0x4AAAAAAA` 开头)

#### 第6步：设置认证密钥
```bash
cd backend

# 设置登录密码（请替换为你的密码）
echo "your-secure-password" | wrangler secret put AUTH_PASSWORD

# 设置 JWT 密钥（随机生成）
openssl rand -base64 32 | tr -d '\n' | wrangler secret put AUTH_TOKEN_SECRET

# 设置存储配额（GB，可选，默认 10）
echo "10" | wrangler secret put STORAGE_QUOTA_GB

# 设置 Turnstile 密钥
echo "你的-turnstile-secret-key" | wrangler secret put TURNSTILE_SECRET_KEY
```

#### 第7步：触发自动部署
```bash
git add .
git commit -m "🚀 部署 PebbleDrive 到 Cloudflare"
git push
```

🎉 **完成！** GitHub Actions 会自动部署到 Cloudflare，完成后：
- 后端 API：`https://pebble-drive-api.你的账号.workers.dev`
- 前端应用：`https://你的项目名.pages.dev`（或你的自定义域名）

**📝 注意：**
- GitHub Actions 会自动获取 Worker URL 并配置到前端
- `TURNSTILE_SITE_KEY` 会自动注入到前端构建中
- 无需手动配置 `VITE_API_BASE_URL` 环境变量

访问前端地址即可使用！

</details>

---

<details>
<summary>

### 方式三：本地安全部署（适合注重隐私的用户）

**适合：注重隐私，不想公开配置信息的用户**

</summary>

```bash
# 1. 克隆项目
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. 运行安全部署脚本（一键完成）
./deploy-secure-local.sh
```

**🛡️ 安全特性：**
- ✅ **本地配置存储** - 所有敏感信息保存在本地 `.env.local` 文件
- ✅ **环境隔离** - 开发、测试、生产环境完全分离
- ✅ **无云端泄露** - 配置信息不会上传到任何代码仓库
- ✅ **自动化部署** - 一键完成所有部署步骤
- ✅ **智能清理** - 可选择删除本地敏感文件

**📋 脚本功能：**
- 自动创建所有 Cloudflare 资源
- 自动生成强随机密钥
- 自动配置 Workers Secrets
- 自动初始化数据库
- 自动部署前后端
- 智能错误处理和回滚

</details>

---

<details>
<summary>

### 方式四：手动部署（适合开发者）

**适合：需要完全控制部署过程的高级用户**

</summary>

```bash
# 1. 克隆项目
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 登录 Cloudflare
wrangler login

# 4. 创建资源
wrangler r2 bucket create pebble-drive-storage
wrangler d1 create pebble-drive-db
wrangler kv namespace create RATE_LIMIT_KV
wrangler kv namespace create RATE_LIMIT_KV --preview

# 5. 配置后端
cd backend
cp wrangler.toml.example wrangler.toml
# 编辑 wrangler.toml，填入实际的 ID

# 6. 设置密钥
echo "your-password" | wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | tr -d '\n' | wrangler secret put AUTH_TOKEN_SECRET
echo "10" | wrangler secret put STORAGE_QUOTA_GB

# 7. 部署
wrangler deploy
cd ../frontend
VITE_API_BASE_URL=https://your-api.workers.dev npm run build
npx wrangler pages deploy dist --project-name=pebble-drive
```

---

### 🚨 常见问题排除

#### 问题1：登录失败 - "服务器认证未配置"
**现象**：输入密码后显示登录失败
**原因**：前端没有正确连接后端 API
**解决方案**：
1. 检查 `backend/wrangler.toml` 配置是否正确
2. 确保 Worker 部署成功，获取到正确的 URL
3. 前端构建时必须设置 `VITE_API_BASE_URL`

#### 问题2：Turnstile 验证失败
**现象**：验证码加载失败或验证不通过
**解决方案**：
1. 确保在 Cloudflare Dashboard 创建了 Turnstile 站点
2. 检查域名配置是否包含你的 Pages 域名（如 `你的项目名.pages.dev`）
3. 确保 `TURNSTILE_SECRET_KEY` 密钥设置正确

#### 问题3：KV 命名空间创建失败
**现象**：`wrangler kv namespace create` 命令出错
**解决方案**：
```bash
# 检查 wrangler 版本
wrangler --version
# 如果版本低于 2.0，请更新
npm install -g wrangler@latest

# 重新登录
wrangler logout
wrangler login
```

#### 问题4：数据库初始化失败
**现象**：D1 数据库创建或初始化出错
**解决方案**：
```bash
# 检查数据库是否创建成功
wrangler d1 list

# 手动执行初始化
wrangler d1 execute pebble-drive-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

#### 问题5：上传文件失败
**现象**：文件上传到 100% 后失败
**原因**：通常是 R2 存储桶配置问题
**解决方案**：
1. 检查 R2 存储桶是否创建成功
2. 确保 `wrangler.toml` 中 bucket_name 正确
3. 检查 Worker 是否有 R2 写权限

---

### 📞 获取帮助

如果以上步骤仍无法解决你的问题：

1. **查看日志**：访问 Cloudflare Dashboard → Workers → 你的 Worker → Logs
2. **检查配置**：运行 `wrangler tail --format=pretty` 查看实时日志
3. **提交 Issue**：[GitHub Issues](https://github.com/aydomini/pebble-drive/issues)
4. **社区讨论**：[GitHub Discussions](https://github.com/aydomini/pebble-drive/discussions)

</details>

---

## 🎯 部署成功检查清单

✅ **部署完成后，请检查以下项目：**

- [ ] Workers 部署成功，可以访问 API 端点
- [ ] Pages 部署成功，前端页面正常加载
- [ ] 登录功能正常，密码验证通过
- [ ] Turnstile 验证码正常显示和验证
- [ ] 文件上传功能正常工作
- [ ] 文件预览功能正常显示
- [ ] 分享链接功能正常创建和访问
- [ ] 所有页面在移动端正常显示

🎉 **恭喜！你已经成功部署了自己的云盘！**

---

## 🔧 配置说明

### 后端配置（Worker）

#### 环境变量（Secrets）

在 Worker Settings → Variables → Environment Variables 中配置：

| 变量名 | 说明 | 必需 | 设置方式 |
|--------|------|------|---------|
| `AUTH_PASSWORD` | 登录密码 | ✅ | `wrangler secret put AUTH_PASSWORD` |
| `AUTH_TOKEN_SECRET` | JWT 密钥（32位随机字符串） | ✅ | `openssl rand -base64 32 \| wrangler secret put AUTH_TOKEN_SECRET` |
| `TURNSTILE_SECRET_KEY` | Turnstile Secret Key | ✅ | `wrangler secret put TURNSTILE_SECRET_KEY` |
| `STORAGE_QUOTA_GB` | 存储配额（GB，可选） | ❌ | `echo "10" \| wrangler secret put STORAGE_QUOTA_GB` |

#### 资源绑定

在 Worker Settings → Variables 中配置：

| 类型 | Variable name | 绑定资源 |
|------|---------------|----------|
| R2 Bucket | `R2_BUCKET` | `pebble-drive-storage` |
| D1 Database | `DB` | `pebble-drive-db` |
| KV Namespace | `RATE_LIMIT_KV` | 你创建的 KV 命名空间 |

#### wrangler.toml 配置

可选的环境变量（在 `backend/wrangler.toml` 中）：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SHARE_DOMAIN` | 自定义分享域名 | `https://storage.yourdomain.com` |
| `STORAGE_QUOTA_GB` | 存储配额（GB） | `10` |

### 前端配置（Pages）

#### 构建时环境变量

前端构建时必须设置以下环境变量：

| 变量名 | 说明 | 必需 | 示例值 |
|--------|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | ✅ | `https://your-api.workers.dev` 或自定义域名 |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile Site Key | ✅ | `0x4AAAAAAA...` |

**设置方式：**
```bash
# 本地构建
VITE_API_BASE_URL=https://your-api.workers.dev \
VITE_TURNSTILE_SITE_KEY=你的-site-key \
npm run build

# GitHub Actions
# 在仓库 Settings → Secrets → Actions 中添加 TURNSTILE_SITE_KEY
# VITE_API_BASE_URL 会自动从 Worker URL 获取
```

---

## 📖 API 文档

<details>
<summary><b>点击展开查看完整 API 文档</b></summary>

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

</details>

---
## ❓ 常见问题

<details>
<summary><b>Q1: 超出免费额度怎么办？</b></summary>

超出后按量付费，成本极低：
- Workers: $0.50/百万请求
- R2: $0.015/GB 存储 + $0.01/GB 出站
- D1: $0.75/GB 数据库
</details>

<details>
<summary><b>Q2: 如何修改登录密码？</b></summary>

```bash
cd backend
echo "new-password" | wrangler secret put AUTH_PASSWORD
```
无需重新部署，立即生效。
</details>

<details>
<summary><b>Q3: 支持哪些文件预览？</b></summary>

- **图片**：JPG, PNG, GIF, WebP, SVG
- **文档**：PDF, Markdown
- **代码**：40+ 种语言（JS/TS/Python/Go/Rust 等）
- **其他**：TXT 纯文本
</details>

<details>
<summary><b>Q4: 如何配置自定义域名？</b></summary>

### 🌐 完整域名配置指南

#### 1. 为 Worker 配置自定义域名（后端 API）

**配置步骤：**
1. 在 Cloudflare Dashboard，进入你的 Worker
2. 点击 **Triggers** → **Custom Domains**
3. 添加你的域名（如 `api.yourdomain.com` 或 `storage.yourdomain.com`）

**重新构建前端：**
```bash
cd frontend
VITE_API_BASE_URL=https://api.yourdomain.com \
VITE_TURNSTILE_SITE_KEY=你的-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```

#### 2. 为 Pages 配置自定义域名（前端）

1. 在 Cloudflare Dashboard，进入你的 Pages 项目
2. 点击 **Custom domains** → **Set up a custom domain**
3. 添加你的域名（如 `file.yourdomain.com`）

#### 3. 配置自定义分享域名（可选）

如果你想让分享链接使用自定义域名而不是 `xxx.workers.dev`：

**编辑 `backend/wrangler.toml`：**
```toml
[vars]
SHARE_DOMAIN = "https://storage.yourdomain.com"
```

**重新部署后端：**
```bash
cd backend
npx wrangler deploy
```

**效果对比：**
- 默认：`https://pebble-drive-api.xxx.workers.dev/share/abc123`
- 配置后：`https://storage.yourdomain.com/share/abc123`

#### 4. 推荐配置方案

| 服务 | 推荐域名 | 说明 |
|------|---------|------|
| **前端 Pages** | `file.yourdomain.com` | 用户访问的主页面 |
| **后端 Worker** | `storage.yourdomain.com` | API 和分享链接 |

这样配置后：
- 前端访问：`https://file.yourdomain.com`
- API 调用：`https://storage.yourdomain.com/api/xxx`
- 分享链接：`https://storage.yourdomain.com/share/xxx`

</details>

<details>
<summary><b>Q5: 前端连接不上后端怎么办？</b></summary>

**📌 常见问题：登录失败，显示"服务器认证未配置"**

**根本原因：**
前端构建时 `VITE_API_BASE_URL` 环境变量未设置或设置错误。

**解决方案：**

1. **查看你的 Worker API 地址**
   - 默认地址：`https://pebble-drive-api.你的账号.workers.dev`
   - 自定义域名：`https://storage.yourdomain.com`（如果你配置了）

2. **重新构建前端（使用正确的 API 地址）**
   ```bash
   cd frontend
   VITE_API_BASE_URL=https://你的-worker-地址 \
   VITE_TURNSTILE_SITE_KEY=你的-turnstile-site-key \
   npm run build

   # 部署
   npx wrangler pages deploy dist --project-name=pebble-drive
   ```

3. **验证是否配置成功**
   ```bash
   # 检查构建产物中的 API 地址
   cat dist/index.html | grep ENV_API_BASE_URL
   # 应该显示：window.ENV_API_BASE_URL = 'https://你的-worker-地址';
   ```

**📝 注意事项：**
- 如果你为 Worker 配置了自定义域名，前端必须使用该域名
- 每次更换 API 域名后，都需要重新构建前端
- Dashboard 部署方式需要手动编辑 `index.html`（参考方式一的说明）

</details>

<details>
<summary><b>Q6: 如何备份数据？</b></summary>

```bash
# 备份数据库
wrangler d1 export pebble-drive-db --output=backup.sql

# 同步 R2 文件到本地
wrangler r2 bucket list pebble-drive-storage
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
