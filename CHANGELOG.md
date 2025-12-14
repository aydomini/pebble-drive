# 更新日志 | Changelog

## [1.3.1] - 2025-12-14

### 🎨 UI/UX 优化 | Improved

#### 分页显示精简
- **左侧统计简化**：从"显示 1-10 / 共 11 个文件"简化为纯数字格式"1-10/11"，节省空间 60%
- **页码按钮精简**：最多显示页码从 5 个减少到 3 个，整体宽度减少约 40%
- **布局紧凑优化**：将统计信息从左侧移到右侧，紧挨着分页按钮，添加分隔符"|"增强视觉连贯性
  - 改进前：`[1-10/11]                    [◀] [1] [2] [3] [▶]`（左右分离）
  - 改进后：`                    [1-10/11] | [◀] [1] [2] [3] [▶]`（紧凑居中）
- **移动端友好**：紧凑的分页设计在小屏幕上不会换行，用户体验更佳
- **视觉更清爽**：纯数字表达清晰明了，添加 `font-medium` 让数字更醒目
- **相关文件**：`frontend/public/js/app.js:2995, 3003-3016`

#### 手机横屏模式：抽屉式菜单重构
- **从浮动按钮改为抽屉式交互**：右侧抽屉设计，点击触发按钮从右侧滑出菜单面板
- **iOS 风格配色**：深灰色半透明背景 + 毛玻璃效果（`backdrop-filter: blur(8px)`）
- **完整圆角矩形设计**：触发按钮和菜单面板都采用 8px 完整圆角，独立元素设计更简洁
- **动态透明度交互**：
  - 关闭状态：`rgba(255, 255, 255, 0.6)` - 60% 不透明（低调隐身）
  - 打开状态：`rgba(255, 255, 255, 0.8)` - 80% 不透明（强化存在感）
  - 悬停效果：80%-90% 不透明（引导交互）
- **平滑动画**：0.3s cubic-bezier 缓动 + 箭头旋转 180°
- **自动适配主题**：浅色/深色模式下自动切换配色
- **视觉效果对比**：
  - 改进前：蓝色浮动按钮 + 下拉菜单（占用顶部空间）
  - 改进后：半透明抽屉 + 侧滑面板（右侧隐藏，不占核心区域）
- **相关文件**：
  - `frontend/public/index.html:262-343, 705-726`（抽屉 HTML + CSS）
  - `frontend/public/js/app.js:358-386, 1477-1594`（抽屉逻辑 + 主题同步）

#### 分页器极简重构
- **极简导航设计**：从传统多页码改为"文件统计 + 导航按钮"模式
- **智能显示首末页按钮**：
  - `⏮`（第一页）：仅当 `currentPage > 2` 时显示
  - `⏭`（最后一页）：仅当 `currentPage < totalPages - 1` 时显示
- **只显示当前页码**：移除前后页码显示，蓝色背景高亮当前页
- **图标增强**：使用 Font Awesome 图标区分功能
  - `⏮` (`fa-fast-backward`) - 第一页
  - `◀` (`fa-chevron-left`) - 上一页
  - `▶` (`fa-chevron-right`) - 下一页
  - `⏭` (`fa-fast-forward`) - 最后一页
- **空间节省**：从 ~120px 压缩到 ~80px（**节省 33%**）
- **布局示例**：
  - 第 1 页：`1-10/9990 ◀ 1 ▶ ⏭`（4 个元素）
  - 第 123 页：`1221-1230/9990 ⏮ ◀ 123 ▶ ⏭`（5 个元素）
  - 第 999 页：`9981-9990/9990 ⏮ ◀ 999 ▶`（4 个元素）
- **相关文件**：`frontend/public/js/app.js:2993-3075`

