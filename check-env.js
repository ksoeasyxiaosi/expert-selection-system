const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 检查构建环境...\n');

// 检查 Node.js 版本
try {
    const nodeVersion = process.version;
    console.log(`✅ Node.js 版本: ${nodeVersion}`);
} catch (error) {
    console.log('❌ 无法获取 Node.js 版本');
}

// 检查 npm 版本
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm 版本: ${npmVersion}`);
} catch (error) {
    console.log('❌ 无法获取 npm 版本');
}

// 检查 package.json
if (fs.existsSync('package.json')) {
    console.log('✅ package.json 存在');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        console.log(`✅ 项目名称: ${packageJson.name}`);
        console.log(`✅ 版本: ${packageJson.version}`);
        
        if (packageJson.devDependencies && packageJson.devDependencies['electron-builder']) {
            console.log(`✅ electron-builder 版本: ${packageJson.devDependencies['electron-builder']}`);
        } else {
            console.log('❌ electron-builder 未在 devDependencies 中找到');
        }
        
        if (packageJson.scripts && packageJson.scripts['build:linux-arm64']) {
            console.log('✅ build:linux-arm64 脚本存在');
        } else {
            console.log('❌ build:linux-arm64 脚本不存在');
        }
    } catch (error) {
        console.log('❌ 无法解析 package.json');
    }
} else {
    console.log('❌ package.json 不存在');
}

// 检查 node_modules
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules 目录存在');
    
    // 检查 electron-builder
    if (fs.existsSync('node_modules/electron-builder')) {
        console.log('✅ electron-builder 已安装');
        
        // 检查可执行文件
        if (fs.existsSync('node_modules/.bin/electron-builder')) {
            console.log('✅ electron-builder 可执行文件存在');
        } else {
            console.log('❌ electron-builder 可执行文件不存在');
        }
        
        // 检查 package.json
        try {
            const ebPackageJson = JSON.parse(fs.readFileSync('node_modules/electron-builder/package.json', 'utf8'));
            console.log(`✅ electron-builder 包版本: ${ebPackageJson.version}`);
        } catch (error) {
            console.log('❌ 无法读取 electron-builder package.json');
        }
    } else {
        console.log('❌ electron-builder 未安装');
    }
    
    // 检查 electron
    if (fs.existsSync('node_modules/electron')) {
        console.log('✅ electron 已安装');
    } else {
        console.log('❌ electron 未安装');
    }
} else {
    console.log('❌ node_modules 目录不存在');
}

// 检查构建配置
if (fs.existsSync('.electron-builder.yml')) {
    console.log('✅ .electron-builder.yml 配置文件存在');
} else {
    console.log('⚠️  .electron-builder.yml 配置文件不存在，使用 package.json 中的配置');
}

// 检查脚本文件
const scriptFiles = [
    'build-simple.js',
    'build-optimized.js',
    'build-linux-simple.js'
];

scriptFiles.forEach(script => {
    if (fs.existsSync(script)) {
        console.log(`✅ ${script} 存在`);
    } else {
        console.log(`❌ ${script} 不存在`);
    }
});

console.log('\n💡 建议的解决方案:');
console.log('1. 如果依赖未安装，运行: npm install');
console.log('2. 如果 electron-builder 有问题，运行: npm install electron-builder --save-dev');
console.log('3. 尝试使用: npm run build:linux-arm64');
console.log('4. 检查 package-lock.json 是否正确');
console.log('5. 尝试删除 node_modules 和 package-lock.json，然后重新安装');

// 尝试运行构建命令
console.log('\n🧪 测试构建命令...');
try {
    const result = execSync('npm run build:linux-arm64 --dry-run', { 
        encoding: 'utf8',
        stdio: 'pipe'
    });
    console.log('✅ 构建命令测试成功');
} catch (error) {
    console.log('❌ 构建命令测试失败');
    console.log('错误信息:', error.message);
}
