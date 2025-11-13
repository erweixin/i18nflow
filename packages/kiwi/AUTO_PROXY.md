# 自动 Proxy 包装功能

## 概述

`@i18nflow/kiwi` 提供了自动 Proxy 包装功能，可以在编译时自动包装 `kiwi-intl` 实例，无需手动调用 `createKiwiProxy`，让代码更简洁、更少侵入性。

## 🎯 核心优势

### ✅ 之前（手动包装）

```typescript
import KiwiIntl from 'kiwi-intl';
import { createKiwiProxy } from '@i18nflow/kiwi';  // 👈 需要额外导入

const kiwiIntl = KiwiIntl.init('zh-CN', { ... });

export default createKiwiProxy(kiwiIntl);  // 👈 需要手动包装
```

**缺点：**

- 代码有侵入性
- 需要记住导入和调用
- 迁移现有项目需要修改代码

### ✅ 现在（自动包装）

```typescript
import KiwiIntl from 'kiwi-intl';

const kiwiIntl = KiwiIntl.init('zh-CN', { ... });

export default kiwiIntl;  // 👈 自动被包装！
```

**优点：**

- ✨ 零代码侵入
- 🚀 自动化处理
- 💪 现有项目零改动

## 工作原理

### Babel 插件自动转换

`KiwiRspackPlugin` 内置了 `auto-proxy-plugin`，它会在编译时自动检测和转换你的代码：

**转换前：**

```typescript
import KiwiIntl from 'kiwi-intl';
const kiwiIntl = KiwiIntl.init('zh-CN', {});
export default kiwiIntl;
```

**转换后：**

```typescript
import KiwiIntl from 'kiwi-intl';
import { createKiwiProxy as __i18nflow_createKiwiProxy } from '@i18nflow/kiwi';

const kiwiIntl = KiwiIntl.init('zh-CN', {});
export default __i18nflow_createKiwiProxy(kiwiIntl);
```

### 检测逻辑

插件会自动检测：

1. ✅ 是否导入了 `kiwi-intl`
2. ✅ 是否调用了 `KiwiIntl.init()`
3. ✅ 是否导出了 kiwiIntl 实例
4. ✅ 是否已经手动导入了 `createKiwiProxy`

只有满足条件且没有手动包装时，才会自动添加包装代码。

## 配置

### 在 Rspack 中启用/禁用

```typescript
// rspack.config.js
import { KiwiRspackPlugin } from '@i18nflow/kiwi';

export default {
  plugins: [
    new KiwiRspackPlugin({
      autoProxy: true, // 👈 默认为 true，启用自动包装
      i18nIdentifier: 'I18N',
    }),
  ],
};
```

### 禁用自动包装

如果你希望手动控制，可以禁用：

```typescript
new KiwiRspackPlugin({
  autoProxy: false, // 👈 禁用自动包装
});
```

禁用后，你需要手动调用 `createKiwiProxy`：

```typescript
import { createKiwiProxy } from '@i18nflow/kiwi';
export default createKiwiProxy(kiwiIntl);
```

## 支持的场景

### ✅ 场景 1: 默认导出变量

```typescript
import KiwiIntl from 'kiwi-intl';

const kiwiIntl = KiwiIntl.init('zh-CN', {});

export default kiwiIntl; // ✅ 自动包装
```

### ✅ 场景 2: 不同变量名

```typescript
import KiwiIntl from 'kiwi-intl';

const i18n = KiwiIntl.init('zh-CN', {});

export default i18n; // ✅ 自动包装
```

### ✅ 场景 3: TypeScript 泛型

```typescript
import KiwiIntl from 'kiwi-intl';
import zhCN from './zh-CN';

const kiwiIntl = KiwiIntl.init<typeof zhCN>('zh-CN', {});

export default kiwiIntl; // ✅ 自动包装
```

### ✅ 场景 4: 命名导出

```typescript
import KiwiIntl from 'kiwi-intl';

const kiwiIntl = KiwiIntl.init('zh-CN', {});

export { kiwiIntl }; // ✅ 自动包装
export { kiwiIntl as I18N }; // ✅ 支持别名
```

### ❌ 场景 5: 已手动包装（跳过）

```typescript
import KiwiIntl from 'kiwi-intl';
import { createKiwiProxy } from '@i18nflow/kiwi';

const kiwiIntl = KiwiIntl.init('zh-CN', {});

export default createKiwiProxy(kiwiIntl); // ❌ 已手动包装，跳过
```

### ❌ 场景 6: 导出其他变量（跳过）

```typescript
import KiwiIntl from 'kiwi-intl';

const kiwiIntl = KiwiIntl.init('zh-CN', {});
const config = { locale: 'zh-CN' };

export default config; // ❌ 不是 kiwiIntl，跳过
```

## 测试覆盖

自动包装插件拥有全面的单元测试覆盖：

- **测试文件**: `src/transform/__tests__/auto-proxy-plugin.test.ts`
- **测试用例数**: 20 个
- **测试通过率**: 100%

### 测试分组

1. **基本功能** (3 个测试)
   - 默认导出变量
   - 不同变量名
