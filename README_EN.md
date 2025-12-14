# 🌟 PebbleDrive - Lightweight Cloud Storage

[中文](README.md) | **English** | **[🎭 Live Demo](https://aydomini.github.io/pebble-drive/)**

> 🚀 **Deploy in 5 minutes, completely free private cloud storage**
>
> **Serverless Architecture** | **Global CDN Acceleration** | **Enterprise-Grade Security**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/)

---

## 📋 Features

### 🎯 Core Functions
- 🚀 **Serverless Architecture** - Cloudflare Workers global edge deployment, 100k free requests/day
- 📦 **Triple Storage System** - R2 (files, 10GB free) + D1 (metadata, 5GB free) + KV (sessions/rate limiting)
- 📤 **Smart Upload** - Drag-and-drop upload, single file up to 5GB, supports chunked upload, resume capability
- 🔍 **Advanced Management** - File search, sorting, pagination, intelligent storage quota management
- 🔗 **Secure Sharing** - Password protection (SHA-256), time-limited links, download count limits, rate limiting anti-brute-force
- 👁️ **Universal Preview** - Images, PDF, Markdown, 40+ programming languages, SVG, plain text
- 🔐 **Enterprise Security** - Turnstile verification, JWT auth, IP rate limiting, account lockout, password hashing
- 🌍 **Multi-Language** - Chinese/English/Japanese adaptive switching
- 🌓 **Dark Mode** - Adaptive theme, supports system preference
- 📱 **Responsive Design** - Perfect for desktop/tablet/mobile

### 🏗️ Technical Architecture

**Data Flow**:
```
User → Pages (Frontend) → Workers (API) → R2 (Files) + D1 (Metadata) + KV (Rate Limit/Session)
```

**Triple Storage System Design**:

| Storage | Purpose | Advantages | Free Tier |
|---------|---------|------------|-----------|
| **R2** | File Content | No egress fees, global CDN, large file friendly | 10GB storage |
| **D1** | Structured Data | Complex queries, transactions, foreign keys | 5GB database |
| **KV** | Key-Value Data | Millisecond read/write, globally distributed, rate limiting | 1GB storage |

### 💻 Tech Stack

**Frontend**
- Vite 5.x + Vanilla JavaScript ES6+
- TailwindCSS (Atomic CSS)
- Marked.js (Markdown) + Highlight.js (Code highlighting)

**Backend**
- Cloudflare Workers (V8 Engine)
- R2 + D1 + KV Triple Storage
- JWT + Turnstile Security Auth
- RESTful API

**Deployment**
- GitHub Actions Automated CI/CD
- Wrangler CLI Toolchain
- Cross-platform deployment scripts (Node.js)

---

## 🚀 Quick Start

### ⚡ One-Click Deployment (3 minutes)

```bash
# 1. Clone the project
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. One-click deploy
npm run deploy
```

**🎉 Done!** The script will automatically:
- ✅ Check environment and login status
- ✅ Guide you to select configuration preset
- ✅ Auto-deploy backend and frontend
- ✅ Output access URLs

**📝 After first deployment, set password:**
```bash
cd backend
echo "your-password" | npx wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | npx wrangler secret put AUTH_TOKEN_SECRET
```

---

### 📚 Detailed Documentation

