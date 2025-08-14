const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Linux ARM 应用...');

// 设置环境变量
process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
process.env.GH_TOKEN = 'dummy-token';
process.env.GITHUB_TOKEN = 'dummy-token';

// 清理之前的构建
if (fs.existsSync('dist')) {
    console.log('🧹 清理之前的构建文件...');
    execSync('rm -rf dist', { stdio: 'inherit' });
}

try {
    // 构建 ARM64 版本
    console.log('🔨 构建 ARM64 版本...');
    execSync('npx electron-builder --linux --arm64 --publish never', { 
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    // 构建 ARMv7l 版本
    console.log('🔨 构建 ARMv7l 版本...');
    execSync('npx electron-builder --linux --armv7l --publish never', { 
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    console.log('✅ 构建完成！');
    
    // 显示构建产物
    if (fs.existsSync('dist')) {
        console.log('\n📦 构建产物:');
        const files = fs.readdirSync('dist');
        files.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                console.log(`  - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        });
    }
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
}
