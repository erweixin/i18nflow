# Next.js + React-i18next 完整示例

这是一个完整的 Next.js 国际化示例项目，展示了如何使用 `react-i18next` 实现客户端和服务端渲染的国际化。

## 🎯 功能特性

✅ **服务端渲染 (SSR)**: 完整的服务端国际化支持，优化 SEO  
✅ **客户端渲染**: 交互式客户端组件，动态语言切换  
✅ **复杂参数传递**: 展示各种复杂场景下的参数插值  
✅ **表单国际化**: 包含 placeholder、验证消息等完整表单示例  
✅ **路由国际化**: URL 路径支持语言前缀 (`/zh-CN`, `/en-US`)  
✅ **TypeScript**: 完整的类型支持  
✅ **现代化 UI**: 美观的界面设计

## 📦 技术栈

- **Next.js 14**: React 全栈框架，支持 App Router
- **React 18**: UI 框架
- **react-i18next**: React 国际化解决方案
- **i18next**: 强大的国际化库
- **TypeScript**: 类型安全

## 🚀 快速开始

### 1. 安装依赖

```bash
cd playground/nextjs-react-i18next
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3030

### 3. 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 根页面（重定向）
│   ├── globals.css          # 全局样式
│   └── [lng]/               # 语言路由
│       ├── layout.tsx       # 语言布局
│       └── page.tsx         # 主页
├── components/              # React 组件
│   ├── LanguageSwitcher.tsx # 语言切换器（客户端）
│   ├── ClientExample.tsx    # 客户端示例
│   ├── ServerExample.tsx    # 服务端示例
│   ├── FormExample.tsx      # 表单示例
│   ├── AdvancedExample.tsx  # 高级示例（Props、对象、数组、map）
│   └── ApiExample.tsx       # API 示例（所有 react-i18next API）
├── i18n/                    # 国际化配置
│   ├── index.ts            # 服务端 i18n
│   ├── client.ts           # 客户端 i18n
│   ├── settings.ts         # 共享设置
│   └── locales/            # 翻译文件
│       ├── zh-CN/          # 中文翻译
│       │   ├── common.json
│       │   ├── form.json
│       │   ├── server.json
│       │   ├── advanced.json
│       │   └── api.json
│       └── en-US/          # 英文翻译
│           ├── common.json
│           ├── form.json
│           ├── server.json
│           ├── advanced.json
│           └── api.json
└── middleware.ts           # Next.js 中间件（语言检测）
```

## 🎨 示例说明

### 1. 服务端组件示例 (ServerExample)

**位置**: `src/components/ServerExample.tsx`

**特性**:

- ✅ 服务端数据获取
- ✅ 复杂参数插值（用户信息、时间、计数等）
- ✅ SEO 友好（内容在服务器渲染）
- ✅ 动态内容展示

**示例代码**:

```tsx
// 服务端组件
export default async function ServerExample({ lng }: { lng: string }) {
  const { t } = await useTranslation(lng, 'server');

  return (
    <div>
      <h2>{t('title')}</h2>
      <p>{t('dynamicContent.greeting', { name: 'John' })}</p>
      <p>
        {t('dynamicContent.complexMessage', {
          userName: 'John',
          date: new Date().toLocaleDateString(),
          count: 5,
        })}
      </p>
    </div>
  );
}
```

### 2. 客户端组件示例 (ClientExample)

**位置**: `src/components/ClientExample.tsx`

**特性**:

- ✅ 客户端交互（计数器、实时时间）
- ✅ 动态语言切换
- ✅ 状态管理
- ✅ 实时更新

**示例代码**:

```tsx
'use client';

export default function ClientExample({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, 'common');
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>{t('clientSideRendering')}</h2>
      <p>{t('lastUpdated', { date: new Date().toLocaleString() })}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

### 3. 表单综合示例 (FormExample)

**位置**: `src/components/FormExample.tsx`

**特性**:

- ✅ Input placeholder 国际化
- ✅ 表单验证消息国际化
- ✅ 复杂参数传递（最小值、最大值、字符计数等）
- ✅ 下拉选项国际化
- ✅ 多选框和复选框
- ✅ 动态验证提示

**示例代码**:

```tsx
<input
  type="text"
  placeholder={t('usernamePlaceholder')}
  // placeholder: "请输入您的用户名" / "Enter your username"
