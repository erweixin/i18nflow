# React + Kiwi-Intl + Rspack Demo

`@i18nflow/kiwi` 完整示例 - 展示零配置的可视化 i18n 调试体验。

## 🚀 快速体验

**在线试用（推荐）：**

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/erweixin/i18nflow/tree/main/playground/react-kiwi-rspack?file=src/App.tsx)

**本地运行：**

```bash
pnpm install && pnpm dev
```

访问 http://localhost:3010，按住 `Ctrl/Cmd + Shift` 点击任意文案即可编辑。

## ✨ 核心特性

- 🎯 **零配置** - 无需手动 Proxy，无需添加 Provider，开箱即用
- ✏️ **可视化编辑** - 点击页面文案直接编辑，实时预览
- 🤖 **AI 翻译** - 自动生成多个候选译文
- ⚡ **热更新** - 修改即时生效，无需刷新
- 🚫 **生产零开销** - 编译时自动移除所有调试代码

## 📦 一步配置

在 Rspack 配置中添加插件（**仅开发环境**）：

```javascript
// rspack.config.js
const { KiwiRspackPlugin } = require('@i18nflow/kiwi/plugin-rspack');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  plugins: [
    // 🔥 仅开发环境加载插件
    isDev &&
      new KiwiRspackPlugin({
        i18nIdentifier: 'I18N', // 你的 I18N 对象名
        localeDir: 'src/locales', // 语言文件目录
        locales: ['zh-CN', 'en-US'], // 支持的语言
      }),
  ].filter(Boolean),
};
```

**完成！** 插件会自动：

- ✅ 检测并包装你的 I18N 对象
- ✅ 注入可视化调试 UI
- ✅ 启用 HMR 和开发服务器

> 💡 **重要：** 通过 `isDev &&` 控制插件加载，生产环境不会包含任何调试代码。

## 🎯 如何调试

按住 `Ctrl/Cmd + Shift` 点击任意文案 → 编辑 → 保存 → 即时生效！

**调试功能包括：**

- ✏️ 编辑所有语言的翻译
- 🤖 一键 AI 翻译（自动生成候选译文）
- 🔍 查看 key 路径和文件位置
- ⚡ 修改实时生效，无需刷新

## 🔧 工作原理

<details>
<summary>开发环境 vs 生产环境</summary>

**开发环境：**

```typescript
I18N.app.title
// ↓ 自动包装为带标记的 React 元素
<span data-i18n-key="app.title">应用标题</span>
```

- 插件自动检测 `KiwiIntl.init()` 并添加 Proxy 包装
- 自动注入调试 UI（无需手动添加 Provider）
- 自动启用开发服务器中间件和 HMR

**生产环境：**

```typescript
I18N.app.title;
// → "应用标题" (纯字符串)
```

- 所有调试代码被完全移除
- 零额外开销

</details>

## ⚙️ 环境变量

- `NODE_ENV` - 自动检测开发/生产环境
- `OPENROUTER_API_KEY` - （可选）配置后可使用 AI 翻译功能

---

**技术栈：** React 18 · Kiwi-Intl · Rspack · TypeScript  
**文档：** [主项目](../../README.md) · [完整文档](../../doc/README.md) · [Auto Proxy 原理](../../packages/kiwi/AUTO_PROXY.md)  
**License:** MIT
