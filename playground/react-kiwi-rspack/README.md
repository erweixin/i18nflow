# Kiwi-Intl + Rspack Demo

这是一个展示 Kiwi-Intl 国际化解决方案的完整示例项目，使用 Rspack 作为构建工具。

## 📦 技术栈

- **React 18.3** - UI 框架
- **TypeScript 5.3** - 类型安全
- **Kiwi-Intl 1.2** - 国际化解决方案
- **Rspack 1.1** - 高性能 Rust 构建工具（最新版本）

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📚 功能特性

本项目展示了 Kiwi-Intl 的多种 API 用法：

### 1. 基础用法
直接访问 I18N 对象的属性获取本地化文案。

```typescript
I18N.app.title
I18N.welcome.message
```

### 2. 模板插值 (Template API)
使用 `I18N.template()` 方法进行变量插值。

```typescript
I18N.template(I18N.welcome.greeting, { name: '张三' })
// 输出: "你好，张三！" (zh-CN)
// 输出: "Hello, 张三!" (en-US)
```

### 3. 复数处理
根据数量显示不同的文案形式。

```typescript
// 语言包中定义
messageCount_zero: '没有消息'
messageCount_one: '1 条消息'
messageCount_other: '{count} 条消息'

// 使用时根据数量选择
getPluralMessage(count)
```

### 4. 格式化
结合浏览器原生 Intl API 进行数字、货币、日期格式化。

```typescript
// 货币格式化
new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'CNY'
}).format(1234.56)

// 日期格式化
new Intl.DateTimeFormat(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}).format(new Date())
```

### 5. 表单验证
在表单场景中使用国际化进行验证消息提示。

```typescript
I18N.template(I18N.form.validation.required, {
  field: I18N.form.username
})
// 输出: "用户名 不能为空" (zh-CN)
// 输出: "Username is required" (en-US)
```

## 🌍 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 英文 (en-US)

## 📂 项目结构

```
react-kiwi-rspack/
├── public/
│   └── index.html              # HTML 模板
├── src/
│   ├── components/             # React 组件
│   │   ├── BasicExample.tsx    # 基础用法示例
│   │   ├── TemplateExample.tsx # 模板插值示例
│   │   ├── PluralExample.tsx   # 复数处理示例
│   │   ├── FormatExample.tsx   # 格式化示例
│   │   └── FormExample.tsx     # 表单综合示例
│   ├── locales/                # 国际化配置
│   │   ├── zh-CN/
│   │   │   └── index.ts        # 中文语言包
│   │   ├── en-US/
│   │   │   └── index.ts        # 英文语言包
│   │   └── I18N.ts             # Kiwi-Intl 初始化
│   ├── styles/
│   │   └── app.css             # 全局样式
│   ├── App.tsx                 # 根组件
│   └── index.tsx               # 应用入口
├── package.json
├── tsconfig.json
├── rspack.config.js            # Rspack 配置
└── README.md
```

## 🔑 核心 API

### I18N 对象
```typescript
// 直接访问
I18N.app.title

// 切换语言
I18N.setLang('en-US')

// 获取当前语言
I18N.getLang()
```

### Template 方法
```typescript
I18N.template(text: string, variables: Record<string, any>): string
```

将变量插入到包含 `{variableName}` 占位符的文本模板中。

**参数:**
- `text`: 包含占位符的模板文本
- `variables`: 变量对象

**返回值:**
- 替换变量后的完整文本

**示例:**
```typescript
const greeting = I18N.template(
  I18N.welcome.greeting,
  { name: 'Alice' }
)
// zh-CN: "你好，Alice！"
// en-US: "Hello, Alice!"
```

## 💡 最佳实践

1. **类型安全**: 使用 TypeScript 获得完整的类型提示
2. **语言包组织**: 按功能模块组织语言包结构
3. **变量命名**: 使用有意义的变量名，保持中英文语言包一致
4. **复数处理**: 使用 `_zero`、`_one`、`_other` 后缀处理不同复数形式
5. **格式化**: 结合 Intl API 实现完全本地化的格式显示

## 📖 相关资源

- [Kiwi-Intl GitHub](https://github.com/alibaba/kiwi)
- [Rspack 文档](https://www.rspack.dev/)
- [React 文档](https://react.dev/)

## 📄 许可证

MIT

