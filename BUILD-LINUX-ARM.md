# Linux ARM 版本构建指南

本文档说明如何为 ARM 架构的 Linux 系统构建专家抽取系统应用。

## 系统要求

### 在 Linux 系统上构建
- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / RHEL 8+
- **Node.js**: 18.x 或更高版本
- **npm**: 8.x 或更高版本
- **构建工具**: 
  - `build-essential` (Ubuntu/Debian)
  - `gcc-c++` (CentOS/RHEL)
  - `python3` 和 `make`

### 在 Windows/macOS 上交叉编译
- 需要 Docker 或 WSL2 (Windows)
- 或者使用 GitHub Actions 等 CI/CD 服务

## 安装依赖

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y build-essential python3 make
```

### CentOS/RHEL
```bash
sudo yum groupinstall -y "Development Tools"
sudo yum install -y python3 make
```

## 构建步骤

### 方法 1: 使用构建脚本（推荐）

1. **运行构建脚本**:
   ```bash
   node build-linux-arm-simple.js
   ```

2. **脚本会自动执行以下步骤**:
   - 检查构建环境
   - 清理之前的构建
   - 重新构建 sqlite3 模块
   - 构建 Linux ARM 版本
   - 显示构建结果

### 方法 2: 手动构建

1. **安装项目依赖**:
   ```bash
   npm install
   ```

2. **重新构建 sqlite3 模块**:
   ```bash
   npm rebuild sqlite3
   ```

3. **构建 Linux ARM 版本**:
   ```bash
   npm run build:linux-arm64
   ```

## 构建输出

构建完成后，输出文件位于 `dist/` 目录：

- **AppImage**: `专家抽取系统-1.0.0-arm64.AppImage`
- **Deb 包**: `专家抽取系统_1.0.0_arm64.deb`

## 支持的架构

- **armv7l**: 32位 ARM (ARMv7)
- **arm64**: 64位 ARM (ARMv8/AArch64)
- **x64**: 64位 x86

## 常见问题

### 1. sqlite3 构建失败
```bash
# 尝试使用 electron-rebuild
npx electron-rebuild

# 或者设置环境变量
export npm_config_arch=arm64
export npm_config_target=28.0.0
export npm_config_disturl=https://electronjs.org/headers
export npm_config_runtime=electron
npm rebuild sqlite3
```

### 2. 权限问题
```bash
# 确保有执行权限
chmod +x build-linux-arm-simple.js

# 如果遇到权限问题，使用 sudo
sudo npm rebuild sqlite3
```

### 3. 内存不足
```bash
# 增加 swap 空间或使用 swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 测试构建结果

### 在目标 ARM 设备上测试
1. 将构建的 AppImage 或 Deb 包传输到目标设备
2. 安装并运行应用
3. 验证数据库功能是否正常

### 使用 QEMU 模拟测试
```bash
# 安装 QEMU
sudo apt install qemu-user-static

# 运行 ARM 版本的 AppImage
qemu-aarch64-static ./专家抽取系统-1.0.0-arm64.AppImage
```

## 部署说明

### AppImage 部署
- AppImage 是自包含的可执行文件
- 在目标设备上直接运行即可
- 无需安装，支持便携使用

### Deb 包部署
```bash
# 安装 Deb 包
sudo dpkg -i 专家抽取系统_1.0.0_arm64.deb

# 如果有依赖问题，修复依赖
sudo apt-get install -f
```

## 注意事项

1. **架构匹配**: 确保构建的架构与目标设备匹配
2. **依赖库**: ARM 设备需要相应的系统库支持
3. **性能**: ARM 版本可能在性能上与 x86 版本有差异
4. **测试**: 建议在真实 ARM 设备上充分测试

## 联系支持

如果遇到构建问题，请：
1. 检查系统要求和依赖
2. 查看错误日志
3. 确认 Node.js 和 npm 版本
4. 尝试清理并重新安装依赖 