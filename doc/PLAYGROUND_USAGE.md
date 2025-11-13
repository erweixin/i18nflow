# Playground 使用说明

## 🎯 概述

`playground/react-kiwi-rspack` 是 `@i18nflow/kiwi` 的完整示例项目，展示了如何在实际项目中使用我们的调试方案。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd playground/react-kiwi-rspack
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3000 启动。

### 3. 体验调试功能

1. **按住** `Ctrl + Shift` (Mac: `Cmd + Shift`)
2. **点击** 页面上的任意文案
3. **编辑** 在弹出的 Modal 中修改翻译
4. **保存** 翻译将自动更新源文件并刷新页面

## 📦 架构说明

### 客户端（浏览器）

```typescript
// src/locales/I18N.ts
import { createKiwiProxy } from '@i18nflow/kiwi'; // 客户端包

const I18N = createKiwiProxy(kiwiIntl);
```

**作用**：

- 开发环境：将字符串包装为 `<span data-i18n-key="xxx">value</span>`
- 生产环境：直接返回字符串
- 支持所有字符串操作（toString、valueOf 等）

### 服务端（Rspack DevServer）

```javascript
// rspack.config.js
const { KiwiRspackPlugin } = require('@i18nflow/kiwi/plugin-rspack'); // 服务端包

new KiwiRspackPlugin({
  enabled: isDev,
  i18nIdentifier: 'I18N',
  localeDir: 'src/locales',
  locales: ['zh-CN', 'en-US'],
});
```

**功能**：

1. **Babel Transform**: 注入 `data-i18n-key` 和 `String()` 包装
2. **Dev Server 中间件**: 提供 API 接口（读取/更新翻译）
3. **HMR 集成**: 更新翻译后触发热更新

## 🔧 核心流程

### 开发模式工作流程

```
1. 用户代码
   <div>{I18N.components.title}</div>

2. Runtime Proxy 包装
   → <span data-i18n-key="components.title">标题</span>

3. Babel Transform（可选，增强）
   <div data-i18n-key="components.title">
     {String(I18N.components.title)}
   </div>

4. 最终 DOM
   <div data-i18n-key="components.title">标题</div>

5. 用户点击（按住 Ctrl+Shift）
   → 查找 data-i18n-key
   → 打开编辑 Modal

6. 用户保存
   → POST /api/i18n/update
   → 更新源文件 (src/locales/zh-CN/xxx.ts)
   → 触发 HMR
   → 页面刷新
```

## 📁 文件说明

### 关键文件

- **`rspack.config.js`**: Rspack 配置，集成 KiwiRspackPlugin
- **`src/locales/I18N.ts`**: I18N 实例，使用 createKiwiProxy 包装
- **`src/App.tsx`**: 应用入口，包裹 I18nDebugProvider
- **`src/locales/zh-CN/*.ts`**: 中文翻译文件
- **`src/locales/en-US/*.ts`**: 英文翻译文件

### 翻译文件格式

```typescript
// src/locales/zh-CN/app.ts
export default {
  title: 'Kiwi-Intl Demo',
  description: '这是一个演示项目',
};

// src/locales/en-US/app.ts
export default {
  title: 'Kiwi-Intl Demo',
  description: 'This is a demo project',
};
```

## 🎨 示例场景

### 1. 基础文本

```tsx
<h1>{I18N.app.title}</h1>
```

### 2. 输入框 placeholder

```tsx
<Input placeholder={I18N.form.username} />
```

### 3. Template 插值

```tsx
<p>{I18N.template(I18N.welcome.greeting, { name: '张三' })}</p>
```

### 4. 数组渲染

```tsx
{
  items.map(item => <div key={item.id}>{item.label}</div>);
}
```

### 5. 条件渲染

```tsx
{
  isSuccess ? I18N.message.success : I18N.message.error;
}
```

## 🐛 调试 API

### 读取翻译

