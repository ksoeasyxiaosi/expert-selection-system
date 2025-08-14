const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始优化构建 Linux ARM 应用...');

// 设置环境变量
process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = 'true';
process.env.GH_TOKEN = 'dummy-token';
process.env.GITHUB_TOKEN = 'dummy-token';
process.env.NODE_ENV = 'production';

// 清理之前的构建
if (fs.existsSync('dist')) {
    console.log('🧹 清理之前的构建文件...');
    execSync('rm -rf dist', { stdio: 'inherit' });
}

// 清理不必要的文件
console.log('🧹 清理不必要的文件...');
const filesToRemove = [
    'node_modules/.cache',
    'node_modules/.bin',
    'node_modules/*/test',
    'node_modules/*/tests',
    'node_modules/*/docs',
    'node_modules/*/examples',
    'node_modules/*/samples',
    'node_modules/*/demo',
    'node_modules/*/demos'
];

filesToRemove.forEach(pattern => {
    try {
        execSync(`find node_modules -path "${pattern}" -type d -exec rm -rf {} + 2>/dev/null || true`, { stdio: 'inherit' });
    } catch (e) {
        // 忽略错误
    }
});

try {
    // 构建 ARM64 版本
    console.log('🔨 构建 ARM64 版本...');
    execSync('npx electron-builder --linux --arm64 --publish never', { 
        stdio: 'inherit',
        env: { ...process.env }
    });
    
    console.log('✅ 构建完成！');
    
    // 显示构建产物和大小
    if (fs.existsSync('dist')) {
        console.log('\n📦 构建产物:');
        const files = fs.readdirSync('dist');
        let totalSize = 0;
        
        files.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
                totalSize += stats.size;
                console.log(`  - ${file} (${sizeMB} MB)`);
            }
        });
        
        console.log(`\n📊 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        
        // 分析体积构成
        console.log('\n🔍 体积分析:');
        if (fs.existsSync('dist/linux-arm64-unpacked')) {
            const unpackedPath = 'dist/linux-arm64-unpacked';
            const appPath = path.join(unpackedPath, 'expert-selection-system');
            
            if (fs.existsSync(appPath)) {
                const appStats = fs.statSync(appPath);
                console.log(`  - 应用目录: ${(appStats.size / 1024 / 1024).toFixed(2)} MB`);
                
                // 分析 node_modules
                const nodeModulesPath = path.join(appPath, 'node_modules');
                if (fs.existsSync(nodeModulesPath)) {
                    const nodeModulesSize = getDirSize(nodeModulesPath);
                    console.log(`  - node_modules: ${(nodeModulesSize / 1024 / 1024).toFixed(2)} MB`);
                }
                
                // 分析 resources
                const resourcesPath = path.join(appPath, 'resources');
                if (fs.existsSync(resourcesPath)) {
                    const resourcesSize = getDirSize(resourcesPath);
                    console.log(`  - resources: ${(resourcesSize / 1024 / 1024).toFixed(2)} MB`);
                }
            }
        }
    }
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
}

function getDirSize(dirPath) {
    let totalSize = 0;
    try {
        const items = fs.readdirSync(dirPath);
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
                totalSize += getDirSize(itemPath);
            } else {
                totalSize += stats.size;
            }
        });
    } catch (e) {
        // 忽略错误
    }
    return totalSize;
}
