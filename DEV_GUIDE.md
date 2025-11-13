# 开发指南

## 🚀 开发 Playground 及其依赖包

在 monorepo 中同时开发 playground 项目及其所有依赖包，有以下几种方式：

### 方法 1：使用 Turborepo Filter（推荐）

```bash
# 启动 react-kiwi-rspack 及其所有依赖包的 dev 模式
turbo run dev --filter=react-kiwi-rspack-demo...
```

**说明**：

- `--filter=react-kiwi-rspack-demo...`：三个点 `...` 表示包含该包及其所有依赖
- 这会自动启动：
  - `@i18nflow/core` (如有 dev 脚本)
  - `@i18nflow/shared` (如有 dev 脚本)
  - `@i18nflow/ui-react` (如有 dev 脚本)
  - `@i18nflow/kiwi` (如有 dev 脚本)
  - `react-kiwi-rspack-demo`

### 方法 2：使用 pnpm Filter

```bash
# 并行启动所有相关包的 dev 模式
pnpm --filter "@i18nflow/*" --filter "react-kiwi-rspack-demo" --parallel dev
```

### 方法 3：使用便捷脚本（已配置）

```bash
# 根目录运行
pnpm dev:playground
```

这个脚本等同于方法 1，已在根 `package.json` 中配置。

## 📦 包的 dev 脚本

为了让依赖包在开发模式下自动重新构建，需要在各个包中配置 `dev` 脚本：

### @i18nflow/core

```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

### @i18nflow/shared

```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

### @i18nflow/ui-react

```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

### @i18nflow/kiwi

```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

## 🔄 工作流程

### 1. 启动开发环境

```bash
# 根目录
pnpm dev:playground
```

这会：

1. 启动所有依赖包的 watch 模式（`tsup --watch`）
2. 启动 playground 的开发服务器（`rspack dev`）
3. 当你修改任何依赖包的代码时，会自动重新构建
4. Playground 会自动热更新

### 2. 开发流程示例

假设你要修改 `@i18nflow/kiwi` 的 proxy 逻辑：

```bash
# 1. 启动开发环境
pnpm dev:playground

# 2. 修改代码
vim packages/kiwi/src/runtime/proxy.ts

# 3. 保存后，自动发生：
#    - tsup 检测到文件变化
#    - 重新构建 @i18nflow/kiwi
#    - Rspack 检测到依赖变化
#    - 触发 HMR，页面自动刷新

# 4. 在浏览器中查看效果
```

## 🛠️ 常用命令

### 开发单个包

```bash
# 只开发 core 包
pnpm --filter @i18nflow/core dev

# 只开发 kiwi 包
pnpm --filter @i18nflow/kiwi dev

# 只开发 playground
pnpm --filter react-kiwi-rspack-demo dev
```

### 开发多个包

```bash
# 开发所有 @i18nflow 包
pnpm --filter "@i18nflow/*" --parallel dev

# 开发 kiwi 和 playground
pnpm --filter @i18nflow/kiwi --filter react-kiwi-rspack-demo --parallel dev
```

### 构建相关

```bash
# 构建所有包
pnpm build

# 构建 playground 及其依赖
turbo run build --filter=react-kiwi-rspack-demo...

# 清理并重新构建
pnpm clean
pnpm build
```

### 调试相关

```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 格式化代码
pnpm format
```

## 📊 Filter 语法说明

Turborepo 的 filter 语法非常强大：

| 语法                 | 说明                   | 示例                                 |
| -------------------- | ---------------------- | ------------------------------------ |
| `--filter=pkg`       | 只运行指定包           | `--filter=@i18nflow/kiwi`            |
| `--filter=pkg...`    | 运行包及其所有依赖     | `--filter=react-kiwi-rspack-demo...` |
| `--filter=...pkg`    | 运行包及其所有依赖者   | `--filter=...@i18nflow/core`         |
| `--filter=...pkg...` | 运行包、其依赖和依赖者 | `--filter=...@i18nflow/kiwi...`      |
| `--filter=./path`    | 运行指定目录下的包     | `--filter=./packages/*`              |

## 🔍 查看依赖关系

```bash
# 查看包的依赖图
pnpm list --depth=1

# 查看特定包的依赖
pnpm list --filter=react-kiwi-rspack-demo --depth=1
```

## 💡 最佳实践

### 1. 始终从根目录运行命令

```bash
# ✅ 正确
cd /path/to/i18nflow
pnpm dev:playground

# ❌ 错误（会丢失 monorepo 的依赖管理）
cd /path/to/i18nflow/playground/react-kiwi-rspack
pnpm dev
```

### 2. 使用 watch 模式开发

所有包都应该配置 `dev` 脚本为 watch 模式：

```json
{
  "scripts": {
    "dev": "tsup --watch"
  }
}
```

### 3. 利用 Turborepo 缓存

```bash
# 首次构建会比较慢
pnpm build

# 再次构建会使用缓存，非常快
pnpm build
# ✅ cache hit
```

### 4. 清理缓存（当遇到奇怪问题时）

```bash
# 清理 Turborepo 缓存
rm -rf .turbo

# 清理所有构建产物
pnpm clean

# 清理并重新安装
pnpm clean
pnpm install
pnpm build
```

## 🐛 常见问题

### Q: 修改依赖包代码后，playground 没有更新？

A: 确保：

1. 依赖包的 `dev` 脚本配置为 watch 模式
2. 使用 `pnpm dev:playground` 而不是单独启动 playground
3. 检查是否有构建错误

### Q: 类型定义没有更新？

A:

```bash
# 重新构建所有包
pnpm build

# 或者单独构建某个包
pnpm --filter @i18nflow/kiwi build
```

### Q: HMR 不工作？

A:

1. 检查 Rspack 配置中的 `devServer.hot` 是否启用
2. 检查浏览器控制台是否有 WebSocket 连接错误
3. 尝试硬刷新页面（Cmd+Shift+R）

### Q: 依赖包的改动很慢才生效？

A:

- 使用 `tsup --watch` 而不是手动 build
- 确保没有运行多个 dev 进程冲突
- 检查文件监听限制（macOS/Linux）

## 📚 相关文档

- [Turborepo Filter 文档](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [pnpm Filter 文档](https://pnpm.io/filtering)
- [Tsup Watch 模式](https://tsup.egoist.dev/#watch-mode)
- [Rspack Dev Server](https://rspack.dev/config/dev-server)

## 🎯 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/erweixin/i18nflow.git
cd i18nflow

# 2. 安装依赖
pnpm install

# 3. 构建所有包
pnpm build

# 4. 启动开发环境
pnpm dev:playground

# 5. 访问 http://localhost:3000
```

现在你可以同时编辑依赖包和 playground，所有改动都会自动生效！🎉
