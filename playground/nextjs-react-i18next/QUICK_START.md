# 快速开始指南

## 安装和运行

```bash
# 1. 进入项目目录
cd playground/nextjs-react-i18next

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 在浏览器中打开
# http://localhost:3030
```

## 项目亮点

### 🎯 主要功能

1. **服务端渲染 (SSR) 示例** - `ServerExample.tsx`
   - 展示服务端数据获取
   - 复杂参数传递（用户信息、时间、计数）
   - SEO 友好

2. **客户端渲染示例** - `ClientExample.tsx`
   - 交互式组件（计数器）
   - 实时时间更新
   - 动态语言切换

3. **表单综合示例** - `FormExample.tsx`
   - Input placeholder 国际化
   - 表单验证消息（带参数）
   - 下拉选项、多选框
   - 字符计数显示
   - 复杂参数场景

4. **语言切换器** - `LanguageSwitcher.tsx`
   - 一键切换中英文
   - URL 路径自动更新
   - 当前语言状态显示

5. **高级示例** - `AdvancedExample.tsx` 🆕
   - Props 传递国际化文本
   - 对象变量参数插值
   - 数组变量和 Array.map
   - 复杂表格组件
   - 条件渲染
   - 超复杂参数组合

6. **API 完整示例** - `ApiExample.tsx` 🆕
   - useTranslation Hook
   - Trans 组件（HTML + React 组件）
   - Pluralization（复数处理）
   - Context（上下文）
   - Nesting（嵌套翻译）
   - i18n 对象方法
   - Key Prefix
   - Translation 组件（Render Props）

### 📋 复杂参数示例

#### 1. 基础参数插值

```typescript
t('currentLanguage', { lng: 'zh-CN' });
// 输出: "当前语言: zh-CN"
```

#### 2. 多参数插值

```typescript
t('usernameHint', { min: 3, max: 20 });
// 输出: "用户名长度必须在 3 到 20 个字符之间"
```

#### 3. 计数参数

```typescript
t('bioCount', { count: 50, max: 500 });
// 输出: "已输入 50 / 500 个字符"
```

#### 4. 复杂场景

```typescript
t('complexMessage', {
  userName: 'John',
  date: '2024-01-01',
  count: 5,
});
// 输出: "用户 John 在 2024-01-01 创建了 5 个项目"
```

#### 5. Props 传递 🆕

```typescript
// 传递国际化文本给子组件
<Card
  title={t('propsExample.cardTitle', { title: '卡片' })}
  buttonLabel={t('propsExample.buttonLabel')}
/>
```

#### 6. 对象变量 🆕

```typescript
const user = { name: '张三', age: 28, email: 'john@example.com' };
t('objectExample.displayText', { ...user });
// 输出: "用户 张三 (28岁) 的邮箱是 john@example.com"
```

#### 7. Array.map 渲染 🆕

```typescript
products.map(product => (
  <div key={product.id}>
    {t(`mapExample.products.${product.nameKey}.name`)}
    {t('mapExample.productCard.priceLabel', { price: product.price })}
  </div>
))
```

#### 8. 超复杂参数组合 🆕

```typescript
t('templateLiterals.userStatus', {
  username: '李四',
  time: '10:30:00',
  location: '北京',
  action: '创建',
  count: 5,
  item: '文档',
});
// 输出: "用户 李四 于 10:30:00 在 北京 创建了 5 个文档"
```

### 🌐 路由结构

- `/` → 自动重定向到 `/zh-CN`
- `/zh-CN` → 中文版本
- `/en-US` → 英文版本

### 📦 翻译文件

```
src/i18n/locales/
├── zh-CN/
│   ├── common.json   # 通用文案
│   ├── form.json     # 表单相关
│   ├── server.json   # 服务端组件
│   ├── advanced.json # 高级示例 🆕
│   └── api.json      # API 示例 🆕
└── en-US/
    ├── common.json
    ├── form.json
    ├── server.json
    ├── advanced.json  # 高级示例 🆕
    └── api.json       # API 示例 🆕
```

### 🔧 技术架构

- **Next.js 14** - App Router
- **react-i18next** - React 国际化
- **TypeScript** - 类型安全
- **服务端 + 客户端** - 双模式渲染

## 查看效果

启动服务器后，你会看到：

1. **顶部** - 标题和语言切换器
2. **服务端示例** - 展示 SSR 数据获取和复杂参数
3. **客户端示例** - 交互式组件和实时更新
4. **表单示例** - 完整的表单国际化场景
5. **高级示例** 🆕 - Props 传递、对象变量、数组 map、复杂表格等
6. **API 完整示例** 🆕 - 所有 react-i18next 核心 API 用法

切换语言查看所有文案的变化！

## 📚 相关文档

- **[README.md](./README.md)** - 完整使用文档和最佳实践
- **[API_REFERENCE.md](./API_REFERENCE.md)** - React-i18next API 完整参考 🆕
- **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)** - 高级功能详解（Props、对象、数组等）

## 更多信息

详细文档请查看上述文档。祝你使用愉快！🎉
