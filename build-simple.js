const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path'); // Added missing import for path

console.log('🚀 开始简单构建 Linux ARM 应用...');

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
    execSync('npm run build:linux-arm64', { 
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
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                console.log(`  - ${file} (${sizeMB} MB)`);
            }
        });
    }
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    console.log('\n💡 尝试以下解决方案:');
    console.log('1. 运行: npm install');
    console.log('2. 检查 package.json 中的脚本配置');
    console.log('3. 检查 node_modules 是否正确安装');
    process.exit(1);
}
