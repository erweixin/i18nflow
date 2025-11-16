# React + Rspack + react-i18next 完整示例

这是一个使用 Rspack 打包的 React 项目，展示了 react-i18next 的所有主要功能和使用场景。

## 🚀 特性

- ⚡️ **Rspack** - 超快的 Rust 打包工具
- ⚛️ **React 18** - 最新版本的 React
- 🌍 **react-i18next** - React 国际化解决方案
- 📦 **TypeScript** - 类型安全
- 🎨 **现代化 UI** - 美观的示例界面

## 📦 项目结构

```
rspack-react-i18next/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── components/         # 组件目录
│   │   ├── LanguageSwitcher.tsx  # 语言切换器
│   │   ├── BasicExample.tsx      # 基础用法示例
│   │   ├── AdvancedExample.tsx   # 高级用法示例
│   │   ├── ApiExample.tsx        # API 示例
│   │   └── FormExample.tsx       # 表单示例
│   ├── i18n/              # 国际化配置
│   │   ├── index.ts       # i18n 初始化配置
│   │   └── locales/       # 翻译文件
│   │       ├── zh-CN/     # 中文翻译
│   │       └── en-US/     # 英文翻译
│   ├── styles/
│   │   └── app.css        # 全局样式
│   ├── App.tsx            # 主应用组件
│   └── index.tsx          # 应用入口
├── package.json           # 依赖配置
├── tsconfig.json          # TypeScript 配置
└── rspack.config.js       # Rspack 配置
```

## 🎯 功能示例

### 1. 基础用法（Basic Usage）

- ✅ 简单翻译
- ✅ 插值（变量替换）
- ✅ 复数处理（Pluralization）
- ✅ 嵌套翻译
- ✅ 上下文变体（Context）

### 2. 高级用法（Advanced Usage）

- ✅ Props 传递翻译
- ✅ Array.map 返回组件
- ✅ 对象变量翻译
- ✅ 数组变量翻译
- ✅ 条件渲染
- ✅ 复杂表格嵌套
- ✅ 模板字符串
- ✅ 动态组件

### 3. API 示例（API Examples）

- ✅ useTranslation Hook
- ✅ Trans 组件（处理 HTML 和组件）
- ✅ 复数处理
- ✅ 插值
- ✅ 上下文
- ✅ 嵌套翻译
- ✅ i18n 对象方法
- ✅ Key 前缀（keyPrefix）
- ✅ Translation 组件（Render Props）
- ✅ Ready 状态检查

### 4. 表单示例（Form Example）

- ✅ 表单字段翻译
- ✅ Placeholder 翻译
- ✅ 错误消息翻译
- ✅ 验证消息翻译
- ✅ 下拉选项翻译
- ✅ 动态表单验证

## 🛠️ 安装和运行

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器（默认端口：3020）
pnpm dev

# 或
npm run dev
```

访问 http://localhost:3020

### 构建生产版本

```bash
# 构建项目
pnpm build

# 或
npm run build
```

构建产物将生成在 `dist/` 目录。

### 预览生产版本

```bash
# 预览构建后的项目
pnpm preview

# 或
npm run preview
```

## 📚 核心代码示例

### 1. i18n 配置 (src/i18n/index.ts)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': enUS,
      'zh-CN': zhCN,
    },
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });
```

