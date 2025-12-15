# 🌟 PebbleDrive - Lightweight Cloud Storage

[中文](README.md) | **English** | **[🎭 Live Demo](https://aydomini.github.io/pebble-drive/)**

> 🚀 **Free Private Cloud Storage Based on Cloudflare Workers**
>
> **Serverless Architecture** | **Global CDN** | **Enterprise Security**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/)

---

## 📋 Core Features

- 🚀 **Serverless Architecture** - Cloudflare Workers edge computing, 100k free requests/day
- 📦 **Triple Storage System** - R2 (files) + D1 (metadata) + KV (rate limiting)
- 📤 **Smart Upload** - Drag-and-drop, max 200MB, resumable uploads
- 🔗 **Flexible Sharing** - Standard/short link switching, password protection, time-limited downloads
- 👁️ **File Preview** - Images, PDF, Markdown, code highlighting, SVG
- 🔐 **Security** - SHA-256 hashing, rate limiting, Turnstile verification
- 🌍 **Multi-Language** - Chinese/English/Japanese adaptive
- 🌓 **Theme Switching** - Light/Dark mode
- 📱 **Responsive** - Perfect for desktop/tablet/mobile

---

## 🏗️ Architecture

```
User → Pages (Frontend) → Workers (Backend) → R2 + D1 + KV
```

| Storage | Purpose | Free Tier |
|---------|---------|-----------|
| **R2** | File content, no egress fees | 10GB |
| **D1** | File metadata, complex queries | 5GB |
| **KV** | Rate limiting, millisecond reads | 1GB |

**Tech Stack**: Vite + Vanilla JS + TailwindCSS + Cloudflare Workers

---

## 🚀 Quick Start

```bash
# 1. Clone the project
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. Login to Cloudflare
npx wrangler login

# 3. One-click deploy
npm run deploy

# 4. Set password (required for first deployment)
cd backend
echo "your-password" | npx wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET
```

🎉 Done! Visit the output URL to start using.

📚 **Detailed Deployment Guide**: [DEPLOY.md](DEPLOY.md)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOY.md](DEPLOY.md) | Complete deployment guide (backend/frontend/short link) |
| [CHANGELOG.md](CHANGELOG.md) | Version changelog |

---

## 💡 Main API

<details>
<summary><b>Click to view API endpoints</b></summary>

**Authentication**
```http
POST /api/login
Body: { "password": "your-password" }
```

**File Operations**
```http
POST   /api/upload         # Upload file
GET    /api/files          # File list
GET    /api/download?id=x  # Download file
DELETE /api/delete?id=x    # Delete file
```

**Sharing**
```http
POST /api/share
Body: {
  "fileId": "xxx",
  "password": "optional",    # Optional password protection
  "expiry": 3600,           # Optional expiry (seconds)
  "downloadLimit": 10       # Optional download limit
}

GET  /share/:token          # Access share link
POST /share/:token/verify   # Password verification
```

</details>

---

## ❓ FAQ

<details>
<summary><b>How to change login password?</b></summary>

```bash
cd backend
echo "new-password" | npx wrangler secret put AUTH_PASSWORD
```
Takes effect immediately, no redeployment needed.
</details>

<details>
<summary><b>How to configure custom domain?</b></summary>

After configuring custom domain in Cloudflare Dashboard, rebuild frontend:
```bash
cd frontend
VITE_API_BASE_URL=https://your-backend-domain.com \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```
See [DEPLOY.md](DEPLOY.md) for details.
</details>

<details>
<summary><b>Which file types support preview?</b></summary>

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, Markdown
- **Code**: JavaScript, Python, Java, Go, Rust, C/C++, JSON, YAML, SQL, etc. 40+ languages
- **Other**: Plain text
</details>

<details>
<summary><b>How to backup data?</b></summary>

```bash
# Export database
wrangler d1 export pebble-drive-db --output=backup.sql

# List R2 files
wrangler r2 object list pebble-drive-storage
```
</details>

For more questions, see "FAQ" section in [DEPLOY.md](DEPLOY.md).

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

Thanks to the following open-source projects and services:

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless platform
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Marked.js](https://marked.js.org/) - Markdown parser
- [Highlight.js](https://highlightjs.org/) - Code highlighting
- [FontAwesome](https://fontawesome.com/) - Icon library

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=aydomini/pebble-drive&type=Date)](https://star-history.com/#aydomini/pebble-drive&Date)

---

**Built with ❤️ using Cloudflare Workers**
