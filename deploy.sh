#!/bin/bash

# PebbleDrive 部署脚本
# 使用方法：./deploy.sh

set -e

echo "🚀 PebbleDrive 部署向导"
echo "======================="
echo ""

# 1. 检查是否登录
echo "📝 步骤 1: 检查 Wrangler 登录状态..."
if ! wrangler whoami &>/dev/null; then
    echo "❌ 未登录 Cloudflare，请先运行: wrangler login"
    exit 1
fi
echo "✅ 已登录"
echo ""

# 2. 部署后端
echo "📦 步骤 2: 部署后端 Worker..."
cd backend
npm install
wrangler deploy

# 获取 Worker URL
WORKER_URL=$(wrangler deployments list --name pebble-drive-api 2>/dev/null | grep -oE 'https://[^ ]+\.workers\.dev' | head -1)
if [ -z "$WORKER_URL" ]; then
    echo "⚠️  无法自动获取 Worker URL，请手动输入："
    read -p "Worker URL: " WORKER_URL
fi

echo "✅ 后端部署成功: $WORKER_URL"
echo ""

# 3. 设置环境变量
echo "🔐 步骤 3: 设置环境变量（Secrets）"
echo "提示：这些变量将加密存储在 Cloudflare，不会暴露在代码中"
echo ""

read -sp "请设置登录密码 (AUTH_PASSWORD): " AUTH_PASSWORD
echo ""
echo "$AUTH_PASSWORD" | wrangler secret put AUTH_PASSWORD

read -sp "请设置 JWT 密钥 (AUTH_TOKEN_SECRET，建议长随机字符串): " AUTH_TOKEN_SECRET
echo ""
echo "$AUTH_TOKEN_SECRET" | wrangler secret put AUTH_TOKEN_SECRET

read -p "请设置存储配额 (GB，留空则显示无限): " STORAGE_QUOTA_GB
if [ -n "$STORAGE_QUOTA_GB" ]; then
    echo "$STORAGE_QUOTA_GB" | wrangler secret put STORAGE_QUOTA_GB
fi

echo "✅ 环境变量设置完成"
echo ""

# 4. 部署前端
echo "🎨 步骤 4: 部署前端 Pages..."
cd ../frontend
npm install

# 使用获取到的 Worker URL 构建前端
VITE_API_BASE_URL=$WORKER_URL npm run build

# 部署到 Pages
echo "正在部署到 Cloudflare Pages..."
PAGES_OUTPUT=$(wrangler pages deploy dist --project-name=pebble-drive --commit-message="Deploy PebbleDrive" 2>&1)
echo "$PAGES_OUTPUT"

# 尝试从输出中提取 Pages URL
PAGES_URL=$(echo "$PAGES_OUTPUT" | grep -oE 'https://[a-z0-9-]+\.pages\.dev' | head -1)
if [ -z "$PAGES_URL" ]; then
    PAGES_URL="https://pebble-drive.pages.dev (请检查 Cloudflare Dashboard 获取实际 URL)"
fi

echo ""
echo "🎉 部署完成！"
echo "================="
echo "后端 API: $WORKER_URL"
echo "前端访问: $PAGES_URL"
echo ""
echo "📝 下一步："
echo "1. 访问前端 URL"
echo "2. 使用刚才设置的密码登录"
echo "3. 开始上传文件！"
