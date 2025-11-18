# i18nflow - Universal I18N Visual Debugging Tool

English | [简体中文](./readme.md)

> 📚 **[Full Documentation](./doc/README.md)** | 📦 **[Quick Start](./doc/QUICK_START.md)** | 🚀 **[Auto Proxy Wrapping](./packages/kiwi/AUTO_PROXY.md)** | 📄 **[License](./LICENSE)**

## 📋 Project Overview

**Core Philosophy:** Make translation work flow smoothly, achieving true WYSIWYG (What You See Is What You Get) development experience.

A universal I18N visual debugging tool that supports mainstream i18n libraries and build tools, providing the ultimate development experience with **Click-to-Edit** + **AI Translation** + **Instant Updates**.

## 📺 video demo

https://github.com/user-attachments/assets/8cffe7cf-1e7c-4990-a588-351618e73268

## 🚀 Try it Online

Experience the full functionality instantly in your browser, no installation required:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/erweixin/i18nflow/tree/main/playground/react-kiwi-rspack?file=src/App.tsx)

> 💡 **How to use:**
>
> 1. Wait for the project to start
> 2. Hold `Ctrl/Cmd + Shift` and click any text on the page
> 3. Experience AI translation and live editing in the popup modal

---

## ✨ Core Features

1. **🎯 Visual Editing** - Hold Ctrl/Cmd+Shift and click on any text to edit translations
2. **🤖 AI Translation** - Built-in OpenRouter AI translation, automatically generates multiple English candidates from Chinese input
3. **⚡ Instant Updates** - Automatically writes to source files and triggers hot reload after modifications, no page refresh needed
4. **🔧 Zero Intrusion** - Only enabled in development environment, zero impact on production code
5. **📦 Plugin-based** - Pluggable integration with various build tools and i18n libraries

---

## 🎯 Support Matrix

### I18N Library Support

| Library           | Status | Package Name              | Description                    |
| ----------------- | ------ | ------------------------- | ------------------------------ |
| **kiwi-intl**     | ✅     | `@i18nflow/kiwi`          | Full support, production ready |
| **react-i18next** | 🚧     | `@i18nflow/react-i18next` | Basic implementation, testing  |
| **react-intl**    | 📋     | `@i18nflow/react-intl`    | Planned                        |
| **i18next**       | 📋     | `@i18nflow/i18next`       | Planned                        |
| **vue-i18n**      | 📋     | `@i18nflow/vue-i18n`      | Planned                        |

### Build Tool Support

| Tool          | Status | Description                          |
| ------------- | ------ | ------------------------------------ |
| **Rspack**    | ✅     | Full support, recommended            |
| **Vite**      | ✅     | Full support, recommended            |
| **Webpack**   | ✅     | Supported via Babel Plugin           |
| **Next.js**   | 🚧     | In progress (based on react-i18next) |
| **Turbopack** | 📋     | Planned                              |

### UI Framework Support

| Framework   | Status | Package Name           | Description            |
| ----------- | ------ | ---------------------- | ---------------------- |
| **React**   | ✅     | `@i18nflow/ui-react`   | Full support           |
| **Vanilla** | ✅     | `@i18nflow/ui-vanilla` | Framework-free support |
| **Vue**     | 📋     | `@i18nflow/ui-vue`     | Planned                |
| **Svelte**  | 📋     | `@i18nflow/ui-svelte`  | Planned                |

**Legend:**

- ✅ **Implemented** - Production ready
- 🚧 **In Progress** - Basic features available, continuously improving
- 📋 **Planned** - Design complete, pending development

---

## 🏗️ Technical Architecture

### Core Principles

i18nflow adopts a **"Compile-time Injection + Runtime Proxy"** dual strategy to achieve zero-intrusion visual debugging:

#### 1. Compile-time: Babel Plugin Injects Markers

```typescript
// Developer's code
<div>{I18N.app.title}</div>

// ⬇️ After Babel compilation, data-i18n-key is automatically injected
<div data-i18n-key="app.title">{String(I18N.app.title)}</div>
```

#### 2. Runtime: Proxy Wrapping Returns React Elements

```typescript
// Development environment: I18N.app.title returns a React element with markers
I18N.app.title;
// → <span data-i18n-key="app.title">App Title</span>

// Production environment: Directly returns string
I18N.app.title;
// → "App Title"
```

#### 3. Why Dual Strategy?

| Scenario             | Compile-time | Runtime | Solution         |
| -------------------- | ------------ | ------- | ---------------- |
| Direct `I18N.xxx`    | ✅           | ✅      | Double safety    |
| Props multi-level    | ❌           | ✅      | Runtime fallback |
| Object/Array storage | ❌           | ✅      | Runtime fallback |
| Conditional/Dynamic  | ⚠️           | ✅      | Runtime fallback |

**Core Advantages:**

- **Compile-time Optimization** - Direct string conversion, reduces DOM nesting
- **Runtime Fallback** - Covers all scenarios that compile-time cannot handle
- **Zero Performance Loss** - Natural React rendering, no extra overhead
- **Fully Transparent** - Developers don't need to worry about implementation details

---

### Overall Architecture