#### 手机横屏布局优化
- **分屏场景修复**：修复手机横屏分屏模式下错误触发横屏优化的问题
- **精确判定逻辑**：增加 `min-width: 600px` 条件，确保只在全屏模式下触发横屏优化
- **判定条件优化**：
  - ✅ 横屏方向（`orientation: landscape`）
  - ✅ 高度足够矮（`max-height: 500px`）
  - ✅ **宽度足够宽**（`min-width: 600px`）- 新增，排除分屏场景
  - ✅ 宽度不超限（`max-width: 900px`）- 排除桌面
  - ✅ 触摸屏设备（`hover: none` + `pointer: coarse`）
- **效果对比**：
  - 改进前：横屏分屏（422×390）会错误触发横屏优化
  - 改进后：只有全屏（844×390）才触发，分屏模式保持正常布局
- **相关文件**：`frontend/public/index.html:265-271`

#### 手机横屏模式：极致垂直空间优化
- **卡片比例统一**：上传卡片和文件列表卡片的比例从 `0.8:2.2` 统一为 `1:2`，与其他模式保持一致
- **虚线框 padding 优化**：
  - 普通模式：统一为 `8px`（上下左右一致，从 `16px/12px` 压缩）
  - 手机横屏：统一为 `4px`（上下左右一致，从 `4px/8px` 优化）
- **工具栏 padding 移除**：修复工具栏外层容器的 `16px` padding 残留问题，为文件列表腾出空间
- **文件列表项极致压缩**（垂直空间节省 30%）：
  - **padding**：8px → **4px**（上下各，节省 8px）
  - **文件名字体**：14px → **11px**（压缩 21%）
  - **文件大小字体**：12px → **10px**（压缩 17%）
  - **图标大小**：20px → **16px**（压缩 20%）
  - **按钮 padding**：6px → **4px**（压缩 33%）
  - **按钮图标**：14px → **12px**（压缩 14%）
  - **行高效果**：46px → **32px**（节省 30%）
- **垂直空间增益**：
  - 10 个文件：从 460px 压缩到 **320px**（节省 140px）
  - 15 个文件：从 690px 压缩到 **480px**（节省 210px）
  - 在 400px 高度屏幕上可**多显示 3-4 个文件**
- **相关文件**：`frontend/public/index.html:480-533`

### 🔧 部署优化 | Deployment

#### GitHub Actions Workflow 增强
- **自动创建 KV Namespace**：部署时自动检查并创建 `RATE_LIMIT` 和 `RATE_LIMIT_preview` KV 命名空间
- **增强的数据库配置**：支持自动创建 D1 数据库（而不仅仅是查找），使用 JSON 输出解析 ID 更可靠
- **前端构建验证**：新增构建输出验证步骤，自动检查环境变量是否正确注入到 `dist/index.html`
- **更完整的部署说明**：移除已弃用的 `STORAGE_QUOTA_GB` secret，添加 `AUTH_TOKEN_SECRET` 说明
- **错误处理增强**：构建失败时立即中止部署，避免部署错误的版本
- **相关文件**：`.github/workflows/deploy.yml`（5.9KB → 8.5KB）

#### 配置文档同步
- **wrangler.toml.example 修正**：KV namespace 创建命令从 `RATE_LIMIT_KV` 修正为 `RATE_LIMIT`（与 workflow 一致）
- **添加自动化说明**：注释中说明 KV 可由 GitHub Actions 自动创建
- **相关文件**：`backend/wrangler.toml.example:74-75`

### 📚 文档完善 | Documentation
- **DEPLOY.md 更新**：添加 GitHub Actions 自动化部署说明
- **CHANGELOG.md 更新**：添加本次版本更新记录
- **README 精简**：移除与 DEPLOY.md 和 CHANGELOG.md 重复的内容

---

## [1.3.0] - 2025-12-12

### ✨ 新增功能 | Added

