const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 检查 sqlite3 架构问题...\n');

// 获取系统信息
const platform = os.platform();
const arch = os.arch();
const nodeVersion = process.version;

console.log(`📱 系统信息:`);
console.log(`  平台: ${platform}`);
console.log(`  架构: ${arch}`);
console.log(`  Node.js: ${nodeVersion}`);

// 检查 sqlite3 模块
function checkSqlite3Module() {
    console.log('\n📦 检查 sqlite3 模块...');
    
    const sqlite3Path = path.join(__dirname, 'node_modules', 'sqlite3');
    if (!fs.existsSync(sqlite3Path)) {
        console.log('❌ node_modules/sqlite3 目录不存在');
        return false;
    }
    
    console.log('✅ node_modules/sqlite3 目录存在');
    
    // 检查 package.json
    const packageJsonPath = path.join(sqlite3Path, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            console.log(`📋 sqlite3 版本: ${packageJson.version}`);
        } catch (error) {
            console.log('❌ 无法读取 sqlite3 package.json');
        }
    }
    
    // 检查 binding 目录
    const bindingPath = path.join(sqlite3Path, 'lib', 'binding');
    if (fs.existsSync(bindingPath)) {
        console.log('✅ lib/binding 目录存在');
        
        const bindingFiles = fs.readdirSync(bindingPath);
        console.log(`📁 binding 目录包含: ${bindingFiles.join(', ')}`);
        
        // 检查是否有正确的架构文件
        const nodeFiles = bindingFiles.filter(file => file.endsWith('.node'));
        if (nodeFiles.length > 0) {
            console.log(`🔧 找到 .node 文件: ${nodeFiles.join(', ')}`);
            
            // 检查文件架构
            nodeFiles.forEach(file => {
                const filePath = path.join(bindingPath, file);
                try {
                    const stats = fs.statSync(filePath);
                    console.log(`📄 ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
                } catch (error) {
                    console.log(`❌ 无法读取 ${file}`);
                }
            });
        } else {
            console.log('❌ 未找到 .node 文件');
        }
    } else {
        console.log('❌ lib/binding 目录不存在');
        return false;
    }
    
    return true;
}

// 检查构建后的应用
function checkBuiltApp() {
    console.log('\n📱 检查构建后的应用...');
    
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
        console.log('❌ dist 目录不存在，请先运行构建');
        return;
    }
    
    // 查找解压后的应用目录
    const unpackedDirs = fs.readdirSync(distPath).filter(dir => 
        dir.includes('unpacked') || dir.includes('linux')
    );
    
    if (unpackedDirs.length === 0) {
        console.log('❌ 未找到解压后的应用目录');
        return;
    }
    
    unpackedDirs.forEach(dir => {
        console.log(`\n🔍 检查 ${dir}...`);
        
        // 检查应用目录
        const appPath = path.join(distPath, dir, 'expert-selection-system');
        if (fs.existsSync(appPath)) {
            console.log('✅ 应用目录存在');
            
            // 检查 sqlite3 模块
            const sqlite3Path = path.join(appPath, 'node_modules', 'sqlite3');
            if (fs.existsSync(sqlite3Path)) {
                console.log('✅ app/node_modules/sqlite3 存在');
                
                const bindingPath = path.join(sqlite3Path, 'lib', 'binding');
                if (fs.existsSync(bindingPath)) {
                    const bindingFiles = fs.readdirSync(bindingPath);
                    console.log(`📁 app binding 目录: ${bindingFiles.join(', ')}`);
                }
            }
            
            // 检查 resources 目录
            const resourcesPath = path.join(appPath, 'resources');
            if (fs.existsSync(resourcesPath)) {
                console.log('✅ resources 目录存在');
                
                const resourcesSqlite3Path = path.join(resourcesPath, 'node_modules', 'sqlite3');
                if (fs.existsSync(resourcesSqlite3Path)) {
                    console.log('✅ resources/node_modules/sqlite3 存在');
                    
                    const resourcesBindingPath = path.join(resourcesSqlite3Path, 'lib', 'binding');
                    if (fs.existsSync(resourcesBindingPath)) {
                        const resourcesBindingFiles = fs.readdirSync(resourcesBindingPath);
                        console.log(`📁 resources binding 目录: ${resourcesBindingFiles.join(', ')}`);
                    }
                }
            }
        }
    });
}

// 提供解决方案
function provideSolutions() {
    console.log('\n💡 解决方案:');
    
    if (arch === 'arm64') {
        console.log('1. 重新构建 ARM64 版本的 sqlite3:');
        console.log('   npm run rebuild:sqlite3');
        console.log('   或者:');
        console.log('   export npm_config_arch=arm64');
        console.log('   export npm_config_target=28.0.0');
        console.log('   export npm_config_disturl=https://electronjs.org/headers');
        console.log('   export npm_config_runtime=electron');
        console.log('   npm rebuild sqlite3');
    } else if (arch === 'x64') {
        console.log('1. 重新构建 x64 版本的 sqlite3:');
        console.log('   export npm_config_arch=x64');
        console.log('   export npm_config_target=28.0.0');
        console.log('   export npm_config_disturl=https://electronjs.org/headers');
        console.log('   export npm_config_runtime=electron');
        console.log('   npm rebuild sqlite3');
    }
    
    console.log('\n2. 清理并重新安装:');
    console.log('   rm -rf node_modules package-lock.json');
    console.log('   npm install');
    console.log('   npm run rebuild:sqlite3');
    
    console.log('\n3. 检查目标架构:');
    console.log('   确保构建的目标架构与运行环境匹配');
    console.log('   当前系统架构:', arch);
    
    console.log('\n4. 重新构建应用:');
    console.log('   npm run build:linux-arm64  # 如果目标是 ARM64');
    console.log('   npm run build:linux-x64   # 如果目标是 x64');
}

// 主函数
function main() {
    console.log('🚀 开始诊断 sqlite3 架构问题...\n');
    
    const sqlite3Ok = checkSqlite3Module();
    checkBuiltApp();
    
    console.log('\n📊 诊断结果:');
    if (sqlite3Ok) {
        console.log('✅ sqlite3 模块基本完整');
        console.log('⚠️  但可能存在架构不匹配问题');
    } else {
        console.log('❌ sqlite3 模块有问题');
    }
    
    provideSolutions();
}

main();
