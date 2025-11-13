# 📚 i18nflow 文档中心

欢迎来到 i18nflow 项目的文档中心！这里包含了所有关于项目开发、使用、发布和架构的详细文档。

## 📖 文档目录

### 🚀 快速开始

- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
  - 安装和基本配置
  - 第一个 i18n 项目
  - 常见问题解答

### 📦 发布指南

- [RELEASE.md](./RELEASE.md) - 完整发布流程
  - 版本管理
  - 发布清单
  - 发布流程详解
- [QUICK_RELEASE.md](./QUICK_RELEASE.md) - 快速发布指南
  - 简化的发布步骤
  - 快速命令参考
- [PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md) - NPM 发布指南
  - 包发布流程
  - 版本号管理
  - 发布注意事项

### 🏗️ 架构文档

- [PACKAGES_STRUCTURE_V2.md](./PACKAGES_STRUCTURE_V2.md) - 包结构 v2
  - 项目架构设计
  - 包之间的依赖关系
  - 设计原则
- [PACKAGES_CREATED.md](./PACKAGES_CREATED.md) - 已创建的包
  - 包列表和说明
  - 功能特性
  - 使用示例

- [PROXY_IMPLEMENTATION.md](./PROXY_IMPLEMENTATION.md) - Proxy 实现细节
  - Runtime Proxy 原理
  - 自动包装机制
  - 调试功能实现

### 🎮 Playground 使用

- [PLAYGROUND_USAGE.md](./PLAYGROUND_USAGE.md) - Playground 使用指南
  - 示例项目说明
  - 如何运行示例
  - 功能演示

### 👨‍💻 开发指南

- [DEV_GUIDE.md](./DEV_GUIDE.md) - 开发者指南
  - 开发环境设置
  - 代码规范
  - 调试技巧
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
  - 如何贡献代码
  - Pull Request 流程
  - 代码审查标准

## 📦 核心包文档

### @i18nflow/kiwi

位于 `packages/kiwi/`

- [README.md](../packages/kiwi/README.md) - 包介绍和 API 文档
- [AUTO_PROXY.md](../packages/kiwi/AUTO_PROXY.md) - 自动 Proxy 包装功能
- [TESTING.md](../packages/kiwi/TESTING.md) - 测试文档
- [Runtime Proxy 测试](../packages/kiwi/src/runtime/__tests__/README.md)
- [Babel Plugin 测试](../packages/kiwi/src/transform/__tests__/README.md)

**核心功能：**

- ✨ 自动 Proxy 包装（零侵入）
- 🎯 Babel 插件转换
- 🔍 开发调试支持
- 🧪 完整测试覆盖（97 个测试用例）

### @i18nflow/core

位于 `packages/core/`

- [README.md](../packages/core/README.md) - 核心类型和接口定义

### @i18nflow/shared

位于 `packages/shared/`

- [README.md](../packages/shared/README.md) - 共享工具和类型

### @i18nflow/ui-react

位于 `packages/ui-react/`

- [README.md](../packages/ui-react/README.md) - React UI 组件

## 🎯 按场景查找文档

### 我是新用户，想快速上手

1. 阅读 [QUICK_START.md](./QUICK_START.md)
2. 查看 [PLAYGROUND_USAGE.md](./PLAYGROUND_USAGE.md)
3. 参考 [packages/kiwi/README.md](../packages/kiwi/README.md)

### 我想了解自动 Proxy 包装功能

1. 阅读 [packages/kiwi/AUTO_PROXY.md](../packages/kiwi/AUTO_PROXY.md)
2. 查看 [PROXY_IMPLEMENTATION.md](./PROXY_IMPLEMENTATION.md)
3. 运行 playground 示例体验

### 我想参与开发

1. 阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)
2. 查看 [DEV_GUIDE.md](./DEV_GUIDE.md)
3. 了解 [PACKAGES_STRUCTURE_V2.md](./PACKAGES_STRUCTURE_V2.md)

### 我想发布新版本

1. 阅读 [QUICK_RELEASE.md](./QUICK_RELEASE.md) - 快速流程
2. 参考 [RELEASE.md](./RELEASE.md) - 完整流程
3. 查看 [PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md) - 发布细节

### 我想了解测试

1. 查看 [packages/kiwi/TESTING.md](../packages/kiwi/TESTING.md)
2. 阅读各个测试 README：
   - [Runtime Proxy 测试](../packages/kiwi/src/runtime/__tests__/README.md)
   - [Babel Plugin 测试](../packages/kiwi/src/transform/__tests__/README.md)
   - [Auto Proxy Plugin 测试](../packages/kiwi/src/transform/__tests__/auto-proxy-plugin.test.ts)

## 🔧 技术栈

- **语言**: TypeScript
- **构建工具**: tsup, turbo
- **包管理**: pnpm (monorepo)
- **测试框架**: Vitest
- **Babel**: AST 转换
- **React**: UI 组件
- **Rspack**: 构建插件

## 📊 项目统计

- **包数量**: 4 个核心包
- **测试用例**: 97+ 个
- **测试通过率**: 100%
- **文档文件**: 20+ 个

## 🌟 核心特性

### 1. 自动 Proxy 包装 ✨

零侵入的自动包装功能，无需手动调用 `createKiwiProxy`：

```typescript
// 只需要这样写
export default KiwiIntl.init('zh-CN', {...});

// 自动转换为
export default createKiwiProxy(KiwiIntl.init('zh-CN', {...}));
```

### 2. 智能 Babel 转换 🎯

根据上下文自动处理 I18N 调用：

- 原生 HTML 标签 → 添加 `String()` 转换
- 自定义组件 → 保留 React 元素传递 `data-i18n-key`
- JSX 子元素 → 直接调用转换，变量引用保留

### 3. 开发调试支持 🔍

- 自动添加 `data-i18n-key` 属性
- 可视化翻译文本来源
- 热更新支持
- Dev Server 中间件

### 4. 完整测试覆盖 🧪

- 97 个测试用例
- 100% 通过率
- 覆盖所有核心功能和边缘情况

## 🔗 相关链接

- [项目主页](../readme.md)
- [GitHub Issues](https://github.com/i18nflow/i18nflow/issues)
- [变更日志](../packages/kiwi/CHANGELOG.md)
- [许可证](../LICENSE)

## 📝 文档维护

### 添加新文档

1. 在 `doc/` 目录下创建新的 `.md` 文件
2. 在本文档中添加链接和说明
3. 确保文档格式一致

### 更新现有文档

1. 直接编辑对应的 `.md` 文件
2. 更新文档修改日期
3. 如有重大变更，更新本索引

### 文档规范

- 使用 Markdown 格式
- 添加清晰的标题和目录
- 包含代码示例
- 提供实际用例
- 保持简洁明了

## 🤝 贡献

欢迎贡献文档！如果你发现：

- 文档有错误或不清楚的地方
- 想要添加新的示例或用例
- 有改进建议

请参考 [CONTRIBUTING.md](./CONTRIBUTING.md) 提交 PR。

## 📄 许可证

本项目采用 [MIT License](../LICENSE)。

---

**最后更新**: 2025-11-13
**维护者**: i18nflow 团队