/>

<div>
  {t('usernameHint', { min: 3, max: 20 })}
  {/* "用户名长度必须在 3 到 20 个字符之间" */}
</div>

<div>
  {t('bioCount', { count: bio.length, max: 500 })}
  {/* "已输入 50 / 500 个字符" */}
</div>
```

### 4. 语言切换器 (LanguageSwitcher)

**位置**: `src/components/LanguageSwitcher.tsx`

**特性**:

- ✅ 客户端语言切换
- ✅ URL 路径更新
- ✅ 当前语言显示
- ✅ 按钮状态管理

### 5. 高级示例 (AdvancedExample) 🆕

**位置**: `src/components/AdvancedExample.tsx`

**特性**:

- ✅ **Props 传递** - 子组件接收国际化文本作为 props
- ✅ **对象变量** - 复杂对象的参数插值
- ✅ **数组变量** - 数组数据的国际化展示
- ✅ **Array.map 组件** - 列表渲染中的国际化
- ✅ **复杂表格** - 表格组件的完整国际化方案
- ✅ **条件渲染** - 根据状态显示不同的国际化内容
- ✅ **模板字符串** - 超复杂的参数组合场景

### 6. React-i18next API 完整示例 (ApiExample) 🆕

**位置**: `src/components/ApiExample.tsx`

**包含的 API**:

- ✅ **useTranslation Hook** - 最常用的 Hook
- ✅ **Trans 组件** - 包含 HTML 和 React 组件的翻译
- ✅ **Translation 组件** - Render Props 模式
- ✅ **Pluralization** - 复数处理（zero/one/other）
- ✅ **Interpolation** - 变量插值
- ✅ **Context** - 上下文相关翻译
- ✅ **Nesting** - 嵌套翻译引用
- ✅ **i18n 对象方法** - changeLanguage, exists 等
- ✅ **Key Prefix** - 简化 key 书写
- ✅ **Ready 状态** - 检查翻译加载状态

**示例场景**:

#### Props 传递给子组件

```tsx
// 父组件传递翻译文本给子组件
<Card
  title={t('propsExample.cardTitle', { title: '第一个卡片' })}
  description={t('propsExample.cardDescription', { description: '这是描述' })}
  status={t('propsExample.status.active')}
  buttonLabel={t('propsExample.buttonLabel')}
/>;

// 子组件直接使用
function Card({ title, description, status, buttonLabel }: CardProps) {
  return (
    <div>
      <h4>{title}</h4>
      <p>{description}</p>
      <span>{status}</span>
      <button>{buttonLabel}</button>
    </div>
  );
}
```

#### 对象变量参数传递

```tsx
const userObject = {
  name: '张三',
  age: 28,
  email: 'john@example.com',
  city: '北京',
  phone: '+86 138-0000-0000',
};

// 使用对象解构传递参数
{
  t('objectExample.displayText', {
    name: userObject.name,
    age: userObject.age,
    email: userObject.email,
  });
}
// 输出: "用户 张三 (28岁) 的邮箱是 john@example.com"

{
  t('objectExample.fullInfo', {
    name: userObject.name,
    age: userObject.age,
    city: userObject.city,
    phone: userObject.phone,
  });
}
// 输出: "张三，28岁，居住在北京，联系方式：+86 138-0000-0000"
```

#### 数组变量和 map 渲染

```tsx
const fruits = ['apple', 'banana', 'orange', 'grape', 'watermelon'];

// 渲染数组列表
{
  fruits.map((fruit, index) => <span key={index}>{t(`arrayExample.items.${fruit}`)}</span>);
}

// 数组统计信息
{
  t('arrayExample.itemCount', { count: fruits.length });
}
// 输出: "共 5 项"

// 连接数组项
{
  t('arrayExample.selectedItems', {
    items: fruits.map(f => t(`arrayExample.items.${f}`)).join(', '),
  });
}
// 输出: "已选择: 苹果, 香蕉, 橙子, 葡萄, 西瓜"
```

#### Array.map 渲染复杂组件

```tsx
const products = [
  { id: '1', nameKey: 'laptop', price: 5999, stock: 5, discount: 10 },
  { id: '2', nameKey: 'phone', price: 3999, stock: 10, discount: 15 },
];