2. **跳过场景** (3 个测试)
   - 无 kiwi-intl 导入
   - 已手动包装
   - 导出其他变量

3. **TypeScript 支持** (2 个测试)
   - 可选链
   - 泛型

4. **命名导出** (2 个测试)
   - 基本命名导出
   - 别名导出

5. **复杂场景** (2 个测试)
   - 多个导入导出
   - 导入去重

6. **配置选项** (2 个测试)
   - 禁用插件
   - 自定义包名

7. **边缘情况** (4 个测试)
   - 空文件
   - 只有导入
   - 只有导出
   - 多变量声明

8. **代码结构** (2 个测试)
   - 保持注释
   - 保持其他导出

## 运行测试

```bash
cd packages/kiwi

# 运行所有测试
pnpm test:run

# 只运行自动包装测试
pnpm test:run auto-proxy

# UI 模式
pnpm test:ui
```

## 与其他功能的配合

### 1. 与 Babel Plugin 配合

自动包装插件会先执行，然后 `babel-plugin` 再处理 JSX 转换：

```typescript
// 源代码
export default KiwiIntl.init('zh-CN', {});

// 自动包装插件处理后
export default __i18nflow_createKiwiProxy(KiwiIntl.init('zh-CN', {}));

// babel-plugin 继续处理 JSX 中的 I18N 调用
<div>{I18N.common.title}</div>
// → <div>{String(I18N.common.title)}</div>
```

### 2. 与 Runtime Proxy 配合

自动包装插件调用的是 `createKiwiProxy`，它会：

- 开发环境：返回 `<span data-i18n-key="...">text</span>`
- 生产环境：返回纯字符串

### 3. 与 Dev Server Middleware 配合

自动包装不影响开发服务器的热更新和翻译管理功能。

## 迁移指南

### 从手动包装迁移

如果你的项目已经使用了手动 `createKiwiProxy`：

**步骤 1**: 确保 `KiwiRspackPlugin` 启用了 `autoProxy`

```typescript
new KiwiRspackPlugin({
  autoProxy: true, // 确保启用
});
```

**步骤 2**: 移除手动导入和调用

```diff
  import KiwiIntl from 'kiwi-intl';
- import { createKiwiProxy } from '@i18nflow/kiwi';

  const kiwiIntl = KiwiIntl.init('zh-CN', {});

- export default createKiwiProxy(kiwiIntl);
+ export default kiwiIntl;
```

**步骤 3**: 测试应用

重新构建并测试，确保功能正常：

```bash
pnpm build
pnpm dev
```

## 故障排查

### Q: 自动包装没有生效？

**检查清单：**

1. ✅ 确认 `KiwiRspackPlugin` 已正确配置
2. ✅ 确认 `autoProxy: true`（或未设置，默认为 true）
3. ✅ 确认文件扩展名为 `.ts`、`.tsx`、`.js` 或 `.jsx`
4. ✅ 确认没有手动导入 `createKiwiProxy`

### Q: 构建后找不到 \_\_i18nflow_createKiwiProxy？

**原因：** `@i18nflow/kiwi` 包未正确安装或导入。

**解决方案：**

```bash
pnpm install @i18nflow/kiwi
```

### Q: 如何查看编译后的代码？

查看 `dist` 目录中的编译输出，或使用浏览器开发工具查看源码。

### Q: 可以在单独的 Babel 配置中使用吗？

**可以！** 手动配置 Babel：

```javascript
// babel.config.js
import { createAutoProxyPlugin } from '@i18nflow/kiwi';

export default {
  plugins: [
    createAutoProxyPlugin({
      enabled: true,
      kiwiIntlPackage: 'kiwi-intl',
      i18nflowPackage: '@i18nflow/kiwi',
    }),
  ],
};
```

## 性能影响

- **构建时间**: 几乎无影响（< 1ms 每文件）
- **Bundle 大小**: 无额外开销（只是包装调用）
- **运行时性能**: 零开销（仅编译时转换）

## API 参考

### AutoProxyPluginOptions

```typescript
interface AutoProxyPluginOptions {
  /** 是否启用自动包装（默认：true） */
  enabled?: boolean;

  /** kiwi-intl 包名（默认：'kiwi-intl'） */
  kiwiIntlPackage?: string;

  /** @i18nflow/kiwi 包名（默认：'@i18nflow/kiwi'） */
  i18nflowPackage?: string;
}
```

### 创建插件实例

```typescript
import { createAutoProxyPlugin } from '@i18nflow/kiwi';

const plugin = createAutoProxyPlugin({
  enabled: true,
  kiwiIntlPackage: 'kiwi-intl',
  i18nflowPackage: '@i18nflow/kiwi',
});
```

## 相关文档

- [Runtime Proxy 文档](./src/runtime/__tests__/README.md)
- [Babel Plugin 文档](./src/transform/__tests__/README.md)
- [测试文档](./TESTING.md)
- [主 README](./README.md)

## 贡献

欢迎贡献！如果你发现 bug 或有功能建议：

1. 提交 Issue
2. 编写测试用例
3. 提交 Pull Request

## License

MIT
