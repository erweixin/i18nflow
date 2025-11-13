# Runtime Proxy 测试文档

## 概述

本测试套件全面测试 `proxy.ts` 中的 `createKiwiProxy` 函数，确保 Runtime Proxy 在各种场景下都能正确工作。

## 测试统计

- **测试文件**: `proxy.test.ts`
- **测试用例数**: 39 个
- **测试分组**: 11 个描述块
- **覆盖功能**: 所有核心功能和边缘情况

## 测试分组

### 1. 基本属性访问 (4 个测试)

测试 Proxy 能否正确访问和返回 i18n 对象的属性值。

**测试用例：**

- 应该返回字符串值（开发环境返回 React 元素）
- 应该在生产环境下返回纯字符串
- 应该访问嵌套属性
- 应该访问深层嵌套属性

**验证点：**

- ✅ 开发环境返回 React 元素
- ✅ 生产环境返回纯字符串
- ✅ 支持任意深度的嵌套访问

### 2. React 元素和 data-i18n-key (3 个测试)

测试生成的 React 元素是否包含正确的调试信息。

**测试用例：**

- 应该在 React 元素上添加 `data-i18n-key` 属性
- 应该为嵌套路径生成正确的 key
- 应该在 React 元素的 children 中包含原始文本

**验证点：**

- ✅ `data-i18n-key` 属性正确生成
- ✅ Key 路径使用点号分隔（如 `common.hello`）
- ✅ 原始文本保存在 children 中

### 3. 字符串转换方法 (4 个测试)

测试 Proxy 返回的 React 元素能否正确转换为字符串。

**测试用例：**

- 应该支持 `toString()` 方法
- 应该支持 `valueOf()` 方法
- 应该支持 `Symbol.toPrimitive`
- 应该在字符串上下文中自动转换

**验证点：**

- ✅ 三种转换方法都返回原始文本
- ✅ 字符串拼接时自动转换
- ✅ 用于原生 HTML 属性时正常工作

### 4. Template 方法 (5 个测试)

测试 `kiwi-intl` 的 `template` 方法是否正确集成。

**测试用例：**

- 应该正确调用 template 方法
- 应该从 React 元素中提取 template key
- 应该支持直接传入字符串
- 应该在生产环境下返回纯字符串
- 应该支持多个变量替换

**验证点：**

- ✅ 正确处理模板占位符（`{variable}`）
- ✅ 提取并保留 `data-i18n-key`
- ✅ 支持 React 元素和字符串作为参数
- ✅ 生产环境返回字符串

### 5. 区分 template 方法和 template 对象 (3 个测试)

**关键测试** - 确保不会将对象属性误认为方法。

**测试用例：**

- 应该正确访问 template 对象属性
- 应该正确调用 template 方法
- 应该能够组合使用 template 对象和方法

**验证点：**

- ✅ `I18N.examples.template` 被识别为对象
- ✅ `I18N.template` 被识别为方法
- ✅ 可以先获取对象属性，再用 template 方法处理

**场景示例：**

```typescript
// 对象属性访问
const text = I18N.examples.template.helloUser; // ✅ 正常工作

// 方法调用
const result = I18N.template(text, { username: 'Alice' }); // ✅ 正常工作
```

### 6. 其他方法调用 (3 个测试)

测试其他 `kiwi-intl` 方法是否正常工作。

**测试用例：**

- 应该正确调用 `setLang` 方法
- 应该正确调用 `get` 方法
- 应该绑定方法的 this 上下文

**验证点：**

- ✅ 方法正确转发到原始对象
- ✅ this 上下文正确绑定
- ✅ 解构后的方法仍然有效

### 7. 配置选项 (4 个测试)

测试 `createKiwiProxy` 的配置选项。

**测试用例：**

- 应该支持 `debug: false` 选项
- 应该支持自定义 `i18nIdentifier`
- 应该默认在开发环境启用 debug
- 应该在生产环境默认禁用 debug

**验证点：**

- ✅ `debug: false` 返回原始对象
- ✅ 自定义标识符正常工作
- ✅ 环境变量自动控制行为

### 8. 边缘情况 (7 个测试)

测试各种特殊场景和边缘情况。

