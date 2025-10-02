# 🌟 PebbleDrive - Lightweight Cloud Storage

[中文](README.md) | **English** | **[🎭 Live Demo](https://aydomini.github.io/pebble-drive/demo.html)**

> Modern cloud storage solution powered by Cloudflare Workers + R2 + D1
>
> **100% Free Deployment** | **Global CDN Acceleration** | **Smart Storage Management**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/demo.html)

---

## 📋 Features

### Core Capabilities
- 🚀 **Serverless Architecture** - Global edge deployment with 100k requests/day free tier
- 📦 **Dual Storage System** - R2 for files (10GB free) + D1 for metadata (5GB free)
- 📤 **Drag & Drop Upload** - Multi-file upload, up to 100MB per file
- 🔗 **Advanced Sharing** - Password protection, time-limited links, download count limits
- 👁️ **File Preview** - Support for images, PDF, Markdown, 40+ code languages, SVG
- 🌍 **Multi-language UI** - Chinese/English toggle
- 🌓 **Dark Mode** - Adaptive theme switching
- 📱 **Responsive Design** - Perfect for desktop and mobile

### Architecture
```
User → Cloudflare Pages (Frontend) → Workers (Backend) → R2 (Files) + D1 (Metadata)
```

**Why R2 and D1?**

| Storage | Purpose | Advantages |
|---------|---------|------------|
| **R2** | File content | Zero egress fees, global CDN, 10GB free |
| **D1** | File metadata | Complex queries, transactions, foreign keys, 5GB free |

**Workflow**: Upload → Files to R2 → Metadata to D1 → Share validation → Return files

### Tech Stack
- **Frontend**: Vite + Vanilla JS + TailwindCSS
- **Backend**: Cloudflare Workers + R2 + D1
- **Deployment**: GitHub Actions + Wrangler CLI

---

## 🚀 Quick Start

### Option 1: GitHub Actions Auto-Deploy (Recommended)

**Best for: Automatic deployment after forking**

1. **Fork this repository** to your GitHub account

2. **Set GitHub Secrets** (Settings → Secrets → Actions)
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Account ID
   - `PAGES_PROJECT_NAME` - Pages project name (optional, default: `pebble-drive`)

3. **Create Cloudflare resources and configure**
   ```bash
   wrangler r2 bucket create pebble-drive-storage
   wrangler d1 create pebble-drive-db
   # Edit backend/wrangler.toml, replace database_id
   ```

4. **Push code to trigger auto-deployment**
   ```bash
   git add .
   git commit -m "Configure database_id"
   git push
   ```

5. **After deployment, set environment variables**
   ```bash
   cd backend
   echo "your-password" | wrangler secret put AUTH_PASSWORD
   echo "your-secret" | wrangler secret put AUTH_TOKEN_SECRET
   echo "10" | wrangler secret put STORAGE_QUOTA_GB
   ```

### Option 2: One-Click Deploy Script

**Best for: Local one-click deployment**

```bash
# 1. Clone the repository
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. Login to Cloudflare
wrangler login

# 3. Create resources
wrangler r2 bucket create pebble-drive-storage
wrangler d1 create pebble-drive-db
# ⚠️ Save the returned database_id

# 4. Configure database
cd backend
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml, replace database_id with value from step 3

# 5. Initialize database
wrangler d1 execute pebble-drive-db --file=./migrations/schema.sql

# 6. Run deploy script
cd ..
./deploy.sh
```

The deploy script will automatically:
- Deploy backend Worker
- Prompt for environment variables (password, secret, quota)
- Auto-fetch Worker URL and build frontend
- Deploy frontend to Pages

### Option 3: Manual Deployment

<details>
<summary>Click to expand manual deployment steps</summary>