```
┌──────────────────────────────────────────────┐
│       User Application (React/Vue/...)        │
└──────────────────┬───────────────────────────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
┌────▼─────┐              ┌──────▼──────┐
│ Compile  │              │   Runtime    │
│  Babel   │◄─────────────►│   Proxy     │
│  Plugin  │  Dual Strategy │   + UI      │
└────┬─────┘              └──────┬──────┘
     │                            │
     └─────────────┬──────────────┘
                   │
         ┌─────────▼──────────┐
         │  Dev Server Middleware │
         │  API + AI Translation  │
         └────────────────────┘
```

### Core Module Architecture

#### 1. **i18nflow-core** - Core Abstraction Layer

```typescript
// Compile-time core interface
interface ITransformAdapter {
  name: string;
  // Detect if it's an i18n call
  isI18nExpression(node: ASTNode): boolean;
  // Extract i18n key
  extractI18nKey(node: ASTNode): string | null;
  // Transform expression (inject markers)
  transformExpression(node: ASTNode, key: string): ASTNode;
  // Get configuration (translation file paths, languages, etc.)
  getConfig(): AdapterConfig;
}

// Runtime core interface (supports two marker strategies)
interface IRuntimeAdapter {
  name: string;

  // Strategy 1: Proxy wrapping strategy (recommended for custom i18n objects)
  // Return value has built-in data-i18n-key markers, no compile-time processing needed
  enableProxyWrapper?: boolean;
  wrapI18nObject?: (target: any) => any;

  // Strategy 2: Pure compile-time strategy (for third-party libraries)
  // Relies on compile-time injected markers, runtime only handles read/write
  readTranslation(key: string, locale: string): Promise<string>;
  updateTranslation(key: string, locale: string, value: string): Promise<boolean>;

  // Common methods
  getSupportedLocales(): string[];
  getCurrentLocale(): string;
}

// File operation interface
interface IFileAdapter {
  name: string; // 'typescript' | 'json' | 'yaml' | 'po'
  // Read file
  read(filePath: string, key: string): Promise<Record<string, string>>;
  // Update file
  update(filePath: string, key: string, values: Record<string, string>): Promise<boolean>;
  // Supported file extensions
  getSupportedExtensions(): string[];
}
```

#### 2. **i18nflow-adapters-\*** - Adapter Plugins

```
i18nflow-adapters-transform/
  ├── react-intl.ts       # FormattedMessage, useIntl, etc.
  ├── react-i18next.ts    # Trans, useTranslation, etc.
  ├── i18next.ts          # t() function
  ├── vue-i18n.ts         # $t(), <i18n>, etc.
  └── custom-proxy.ts     # Custom I18N object (current implementation, Proxy strategy)

i18nflow-adapters-runtime/
  ├── react-intl.ts
  ├── react-i18next.ts
  ├── i18next.ts
  ├── vue-i18n.ts
  └── custom-proxy.ts     # Contains Proxy wrapping logic

@i18nflow/
├── core               # Core types and interface definitions
├── shared             # Shared utilities (AST, file operations, etc.)
├── kiwi               # Kiwi-Intl adapter (✅ Production ready)
│   ├── transform/     # Babel plugin + auto Proxy injection
│   ├── runtime/       # Proxy wrapping + React element creation
│   ├── server/        # Dev server middleware + AI translation
│   └── plugin/        # Build tool plugins (Rspack/Vite)
├── react-i18next      # react-i18next adapter (🚧 In progress)
├── ui-react           # React UI components (debug panel)
└── ui-vanilla         # Framework-free UI components
```

---

## 📦 Quick Start

### Installation

```bash
# For projects using kiwi-intl
pnpm add -D @i18nflow/kiwi
```

### Configuration (Example: Rspack + Kiwi-Intl)

```typescript
// rspack.config.js
import { KiwiRspackPlugin } from '@i18nflow/kiwi/plugin-rspack';

export default {
  plugins: [
    new KiwiRspackPlugin({
      enabled: process.env.NODE_ENV === 'development',
      i18nIdentifier: 'I18N', // I18N object name
      localeDir: 'src/locales', // Language files directory
      locales: ['zh-CN', 'en-US'], // Supported languages
      autoProxy: true, // Auto Proxy wrapping
    }),
  ],
};
```

**Usage Steps:**

1. Hold `Ctrl/Cmd + Shift` and click on any text on the page
2. Edit the translation in the popup modal (automatically triggers AI translation)
3. Click save, automatically writes to source files and triggers hot reload

---

## 🎨 Detailed Documentation

- 📚 **[Full Documentation Center](./doc/README.md)** - View all documentation
- 📦 **[Quick Start Guide](./doc/QUICK_START.md)** - Get started in 5 minutes
- 🚀 **[Auto Proxy Wrapping](./packages/kiwi/AUTO_PROXY.md)** - Zero-intrusion configuration
- 🔧 **[Development Guide](./doc/DEV_GUIDE.md)** - Contributing guidelines
- 📝 **[Publishing Guide](./doc/PUBLISH_GUIDE.md)** - Release process

---

## 🤝 Contributing

Contributions, suggestions, and issue reports are welcome!

## 📄 License

MIT © [erweixin](https://github.com/erweixin)
