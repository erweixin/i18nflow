# @i18nflow/react-i18next

完整的 react-i18next 可视化调试解决方案。

## 特性

- ✨ **运行时 Proxy** - 自动为翻译内容添加 `data-i18n-key` 标记
- 🔧 **编译时转换** - Babel 插件自动识别 `t()` 调用和 `<Trans>` 组件
- 🎯 **可视化调试** - 按住快捷键点击翻译内容即可编辑
- 🚀 **即时生效** - 修改后自动写入文件并触发 HMR
- 🌍 **多框架支持** - 支持 Next.js、Vite 等主流框架

## 安装

```bash
pnpm add -D @i18nflow/react-i18next
```

## 快速开始

### Next.js

```typescript
// next.config.js
const { ReactI18nextNextPlugin } = require('@i18nflow/react-i18next/plugin-next');

module.exports = {
  // ... 其他配置
  webpack: (config, { dev }) => {
    if (dev) {
      config.plugins.push(
        new ReactI18nextNextPlugin({
          localeDir: 'src/i18n/locales',
          locales: ['zh-CN', 'en-US'],
        })
      );
    }
    return config;
  },
};
```

### Vite

```typescript
// vite.config.ts
import { ReactI18nextVitePlugin } from '@i18nflow/react-i18next/plugin-vite';

export default defineConfig({
  plugins: [
    ReactI18nextVitePlugin({
      localeDir: 'src/i18n/locales',
      locales: ['zh-CN', 'en-US'],
    }),
  ],
});
```

### 在应用中使用

#### 方式 1：自闭合标签（推荐 - 可在服务端组件中使用）

```tsx
import { I18nDebugProvider } from '@i18nflow/react-i18next';

// Next.js App Router - 保持服务端组件
export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        {/* 不需要包裹 children，使用自闭合标签 */}
        <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
```

#### 方式 2：包裹 children（兼容旧版）

```tsx
'use client'; // 需要添加 'use client' 指令

import { I18nDebugProvider } from '@i18nflow/react-i18next';

function App() {
  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      {/* 你的应用 */}
    </I18nDebugProvider>
  );
}
```

## 工作原理

1. **编译时**：Babel 插件识别 `t()` 调用和 `<Trans>` 组件，提取翻译 key
2. **运行时**：Proxy 包装 i18next 实例，为翻译内容添加 `data-i18n-key` 属性
3. **交互时**：按住快捷键（Ctrl/Cmd）点击翻译内容，打开编辑弹窗
4. **更新时**：修改保存后，自动写入翻译文件并触发 HMR

## License

MIT
