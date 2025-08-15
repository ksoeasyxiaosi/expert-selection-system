const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path'); // Added missing import for path

console.log('🔧 修复 sqlite3 架构问题...\n');

// 获取系统信息
const platform = os.platform();
const arch = os.arch();

console.log(`📱 系统信息:`);
console.log(`  平台: ${platform}`);
console.log(`  架构: ${arch}`);

// 设置正确的环境变量
function setEnvironmentVariables() {
    console.log('\n⚙️  设置环境变量...');
    
    if (platform === 'linux') {
        if (arch === 'arm64') {
            console.log('🎯 目标架构: ARM64');
            process.env.npm_config_arch = 'arm64';
            process.env.npm_config_target = '28.0.0';
            process.env.npm_config_disturl = 'https://electronjs.org/headers';
            process.env.npm_config_runtime = 'electron';
            process.env.npm_config_build_from_source = 'true';
        } else if (arch === 'x64') {
            console.log('🎯 目标架构: x64');
            process.env.npm_config_arch = 'x64';
            process.env.npm_config_target = '28.0.0';
            process.env.npm_config_disturl = 'https://electronjs.org/headers';
            process.env.npm_config_runtime = 'electron';
            process.env.npm_config_build_from_source = 'true';
        } else {
            console.log(`⚠️  未知架构: ${arch}，使用默认配置`);
        }
    } else {
        console.log(`⚠️  非 Linux 平台: ${platform}，使用默认配置`);
    }
    
    // 显示环境变量
    console.log('\n📋 环境变量:');
    console.log(`  npm_config_arch: ${process.env.npm_config_arch || '未设置'}`);
    console.log(`  npm_config_target: ${process.env.npm_config_target || '未设置'}`);
    console.log(`  npm_config_runtime: ${process.env.npm_config_runtime || '未设置'}`);
}

// 清理 sqlite3 模块
function cleanSqlite3() {
    console.log('\n🧹 清理 sqlite3 模块...');
    
    const sqlite3Path = 'node_modules/sqlite3';
    if (fs.existsSync(sqlite3Path)) {
        try {
            // 删除 sqlite3 模块
            execSync(`rm -rf ${sqlite3Path}`, { stdio: 'inherit' });
            console.log('✅ sqlite3 模块已清理');
        } catch (error) {
            console.log('⚠️  清理 sqlite3 模块时出错:', error.message);
        }
    } else {
        console.log('ℹ️  sqlite3 模块不存在，无需清理');
    }
}

// 重新安装 sqlite3
function reinstallSqlite3() {
    console.log('\n📦 重新安装 sqlite3...');
    
    try {
        // 重新安装 sqlite3
        execSync('npm install sqlite3@5.1.7', { 
            stdio: 'inherit',
            env: { ...process.env }
        });
        console.log('✅ sqlite3 重新安装完成');
    } catch (error) {
        console.log('❌ 重新安装 sqlite3 失败:', error.message);
        return false;
    }
    
    return true;
}

// 重建 sqlite3
function rebuildSqlite3() {
    console.log('\n🔨 重建 sqlite3...');
    
    try {
        // 使用 electron-rebuild 重建
        execSync('npx electron-rebuild -f -w sqlite3', { 
            stdio: 'inherit',
            env: { ...process.env }
        });
        console.log('✅ sqlite3 重建完成');
    } catch (error) {
        console.log('⚠️  electron-rebuild 失败，尝试 npm rebuild...');
        
        try {
            execSync('npm rebuild sqlite3', { 
                stdio: 'inherit',
                env: { ...process.env }
            });
            console.log('✅ npm rebuild sqlite3 完成');
        } catch (rebuildError) {
            console.log('❌ npm rebuild sqlite3 也失败:', rebuildError.message);
            return false;
        }
    }
    
    return true;
}

// 验证 sqlite3 模块
function verifySqlite3() {
    console.log('\n🔍 验证 sqlite3 模块...');
    
    const sqlite3Path = 'node_modules/sqlite3';
    if (!fs.existsSync(sqlite3Path)) {
        console.log('❌ sqlite3 模块不存在');
        return false;
    }
    
    console.log('✅ sqlite3 模块存在');
    
    // 检查 binding 目录
    const bindingPath = path.join(sqlite3Path, 'lib', 'binding');
    if (fs.existsSync(bindingPath)) {
        console.log('✅ lib/binding 目录存在');
        
        const bindingFiles = fs.readdirSync(bindingPath);
        console.log(`📁 binding 目录包含: ${bindingFiles.join(', ')}`);
        
        // 检查 .node 文件
        const nodeFiles = bindingFiles.filter(file => file.endsWith('.node'));
        if (nodeFiles.length > 0) {
            console.log(`🔧 找到 .node 文件: ${nodeFiles.join(', ')}`);
            
            nodeFiles.forEach(file => {
                const filePath = path.join(bindingPath, file);
                try {
                    const stats = fs.statSync(filePath);
                    console.log(`📄 ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
                } catch (error) {
                    console.log(`❌ 无法读取 ${file}`);
                }
            });
            
            return true;
        } else {
            console.log('❌ 未找到 .node 文件');
            return false;
        }
    } else {
        console.log('❌ lib/binding 目录不存在');
        return false;
    }
}

// 主函数
function main() {
    console.log('🚀 开始修复 sqlite3 架构问题...\n');
    
    try {
        // 设置环境变量
        setEnvironmentVariables();
        
        // 清理 sqlite3 模块
        cleanSqlite3();
        
        // 重新安装 sqlite3
        if (!reinstallSqlite3()) {
            console.log('❌ 重新安装失败，退出');
            process.exit(1);
        }
        
        // 重建 sqlite3
        if (!rebuildSqlite3()) {
            console.log('❌ 重建失败，退出');
            process.exit(1);
        }
        
        // 验证 sqlite3 模块
        if (verifySqlite3()) {
            console.log('\n🎉 sqlite3 架构问题修复完成！');
            console.log('\n💡 下一步:');
            console.log('1. 重新构建应用: npm run build:linux-arm64');
            console.log('2. 测试构建后的应用');
        } else {
            console.log('\n❌ sqlite3 模块验证失败');
            console.log('\n💡 建议:');
            console.log('1. 检查系统依赖: sudo apt-get install build-essential python3 make');
            console.log('2. 检查 Node.js 和 npm 版本');
            console.log('3. 尝试手动重建');
        }
        
    } catch (error) {
        console.error('❌ 修复过程中出错:', error.message);
        process.exit(1);
    }
}

main();