**测试用例：**

- 应该处理空字符串值
- 应该处理包含特殊字符的字符串
- 应该处理深层嵌套对象
- 应该处理 template 方法不存在的情况
- 应该处理非对象值（number, boolean, null）
- 应该处理数组值
- 应该处理 undefined 值

**验证点：**

- ✅ 空字符串正常包装
- ✅ 特殊字符不被转义
- ✅ 任意深度嵌套都能工作
- ✅ 非字符串/对象值直接返回
- ✅ 数组保持原样

### 9. React 元素类型和结构 (3 个测试)

测试生成的 React 元素的具体结构。

**测试用例：**

- 应该创建 span 元素
- 应该只包含 `data-i18n-key` 属性
- 应该保持 span 元素的内联特性

**验证点：**

- ✅ 使用 `<span>` 标签（inline 元素）
- ✅ 只添加必要的调试属性
- ✅ 不添加样式或其他属性

### 10. 性能和缓存 (2 个测试)

测试 Proxy 的性能特征。

**测试用例：**

- 应该每次访问返回新的 Proxy 对象
- 应该能够多次访问同一个属性

**验证点：**

- ✅ 每次访问创建新的 Proxy（避免缓存问题）
- ✅ 重复访问不会出错

### 11. 类型安全和 TypeScript (2 个测试)

测试 TypeScript 类型推断。

**测试用例：**

- 应该保持原始对象的类型结构
- 应该允许访问方法

**验证点：**

- ✅ 类型推断正确
- ✅ 方法签名保持不变

## 测试覆盖的关键场景

### ✅ 开发环境 vs 生产环境

```typescript
// 开发环境
const text = I18N.common.hello; // React Element with data-i18n-key

// 生产环境
const text = I18N.common.hello; // "Hello" (string)
```

### ✅ 字符串自动转换

```typescript
const text = I18N.common.hello;

// 所有转换方法都工作
text.toString(); // "Hello"
text.valueOf(); // "Hello"
text[Symbol.toPrimitive](); // "Hello"

// 字符串拼接
`Greeting: ${text}`; // "Greeting: Hello"

// 原生属性
<input placeholder={text} /> // placeholder="Hello"
```

### ✅ Template 方法和对象区分

```typescript
// 对象属性（包含翻译文本）
I18N.examples.template.helloUser; // ✅ 返回 "Hello, {username}!"

// 方法调用（进行变量替换）
I18N.template(text, { username: 'Alice' }); // ✅ 返回 "Hello, Alice!"
```

### ✅ 嵌套访问

```typescript
// 任意深度的嵌套都能正常工作
I18N.level1.level2.level3.level4.text; // ✅ 正确生成 data-i18n-key
```

## 运行测试

```bash
# 运行所有测试
pnpm test:run

# 运行带 UI 的测试
pnpm test:ui

# 运行并监听变化
pnpm test
```

## 测试工具

- **测试框架**: Vitest
- **断言库**: Vitest (兼容 Jest)
- **Mock 工具**: Vitest vi
- **React 测试**: React.isValidElement

## 测试原则

1. **全面性**: 覆盖所有核心功能和边缘情况
2. **独立性**: 每个测试用例相互独立
3. **清晰性**: 测试名称清楚描述测试内容
4. **可维护性**: 使用 beforeEach 设置测试环境
5. **真实性**: 模拟真实的 kiwi-intl 行为

## 已知限制

1. 测试使用模拟的 `kiwi-intl` 对象，不是真实的 kiwi-intl 实例
2. React 元素的渲染测试需要在实际的 React 环境中进行
3. 性能测试仅验证基本功能，未进行压力测试

## 未来改进

- [ ] 添加与真实 kiwi-intl 的集成测试
- [ ] 添加 React 渲染测试（使用 @testing-library/react）
- [ ] 添加性能基准测试
- [ ] 测试 Proxy 的内存使用情况
- [ ] 测试多语言切换场景

## 相关文件

- 源代码: `src/runtime/proxy.ts`
- 测试文件: `src/runtime/__tests__/proxy.test.ts`
- Babel 插件测试: `src/transform/__tests__/babel-plugin.test.ts`