#### 🚀 分片上传功能（极简 KV 版本）
- **大文件支持**：支持上传最大 5GB 的大文件，自动分片上传（50MB/片）
- **极简设计**：KV 操作仅 3 次（初始化 1 PUT + 完成 1 GET + 1 DELETE），极低成本
- **前端状态管理**：前端维护上传进度，断点续传支持（localStorage）
- **文件级并行上传**：支持同时上传多个大文件（最多 3 个并发）
- **实时进度反馈**：分片上传进度条实时显示（1/4, 2/4, ...）
- **完整 i18n 支持**：分片上传相关提示完全支持中英文切换

#### 🔐 分享安全增强
- **密码哈希存储**：分享密码使用 SHA-256 哈希存储，数据库泄露也无法获取明文密码
- **加密安全 Token**：使用 `crypto.getRandomValues()` 生成 16 字节加密安全随机数（替代 Math.random）
- **密码验证速率限制**：每个 IP + 分享链接组合限制 5 次密码尝试/小时，防止暴力破解
- **自动重置**：密码正确后自动重置错误尝试计数

#### 🔐 安全功能增强
- **可配置的上传限制**：支持自定义文件大小限制、存储配额、上传速率限制
- **文件类型验证**：可配置文件类型黑名单，默认禁止 `.exe, .sh, .bat` 等危险文件
- **后端验证**：所有上传限制在后端强制验证，无法被绕过
- **IP 级别速率限制**：基于 KV 存储的滑动窗口速率限制，防止滥用（默认 50次/小时）
- **智能配置修正**：超过平台限制的配置自动调整为最大允许值（而非默认值）

#### 🛠️ 跨平台部署工具
- **一键部署**：`npm run deploy` 替代旧的 bash 脚本，支持 Windows/macOS/Linux
- **自动升级**：`npm run upgrade` 自动备份配置、更新代码、迁移配置
- **部署前检查**：`npm run check` 验证环境、登录状态、配置完整性
- **交互式配置**：部署时可选择预设（个人/团队/企业）或自定义配置

#### 📋 配置管理
- **集中配置服务**：`backend/src/services/config.js` 统一管理所有上传配置
- **配置验证**：自动验证配置值的合法性，异常时使用安全默认值
- **公开 API 端点**：`/api/config/limits` 允许前端动态加载配置
- **动态配置加载**：前端从后端实时获取配置，刷新按钮同步更新限制信息

#### 🎨 UI/UX 改进

##### 📱 PWA 渐进式Web应用支持
- **离线访问**：Service Worker 缓存静态资源，支持离线访问（Cache First 策略）
- **可安装应用**：支持添加到桌面/主屏幕，原生应用般的体验
- **自动更新检测**：新版本上线时自动检测并提示用户更新
- **应用图标**：专业的 logo.svg（512x512，蓝色渐变 + 字母P）
- **PWA 配置清单**：manifest.json 支持中英文、深色模式、快捷方式（快速上传）
- **分享目标**：支持从其他应用分享文件到 PebbleDrive
- **相关文件**：`frontend/public/logo.svg`, `manifest.json`, `service-worker.js`

##### 📐 布局高度响应式优化
- **视口百分比高度**：从固定 `max-h-[800px]` 改为响应式 `h-[75vh]`，适配所有屏幕尺寸
- **Flexbox 布局修复**：
  - `main` 添加 `overflow-auto` 和 `min-h-0` 防止溢出
  - 左侧容器添加 `overflow-hidden` 防止子元素撑大页面
  - 所有卡片添加 `min-h-0` 允许 flex 子元素正确收缩
- **垂直居中**：卡片区域在视口中垂直居中，上下空间均等（各约 12.5vh）
- **内部滚动**：文件列表多时在卡片内部滚动，不撑大整个页面
- **屏幕适配**：完美适配 1080p、1440p、4K 等不同分辨率
- **相关文件**：`frontend/public/index.html:80-109`

