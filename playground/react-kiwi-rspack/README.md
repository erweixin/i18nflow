# React + Kiwi-Intl + Rspack Demo

使用 `@i18nflow/kiwi` 的完整示例项目。

## 功能特性

✅ **Runtime Proxy**: 开发环境自动添加 `data-i18n-key`，生产环境零开销  
✅ **可视化编辑**: 按住 Ctrl+Shift (Mac: Cmd+Shift) 点击文案即可编辑  
✅ **热更新**: 编辑翻译后自动更新文件并触发 HMR  
✅ **TypeScript**: 完整的类型支持  
✅ **Babel Transform**: 自动处理 JSX 中的 i18n 调用

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

## 核心配置

### 1. Rspack 插件配置 (`rspack.config.js`)

```javascript
const { KiwiRspackPlugin } = require('@i18nflow/kiwi/plugin-rspack');

module.exports = {
  plugins: [
    isDev &&
      new KiwiRspackPlugin({
        enabled: true,
        i18nIdentifier: 'I18N',
        localeDir: 'src/locales',
        locales: ['zh-CN', 'en-US'],
        fileExtension: '.ts',
      }),
  ].filter(Boolean),
};
```

### 2. I18N 初始化 (`src/locales/I18N.ts`)

```typescript
import KiwiIntl from 'kiwi-intl';
import { createKiwiProxy } from '@i18nflow/kiwi';

const kiwiIntl = KiwiIntl.init('zh-CN', {
  'zh-CN': zhCN,
  'en-US': enUS,
});

// 🔥 使用 Proxy 包装
const I18N = createKiwiProxy(kiwiIntl);

export default I18N;
```

### 3. App 组件 (`src/App.tsx`)

```tsx
import { I18nDebugProvider } from '@i18nflow/kiwi';

function App() {
  return (
    <>
      <div>{I18N.app.title}</div>

      {/* I18nDebugProvider 不需要包裹内容，使用自闭合标签 */}
      <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'} />
    </>
  );
}
```

**推荐：** 使用自闭合标签，代码更简洁，调试功能独立。

或者使用包裹方式（兼容）：

```tsx
function App() {
  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      <div>{I18N.app.title}</div>
    </I18nDebugProvider>
  );
}
```

## 使用方式

### 基础用法

```tsx
// 直接使用
<div>{I18N.components.title}</div>

// 开发环境渲染：<span data-i18n-key="components.title">标题</span>
// 生产环境渲染：标题
```

### Template 插值

```tsx
<div>{I18N.template(I18N.common.welcome, { name: 'User' })}</div>
```

### 在属性中使用

```tsx
<Input placeholder={I18N.common.placeholder} />
```

### 字符串操作

```tsx
const message = `Hello, ${I18N.user.name}`;
```

## 调试功能

### 编辑翻译

1. 启动开发服务器 `pnpm dev`
2. 按住 **Ctrl + Shift** (Mac: **Cmd + Shift**)
3. 点击页面上的文案
4. 在弹出的 Modal 中编辑翻译
5. 保存后自动更新源文件并刷新页面

### API 端点

开发模式下可用的 API：

- `GET /api/i18n/health` - 健康检查
- `GET /api/i18n/read?key=xxx` - 读取翻译
- `POST /api/i18n/update` - 更新翻译
- `POST /api/i18n/translate` - AI 翻译（待实现）

## 文件结构

```
src/
├── locales/
│   ├── zh-CN/         # 中文翻译文件
│   │   ├── app.ts
│   │   ├── button.ts
│   │   ├── features.ts
│   │   └── welcome.ts
│   ├── en-US/         # 英文翻译文件
│   │   └── ...
│   ├── I18N.ts        # I18N 实例（使用 Proxy 包装）
│   └── index.ts
├── components/        # 示例组件
├── styles/
└── App.tsx           # 主应用（添加 I18nDebugProvider）
```

## 技术栈

- **React 18**: UI 框架
- **Kiwi-Intl**: i18n 解决方案
- **@i18nflow/kiwi**: 调试增强
- **Rspack 1.x**: 构建工具
- **TypeScript**: 类型支持
- **Ant Design**: UI 组件库

## 环境变量

- `NODE_ENV=development`: 启用调试功能
- `NODE_ENV=production`: 禁用调试功能，返回纯字符串

## 注意事项

1. **仅开发环境**: 调试功能仅在开发环境启用
2. **性能**: 生产环境无额外开销（直接返回字符串）
3. **类型安全**: 完全支持 TypeScript 类型推导
4. **HMR**: 支持热模块替换，编辑翻译无需刷新页面

## License

MIT
