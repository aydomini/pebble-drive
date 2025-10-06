#!/bin/bash

# 🚀 PebbleDrive 本地安全部署脚本
# 保护隐私的同时直接部署到 Cloudflare Workers

set -e

echo "🌟 PebbleDrive 本地安全部署脚本"
echo "=================================="
echo ""

# 检查必要工具
check_requirements() {
    echo "📋 检查环境要求..."

    if ! command -v wrangler &> /dev/null; then
        echo "❌ 未找到 wrangler CLI，请先安装："
        echo "npm install -g wrangler"
        exit 1
    fi

    if ! command -v openssl &> /dev/null; then
        echo "❌ 未找到 openssl，请先安装 OpenSSL"
        exit 1
    fi

    echo "✅ 环境要求检查通过"
    echo ""
}

# 创建环境变量文件（本地安全存储）
setup_env() {
    echo "🔐 设置本地环境配置..."

    # 创建 .env.local 文件（已加入 .gitignore）
    cat > .env.local << 'EOF'
# 🚀 PebbleDrive 本地环境配置
# 此文件包含敏感信息，请勿上传到公开仓库

# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_API_TOKEN=""

# 数据库配置
DATABASE_ID=""
KV_ID=""
KV_PREVIEW_ID=""

# 认证配置
AUTH_PASSWORD=""
AUTH_TOKEN_SECRET=""
TURNSTILE_SECRET_KEY=""
TURNSTILE_SITE_KEY=""

# 其他配置
STORAGE_QUOTA_GB="10"
EOF

    echo "✅ 已创建 .env.local 文件"
    echo "📝 请编辑 .env.local 文件，填入你的配置信息"
    echo ""

    # 检查文件是否已配置
    if [ ! -s .env.local ] || grep -q '""' .env.local; then
        echo "⚠️  请先配置 .env.local 文件中的必要信息："
        echo "   1. Cloudflare Account ID 和 API Token"
        echo "   2. 认证密码和密钥"
        echo "   3. 数据库和 KV ID"
        echo ""
        read -p "按回车键继续编辑 .env.local 文件..."

        # 尝试打开编辑器
        if command -v code &> /dev/null; then
            code .env.local
        elif command -v nano &> /dev/null; then
            nano .env.local
        else
            echo "请手动编辑 .env.local 文件"
        fi
    fi
}

# 登录 Cloudflare
login_cloudflare() {
    echo "🔑 登录 Cloudflare..."
    wrangler auth whoami > /dev/null 2>&1 || {
        echo "🌐 需要登录 Cloudflare..."
        wrangler login
    }
    echo "✅ Cloudflare 登录成功"
    echo ""
}

# 加载环境变量
load_env() {
    if [ -f .env.local ]; then
        set -a
        source .env.local
        set +a
        echo "✅ 已加载本地环境配置"
    else
        echo "❌ 未找到 .env.local 文件"
        exit 1
    fi
}