##### 👁️ 文件预览功能增强
- **Markdown 预览**：使用 `marked.js` 解析为 HTML，支持标题、列表、链接、表格、代码块等
- **代码语法高亮**：支持 40+ 种编程语言（JavaScript/TypeScript, Python, Java, C/C++, Go, Rust, HTML/CSS, JSON, YAML, SQL, Vue, React 等）
- **SVG 双重预览**：
  - 上方：渲染的 SVG 图形效果
  - 下方：带语法高亮的 XML 源代码（方便开发者查看和复制）
- **异步加载**：文件内容异步加载，避免阻塞渲染
- **响应式预览**：支持桌面端和移动端（模态框预览）
- **相关文件**：`frontend/public/js/app.js:265-439, 899-956`

##### 🎨 精致的视觉优化
- **自定义滚动条**：全局滚动条（8px）和预览区域滚动条（10px）支持深色模式适配
  - 日间模式：浅灰轨道 + 中灰滑块
  - 夜间模式：深灰轨道 + 中深灰滑块
  - 悬停时颜色加深，提供交互反馈
- **Turnstile 全设备响应式适配**：人机验证框完美适配所有设备尺寸
  - 混合策略：容器宽度 ≥ 300px 使用 `flexible` 模式，< 300px 使用 `normal` + CSS scale 缩放
  - 手机竖屏：normal 模式 + 缩放至容器宽度，保持横向扁平布局
  - 桌面/平板：flexible 模式自动填充，宽度 = 输入框宽度
  - 宽度检测优化：使用 `requestAnimationFrame` + `setTimeout` 确保 DOM 完全渲染
- **版本号显示**：登录页面和主页面显示版本号，点击跳转到 GitHub 仓库
- **上传进度优化**：上传进度添加关闭按钮（仅隐藏 UI，不中断上传）
- **文件预览垂直居中**：不支持预览的文件类型在预览区域完美垂直居中
- **相关文件**：`frontend/public/index.html:120-191`, `frontend/public/js/app.js:709-767`

#### 🌐 多语言完善
- **上传进度标题 i18n**：上传进度标题支持中英文切换
- **上传进度按钮 i18n**：上传进度取消按钮和关闭按钮支持动态多语言切换（`app.js:1313-1327, 1429-1444`）
- **分片上传完整翻译**：所有分片上传相关提示支持多语言
- **动态语言切换**：切换语言后自动更新所有动态配置文本

### 🔧 修复 | Fixed
- 🐛 修复上传进度条取消按钮的多语言适配问题（切换语言后 title 属性不更新）
- 🐛 修复取消上传后 R2 存储中残留孤立的 multipart upload 导致的存储泄漏
- 🐛 修复 R2 bucket 绑定名称错误（`STORAGE_BUCKET` → `R2_BUCKET`，影响 3 个文件）
- 🐛 修复 R2 Multipart Upload API 调用方式（需要先调用 `resumeMultipartUpload()`）
- 🐛 修复 uploadComplete 缺少 uploadDate 和默认 fileType 导致元数据保存失败
- 🐛 修复 uploadComplete 响应格式不一致导致文件列表渲染失败（`fileId` → `id`）
- 🐛 修复前端文件大小限制可以被开发者工具绕过的安全问题
- 🐛 修复无文件类型验证导致可上传恶意文件的漏洞
- 🐛 修复无速率限制导致可被滥用的问题
- 🐛 修复配置值超限时回退到默认值而非最大允许值的问题

### 🎨 优化 | Improved

#### 📚 文档优化
- **简化新用户部署流程**：README 新增"⚡ 最快速部署"章节，3分钟完成部署
- **删除跨平台障碍**：移除所有 bash 脚本（3个），改用 Node.js 工具
- **优化部署方式表格**：从4种简化为3种，突出推荐 `npm run deploy`
- **创建升级指南**：`UPGRADE-GUIDE.md` 详细说明配置迁移步骤
- **配置限制说明**：`DEPLOY.md` 新增配置限制表格和自动修正机制说明