```typescript
const values = await fetch('/api/i18n/read?key=components.title').then(r => r.json());
// { success: true, key: "components.title", values: { "zh-CN": "标题", "en-US": "Title" } }
```

### 更新翻译

```typescript
await fetch('/api/i18n/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'components.title',
    values: { 'zh-CN': '新标题', 'en-US': 'New Title' },
  }),
});
// { success: true, results: { ... } }
```

### 健康检查

```bash
curl http://localhost:3000/api/i18n/health
```

## 🔍 开发技巧

### 1. 查看生成的 data-i18n-key

打开浏览器开发者工具，查看 DOM：

```html
<div data-i18n-key="components.title">标题</div>
```

### 2. 测试生产构建

```bash
pnpm build
pnpm preview
```

生产环境下，不会有 `data-i18n-key`，也不会有 Proxy 包装。

### 3. 检查 HMR

1. 启动开发服务器
2. 修改翻译文件 `src/locales/zh-CN/app.ts`
3. 观察页面是否自动更新

### 4. 检查 Proxy 行为

```tsx
// 在组件中打印
console.log(I18N.app.title); // <span ...>标题</span>
console.log(String(I18N.app.title)); // "标题"
console.log(`Title: ${I18N.app.title}`); // "Title: 标题"
```

## ⚙️ 自定义配置

### 修改语言目录

```javascript
// rspack.config.js
new KiwiRspackPlugin({
  localeDir: 'src/i18n', // 默认: 'src/locales'
  locales: ['zh', 'en'], // 默认: ['zh-CN', 'en-US']
  fileExtension: '.js', // 默认: '.ts'
});
```

### 修改 i18n 对象名称

```javascript
new KiwiRspackPlugin({
  i18nIdentifier: 'T', // 默认: 'I18N'
});
```

```typescript
// src/locales/T.ts
const T = createKiwiProxy(kiwiIntl);
export default T;
```

### 禁用调试功能

```javascript
new KiwiRspackPlugin({
  enabled: false, // 禁用所有调试功能
});
```

## 📊 性能对比

### 开发环境

- Bundle 大小: ~630KB（包含 Ant Design + 调试组件）
- Runtime 开销: 每次访问字符串创建 Proxy + React 元素
- **影响**: 可接受，调试体验优先

### 生产环境

- Bundle 大小: ~590KB（不包含调试组件，自动 tree-shaking）
- Runtime 开销: **零** - 直接返回字符串
- **影响**: 无

## 🎓 学习资源

- **`packages/kiwi/README.md`**: 完整的 API 文档
- **`PROXY_IMPLEMENTATION.md`**: Runtime Proxy 实现原理
- **`PACKAGES_CREATED.md`**: 包结构说明

## 🚨 常见问题

### Q: 点击文案没有反应？

A: 检查：

1. 是否按住了 Ctrl+Shift (Mac: Cmd+Shift)？
2. 是否在开发模式下运行？
3. 是否包裹了 `I18nDebugProvider`？
4. 浏览器控制台是否有错误？

### Q: 编辑后没有保存成功？

A: 检查：

1. Dev Server 是否正常运行？
2. 翻译文件路径是否正确？
3. 是否有文件写入权限？
4. 查看 Dev Server 日志

### Q: HMR 没有生效？

A: 检查：

1. Rspack 的 HMR 是否启用？
2. `sockWrite` 是否正确配置？
3. 浏览器是否支持 WebSocket？

### Q: 类型推导不正确？

A: 确保：

1. 已安装 `@types/react`
2. 已构建 `@i18nflow/kiwi` 包
3. TypeScript 版本 >= 5.0

## 🎉 总结

这个 Playground 展示了 `@i18nflow/kiwi` 的完整功能：

- ✅ 无侵入式的调试体验
- ✅ 开发环境可视化编辑
- ✅ 生产环境零性能开销
- ✅ 完整的 TypeScript 支持
- ✅ 与 Rspack HMR 无缝集成

立即启动 `pnpm dev` 体验吧！