### 2. 使用 useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation('namespace');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting', { name: 'John' })}</p>
      <button onClick={() => i18n.changeLanguage('en-US')}>
        切换语言
      </button>
    </div>
  );
}
```

### 3. 使用 Trans 组件

```typescript
import { Trans } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <Trans
      i18nKey="welcome"
      t={t}
      values={{ name: 'John', count: 5 }}
      components={{
        strong: <strong />,
        link: <a href="#" />
      }}
    />
  );
}
```

### 4. Props 传递翻译

```typescript
function Card({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Parent() {
  const { t } = useTranslation();

  return (
    <Card
      title={t('card.title')}
      description={t('card.description')}
    />
  );
}
```

### 5. Array.map 返回组件

```typescript
function ProductList() {
  const { t } = useTranslation();
  const products = ['laptop', 'phone', 'tablet'];

  return (
    <div>
      {products.map(product => (
        <div key={product}>
          <h4>{t(`products.${product}.name`)}</h4>
          <p>{t(`products.${product}.description`)}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🌍 翻译文件示例

### 中文 (zh-CN/common.json)

```json
{
  "appTitle": "React-i18next + Rspack 完整示例",
  "welcome": "欢迎",
  "hello": "你好，{{name}}！",
  "item_zero": "没有项目",
  "item_one": "1 个项目",
  "item_other": "{{count}} 个项目"
}
```

### 英文 (en-US/common.json)

```json
{
  "appTitle": "React-i18next + Rspack Complete Example",
  "welcome": "Welcome",
  "hello": "Hello, {{name}}!",
  "item_zero": "No items",
  "item_one": "1 item",
  "item_other": "{{count}} items"
}
```

## 📖 主要功能说明

### 插值（Interpolation）

在翻译文本中插入变量：

```typescript
{
  t('greeting', { name: 'John', age: 25 });
}
// 翻译: "Hello, {{name}}! You are {{age}} years old."
// 结果: "Hello, John! You are 25 years old."
```

### 复数处理（Pluralization）

根据数量自动选择正确的复数形式：

```typescript
{
  t('item', { count: 0 });
} // "没有项目"
{
  t('item', { count: 1 });
} // "1 个项目"
{
  t('item', { count: 5 });
} // "5 个项目"
```

### 上下文（Context）

根据上下文选择不同的翻译：

```typescript
{
  t('friend', { context: 'male' });
} // "男性朋友"
{
  t('friend', { context: 'female' });
} // "女性朋友"
```

### 嵌套翻译

在翻译中引用其他翻译键：

```json
{
  "welcome": "欢迎",
  "fullMessage": "$t(welcome)回来，{{name}}！"
}
```

### Trans 组件

处理包含 HTML 标签和 React 组件的复杂翻译：

```typescript
<Trans
  i18nKey="complexMessage"
  components={{
    strong: <strong />,
    link: <a href="#" />
  }}
/>
```

## 🔧 配置说明

### Rspack 配置

项目使用 Rspack 作为打包工具，配置文件为 `rspack.config.js`：

- 使用 SWC 进行快速编译
- 支持 TypeScript 和 JSX
- 支持 CSS Modules
- 开发模式下启用 Hot Module Replacement
- 生产模式下启用代码压缩和分割

### TypeScript 配置

使用严格的 TypeScript 配置，确保类型安全：

- 启用严格模式
- 支持 JSX
- 路径别名：`@/` -> `src/`

## 🎨 样式说明

项目使用原生 CSS，不依赖任何 CSS 框架，展示纯粹的 react-i18next 功能。所有样式都是内联样式或通过 `app.css` 定义的全局样式。

## 📝 开发建议

1. **命名空间（Namespace）**：将翻译文件按功能模块分组，便于管理
2. **Key 命名**：使用清晰、有层次的 key 命名，如 `userForm.errors.required`
3. **插值变量**：使用有意义的变量名，如 `{{username}}` 而不是 `{{val1}}`
4. **复数形式**：始终提供 `zero`、`one` 和 `other` 三种形式
5. **上下文使用**：合理使用上下文避免创建过多重复的翻译键

## 🔗 相关链接

- [react-i18next 官方文档](https://react.i18next.com/)
- [i18next 官方文档](https://www.i18next.com/)
- [Rspack 官方网站](https://www.rspack.dev/)
- [React 官方文档](https://react.dev/)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**：本项目仅作为学习和参考使用，展示了 react-i18next 在实际项目中的各种使用场景。
