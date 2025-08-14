const fs = require('fs');
const path = require('path');

console.log('🔍 分析应用体积构成...\n');

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

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dirPath, indent = '') {
    if (!fs.existsSync(dirPath)) {
        console.log(`${indent}❌ 目录不存在: ${dirPath}`);
        return 0;
    }

    let totalSize = 0;
    const items = fs.readdirSync(dirPath);
    
    // 按大小排序
    const itemStats = items.map(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        return { name: item, path: itemPath, stats, size: stats.isDirectory() ? getDirSize(itemPath) : stats.size };
    }).sort((a, b) => b.size - a.size);

    itemStats.forEach(item => {
        const sizeStr = formatSize(item.size);
        const icon = item.stats.isDirectory() ? '📁' : '📄';
        console.log(`${indent}${icon} ${item.name} (${sizeStr})`);
        
        if (item.stats.isDirectory() && item.size > 1024 * 1024) { // 大于1MB的目录
            analyzeDirectory(item.path, indent + '  ');
        }
        
        totalSize += item.size;
    });

    return totalSize;
}

// 分析构建产物
if (fs.existsSync('dist')) {
    console.log('📦 构建产物分析:\n');
    
    const distFiles = fs.readdirSync('dist');
    let totalDistSize = 0;
    
    distFiles.forEach(file => {
        const filePath = path.join('dist', file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            totalDistSize += stats.size;
            console.log(`📦 ${file} (${formatSize(stats.size)})`);
        }
    });
    
    console.log(`\n📊 总构建大小: ${formatSize(totalDistSize)}\n`);
    
    // 分析解压后的应用
    const unpackedDirs = distFiles.filter(file => file.includes('unpacked'));
    
    unpackedDirs.forEach(dir => {
        console.log(`🔍 分析 ${dir}:\n`);
        const unpackedPath = path.join('dist', dir);
        const appPath = path.join(unpackedPath, 'expert-selection-system');
        
        if (fs.existsSync(appPath)) {
            const totalSize = analyzeDirectory(appPath);
            console.log(`\n📊 ${dir} 总大小: ${formatSize(totalSize)}\n`);
        }
    });
    
} else {
    console.log('❌ 未找到 dist 目录，请先运行构建命令');
}

// 分析 node_modules 大小
if (fs.existsSync('node_modules')) {
    console.log('📦 node_modules 分析:\n');
    
    const nodeModulesSize = getDirSize('node_modules');
    console.log(`📁 node_modules 总大小: ${formatSize(nodeModulesSize)}`);
    
    // 分析主要依赖
    const mainDeps = ['sqlite3', 'uuid', 'electron'];
    mainDeps.forEach(dep => {
        const depPath = path.join('node_modules', dep);
        if (fs.existsSync(depPath)) {
            const depSize = getDirSize(depPath);
            console.log(`  📦 ${dep}: ${formatSize(depSize)}`);
        }
    });
    
    console.log('');
}

// 提供优化建议
console.log('💡 体积优化建议:\n');
console.log('1. 启用 asar 打包 (已配置)');
console.log('2. 使用 maximum 压缩 (已配置)');
console.log('3. 排除不必要的文件 (已配置)');
console.log('4. 只包含必要的依赖');
console.log('5. 考虑使用 electron-builder 的 tree-shaking');
console.log('6. 移除开发依赖和测试文件');
console.log('7. 使用 webpack 等工具进行代码分割');
console.log('8. 压缩图片和静态资源');