```bash
# Steps 1-5 are same as one-click deployment

# 6. Set environment variables
cd backend
echo "your-password" | wrangler secret put AUTH_PASSWORD
echo "your-jwt-secret" | wrangler secret put AUTH_TOKEN_SECRET
echo "10" | wrangler secret put STORAGE_QUOTA_GB  # Optional

# 7. Deploy backend
npm install
wrangler deploy
# Save the Worker URL output

# 8. Deploy frontend
cd ../frontend
npm install
VITE_API_BASE_URL=https://YOUR-WORKER-URL.workers.dev npm run build
npx wrangler pages deploy dist --project-name=pebble-drive
```

</details>

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `AUTH_PASSWORD` | Login password | ✅ Required | - |
| `AUTH_TOKEN_SECRET` | JWT secret key | ✅ Required | - |
| `STORAGE_QUOTA_GB` | Storage quota (GB) | ❌ Optional | `∞` (unlimited) |

**Notes:**
- One-click script will auto-prompt for setup
- For manual deployment, refer to "Manual Deployment" step 6 above
- For local development, configure in `backend/.dev.vars`

**Common Errors:**
- 🚫 Login error "JSON.parse error" → Forgot to set `AUTH_PASSWORD` or `AUTH_TOKEN_SECRET`
- 🚫 Frontend network error → Forgot to set `VITE_API_BASE_URL` during build

### wrangler.toml Configuration

```toml
name = "pebble-drive-api"
main = "src/index.js"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pebble-drive-storage"

[[d1_databases]]
binding = "DB"
database_name = "pebble-drive-db"
database_id = "your-database-id"  # Replace with actual value
```

---

## 📖 API Documentation

### Authentication
```http
POST /api/login
Content-Type: application/json

{ "password": "your-password" }
```

### File Operations
```http
POST   /api/upload          # Upload file
GET    /api/files           # List files
GET    /api/download?id=xxx # Download file
DELETE /api/delete?id=xxx   # Delete file
```

### Sharing
```http
POST /api/share
Content-Type: application/json

{
  "fileId": "xxx",
  "password": "optional",      // Optional
  "expiry": 3600,             // Seconds, optional
  "downloadLimit": 10         // Count, optional
}
```

### Storage Quota
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

---

## ❓ FAQ

<details>
<summary><b>Q1: Is it completely free?</b></summary>

Yes! Cloudflare free tier includes:
- Workers: 100,000 requests/day
- R2: 10GB storage + zero egress fees
- D1: 5GB database
- Pages: Unlimited deployments

Pay-as-you-go pricing beyond free tier, extremely low cost.
</details>

<details>
<summary><b>Q2: How to change file size limit?</b></summary>

Edit `frontend/public/js/app.js`:
```javascript
const validFiles = files.filter(file => file.size <= 200 * 1024 * 1024); // Change to 200MB
```
</details>

<details>
<summary><b>Q3: What file types support preview?</b></summary>

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, Markdown
- **Code**: 40+ languages (JS/TS/Python/Go/Rust, etc.)
- **Others**: Download supported
</details>

<details>
<summary><b>Q4: How to change login password?</b></summary>

```bash
cd backend
echo "new-password" | wrangler secret put AUTH_PASSWORD
```

No redeployment needed, takes effect immediately.
</details>

<details>
<summary><b>Q5: How to use custom domain?</b></summary>

1. Cloudflare Dashboard → Workers → Custom Domains
2. Add backend domain: `api.yourdomain.com`
3. Pages → Custom Domains → Add frontend domain: `drive.yourdomain.com`
4. Rebuild frontend:
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com npm run build
   npx wrangler pages deploy dist
   ```
</details>

<details>
<summary><b>Q6: How to backup data?</b></summary>

```bash
# Backup database
wrangler d1 export pebble-drive-db --output=backup.sql

# List R2 files
wrangler r2 bucket list pebble-drive-storage

# Monitor logs
wrangler tail pebble-drive-api
```
</details>

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Credits

[Cloudflare Workers](https://workers.cloudflare.com/) · [TailwindCSS](https://tailwindcss.com/) · [FontAwesome](https://fontawesome.com/) · [Vite](https://vitejs.dev/)

---

**Built with ❤️ using Cloudflare Workers**
