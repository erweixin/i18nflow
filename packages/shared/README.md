# @i18nflow/shared

通用工具和逻辑包。

## 功能

提供 i18nflow 的通用工具：

- **AST 工具**: Babel AST 解析、生成、遍历
- **文件工具**: 文件读写、路径解析
- **检测器**: i18n 方案检测引擎
- **Server 中间件**: Dev Server 中间件基础工具

## 安装

```bash
pnpm add @i18nflow/shared
```

## 使用

```typescript
import { parseCode, generateCode, detectInProject } from '@i18nflow/shared';

// 解析代码
const ast = parseCode('const a = 1;');

// 生成代码
const { code } = generateCode(ast);

// 检测项目
const detected = detectInProject(process.cwd(), [{ type: 'call', name: 'KiwiIntl.init' }]);
```

## License

MIT
