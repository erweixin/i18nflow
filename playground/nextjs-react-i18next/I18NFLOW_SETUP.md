# i18nflow 可视化调试配置说明

本项目已集成 `@i18nflow/react-i18next` 包，实现翻译内容的可视化调试功能。

## 功能特性

- ✨ **运行时 Proxy** - 自动为翻译内容添加 `data-i18n-key` 标记
- 🔧 **编译时转换** - Babel 插件自动识别 `t()` 调用和 `<Trans>` 组件
- 🎯 **可视化调试** - 按住 Ctrl/Cmd 键点击翻译内容即可编辑
- 🚀 **即时生效** - 修改后自动写入文件并触发 HMR
- 🌍 **支持多语言** - 同时编辑多个语言的翻译

## 配置说明

### 1. Next.js 配置 (`next.config.js`)

```javascript
const { ReactI18nextNextPlugin } = require('@i18nflow/react-i18next/plugin-next');

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // 只在开发环境的客户端启用 i18nflow 调试插件
    if (dev && !isServer) {
      config.plugins.push(
        new ReactI18nextNextPlugin({
          localeDir: 'src/i18n/locales', // 翻译文件目录
          locales: ['zh-CN', 'en-US'], // 支持的语言
          defaultNs: 'common', // 默认命名空间
        })
      );
    }
    return config;
  },
};
```

### 2. 应用布局配置 (`src/app/[lng]/layout.tsx`)

```tsx
'use client';

import { I18nDebugProvider } from '@i18nflow/react-i18next';

export default function LngLayout({ children, params: { lng } }) {
  return (
    <html lang={lng}>
      <body>
        <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
          {children}
        </I18nDebugProvider>
      </body>
    </html>
  );
}
```

### 3. 依赖安装

```json
{
  "dependencies": {
    "@i18nflow/react-i18next": "workspace:*"
  },
  "devDependencies": {
    "babel-loader": "^9.1.0"
  }
}
```

## 使用方法

### 1. 启动开发服务器

```bash
pnpm install
pnpm dev
```

### 2. 编辑翻译内容

1. **按住 Ctrl/Cmd 键** + **点击任意翻译文案**
2. 在弹出的编辑框中修改翻译内容
3. 点击"保存"按钮
4. 翻译文件会自动更新，页面会自动刷新

### 3. 支持的翻译方式

#### 方式 1：使用 `t()` 函数

```tsx
const { t } = useTranslation(lng, 'common');

// 简单使用
<div>{t('title')}</div>

// 带参数
<div>{t('welcome', { name: 'John' })}</div>

// 指定 namespace
<div>{t('common:title')}</div>
```

#### 方式 2：使用 `<Trans>` 组件

```tsx
import { Trans } from 'react-i18next';

<Trans i18nKey="welcome">
  Welcome to <strong>Next.js</strong>
</Trans>;
```

## 工作原理

### 编译时处理（Babel 插件）

1. 识别所有 `t()` 函数调用
2. 识别 `<Trans>` 组件
3. 在 JSX 元素上添加 `data-i18n-key` 属性
4. 对原生 HTML 标签的属性值添加 `String()` 包装

### 运行时处理（Proxy 包装）

1. 包装 i18next 实例的 `t` 函数
2. 返回带 `data-i18n-key` 属性的 `<span>` 元素
3. Proxy 实现 `toString()`/`valueOf()` 方法，确保字符串兼容性

### 中间件处理（API 服务）

- `GET /api/i18n/read?key=xxx` - 读取翻译内容
- `POST /api/i18n/update` - 更新翻译内容
- `POST /api/i18n/translate` - AI 翻译（待实现）

## 文件结构

```
src/i18n/locales/
├── zh-CN/
│   ├── common.json      # 通用翻译
│   ├── advanced.json    # 高级示例翻译
│   ├── api.json         # API 示例翻译
│   └── form.json        # 表单翻译
└── en-US/
    ├── common.json
    ├── advanced.json
    ├── api.json
    └── form.json
```

## 注意事项

1. **仅开发环境启用** - 生产环境不会包含调试功能
2. **快捷键操作** - 必须按住 Ctrl/Cmd 键才能点击编辑
3. **自动保存** - 修改会立即写入源文件
4. **HMR 支持** - 修改后页面自动刷新

## 高级配置

### 自定义快捷键

```tsx
<I18nDebugProvider
  enabled={true}
  hotkey="Alt" // 修改为 Alt 键
>
  {children}
</I18nDebugProvider>
```

### 自定义样式

可以通过 CSS 自定义编辑弹窗的样式：

```css
.i18n-debug-modal {
  /* 自定义样式 */
}
```

## 故障排除

### 1. 点击无反应

- 确认已按住 Ctrl/Cmd 键
- 确认在开发环境（`NODE_ENV=development`）
- 检查浏览器控制台是否有错误

### 2. 修改不生效

- 检查文件路径配置是否正确
- 确认有文件写入权限
- 查看终端日志确认更新是否成功

### 3. 页面不刷新

- 检查 HMR 是否正常工作
- 尝试手动刷新页面
- 检查 webpack 配置

## 更多信息

- [完整文档](../../packages/react-i18next/README.md)
- [API 参考](./API_REFERENCE.md)
- [高级功能](./ADVANCED_FEATURES.md)
