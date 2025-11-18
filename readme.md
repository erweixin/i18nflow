# i18nflow - 通用化 I18N 可视化调试工具

[English](./readme.en.md) | 简体中文

> 📚 **[查看完整文档中心](./doc/README.md)** | 📦 **[快速开始](./doc/QUICK_START.md)** | 🚀 **[自动 Proxy 包装](./packages/kiwi/AUTO_PROXY.md)** | 📄 **[License](./LICENSE)**

## 📋 项目概述

**核心理念：** 让翻译工作像水流一样顺畅 (flow)，实现真正的 WYSIWYG（所见即所得）开发体验。

一个通用化的 I18N 可视化调试工具，支持主流 i18n 库和构建工具，提供 **点击编辑** + **AI 翻译** + **即时生效** 的极致开发体验。

## 📺 视频演示

https://github.com/user-attachments/assets/8cffe7cf-1e7c-4990-a588-351618e73268

## 🚀 在线体验

立即在浏览器中体验完整功能，无需安装：

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/erweixin/i18nflow/tree/main/playground/react-kiwi-rspack?file=src/App.tsx)

> 💡 **使用说明：**
>
> 1. 等待项目启动完成
> 2. 按住 `Ctrl/Cmd + Shift` 并点击页面上的任意文案
> 3. 在弹出的编辑框中体验 AI 翻译和实时编辑功能

---

## ✨ 核心功能

1. **🎯 可视化编辑** - 按住 Ctrl/Cmd+Shift 点击页面文案，即可编辑翻译
2. **🤖 AI 翻译** - 内置 OpenRouter AI 翻译，输入中文自动生成多个英文候选词
3. **⚡ 即时生效** - 修改后自动写入源文件并触发热更新，无需刷新页面
4. **🔧 零侵入** - 仅在开发环境启用，生产代码零影响
5. **📦 插件化** - 支持多种构建工具和 i18n 库的插件化集成

---

## 🎯 支持矩阵

### I18N 库支持

| 库                | 状态 | 包名                      | 说明               |
| ----------------- | ---- | ------------------------- | ------------------ |
| **kiwi-intl**     | ✅   | `@i18nflow/kiwi`          | 完整支持，生产可用 |
| **react-i18next** | 🚧   | `@i18nflow/react-i18next` | 基础实现，测试中   |
| **react-intl**    | 📋   | `@i18nflow/react-intl`    | 计划中             |
| **i18next**       | 📋   | `@i18nflow/i18next`       | 计划中             |
| **vue-i18n**      | 📋   | `@i18nflow/vue-i18n`      | 计划中             |

### 构建工具支持

| 工具          | 状态 | 说明                         |
| ------------- | ---- | ---------------------------- |
| **Rspack**    | ✅   | 完整支持，推荐使用           |
| **Vite**      | ✅   | 完整支持，推荐使用           |
| **Webpack**   | ✅   | 通过 Babel Plugin 支持       |
| **Next.js**   | 🚧   | 支持中（基于 react-i18next） |
| **Turbopack** | 📋   | 计划中                       |

### UI 框架支持

| 框架        | 状态 | 包名                   | 说明       |
| ----------- | ---- | ---------------------- | ---------- |
| **React**   | ✅   | `@i18nflow/ui-react`   | 完整支持   |
| **Vanilla** | ✅   | `@i18nflow/ui-vanilla` | 无框架支持 |
| **Vue**     | 📋   | `@i18nflow/ui-vue`     | 计划中     |
| **Svelte**  | 📋   | `@i18nflow/ui-svelte`  | 计划中     |

**图例说明：**

- ✅ **已实现** - 生产可用
- 🚧 **开发中** - 基础功能可用，持续完善中
- 📋 **计划中** - 设计完成，待开发

---

## 🏗️ 技术架构

### 核心原理

i18nflow 采用 **"编译时注入 + 运行时 Proxy"** 的双重策略，实现零侵入的可视化调试：

#### 1. 编译时：Babel 插件注入标记

```typescript
// 开发者的代码
<div>{I18N.app.title}</div>

// ⬇️ Babel 编译后自动注入 data-i18n-key
<div data-i18n-key="app.title">{String(I18N.app.title)}</div>
```

#### 2. 运行时：Proxy 包装返回 React 元素

```typescript
// 开发环境：I18N.app.title 返回带标记的 React 元素
I18N.app.title;
// → <span data-i18n-key="app.title">应用标题</span>

// 生产环境：直接返回字符串
I18N.app.title;
// → "应用标题"
```

#### 3. 为什么需要双重策略？

| 场景                | 编译时处理 | 运行时处理 | 解决方案   |
| ------------------- | ---------- | ---------- | ---------- |
| 直接引用 `I18N.xxx` | ✅         | ✅         | 双保险     |
| Props 多层传递      | ❌         | ✅         | 运行时兜底 |
| 对象/数组存储       | ❌         | ✅         | 运行时兜底 |
| 条件表达式/动态引用 | ⚠️         | ✅         | 运行时兜底 |

**核心优势：**

- **编译时优化** - 直接转字符串，减少 DOM 嵌套
- **运行时兜底** - 覆盖所有编译时无法处理的场景
- **零性能损失** - React 自然渲染，无额外开销
- **完全透明** - 开发者无需关心实现细节

---

