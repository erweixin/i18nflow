# @i18nflow/ui-vanilla

## 0.2.0

### Minor Changes

- e0ffddc: init

### Patch Changes

- Updated dependencies [e0ffddc]
- Updated dependencies [57c4b7a]
  - @i18nflow/core@0.2.0
  - @i18nflow/shared@0.2.0

## v0.1.0-beta.0 (2025-11-16)

### Features

- ✨ **Framework-agnostic debugging UI** - Built with vanilla JavaScript, no React/Vue dependencies
- ✨ **Auto-injection support** - Can be automatically injected by build plugins
- ✨ **Lightweight** - Small bundle size with zero framework dependencies
- ✨ **Full TypeScript support** - Complete type definitions

### Architecture

This package is designed as a **core dependency** of `@i18nflow/kiwi`. Users don't need to install it directly:

```json
{
  "devDependencies": {
    "@i18nflow/kiwi": "workspace:*"
    // ✅ @i18nflow/ui-vanilla is included automatically
  }
}
```

### Usage

#### Via Plugin (Recommended)

```typescript
// Rspack
import { KiwiRspackPlugin } from '@i18nflow/kiwi/plugin-rspack';

new KiwiRspackPlugin({
  autoInjectDebugUI: true, // ✅ UI auto-injected
});

// Vite
import { KiwiVitePlugin } from '@i18nflow/kiwi/plugin-vite';

KiwiVitePlugin({
  autoInjectDebugUI: true, // ✅ UI auto-injected
});
```

#### Manual Usage

```typescript
import { I18nDebugUI } from '@i18nflow/ui-vanilla';

new I18nDebugUI({
  enabled: process.env.NODE_ENV === 'development',
  apiBase: '/api/i18n',
});
```

### API

```typescript
class I18nDebugUI {
  constructor(options?: { enabled?: boolean; apiBase?: string });

  destroy(): void;
}
```
