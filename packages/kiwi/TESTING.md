# Kiwi Babel 插件测试指南

## 快速开始

### 运行测试

```bash
# 在 packages/kiwi 目录下
cd packages/kiwi

# 运行测试（watch 模式）
pnpm test

# 运行测试一次（CI 模式）
pnpm test:run

# 运行测试 UI（可视化界面）
pnpm test:ui
```

### 在根目录运行

```bash
# 在项目根目录
cd /path/to/i18nflow

# 运行所有包的测试
pnpm test:run

# 运行测试 UI
pnpm test:ui
```

## 测试框架

- **测试框架**: [Vitest](https://vitest.dev/) v2.0+
- **测试文件位置**: `src/transform/__tests__/babel-plugin.test.ts`
- **配置文件**: `vitest.config.ts`

## 测试覆盖

### ✅ 总共 33 个测试用例，覆盖 6 大场景：

1. **JSX 属性转换** (9 个测试)
   - 原生 HTML 标签属性
   - 自定义组件属性
   - template 方法调用

2. **JSX 子元素转换** (7 个测试)
   - 直接 I18N 调用
   - 变量引用

3. **对象属性转换** (4 个测试)
   - 对象中的 I18N 值
   - 函数返回值

4. **复杂场景** (4 个测试)
   - 混合场景
   - 表单示例
   - 列表渲染
   - 嵌套组件

5. **边界情况** (6 个测试)
   - 重复转换检测
   - 可选链支持
   - 大小写区分

6. **data-i18n-key 属性** (4 个测试)
   - 各种场景的属性添加

## 测试示例

### 基本用法

```typescript
import { describe, it, expect } from 'vitest';
import { transformSync } from '@babel/core';
import { createKiwiBabelPlugin } from '../babel-plugin';

describe('我的测试', () => {
  it('应该正确转换', () => {
    const code = `
      const Component = () => (
        <div>{I18N.common.title}</div>
      );
    `;

    const result = transformSync(code, {
      plugins: [[createKiwiBabelPlugin({ i18nIdentifier: 'I18N' })]],
      filename: 'test.tsx',
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
    });

    const output = result?.code || '';
    expect(output).toContain('String(I18N.common.title)');
  });
});
```

### 转换规则速查

| 场景           | 输入                               | 输出                                       | 转换 |
| -------------- | ---------------------------------- | ------------------------------------------ | ---- |
| 原生标签属性   | `<input placeholder={I18N.xxx} />` | `<input placeholder={String(I18N.xxx)} />` | ✅   |
| 自定义组件属性 | `<Card title={I18N.xxx} />`        | `<Card title={I18N.xxx} />`                | ❌   |
| JSX 子元素     | `<div>{I18N.xxx}</div>`            | `<div>{String(I18N.xxx)}</div>`            | ✅   |
| 变量引用       | `<div>{item.label}</div>`          | `<div>{item.label}</div>`                  | ❌   |
| 对象属性       | `{ title: I18N.xxx }`              | `{ title: I18N.xxx }`                      | ❌   |
| 函数返回       | `() => I18N.xxx`                   | `() => String(I18N.xxx)`                   | ✅   |

## CI/CD 集成

测试已集成到 Turbo 构建系统中：

```json
{
  "pipeline": {
    "test:run": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## 覆盖率

如需生成覆盖率报告，运行：

```bash
pnpm test:run --coverage
```

覆盖率报告将生成在 `coverage/` 目录下。

## 调试测试

### VS Code 调试配置

在 `.vscode/launch.json` 中添加：

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### 调试特定测试

```bash
# 运行特定文件的测试
pnpm test babel-plugin.test.ts

# 运行特定测试用例（使用 .only）
it.only('应该正确转换', () => {
  // ...
});
```

## 添加新测试

1. 在 `src/transform/__tests__/babel-plugin.test.ts` 中添加测试用例
2. 使用 `describe` 和 `it` 组织测试结构
3. 使用 `transform()` 辅助函数转换代码
4. 使用 `expect()` 断言结果

示例：

```typescript
describe('新功能', () => {
  it('应该支持 XXX 场景', () => {
    const code = `
      // 你的测试代码
    `;
    const output = transform(code);
    expect(output).toContain('期望的结果');
  });
});
```

## 参考文档

- [Vitest 官方文档](https://vitest.dev/)
- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook)
- [测试覆盖详情](./src/transform/__tests__/README.md)

## 常见问题

### Q: 测试失败怎么办？

A: 检查：

1. 依赖是否安装完整 (`pnpm install`)
2. 构建是否成功 (`pnpm build`)
3. 代码是否符合预期的转换规则

### Q: 如何更新快照？

A: Vitest 支持快照测试，使用 `-u` 参数更新：

```bash
pnpm test -u
```

### Q: 如何跳过某些测试？

A: 使用 `.skip`:

```typescript
it.skip('暂时跳过的测试', () => {
  // ...
});
```
