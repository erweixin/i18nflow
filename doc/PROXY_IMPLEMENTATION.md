# Runtime Proxy 实现说明

## 🎯 核心功能

`@i18nflow/kiwi` 的 Runtime Proxy 是整个调试方案的核心，它实现了：

1. **开发环境**：自动将 i18n 字符串包装为带 `data-i18n-key` 的 React 元素
2. **生产环境**：直接返回原始字符串，零性能开销
3. **完全透明**：包装后的元素支持所有字符串操作

## 📝 实现原理

### 1. 双层 Proxy 设计

```typescript
createKiwiProxy(i18nObject)
  → createI18NProxy(target, keyPath)
    → createI18NReactElement(value, key)
      → Proxy(ReactElement)
```

### 2. createI18NReactElement

**作用**：将字符串值包装为 React 元素 + Proxy

```typescript
// 开发环境
createI18NReactElement('标题', 'components.title');
// 返回: <span data-i18n-key="components.title">标题</span>
// 但支持: String(result) → "标题"

// 生产环境
createI18NReactElement('标题', 'components.title');
// 直接返回: "标题"
```

**关键实现**：

```typescript
const element = React.createElement('span', { 'data-i18n-key': key }, value);

return new Proxy(element, {
  get(target, prop) {
    if (prop === 'toString') return () => value;
    if (prop === 'valueOf') return () => value;
    if (prop === Symbol.toPrimitive) return () => value;
    return (target as any)[prop];
  },
});
```

### 3. createI18NProxy

**作用**：递归代理 i18n 对象，追踪属性路径

```typescript
I18N.components.title
  → get("components") → createI18NProxy(value, ["components"])
    → get("title") → createI18NReactElement(value, "components.title")
```

**关键逻辑**：

- 字符串值 → 包装为 React 元素
- 对象值 → 递归代理
- 函数值 → 直接返回绑定
- 特殊处理 `template` 方法

### 4. template 方法处理

```typescript
I18N.template(I18N.common.welcome, { name: 'User' });
```

**实现**：

1. 如果参数是 React 元素，提取 `data-i18n-key` 和 `children`
2. 调用原始 `template` 方法
3. 将结果包装为新的 React 元素

## 🌟 使用示例

### 基本使用

```typescript
// src/locales/I18N.ts
import { KiwiIntl } from 'kiwi-intl';
import { createKiwiProxy } from '@i18nflow/kiwi';

const kiwiIntl = KiwiIntl.init('zh-CN', {
  'zh-CN': require('./zh-CN'),
  'en-US': require('./en-US'),
});

// 🔥 使用 Proxy 包装
const I18N = createKiwiProxy(kiwiIntl);

export default I18N;
```

### 在 JSX 中使用

```tsx
// 开发环境渲染结果
<div>{I18N.components.title}</div>
// ↓
<div>
  <span data-i18n-key="components.title">标题</span>
</div>

// 生产环境渲染结果
<div>{I18N.components.title}</div>
// ↓
<div>标题</div>
```

### 在属性中使用

```tsx
<Input placeholder={I18N.common.placeholder} />
// 开发环境: <Input placeholder={<span...>} />
// 但 Input 组件接收到的是字符串（通过 toString）
```

### 字符串操作

```tsx
// 所有字符串操作都能正常工作
const message = `Hello, ${I18N.user.name}`; // ✅
const upper = I18N.title.toUpperCase(); // ✅ （注意：需要先 toString）
const trimmed = String(I18N.text).trim(); // ✅
```

### Template 使用

```tsx
// 基本 template
I18N.template(I18N.common.welcome, { name: 'User' })
// 开发环境: <span data-i18n-key="common.welcome">Welcome, User</span>
// 生产环境: "Welcome, User"

// 嵌套使用
<div>{I18N.template(I18N.common.hello, { name: I18N.user.name })}</div>
```

## 🎨 调试功能集成

### 配合 I18nDebugProvider

```tsx
import { I18nDebugProvider } from '@i18nflow/kiwi';

function App() {
  return (
    <I18nDebugProvider>
      {/* data-i18n-key 用于点击定位 */}
      <div>{I18N.components.title}</div>
    </I18nDebugProvider>
  );
}
```

### 调试流程

1. **Proxy 注入 key**：`I18N.components.title` → `<span data-i18n-key="components.title">...</span>`
2. **Provider 监听点击**：按住 Ctrl+Shift 点击文案
3. **查找 data-i18n-key**：从点击元素向上查找属性
4. **打开编辑 Modal**：显示 `components.title` 的翻译内容
5. **更新并刷新**：保存后更新文件并触发 HMR

## 🔧 技术细节

### 为什么用 Proxy？

1. **透明性**：不改变原对象结构
2. **递归性**：可以追踪嵌套属性路径
3. **灵活性**：可以拦截所有属性访问
4. **性能**：仅在访问时才创建包装

### 为什么返回 React 元素？

1. **保留上下文**：在 DOM 中保留 `data-i18n-key`
2. **React 兼容**：可以直接在 JSX 中使用
3. **样式无影响**：`span` 默认 inline，不影响布局
4. **调试友好**：可以在 DevTools 中看到 key

### 为什么需要 toString/valueOf？

1. **字符串操作**：支持模板字符串、拼接等
2. **类型转换**：在需要字符串的地方自动转换
3. **兼容性**：与原生字符串操作保持一致
4. **第三方库**：确保与其他库的兼容性

### 环境判断

```typescript
const isDev = process.env.NODE_ENV === 'development';
```

- 开发环境：启用 Proxy 和 React 元素包装
- 生产环境：直接返回字符串，零开销
- 构建工具会在打包时替换 `process.env.NODE_ENV`

## ⚡ 性能考虑

### 开发环境

- Proxy 创建：仅在首次访问时创建
- React 元素创建：每次访问字符串值时创建
- 内存占用：包装后的对象会占用额外内存
- **影响**：开发环境可接受，调试体验优先

### 生产环境

- 直接返回字符串：`if (!isDev) return value;`
- 无 Proxy 开销
- 无 React 元素创建
- **影响**：零性能开销

### 优化建议

1. 仅在需要时启用：`createKiwiProxy(obj, { debug: isDev })`
2. 避免频繁访问：缓存常用值
3. 使用 memo：对包含 i18n 的组件使用 `React.memo`

## 🚀 与 Babel Transform 配合

### Babel 负责

- 静态分析代码
- 注入 `String()` 包装
- 添加 `data-i18n-key` 到父元素
- 处理变量引用追踪

### Proxy 负责

- 运行时包装
- 动态生成 React 元素
- 实现字符串转换
- 处理嵌套对象

### 协同工作

```tsx
// 用户代码
<div>{I18N.components.title}</div>

// Babel 转换
<div data-i18n-key="components.title">
  {String(I18N.components.title)}
</div>

// Proxy 返回
<div data-i18n-key="components.title">
  <span data-i18n-key="components.title">标题</span>
</div>

// 最终渲染
<div data-i18n-key="components.title">
  标题
</div>
```

## 📚 总结

Runtime Proxy 是 `@i18nflow/kiwi` 的核心创新：

✅ **透明包装**：开发环境添加调试信息，生产环境零开销  
✅ **完全兼容**：支持所有字符串操作和 React 使用方式  
✅ **自动化**：无需手动添加 key，无需改变使用习惯  
✅ **类型安全**：保留原始类型，TypeScript 友好  
✅ **调试友好**：与 Provider 配合实现可视化编辑

这个设计让开发者可以无感知地使用 i18n，同时获得强大的调试能力！
