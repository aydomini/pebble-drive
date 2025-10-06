# 更新日志 | Changelog

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
