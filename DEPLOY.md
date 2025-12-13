# 🚀 PebbleDrive 部署与升级指南

> 跨平台支持：Windows、macOS、Linux

本文档提供完整的部署、升级和故障排查指南。

---

## 📦 前置要求

- **Node.js** >= 14.x
- **npm** 或 **yarn**
- **Cloudflare 账号**

---

## 📖 目录

- [快速部署](#-快速部署推荐)
- [升级指南](#-升级指南)
- [故障排查](#-故障排查)
- [手动操作](#-手动操作高级)
- [配置选项](#-配置选项)
- [可用命令](#-可用命令)
- [常见问题](#-常见问题)

---

## ⚡ 快速部署（推荐）

### 1. 登录 Cloudflare

```bash
npx wrangler login
```

### 2. 运行部署脚本

```bash
npm run deploy
```

脚本会引导你完成：
- ✅ 环境检查
- ✅ 配置选择（个人/团队/企业/自定义）
- ✅ 自动部署后端和前端
- ✅ 输出配置摘要

### 3. 设置 Secrets（首次部署）

```bash
cd backend

# 设置登录密码
echo "your-password" | npx wrangler secret put AUTH_PASSWORD

# 设置 JWT 密钥（32位随机字符串）
echo "$(openssl rand -base64 32)" | npx wrangler secret put AUTH_TOKEN_SECRET

# 可选：Turnstile 验证密钥
echo "your-turnstile-secret" | npx wrangler secret put TURNSTILE_SECRET_KEY
```

**完成！** 🎉 访问前端地址开始使用。

---

## 🔄 升级指南

### 方式一：自动升级（推荐）

```bash
npm run upgrade
```

**功能：**
- ✅ 自动备份配置
- ✅ 检测 Git 状态并智能降级
- ✅ 获取最新代码
- ✅ 迁移配置
- ✅ 更新依赖

**适用场景：**
- Git 仓库状态正常
- 网络连接正常
- 首次升级或常规升级

### 方式二：手动升级

```bash
# 1. 备份配置
cp backend/wrangler.toml backend/wrangler.toml.backup

# 2. 拉取最新代码
git pull origin main

# 3. 恢复配置
cp backend/wrangler.toml.backup backend/wrangler.toml

# 4. 更新依赖
npm run install:all

# 5. 重新部署
npm run deploy
```

---

## 🛠️ 故障排查

### 问题 1：Git 状态异常

**错误信息：**
```
fatal: bad object refs/heads/main
❌ Git 仓库状态检查失败
```

**原因：**
- Git 仓库损坏
- 网络连接问题
- 远程仓库无法访问

**解决方案：**

**选项 A：使用降级模式（推荐）**
```bash
npm run upgrade
# 当提示 Git 错误时，选择 "y" 跳过代码更新
```
工具会自动：
- ✅ 跳过代码更新
- ✅ 迁移配置
- ✅ 更新依赖

**选项 B：手动修复 Git**
```bash
# 1. 检查 Git 状态
git status

# 2. 检查远程仓库
git remote -v

# 3. 尝试修复
git fetch --all
git reset --hard origin/main

# 4. 如果还是失败，克隆新仓库
cd ..
git clone https://github.com/aydomini/pebble-drive.git pebble-drive-new
cd pebble-drive-new

# 5. 复制旧配置
cp ../pebble-drive/backend/wrangler.toml backend/
```

---

### 问题 2：部署时 UTF-8 编码错误

**错误信息：**
```
Invalid commit message, it must be a valid UTF-8 string. [code: 8000111]
```

**原因：**
- Git commit message 包含中文或 emoji
- wrangler pages deploy 对中文支持不好

**解决方案：**

**选项 A：使用改进的部署工具（v2.1+）**
```bash
npm run deploy
```
工具会自动使用英文 commit message，避免编码问题。

**选项 B：手动部署时指定英文 message**
```bash
# 部署后端
cd backend
npx wrangler deploy

# 构建前端
cd ../frontend
VITE_API_BASE_URL=https://your-api.workers.dev \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

# 部署前端（使用英文 message）
cd ..
npx wrangler pages deploy frontend/dist \
  --project-name=pebble-drive \
  --commit-message="Deploy update" \
  --commit-dirty=true
```

---

### 问题 3：Wrangler 未登录

**错误信息：**
```
In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN
```

**解决方案：**

**方式一：浏览器登录（推荐）**
```bash
cd backend
npx wrangler login
```

**方式二：使用 API Token**
```bash
export CLOUDFLARE_API_TOKEN="你的token"
cd backend
npx wrangler deploy
```

---

### 问题 4：依赖安装失败

**错误信息：**
```
npm ERR! ...
```

**解决方案：**

```bash
# 清理所有依赖
npm run clean

# 重新安装
npm run install:all

# 或者手动安装
cd backend && npm install
cd ../frontend && npm install
```

---

## 🔧 手动操作（高级）

### 手动部署后端

```bash
cd backend

# 编辑配置
nano wrangler.toml

# 部署
npx wrangler deploy
```

### 手动部署前端

```bash
cd frontend

# 构建（设置后端 API 地址）
VITE_API_BASE_URL=https://your-api.workers.dev \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

# 部署（使用英文 message 避免编码问题）
npx wrangler pages deploy dist \
  --project-name=pebble-drive \
  --commit-message="Deploy" \
  --commit-dirty=true
```

### 手动升级步骤

如果自动工具无法使用，按以下步骤手动升级：

**1. 备份配置**
```bash
mkdir -p .backup
cp backend/wrangler.toml .backup/wrangler.toml.$(date +%Y%m%d-%H%M%S)
```

**2. 更新代码**
```bash
# 保存未提交的更改
git stash

# 获取最新代码
git pull origin main

# 或者，如果 Git 有问题，下载最新代码
# 访问：https://github.com/aydomini/pebble-drive/archive/refs/heads/main.zip
```

**3. 配置新变量**

编辑 `backend/wrangler.toml`，确保包含以下配置：

```toml
[vars]
# 基础配置
STORAGE_QUOTA_GB = "10"
SHARE_DOMAIN = "https://your-api.workers.dev"

# 安全限制（v1.3.0+）
MAX_FILE_SIZE_MB = "100"
BLOCKED_EXTENSIONS = ".exe,.sh,.bat,.cmd,.scr,.vbs,.js,.jar,.app,.deb,.rpm,.dmg,.pkg,.msi,.com,.pif,.gadget,.wsf"
UPLOAD_RATE_LIMIT = "50"
UPLOAD_RATE_WINDOW = "3600"
```

**4. 更新依赖并部署**
```bash
cd backend && npm install
cd ../frontend && npm install

# 重新部署
npm run deploy
```

---

## 📦 配置选项

### 预设配置

#### 预设 1：个人使用（默认）
```toml
MAX_FILE_SIZE_MB = "100"
STORAGE_QUOTA_GB = "10"
UPLOAD_RATE_LIMIT = "50"
UPLOAD_RATE_WINDOW = "3600"
```
- 单文件最大：**100MB**
- 存储配额：**10GB**
- 上传限制：**50次/小时**

#### 预设 2：小团队
```toml
MAX_FILE_SIZE_MB = "500"
STORAGE_QUOTA_GB = "50"
UPLOAD_RATE_LIMIT = "100"
UPLOAD_RATE_WINDOW = "3600"
```
- 单文件最大：**500MB**
- 存储配额：**50GB**
- 上传限制：**100次/小时**

#### 预设 3：企业级
```toml
MAX_FILE_SIZE_MB = "2000"
STORAGE_QUOTA_GB = "500"
UPLOAD_RATE_LIMIT = "200"
UPLOAD_RATE_WINDOW = "3600"
```
- 单文件最大：**2000MB** (2GB)
- 存储配额：**500GB**
- 上传限制：**200次/小时**

### 自定义配置

运行 `npm run deploy` 时选择"自定义配置"，根据提示输入参数。

### ⚠️ 配置限制说明（重要）

**Cloudflare 平台限制**：

| 配置项 | 最小值 | 最大值 | 平台限制原因 |
|--------|--------|--------|-------------|
| `MAX_FILE_SIZE_MB` | 1MB | **5000MB (5GB)** | Cloudflare R2 单文件上传限制 |
| `STORAGE_QUOTA_GB` | 1GB | **10000GB (10TB)** | 建议的存储配额上限 |
| `UPLOAD_RATE_LIMIT` | 1次 | 10000次 | 速率限制合理范围 |
| `UPLOAD_RATE_WINDOW` | 1秒 | 86400秒 (24小时) | 速率限制窗口上限 |

**自动修正机制**：
- ✅ 如果配置值**超过最大值**，系统会**自动调整到最大允许值**
- ✅ 如果配置值**小于最小值**，系统会**回退到默认值**
- ✅ 修正后的配置会在 Worker 日志中显示

**示例**：
```toml
# ❌ 用户设置（超过限制）
MAX_FILE_SIZE_MB = "100000"  # 100GB

# ✅ 系统自动调整为
MAX_FILE_SIZE_MB = "5000"    # 5GB (Cloudflare R2 最大值)
```

**查看日志**：
```bash
cd backend
npx wrangler tail

# 会看到类似输出：
# ⚠️ MAX_FILE_SIZE_MB (100000MB) 超过限制，已调整为 5000MB (5GB)
```

---

## 📋 可用命令

### 部署相关

| 命令 | 说明 | 跨平台 |
|------|------|--------|
| `npm run deploy` | 一键部署（推荐） | ✅ |
| `npm run upgrade` | 一键升级（智能降级） | ✅ |
| `npm run check` | 部署前检查 | ✅ |

### 开发相关

| 命令 | 说明 |
|------|------|
| `npm run dev:backend` | 启动后端开发服务器 |
| `npm run dev:frontend` | 启动前端开发服务器 |
| `npm run build:frontend` | 构建前端 |
| `npm run install:all` | 安装所有依赖 |
| `npm run clean` | 清理所有依赖 |

---

## ❓ 常见问题

### Q1: Windows 上无法运行 .sh 脚本？

**A:** 使用新的跨平台命令：
```bash
npm run deploy   # 替代 ./deploy-with-config.sh
npm run check    # 替代 ./pre-deploy-check.sh
npm run upgrade  # 替代升级脚本
```

---

### Q2: 升级后配置丢失？

**A:** 升级工具会自动备份和恢复配置。

备份位置：`.backup/wrangler.toml.TIMESTAMP`

查看备份：
```bash
ls -la .backup/
```

恢复配置：
```bash
cp .backup/wrangler.toml.TIMESTAMP backend/wrangler.toml
```

---

### Q3: 升级失败了怎么办？

**A:** 可以回滚到之前的版本：

```bash
# 恢复配置
cp .backup/wrangler.toml.TIMESTAMP backend/wrangler.toml

# 回滚代码
git reset --hard HEAD~1

# 重新部署
cd backend && npx wrangler deploy
```

---

### Q4: 升级后旧文件会受影响吗？

**A:** 不会。新的限制只影响新上传的文件，已存在的文件不受影响。

---

### Q5: Secrets 是否需要每次部署都设置？

**A:** 不需要。Secrets 是永久保存的，只需设置一次。

查看已设置的 Secrets：
```bash
cd backend && npx wrangler secret list
```

应该看到：
- `AUTH_PASSWORD` - 登录密码
- `AUTH_TOKEN_SECRET` - JWT 密钥
- `TURNSTILE_SECRET_KEY` - Turnstile 验证密钥（可选）

---

### Q6: 如何修改配置？

**A:** 编辑 `backend/wrangler.toml`，然后重新部署：
```bash
cd backend && npx wrangler deploy
```

配置会立即生效，无需重启。

---

### Q7: 如何验证升级成功？

**A:** 升级完成后，进行以下验证：

**1. 检查配置**
```bash
# 访问你的网站
open https://your-domain.com

# 登录后查看存储配额显示
```

**2. 测试新限制**
- 尝试上传超过配额的文件，应该被拒绝
- 尝试上传 .exe 文件，应该被拒绝
- 短时间内多次上传，达到限制后应该被拒绝

**3. 检查后端日志**
```bash
cd backend
npx wrangler tail

# 上传文件，观察日志中是否有新的验证信息
```

---

## 🆘 获取帮助

如果遇到无法解决的问题：

### 1. 查看日志

```bash
# 查看 wrangler 日志
cd backend
npx wrangler tail

# 查看构建日志
cat frontend/dist/index.html | grep ENV_API_BASE_URL
```

### 2. 提交 Issue

- GitHub: https://github.com/aydomini/pebble-drive/issues
- 提供详细的错误信息和日志

### 3. 查看文档

- [完整 README](https://github.com/aydomini/pebble-drive)
- [配置示例](backend/wrangler.toml.example)
- [更新日志](CHANGELOG.md)

---

## 📝 版本兼容性

| 旧版本 | 升级到 v1.3.0+ | 说明 |
|--------|---------------|------|
| v1.0.x | ✅ 支持 | 需要添加新配置项 |
| v1.1.x | ✅ 支持 | 需要添加新配置项 |
| v1.2.x | ✅ 支持 | 需要添加新配置项 |
| < v1.0 | ⚠️  需要全新部署 | 数据库结构有变化 |

---

## 💡 提示

- ✅ 使用 `npm run deploy` 替代所有 `.sh` 脚本
- ✅ 定期运行 `npm run upgrade` 获取最新功能
- ✅ 配置文件会自动备份到 `.backup/` 目录
- ✅ Secrets 无需每次设置，永久保存
- ✅ 遇到 Git 问题时，升级工具会自动提供降级选项
- ✅ 部署工具自动处理 UTF-8 编码问题

---

**最后更新**: 2025-12-12
**适用版本**: v1.3.0+
**祝你使用愉快！** 🎉
