#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Linux ARM 版本...');

// 检查是否在 Linux 环境下
if (process.platform !== 'linux') {
    console.log('⚠️  警告: 当前不在 Linux 环境下，某些功能可能无法正常工作');
}

// 检查必要的工具
function checkTools() {
    console.log('🔍 检查构建工具...');
    
    try {
        // 检查 node 版本
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Node.js 版本: ${nodeVersion}`);
        
        // 检查 npm 版本
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(`✅ npm 版本: ${npmVersion}`);
        
        // 检查 electron 版本
        const electronVersion = execSync('npx electron --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Electron 版本: ${electronVersion}`);
        
    } catch (error) {
        console.error('❌ 检查工具失败:', error.message);
        process.exit(1);
    }
}

// 清理之前的构建
function cleanBuild() {
    console.log('🧹 清理之前的构建...');
    
    const dirsToClean = ['dist', 'build', 'node_modules'];
    
    dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
                console.log(`✅ 已清理 ${dir} 目录`);
            } catch (error) {
                console.log(`⚠️  清理 ${dir} 失败:`, error.message);
            }
        }
    });
}

// 安装依赖
function installDependencies() {
    console.log('📦 安装依赖...');
    
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ 依赖安装完成');
    } catch (error) {
        console.error('❌ 依赖安装失败:', error.message);
        process.exit(1);
    }
}

// 重新构建 sqlite3 模块
function rebuildSqlite3() {
    console.log('🔧 重新构建 sqlite3 模块...');
    
    try {
        // 设置环境变量以支持交叉编译
        const env = {
            ...process.env,
            npm_config_arch: 'arm64', // 或者 'armv7l' 用于 32位 ARM
            npm_config_target: '28.0.0', // 对应 Electron 版本
            npm_config_disturl: 'https://electronjs.org/headers',
            npm_config_runtime: 'electron',
            npm_config_build_from_source: 'true'
        };
        
        // 重新构建 sqlite3
        execSync('npm rebuild sqlite3', { 
            stdio: 'inherit',
            env: env
        });
        
        console.log('✅ sqlite3 模块重新构建完成');
    } catch (error) {
        console.error('❌ sqlite3 模块重新构建失败:', error.message);
        console.log('⚠️  尝试使用 electron-rebuild...');
        
        try {
            execSync('npx electron-rebuild', { stdio: 'inherit' });
            console.log('✅ 使用 electron-rebuild 重新构建完成');
        } catch (rebuildError) {
            console.error('❌ electron-rebuild 也失败了:', rebuildError.message);
            process.exit(1);
        }
    }
}

// 验证 sqlite3 模块
function verifySqlite3() {
    console.log('🔍 验证 sqlite3 模块...');
    
    try {
        const sqlite3Path = path.join(__dirname, 'node_modules', 'sqlite3');
        const libPath = path.join(sqlite3Path, 'lib', 'binding');
        
        if (fs.existsSync(libPath)) {
            const files = fs.readdirSync(libPath);
            console.log('✅ sqlite3 库文件:', files);
            
            // 检查是否有 .node 文件
            const nodeFiles = files.filter(file => file.endsWith('.node'));
            if (nodeFiles.length > 0) {
                console.log('✅ 找到 .node 文件:', nodeFiles);
            } else {
                console.log('⚠️  未找到 .node 文件');
            }
        } else {
            console.log('⚠️  sqlite3 库目录不存在');
        }
    } catch (error) {
        console.error('❌ 验证 sqlite3 失败:', error.message);
    }
}

// 构建应用
function buildApp() {
    console.log('🏗️  开始构建应用...');
    
    try {
        // 构建 Linux ARM 版本
        console.log('📱 构建 Linux ARM 版本...');
        execSync('npm run build:linux-arm64', { stdio: 'inherit' });
        
        console.log('✅ Linux ARM 版本构建完成！');
        
        // 显示构建结果
        const distPath = path.join(__dirname, 'dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            console.log('📁 构建输出文件:');
            files.forEach(file => {
                const filePath = path.join(distPath, file);
                const stats = fs.statSync(filePath);
                const size = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`   ${file} (${size} MB)`);
            });
        }
        
    } catch (error) {
        console.error('❌ 构建失败:', error.message);
        process.exit(1);
    }
}

// 主函数
async function main() {
    try {
        checkTools();
        cleanBuild();
        installDependencies();
        rebuildSqlite3();
        verifySqlite3();
        buildApp();
        
        console.log('🎉 Linux ARM 版本构建完成！');
        console.log('📦 输出文件位于 dist/ 目录');
        
    } catch (error) {
        console.error('❌ 构建过程出错:', error.message);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    checkTools,
    cleanBuild,
    installDependencies,
    rebuildSqlite3,
    verifySqlite3,
    buildApp
}; 