#### 🔄 用户体验改进
- **友好的错误提示**：前端使用 i18n 多语言错误消息
- **动态配置加载**：前端自动从后端获取最新配置，无需硬编码
- **上传提示优化**：上传区域实时显示当前限制（文件大小、禁止类型、速率限制）
- **刷新按钮增强**：同时刷新配置、文件列表、存储信息
- **语言切换保持配置**：切换语言后保持后端配置的动态值

### 🗂️ 新增文件 | New Files
- `backend/src/handlers/uploadInit.js` - 分片上传初始化处理器
- `backend/src/handlers/uploadChunk.js` - 分片上传处理器（极简版）
- `backend/src/handlers/uploadComplete.js` - 分片上传完成处理器
- `backend/src/handlers/uploadAbort.js` - 分片上传中止处理器（清理 R2 资源）
- `backend/src/utils/ratelimit.js` - 分享密码验证速率限制工具
- `scripts/deploy.js` - 跨平台一键部署工具
- `scripts/upgrade.js` - 自动升级和配置迁移工具
- `scripts/check.js` - 部署前环境检查工具
- `package.json` (根目录) - 统一的 npm 命令入口
- `backend/src/services/config.js` - 配置管理服务
- `backend/src/handlers/configLimits.js` - 配置 API 端点
- `UPGRADE-GUIDE.md` - 老用户升级指南
- `DEPLOY.md` - 快速部署指南

### 🗑️ 删除文件 | Removed Files
- ~~`deploy-secure-local.sh`~~ → 使用 `npm run deploy`
- ~~`deploy-with-config.sh`~~ → 使用 `npm run deploy`
- ~~`pre-deploy-check.sh`~~ → 使用 `npm run check`

### 📝 配置变更 | Configuration Changes

**新增环境变量**（`backend/wrangler.toml`）：
- `MAX_FILE_SIZE_MB` - 单文件最大大小（默认 100MB）
- `STORAGE_QUOTA_GB` - 总存储配额（默认 10GB）
- `BLOCKED_EXTENSIONS` - 禁止上传的文件类型
- `UPLOAD_RATE_LIMIT` - 上传速率限制（默认 50次/小时）
- `UPLOAD_RATE_WINDOW` - 速率限制窗口（默认 3600秒）