# 创建必要的资源
create_resources() {
    echo "🏗️  创建 Cloudflare 资源..."

    # 创建 R2 存储桶
    echo "📦 创建 R2 存储桶..."
    if ! wrangler r2 bucket list | grep -q "pebble-drive-storage"; then
        wrangler r2 bucket create pebble-drive-storage
        echo "✅ R2 存储桶创建成功"
    else
        echo "✅ R2 存储桶已存在"
    fi

    # 创建 D1 数据库
    echo "🗄️  创建 D1 数据库..."
    if ! wrangler d1 list | grep -q "pebble-drive-db"; then
        DB_OUTPUT=$(wrangler d1 create pebble-drive-db)
        DATABASE_ID=$(echo "$DB_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
        echo "✅ D1 数据库创建成功，ID: $DATABASE_ID"

        # 更新 .env.local 中的 DATABASE_ID
        sed -i.bak "s/DATABASE_ID=\"\"/DATABASE_ID=\"$DATABASE_ID\"/" .env.local
    else
        echo "✅ D1 数据库已存在"
    fi

    # 创建 KV 命名空间
    echo "🔑 创建 KV 命名空间..."
    if ! wrangler kv namespace list | grep -q "RATE_LIMIT_KV"; then
        KV_OUTPUT=$(wrangler kv namespace create RATE_LIMIT_KV)
        KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
        echo "✅ KV 命名空间创建成功，ID: $KV_ID"

        # 创建预览 KV
        KV_PREVIEW_OUTPUT=$(wrangler kv namespace create RATE_LIMIT_KV --preview)
        KV_PREVIEW_ID=$(echo "$KV_PREVIEW_OUTPUT" | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
        echo "✅ KV 预览命名空间创建成功，ID: $KV_PREVIEW_ID"

        # 更新 .env.local 中的 KV ID
        sed -i.bak "s/KV_ID=\"\"/KV_ID=\"$KV_ID\"/" .env.local
        sed -i.bak "s/KV_PREVIEW_ID=\"\"/KV_PREVIEW_ID=\"$KV_PREVIEW_ID\"/" .env.local
    else
        echo "✅ KV 命名空间已存在"
    fi

    # 删除备份文件
    rm -f .env.local.bak

    echo ""
}

# 配置后端
configure_backend() {
    echo "⚙️  配置后端..."
    cd backend

    # 创建安全的 wrangler.toml
    if [ -n "$DATABASE_ID" ] && [ -n "$KV_ID" ] && [ -n "$KV_PREVIEW_ID" ]; then
        cat > wrangler.toml << EOF
name = "pebble-drive-api"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "$KV_ID"
preview_id = "$KV_PREVIEW_ID"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "pebble-drive-storage"

[[d1_databases]]
binding = "DB"
database_name = "pebble-drive-db"
database_id = "$DATABASE_ID"
EOF
        echo "✅ 后端配置完成"
    else
        echo "❌ 缺少必要的 ID 配置，请检查 .env.local 文件"
        exit 1
    fi

    cd ..
    echo ""
}

# 设置认证密钥
setup_secrets() {
    echo "🔐 设置认证密钥..."
    cd backend

    # 生成随机 JWT 密钥
    if [ -z "$AUTH_TOKEN_SECRET" ]; then
        AUTH_TOKEN_SECRET=$(openssl rand -base64 32 | tr -d '\n')
        sed -i.bak "s/AUTH_TOKEN_SECRET=\"\"/AUTH_TOKEN_SECRET=\"$AUTH_TOKEN_SECRET\"/" ../.env.local
    fi

    # 检查必要的密码
    if [ -z "$AUTH_PASSWORD" ]; then
        echo "❌ 请设置 AUTH_PASSWORD"
        exit 1
    fi

    # 设置密钥到 Workers
    echo "$AUTH_PASSWORD" | wrangler secret put AUTH_PASSWORD
    echo "$AUTH_TOKEN_SECRET" | wrangler secret put AUTH_TOKEN_SECRET

    if [ -n "$STORAGE_QUOTA_GB" ]; then
        echo "$STORAGE_QUOTA_GB" | wrangler secret put STORAGE_QUOTA_GB
    fi

    if [ -n "$TURNSTILE_SECRET_KEY" ]; then
        echo "$TURNSTILE_SECRET_KEY" | wrangler secret put TURNSTILE_SECRET_KEY
    fi

    # 删除备份文件
    rm -f ../.env.local.bak

    cd ..
    echo "✅ 认证密钥设置完成"
    echo ""
}

# 初始化数据库
init_database() {
    echo "🗄️  初始化数据库..."
    cd backend
    wrangler d1 execute pebble-drive-db --file=./migrations/schema.sql --remote
    cd ..
    echo "✅ 数据库初始化完成"
    echo ""
}

# 部署后端
deploy_backend() {
    echo "🚀 部署后端..."
    cd backend
    wrangler deploy
    WORKER_URL=$(wrangler whoami 2>/dev/null | grep -o 'https://[^[:space:]]*workers.dev' || echo "")
    if [ -z "$WORKER_URL" ]; then
        WORKER_URL="https://pebble-drive-api.$(wrangler whoami | grep -o '[^.]*\..*$').workers.dev"
    fi
    cd ..
    echo "✅ 后端部署成功: $WORKER_URL"
    echo ""
}

# 构建前端
build_frontend() {
    echo "🎨 构建前端..."
    cd frontend

    # 构建前端，使用安全的 API 地址
    if [ -n "$WORKER_URL" ]; then
        if [ -n "$TURNSTILE_SITE_KEY" ]; then
            # 临时设置 Turnstile Site Key
            sed -i.bak "s/window.TURNSTILE_SITE_KEY = null;/window.TURNSTILE_SITE_KEY = '$TURNSTILE_SITE_KEY';/" public/js/app.js
        fi

        VITE_API_BASE_URL="$WORKER_URL" npm run build

        # 恢复原文件
        mv public/js/app.js.bak public/js/app.js 2>/dev/null || true
    else
        echo "❌ 无法获取 Worker URL"
        exit 1
    fi

    cd ..
    echo "✅ 前端构建完成"
    echo ""
}

# 部署前端
deploy_frontend() {
    echo "🌐 部署前端..."
    cd frontend
    npx wrangler pages deploy dist --project-name=pebble-drive
    cd ..
    echo "✅ 前端部署完成"
    echo ""
}

# 清理敏感信息
cleanup() {
    echo "🧹 清理本地敏感信息..."

    # 可选：删除本地环境文件（根据需要）
    # echo "⚠️  建议备份 .env.local 文件到安全位置后删除本地副本"
    # read -p "是否删除本地 .env.local 文件？(y/N): " -n 1 -r
    # echo
    # if [[ $REPLY =~ ^[Yy]$ ]]; then
    #     rm .env.local
    #     echo "✅ 已删除本地敏感配置文件"
    # fi

    echo "✅ 清理完成"
    echo ""
}

# 显示部署结果
show_result() {
    echo "🎉 部署完成！"
    echo "=================="
    echo ""
    echo "📱 访问地址:"
    echo "前端: https://pebble-drive.pages.dev"
    echo "后端: https://pebble-drive-api.your-subdomain.workers.dev"
    echo ""
    echo "🔐 登录信息:"
    echo "密码: [你设置的密码]"
    echo ""
    echo "📋 后续维护:"
    echo "1. 保存好 .env.local 文件到安全位置"
    echo "2. 定期备份 D1 数据库"
    echo "3. 监控 R2 存储使用情况"
    echo ""
}

# 主函数
main() {
    echo "开始 PebbleDrive 本地安全部署..."
    echo ""

    check_requirements
    setup_env
    load_env
    login_cloudflare
    create_resources
    configure_backend
    setup_secrets
    init_database
    deploy_backend
    build_frontend
    deploy_frontend
    cleanup
    show_result

    echo "✨ 恭喜！PebbleDrive 已成功部署！"
}

# 错误处理
trap 'echo "❌ 部署过程中出现错误，请检查配置"; exit 1' ERR

# 运行主函数
main "$@"