# @i18nflow/kiwi

Complete Kiwi-Intl solution for i18nflow。

## 功能

提供 Kiwi-Intl 的完整开发调试方案：

- **Babel Transform**: 自动注入 `data-i18n-key` 属性和 `String()` 包装
- **Runtime Proxy**: 开发环境自动包装 i18n 对象，返回带调试信息的 React 元素
- **File Adapter**: TypeScript 翻译文件读写
- **Dev Server Middleware**: API 接口（读取/更新翻译）
- **Rspack Plugin**: 集成所有功能的 Rspack 插件
- **UI Components**: 可视化调试 UI（Provider、Modal、Hooks）

## 安装

```bash
pnpm add -D @i18nflow/kiwi
pnpm add kiwi-intl
```

## 使用

### 1. 配置 Rspack 插件

```javascript
// rspack.config.js
const { KiwiRspackPlugin } = require('@i18nflow/kiwi/plugin-rspack');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  plugins: [
    // 🔥 仅在开发环境加载插件
    isDev &&
      new KiwiRspackPlugin({
        localeDir: 'src/lang',
        locales: ['zh-CN', 'en-US'],
        i18nIdentifier: 'I18N',
      }),
  ].filter(Boolean),
};
```

### 2. 初始化 Kiwi 并使用 Proxy

```typescript
// src/locales/I18N.ts
import { KiwiIntl } from 'kiwi-intl';
import { createKiwiProxy } from '@i18nflow/kiwi';

import zhCN from './zh-CN';
import enUS from './en-US';

const kiwiIntl = KiwiIntl.init('zh-CN', {
  'zh-CN': zhCN,
  'en-US': enUS,
});

// 使用 Proxy 包装，开发环境自动添加 data-i18n-key
const I18N = createKiwiProxy(kiwiIntl);

export default I18N;
```

### 3. 在应用中使用 Provider

#### 方式 1：自闭合标签（推荐）

```tsx
import { I18nDebugProvider } from '@i18nflow/kiwi';
import I18N from './locales/I18N';

function App() {
  return (
    <>
      {/* 开发环境：自动渲染为 <span data-i18n-key="components.title">标题</span> */}
      {/* 生产环境：直接渲染为字符串 */}
      <div>{I18N.components.title}</div>

      {/* 支持模板 */}
      <div>{I18N.template(I18N.common.welcome, { name: 'User' })}</div>

      {/* 在任何需要字符串的地方都可以使用 */}
      <Input placeholder={I18N.common.inputPlaceholder} />

      {/* I18nDebugProvider 不需要包裹内容，使用自闭合标签 */}
      <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'} />
    </>
  );
}
```

**优势：** 代码更简洁，调试功能独立，不影响组件树结构。

#### 方式 2：包裹 children（兼容）

```tsx
function App() {
  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      <div>{I18N.components.title}</div>
      {/* ... */}
    </I18nDebugProvider>
  );
}
```

### 4. 调试方式

1. 按住 `Ctrl + Shift`（Windows/Linux）或 `Cmd + Shift`（Mac）
2. 点击页面上的文案
3. 在弹出的 Modal 中编辑翻译
4. 保存后自动更新源文件并刷新页面

## 核心特性

### Runtime Proxy 原理

开发环境下，`createKiwiProxy` 会将所有字符串值包装为 React 元素：

```tsx
// 开发环境
I18N.components.title;
// 返回: <span data-i18n-key="components.title">标题</span>

// 生产环境
I18N.components.title;
// 返回: "标题"
```

包装后的 React 元素支持所有字符串操作：

- `toString()` - 返回原始字符串
- `valueOf()` - 返回原始字符串
- `Symbol.toPrimitive` - 返回原始字符串

这意味着你可以在任何需要字符串的地方使用它：

```tsx
// JSX 中直接使用
<div>{I18N.title}</div>

// 作为属性
<Input placeholder={I18N.placeholder} />

// 字符串拼接
const message = `Hello, ${I18N.name}`;

// 条件判断
if (I18N.status === 'active') { ... }
```

### Babel Transform

在编译时自动处理，确保类型安全：

```tsx
// 源代码
<div>{I18N.components.title}</div>

// 编译后（开发环境）
<div data-i18n-key="components.title">
  {String(I18N.components.title)}
</div>

// 编译后（生产环境）
<div>{I18N.components.title}</div>
```

## API

### createKiwiProxy

```typescript
function createKiwiProxy<T extends object>(
  i18nObject: T,
  options?: {
    debug?: boolean;
    i18nIdentifier?: string;
  }
): T;
```

包装 i18n 对象，添加调试功能。

**参数**:

- `i18nObject`: 原始 i18n 对象（通常是 KiwiIntl 实例）
- `options.debug`: 是否启用调试模式（默认：`process.env.NODE_ENV === 'development'`）
- `options.i18nIdentifier`: i18n 对象名称（默认：'I18N'）

### KiwiRspackPlugin

```typescript
interface KiwiRspackPluginOptions {
  /** i18n 对象名称（默认 'I18N'） */
  i18nIdentifier?: string;
  /** 语言目录（默认 'src/lang'） */
  localeDir?: string;
  /** 支持的语言列表（默认 ['zh-CN', 'en-US']） */
  locales?: string[];
  /** 文件扩展名（默认 '.ts'） */
  fileExtension?: string;
  /** 是否自动包装 kiwiIntl（默认 true） */
  autoProxy?: boolean;
  /** 是否自动注入 I18nDebugProvider（默认 true） */
  autoInjectDebugUI?: boolean;
}
```

> 💡 **提示：** 通过在配置中使用 `isDev &&` 来控制插件是否加载

### createKiwiBabelPlugin

```typescript
import { createKiwiBabelPlugin } from '@i18nflow/kiwi';

// 在 Babel 配置中使用
{
  plugins: [
    createKiwiBabelPlugin({
      i18nIdentifier: 'I18N',
    }),
  ];
}
```

### createKiwiMiddleware

```typescript
import { createKiwiMiddleware } from '@i18nflow/kiwi';

// 手动创建中间件
const middleware = createKiwiMiddleware({
  localeDir: 'src/lang',
  locales: ['zh-CN', 'en-US'],
});
```

## 目录结构

```
your-project/
├── src/
│   ├── lang/
│   │   ├── zh-CN/
│   │   │   ├── common.ts
│   │   │   └── components.ts
│   │   └── en-US/
│   │       ├── common.ts
│   │       └── components.ts
│   ├── locales/
│   │   └── I18N.ts          # 使用 createKiwiProxy 包装
│   └── App.tsx
└── rspack.config.js
```

## 翻译文件格式

```typescript
// src/lang/zh-CN/components.ts
export default {
  title: '标题',
  subtitle: '副标题',
  button: {
    submit: '提交',
    cancel: '取消',
  },
};
```

## 环境变量

- `NODE_ENV=development`: 启用调试功能，显示 data-i18n-key
- `NODE_ENV=production`: 禁用调试功能，返回纯字符串

## 注意事项

1. **React 依赖**: 需要 React >= 16.8.0
2. **类型安全**: 完全支持 TypeScript 类型推导
3. **性能**: 生产环境无额外开销（直接返回字符串）
4. **兼容性**: 与 Kiwi-Intl 所有 API 完全兼容

## License

MIT
