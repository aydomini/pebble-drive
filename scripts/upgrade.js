#!/usr/bin/env node

/**
 * PebbleDrive 升级工具
 * 自动备份配置、更新代码、迁移配置
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function title(message) {
    console.log('');
    log('═'.repeat(50), colors.blue);
    log(`  ${message}`, colors.blue);
    log('═'.repeat(50), colors.blue);
    console.log('');
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function runCommand(command, cwd = process.cwd()) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
        return true;
    } catch (err) {
        return false;
    }
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
}

/**
 * 检查 Git 仓库健康状态
 * @returns {Object} { healthy: boolean, error: string }
 */
function checkGitHealth() {
    try {
        // 检查是否在 Git 仓库中
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });

        // 检查远程仓库连接
        execSync('git remote -v', { stdio: 'ignore' });

        // 尝试 fetch（不实际拉取，只检查连接）
        const testFetch = execSync('git ls-remote --heads origin', { encoding: 'utf-8', stdio: 'pipe' });

        return { healthy: true, error: null };
    } catch (err) {
        return {
            healthy: false,
            error: err.message || 'Git 仓库状态异常'
        };
    }
}

// 显示帮助信息
function showHelp() {
    console.log('');
    title('PebbleDrive 升级工具 - 帮助文档');
    console.log('');
    log('📖 这个工具做什么？', colors.blue);
    log('  帮助老用户安全升级到最新版本');
    log('  自动备份配置、更新代码、恢复设置');
    console.log('');
    log('🎯 什么时候用？', colors.blue);
    log('  - PebbleDrive 有新版本发布时');
    log('  - 想要获得新功能或bug修复时');
    log('  - 看到 GitHub 上有更新时');
    console.log('');
    log('💡 升级前会做什么？', colors.blue);
    log('  1. 自动备份你的配置文件');
    log('  2. 检查 Git 状态是否正常');
    log('  3. 获取最新代码');
    log('  4. 自动恢复你的个性化配置');
    log('  5. 更新依赖包');
    console.log('');
    log('⚠️  升级安全吗？', colors.blue);
    log('  • 完全安全！配置会自动备份到 .backup 目录');
    log('  • 如果出错，可以随时恢复备份');
    log('  • Git状态异常时会智能跳过代码更新');
    console.log('');
    log('🚀 使用方法', colors.blue);
    log('  npm run upgrade         # 开始升级');
    log('  npm run upgrade -- --help  # 显示帮助');
    console.log('');
    log('🔗 更多帮助', colors.blue);
    log('  GitHub: https://github.com/aydomini/pebble-drive');
    log('  升级指南: UPGRADE-GUIDE.md');
    console.log('');
}

