#!/usr/bin/env node

/**
 * PebbleDrive 跨平台部署工具
 * 支持 Windows, macOS, Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色输出（兼容 Windows）
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// 判断是否为 Windows
const isWindows = process.platform === 'win32';

// 创建输入接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.cyan);
}

function title(message) {
    console.log('');
    log('═══════════════════════════════════════', colors.blue);
    log(`  ${message}`, colors.bright);
    log('═══════════════════════════════════════', colors.blue);
    console.log('');
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function runCommand(command, cwd = process.cwd(), env = process.env) {
    try {
        const output = execSync(command, {
            cwd,
            env,
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return { success: true, output };
    } catch (err) {
        return { success: false, error: err.message, output: err.stdout };
    }
}

// 配置预设
const PRESETS = {
    '1': {
        name: '个人使用',
        maxFileSize: 100,
        storageQuota: 10,
        uploadRateLimit: 50
    },
    '2': {
        name: '小团队',
        maxFileSize: 500,
        storageQuota: 50,
        uploadRateLimit: 100
    },
    '3': {
        name: '企业级',
        maxFileSize: 2000,
        storageQuota: 500,
        uploadRateLimit: 200
    }
};

// 显示帮助信息
function showHelp() {
    console.log('');
    title('PebbleDrive 一键部署工具 - 帮助文档');
    console.log('');
    log('📖 这个工具做什么？', colors.blue);
    log('  帮助你快速将 PebbleDrive 项目部署到 Cloudflare 云平台');
    log('  无需手动执行复杂的命令，一键完成所有配置');
    console.log('');
    log('🎯 适合谁使用？', colors.blue);
    log('  - 第一次部署 PebbleDrive 的新用户');
    log('  - 想要快速更新配置的现有用户');
    log('  - 不熟悉命令行操作的小白用户');
    console.log('');
    log('📋 部署前需要准备什么？', colors.blue);
    log('  1. Cloudflare 账号（免费注册：https://dash.cloudflare.com/sign-up）');
    log('  2. 已经登录 Cloudflare（运行：npx wrangler login）');
    log('  3. 电脑已安装 Node.js（版本 >= 14.x）');
    console.log('');
    log('🚀 使用方法', colors.blue);
    log('  npm run deploy          # 启动部署向导');
    log('  npm run deploy -- --help  # 显示这个帮助');
    console.log('');
    log('📚 名词解释', colors.blue);
    log('  • Workers：Cloudflare 的后端服务（运行你的 API 代码）');
    log('  • Pages：Cloudflare 的前端托管（托管你的网页界面）');
    log('  • Turnstile：人机验证（类似验证码，防止机器人攻击）');
    log('  • Secrets：敏感配置（比如登录密码，加密保存在云端）');
    console.log('');
    log('❓ 常见问题', colors.blue);
    log('  Q: 部署失败怎么办？');
    log('  A: 先运行 npm run check 检查环境配置');
    console.log('');
    log('  Q: 忘记设置密码怎么办？');
    log('  A: 部署完成后按照提示设置 AUTH_PASSWORD');
    console.log('');
    log('  Q: 能不能修改配置后重新部署？');
    log('  A: 可以！直接再次运行 npm run deploy 即可');
    console.log('');
    log('🔗 更多帮助', colors.blue);
    log('  GitHub: https://github.com/aydomini/pebble-drive');
    log('  文档: README.md');
    console.log('');
}

async function main() {
    // 检查是否需要显示帮助
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp();
        rl.close();
        return;
    }

    title('PebbleDrive 一键部署工具 v2.2');
    info('💡 小提示：输入 npm run deploy -- --help 查看详细说明');
    info('跨平台支持：Windows, macOS, Linux');
    console.log('');

    // 1. 检查环境
    title('步骤 1/5: 环境检查');
    info('正在检查你的电脑环境是否满足部署要求...');

    // 检查 Node.js
    const nodeVersion = process.version;
    success(`Node.js 版本：${nodeVersion}`);

    // 检查 wrangler
    const wranglerCheck = await runCommand('npx wrangler --version');
    if (!wranglerCheck.success) {
        error('Wrangler CLI 工具无法使用');
        console.log('');
        warning('💡 Wrangler 是什么？');
        log('  Wrangler 是 Cloudflare 官方提供的部署工具');
        log('  就像一个"翻译器"，帮助你把代码发布到云端');
        console.log('');
        warning('🔧 如何解决？');
        log('  方法1（推荐）：安装最新版 Node.js');
        log('    访问：https://nodejs.org/');
        log('    下载并安装后，重新运行部署命令');
        console.log('');
        log('  方法2：检查网络连接');
        log('    确保可以访问 npm 软件源');
        log('    或尝试切换网络环境');
        console.log('');
        process.exit(1);
    }
    success('Wrangler CLI 工具正常');

    // 检查登录状态
    const whoamiCheck = await runCommand('npx wrangler whoami');
    if (!whoamiCheck.success || whoamiCheck.output.includes('not authenticated')) {
        error('尚未登录 Cloudflare 账号');
        console.log('');
        warning('💡 为什么需要登录？');
        log('  部署需要连接到你的 Cloudflare 账号');
        log('  登录是免费的，只需要完成一次');
        console.log('');
        warning('🔧 如何登录？');
        log('  1. 打开新的命令行窗口');
        log('  2. 运行命令: npx wrangler login');
        log('  3. 浏览器会自动打开登录页面');
        log('  4. 登录成功后，关闭浏览器');
        log('  5. 回到这里重新运行部署命令');
        console.log('');
        info('💡 没有 Cloudflare 账号？');
        log('  免费注册：https://dash.cloudflare.com/sign-up');
        log('  只需要邮箱，无需绑定信用卡');
        console.log('');
        process.exit(1);
    }
    success('已成功登录 Cloudflare');

    console.log('');

    // 2. 配置选择
    title('步骤 2/5: 选择配置');
    info('💡 配置决定了文件上传的大小限制和存储容量');
    console.log('');
    console.log('请选择适合你的配置预设：');
    console.log('');
    console.log('  1) 个人使用（推荐新手）');
    console.log('     • 单个文件最大 100MB');
    console.log('     • 总存储空间 10GB');
    console.log('     • 每小时可上传 50 次');
    console.log('     适合：个人文件存储、学习测试');
    console.log('');
    console.log('  2) 小团队');
    console.log('     • 单个文件最大 500MB');
    console.log('     • 总存储空间 50GB');
    console.log('     • 每小时可上传 100 次');
    console.log('     适合：小型团队、多人共享');
    console.log('');
    console.log('  3) 企业级');
    console.log('     • 单个文件最大 2000MB (2GB)');
    console.log('     • 总存储空间 500GB');
    console.log('     • 每小时可上传 200 次');
    console.log('     适合：企业使用、大文件存储');
    console.log('');
    console.log('  4) 自定义配置（高级用户）');
    console.log('');
    warning('💡 提示：配置可以随时修改，建议新手先选1');
    console.log('');

    const choice = await question('请选择 [1-4，默认1]：') || '1';

    let config;
    if (PRESETS[choice]) {
        config = PRESETS[choice];
        success(`已选择：${config.name}预设`);
    } else if (choice === '4') {
        const maxFileSize = await question('单文件最大大小（MB，默认100）：') || '100';
        const storageQuota = await question('总存储配额（GB，默认10）：') || '10';
        const uploadRateLimit = await question('上传限制（次/小时，默认50）：') || '50';

        config = {
            name: '自定义',
            maxFileSize: parseInt(maxFileSize),
            storageQuota: parseInt(storageQuota),
            uploadRateLimit: parseInt(uploadRateLimit)
        };
        success('已设置自定义配置');
    } else {
        warning('无效选择，使用默认预设（个人使用）');
        config = PRESETS['1'];
    }

    console.log('');
    info('配置摘要：');
    info(`  - 单文件最大：${config.maxFileSize}MB`);
    info(`  - 存储配额：${config.storageQuota}GB`);
    info(`  - 上传限制：${config.uploadRateLimit}次/小时`);
    console.log('');

    // 3. 更新 wrangler.toml
    title('步骤 3/5: 更新配置文件');

    const backendDir = path.join(process.cwd(), 'backend');
    const frontendDir = path.join(process.cwd(), 'frontend');
    const wranglerToml = path.join(backendDir, 'wrangler.toml');
    const wranglerExample = path.join(backendDir, 'wrangler.toml.example');

    // 如果不存在 wrangler.toml，从 example 复制
    if (!fs.existsSync(wranglerToml)) {
        if (fs.existsSync(wranglerExample)) {
            fs.copyFileSync(wranglerExample, wranglerToml);
            success('已创建 wrangler.toml');
        } else {
            error('wrangler.toml.example 不存在！');
            process.exit(1);
        }
    }

    // 读取并更新配置
    let tomlContent = fs.readFileSync(wranglerToml, 'utf-8');
    tomlContent = tomlContent.replace(/MAX_FILE_SIZE_MB = "\d+"/g, `MAX_FILE_SIZE_MB = "${config.maxFileSize}"`);
    tomlContent = tomlContent.replace(/STORAGE_QUOTA_GB = "\d+"/g, `STORAGE_QUOTA_GB = "${config.storageQuota}"`);
    tomlContent = tomlContent.replace(/UPLOAD_RATE_LIMIT = "\d+"/g, `UPLOAD_RATE_LIMIT = "${config.uploadRateLimit}"`);
    fs.writeFileSync(wranglerToml, tomlContent);
    success('wrangler.toml 已更新');

    console.log('');

    // 4. 部署后端
    title('步骤 4/5: 部署后端（Workers）');
    info('正在部署后端 API...');

    const deployBackend = await runCommand('npx wrangler deploy', backendDir);
    if (!deployBackend.success) {
        error('后端部署失败');
        error(deployBackend.error);
        process.exit(1);
    }
    success('后端部署成功');

    // 获取 Worker URL
    let workerUrl = '';
    const match = deployBackend.output.match(/https:\/\/[^\s]+\.workers\.dev/);
    if (match) {
        workerUrl = match[0];
        info(`后端 API 地址：${workerUrl}`);
    } else {
        warning('无法自动获取 Worker URL');
        workerUrl = await question('请输入后端 API 地址（例如：https://xxx.workers.dev）：');
    }

    console.log('');

    // 5. 部署前端
    title('步骤 5/5: 部署前端（Pages）');

    const turnstileKey = await question('Turnstile Site Key（可选，回车跳过）：');

    // 配置 Pages Functions
    info('正在配置 Pages Functions 代理...');
    const frontendWranglerToml = path.join(frontendDir, 'wrangler.toml');
    const frontendWranglerExample = path.join(frontendDir, 'wrangler.toml.example');

    if (!fs.existsSync(frontendWranglerToml) && fs.existsSync(frontendWranglerExample)) {
        fs.copyFileSync(frontendWranglerExample, frontendWranglerToml);
        success('已创建 frontend/wrangler.toml');
    }

    if (fs.existsSync(frontendWranglerToml)) {
        let frontendToml = fs.readFileSync(frontendWranglerToml, 'utf-8');
        frontendToml = frontendToml.replace(/BACKEND_URL = ".*"/g, `BACKEND_URL = "${workerUrl}"`);
        fs.writeFileSync(frontendWranglerToml, frontendToml);
        success(`Pages Functions 配置完成：${workerUrl}`);
    } else {
        warning('未找到 wrangler.toml.example，跳过 Pages Functions 配置');
    }

    info('正在构建前端...');

    // 设置环境变量并构建（VITE_API_BASE_URL 为空字符串，使用 Pages Functions 代理）
    const buildEnv = {
        ...process.env,
        VITE_API_BASE_URL: ''
    };
    if (turnstileKey) {
        buildEnv.VITE_TURNSTILE_SITE_KEY = turnstileKey;
    }

    const buildFrontend = await runCommand('npm run build', frontendDir, buildEnv);
    if (!buildFrontend.success) {
        error('前端构建失败');
        error(buildFrontend.error);
        process.exit(1);
    }
    success('前端构建成功');

    // 🔴 关键步骤：复制 Pages Functions 到构建产物
    info('正在复制 Pages Functions...');
    const functionsSource = path.join(frontendDir, 'functions');
    const functionsDest = path.join(frontendDir, 'dist', '_functions');

    if (fs.existsSync(functionsSource)) {
        // 递归复制目录
        function copyDir(src, dest) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            const entries = fs.readdirSync(src, { withFileTypes: true });
            for (let entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                    copyDir(srcPath, destPath);
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
            }
        }
        copyDir(functionsSource, functionsDest);
        success('Pages Functions 复制完成（复制到 dist/_functions）');

        // 验证复制成功
        const jsFiles = fs.readdirSync(functionsDest, { recursive: true })
            .filter(f => f.endsWith('.js'));
        info(`找到 ${jsFiles.length} 个 Functions 文件`);
    } else {
        warning('未找到 functions 目录，跳过复制');
        warning('⚠️  这将导致严重的安全问题：');
        warning('   - 分享链接可以绕过下载次数限制');
        warning('   - 过期链接依然可以访问');
        warning('   - 密码保护失效');
    }

    info('正在部署前端到 Cloudflare Pages...');

    // 生成简单的英文commit message，避免UTF-8编码问题
    const timestamp = new Date().toISOString().split('T')[0];
    const commitMsg = `Deploy PebbleDrive ${timestamp}`;

    const deployFrontend = await runCommand(
        `npx wrangler pages deploy dist --project-name=pebble-drive --commit-message="${commitMsg}" --commit-dirty=true`,
        frontendDir
    );
    if (!deployFrontend.success) {
        error('前端部署失败');
        warning('可能的原因：');
        warning('  1. 项目名称不匹配（检查 --project-name）');
        warning('  2. 权限不足（运行 npx wrangler login 重新登录）');
        warning('  3. 网络问题（检查网络连接）');
        error(deployFrontend.error);

        // 提供手动部署建议
        console.log('');
        warning('手动部署命令：');
        console.log(`cd ${frontendDir}`);
        console.log(`npx wrangler pages deploy dist --project-name=pebble-drive --commit-message="Deploy" --commit-dirty=true`);
        console.log('');

        process.exit(1);
    }
    success('前端部署成功');

    console.log('');

    // 6. 完成提示
    title('🎉 恭喜！部署成功了！');
    console.log('');
    success('你的 PebbleDrive 已经在云端运行了！');
    console.log('');
    info('📊 配置摘要：');
    info(`  后端 API 地址: ${workerUrl}`);
    info(`  文件大小限制: ${config.maxFileSize}MB`);
    info(`  总存储空间: ${config.storageQuota}GB`);
    info(`  上传限制: ${config.uploadRateLimit}次/小时`);
    console.log('');

    warning('⚠️  重要：最后一步 - 设置登录密码');
    console.log('');
    warning('💡 为什么需要设置密码？');
    log('  密码是用来登录你的云盘的，就像门锁的钥匙');
    log('  必须设置密码才能正常使用');
    console.log('');
    warning('🔧 如何设置密码？（3步）');
    console.log('');
    log('第1步：进入后端目录');
    log('  命令: cd backend');
    console.log('');
    log('第2步：设置登录密码（必需）');
    log('  命令: echo "你的密码" | npx wrangler secret put AUTH_PASSWORD');
    log('  示例: echo "mypassword123" | npx wrangler secret put AUTH_PASSWORD');
    log('  💡 把 mypassword123 替换成你想要的密码');
    console.log('');
    log('第3步：设置加密密钥（必需）');
    log('  命令: echo "随机32位字符" | npx wrangler secret put AUTH_TOKEN_SECRET');
    log('  示例: echo "abc123xyz456def789ghi012jkl345mn" | npx wrangler secret put AUTH_TOKEN_SECRET');
    log('  💡 随便输入32个字母数字组合即可');
    console.log('');

    if (turnstileKey) {
        log('第4步：设置人机验证密钥（可选，如果使用了Turnstile）');
        log('  命令: echo "你的密钥" | npx wrangler secret put TURNSTILE_SECRET_KEY');
        console.log('');
    }

    info('💡 小提示：');
    log('  • 这些命令只需要运行一次');
    log('  • 设置后会永久保存在云端');
    log('  • 密码可以随时修改，重新运行命令即可');
    console.log('');

    success('✨ 完成密码设置后，就可以访问你的云盘了！');
    console.log('');
    info('📚 更多帮助：');
    log('  • GitHub: https://github.com/aydomini/pebble-drive');
    log('  • 文档: README.md');
    log('  • 问题反馈: GitHub Issues');
    console.log('');

    success('🎊 祝使用愉快！');
    console.log('');

    rl.close();
}

// 运行主函数
main().catch(err => {
    error('部署过程中发生错误：');
    error(err.message);
    console.error(err);
    rl.close();
    process.exit(1);
});
