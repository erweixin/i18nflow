# 🚀 快速开始指南

欢迎使用 i18nflow monorepo！本指南将帮助你快速上手。

## 📋 前置要求

- Node.js >= 18.0.0
- pnpm >= 9.0.0

## 🛠️ 安装

### 1. 安装 pnpm（如果还没有）

```bash
npm install -g pnpm
```

### 2. 安装项目依赖

```bash
pnpm install
```

这会安装所有包的依赖，包括：

- 根目录的开发工具（Turbo, Changesets, Prettier）
- 所有 packages 下的包
- 所有 demo 项目

## 📦 项目结构

```
i18nflow/
├── packages/              # 核心包和插件
│   ├── core/             # 核心抽象层
│   └── ...               # 其他包（待添加）
├── playground/                 # 示例项目
│   └── react-kiwi-rspack/
├── .changeset/           # Changesets 配置
├── pnpm-workspace.yaml   # pnpm workspace 配置
├── turbo.json            # Turborepo 配置
└── package.json          # 根 package.json
```

## 🎯 常用命令

### 开发模式

```bash
# 启动所有包的开发模式（会监听文件变化）
pnpm dev

# 只启动 playground 项目
cd playground/react-kiwi-rspack
pnpm dev
```

### 构建

```bash
# 构建所有包（Turborepo 会自动处理依赖顺序和缓存）
pnpm build

# 构建特定的包
pnpm --filter @i18nflow/core build
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @i18nflow/core test
```

### 代码质量

```bash
# Lint 所有包
pnpm lint

# 格式化代码
pnpm format
```

### 清理

```bash
# 清理所有构建产物
pnpm clean
```

## 📝 添加新包

### 1. 创建包目录

```bash
mkdir -p packages/my-new-package/src
cd packages/my-new-package
```

### 2. 创建 package.json

```json
{
  "name": "@i18nflow/my-new-package",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 3. 创建 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 4. 创建源代码

```typescript
// src/index.ts
export const hello = () => {
  console.log('Hello from my-new-package!');
};
```

### 5. 安装依赖并构建

```bash
# 回到根目录
cd ../..

# 安装依赖
pnpm install

# 构建新包
pnpm --filter @i18nflow/my-new-package build
```

## 🔄 版本管理与发布

### 1. 添加变更记录

当你修改了某个包后：

```bash
pnpm changeset
```

按照提示：

1. 选择修改的包
2. 选择版本类型（major/minor/patch）
3. 输入变更描述

### 2. 版本升级

准备发布时：

```bash
pnpm version-packages
```

这会：

- 更新所有相关包的版本号
- 生成 CHANGELOG.md
- 删除已应用的 changeset

### 3. 发布到 npm

```bash
pnpm release
```

这会构建所有包并发布到 npm。

## 📚 Turborepo 特性

### 增量构建

Turborepo 会缓存构建结果，只重新构建变更的包：

```bash
pnpm build  # 首次构建
# 修改某个文件
pnpm build  # 只构建变更的包，其他使用缓存
```

### 并行执行

Turborepo 会自动并行执行任务：

```bash
pnpm test  # 所有包的测试并行运行
```

### 查看任务依赖图

```bash
npx turbo run build --graph
```

这会生成一个可视化的依赖图。

## 🔗 包之间的依赖

### 添加本地依赖

```bash
# 在某个包中添加对另一个包的依赖
cd packages/plugin-webpack
pnpm add @i18nflow/core@workspace:*
```

`workspace:*` 表示使用 workspace 中的版本。

### 示例

```json
// packages/plugin-webpack/package.json
{
  "dependencies": {
    "@i18nflow/core": "workspace:*"
  }
}
```

## 🐛 调试技巧

### 1. 检查 workspace 链接

```bash
pnpm list --depth 0
```

### 2. 清理并重新安装

```bash
# 删除所有 node_modules
pnpm clean

# 重新安装
pnpm install
```

### 3. 查看 Turborepo 缓存

```bash
# 清理 Turborepo 缓存
rm -rf .turbo

# 强制重新构建（忽略缓存）
pnpm build --force
```

## 📖 更多资源

- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [Turborepo 文档](https://turbo.build/repo/docs)
- [Changesets 文档](https://github.com/changesets/changesets)

## 💡 最佳实践

1. **提交前检查**: 运行 `pnpm build && pnpm test && pnpm lint`
2. **使用 workspace 协议**: 本地依赖使用 `workspace:*`
3. **及时添加 changeset**: 修改后立即运行 `pnpm changeset`
4. **保持依赖更新**: 定期运行 `pnpm update -r`
5. **利用缓存**: 让 Turborepo 的缓存帮你提速

## 🆘 常见问题

### Q: pnpm install 失败？

A: 确保 Node.js >= 18，pnpm >= 9

### Q: 构建失败？

A: 检查包之间的依赖顺序，Turborepo 会自动处理

### Q: 找不到类型定义？

A: 运行 `pnpm build` 生成 .d.ts 文件

### Q: demo 启动失败？

A: 先构建依赖的包：`pnpm --filter @i18nflow/core build`

---

开始享受 i18nflow 的开发吧！🎉