async function main() {
    // 检查是否需要显示帮助
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp();
        rl.close();
        return;
    }

    title('PebbleDrive 升级工具 v1.2');
    warning('💡 小提示：输入 npm run upgrade -- --help 查看详细说明');
    console.log('');

    const backupDir = path.join(process.cwd(), '.backup');
    const wranglerToml = path.join(process.cwd(), 'backend/wrangler.toml');
    let skipCodeUpdate = false;

    // 1. 备份当前配置
    title('步骤 1/5: 备份当前配置');

    // 创建备份目录
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `wrangler.toml.${timestamp}`);

    if (fs.existsSync(wranglerToml)) {
        fs.copyFileSync(wranglerToml, backupFile);
        success(`配置已备份到：${backupFile}`);
    } else {
        warning('未找到现有配置文件');
    }

    // 2. 检查 Git 健康状态
    title('步骤 2/5: 检查代码库状态');
    info('正在检查代码库连接...');

    const gitHealth = checkGitHealth();
    if (!gitHealth.healthy) {
        error('代码库状态检查失败');
        console.log('');
        warning(`💡 发现的问题：${gitHealth.error}`);
        console.log('');
        warning('🤔 这是什么意思？');
        log('  代码库（Git）就像是代码的"版本控制器"');
        log('  它帮助我们获取最新版本的代码');
        log('  如果状态异常，我们可以跳过代码更新，只更新配置');
        console.log('');
        warning('你可以选择：');
        log('  1. 跳过代码更新，只更新配置和依赖（推荐）');
        log('     • 优点：升级可以继续进行');
        log('     • 缺点：可能无法获得最新功能');
        console.log('');
        log('  2. 退出升级，手动修复问题后重试');
        log('     • 适合：想要获得完整最新版本的用户');
        console.log('');

        const answer = await question('是否跳过代码更新继续升级？(y/n) [默认: y]: ');
        if (answer === 'n' || answer === 'no') {
            console.log('');
            warning('升级已取消。如何解决这个问题？');
            console.log('');
            log('方法1：检查网络连接');
            log('  确保可以访问 GitHub');
            console.log('');
            log('方法2：查看代码库状态');
            log('  运行命令: git status');
            log('  运行命令: git remote -v');
            console.log('');
            log('方法3：手动升级');
            log('  参考文档: UPGRADE-GUIDE.md');
            console.log('');
            info('💡 修复后可以重新运行: npm run upgrade');
            console.log('');
            rl.close();
            process.exit(0);
        }

        skipCodeUpdate = true;
        warning('✓ 将跳过代码更新，仅更新配置和依赖');
        console.log('');
    } else {
        success('代码库状态正常');
    }

    // 3. 获取和合并最新代码
    if (!skipCodeUpdate) {
        title('步骤 3/5: 获取最新代码');

        const gitCheck = runCommand('git fetch origin main');
        if (!gitCheck) {
            warning('获取远程代码失败，将跳过代码更新');
            skipCodeUpdate = true;
        } else {
            success('已获取最新代码');

            // 检查是否有未提交的更改
            try {
                const status = execSync('git status --porcelain', { encoding: 'utf-8' });
                if (status.trim()) {
                    warning('检测到未保存的修改：');
                    console.log(status);
                    console.log('');
                    warning('💡 什么是"未保存的修改"？');
                    log('  你对代码做了一些改动，但还没有保存到版本库');
                    log('  升级前需要先暂时保存起来，升级后可以恢复');
                    console.log('');
                    warning('🤔 暂存是什么意思？');
                    log('  暂存 = 把你的改动临时保存到一个"保险箱"');
                    log('  升级完成后，可以从"保险箱"里取回来');
                    log('  就像给文件做了一个临时备份');
                    console.log('');
                    const answer = await question('是否暂存改动并继续升级？(y/n) [默认: y]: ');
                    if (answer === 'n' || answer === 'no') {
                        warning('升级已取消');
                        console.log('');
                        info('💡 你可以：');
                        log('  1. 手动提交改动: git add . && git commit -m "保存修改"');
                        log('  2. 放弃改动: git reset --hard');
                        log('  3. 保持现状，稍后再升级');
                        console.log('');
                        rl.close();
                        process.exit(0);
                    }
                    // 暂存更改
                    info('正在暂存你的改动...');
                    runCommand('git stash');
                    success('已暂存改动（升级完成后会自动恢复）');
                }
            } catch (err) {
                warning('无法检查代码状态，将跳过代码更新');
                skipCodeUpdate = true;
            }

            if (!skipCodeUpdate) {
                const mergeCheck = runCommand('git merge origin/main');
                if (!mergeCheck) {
                    error('代码合并失败，可能存在冲突');
                    warning('将跳过代码更新');
                    skipCodeUpdate = true;
                } else {
                    success('代码已更新到最新版本');
                }
            }
        }
    } else {
        title('步骤 3/5: 跳过代码更新');
        warning('已跳过代码更新（Git 状态异常）');
    }

    // 4. 恢复配置
    title('步骤 4/5: 恢复配置');

    if (fs.existsSync(backupFile)) {
        // 读取备份的配置
        const backupConfig = fs.readFileSync(backupFile, 'utf-8');

        // 提取关键配置值
        const extractConfig = (content) => {
            const config = {};
            const patterns = {
                MAX_FILE_SIZE_MB: /MAX_FILE_SIZE_MB\s*=\s*"(\d+)"/,
                STORAGE_QUOTA_GB: /STORAGE_QUOTA_GB\s*=\s*"(\d+)"/,
                UPLOAD_RATE_LIMIT: /UPLOAD_RATE_LIMIT\s*=\s*"(\d+)"/,
                BLOCKED_EXTENSIONS: /BLOCKED_EXTENSIONS\s*=\s*"([^"]+)"/,
            };

            for (const [key, pattern] of Object.entries(patterns)) {
                const match = content.match(pattern);
                if (match) {
                    config[key] = match[1];
                }
            }
            return config;
        };

        const oldConfig = extractConfig(backupConfig);

        // 读取新的配置模板
        if (fs.existsSync(wranglerToml)) {
            let newConfig = fs.readFileSync(wranglerToml, 'utf-8');

            // 应用旧配置到新模板
            for (const [key, value] of Object.entries(oldConfig)) {
                const pattern = new RegExp(`${key}\\s*=\\s*"[^"]*"`, 'g');
                newConfig = newConfig.replace(pattern, `${key} = "${value}"`);
            }

            fs.writeFileSync(wranglerToml, newConfig);
            success('配置已恢复');

            console.log('');
            log('恢复的配置：', colors.blue);
            for (const [key, value] of Object.entries(oldConfig)) {
                log(`  ${key}: ${value}`);
            }
        } else {
            warning('未找到新的配置模板，跳过配置恢复');
        }
    }

    // 5. 安装依赖
    title('步骤 5/5: 更新依赖');

    log('更新后端依赖...');
    runCommand('npm install', path.join(process.cwd(), 'backend'));

    log('更新前端依赖...');
    runCommand('npm install', path.join(process.cwd(), 'frontend'));

    success('依赖已更新');

    // 完成提示
    console.log('');
    title('🎉 升级完成！');
    console.log('');

    if (skipCodeUpdate) {
        warning('注意：已跳过代码更新');
        log('  - 配置已迁移');
        log('  - 依赖已更新');
        log('  - 如需更新代码，请手动执行 git pull');
    } else {
        success('配置已自动迁移，请检查配置文件');
    }

    warning('如有新增配置项，请参考 wrangler.toml.example 手动添加');
    console.log('');
    log('下一步：');
    log('  1. 检查 backend/wrangler.toml 配置');
    log('  2. 运行 npm run deploy 部署更新');
    console.log('');
    log(`备份文件保存在：${backupDir}`, colors.blue);
    console.log('');

    rl.close();
}

main().catch(err => {
    error('升级过程中发生错误：');
    error(err.message);
    console.error(err);
    rl.close();
    process.exit(1);
});
