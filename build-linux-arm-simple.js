#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始构建 Linux ARM 版本...');

try {
    // 检查当前环境
    console.log(`📱 当前平台: ${process.platform}`);
    console.log(`🏗️  当前架构: ${process.arch}`);
    
    // 清理之前的构建
    if (fs.existsSync('dist')) {
        console.log('🧹 清理之前的构建...');
        fs.rmSync('dist', { recursive: true, force: true });
    }
    
    // 重新构建 sqlite3 模块
    console.log('🔧 重新构建 sqlite3 模块...');
    execSync('npm rebuild sqlite3', { stdio: 'inherit' });
    
    // 构建 Linux ARM 版本
    console.log('📱 构建 Linux ARM 版本...');
    execSync('npm run build:linux-arm64', { stdio: 'inherit' });
    
    console.log('✅ Linux ARM 版本构建完成！');
    
    // 显示构建结果
    if (fs.existsSync('dist')) {
        const files = fs.readdirSync('dist');
        console.log('📁 构建输出文件:');
        files.forEach(file => {
            console.log(`   ${file}`);
        });
    }
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
} 