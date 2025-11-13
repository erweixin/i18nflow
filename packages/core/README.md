# @i18nflow/core

核心接口和类型定义包。

## 功能

提供 i18nflow 的核心接口和类型定义：

- **ITransformAdapter**: Transform 适配器接口（编译时转换）
- **IRuntimeAdapter**: Runtime 适配器接口（运行时包装）
- **IFileAdapter**: 文件适配器接口（文件读写）
- **类型定义**: 框架类型、检测规则、配置类型等

## 安装

```bash
pnpm add @i18nflow/core
```

## 使用

```typescript
import type { ITransformAdapter, AdapterConfig } from '@i18nflow/core';

// 实现自定义适配器
class MyTransformAdapter implements ITransformAdapter {
  name = 'my-adapter';

  createBabelPlugin(config?: TransformAdapterConfig) {
    // 实现 Babel 插件
  }
}
```

## License

MIT