// 渲染产品卡片列表
{
  products.map(product => (
    <ProductCard key={product.id} product={product} t={t} onAddToCart={handleAddToCart} />
  ));
}

// 产品卡片组件内部使用
function ProductCard({ product, t }) {
  return (
    <div>
      <h4>{t(`mapExample.products.${product.nameKey}.name`)}</h4>
      <p>{t('mapExample.productCard.priceLabel', { price: product.price })}</p>
      <p>{t('mapExample.productCard.inStock', { count: product.stock })}</p>
      {product.discount && (
        <span>{t('mapExample.productCard.discount', { percent: product.discount })}</span>
      )}
    </div>
  );
}
```

#### 表格行 map 渲染

```tsx
const tableData = [
  { id: 1, name: '项目A', status: 'active', date: '2024-01-15' },
  { id: 2, name: '项目B', status: 'pending', date: '2024-01-16' },
];

// 渲染表格
<table>
  <thead>
    <tr>
      <th>{t('complexNesting.tableHeaders.id')}</th>
      <th>{t('complexNesting.tableHeaders.name')}</th>
      <th>{t('complexNesting.tableHeaders.status')}</th>
      <th>{t('complexNesting.tableHeaders.action')}</th>
    </tr>
  </thead>
  <tbody>
    {tableData.map((row, index) => (
      <TableRow key={row.id} data={row} index={index} t={t} onAction={handleTableAction} />
    ))}
  </tbody>
</table>;

// TableRow 组件
function TableRow({ data, index, t, onAction }) {
  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.name}</td>
      <td>{data.status}</td>
      <td>
        <button onClick={() => onAction('view', data)}>{t('complexNesting.actions.view')}</button>
        <button onClick={() => onAction('delete', data)}>
          {t('complexNesting.actions.delete')}
        </button>
      </td>
    </tr>
  );
}
```

#### 超复杂参数组合

```tsx
// 多个不同类型的参数组合
{
  t('templateLiterals.greeting', {
    name: '张三',
    date: new Date().toLocaleDateString(),
    weather: '晴朗',
  });
}
// 输出: "你好，张三！今天是 2024-01-15，天气晴朗。"

{
  t('templateLiterals.summary', {
    total: 3,
    price: 150,
    discount: 20,
    final: 130,
  });
}
// 输出: "总计：3 件商品，总价：¥150，优惠：¥20，实付：¥130"

{
  t('templateLiterals.userStatus', {
    username: '李四',
    time: '10:30:00',
    location: '北京',
    action: '创建',
    count: 5,
    item: '文档',
  });
}
// 输出: "用户 李四 于 10:30:00 在 北京 创建了 5 个文档"
```

### React-i18next 核心 API

#### Trans 组件

用于包含 HTML 标签和 React 组件的翻译：

```tsx
<Trans
  i18nKey="trans.complexNesting"
  values={{ username: '李四', count: 3 }}
  components={{
    strong: <strong style={{ color: '#4caf50' }} />,
    badge: <Badge />,
  }}
>
  Welcome <strong>{'{{username}}'}</strong>, you have <badge>{'{{count}}'}</badge> new messages
</Trans>
```

#### 复数处理

```tsx
// 翻译文件
{
  "item_zero": "没有项目",
  "item_one": "1 个项目",
  "item_other": "{{count}} 个项目"
}

// 使用
{t('item', { count: 0 })}  // "没有项目"
{t('item', { count: 1 })}  // "1 个项目"
{t('item', { count: 5 })}  // "5 个项目"
```

#### 上下文

```tsx
// 翻译文件
{
  "friend": "朋友",
  "friend_male": "男性朋友",
  "friend_female": "女性朋友"
}

// 使用
{t('friend')}                      // "朋友"
{t('friend', { context: 'male' })} // "男性朋友"
{t('friend', { context: 'female' })} // "女性朋友"
```

#### 嵌套翻译

```tsx
// 翻译文件
{
  "welcome": "欢迎",
  "fullWelcome": "$t(welcome)回来，{{name}}！"
}

