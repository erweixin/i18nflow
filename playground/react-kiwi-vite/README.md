# React + Kiwi-Intl + Vite Demo

使用纯 Kiwi-Intl 的完整示例项目。

## 功能特性

✅ **基础用法**: 展示最基本的国际化文案使用方式  
✅ **模板插值**: 使用 `template` 方法进行变量替换  
✅ **复数处理**: 支持 zero/one/other 复数形式  
✅ **Props 传递**: 展示在复杂场景中传递 I18N 值  
✅ **表单综合**: 实际表单场景中的国际化应用  
✅ **TypeScript**: 完整的类型支持

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3020

### 构建生产版本

```bash
pnpm build
```

## 核心配置

### 1. I18N 初始化 (`src/locales/I18N.ts`)

```typescript
import KiwiIntl from 'kiwi-intl';
import zhCN from './zh-CN';
import enUS from './en-US';

const kiwiIntl = KiwiIntl.init<typeof zhCN>('zh-CN', {
  'zh-CN': zhCN,
  'en-US': enUS,
});

export default kiwiIntl;
```

### 2. App 组件 (`src/App.tsx`)

```tsx
import I18N from './locales/I18N';

function App() {
  return (
    <div>
      <h1>{I18N.app.title}</h1>
    </div>
  );
}
```

## 使用方式

### 基础用法

```tsx
// 直接使用
<div>{I18N.components.title}</div>
```

### Template 插值

```tsx
<div>{I18N.template(I18N.common.welcome, { name: 'User' })}</div>
```

### 复数处理

```tsx
// 语言包中定义
export default {
  messageCount_zero: '没有消息',
  messageCount_one: '1 条消息',
  messageCount_other: '{count} 条消息',
};

// 使用
const getPluralMessage = (count: number) => {
  if (count === 0) return I18N.messageCount_zero;
  if (count === 1) return I18N.messageCount_one;
  return I18N.template(I18N.messageCount_other, { count });
};
```

### 在属性中使用

```tsx
<Input placeholder={I18N.common.placeholder} />
```

### 切换语言

```tsx
I18N.setLang('en-US');
```

## 文件结构

```
src/
├── locales/
│   ├── zh-CN/         # 中文翻译文件
│   │   └── index.ts
│   ├── en-US/         # 英文翻译文件
│   │   └── index.ts
│   └── I18N.ts        # I18N 实例
├── components/        # 示例组件
│   ├── BasicExample.tsx
│   ├── TemplateExample.tsx
│   ├── PluralExample.tsx
│   ├── PropsExample.tsx
│   └── FormExample.tsx
├── styles/
│   └── app.css
├── App.tsx           # 主应用
└── index.tsx         # 入口文件
```

## 技术栈

- **React 18**: UI 框架
- **Kiwi-Intl**: i18n 解决方案
- **Vite 5**: 构建工具
- **TypeScript**: 类型支持

## 示例说明

### 1. 基础用法示例 (BasicExample)

展示最基本的国际化文案使用方式，直接访问 I18N 对象的属性。

### 2. 模板插值示例 (TemplateExample)

展示 Kiwi-Intl 的 `template` API 用法，包括：

- 单个变量插值
- 多个变量插值
- 复杂变量插值

### 3. 复数处理示例 (PluralExample)

展示 Kiwi-Intl 的复数处理能力，包括：

- 基础计数
- 复数形式处理 (zero/one/other)

### 4. Props 传递示例 (PropsExample)

展示通过 props 传递 I18N 值的各种复杂场景：

- 直接传递 I18N 值
- 数组中的 I18N 值
- 对象中的 I18N 值
- 动态生成的数据
- 嵌套组件传递

### 5. 表单综合示例 (FormExample)

展示在实际表单场景中使用 Kiwi-Intl 的综合应用：

- 表单标签和占位符
- 验证消息（使用 template 动态插入字段名）
- 通知消息
- 按钮文本

## 注意事项

1. **类型安全**: 完全支持 TypeScript 类型推导
2. **简单直接**: 不包含额外的调试功能，专注于 Kiwi-Intl 核心功能
3. **性能优化**: Vite 提供快速的开发体验和优化的生产构建

## License

MIT