**详细配置说明**：参考 [DEPLOY.md](DEPLOY.md#-配置选项)

### 🔄 升级指南 | Migration Guide

**自动升级（推荐）**：
```bash
npm run upgrade
```

**详细升级步骤**：参考 [DEPLOY.md](DEPLOY.md#-升级指南)

### 🗄️ 数据库迁移 | Database Migration
无需迁移

### 🔍 已知问题 | Known Issues
无

### 🎯 重大变更 | Breaking Changes

**命令行工具变更**：
- ❌ 旧的 bash 脚本已删除
- ✅ 使用新的 npm 命令：`npm run deploy` / `npm run check` / `npm run upgrade`
- ✅ Windows 用户无需安装 WSL

**向后兼容**：
- ✅ 已部署的项目无需重新配置资源（R2/D1/KV）
- ✅ Secrets 保持不变
- ✅ 前端无需重新构建（除非要更新前端代码）

**详细故障排查**：参考 [DEPLOY.md](DEPLOY.md#-故障排查)

### 🔗 相关链接 | Related Links
- [升级指南](UPGRADE-GUIDE.md)
- [部署指南](DEPLOY.md)
- [配置示例](backend/wrangler.toml.example)

---

## [1.2.0] - 2025-10-06

### ✨ 新增功能 | Added
- 🎨 **自动主题切换**：登录页面自动检测系统主题偏好（`prefers-color-scheme`），支持实时响应系统主题变化
- 🌐 **分享页面多语言**：密码保护分享页面支持中英文自适配，根据浏览器语言自动切换
- 🌓 **分享页面深色模式**：密码保护分享页面完整支持深色模式，自动检测用户主题偏好
- 🔗 **自定义分享域名**：支持配置自定义域名生成分享链接，隐藏 Worker 真实地址（环境变量 `SHARE_DOMAIN`）
- 📋 **剪贴板降级方案**：Safari 等浏览器剪贴板失败时，显示美化的模态框供用户手动复制，支持主题和多语言

### 🔧 修复 | Fixed
- 🐛 修复 Safari 浏览器分享时剪贴板权限被拒绝的问题
- 🐛 修复分享按钮使用一次后失效无法再次点击的问题（模态框结构被破坏）
- 🐛 修复自定义域名环境变量未生效的配置问题（移至根级别 `[vars]`）

### 🎨 优化 | Improved
- 💅 优化剪贴板失败时的用户体验，从简陋的 `alert()` 升级为带主题的模态框
- 🌍 密码保护分享页面新增平滑过渡动画（`transition-colors duration-200`）
- 🔐 隐私保护增强：自定义域名配置仅保存在本地 `wrangler.toml`（已在 `.gitignore`）

### 📚 文档更新 | Documentation
- 📝 更新 `backend/wrangler.toml.example` 添加 `SHARE_DOMAIN` 配置说明
- 📝 更新前端多语言翻译文件，新增 `shareLink`、`copyLinkManually`、`shareLinkCopied` 等键

### 🔍 技术细节 | Technical Details

**自动主题检测实现：**
```javascript
// frontend/public/js/app.js
ThemeManager.getTheme() {
    const saved = localStorage.getItem('pebbledrive_theme');
    if (saved) return saved; // 用户手动设置优先
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'; // 检测系统主题
    }
    return 'light';
}
```

**自定义分享域名配置：**
```javascript
// backend/src/handlers/share.js
const customDomain = env.SHARE_DOMAIN;
const baseUrl = customDomain || request.url.replace('/api/share', '');
const shareUrl = baseUrl + '/share/' + shareToken;
```

**环境变量配置：**
```toml
# backend/wrangler.toml (本地，不提交)
[vars]
SHARE_DOMAIN = "https://your-custom-domain.com"
```

### 🗄️ 数据库迁移 | Database Migration
无需迁移

### 🔍 已知问题 | Known Issues
无

---

## [1.1.0] - 2025-10-02

### ✨ 新增功能 | Added
- 🔒 **高级分享功能增强**：支持密码保护、过期时间、下载次数限制
- 🎨 **深色模式完善**：分享模态框完整适配深色主题
- 📦 **文件名修复**：密码保护下载时正确显示中文文件名

### 🔧 修复 | Fixed
- 修复分享链接创建失败的问题（数据库表结构不匹配）
- 修复密码保护分享下载时文件名显示为URL编码的问题
- 修复深色模式下分享模态框背景和文字颜色异常

### 🗄️ 数据库迁移 | Database Migration
- **重要**：如果你的项目部署于 2025-10-02 之前，请执行数据库迁移
- 迁移脚本：`backend/migrations/migrate_shares.sql`
- 影响：`shares` 表新增 `password`、`downloadLimit`、`downloadCount` 列
- 兼容性：旧的分享链接继续有效，无数据丢失

### 📚 文档更新 | Documentation
- README 新增"🔄 数据库迁移"章节
- 常见问题新增 Q2：分享链接创建失败的解决方案
- 创建迁移脚本文件供用户直接使用

### 🔍 已知问题 | Known Issues
无

---

## [1.0.0] - 2025-10-01

### 🎉 首次发布 | Initial Release

- ✅ 基础文件上传/下载/删除功能
- ✅ 文件预览（图片、PDF、Markdown、代码、SVG）
- ✅ 基础分享功能
- ✅ 存储配额管理
- ✅ 多语言支持（中文/English）
- ✅ 深色模式
- ✅ 响应式设计

---

## 版本号说明 | Version Numbering

遵循语义化版本 (Semantic Versioning)：`主版本.次版本.修订号`

- **主版本**：不兼容的 API 修改或重大架构变更
- **次版本**：向后兼容的功能性新增
- **修订号**：向后兼容的问题修正