### 整体架构

```
┌──────────────────────────────────────────────┐
│          用户应用 (React/Vue/...)             │
└──────────────────┬───────────────────────────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
┌────▼─────┐              ┌──────▼──────┐
│ 编译时层  │              │  运行时层     │
│ Babel   │◄─────────────►│  Proxy      │
│ 插件     │   双重策略     │  + UI       │
└────┬─────┘              └──────┬──────┘
     │                            │
     └─────────────┬──────────────┘
                   │
         ┌─────────▼──────────┐
         │  Dev Server 中间件  │
         │  API + AI 翻译      │
         └────────────────────┘
```

### 核心模块划分

#### 1. **i18nflow-core** - 核心抽象层

```typescript
// 编译时核心接口
interface ITransformAdapter {
  name: string;
  // 检测是否是 i18n 调用
  isI18nExpression(node: ASTNode): boolean;
  // 提取 i18n key
  extractI18nKey(node: ASTNode): string | null;
  // 转换表达式（注入标记）
  transformExpression(node: ASTNode, key: string): ASTNode;
  // 获取配置（翻译文件路径、语言等）
  getConfig(): AdapterConfig;
}

// 运行时核心接口（支持两种标记策略）
interface IRuntimeAdapter {
  name: string;

  // 策略 1: Proxy 包装策略（推荐，用于自定义 i18n 对象）
  // 返回值自带 data-i18n-key 标记，无需编译时处理
  enableProxyWrapper?: boolean;
  wrapI18nObject?: (target: any) => any;

  // 策略 2: 纯编译时策略（用于第三方库）
  // 依赖编译时注入标记，运行时只负责读写
  readTranslation(key: string, locale: string): Promise<string>;
  updateTranslation(key: string, locale: string, value: string): Promise<boolean>;

  // 通用方法
  getSupportedLocales(): string[];
  getCurrentLocale(): string;
}

// 文件操作接口
interface IFileAdapter {
  name: string; // 'typescript' | 'json' | 'yaml' | 'po'
  // 读取文件
  read(filePath: string, key: string): Promise<Record<string, string>>;
  // 更新文件
  update(filePath: string, key: string, values: Record<string, string>): Promise<boolean>;
  // 支持的文件扩展名
  getSupportedExtensions(): string[];
}
```

#### 2. **i18nflow-adapters-\*** - 适配器插件

```
i18nflow-adapters-transform/
  ├── react-intl.ts       # FormattedMessage、useIntl 等
  ├── react-i18next.ts    # Trans、useTranslation 等
  ├── i18next.ts          # t() 函数
  ├── vue-i18n.ts         # $t()、<i18n> 等
  └── custom-proxy.ts     # 自定义 I18N 对象（当前实现，Proxy 策略）

i18nflow-adapters-runtime/
  ├── react-intl.ts
  ├── react-i18next.ts
  ├── i18next.ts
  ├── vue-i18n.ts
  └── custom-proxy.ts     # 包含 Proxy 包装逻辑

@i18nflow/
├── core               # 核心类型和接口定义
├── shared             # 共享工具（AST、文件操作等）
├── kiwi               # Kiwi-Intl 适配器（✅ 生产可用）
│   ├── transform/     # Babel 插件 + 自动 Proxy 注入
│   ├── runtime/       # Proxy 包装 + React 元素创建
│   ├── server/        # 开发服务器中间件 + AI 翻译
│   └── plugin/        # 构建工具插件（Rspack/Vite）
├── react-i18next      # react-i18next 适配器（🚧 开发中）
├── ui-react           # React UI 组件（调试面板）
└── ui-vanilla         # 无框架 UI 组件
```

---

## 📦 快速开始

### 安装

```bash
# 针对使用了 kiwi-intl 的项目
pnpm add -D @i18nflow/kiwi
```

### 配置（以 Rspack + Kiwi-Intl 为例）

```typescript
// rspack.config.js
import { KiwiRspackPlugin } from '@i18nflow/kiwi/plugin-rspack';

export default {
  plugins: [
    new KiwiRspackPlugin({
      enabled: process.env.NODE_ENV === 'development',
      i18nIdentifier: 'I18N', // I18N 对象名称
      localeDir: 'src/locales', // 语言文件目录
      locales: ['zh-CN', 'en-US'], // 支持的语言
      autoProxy: true, // 自动 Proxy 包装
    }),
  ],
};
```

**使用步骤：**

1. 按住 `Ctrl/Cmd + Shift` 并点击页面上的文案
2. 在弹出的编辑框中修改翻译（自动触发 AI 翻译）
3. 点击保存，自动写入源文件并触发热更新

---

## 🎨 详细文档

- 📚 **[完整文档中心](./doc/README.md)** - 查看所有文档
- 📦 **[快速开始指南](./doc/QUICK_START.md)** - 5分钟上手
- 🚀 **[自动 Proxy 包装](./packages/kiwi/AUTO_PROXY.md)** - 零侵入配置
- 🔧 **[开发指南](./doc/DEV_GUIDE.md)** - 参与贡献
- 📝 **[发布指南](./doc/PUBLISH_GUIDE.md)** - 发布流程

---

## 🤝 贡献

欢迎贡献代码、提出建议或报告问题！

## 📄 License

MIT © [erweixin](https://github.com/erweixin)
