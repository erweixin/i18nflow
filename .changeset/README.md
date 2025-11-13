# Changesets

你好，欢迎使用 Changesets！这是一个用于管理 monorepo 版本和变更日志的工具。

## 工作流程

### 1. 添加变更记录

当你对某个包做了修改后，运行：

```bash
pnpm changeset
```

然后按提示：

1. 选择你修改了哪些包
2. 选择版本更新类型（major / minor / patch）
3. 输入变更描述

这会在 `.changeset` 目录下创建一个新的 Markdown 文件。

### 2. 版本升级

当准备发布时，运行：

```bash
pnpm version-packages
```

这会：

- 更新所有相关包的版本号
- 生成/更新 CHANGELOG.md
- 删除已应用的 changeset 文件

### 3. 发布到 npm

```bash
pnpm release
```

这会：

- 构建所有包
- 发布到 npm registry

## 版本类型说明

- **major**: 破坏性变更（1.0.0 -> 2.0.0）
- **minor**: 新增功能（1.0.0 -> 1.1.0）
- **patch**: Bug 修复（1.0.0 -> 1.0.1）

## 更多信息

查看 [Changesets 文档](https://github.com/changesets/changesets)
