# @i18nflow/ui-react

React UI 组件包，提供可视化调试功能。

## 功能

- **I18nDebugProvider**: Context Provider，启用调试模式
- **I18nEditModal**: 编辑翻译的 Modal 组件
- **useI18nDebug**: 调试功能 Hook（读取/更新翻译、AI 翻译）

## 安装

```bash
pnpm add @i18nflow/ui-react
```

## 使用

```tsx
import { I18nDebugProvider } from '@i18nflow/ui-react';

function App() {
  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      {/* 你的应用 */}
    </I18nDebugProvider>
  );
}
```

### 使用 Hook

```tsx
import { useI18nDebug } from '@i18nflow/ui-react';

function MyComponent() {
  const { readI18nValue, updateI18nValue, translateText } = useI18nDebug();

  // 读取翻译
  const values = await readI18nValue('components.title');

  // 更新翻译
  await updateI18nValue('components.title', {
    'zh-CN': '标题',
    'en-US': 'Title',
  });

  // AI 翻译
  const translations = await translateText('你好', 3);
}
```

## 调试方式

1. 按住 `Ctrl + Shift`（Windows/Linux）或 `Cmd + Shift`（Mac）
2. 点击页面上的文案
3. 在弹出的 Modal 中编辑翻译
4. 保存后自动更新源文件并刷新页面

## License

MIT
