# 高级国际化功能指南

本文档详细介绍 `AdvancedExample` 组件中展示的所有高级国际化场景。

## 📋 目录

1. [Props 传递参数](#1-props-传递参数)
2. [对象变量参数](#2-对象变量参数)
3. [数组变量处理](#3-数组变量处理)
4. [Array.map 组件渲染](#4-arraymap-组件渲染)
5. [复杂表格嵌套](#5-复杂表格嵌套)
6. [条件渲染](#6-条件渲染)
7. [模板字符串复杂场景](#7-模板字符串复杂场景)

---

## 1. Props 传递参数

### 场景说明

在实际开发中，我们经常需要将国际化文本作为 props 传递给子组件。这种模式可以提高组件的复用性。

### 实现方式

```tsx
// 父组件中
<Card
  title={t('propsExample.cardTitle', { title: '第一个卡片' })}
  description={t('propsExample.cardDescription', { description: '这是描述文本' })}
  status={t('propsExample.status.active')}
  buttonLabel={t('propsExample.buttonLabel')}
  onButtonClick={() => alert(t('propsExample.tooltip'))}
/>;

// 子组件中直接使用
function Card({ title, description, status, buttonLabel, onButtonClick }: CardProps) {
  return (
    <div>
      <h4>{title}</h4>
      <p>{description}</p>
      <span>{status}</span>
      <button onClick={onButtonClick}>{buttonLabel}</button>
    </div>
  );
}
```

### 翻译文件结构

```json
{
  "propsExample": {
    "cardTitle": "卡片标题: {{title}}",
    "cardDescription": "描述: {{description}}",
    "buttonLabel": "点击我",
    "tooltip": "这是一个提示信息",
    "status": {
      "active": "激活",
      "inactive": "未激活",
      "pending": "等待中",
      "completed": "已完成"
    }
  }
}
```

### 优势

- ✅ 子组件不需要依赖 i18n
- ✅ 更容易测试
- ✅ 可以在非 React 环境复用组件

---

## 2. 对象变量参数

### 场景说明

当需要传递多个相关参数时，使用对象可以让代码更清晰、更易维护。

### 实现方式

```tsx
// 定义用户对象
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

// 或者使用扩展运算符（当参数名和对象属性名一致时）
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

### 翻译文件结构

```json
{
  "objectExample": {
    "userProfile": {
      "name": "姓名",
      "age": "年龄",
      "email": "邮箱",
      "address": "地址",
      "phone": "电话"
    },
    "displayText": "用户 {{name}} ({{age}}岁) 的邮箱是 {{email}}",
    "fullInfo": "{{name}}，{{age}}岁，居住在{{city}}，联系方式：{{phone}}"
  }
}
```

### 最佳实践

- 🔹 使用有意义的对象属性名
- 🔹 保持翻译文件中参数名与对象属性名一致
- 🔹 对于可选属性，在翻译中提供默认值

---

## 3. 数组变量处理

### 场景说明

处理列表数据时，需要对数组中的每个元素进行国际化转换。

### 实现方式

```tsx
// 定义数组
const fruits = ['apple', 'banana', 'orange', 'grape', 'watermelon'];

// 方式1：直接 map 渲染
{
  fruits.map((fruit, index) => <span key={index}>{t(`arrayExample.items.${fruit}`)}</span>);
}

// 方式2：数组统计
{
  t('arrayExample.itemCount', { count: fruits.length });
}
// 输出: "共 5 项"

// 方式3：将数组转换为字符串
{
  t('arrayExample.selectedItems', {
    items: fruits.map(f => t(`arrayExample.items.${f}`)).join(', '),
  });
}
// 输出: "已选择: 苹果, 香蕉, 橙子, 葡萄, 西瓜"
```

### 翻译文件结构

```json
{
  "arrayExample": {
    "items": {
      "apple": "苹果",
      "banana": "香蕉",
      "orange": "橙子",
      "grape": "葡萄",
      "watermelon": "西瓜"
    },
    "itemCount": "共 {{count}} 项",
    "selectedItems": "已选择: {{items}}",
    "listTitle": "水果列表"
  }
}
```

### 技巧

- 💡 使用动态 key：`t(\`namespace.${dynamicKey}\`)`
- 💡 数组转字符串时使用正确的分隔符（中文用顿号或逗号）
- 💡 考虑复数形式处理

---

## 4. Array.map 组件渲染

### 场景说明

这是最常见的场景之一：渲染列表，每个列表项都是一个复杂组件。

### 产品卡片示例

```tsx
// 定义产品数据
interface Product {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  stock: number;
  discount?: number;
}

const products: Product[] = [
  { id: '1', nameKey: 'laptop', categoryKey: 'electronics', price: 5999, stock: 5, discount: 10 },
  { id: '2', nameKey: 'phone', categoryKey: 'electronics', price: 3999, stock: 10, discount: 15 },
];

// 父组件渲染
{
  products.map(product => (
    <ProductCard key={product.id} product={product} t={t} onAddToCart={handleAddToCart} />
  ));
}

// 子组件实现
function ProductCard({ product, t, onAddToCart }: ProductCardProps) {
  return (
    <div>
      {/* 使用动态 key 获取产品名称 */}
      <h4>{t(`mapExample.products.${product.nameKey}.name`)}</h4>

      {/* 使用动态 key 获取分类 */}
      <p>{t(`mapExample.products.${product.nameKey}.category`)}</p>

      {/* 带参数的价格显示 */}
      <p>{t('mapExample.productCard.priceLabel', { price: product.price })}</p>

      {/* 库存状态（条件渲染） */}
      {product.stock > 0 ? (
        <span>{t('mapExample.productCard.inStock', { count: product.stock })}</span>
      ) : (
        <span>{t('mapExample.productCard.outOfStock')}</span>
      )}

      {/* 折扣标签（可选） */}
      {product.discount && (
        <span>{t('mapExample.productCard.discount', { percent: product.discount })}</span>
      )}

      <button onClick={() => onAddToCart(product)}>{t('mapExample.productCard.addToCart')}</button>
    </div>
  );
}
```

### 翻译文件结构

```json
{
  "mapExample": {
    "productCard": {
      "priceLabel": "¥{{price}}",
      "inStock": "有货 ({{count}} 件)",
      "outOfStock": "缺货",
      "discount": "优惠 {{percent}}%",
      "addToCart": "加入购物车"
    },
    "products": {
      "laptop": {
        "name": "笔记本电脑",
        "category": "电子产品"
      },
      "phone": {
        "name": "智能手机",
        "category": "电子产品"
      }
    }
  }
}
```

### 关键点

- 🎯 将 `t` 函数作为 prop 传递给子组件
- 🎯 使用 `nameKey` 等标识符作为翻译 key 的一部分
- 🎯 在子组件中处理复杂的国际化逻辑
- 🎯 使用条件渲染处理不同状态的文本

---

## 5. 复杂表格嵌套

### 场景说明

表格是最复杂的 UI 组件之一，包含表头、数据行、操作按钮等多个部分。

### 完整实现

```tsx
// 表格数据
interface TableRowData {
  id: number;
  name: string;
  status: string;
  date: string;
}

const tableData: TableRowData[] = [
  { id: 1, name: '项目A', status: 'active', date: '2024-01-15' },
  { id: 2, name: '项目B', status: 'pending', date: '2024-01-16' },
];

// 表格渲染
<table>
  <thead>
    <tr>
      <th>{t('complexNesting.tableHeaders.id')}</th>
      <th>{t('complexNesting.tableHeaders.name')}</th>
      <th>{t('complexNesting.tableHeaders.status')}</th>
      <th>{t('complexNesting.tableHeaders.date')}</th>
      <th>{t('complexNesting.tableHeaders.action')}</th>
    </tr>
  </thead>
  <tbody>
    {tableData.map((row, index) => (
      <TableRow key={row.id} data={row} index={index} t={t} onAction={handleTableAction} />
    ))}
  </tbody>
</table>;

// 表格行组件
function TableRow({ data, index, t, onAction }: TableRowProps) {
  return (
    <tr>
      <td>{data.id}</td>
      <td>{data.name}</td>
      <td>{data.status}</td>
      <td>{data.date}</td>
      <td>
        <button onClick={() => onAction('view', data)}>{t('complexNesting.actions.view')}</button>
        <button onClick={() => onAction('edit', data)}>{t('complexNesting.actions.edit')}</button>
        <button
          onClick={() => {
            if (confirm(t('complexNesting.actions.confirm', { name: data.name }))) {
              onAction('delete', data);
            }
          }}
        >
          {t('complexNesting.actions.delete')}
        </button>
      </td>
    </tr>
  );
}

// 行信息汇总
{
  tableData.map((row, index) => (
    <p key={row.id}>
      {t('complexNesting.rowInfo', { index: index + 1, name: row.name, id: row.id })}
    </p>
  ));
}
// 输出: "第 1 行 - 项目A (ID: 1)"
```

### 翻译文件结构

```json
{
  "complexNesting": {
    "tableHeaders": {
      "id": "编号",
      "name": "名称",
      "status": "状态",
      "date": "日期",
      "action": "操作"
    },
    "actions": {
      "view": "查看",
      "edit": "编辑",
      "delete": "删除",
      "confirm": "确认删除 {{name}} 吗？"
    },
    "statusText": "状态: {{status}}，更新于 {{date}}",
    "rowInfo": "第 {{index}} 行 - {{name}} (ID: {{id}})"
  }
}
```

### 注意事项

- ⚠️ 表头和数据行使用不同的翻译命名空间
- ⚠️ 操作按钮的文本和确认消息保持一致
- ⚠️ 状态文本可能需要额外的映射处理

---

## 6. 条件渲染

### 场景说明

根据不同的条件显示不同的国际化内容。

### 实现方式

```tsx
// 登录状态示例
{
  isLoggedIn ? (
    <p>{t('conditionalRender.loginStatus.loggedIn', { username: user.username })}</p>
  ) : (
    <p>{t('conditionalRender.loginStatus.loggedOut')}</p>
  );
}

// 权限角色示例
{
  role === 'admin' && <p>{t('conditionalRender.permissions.admin')}</p>;
}

{
  role === 'user' && <p>{t('conditionalRender.permissions.user')}</p>;
}

// 复杂条件
<p>
  {t('conditionalRender.permissions.message', {
    role: t(`conditionalRender.permissions.${role}`),
    action: canEdit ? '可以编辑' : '仅可查看',
  })}
</p>;
```

### 翻译文件结构

```json
{
  "conditionalRender": {
    "loginStatus": {
      "loggedIn": "欢迎回来，{{username}}！",
      "loggedOut": "请登录以继续",
      "guest": "游客模式"
    },
    "permissions": {
      "admin": "管理员权限",
      "user": "普通用户",
      "guest": "访客权限",
      "message": "您当前是 {{role}}，{{action}}"
    }
  }
}
```

### 模式

1. **简单条件**: 使用三元运算符
2. **多条件**: 使用 switch 或对象映射
3. **嵌套翻译**: 在参数中使用翻译结果

---

## 7. 模板字符串复杂场景

### 场景说明

在一个翻译字符串中组合多个不同类型的参数。

### 超复杂示例

```tsx
// 示例1：天气问候
{
  t('templateLiterals.greeting', {
    name: '张三',
    date: new Date().toLocaleDateString('zh-CN'),
    weather: '晴朗',
  });
}
// 输出: "你好，张三！今天是 2024-01-15，天气晴朗。"

// 示例2：购物车汇总
{
  t('templateLiterals.summary', {
    total: 3,
    price: 150,
    discount: 20,
    final: 130,
  });
}
// 输出: "总计：3 件商品，总价：¥150，优惠：¥20，实付：¥130"

// 示例3：用户行为日志
{
  t('templateLiterals.userStatus', {
    username: '李四',
    time: new Date().toLocaleTimeString('zh-CN'),
    location: '北京',
    action: '创建',
    count: 5,
    item: '文档',
  });
}
// 输出: "用户 李四 于 10:30:00 在 北京 创建了 5 个文档"
```

### 翻译文件结构

```json
{
  "templateLiterals": {
    "greeting": "你好，{{name}}！今天是 {{date}}，天气{{weather}}。",
    "summary": "总计：{{total}} 件商品，总价：¥{{price}}，优惠：¥{{discount}}，实付：¥{{final}}",
    "userStatus": "用户 {{username}} 于 {{time}} 在 {{location}} {{action}}了 {{count}} 个{{item}}"
  }
}
```

### 参数类型处理

```tsx
// 日期格式化
date: new Date().toLocaleDateString(lng === 'zh-CN' ? 'zh-CN' : 'en-US');

// 时间格式化
time: new Date().toLocaleTimeString(lng === 'zh-CN' ? 'zh-CN' : 'en-US');

// 数字格式化
price: Number(price).toLocaleString(lng === 'zh-CN' ? 'zh-CN' : 'en-US');

// 百分比
percent: `${(value * 100).toFixed(2)}%`;
```

### 最佳实践

- 🌟 参数命名要清晰、有意义
- 🌟 保持中英文语序一致（如果可能）
- 🌟 注意不同语言的标点符号差异
- 🌟 日期、时间、数字使用 locale 格式化

---

## 🎯 总结

### 核心原则

1. **分离关注点**: 翻译逻辑和业务逻辑分离
2. **组件化思维**: 可复用的国际化组件
3. **类型安全**: 使用 TypeScript 确保参数正确
4. **性能优化**: 避免在循环中重复创建 i18n 实例

### 推荐模式

| 场景     | 推荐方式          | 示例                                |
| -------- | ----------------- | ----------------------------------- |
| 简单文本 | 直接使用 `t()`    | `{t('key')}`                        |
| 单个参数 | 对象参数          | `{t('key', { name })}`              |
| 多个参数 | 对象解构          | `{t('key', { ...user })}`           |
| 列表渲染 | 传递 `t` 给子组件 | `<Child t={t} />`                   |
| 条件渲染 | 嵌套翻译          | `{t('key', { text: t('nested') })}` |
| 复杂逻辑 | 提取辅助函数      | `getLocalizedText()`                |

### 调试技巧

1. 使用 `debug: true` 查看翻译过程
2. 检查参数是否正确传递
3. 验证翻译文件中的 key 是否存在
4. 使用 TypeScript 类型检查

### 性能考虑

- ✅ 翻译文件按需加载
- ✅ 避免在 render 中创建新的翻译实例
- ✅ 使用 React.memo 优化组件
- ✅ 缓存复杂的翻译结果

---

## 📚 扩展阅读

- [react-i18next 官方文档](https://react.i18next.com/)
- [i18next 插值指南](https://www.i18next.com/translation-function/interpolation)
- [Next.js 国际化最佳实践](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

## 🤝 贡献

如果你有更好的实践或示例，欢迎提交 PR！
