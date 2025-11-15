# React-i18next API 完整参考

本文档详细介绍 `ApiExample` 组件中展示的所有 react-i18next API。

## 📚 目录

1. [useTranslation Hook](#1-usetranslation-hook)
2. [Trans 组件](#2-trans-组件)
3. [Translation 组件](#3-translation-组件)
4. [复数处理 (Pluralization)](#4-复数处理-pluralization)
5. [插值 (Interpolation)](#5-插值-interpolation)
6. [上下文 (Context)](#6-上下文-context)
7. [嵌套翻译 (Nesting)](#7-嵌套翻译-nesting)
8. [i18n 对象](#8-i18n-对象)
9. [Key Prefix](#9-key-prefix)
10. [Ready 状态](#10-ready-状态)

---

## 1. useTranslation Hook

### 描述

这是 react-i18next 中最常用的 Hook，用于在函数组件中获取翻译函数和 i18n 实例。

### 基本用法

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent({ lng }: { lng: string }) {
  const { t, i18n, ready } = useTranslation(lng, 'namespace');

  return <div>{t('key')}</div>;
}
```

### 返回值

| 属性    | 类型     | 描述             |
| ------- | -------- | ---------------- |
| `t`     | Function | 翻译函数         |
| `i18n`  | Object   | i18n 实例        |
| `ready` | Boolean  | 翻译是否加载完成 |

### 参数

```tsx
useTranslation(lng, namespace, options);
```

- `lng`: 语言代码（如 'zh-CN', 'en-US'）
- `namespace`: 命名空间字符串或数组（可选，默认 'translation'）
- `options`: 配置对象（可选）
  - `keyPrefix`: 为所有 key 添加前缀

### 示例

```tsx
// 基础用法
const { t } = useTranslation(lng, 'common');
{
  t('title');
} // 访问 common.title

// 多个命名空间
const { t } = useTranslation(lng, ['common', 'form']);
{
  t('common:title');
} // 明确指定命名空间
{
  t('form:username');
}

// 使用 keyPrefix
const { t } = useTranslation(lng, 'common', { keyPrefix: 'section' });
{
  t('item1');
} // 实际访问 common.section.item1
```

---

## 2. Trans 组件

### 描述

用于处理包含 HTML 标签和 React 组件的复杂翻译。这是处理富文本翻译的最佳方式。

### 基本用法

```tsx
import { Trans } from 'react-i18next';

<Trans i18nKey="key" t={t}>
  Default content with <strong>bold</strong> text
</Trans>;
```

### Props

| 属性         | 类型     | 必需 | 描述                               |
| ------------ | -------- | ---- | ---------------------------------- |
| `i18nKey`    | String   | 是   | 翻译 key                           |
| `t`          | Function | 否   | 翻译函数（从 useTranslation 获取） |
| `values`     | Object   | 否   | 插值变量                           |
| `components` | Object   | 否   | React 组件映射                     |
| `defaults`   | String   | 否   | 默认文本                           |

### 示例场景

#### 1. 简单 HTML 标签

```tsx
// 翻译文件
{
  "simpleHtml": "这是 <strong>粗体文本</strong> 和 <em>斜体文本</em>"
}

// 使用
<Trans i18nKey="simpleHtml" t={t}>
  This is <strong>bold text</strong> and <em>italic text</em>
</Trans>
```

#### 2. 带链接

```tsx
// 翻译文件
{
  "withLink": "访问我们的 <link>官方网站</link> 了解更多"
}

// 使用
<Trans
  i18nKey="withLink"
  t={t}
  components={{
    link: <a href="https://example.com" />
  }}
>
  Visit our <link>official website</link> for more
</Trans>
```

#### 3. 自定义 React 组件

```tsx
// 翻译文件
{
  "withComponent": "点击 <button>这里</button> 查看详情"
}

// 使用
<Trans
  i18nKey="withComponent"
  t={t}
  components={{
    button: <button onClick={() => alert('Clicked!')} />
  }}
>
  Click <button>here</button> for details
</Trans>
```

#### 4. 带插值的复杂嵌套

```tsx
// 翻译文件
{
  "complexNesting": "欢迎 <strong>{{username}}</strong>，您有 <badge>{{count}}</badge> 条新消息"
}

// Badge 组件
function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

// 使用
<Trans
  i18nKey="complexNesting"
  t={t}
  values={{ username: '张三', count: 5 }}
  components={{
    strong: <strong />,
    badge: <Badge />
  }}
>
  Welcome <strong>{'{{username}}'}</strong>, you have <badge>{'{{count}}'}</badge> new messages
</Trans>
```

#### 5. 多个不同组件

```tsx
<Trans
  i18nKey="multipleComponents"
  t={t}
  components={{
    icon: <Icon />,
    link: <a href="/docs" />,
    link2: <a href="/examples" />,
  }}
>
  Check <icon></icon> <link>documentation</link> or <link2>examples</link2>
</Trans>
```

### 注意事项

- ⚠️ 组件标签名必须与 `components` 对象的 key 匹配
- ⚠️ 插值变量使用 `{{variableName}}` 格式
- ⚠️ Trans 子元素仅作为默认内容，实际使用翻译文件中的内容

---

## 3. Translation 组件

### 描述

使用 Render Props 模式的翻译组件，提供更灵活的使用方式。

### 基本用法

```tsx
import { Translation } from 'react-i18next';

<Translation>{(t, { i18n }) => <div>{t('key')}</div>}</Translation>;
```

### Props

| 属性 | 类型         | 描述     |
| ---- | ------------ | -------- |
| `ns` | String/Array | 命名空间 |

### 示例

```tsx
// 基础用法
<Translation>
  {(t) => <p>{t('api:translation.example')}</p>}
</Translation>

// 访问 i18n 实例
<Translation>
  {(t, { i18n }) => (
    <div>
      <p>{t('title')}</p>
      <p>Current language: {i18n.language}</p>
    </div>
  )}
</Translation>

// 指定命名空间
<Translation ns="form">
  {(t) => <p>{t('username')}</p>}
</Translation>
```

---

## 4. 复数处理 (Pluralization)

### 描述

根据数量自动选择正确的复数形式。i18next 遵循 Unicode CLDR 复数规则。

### 复数后缀

| 后缀     | 适用情况               |
| -------- | ---------------------- |
| `_zero`  | count === 0            |
| `_one`   | count === 1            |
| `_two`   | count === 2 (部分语言) |
| `_few`   | 3-10 (部分语言)        |
| `_many`  | 11+ (部分语言)         |
| `_other` | 其他情况（必需）       |

### 翻译文件

```json
{
  "item_zero": "没有项目",
  "item_one": "1 个项目",
  "item_other": "{{count}} 个项目",

  "message_zero": "暂无消息",
  "message_one": "1 条消息",
  "message_other": "{{count}} 条消息"
}
```

### 使用方式

```tsx
// 必须传递 count 参数
{
  t('item', { count: 0 });
} // "没有项目"
{
  t('item', { count: 1 });
} // "1 个项目"
{
  t('item', { count: 5 });
} // "5 个项目"
{
  t('item', { count: 100 });
} // "100 个项目"
```

### 动态示例

```tsx
const [count, setCount] = useState(5);

return (
  <div>
    <button onClick={() => setCount(count - 1)}>-1</button>
    <p>{t('item', { count })}</p>
    <button onClick={() => setCount(count + 1)}>+1</button>
  </div>
);
```

### 英文复数

```json
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

---

## 5. 插值 (Interpolation)

### 描述

在翻译字符串中嵌入动态值。

### 基本语法

```json
{
  "welcome": "你好，{{name}}！",
  "greeting": "{{greeting}}, {{name}}！"
}
```

```tsx
{
  t('welcome', { name: '张三' });
}
// 输出: "你好，张三！"

{
  t('greeting', { greeting: '早上好', name: '李四' });
}
// 输出: "早上好，李四！"
```

### 嵌套对象

```json
{
  "userInfo": "用户 {{user.name}} ({{user.age}}岁) 来自 {{user.city}}"
}
```

```tsx
{
  t('userInfo', {
    user: {
      name: '王五',
      age: 28,
      city: '北京',
    },
  });
}
// 输出: "用户 王五 (28岁) 来自 北京"
```

### 多个变量

```json
{
  "summary": "{{name}} 在 {{date}} 完成了 {{count}} 个任务"
}
```

```tsx
{
  t('summary', {
    name: '赵六',
    date: '2024-01-15',
    count: 8,
  });
}
// 输出: "赵六 在 2024-01-15 完成了 8 个任务"
```

### 默认值

```json
{
  "value": "值: {{value, 未设置}}"
}
```

```tsx
{
  t('value', { value: undefined });
}
// 输出: "值: 未设置"
```

---

## 6. 上下文 (Context)

### 描述

根据上下文显示不同的翻译，常用于性别、状态等场景。

### 翻译文件

```json
{
  "friend": "朋友",
  "friend_male": "男性朋友",
  "friend_female": "女性朋友",

  "message": "消息",
  "message_read": "已读消息",
  "message_unread": "未读消息"
}
```

### 使用方式

```tsx
// 无上下文
{
  t('friend');
}
// 输出: "朋友"

// 男性上下文
{
  t('friend', { context: 'male' });
}
// 输出: "男性朋友"

// 女性上下文
{
  t('friend', { context: 'female' });
}
// 输出: "女性朋友"

// 消息状态
{
  t('message', { context: 'read' });
} // "已读消息"
{
  t('message', { context: 'unread' });
} // "未读消息"
```

### 动态上下文

```tsx
const [gender, setGender] = useState<'male' | 'female' | undefined>('male');

return (
  <div>
    <button onClick={() => setGender('male')}>男性</button>
    <button onClick={() => setGender('female')}>女性</button>
    <button onClick={() => setGender(undefined)}>无</button>
    <p>{t('friend', { context: gender })}</p>
  </div>
);
```

### 组合使用

上下文可以与复数结合使用：

```json
{
  "friend_male_one": "1 位男性朋友",
  "friend_male_other": "{{count}} 位男性朋友",
  "friend_female_one": "1 位女性朋友",
  "friend_female_other": "{{count}} 位女性朋友"
}
```

```tsx
{
  t('friend', { context: 'male', count: 5 });
}
// 输出: "5 位男性朋友"
```

---

## 7. 嵌套翻译 (Nesting)

### 描述

在一个翻译中引用另一个翻译，使用 `$t(key)` 语法。

### 翻译文件

```json
{
  "welcome": "欢迎",
  "fullWelcome": "$t(welcome)回来，{{name}}！",

  "title": "标题",
  "pageTitle": "$t(title) - 主页",

  "common": {
    "save": "保存",
    "cancel": "取消"
  },
  "form": {
    "saveButton": "$t(common.save)并关闭",
    "cancelButton": "$t(common.cancel)操作"
  }
}
```

### 使用方式

```tsx
// 简单嵌套
{
  t('fullWelcome', { name: '张三' });
}
// 输出: "欢迎回来，张三！"

// 页面标题
{
  t('pageTitle');
}
// 输出: "标题 - 主页"

// 跨命名空间嵌套
{
  t('form.saveButton');
}
// 输出: "保存并关闭"
```

### 嵌套其他命名空间

```json
{
  "title": "$t(common:appName) - 主页"
}
```

### 多层嵌套

```json
{
  "base": "基础",
  "level1": "$t(base)文本",
  "level2": "$t(level1)扩展"
}
```

```tsx
{
  t('level2');
}
// 输出: "基础文本扩展"
```

---

## 8. i18n 对象

### 描述

i18n 实例提供了许多有用的方法和属性。

### 获取 i18n 对象

```tsx
const { i18n } = useTranslation();
```

### 常用属性

```tsx
// 当前语言
i18n.language; // "zh-CN"

// 已加载的语言
i18n.languages; // ["zh-CN", "en-US"]

// 配置选项
i18n.options.ns; // ["common", "form", "server"]
i18n.options.fallbackLng; // "zh-CN"
```

### 常用方法

#### changeLanguage()

切换语言

```tsx
// 切换到英文
await i18n.changeLanguage('en-US');

// 带回调
i18n.changeLanguage('zh-CN', (err, t) => {
  if (err) console.error(err);
  console.log('Language changed');
});
```

#### exists()

检查翻译 key 是否存在

```tsx
i18n.exists('common.title'); // true
i18n.exists('non.existing.key'); // false

// 检查特定命名空间
i18n.exists('title', { ns: 'common' });
```

#### getFixedT()

获取固定语言和命名空间的翻译函数

```tsx
const tChinese = i18n.getFixedT('zh-CN', 'common');
tChinese('title'); // 总是返回中文翻译
```

#### loadNamespaces()

动态加载命名空间

```tsx
await i18n.loadNamespaces(['form', 'advanced']);
```

#### hasLoadedNamespace()

检查命名空间是否已加载

```tsx
i18n.hasLoadedNamespace('common'); // true
i18n.hasLoadedNamespace('notLoaded'); // false
```

### 事件监听

```tsx
// 语言变化事件
i18n.on('languageChanged', lng => {
  console.log('Language changed to:', lng);
});

// 翻译加载完成
i18n.on('loaded', loaded => {
  console.log('Translations loaded:', loaded);
});

// 移除监听
i18n.off('languageChanged', handler);
```

---

## 9. Key Prefix

### 描述

为所有翻译 key 添加统一前缀，简化代码书写。

### 基本用法

```tsx
// 不使用 keyPrefix
const { t } = useTranslation(lng, 'api');
{
  t('section.item1');
}
{
  t('section.item2');
}
{
  t('section.item3');
}

// 使用 keyPrefix
const { t } = useTranslation(lng, 'api', { keyPrefix: 'section' });
{
  t('item1');
} // 实际访问 'section.item1'
{
  t('item2');
} // 实际访问 'section.item2'
{
  t('item3');
} // 实际访问 'section.item3'
```

### 组件示例

```tsx
function SectionComponent({ lng }: { lng: string }) {
  // 所有翻译都从 'keyPrefix' 开始
  const { t } = useTranslation(lng, 'api', { keyPrefix: 'keyPrefix' });

  return (
    <div>
      <p>{t('title')}</p> {/* api.keyPrefix.title */}
      <p>{t('item1')}</p> {/* api.keyPrefix.item1 */}
      <p>{t('item2')}</p> {/* api.keyPrefix.item2 */}
    </div>
  );
}
```

### 多层前缀

```tsx
const { t } = useTranslation(lng, 'api', { keyPrefix: 'section.subsection' });
{
  t('item');
} // 访问 'section.subsection.item'
```

---

## 10. Ready 状态

### 描述

检查翻译资源是否已加载完成。

### 基本用法

```tsx
const { t, ready } = useTranslation(lng, 'api');

if (!ready) {
  return <div>Loading translations...</div>;
}

return <div>{t('content')}</div>;
```

### 完整示例

```tsx
function MyComponent({ lng }: { lng: string }) {
  const { t, i18n, ready } = useTranslation(lng, 'api');

  // 翻译未加载
  if (!ready) {
    return (
      <div className="loading">
        <Spinner />
        <p>Loading translations...</p>
      </div>
    );
  }

  // 翻译加载失败
  if (ready && !i18n.hasResourceBundle(lng, 'api')) {
    return (
      <div className="error">
        <p>Failed to load translations</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // 正常渲染
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('content')}</p>
    </div>
  );
}
```

### 结合 Suspense

```tsx
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent lng="zh-CN" />
    </Suspense>
  );
}
```

---

## 🎯 最佳实践

### 1. 选择合适的 API

| 场景            | 推荐 API                 |
| --------------- | ------------------------ |
| 简单文本        | `useTranslation` + `t()` |
| 包含 HTML       | `Trans` 组件             |
| 包含 React 组件 | `Trans` 组件             |
| 数量相关        | Pluralization            |
| 性别/状态相关   | Context                  |
| 复用翻译        | Nesting                  |
| 类组件          | `withTranslation` HOC    |

### 2. 性能优化

```tsx
// ❌ 避免在每次渲染时创建新实例
function Bad() {
  const { t } = useTranslation(); // 每次都创建新的
  return <Child t={t} />;
}

// ✅ 在顶层使用，传递给子组件
function Good() {
  const { t } = useTranslation();
  return <Child t={t} />;
}
```

### 3. TypeScript 支持

```tsx
// 定义翻译类型
interface Translations {
  common: {
    title: string;
    description: string;
  };
}

// 使用类型
const { t } = useTranslation<keyof Translations>('common');
```

### 4. 错误处理

```tsx
// 设置默认值
{
  t('key', { defaultValue: '默认文本' });
}

// 检查 key 是否存在
if (i18n.exists('key')) {
  return t('key');
}
```

---

## 📚 相关资源

- [react-i18next 官方文档](https://react-i18next.com/)
- [i18next 文档](https://www.i18next.com/)
- [复数规则参考](https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html)
