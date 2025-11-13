# @i18nflow/core

i18nflow 的核心抽象层，定义了所有适配器的接口和通用类型。

## 安装

```bash
pnpm add @i18nflow/core
```

## 核心接口

### ITransformAdapter

编译时转换适配器接口，用于在构建时识别和转换 i18n 调用。

### IRuntimeAdapter

运行时适配器接口，用于在运行时读取、更新翻译内容。

### IFileAdapter

文件操作适配器接口，用于读写不同格式的翻译文件。

## 使用示例

```typescript
import type { ITransformAdapter, IRuntimeAdapter } from '@i18nflow/core';

// 实现自定义适配器
class MyAdapter implements ITransformAdapter {
  // ...
}
```

## 开发

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check
```

## License

MIT

