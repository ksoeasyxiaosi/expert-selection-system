# GitHub Actions 构建指南

本文档说明如何使用 GitHub Actions 自动构建专家抽取系统的 Linux ARM 版本。

## 可用的 Workflows

### 1. `build-linux-arm.yml` - 完整构建流程
- **触发条件**: 推送到 main/develop 分支、创建标签、PR、手动触发
- **支持架构**: arm64、armv7l、x64
- **输出**: AppImage、Deb 包、解压目录
- **特殊功能**: 自动创建 GitHub Release（当创建标签时）

### 2. `build-arm.yml` - 简化 ARM 构建
- **触发条件**: 推送到 main/develop 分支、PR、手动触发
- **支持架构**: arm64、armv7l
- **输出**: AppImage、Deb 包、解压目录
- **特点**: 更轻量，专门针对 ARM 架构

## 使用方法

### 自动触发
1. **推送到分支**: 每次推送到 `main` 或 `develop` 分支时自动触发构建
2. **创建 PR**: 向 `main` 或 `develop` 分支创建 PR 时自动触发构建
3. **创建标签**: 创建以 `v` 开头的标签时自动触发构建和发布

### 手动触发
1. 进入 GitHub 仓库页面
2. 点击 "Actions" 标签页
3. 选择对应的 workflow
4. 点击 "Run workflow" 按钮
5. 选择目标架构（arm64 或 armv7l）
6. 点击 "Run workflow" 开始构建

## 构建输出

### 构建产物
- **AppImage**: 自包含的可执行文件，适合便携使用
- **Deb 包**: Debian/Ubuntu 系统的安装包
- **解压目录**: 包含所有应用文件的目录

### 下载方式
1. **构建产物**: 在 Actions 页面点击对应的构建任务，在 "Artifacts" 部分下载
2. **Release 文件**: 当创建标签时，会自动创建 GitHub Release 并提供下载链接

## 构建环境

### 运行环境
- **操作系统**: Ubuntu Latest
- **Node.js**: 18.x
- **构建工具**: build-essential、python3、make

### 依赖管理
- 使用 `npm ci` 进行快速、可靠的依赖安装
- 自动缓存 npm 依赖以提高构建速度
- 自动重建 sqlite3 模块以适配 Electron 环境

## 配置说明

### 环境变量
构建过程中会自动设置以下环境变量：
```bash
npm_config_arch=arm64          # 目标架构
npm_config_target=28.0.0       # Electron 版本
npm_config_disturl=https://electronjs.org/headers
npm_config_runtime=electron
npm_config_build_from_source=true
```

### 缓存策略
- **npm 缓存**: 自动缓存 node_modules 以提高构建速度
- **构建产物**: 保留 30 天，之后自动清理

## 常见问题

### 1. 构建失败
- 检查 Node.js 版本是否兼容
- 确认 package.json 中的脚本配置正确
- 查看构建日志中的具体错误信息

### 2. sqlite3 模块问题
- 确保 package.json 中包含了正确的 sqlite3 版本
- 检查 electron-rebuild 是否正确配置
- 验证目标架构设置是否正确

### 3. 权限问题
- 确保 GitHub 仓库有足够的权限运行 Actions
- 检查 secrets 配置是否正确

## 最佳实践

### 1. 分支策略
- 使用 `main` 分支作为稳定版本
- 使用 `develop` 分支进行开发
- 创建功能分支进行具体功能开发

### 2. 版本管理
- 使用语义化版本号（如 v1.0.0、v1.1.0）
- 创建标签时使用 `v*` 格式
- 在 README 中说明版本兼容性

### 3. 测试策略
- 在 PR 中自动触发构建以验证代码
- 在合并到主分支前确保构建成功
- 定期测试不同架构的构建结果

## 监控和维护

### 1. 构建状态
- 在 README 中添加构建状态徽章
- 定期检查构建成功率
- 及时修复失败的构建

### 2. 性能优化
- 监控构建时间
- 优化依赖安装和缓存策略
- 考虑使用矩阵构建并行处理多个架构

### 3. 安全更新
- 定期更新 GitHub Actions 版本
- 检查依赖包的安全漏洞
- 及时应用安全补丁

## 联系支持

如果在使用 GitHub Actions 过程中遇到问题：
1. 检查 GitHub Actions 的官方文档
2. 查看构建日志中的错误信息
3. 确认仓库配置和权限设置
4. 在 GitHub Issues 中报告问题
