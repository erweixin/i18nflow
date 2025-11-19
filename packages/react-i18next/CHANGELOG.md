# Changelog

## 0.2.2-beta.0

### Patch Changes

- @i18nflow/core@0.2.2-beta.0
- @i18nflow/shared@0.2.2-beta.0
- @i18nflow/ui-react@0.2.2-beta.0

## 0.1.1

### Patch Changes

- 6f50e4e: support file spread import
- Updated dependencies [6f50e4e]
  - @i18nflow/core@0.2.1
  - @i18nflow/shared@0.2.1
  - @i18nflow/ui-react@0.2.1

## 0.1.0

### Minor Changes

- e0ffddc: init

### Patch Changes

- Updated dependencies [e0ffddc]
- Updated dependencies [57c4b7a]
  - @i18nflow/core@0.2.0
  - @i18nflow/shared@0.2.0
  - @i18nflow/ui-react@0.2.0

All notable changes to this project will be documented in this file.

## [0.1.0-beta.0] - 2024-01-XX

### Added

- 🎉 Initial release of `@i18nflow/react-i18next`
- ✨ Runtime Proxy wrapper for i18next instances
- 🔧 Babel plugin for automatic translation key detection
- 🎯 Support for `t()` function calls and `<Trans>` components
- 🚀 Next.js plugin with webpack integration
- 🌟 Vite plugin support
- 📝 Dev server middleware for translation CRUD operations
- 🎨 Visual debugging with click-to-edit functionality
- 🔄 Hot Module Replacement (HMR) support
- 📦 Complete TypeScript type definitions

### Features

- **Runtime Proxy**: Automatically wraps i18next `t()` function to add `data-i18n-key` attributes
- **Babel Transform**: Identifies translation calls at compile time
- **Next.js Integration**: Seamless integration with Next.js 14+
- **Vite Integration**: Full support for Vite-based projects
- **Multi-namespace**: Support for multiple translation namespaces
- **JSON File Format**: Read and write JSON translation files
- **Zero Production Impact**: Debugging features only active in development mode

### Components

- `I18nDebugProvider` - Context provider for debug functionality
- `I18nEditModal` - Translation editing modal
- `useI18nDebug` - Hook for accessing debug features

### Configuration

- Configurable locale directory
- Configurable supported languages
- Configurable default namespace
- Optional AI translation support (coming soon)

### Technical Details

- Built with TypeScript 5.3+
- Uses Babel 7.23+ for code transformation
- Compatible with React 16.8+
- Compatible with i18next 20.0+
- Compatible with react-i18next 11.0+

### Documentation

- Comprehensive README
- Setup guide for Next.js
- Setup guide for Vite
- API reference
- TypeScript type definitions

## [Unreleased]

### Planned Features

- 🤖 AI-powered translation suggestions
- 📊 Translation coverage reports
- 🔍 Missing translation detection
- 🎨 Custom theme support
- 📱 Mobile-friendly editing interface
- 🌐 Support for more file formats (YAML, .po)
- 🔄 Translation memory
- 👥 Multi-user collaboration
- 📝 Translation history and versioning
