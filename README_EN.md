# 🌟 PebbleDrive - Lightweight Cloud Storage

[中文](README.md) | **English** | **[🎭 Live Demo](https://aydomini.github.io/pebble-drive/)**

> 🚀 **5-minute deployment, completely free personal cloud storage**
>
> **Serverless Architecture** | **Global CDN Acceleration** | **Enterprise-grade Security**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://aydomini.github.io/pebble-drive/)

---

## 📋 Features

### Core Capabilities
- 🚀 **Serverless Architecture** - Global edge deployment with 100k requests/day free tier
- 📦 **Triple Storage System** - R2 for files (10GB free) + D1 for metadata (5GB free) + KV for sessions & rate limiting
- 📤 **Drag & Drop Upload** - Multi-file upload, up to 100MB per file, smart paginated list
- 🔍 **Smart File Management** - Filename fuzzy search, multi-field sorting (name/size/time), auto-pagination loading
- 🔗 **Advanced Sharing** - Password protection (SHA-256 hashing), time-limited links, download count limits, access statistics, rate limiting for brute-force prevention
- 👁️ **Comprehensive Preview** - Support for images, PDF, Markdown, 40+ code languages, SVG (dual preview), plain text files
- 🔐 **Enterprise-grade Security** - Multi-layer protection: share password hashing, cryptographically secure random tokens, IP rate limiting (5 attempts/hour), account lockout, Cloudflare Turnstile verification, JWT authentication
- 🌍 **Multi-language UI** - Chinese/English/Japanese adaptive switching
- 🌓 **Dark Mode** - Adaptive theme switching with system preference support
- 📱 **Perfectly Responsive** - Desktop/tablet/mobile full adaptation
- ⚡ **Optimal Performance** - Global CDN acceleration, millisecond response, offline cache support

### Architecture
```
User → Cloudflare Pages (Frontend) → Workers (Backend API) → R2 (Files) + D1 (Metadata) + KV (Sessions/Limiting)
```

**Why three storage types?**

| Storage | Purpose | Advantages |
|---------|---------|------------|
| **R2** | File content | Zero egress fees, global CDN, 10GB free, large-file friendly |
| **D1** | Structured data | Complex queries, transactions, foreign keys, 5GB free, SQL-like |
| **KV** | Key-value data | Millisecond read/write, global distribution, rate limiting, session management |

**Complete Workflow**:
```
Upload File → Turnstile Verify → File to R2 → Metadata to D1 → Session to KV → Generate Share Link
Access Share → Rate Limit Check → Permission Verify → D1 Query → R2 Get File → Return Content
```

### Tech Stack

**Frontend Technologies**
- **Build Tool**: Vite 5.x - Lightning-fast dev server and optimized builds with environment variable injection
- **Core Framework**: Vanilla JavaScript ES6+ - Zero dependencies, ultimate performance
- **UI Framework**: TailwindCSS (CDN version) - Atomic CSS, rapid development
- **Preview Libraries**: Marked.js (Markdown), Highlight.js (code highlighting, CDN-loaded)
- **Icon Library**: Font Awesome 6.x - Rich icon resources
- **Internationalization**: Custom i18n system

**Backend Technologies**
- **Runtime**: Cloudflare Workers (V8 engine)
- **Storage Services**: R2 (object storage) + D1 (SQLite) + KV (key-value storage)
- **Database Optimization**: Auto-index creation, foreign key relations, smart pagination queries (LIMIT + OFFSET)
- **Security Authentication**: JWT + Cloudflare Turnstile
- **API Design**: RESTful API, OpenAPI 3.0 specification

**Deployment & Operations**
- **CI/CD**: GitHub Actions - Automated deployment pipeline
- **CLI Tool**: Wrangler 2.x - Official Cloudflare toolchain
- **Monitoring**: Cloudflare Analytics - Real-time performance monitoring
- **Version Control**: Git + GitHub - Code version management
- **Build Mechanism**: Vite custom plugin replaces environment variable placeholders (`%VITE_API_BASE_URL%` → actual API address) during build

---

## 🚀 Quick Start

### 📋 Deployment Preparation

**Required Resources (All Free):**
- Cloudflare Account (for Workers, R2, D1, KV)
- Turnstile Site (for human verification, free)

**Optional Resources:**
- GitHub Account (for GitHub Actions auto-deployment)

**🎯 Choose Your Deployment Method:**

| Method | Difficulty | Best For | Time Required |
|--------|-----------|----------|---------------|
| **Method 1: Cloudflare Dashboard Deployment** | ⭐ Easy | Complete beginners, no command line | 10-15 min |
| **Method 2: GitHub Actions Auto-Deploy** | ⭐⭐ Medium | Git users who want automation | 5-10 min |
| **Method 3: Local Secure Deployment** | ⭐⭐⭐ Advanced | Privacy-conscious users, CLI familiar | 3-5 min |
| **Method 4: Manual Deployment** | ⭐⭐⭐⭐ Expert | Developers who need full control | 15-20 min |

---

<details>
<summary>

### Method 1: Cloudflare Dashboard Deployment (🌟 Easiest, Highly Recommended for Beginners)

**Best for: Complete beginners, all done with mouse clicks**

</summary>

#### 📝 Prerequisites

1. **Register Cloudflare Account**
   - Visit [Cloudflare](https://dash.cloudflare.com/sign-up)
   - Register with email (completely free)

2. **Download Project Code**
   - Visit [Project Homepage](https://github.com/aydomini/pebble-drive)
   - Click green **Code** button → **Download ZIP**
   - Extract to local folder

---

#### Step 1: Create Turnstile Human Verification (2 minutes)

1. Login to Cloudflare, visit [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click **Add site** button
3. Fill in configuration:
   - **Site name**: `pebble-drive` (any name)
   - **Domains**: `*.pages.dev` (Cloudflare Pages wildcard domain)
   - **Widget type**: Select **Managed Challenge**
4. Click **Create**
5. **📋 Record two keys** (will use later):
   - **Site Key** (starts with `0x4AAAAAAA`)
   - **Secret Key** (starts with `0x4AAAAAAA`)

---

#### Step 2: Create R2 Storage Bucket (1 minute)

1. In Cloudflare Dashboard, click **R2** on left sidebar
2. If first time, click **Purchase R2 Plan** (select free plan)
3. Click **Create bucket** button
4. Enter name: `pebble-drive-storage`
5. Region: **Automatic**
6. Click **Create bucket**

---

#### Step 3: Create D1 Database (2 minutes)

1. In Cloudflare Dashboard, click **Workers & Pages** → **D1** on left sidebar
2. Click **Create database** button
3. Enter name: `pebble-drive-db`
4. Click **Create**
5. **📋 Record Database ID** (shown on right side of database details page)

**Initialize Database Structure:**
1. On database details page, click **Console** tab
2. Copy and paste the following SQL into input box:

```sql
-- Files table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    uploadDate INTEGER NOT NULL,
    downloadUrl TEXT NOT NULL
);

-- Shares table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_uploadDate ON files(uploadDate DESC);
CREATE INDEX IF NOT EXISTS idx_shares_fileId ON shares(fileId);
CREATE INDEX IF NOT EXISTS idx_shares_expiresAt ON shares(expiresAt);
```

3. Click **Execute**

---

#### Step 4: Create KV Namespace (1 minute)

1. In Cloudflare Dashboard, click **Workers & Pages** → **KV** on left sidebar
2. Click **Create namespace** button
3. Enter name: `RATE_LIMIT_KV`
4. Click **Add**
5. **📋 Record Namespace ID** (shown in list)

---

#### Step 5: Deploy Backend Worker (3 minutes)

1. In Cloudflare Dashboard, click **Workers & Pages** on left sidebar
2. Click **Create application** → **Create Worker**
3. Enter name: `pebble-drive-api`
4. Click **Deploy** (deploy default code first)
5. After successful deployment, click **Edit code** button

**Upload Backend Code:**
1. Delete all code in right editor
2. Open your downloaded project folder → `backend/src/index.js`
3. Copy all content, paste into editor
4. Click **Save and Deploy** at top-right

**Bind Resources:**
1. Return to Worker details page, click **Settings** → **Variables**
2. Scroll to **R2 Bucket Bindings**, click **Add binding**:
   - Variable name: `R2_BUCKET`
   - R2 bucket: Select `pebble-drive-storage`
   - Click **Save**

3. Scroll to **D1 Database Bindings**, click **Add binding**:
   - Variable name: `DB`
   - D1 database: Select `pebble-drive-db`
   - Click **Save**

4. Scroll to **KV Namespace Bindings**, click **Add binding**:
   - Variable name: `RATE_LIMIT_KV`
   - KV namespace: Select `RATE_LIMIT_KV`
   - Click **Save**

**Set Environment Variables (Secrets):**
1. On same page, scroll to **Environment Variables**
2. Click **Add variable**, add the following one by one (select **Encrypt** for type):

   | Variable Name | Value | Description |
   |--------------|-------|-------------|
   | `AUTH_PASSWORD` | `your-login-password` | Login password, set yourself |
   | `AUTH_TOKEN_SECRET` | `random-32-char-string` | JWT secret, randomly generate |
   | `TURNSTILE_SECRET_KEY` | `Secret Key from Step 1` | Turnstile secret |
   | `STORAGE_QUOTA_GB` | `10` | Storage quota (optional) |

3. Click **Save and Deploy**

**📋 Record Worker URL**:
- At top of Worker details page, copy your Worker URL
- Format: `https://pebble-drive-api.your-account.workers.dev`

---

#### Step 6: Deploy Frontend Pages (2 minutes)

1. In Cloudflare Dashboard, click **Workers & Pages** on left sidebar
2. Click **Create application** → **Pages** → **Upload assets**
3. Enter project name: `pebble-drive`
4. Click **Create project**

**Prepare Frontend Files:**
1. Open project folder → `frontend/public/index.html`
2. Find line 333 area with this code:
   ```javascript
   window.ENV_API_BASE_URL = '%VITE_API_BASE_URL%';
   ```
3. Replace with:
   ```javascript
   window.ENV_API_BASE_URL = 'https://pebble-drive-api.your-account.workers.dev';
   ```
   (Use Worker URL from Step 5)

4. Find line 337 area with this code:
   ```javascript
   window.VITE_TURNSTILE_SITE_KEY = '%VITE_TURNSTILE_SITE_KEY%';
   ```
5. Replace with:
   ```javascript
   window.VITE_TURNSTILE_SITE_KEY = '0x4AAAAAAA-your-site-key';
   ```
   (Use Site Key from Step 1)

6. Save file

**Upload Frontend:**
1. Compress entire `frontend/public` folder as ZIP
2. On Pages upload page, drag and drop ZIP file to upload
3. Click **Deploy site**

**✅ Complete!**

Visit your Pages address (format: `https://your-project-name.pages.dev`), login with password from Step 5!

---

#### 🔧 Update Turnstile Domain (Important)

After successful deployment, add Pages domain to Turnstile configuration:

1. Visit [Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click your created `pebble-drive` site
3. In **Domains**, add your Pages domain (e.g., `your-project-name.pages.dev`)
4. Delete previous `*.pages.dev` wildcard (more secure)
5. Click **Save**

</details>

---

<details>
<summary>

### Method 2: GitHub Actions Auto-Deploy (For Git Users)

**Best for: Beginner users, one-click automated deployment**

</summary>

#### Step 1: Fork Project
1. Visit [Project Homepage](https://github.com/aydomini/pebble-drive)
2. Click **Fork** button at top-right
3. Select your GitHub account

#### Step 2: Create Required Cloudflare Resources
```bash
# Install Wrangler CLI (if not installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create storage bucket (for files)
wrangler r2 bucket create pebble-drive-storage

# Create database (for metadata)
wrangler d1 create pebble-drive-db
# 📝 Copy returned database_id (like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

# Create KV namespace (for rate limiting)
wrangler kv namespace create RATE_LIMIT_KV
# 📝 Copy returned id (like: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)

# Create preview environment KV
wrangler kv namespace create RATE_LIMIT_KV --preview
# 📝 Copy returned preview_id
```

#### Step 3: Configure Project Files
1. In GitHub repository, go to `backend/` directory
2. Copy `wrangler.toml.example` to `wrangler.toml`
3. Edit `wrangler.toml`, replace the following:
   ```toml
   # Find this line, replace with your database_id
   database_id = "your-database-id-here"

   # Find these lines, replace with your KV ids
   id = "your-kv-id-here"
   preview_id = "your-preview-kv-id-here"
   ```

#### Step 4: Configure GitHub Secrets
In GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**, add the following:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `CLOUDFLARE_API_TOKEN` | Your API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Your Account ID | Cloudflare Dashboard → Right sidebar |

#### Step 5: Create Turnstile (Human Verification)
1. Visit [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click **Add site**
3. Configure:
   - **Site name**: `pebble-drive`
   - **Domains**: `*.pages.dev` (Cloudflare Pages wildcard)
   - **Widget type**: Managed Challenge
4. After creation, record:
   - **Site Key** (starts with `0x4AAAAAAA`)
   - **Secret Key** (starts with `0x4AAAAAAA`)

#### Step 6: Set Authentication Secrets
```bash
cd backend

# Set login password (replace with your password)
echo "your-secure-password" | wrangler secret put AUTH_PASSWORD

# Set JWT secret (randomly generated)
openssl rand -base64 32 | tr -d '\n' | wrangler secret put AUTH_TOKEN_SECRET

# Set storage quota (GB, optional, default 10)
echo "10" | wrangler secret put STORAGE_QUOTA_GB

# Set Turnstile secret key
echo "your-turnstile-secret-key" | wrangler secret put TURNSTILE_SECRET_KEY
```

#### Step 7: Trigger Auto-Deployment
```bash
git add .
git commit -m "🚀 Deploy PebbleDrive to Cloudflare"
git push
```

🎉 **Done!** GitHub Actions will auto-deploy to Cloudflare. After completion:
- Backend API: `https://pebble-drive-api.your-account.workers.dev`
- Frontend App: `https://your-project-name.pages.dev` (or your custom domain)

Visit frontend address to use!

</details>

---

<details>
<summary>

### Method 3: Local Secure Deployment (For Privacy-Conscious Users)

**Best for: Privacy-conscious users who don't want to expose configurations**

</summary>

```bash
# 1. Clone project
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. Run secure deployment script (one-click complete)
./deploy-secure-local.sh
```

**🛡️ Security Features:**
- ✅ **Local Configuration Storage** - All sensitive info saved in local `.env.local` file
- ✅ **Environment Isolation** - Dev, test, prod environments completely separated
- ✅ **No Cloud Leakage** - Configuration never uploaded to any repository
- ✅ **Automated Deployment** - One-click completes all deployment steps
- ✅ **Smart Cleanup** - Optional deletion of local sensitive files

**📋 Script Features:**
- Auto-create all Cloudflare resources
- Auto-generate strong random keys
- Auto-configure Workers Secrets
- Auto-initialize database
- Auto-deploy frontend and backend
- Smart error handling and rollback

</details>

---

<details>
<summary>

### Method 4: Manual Deployment (For Developers)

**Best for: Advanced users who need complete control**

</summary>

```bash
# 1. Clone project
git clone https://github.com/aydomini/pebble-drive.git
cd pebble-drive

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Login to Cloudflare
wrangler login

# 4. Create resources
wrangler r2 bucket create pebble-drive-storage
wrangler d1 create pebble-drive-db
wrangler kv namespace create RATE_LIMIT_KV
wrangler kv namespace create RATE_LIMIT_KV --preview

# 5. Configure backend
cd backend
cp wrangler.toml.example wrangler.toml
# Edit wrangler.toml, fill in actual IDs

# 6. Set secrets
echo "your-password" | wrangler secret put AUTH_PASSWORD
openssl rand -base64 32 | tr -d '\n' | wrangler secret put AUTH_TOKEN_SECRET
echo "10" | wrangler secret put STORAGE_QUOTA_GB

# 7. Deploy
wrangler deploy
cd ../frontend
VITE_API_BASE_URL=https://your-api.workers.dev npm run build
npx wrangler pages deploy dist --project-name=pebble-drive
```

---

### 🚨 Common Issues Troubleshooting

#### Issue 1: Login Failed - "Server authentication not configured"
**Symptom**: Login fails after entering password
**Cause**: Frontend not properly connected to backend API
**Solution**:
1. Check if `backend/wrangler.toml` is configured correctly
2. Ensure Worker deployed successfully, got correct URL
3. Frontend build must set `VITE_API_BASE_URL`

#### Issue 2: Turnstile Verification Failed
**Symptom**: CAPTCHA fails to load or verify
**Solution**:
1. Ensure Turnstile site created in Cloudflare Dashboard
2. Check domain config includes your Pages domain (e.g., `your-project-name.pages.dev`)
3. Ensure `TURNSTILE_SECRET_KEY` secret set correctly

#### Issue 3: KV Namespace Creation Failed
**Symptom**: `wrangler kv namespace create` command errors
**Solution**:
```bash
# Check wrangler version
wrangler --version
# If version < 2.0, update
npm install -g wrangler@latest

# Re-login
wrangler logout
wrangler login
```

#### Issue 4: Database Initialization Failed
**Symptom**: D1 database creation or initialization error
**Solution**:
```bash
# Check if database created successfully
wrangler d1 list

# Manually execute initialization
wrangler d1 execute pebble-drive-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

#### Issue 5: File Upload Failed
**Symptom**: File upload reaches 100% then fails
**Cause**: Usually R2 storage bucket configuration issue
**Solution**:
1. Check if R2 bucket created successfully
2. Ensure `wrangler.toml` has correct bucket_name
3. Check Worker has R2 write permissions

---

### 📞 Get Help

If the above steps still don't resolve your issue:

1. **View Logs**: Visit Cloudflare Dashboard → Workers → Your Worker → Logs
2. **Check Configuration**: Run `wrangler tail --format=pretty` to view real-time logs
3. **Submit Issue**: [GitHub Issues](https://github.com/aydomini/pebble-drive/issues)
4. **Community Discussion**: [GitHub Discussions](https://github.com/aydomini/pebble-drive/discussions)

</details>

---

## 🎯 Deployment Success Checklist

✅ **After deployment, check the following:**

- [ ] Worker deployed successfully, API endpoint accessible
- [ ] Pages deployed successfully, frontend page loads normally
- [ ] Login function works, password verification passes
- [ ] Turnstile CAPTCHA displays and verifies normally
- [ ] File upload function works properly
- [ ] File preview function displays correctly
- [ ] Share link function creates and accesses normally
- [ ] All pages display properly on mobile

🎉 **Congratulations! You've successfully deployed your cloud drive!**

---

## 🔧 Configuration

### Backend Configuration (Worker)

#### Environment Variables (Secrets)

Configure in Worker Settings → Variables → Environment Variables:

| Variable Name | Description | Required | How to Set |
|--------------|-------------|----------|------------|
| `AUTH_PASSWORD` | Login password | ✅ | `wrangler secret put AUTH_PASSWORD` |
| `AUTH_TOKEN_SECRET` | JWT secret (32-char random string) | ✅ | `openssl rand -base64 32 \| wrangler secret put AUTH_TOKEN_SECRET` |
| `TURNSTILE_SECRET_KEY` | Turnstile Secret Key | ✅ | `wrangler secret put TURNSTILE_SECRET_KEY` |
| `STORAGE_QUOTA_GB` | Storage quota (GB, optional) | ❌ | `echo "10" \| wrangler secret put STORAGE_QUOTA_GB` |

#### Resource Bindings

Configure in Worker Settings → Variables:

| Type | Variable name | Bind Resource |
|------|---------------|---------------|
| R2 Bucket | `R2_BUCKET` | `pebble-drive-storage` |
| D1 Database | `DB` | `pebble-drive-db` |
| KV Namespace | `RATE_LIMIT_KV` | Your created KV namespace |

### Frontend Configuration (Pages)

#### Build-time Environment Variables

These must be set during frontend build:

| Variable Name | Description | Required | Example Value |
|--------------|-------------|----------|---------------|
| `VITE_API_BASE_URL` | Backend API address | ✅ | `https://your-api.workers.dev` or custom domain |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile Site Key | ✅ | `0x4AAAAAAA...` |

**Build Example:**
```bash
cd frontend
VITE_API_BASE_URL=https://storage.yourdomain.com \
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAB5BAQH1FZZ6hsn6 \
npm run build
```

---

## 📖 API Documentation

<details>
<summary><b>Click to expand full API documentation</b></summary>

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

</details>

---

## ❓ FAQ

<details>
<summary><b>Q1: What happens when exceeding free tier?</b></summary>

Pay-as-you-go pricing, extremely low cost:
- Workers: $0.50/million requests
- R2: $0.015/GB storage + $0.01/GB egress
- D1: $0.75/GB database
- KV: $0.50/GB storage + $0.50/million reads + $5.00/million writes
</details>

<details>
<summary><b>Q2: How to change login password?</b></summary>

```bash
cd backend
echo "new-password" | wrangler secret put AUTH_PASSWORD
```
No redeployment needed, takes effect immediately.
</details>

<details>
<summary><b>Q3: What file types support preview?</b></summary>

- **Images**: JPG, PNG, GIF, WebP, SVG
- **Documents**: PDF, Markdown
- **Code**: 40+ languages (JS/TS/Python/Go/Rust, etc.)
- **Others**: TXT plain text
</details>

<details>
<summary><b>Q4: How to use custom domain?</b></summary>

1. Backend Worker: Add Custom Domain
2. Frontend Pages: Add Custom Domain
3. Rebuild frontend:
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com npm run build
   npx wrangler pages deploy dist
   ```
</details>

<details>
<summary><b>Q5: How to configure custom share domain?</b></summary>

**Why use a custom share domain?**
- Hide the real Worker address (`xxx.workers.dev`)
- Use your own domain to enhance brand image
- Improve privacy protection

**Configuration Steps:**

1. **Bind custom domain to Worker in Cloudflare**
   - Go to Worker settings page
   - Click **Triggers** → **Custom Domains**
   - Add your domain (e.g., `storage.yourdomain.com`)

2. **Configure backend environment variable**

   Edit `backend/wrangler.toml`:
   ```toml
   [vars]
   STORAGE_QUOTA_GB = "10"
   SHARE_DOMAIN = "https://storage.yourdomain.com"
   ```

3. **Redeploy backend**
   ```bash
   cd backend
   npx wrangler deploy
   ```

**Result:**
- Before: `https://pebble-drive-api.aydomini.workers.dev/share/abc123`
- After: `https://storage.yourdomain.com/share/abc123`

**Note:**
- `SHARE_DOMAIN` is configured in local `wrangler.toml` (in `.gitignore`, won't leak)
- Repository's `wrangler.toml.example` uses placeholder for reference
</details>

<details>
<summary><b>Q6: How to backup data?</b></summary>

```bash
# Backup database
wrangler d1 export pebble-drive-db --output=backup.sql

# Sync R2 files locally
wrangler r2 bucket list pebble-drive-storage
```
</details>

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Credits

[Cloudflare Workers](https://workers.cloudflare.com/) · [TailwindCSS](https://tailwindcss.com/) · [FontAwesome](https://fontawesome.com/) · [Vite](https://vitejs.dev/)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=aydomini/pebble-drive&type=Date)](https://star-history.com/#aydomini/pebble-drive&Date)

---

**Built with ❤️ using Cloudflare Workers**