| Document | Description |
|----------|-------------|
| **[DEPLOY.md](DEPLOY.md)** | Complete deployment guide (local/GitHub Actions/manual) |
| **[CHANGELOG.md](CHANGELOG.md)** | Version changelog and feature descriptions |
| **[Live Demo](https://aydomini.github.io/pebble-drive/)** | Online demo (no deployment needed) |

---

## 📖 API Documentation

<details>
<summary><b>Click to expand API endpoints</b></summary>

### Authentication
```http
POST /api/login
Content-Type: application/json

{ "password": "your-password" }
```

### File Operations
```http
POST   /api/upload              # Upload file
POST   /api/upload/init         # Initialize chunked upload
POST   /api/upload/chunk        # Upload chunk
POST   /api/upload/complete     # Complete chunked upload
POST   /api/upload/abort        # Abort chunked upload
GET    /api/files               # File list (supports pagination, search, sorting)
GET    /api/download?id=xxx     # Download file
DELETE /api/delete?id=xxx       # Delete file
```

### Sharing
```http
POST /api/share
Content-Type: application/json

{
  "fileId": "xxx",
  "password": "optional",      // Optional, SHA-256 hashed
  "expiry": 3600,             // Seconds, optional
  "downloadLimit": 10         // Count, optional
}

GET /share/:token              # Access share link
POST /share/:token/verify      # Verify password (rate limited 5 times/hour)
```

### Configuration
```http
GET /api/config/limits         # Get upload limit configuration
GET /api/storage/quota         # Storage quota information
```

</details>

---

## ❓ FAQ

<details>
<summary><b>Q1: How to change login password?</b></summary>

```bash
cd backend
echo "new-password" | npx wrangler secret put AUTH_PASSWORD
```
No redeployment needed, takes effect immediately.
</details>

<details>
<summary><b>Q2: What if I exceed the free tier?</b></summary>

Pay-as-you-go after exceeding, extremely low cost:
- Workers: $0.50/million requests
- R2: $0.015/GB storage + $0.01/GB egress
- D1: $0.75/GB database
- KV: $0.50/GB storage + $0.50/million reads + $5.00/million writes

Personal use scenario: ~10GB storage + 1000 uploads/month = **~$0.20/month**
</details>

<details>
<summary><b>Q3: How to configure custom domain?</b></summary>

### Backend API Domain
1. Cloudflare Dashboard → Workers → Triggers → Custom Domains
2. Add domain (e.g., `storage.yourdomain.com`)

### Frontend Domain
1. Cloudflare Dashboard → Pages → Custom domains
2. Add domain (e.g., `file.yourdomain.com`)

### Rebuild Frontend
```bash
cd frontend
VITE_API_BASE_URL=https://storage.yourdomain.com \
VITE_TURNSTILE_SITE_KEY=your-site-key \
npm run build

npx wrangler pages deploy dist --project-name=pebble-drive
```

See [DEPLOY.md](DEPLOY.md) for detailed configuration.
</details>

<details>
<summary><b>Q4: Which file types support preview?</b></summary>

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, Markdown
- **Code**: JavaScript/TypeScript, Python, Java, Go, Rust, C/C++, HTML/CSS, JSON, YAML, SQL, Vue, React, etc. 40+ languages
- **Other**: TXT plain text
</details>

<details>
<summary><b>Q5: How to backup data?</b></summary>

```bash
# Backup database
wrangler d1 export pebble-drive-db --output=backup.sql

# List R2 files
wrangler r2 object list pebble-drive-storage
```
</details>

<details>
<summary><b>Q6: What if deployment fails?</b></summary>

**Common Troubleshooting:**

1. **Login Failure** - Check if `VITE_API_BASE_URL` environment variable is correctly set
2. **Turnstile Verification Failure** - Confirm domain is added to Turnstile configuration
3. **File Upload Failure** - Check R2 bucket binding and permissions
4. **Database Error** - Confirm D1 database table structure is initialized

See "Troubleshooting" section in [DEPLOY.md](DEPLOY.md) for detailed guide.
</details>

---

## 🔧 Available Commands

### Deployment
```bash
npm run deploy   # One-click deploy (recommended)
npm run upgrade  # Auto upgrade
npm run check    # Pre-deployment check
```

### Development
```bash
npm run dev:backend   # Start backend dev server
npm run dev:frontend  # Start frontend dev server
npm run build         # Build frontend
```

---

## 🗺️ Roadmap

- [ ] Video/Audio preview
- [ ] Folder support
- [ ] Batch operations
- [ ] Office document preview
- [ ] Mobile App

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
