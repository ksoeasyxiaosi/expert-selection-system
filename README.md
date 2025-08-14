# 专家抽取系统

一个基于Electron的桌面应用，用于管理专家抽取需求。

## 功能特性

- 🎯 专家抽取需求管理
- 👥 专家信息管理
- 🔄 智能专家抽取算法
- 📊 实时状态跟踪
- 💾 本地数据持久化

## 开发环境

- Node.js 16+
- Electron 28+
- SQLite3

## 安装和运行

### 开发模式
```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 生产模式
```bash
# 启动应用
npm start
```

## 打包为exe程序

### 方法1：使用构建脚本（推荐）
```bash
# 运行构建脚本
node build.js
```

### 方法2：直接使用npm命令
```bash
# 构建Windows安装程序
npm run build:win64

# 或者使用默认构建
npm run build
```

### 构建配置说明

- **输出目录**: `dist/`
- **目标平台**: Windows x64
- **安装程序**: NSIS安装包
- **图标文件**: `assets/icon.ico`

### 图标要求

请将您的应用图标文件放在 `assets/icon.ico`，要求：
- 格式：ICO
- 尺寸：256x256像素（推荐）
- 支持透明背景

## 项目结构

```
expert-selection-system/
├── main.js              # Electron主进程
├── index.html           # 主界面
├── styles/              # 样式文件
├── scripts/             # 前端脚本
├── database/            # 数据库模块
├── assets/              # 资源文件
├── package.json         # 项目配置
└── build.js             # 构建脚本
```

## 注意事项

1. 确保所有依赖都已正确安装
2. 构建前请准备好应用图标
3. 首次构建可能需要下载Electron二进制文件
4. 构建完成后在`dist`目录查看结果

## 故障排除

### 依赖安装失败
如果遇到依赖冲突错误，请尝试以下解决方案：

#### 方法1：使用快速修复脚本（推荐）
```bash
node fix-deps.js
```

#### 方法2：手动修复
```bash
# 清理npm缓存
npm cache clean --force

# 删除旧的依赖文件
rm -rf node_modules
rm package-lock.json

# 重新安装依赖
npm install --legacy-peer-deps
```

#### 方法3：使用legacy-peer-deps
```bash
npm install --legacy-peer-deps
```

### 构建失败
- 检查Node.js版本（推荐16+）
- 确保所有依赖都已正确安装
- 检查网络连接是否正常
- 查看错误日志获取详细信息

### 图标问题
- 使用在线工具转换图片格式
- 确保图标文件路径正确
- 检查图标文件是否损坏

## 许可证

MIT License 