# 🚀 PebbleDrive 完整部署指南

> **版本**: v1.3.2 | **更新**: 2025-12-15

本指南涵盖完整部署流程，包括后端 API、前端（含隐私保护代理）、短链接服务。

---

## 📋 目录

- [快速开始（10分钟）](#-快速开始10分钟)
- [完整部署步骤](#-完整部署步骤)
- [短链接配置（可选）](#-短链接配置可选)
- [验证部署](#-验证部署)
- [常见问题](#-常见问题)

---

## ⚡ 快速开始（10分钟）

### 前置要求

- Node.js >= 14.x
- Cloudflare 账号
- Wrangler CLI

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 部署后端

```bash
cd backend
npx wrangler deploy
```

### 3. 配置 Secrets（首次部署必需）

```bash
# 登录密码（必需）
echo "your-password" | npx wrangler secret put AUTH_PASSWORD

# JWT 密钥（必需，32位随机字符串）
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET

# Turnstile 验证密钥（可选）
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY
```

### 4. 部署前端（⚠️ 关键：必须包含 Functions）

```bash
cd ../frontend

# 设置环境变量并构建
VITE_API_BASE_URL=https://your-backend-api.workers.dev \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

# ⚠️ 关键步骤：复制 Functions 到 dist（绝对不能遗漏！）
cp -r functions dist/_functions

# 部署到 Pages
npx wrangler pages deploy dist --project-name=your-project-name
```

**🚨 为什么必须复制 Functions？**
```
没有 Functions → 缓存问题 → 安全漏洞
├─ ❌ 分享链接可以无限下载（绕过次数限制）
├─ ❌ 过期链接依然可以访问
├─ ❌ 密码保护失效（刷新后显示缓存页面）
└─ ❌ 后端 API 地址暴露在前端代码中
```

**✅ 验证 Functions 是否部署成功**：

**方法1：检查部署日志**
```bash
# 部署时必须看到以下输出：
✨ Uploading Functions bundle  ← 关键！必须有这一行
✨ Success! Uploaded 15 files   ← 15个文件（不是12个）
```

**方法2：测试响应头**
```bash
curl -I https://your-pages-url.pages.dev/share/test123

# 应该看到：
HTTP/2 307 Temporary Redirect      ← 时间戳重定向
Location: /share/test123?_t=1234567890
Cache-Control: no-store, no-cache  ← 防缓存头
```

**如果部署日志只显示12个文件，没有 "Uploading Functions bundle"**：
```bash
# 立即执行：
cd frontend
cp -r functions dist/_functions  # 复制 Functions
npx wrangler pages deploy dist --project-name=your-project-name  # 重新部署
```

**完成！** 🎉 访问 Pages URL 开始使用。

---

## 📦 完整部署步骤

### 步骤1：部署后端 API

#### 1.1 创建资源（首次部署）

```bash
cd backend

# 创建 D1 数据库
npx wrangler d1 create pebble-drive-db

# 创建 R2 存储桶
npx wrangler r2 bucket create pebble-drive-storage

# 创建 KV 命名空间
npx wrangler kv namespace create RATE_LIMIT_KV
```

#### 1.2 配置 `wrangler.toml`

从 `wrangler.toml.example` 复制配置，填入以下信息：

```toml
# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "pebble-drive-db"
database_id = "your-database-id"  # 从步骤 1.1 获取

# R2 存储桶
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pebble-drive-storage"

# KV 命名空间
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-id"  # 从步骤 1.1 获取

# 环境变量（根据需求调整）
[vars]
STORAGE_QUOTA_GB = "10"
SHARE_DOMAIN = "https://your-frontend-domain.com"
SHORT_DOMAIN = "https://your-short-domain.com"  # 可选
MAX_FILE_SIZE_MB = "200"
```

#### 1.3 初始化数据库

```bash
npx wrangler d1 execute pebble-drive-db --file=./schema.sql
```

#### 1.4 部署后端

```bash
npx wrangler deploy
```

#### 1.5 配置 Secrets

```bash
# 登录密码
echo "your-password" | npx wrangler secret put AUTH_PASSWORD

# JWT 密钥（32位随机字符串）
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET

# Turnstile 验证密钥（可选）
echo "0x4AAAAAAB5BARFVbQDuEJ4UNzoQUcwnxnI" | npx wrangler secret put TURNSTILE_SECRET_KEY

# 验证 Secrets 是否配置成功
npx wrangler secret list
```

---

### 步骤2：部署前端（含隐私保护代理）

#### 2.1 配置前端代理

前端使用 **Cloudflare Pages Functions** 代理所有 API 请求，完全隐藏后端 URL。

```bash
cd frontend

# 复制配置模板
cp wrangler.toml.example wrangler.toml

# 编辑 wrangler.toml
nano wrangler.toml
```

**配置内容：**
```toml
[env.production.vars]
BACKEND_URL = "https://your-backend-api.workers.dev"  # 后端 Worker URL

[env.preview.vars]
BACKEND_URL = "https://your-backend-api.workers.dev"
```

#### 2.2 构建前端

```bash
# 设置环境变量构建
VITE_API_BASE_URL='' \
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key \
npm run build
```

**重要**：`VITE_API_BASE_URL=''` 必须为空字符串，前端将使用相对路径通过代理访问 API。

#### 2.3 复制 Functions（🚨 关键步骤，绝对不能遗漏！）

```bash
# ⚠️ 关键步骤：复制 Pages Functions 到 dist
cp -r functions dist/_functions

# 验证 Functions 是否复制成功
ls -la dist/_functions/
# 应该看到：api/ download/ share/ 三个目录
```

**🔴 如果忘记这一步，将导致严重的安全问题**：
- 分享链接可以绕过下载次数限制（无限下载）
- 过期链接依然可以访问
- 密码保护失效
- 后端 API 地址暴露

#### 2.4 部署到 Pages

```bash
npx wrangler pages deploy dist --project-name=your-project-name
```

**✅ 验证部署成功（必须检查）**：

部署日志中必须包含以下内容：
```bash
✨ Uploading Functions bundle    ← 🔴 关键！必须有这一行
✨ Success! Uploaded 15 files    ← 15个文件（不是12个）
🌎 Deploying...
✨ Deployment complete!
```

**❌ 如果日志中缺少 "Uploading Functions bundle"**：
```bash
# 说明 Functions 没有被部署，立即执行：
cd frontend
cp -r functions dist/_functions  # 复制 Functions
npx wrangler pages deploy dist --project-name=your-project-name  # 重新部署
# 再次检查日志，确保看到 "Uploading Functions bundle"
```

部署成功后会返回 Pages URL，例如：
```
https://abc123.your-project-name.pages.dev
```

#### 2.4 配置自定义域名（可选）

在 Cloudflare Dashboard：
1. 进入 **Workers & Pages** → 你的项目
2. 点击 **Custom domains** → **Add custom domain**
3. 输入域名（如 `file.yourdomain.com`）
4. 按提示配置 DNS 记录

---

### 步骤3：短链接服务（可选）

**重要说明**：短链接服务是**可选功能**，不影响核心功能使用。如果你不需要更短的分享链接（如 `https://s.com/Ab3x9K`），可以跳过此步骤。

短链接服务需要单独创建一个 Worker 项目，用于将短域名的请求代理到后端 API。

#### 3.1 创建短链接 Worker 项目

```bash
# 创建新目录
mkdir short-link-proxy
cd short-link-proxy

# 初始化 Worker 项目
npm init -y
npm install

# 创建 wrangler.toml 配置文件
cat > wrangler.toml << EOF
name = "pebble-drive-short-link"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
BACKEND_API = "https://your-backend-api.workers.dev"  # 替换为你的后端 API 地址
ENABLE_LOGGING = "true"
EOF
```

#### 3.2 创建 Worker 代码

```bash
# 创建源代码目录
mkdir -p src

# 创建 Worker 代码
cat > src/index.js << 'EOF'
/**
 * 短链接代理服务 - 将短域名请求代理到后端 API
 *
 * 功能：
 * - 接收短链接请求（如 https://s.com/Ab3x9K）
 * - 透明代理到后端 API（如 https://api.workers.dev/Ab3x9K）
 * - 保持用户地址栏显示短域名
 *
 * 路由示例：
 * - GET /Ab3x9K → GET https://backend-api.workers.dev/Ab3x9K
 * - GET /Ab3x9K?pwd=123 → GET https://backend-api.workers.dev/Ab3x9K?pwd=123
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 健康检查
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // 提取 token（路径的第一部分，如 /Ab3x9K）
    const token = url.pathname.slice(1);

    // Base62 格式验证（6位字符：0-9, a-z, A-Z）
    if (!/^[0-9a-zA-Z]{6}$/.test(token)) {
      return new Response('Invalid token format', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // 构建后端 API URL
    const backendUrl = `${env.BACKEND_API}/${token}${url.search}`;

    // 记录日志（可选）
    if (env.ENABLE_LOGGING === 'true') {
      console.log(\`[Short Link] \${request.method} \${url.pathname} → \${backendUrl}\`);
    }

    try {
      // 代理请求到后端
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      // 返回响应（保持原始响应头）
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      console.error('[Short Link] Proxy error:', error);
      return new Response('Internal Server Error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
EOF
```

#### 3.3 部署短链接 Worker

```bash
# 确保已登录 Cloudflare
npx wrangler login

# 部署 Worker
npx wrangler deploy
```

部署成功后会返回 Worker URL，例如：
```
https://pebble-drive-short-link.your-account.workers.dev
```

#### 3.4 配置自定义域名

在 Cloudflare Dashboard：
1. 进入 **Workers & Pages** → `pebble-drive-short-link`
2. 点击 **Settings** → **Triggers** → **Custom Domains**
3. 添加自定义域名（如 `s.yourdomain.com`）
4. 按提示配置 DNS 记录（自动完成）

#### 3.5 更新后端配置

编辑 `backend/wrangler.toml`，添加短链接域名：

```toml
[vars]
SHORT_DOMAIN = "https://s.yourdomain.com"  # 你的短链接域名
```

重新部署后端：
```bash
cd backend && npx wrangler deploy
```

#### 3.6 验证短链接服务

```bash
# 1. 在前端创建分享链接，选择"短链接"类型
# 2. 复制短链接（如 https://s.yourdomain.com/Ab3x9K）
# 3. 访问短链接，验证能正常下载文件
# 4. 确认浏览器地址栏保持短域名

# 也可以用 curl 测试
curl -I https://s.yourdomain.com/Ab3x9K
```

---

## ✅ 验证部署

### 1. 检查后端 API

```bash
# 测试后端健康检查
curl https://your-backend-api.workers.dev/api/config

# 查看配置的 Secrets
cd backend && npx wrangler secret list
```

### 2. 检查前端代理

打开浏览器开发者工具（F12）→ Network 标签：

```bash
# 访问前端
open https://your-frontend-domain.com
```

**验证要点：**
- ✅ 所有 API 请求路径为 `/api/*`（相对路径）
- ✅ 看不到真实后端 URL
- ✅ 响应头包含 `Cache-Control: no-store...`

### 3. 测试短链接（如果配置了）

```bash
# 创建分享链接，选择"短链接"
# 复制链接（如 https://s.yourdomain.com/Ab3x9K）
# 访问短链接，验证能正常下载
```

### 4. 测试限制功能

**下载次数限制：**
1. 创建分享链接，设置下载次数为 1
2. 下载一次文件
3. 再次访问链接，应该显示 "403 下载次数已达上限"

**有效期限制：**
1. 创建分享链接，设置有效期为 1 小时
2. 1 小时后访问，应该显示 "410 分享链接已过期"

**密码保护：**
1. 创建分享链接，设置密码
2. 访问链接，应该显示密码输入页面
3. 输入错误密码 5 次，应该被锁定 1 小时

---

## 🔧 配置选项

### 后端环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|-------|------|-------|------|
| `STORAGE_QUOTA_GB` | 存储配额（GB） | 10 | 否 |
| `MAX_FILE_SIZE_MB` | 单文件最大大小（MB） | 200 | 否 |
| `SHARE_DOMAIN` | 标准分享链接域名 | - | 是 |
| `SHORT_DOMAIN` | 短链接域名 | - | 否 |
| `BLOCKED_EXTENSIONS` | 禁止上传的文件类型 | .exe,.sh,... | 否 |
| `UPLOAD_RATE_LIMIT` | 上传速率限制（次/小时） | 50 | 否 |

### 后端 Secrets

| Secret 名称 | 说明 | 必需 |
|------------|------|------|
| `AUTH_PASSWORD` | 登录密码 | 是 |
| `AUTH_TOKEN_SECRET` | JWT 密钥（32位） | 是 |
| `TURNSTILE_SECRET_KEY` | Turnstile 验证密钥 | 否 |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `VITE_API_BASE_URL` | API 基础 URL | `''` (空字符串，使用代理) |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile 站点密钥 | `0x4AAAAAAB5BAQH1FZZ6hsn6` |

---

## ❓ 常见问题

### Q1: 登录失败，提示 "密码错误"

**原因**：`AUTH_PASSWORD` Secret 未配置或配置错误。

**解决**：
```bash
cd backend
npx wrangler secret list  # 检查是否存在
echo "your-password" | npx wrangler secret put AUTH_PASSWORD
```

### Q2: 前端显示 "Configuration Error: BACKEND_URL 未配置"

**原因**：前端 `wrangler.toml` 中的 `BACKEND_URL` 未配置。

**解决**：
```bash
cd frontend
nano wrangler.toml  # 设置 BACKEND_URL
npx wrangler pages deploy dist --project-name=pebble-drive
```

### Q3: 短链接显示 404

**原因**：短链接 Worker 未部署或路由配置错误。

**解决**：
```bash
cd short-link-proxy
npx wrangler deploy
# 在 Cloudflare Dashboard 中配置自定义域名
```

### Q4: 下载次数限制不生效，可以无限下载

**原因**：Cloudflare 缓存导致验证被绕过。

**解决**：已在 v1.3.2 修复，确保后端已更新到最新版本。响应头应包含：
```
Cache-Control: no-store, no-cache, must-revalidate, private
```

### Q5: 文件上传失败，提示 "文件过大"

**原因**：文件超过 `MAX_FILE_SIZE_MB` 限制。

**解决**：
```bash
cd backend
nano wrangler.toml  # 修改 MAX_FILE_SIZE_MB
npx wrangler deploy
```

### Q6: 如何查看后端日志？

```bash
cd backend
npx wrangler tail  # 实时查看日志
```

### Q7: 如何重置数据库？

```bash
cd backend

# 清空数据库
npx wrangler d1 execute pebble-drive-db --command "DELETE FROM shares; DELETE FROM files;"

# 或重新初始化
npx wrangler d1 execute pebble-drive-db --file=./schema.sql
```

### Q8: 前端构建时找不到 functions 目录

**解决**：
```bash
cd frontend
cp -r functions dist/
```

### Q9: 如何更新到新版本？

```bash
# 1. 拉取最新代码
git pull

# 2. 部署后端
cd backend && npx wrangler deploy

# 3. 构建并部署前端
cd ../frontend
VITE_API_BASE_URL='' VITE_TURNSTILE_SITE_KEY=your-key npm run build
cp -r functions dist/
npx wrangler pages deploy dist --project-name=pebble-drive
```

---

## 🛡️ WAF 配置（可选，付费版）

### 重要说明

⚠️ **此功能需要 Cloudflare Pro 或更高计划**

PebbleDrive 已内置速率限制保护（使用 KV 存储），**免费版用户无需额外配置 WAF**。

**后端已实现的保护（免费版可用）：**
- ✅ 登录速率限制：5次/小时
- ✅ 分享密码速率限制：3次/小时
- ✅ 上传速率限制：50次/小时/IP

**WAF 额外防护（付费版可用）：**
- 分享链接速率限制：30次/分钟/IP
- 短链接枚举防护：威胁评分过滤
- 自定义规则：灵活的防护策略

### 使用 WAF 自动配置工具

如果你是 **Cloudflare Pro 或更高计划用户**，可以使用自动化脚本快速配置 WAF：

#### 1. 获取 Cloudflare API Token

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token** → **Custom Token**
3. 设置权限：
   - Zone - Firewall Services - Edit
   - Zone - Zone Settings - Read
4. 选择你的域名
5. 复制生成的 Token

#### 2. 运行 WAF 配置脚本

```bash
cd backend/tools

# 方式1：通过环境变量
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export TARGET_DOMAIN="yourdomain.com"
node setup-waf.js

# 方式2：直接传参
node setup-waf.js "your_api_token_here" "yourdomain.com"

# 方式3：使用辅助脚本（推荐）
./setup-waf-runner.sh yourdomain.com your_api_token_here
```

#### 3. 验证 WAF 规则

脚本会自动创建以下规则：
- 分享链接速率限制（30次/分钟）
- 短链接速率限制（30次/分钟）
- 枚举攻击检测（威胁评分 > 10）

可以在 Cloudflare Dashboard 中查看：
- **Security** → **WAF** → **Rate limiting rules**
- **Security** → **WAF** → **Custom rules**

#### 4. 重要安全提醒

⚠️ **配置完成后，立即撤销 API Token！**

路径：**My Profile** → **API Tokens** → 找到 Token → **Revoke**

### 免费版替代方案

如果你使用 Cloudflare 免费版，建议：

1. **依赖后端速率限制**（已内置）
2. **使用 Cloudflare Dashboard 手动配置**：
   - 启用 **Bot Fight Mode**（免费）
   - 配置 **Security Level** 为 High（免费）
   - 启用 **Browser Integrity Check**（免费）

3. **路径**：Cloudflare Dashboard → Security → Settings

---

## 🔐 安全最佳实践

1. **定期更换密码**：使用 `npx wrangler secret put AUTH_PASSWORD`
2. **使用强密码**：至少 16 位，包含大小写字母、数字、特殊字符
3. **启用 Turnstile**：防止暴力破解和自动化攻击
4. **监控日志**：使用 `npx wrangler tail` 监控异常活动
5. **限制访问**：仅授权人员访问 Cloudflare Dashboard
6. **定期备份**：导出 D1 数据库和 R2 存储桶

---

---

## 🚨 常见问题和排查指南

### 问题 1：分享链接缓存问题（下载次数限制失效）

**症状**：
- 即使设置了下载次数限制（如 1 次），依旧可以重复下载
- 刷新密码输入页面后，时间戳参数不变
- 链接过期后依旧可以访问

**根本原因**：
⚠️ **Pages Functions 没有被部署！** 这是最常见的错误。

**检查方法**：
```bash
# 1. 检查 dist 目录中是否有 _functions
ls frontend/dist/_functions/
# 应该看到：api/ download/ share/

# 2. 检查部署日志
npx wrangler pages deploy dist --project-name=pebble-drive
# 必须看到：✨ Uploading Functions bundle

# 3. 测试 Functions 是否生效
curl -I https://your-pages-url.pages.dev/share/test
# 应该看到：cache-control: no-store, no-cache
```

**解决方案**：
```bash
cd frontend

# 方法 1：使用自动化脚本（推荐）
./deploy.sh

# 方法 2：手动复制 Functions
npm run build
cp -r functions dist/_functions  # ⚠️ 关键步骤！
npx wrangler pages deploy dist --project-name=pebble-drive
```

**验证修复**：
1. 清除浏览器缓存（Ctrl+Shift+R）
2. 访问分享链接
3. 观察 URL 中的时间戳是否每次刷新都变化
4. 下载次数限制应该生效

---

### 问题 2：部署后看不到 "Uploading Functions bundle"

**症状**：
```bash
✨ Success! Uploaded 12 files  # 只有 12 个文件
# 没有 "Uploading Functions bundle" 这一行
```

**原因**：Functions 目录没有被包含在部署中

**解决方案**：
```bash
# 检查 dist/_functions 是否存在
ls dist/_functions/

# 如果不存在，复制 Functions
cp -r functions dist/_functions

# 重新部署
npx wrangler pages deploy dist --project-name=pebble-drive
```

**正确的部署输出应该是**：
```bash
✨ Success! Uploaded 15 files  # 15 个文件（不是 12 个）
✨ Uploading Functions bundle  # 必须有这一行！
```

---

### 问题 3：前端显示 "配置错误：BACKEND_URL 未设置"

**症状**：
访问分享链接时，页面显示 "配置错误：BACKEND_URL 未设置"

**原因**：
- 方案 1（使用 Pages Functions 代理）：`frontend/wrangler.toml` 中未配置 `BACKEND_URL`
- 方案 2（直接访问后端）：前端构建时未设置 `VITE_API_BASE_URL`

**解决方案**：

**方案 1（推荐）：使用 Pages Functions 代理**
```bash
cd frontend

# 1. 创建 wrangler.toml
cp wrangler.toml.example wrangler.toml

# 2. 编辑 wrangler.toml，设置 BACKEND_URL
# [env.production.vars]
# BACKEND_URL = "https://your-backend.workers.dev"

# 3. 构建时使用空的 API_BASE_URL
VITE_API_BASE_URL='' npm run build

# 4. 确保复制 Functions
cp -r functions dist/_functions

# 5. 部署
npx wrangler pages deploy dist --project-name=pebble-drive
```

**方案 2：直接访问后端（不推荐，会暴露后端地址）**
```bash
cd frontend

VITE_API_BASE_URL=https://your-backend.workers.dev \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```

---

### 问题 4：浏览器依旧看到缓存的页面

**症状**：
- 修复后依旧有缓存问题
- 时间戳不更新
- 下载次数限制不生效

**原因**：
1. 浏览器本地缓存
2. Cloudflare CDN 缓存
3. 生产域名可能指向旧的部署版本

**解决方案**：

**1. 清除浏览器缓存**
- Chrome/Edge: **Ctrl+Shift+R** (Windows) / **Cmd+Shift+R** (Mac)
- 或使用无痕模式：Ctrl+Shift+N

**2. 清除 Cloudflare 缓存**
- 登录 Cloudflare Dashboard
- 进入 Caching → Configuration
- 点击 "Purge Everything"

**3. 检查生产域名是否指向最新部署**
```bash
# 1. 查看最新部署的预览 URL
# 应该在部署日志中看到：
# ✨ Deployment complete! Take a peek over at https://xxxxx.pebble-drive.pages.dev

# 2. 测试预览 URL 是否正常
curl -I https://xxxxx.pebble-drive.pages.dev/share/test

# 3. 如果预览 URL 正常，但生产域名不正常：
# - 登录 Cloudflare Pages Dashboard
# - 进入 pebble-drive 项目
# - Deployments → 找到最新部署 → "Promote to production"
```

**4. 等待 CDN 缓存过期**
- Cloudflare CDN 缓存可能需要 5-10 分钟过期
- 或者手动清除缓存（见上）

---

### 问题 5：deploy.sh 脚本权限错误

**症状**：
```bash
./deploy.sh
bash: ./deploy.sh: Permission denied
```

**解决方案**：
```bash
# 添加执行权限
chmod +x frontend/deploy.sh

# 重新运行
./deploy.sh
```

---

### 问题 6：如何验证 Functions 是否正确工作？

**快速检查清单**：

```bash
# 1. 检查构建输出
ls frontend/dist/_functions/
# 应该看到：api/ download/ share/

# 2. 检查部署日志
# 必须包含：✨ Uploading Functions bundle

# 3. 测试分享链接的响应头
curl -I "https://your-pages-url.pages.dev/share/test123"

# 应该看到：
HTTP/2 404  # 404 是正常的（test123 不存在）
cache-control: no-store, no-cache, must-revalidate, private, max-age=0
               ↑ 关键：如果有这个头，说明 Functions 已生效

# 4. 测试时间戳重定向
curl -I "https://your-pages-url.pages.dev/share/test123"

# 应该看到：
HTTP/2 307 Temporary Redirect
Location: /share/test123?_t=1734567890  ← 时间戳参数
```

**如果没有看到 `cache-control` 或 `307` 重定向**：
→ Functions 没有生效，请重新部署并确保复制 Functions 目录

---

### 问题 7：GitHub Actions 自动部署失败

**症状**：
GitHub Actions 部署成功，但分享链接依旧有缓存问题

**原因**：
CI/CD 配置中没有复制 Functions 目录

**解决方案**：

编辑 `.github/workflows/deploy.yml`，在部署前端步骤中添加：

```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build

- name: Copy Functions  # ⚠️ 添加这一步！
  run: cp -r frontend/functions frontend/dist/_functions

- name: Deploy to Cloudflare Pages
  run: |
    cd frontend
    npx wrangler pages deploy dist --project-name=pebble-drive
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 🔍 调试技巧

### 使用浏览器开发者工具

1. **打开开发者工具**：F12
2. **Network 标签**：
   - 勾选 "Disable cache"
   - 勾选 "Preserve log"
   - 刷新页面
   - 观察请求链：
     ```
     GET /share/Ab3x9K
       → 307 Redirect → /share/Ab3x9K?_t=1234567890
       → 200 OK (密码输入页面)
     ```

3. **Console 标签**：
   - 查找日志：`[Anti-Cache] Detected BFCache, forcing reload...`
   - 如果看到这条日志，说明 BFCache 防护已生效

4. **Application 标签**：
   - Storage → Cache Storage
   - 如果看到缓存的分享链接，手动删除

### 使用 curl 测试

```bash
# 1. 测试重定向
curl -I "https://your-domain.com/share/Ab3x9K"
# 预期：HTTP/2 307，Location 包含 ?_t=

# 2. 测试缓存控制头
curl -I "https://your-domain.com/share/Ab3x9K?_t=1234567890"
# 预期：cache-control: no-store, no-cache

# 3. 测试下载次数限制
# 首次访问（假设限制 1 次）
curl -L "https://your-domain.com/share/Ab3x9K"
# 预期：返回文件内容或密码输入页面

# 第二次访问（2 秒后）
sleep 2
curl -L "https://your-domain.com/share/Ab3x9K"
# 预期：返回 "下载次数已达上限" 错误页面
```

---

## 📚 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Functions 文档](https://developers.cloudflare.com/pages/platform/functions/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [PebbleDrive GitHub 仓库](https://github.com/aydomini/pebble-drive)

---

**最后更新**: 2025-12-15
**文档版本**: v1.3.2
**维护者**: PebbleDrive Team
