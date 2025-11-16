# Next.js + react-i18next + i18nflow 示例

这是一个集成了 i18nflow 可视化调试功能的 Next.js 应用示例。

## 🚀 快速开始

### 安装依赖

在 monorepo 根目录执行：

```bash
pnpm install
```

### 启动开发服务器

在当前目录执行：

```bash
npm run dev
```

或在 monorepo 根目录执行：

```bash
pnpm --filter nextjs-react-i18next-demo dev
```

### 访问应用

打开浏览器访问：http://localhost:3033

## ✨ 主要特性

- ✅ **Next.js 14 App Router** - 使用最新的 Next.js 架构
- ✅ **SSR 支持** - 完整的服务端渲染支持
- ✅ **TypeScript** - 完整的类型支持
- ✅ **可视化调试** - 按住 Ctrl+Shift 点击文案即可编辑
- ✅ **独立开发服务器** - 解决 Next.js 无法使用 webpack middleware 的问题
- ✅ **一键启动** - 自动同时启动 Next.js 和 i18n 服务

## 📝 如何编辑翻译

1. 启动开发服务器（`npm run dev`）
2. 在浏览器中打开应用
3. 按住 **Ctrl + Shift** (Windows/Linux) 或 **Cmd + Shift** (Mac)
4. 点击任意翻译文案
5. 在弹出的编辑框中修改内容
6. 点击"保存"
7. 翻译文件会自动更新，页面会自动刷新

## 🔧 技术架构

### 独立开发服务器方案

由于 Next.js 不支持 webpack-dev-server 的 middleware 配置，我们采用了独立开发服务器的方案：

```
npm run dev
    ↓
concurrently (并发执行)
    ↓
    ├─→ npm run dev:next    → Next.js (端口 3033)
    └─→ npm run dev:i18n    → i18n 服务器 (端口 3034)
```

### 请求代理

Next.js 配置了 rewrites，将 `/api/i18n` 请求代理到独立服务器：

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/i18n/:path*',
      destination: 'http://localhost:3034/api/i18n/:path*',
    },
  ];
}
```

### API 接口

i18n 开发服务器提供以下接口：

- `GET /api/i18n/health` - 健康检查
- `GET /api/i18n/read?key=xxx` - 读取翻译内容
- `POST /api/i18n/update` - 更新翻译内容
- `POST /api/i18n/translate` - AI 翻译（待实现）

## 📁 项目结构

```
.
├── src/
│   ├── app/
│   │   └── [lng]/              # 语言路由
│   │       ├── layout.tsx      # 布局（包含 I18nDebugProvider）
│   │       ├── page.tsx        # 首页
│   │       └── ...
│   └── i18n/
│       ├── locales/            # 翻译文件
│       │   ├── zh-CN/
│       │   │   ├── common.json
│       │   │   └── ...
│       │   └── en-US/
│       │       ├── common.json
│       │       └── ...
│       ├── client.ts           # 客户端 i18n 配置
│       ├── index.ts            # 服务端 i18n 配置
│       └── settings.ts         # 通用配置
├── next.config.js              # Next.js 配置（包含 rewrites）
├── package.json                # 依赖和脚本
├── QUICK_START.md              # 快速开始指南
└── DEV_SERVER_SETUP.md         # 详细配置说明
```

## 🎯 关键配置

### 1. package.json

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:next\" \"npm run dev:i18n\" -n \"next,i18n\" -c \"cyan,green\"",
    "dev:next": "next dev -p 3033",
    "dev:i18n": "i18n-dev-server -p 3034 -d src/i18n/locales -l zh-CN,en-US -n common"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 2. next.config.js

```javascript
const { ReactI18nextNextPlugin } = require('@i18nflow/react-i18next/plugin-next');

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/i18n/:path*',
        destination: 'http://localhost:3034/api/i18n/:path*',
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.plugins.push(
        new ReactI18nextNextPlugin({
          localeDir: 'src/i18n/locales',
          locales: ['zh-CN', 'en-US'],
          defaultNs: 'common',
        })
      );
    }
    return config;
  },
};
```

### 3. layout.tsx

```tsx
import { I18nDebugProvider } from '@i18nflow/react-i18next';

export default function LngLayout({ children, params: { lng } }) {
  return (
    <html lang={lng}>
      <body>
        {children}
        <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
```

## 🎨 优势

✅ **侵入性极小** - 只需修改启动脚本和配置文件，应用代码无需改动  
✅ **一条命令启动** - `npm run dev` 自动启动所有需要的服务  
✅ **开发体验好** - 彩色日志，便于区分不同服务的输出  
✅ **配置灵活** - 支持自定义端口、目录、语言等  
✅ **生产安全** - 所有调试功能仅在开发环境启用

## 📚 相关文档

- [快速开始指南](./QUICK_START.md) - 最简单的使用说明
- [详细配置说明](./DEV_SERVER_SETUP.md) - 深入了解配置细节
- [i18nflow 使用指南](./I18NFLOW_SETUP.md) - 完整的功能介绍
- [API 接口文档](./API_REFERENCE.md) - API 详细说明

## 🔍 故障排查

### 问题：无法连接到 i18n 服务器

**检查：**

1. i18n 服务器是否正常启动（查看终端日志）
2. 端口 3034 是否被占用
3. Next.js rewrites 配置是否正确

**解决：**

```bash
# 检查端口占用
lsof -i :3034

# 使用不同端口
npm run dev:i18n -- -p 3035
```

### 问题：点击文案没有反应

**检查：**

1. 是否按住了 Ctrl+Shift (或 Cmd+Shift)
2. 浏览器控制台是否有错误
3. i18n 服务器是否正常响应

### 问题：修改后页面没有更新

**检查：**

1. 翻译文件是否真的被修改了
2. 浏览器是否自动刷新
3. 缓存是否需要清理

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