// 使用 $t() 引用另一个翻译
{t('fullWelcome', { name: '张三' })}
// 输出: "欢迎回来，张三！"
```

#### Key Prefix

```tsx
const { t } = useTranslation(lng, 'api', { keyPrefix: 'section' });

{
  t('item1');
} // 实际访问 'section.item1'
{
  t('item2');
} // 实际访问 'section.item2'
```

#### i18n 对象方法

```tsx
const { i18n } = useTranslation();

i18n.language; // 获取当前语言
i18n.changeLanguage('en-US'); // 切换语言
i18n.exists('some.key'); // 检查 key 是否存在
i18n.options.ns; // 获取命名空间
```

## 🔧 核心配置

### 1. i18next 配置

**服务端** (`src/i18n/index.ts`):

```typescript
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns));
  return i18nInstance;
};
```

**客户端** (`src/i18n/client.ts`):

```typescript
'use client';

import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend(...))
  .init({
    ...getOptions(),
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
  });
```

### 2. Next.js 中间件

**位置**: `src/middleware.ts`

功能：

- 检测用户语言偏好（Cookie、Accept-Language header）
- 自动重定向到对应语言路径
- 设置语言 Cookie

```typescript
export function middleware(req: NextRequest) {
  let lng = acceptLanguage.get(req.headers.get('Accept-Language'));

  if (!languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`))) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url));
  }

  return NextResponse.next();
}
```

### 3. 翻译文件格式

**JSON 格式** (`src/i18n/locales/zh-CN/common.json`):

```json
{
  "title": "Next.js + React-i18next 示例",
  "welcome": "欢迎使用 Next.js 国际化",
  "currentLanguage": "当前语言: {{lng}}",
  "lastUpdated": "最后更新: {{date}}"
}
```

## 📚 使用方式

### 基础用法

```tsx
// 服务端组件
const { t } = await useTranslation(lng, 'common');
<div>{t('title')}</div>;

// 客户端组件
('use client');
const { t } = useTranslation(lng, 'common');
<div>{t('title')}</div>;
```

### 参数插值

```tsx
// 单个参数
{
  t('greeting', { name: 'John' });
}
// 输出: "Hello, John!"

// 多个参数
{
  t('complexMessage', { userName: 'John', date: '2024-01-01', count: 5 });
}
// 输出: "User John created 5 projects on 2024-01-01"
```

### 复数处理

```tsx
// 翻译文件
{
  "itemCount": "You have {{count}} item",
  "itemCount_plural": "You have {{count}} items"
}

// 使用
{t('itemCount', { count: 1 })}  // "You have 1 item"
{t('itemCount', { count: 5 })}  // "You have 5 items"
```

### 命名空间

```tsx
// 使用不同的命名空间
const { t } = await useTranslation(lng, 'form');
{
  t('username');
} // 从 form.json 读取

const { t } = await useTranslation(lng, 'server');
{
  t('title');
} // 从 server.json 读取
```

### Input Placeholder

```tsx
<input
  type="text"
  placeholder={t('usernamePlaceholder')}
/>

<textarea
  placeholder={t('bioPlaceholder')}
/>

<select>
  <option value="">{t('countryPlaceholder')}</option>
  <option value="cn">{t('countryOptions.cn')}</option>
</select>
```

### 验证消息

```tsx
{
  errors.username && <div style={{ color: 'red' }}>{t('usernameHint', { min: 3, max: 20 })}</div>;
}

{
  errors.email && <div style={{ color: 'red' }}>{t('emailError')}</div>;
}
```

## 🌍 支持的语言

- 🇨🇳 中文 (zh-CN)
- 🇺🇸 英文 (en-US)

### 添加新语言

1. 在 `src/i18n/settings.ts` 中添加语言代码：

```typescript
export const languages = ['zh-CN', 'en-US', 'ja-JP'];
```

2. 创建对应的翻译文件：

```
src/i18n/locales/ja-JP/
├── common.json
├── form.json
└── server.json
```

## 🎯 最佳实践

### 1. 服务端组件优先

尽可能使用服务端组件，可以获得更好的 SEO 和性能：

```tsx
// ✅ 推荐：服务端组件
export default async function Page({ params }: { params: { lng: string } }) {
  const { t } = await useTranslation(params.lng);
  return <div>{t('title')}</div>;
}
```

### 2. 合理使用命名空间

将翻译按功能模块分组，避免单个文件过大：

```
common.json  - 通用文案
form.json    - 表单相关
server.json  - 服务端组件
error.json   - 错误消息
```

### 3. 参数命名规范

使用清晰的参数名，便于维护：

```tsx
// ✅ 好的命名
{
  t('welcome', { userName: 'John', loginTime: '10:30' });
}

// ❌ 避免
{
  t('welcome', { a: 'John', b: '10:30' });
}
```

### 4. 保持翻译文件同步

确保所有语言的翻译文件包含相同的 key：

```bash
# 可以使用工具检查缺失的翻译
pnpm i18n:check
```

## 🔍 常见问题

### Q: 为什么需要两套 i18n 配置？

A: Next.js 使用服务端和客户端分离的架构：

- 服务端组件使用 `src/i18n/index.ts`（每次请求创建新实例）
- 客户端组件使用 `src/i18n/client.ts`（浏览器单例）

### Q: 如何在 API Route 中使用 i18n？

A:

```typescript
// app/api/example/route.ts
import { useTranslation } from '@/i18n';

export async function GET(request: Request) {
  const lng = request.headers.get('accept-language') || 'zh-CN';
  const { t } = await useTranslation(lng, 'common');

  return Response.json({ message: t('success') });
}
```

### Q: 如何处理动态路由？

A:

```typescript
// app/[lng]/posts/[id]/page.tsx
export default async function PostPage({
  params
}: {
  params: { lng: string; id: string }
}) {
  const { t } = await useTranslation(params.lng);
  return <div>{t('title')}</div>;
}
```

### Q: 语言切换后页面不更新？

A: 确保客户端组件正确使用了 `useTranslation` hook：

```tsx
'use client';
import { useTranslation } from '@/i18n/client';

export default function Component({ lng }: { lng: string }) {
  const { t, i18n } = useTranslation(lng);

  // 确保 lng 变化时更新
  useEffect(() => {
    if (i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n]);

  return <div>{t('title')}</div>;
}
```

## 📊 性能优化

### 1. 按需加载翻译

使用 `resourcesToBackend` 实现翻译文件的按需加载：

```typescript
resourcesToBackend(
  (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
);
```

### 2. 静态生成

为所有语言预生成静态页面：

```typescript
export async function generateStaticParams() {
  return languages.map(lng => ({ lng }));
}
```

### 3. 缓存策略

对翻译文件启用缓存：

```typescript
// next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/locales/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
  ],
};
```

## 📝 开发技巧

### 1. 使用 VS Code 插件

推荐安装：

- `i18n Ally` - 在编辑器中内联显示翻译

### 2. 翻译文件验证

创建脚本验证翻译完整性：

```typescript
// scripts/check-translations.ts
import fs from 'fs';
import path from 'path';

const languages = ['zh-CN', 'en-US'];
const namespaces = ['common', 'form', 'server'];

// 检查所有语言是否有相同的 key
```

### 3. 热更新

开发模式下，修改翻译文件会自动触发热更新，无需刷新页面。

## 🎉 总结

这个示例展示了 Next.js + react-i18next 的完整国际化方案：

- ✅ 服务端和客户端渲染
- ✅ 复杂参数传递和插值
- ✅ 表单国际化（placeholder、验证）
- ✅ 路由国际化
- ✅ SEO 优化
- ✅ TypeScript 支持
- ✅ 现代化架构

立即运行 `pnpm dev` 体验完整功能！

## 📖 相关资源

### 项目文档

- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南
- **[API_REFERENCE.md](./API_REFERENCE.md)** - React-i18next API 完整参考 🆕
- **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - 高级功能详解

### 官方文档

- [Next.js 文档](https://nextjs.org/docs)
- [react-i18next 文档](https://react-i18next.com/)
- [i18next 文档](https://www.i18next.com/)
- [Next.js i18n 路由](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

## 📄 License

MIT
