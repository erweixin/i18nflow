# @i18nflow/ui-vanilla

Framework-agnostic debugging UI for i18nflow. Built with vanilla JavaScript, no dependencies on React, Vue, or any other framework.

## Features

- ✅ **Framework Agnostic** - Works with any framework or vanilla JS
- ✅ **Zero Dependencies** - No React, Vue, or other framework dependencies
- ✅ **Lightweight** - Small bundle size
- ✅ **TypeScript Support** - Full TypeScript definitions
- ✅ **Easy Integration** - Simple API, auto-injection support

## Installation

```bash
npm install @i18nflow/ui-vanilla
# or
pnpm add @i18nflow/ui-vanilla
```

## Usage

### Manual Initialization

```typescript
import { I18nDebugUI } from '@i18nflow/ui-vanilla';

// Create instance
const debugUI = new I18nDebugUI({
  enabled: process.env.NODE_ENV === 'development',
  apiBase: '/api/i18n', // optional, default: '/api/i18n'
});

// When you're done, you can destroy it
// debugUI.destroy();
```

### Convenience Method

```typescript
import { initI18nDebugUI } from '@i18nflow/ui-vanilla';

initI18nDebugUI({
  enabled: process.env.NODE_ENV === 'development',
});
```

## How It Works

1. Press and hold `Ctrl/Cmd + Shift`
2. Click on any text with `data-i18n-key` attribute
3. Edit the translation in the modal
4. Save and the page will auto-reload

## API

### `I18nDebugUI`

```typescript
class I18nDebugUI {
  constructor(options?: I18nDebugUIOptions);
  destroy(): void;
}

interface I18nDebugUIOptions {
  enabled?: boolean; // default: true
  apiBase?: string; // default: '/api/i18n'
}
```

### `initI18nDebugUI`

```typescript
function initI18nDebugUI(options?: { enabled?: boolean; apiBase?: string }): I18nDebugUI | null;
```

## License

MIT
