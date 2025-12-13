#!/usr/bin/env node

/**
 * PebbleDrive 部署前检查工具（跨平台）
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

let errors = 0;
let warnings = 0;

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
    warnings++;
}

function error(message) {
    log(`❌ ${message}`, colors.red);
    errors++;
}

function title(message) {
    console.log('');
    log(message, colors.blue);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

function runCommand(command, cwd = process.cwd()) {
    try {
        const output = execSync(command, {
            cwd,
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return { success: true, output };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 显示帮助信息
function showHelp() {
    console.log('');
    title('PebbleDrive 部署检查工具 - 帮助文档');
    console.log('');
    log('📖 这个工具做什么？', colors.blue);
    log('  检查你的电脑环境是否满足部署要求');
    log('  发现潜在问题，避免部署失败');
    console.log('');
    log('🎯 什么时候用？', colors.blue);
    log('  - 第一次部署前，检查环境是否正常');
    log('  - 部署失败后，查找问题原因');
    log('  - 担心配置有问题时，快速验证');
    console.log('');
    log('✅ 检查哪些内容？', colors.blue);
    log('  1. Node.js 版本（需要 >= 14.x）');
    log('  2. npm 是否安装');
    log('  3. Wrangler CLI 工具');
    log('  4. Cloudflare 登录状态');
    log('  5. 配置文件是否存在');
    log('  6. 配置参数是否合法');
    log('  7. Git 代码库状态');
    console.log('');
    log('🚀 使用方法', colors.blue);
    log('  npm run check         # 开始检查');
    log('  npm run check -- --help  # 显示帮助');
    console.log('');
    log('💡 看到错误怎么办？', colors.blue);
    log('  工具会告诉你详细的解决方法');
    log('  跟着提示操作即可解决');
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
        return;
    }

    log('═'.repeat(50), colors.blue);
    log('  PebbleDrive 部署前检查', colors.blue);
    log('═'.repeat(50), colors.blue);
    console.log('');
    log('💡 小提示：输入 npm run check -- --help 查看详细说明', colors.yellow);
    console.log('');

    // 1. 检查 Node.js
    title('📦 检查 Node.js 环境');
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major >= 14) {
        success(`Node.js 版本：${nodeVersion} ✓`);
    } else {
        error(`Node.js 版本过低：${nodeVersion}`);
        console.log('');
        warning('💡 为什么需要 Node.js >= 14.x？');
        log('  PebbleDrive 的部署工具需要较新的 Node.js 才能运行');
        log('  旧版本可能会导致部署失败或功能异常');
        console.log('');
        warning('🔧 如何升级？');
        log('  1. 访问：https://nodejs.org/');
        log('  2. 下载并安装最新 LTS 版本（长期支持版）');
        log('  3. 安装后重新运行检查');
        console.log('');
    }

    // 2. 检查 npm
    const npmCheck = runCommand('npm --version');
    if (npmCheck.success) {
        success(`npm 版本：${npmCheck.output.trim()} ✓`);
    } else {
        error('npm 未安装或无法访问');
        console.log('');
        warning('💡 什么是 npm？');
        log('  npm 是 Node.js 的包管理工具');
        log('  通常随 Node.js 一起安装');
        console.log('');
        warning('🔧 如何解决？');
        log('  重新安装 Node.js（npm 会自动包含）');
        log('  访问：https://nodejs.org/');
        console.log('');
    }

    // 3. 检查 wrangler
    title('🔧 检查 Wrangler CLI');
    const wranglerCheck = runCommand('npx wrangler --version');
    if (wranglerCheck.success) {
        success('Wrangler CLI 工具正常 ✓');
    } else {
        error('Wrangler CLI 工具无法使用');
        console.log('');
        warning('💡 Wrangler 是什么？');
        log('  Cloudflare 官方提供的部署工具');
        log('  用于将你的代码部署到云端');
        console.log('');
        warning('🔧 如何解决？');
        log('  1. 确保 Node.js 版本 >= 14.x');
        log('  2. 确保网络可以访问 npm');
        log('  3. 尝试手动安装: npm install -g wrangler');
        console.log('');
    }

    // 4. 检查登录状态
    title('🔐 检查 Cloudflare 登录状态');
    const whoamiCheck = runCommand('npx wrangler whoami');
    if (whoamiCheck.success && !whoamiCheck.output.includes('not authenticated')) {
        success('已登录 Cloudflare ✓');
    } else {
        error('尚未登录 Cloudflare 账号');
        console.log('');
        warning('💡 为什么需要登录？');
        log('  部署需要连接到你的 Cloudflare 账号');
        log('  这样才能把代码发布到你的云端');
        console.log('');
        warning('🔧 如何登录？');
        log('  1. 运行命令: npx wrangler login');
        log('  2. 浏览器会自动打开登录页面');
        log('  3. 登录成功后关闭浏览器');
        log('  4. 重新运行检查');
        console.log('');
        info('💡 没有账号？免费注册：https://dash.cloudflare.com/sign-up');
        console.log('');
    }

    // 5. 检查配置文件
    title('⚙️  检查配置文件');
    const wranglerToml = path.join(process.cwd(), 'backend/wrangler.toml');
    const wranglerExample = path.join(process.cwd(), 'backend/wrangler.toml.example');

    if (fs.existsSync(wranglerToml)) {
        success('wrangler.toml 存在 ✓');

        // 读取并验证配置
        const content = fs.readFileSync(wranglerToml, 'utf-8');

        // 检查必要配置
        const checks = [
            { key: 'MAX_FILE_SIZE_MB', name: '文件大小限制' },
            { key: 'STORAGE_QUOTA_GB', name: '存储配额' },
            { key: 'UPLOAD_RATE_LIMIT', name: '上传速率限制' },
        ];

        for (const check of checks) {
            const pattern = new RegExp(`${check.key}\\s*=\\s*"(\\d+)"`);
            const match = content.match(pattern);

            if (match) {
                const value = parseInt(match[1]);
                if (value > 0) {
                    success(`${check.name}: ${value} ✓`);
                } else {
                    error(`${check.name}配置无效：${value}`);
                    console.log('');
                    warning('💡 配置值必须大于 0');
                    log('  请修改 backend/wrangler.toml 文件');
                    log('  或使用 npm run deploy 重新配置');
                    console.log('');
                }
            } else {
                warning(`未设置 ${check.name}，将使用默认值`);
            }
        }
    } else if (fs.existsSync(wranglerExample)) {
        warning('wrangler.toml 不存在');
        console.log('');
        warning('💡 什么是 wrangler.toml？');
        log('  这是后端的配置文件，里面设置了：');
        log('  • 文件大小限制（比如最大 100MB）');
        log('  • 存储配额（比如最多 10GB）');
        log('  • 上传速率限制（防止滥用）');
        console.log('');
        warning('🔧 如何创建？');
        log('  方法1（推荐）：运行 npm run deploy');
        log('    工具会引导你创建配置文件');
        console.log('');
        log('  方法2（手动）：复制示例文件');
        log('    命令: cp backend/wrangler.toml.example backend/wrangler.toml');
        log('    然后修改里面的配置项');
        console.log('');
    } else {
        error('wrangler.toml 和 wrangler.toml.example 都不存在');
        console.log('');
        warning('💡 这是什么情况？');
        log('  项目文件可能不完整，缺少必要的配置模板');
        console.log('');
        warning('🔧 如何解决？');
        log('  1. 检查是否在正确的目录（应该在项目根目录）');
        log('  2. 重新从 GitHub 克隆项目');
        log('  3. 检查 backend/ 目录是否存在');
        console.log('');
    }

    // 6. 检查前端配置
    title('🌐 检查前端配置');
    const frontendPackage = path.join(process.cwd(), 'frontend/package.json');
    if (fs.existsSync(frontendPackage)) {
        success('frontend/package.json 存在 ✓');

        console.log('');
        info('💡 小提示：前端文件检查正常');
        log('  前端配置（API 地址、验证码密钥等）会在构建时设置');
        log('  运行 npm run deploy 时会自动配置');
        console.log('');
    } else {
        error('frontend/package.json 不存在');
        console.log('');
        warning('💡 这是什么情况？');
        log('  frontend/package.json 是前端项目的配置文件');
        log('  记录了前端需要的依赖包和构建命令');
        console.log('');
        warning('🔧 如何解决？');
        log('  1. 检查是否在正确的目录（应该在项目根目录）');
        log('  2. 检查 frontend/ 目录是否存在');
        log('  3. 重新从 GitHub 克隆完整项目');
        console.log('');
    }

    // 7. 检查 Git 状态
    title('📁 检查 Git 状态');
    const gitCheck = runCommand('git status');
    if (gitCheck.success) {
        success('Git 仓库正常 ✓');

        console.log('');
        info('💡 小提示：Git 检查通过');
        log('  Git 是代码版本管理工具，可以：');
        log('  • 追踪代码改动历史');
        log('  • 方便团队协作开发');
        log('  • 出问题时可以回退到之前的版本');
        console.log('');
    } else {
        warning('不是 Git 仓库或 Git 未安装');
        console.log('');
        warning('💡 这影响使用吗？');
        log('  不影响！Git 只是版本管理工具，不是必需的');
        log('  你仍然可以正常部署和使用 PebbleDrive');
        console.log('');
        info('🤔 什么情况会出现这个提示？');
        log('  • 直接下载了项目压缩包（而不是用 git clone）');
        log('  • 电脑上没有安装 Git');
        log('  • 在错误的目录下运行检查');
        console.log('');
        info('💡 想要安装 Git？');
        log('  访问：https://git-scm.com/downloads');
        log('  下载并安装即可');
        console.log('');
    }

    // 总结
    console.log('');
    log('═'.repeat(50), colors.blue);
    log('  检查完成', colors.blue);
    log('═'.repeat(50), colors.blue);
    console.log('');

    if (errors === 0 && warnings === 0) {
        log('🎉 状态统计', colors.green);
        log(`  错误: ${errors}`, colors.green);
        log(`  警告: ${warnings}`, colors.green);
    } else {
        log('📊 状态统计', colors.blue);
        log(`  错误: ${errors}`, errors > 0 ? colors.red : colors.green);
        log(`  警告: ${warnings}`, warnings > 0 ? colors.yellow : colors.green);
    }
    console.log('');

    if (errors > 0) {
        error('❌ 部署前检查失败');
        console.log('');
        warning('💡 这意味着什么？');
        log('  发现了一些必须解决的问题');
        log('  如果不修复，部署可能会失败');
        console.log('');
        warning('🔧 怎么办？');
        log('  1. 查看上面红色的错误提示');
        log('  2. 按照提示的解决方法操作');
        log('  3. 修复后重新运行: npm run check');
        console.log('');
        process.exit(1);
    } else if (warnings > 0) {
        warning('⚠️  存在警告，但可以继续部署');
        console.log('');
        info('💡 这意味着什么？');
        log('  发现了一些小问题或提示');
        log('  不会影响部署，但建议关注一下');
        console.log('');
        info('🤔 需要处理吗？');
        log('  • 黄色警告：建议处理，但不强制');
        log('  • 可以先部署，之后再优化');
        console.log('');
    } else {
        success('✅ 所有检查通过！');
        console.log('');
        success('🎉 恭喜！你的环境已经准备好了');
        log('  所有必要的工具和配置都正常');
        log('  可以开始部署 PebbleDrive 了');
        console.log('');
    }

    console.log('');
    log('🚀 下一步该做什么？', colors.blue);
    console.log('');

    if (errors > 0) {
        log('  1️⃣  修复上面的错误');
        log('  2️⃣  重新运行检查: npm run check');
        log('  3️⃣  检查通过后运行: npm run deploy');
    } else {
        log('  运行部署命令开始部署：');
        log('  npm run deploy');
        console.log('');
        info('💡 部署工具会引导你完成剩余配置');
        log('  • 选择配置预设（个人/团队/企业）');
        log('  • 自动部署后端和前端');
        log('  • 提供详细的操作说明');
    }
    console.log('');
}

main().catch(err => {
    error('检查过程中发生错误：');
    error(err.message);
    console.error(err);
    process.exit(1);
});
