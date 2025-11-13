# Babel 插件测试文档

## 测试覆盖范围

本测试套件覆盖了 Kiwi Babel 插件的所有转换场景，确保插件在各种情况下正确工作。

### 1. JSX 属性转换 (9 个测试)

#### 原生 HTML 标签的字符串属性 ✅ 需要转换

- `<input placeholder={I18N.xxx} />` → 添加 `String()`
- `<input title={I18N.xxx} />` → 添加 `String()`
- `<img alt={I18N.xxx} />` → 添加 `String()`
- `<div title={I18N.xxx} />` → 添加 `String()`
- `<label htmlFor={I18N.xxx} />` → 添加 `String()`

**原因**：原生 HTML 标签的这些属性只能接受字符串，不能接受 React Node。

#### 自定义组件的属性 ❌ 不需要转换

- `<Card title={I18N.xxx} />` → 保持不变
- `<NestedChild title={I18N.xxx} />` → 保持不变
- `<CustomButton label={I18N.xxx} />` → 保持不变

**原因**：自定义组件可以接收 React Node，保留 Proxy 返回的 span 元素可以传递 `data-i18n-key` 属性。

#### template 方法

- 原生标签：`<input placeholder={I18N.template(...)} />` → 添加 `String()`
- 自定义组件：`<Card title={I18N.template(...)} />` → 不添加

### 2. JSX 子元素转换 (7 个测试)

#### 直接 I18N 调用 ✅ 需要转换

- `<div>{I18N.common.title}</div>` → 添加 `String()`
- `<h1>{I18N.page.title}</h1>` → 添加 `String()`
- `<div>{I18N.template(...)}</div>` → 添加 `String()`

**原因**：避免嵌套 span 节点，保持 DOM 结构简洁。

#### 变量引用 ❌ 不需要转换

- `{items.map(item => <span>{item.label}</span>)}` → 保持不变
- `<h1>{title}</h1>` (props 传递) → 保持不变

**原因**：变量引用可能来自对象属性，保留 Proxy 返回的 React 元素以传递调试信息。

### 3. 对象属性转换 (4 个测试)

#### 对象中的 I18N 值 ❌ 不需要转换

```typescript
const cardData = {
  title: I18N.xxx, // 不添加 String()
  subtitle: I18N.yyy, // 不添加 String()
};
```

**原因**：Proxy 实现了 `toString()`/`valueOf()`/`Symbol.toPrimitive`，可以自动转换。保持不变允许通过 props 传递 React 元素。

#### 函数返回值 ✅ 需要转换

```typescript
const config = {
  formatter: () => I18N.chart.label, // 添加 String()
};
```

**原因**：函数返回值通常需要字符串类型（如 echarts 等库）。

### 4. 复杂场景 (4 个测试)

- ✅ 混合场景：对象 + props 传递 + JSX 渲染
- ✅ 表单示例：多个 input 和 button
- ✅ 列表渲染：数组 map + 变量引用
- ✅ 嵌套组件：多层组件传递

### 5. 边界情况 (6 个测试)

- ✅ 不重复转换已有 `String()` 的表达式
- ✅ 跳过已有 `data-i18n-key` 的元素
- ✅ 处理可选链调用 (`I18N?.common?.title`)
- ✅ 处理 template 可选链 (`I18N?.template?.(...)`)
- ✅ 不处理非 I18N 对象
- ✅ 正确区分大小写组件名 (`div` vs `Div`)

### 6. data-i18n-key 属性 (4 个测试)

- ✅ 为原生标签添加 `data-i18n-key`
- ✅ 为自定义组件添加 `data-i18n-key`
- ✅ 为 JSX 子元素的父元素添加 `data-i18n-key`
- ✅ 为 template 调用添加 `data-i18n-key`

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试一次（CI 模式）
pnpm test:run

# 运行测试 UI
pnpm test:ui
```

## 测试结果

所有 **33 个测试用例**全部通过 ✅

```
✓ JSX 属性转换 (9 个测试)
  ✓ 原生 HTML 标签的字符串属性 (5 个测试)
  ✓ 自定义组件的属性 (3 个测试)
  ✓ template 方法调用 (1 个测试)
✓ JSX 子元素转换 (7 个测试)
  ✓ 直接 I18N 调用 (3 个测试)
  ✓ 变量引用 (4 个测试)
✓ 对象属性转换 (4 个测试)
  ✓ 对象中的 I18N 值 (2 个测试)
  ✓ 函数返回值 (2 个测试)
✓ 复杂场景 (4 个测试)
✓ 边界情况 (6 个测试)
✓ data-i18n-key 属性添加 (4 个测试)
```

## 关键设计原则

1. **原生 HTML 标签** (小写开头) 的字符串属性 → 添加 `String()`
2. **自定义组件** (大写开头) 的属性 → 保持不变，传递 React 元素
3. **JSX 子元素**中的直接调用 → 添加 `String()`，避免嵌套 span
4. **JSX 子元素**中的变量引用 → 保持不变，渲染 Proxy 的 span 元素
5. **对象属性** → 保持不变，允许 props 传递
6. **函数返回值** → 添加 `String()`，确保返回字符串类型

这些规则确保了：

- ✅ 原生标签正常工作（不会传递 React Node 给只接受字符串的属性）
- ✅ 自定义组件可以传递调试信息（通过 Proxy 返回的 span 元素）
- ✅ DOM 结构简洁（避免不必要的嵌套 span）
- ✅ 调试信息完整（通过 `data-i18n-key` 属性）
