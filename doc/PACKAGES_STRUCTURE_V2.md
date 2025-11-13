# Packages 结构设计 V2 (按 i18n 方案划分)

基于实际使用场景，将每个 i18n 方案的相关功能（transform + runtime + 配置）放在同一个包中。

## 📦 新的包结构

### 核心包（3个）

#### 1. @i18nflow/core

**职责**: 核心接口定义和类型

```typescript
// 接口定义
export interface ITransformAdapter { ... }
export interface IRuntimeAdapter { ... }
export interface IFileAdapter { ... }

// 配置类型
export interface AdapterConfig { ... }
export interface DetectRule { ... }
```

**依赖**: 无

---

#### 2. @i18nflow/shared

**职责**: 通用工具和组件

**内容**:

```
shared/
├── src/
│   ├── utils/
│   │   ├── ast.ts              # AST 操作工具
│   │   ├── detector.ts         # 检测规则引擎
│   │   └── file-utils.ts       # 文件操作工具
│   ├── server/
│   │   ├── middleware.ts       # Dev Server 中间件基类
│   │   └── api.ts             # API 路由处理
│   └── types/
│       └── common.ts          # 通用类型定义
```

**依赖**: @i18nflow/core

---

#### 3. @i18nflow/ui-react

**职责**: React 通用 UI 组件（EditModal、Provider 等）

**内容**:

```
ui-react/
├── src/
│   ├── components/
│   │   ├── I18nDebugProvider.tsx    # Context Provider
│   │   ├── I18nEditModal.tsx        # 编辑弹窗
│   │   └── I18nOverlay.tsx          # 悬浮提示
│   ├── hooks/
│   │   ├── useI18nDebug.ts          # Debug Hook
│   │   └── useI18nEdit.ts           # 编辑 Hook
│   └── styles/
│       └── modal.css                # 样式
```

**依赖**:

- @i18nflow/core
- @i18nflow/shared
- react (peerDependency)

---

### i18n 方案包（按方案划分）

#### 4. @i18nflow/kiwi

**职责**: Kiwi-Intl 完整解决方案

**内容**:

```
kiwi/
├── src/
│   ├── transform/
│   │   ├── babel-plugin.ts        # Babel 插件（Proxy 自动注入）
│   │   └── detector.ts            # Kiwi 特定的检测逻辑
│   ├── runtime/
│   │   ├── proxy.ts               # Proxy 包装实现
│   │   ├── adapter.ts             # Runtime 适配器
│   │   └── auto.ts                # 自动导入的工具函数
│   ├── file/
│   │   └── typescript.ts          # TypeScript 文件操作
│   ├── plugin/
│   │   ├── webpack.ts             # Webpack 插件
│   │   ├── rspack.ts              # Rspack 插件
│   │   └── vite.ts                # Vite 插件
│   └── index.ts                   # 统一导出
```

**导出**:

```typescript
// Transform
export { KiwiBabelPlugin, createKiwiTransform } from './transform';

// Runtime
export { createKiwiProxy, KiwiRuntimeAdapter } from './runtime';
export { __i18nflow_createProxy } from './runtime/auto';

// File
export { KiwiFileAdapter } from './file';

// Plugins
export { KiwiWebpackPlugin } from './plugin/webpack';
export { KiwiRspackPlugin } from './plugin/rspack';
export { KiwiVitePlugin } from './plugin/vite';
```

**依赖**:

- @i18nflow/core
- @i18nflow/shared
- @i18nflow/ui-react
- @babel/core (transform)
- kiwi-intl (peerDependency)

**使用方式**:

```typescript
// rspack.config.js
import { KiwiRspackPlugin } from '@i18nflow/kiwi';

export default {
  plugins: [
    new KiwiRspackPlugin({
      framework: 'react',
      files: ['./src/locales/I18N.ts'],
      detectRules: [{ type: 'call', name: 'KiwiIntl.init' }],
    }),
  ],
};
```

---

#### 5. @i18nflow/react-intl

**职责**: React Intl 完整解决方案

**内容**:

```
react-intl/
├── src/
│   ├── transform/
│   │   └── babel-plugin.ts        # 识别 FormattedMessage 等
│   ├── runtime/
│   │   └── adapter.ts             # Runtime 适配器
│   ├── file/
│   │   ├── json.ts                # JSON 文件操作
│   │   └── typescript.ts          # TS 文件操作
│   ├── plugin/
│   │   ├── webpack.ts
│   │   ├── rspack.ts
│   │   └── vite.ts
│   └── index.ts
```

**导出**:

```typescript
export { ReactIntlBabelPlugin } from './transform';
export { ReactIntlRuntimeAdapter } from './runtime';
export { ReactIntlFileAdapter } from './file';
export { ReactIntlWebpackPlugin } from './plugin/webpack';
```

**依赖**:

- @i18nflow/core
- @i18nflow/shared
- @i18nflow/ui-react
- react-intl (peerDependency)

---

#### 6. @i18nflow/react-i18next

**职责**: React-i18next 完整解决方案

**内容**:

```
react-i18next/
├── src/
│   ├── transform/
│   │   └── babel-plugin.ts        # 识别 Trans、t() 等
│   ├── runtime/
│   │   └── adapter.ts
│   ├── file/
│   │   ├── json.ts
│   │   └── yaml.ts                # 支持 YAML
│   ├── plugin/
│   │   ├── webpack.ts
│   │   ├── rspack.ts
│   │   └── vite.ts
│   └── index.ts
```

**依赖**:

- @i18nflow/core
- @i18nflow/shared
- @i18nflow/ui-react
- react-i18next, i18next (peerDependency)

---

#### 7. @i18nflow/vue-i18n

**职责**: Vue-i18n 完整解决方案

**内容**:

```
vue-i18n/
├── src/
│   ├── transform/
│   │   └── babel-plugin.ts        # 识别 $t()、<i18n-t> 等
│   ├── runtime/
│   │   └── adapter.ts
│   ├── file/
│   │   ├── json.ts
│   │   └── yaml.ts
│   ├── plugin/
│   │   ├── webpack.ts
│   │   └── vite.ts
│   └── index.ts
```

**依赖**:

- @i18nflow/core
- @i18nflow/shared
- @i18nflow/ui-vue (Vue 版本的 UI 组件)
- vue-i18n (peerDependency)

---

#### 8. @i18nflow/ui-vue

**职责**: Vue 通用 UI 组件

**内容**:

```
ui-vue/
├── src/
│   ├── components/
│   │   ├── I18nDebugPlugin.ts
│   │   └── I18nEditModal.vue
│   └── composables/
│       └── useI18nDebug.ts
```

---

## 📊 新旧结构对比

### 旧结构（按功能类型划分）

```
@i18nflow/adapters-transform     # 所有 transform
@i18nflow/adapters-runtime       # 所有 runtime
@i18nflow/adapters-file          # 所有 file
@i18nflow/plugin-webpack         # Webpack 插件
@i18nflow/plugin-vite            # Vite 插件
@i18nflow/runtime-react          # React 组件
```

**问题**:

- ❌ 一个 i18n 方案需要安装多个包
- ❌ transform 和 runtime 分离，不内聚
- ❌ 版本管理复杂

### 新结构（按 i18n 方案划分）

```
@i18nflow/core                   # 核心接口
@i18nflow/shared                 # 通用工具
@i18nflow/ui-react               # React UI 组件
@i18nflow/kiwi                   # Kiwi 完整方案 ⭐
@i18nflow/react-intl             # React Intl 完整方案 ⭐
@i18nflow/react-i18next          # React-i18next 完整方案 ⭐
```

**优势**:

- ✅ 一个包包含完整方案
- ✅ transform 和 runtime 在一起，内聚性强
- ✅ 版本管理清晰
- ✅ 用户只需安装一个包

---

## 🎯 包依赖关系

```
                    @i18nflow/core
                          │
                 @i18nflow/shared
                          │
            ┌─────────────┼─────────────┐
            │             │             │
      @i18nflow/ui-react  │   @i18nflow/ui-vue
            │             │             │
            ├─────────────┼─────────────┤
            │             │             │
      @i18nflow/kiwi      │       @i18nflow/vue-i18n
      @i18nflow/react-intl│
      @i18nflow/react-i18next
```

---

## 🚀 使用示例

### Kiwi-Intl 用户

```bash
# 只需安装一个包
pnpm add -D @i18nflow/kiwi
```

```typescript
// rspack.config.js
import { KiwiRspackPlugin } from '@i18nflow/kiwi';

export default {
  plugins: [
    new KiwiRspackPlugin({
      framework: 'react',
      files: ['./src/locales/I18N.ts'],
      locales: ['zh-CN', 'en-US'],
    }),
  ],
};
```

```tsx
// App.tsx
import { I18nDebugProvider } from '@i18nflow/kiwi';
// 注意：UI 组件实际来自 @i18nflow/ui-react，但通过 kiwi 包 re-export

function App() {
  return <I18nDebugProvider>{/* 你的应用 */}</I18nDebugProvider>;
}
```

### React Intl 用户

```bash
pnpm add -D @i18nflow/react-intl
```

```typescript
// webpack.config.js
import { ReactIntlWebpackPlugin } from '@i18nflow/react-intl';

module.exports = {
  plugins: [
    new ReactIntlWebpackPlugin({
      locales: ['en-US', 'zh-CN'],
      translationFiles: {
        'en-US': './src/locales/en-US.json',
        'zh-CN': './src/locales/zh-CN.json',
      },
    }),
  ],
};
```

---

## 📦 最终包列表

**总包数**: **8 个包**

### 核心包（3个）

1. @i18nflow/core - 核心接口和类型
2. @i18nflow/shared - 通用工具和逻辑
3. @i18nflow/ui-react - React UI 组件

### i18n 方案包（5个）

4. @i18nflow/kiwi - Kiwi-Intl 完整方案 ⭐
5. @i18nflow/react-intl - React Intl 完整方案
6. @i18nflow/react-i18next - React-i18next 完整方案
7. @i18nflow/vue-i18n - Vue-i18n 完整方案
8. @i18nflow/ui-vue - Vue UI 组件

---

## 🎨 包内容对比

### @i18nflow/kiwi 的完整内容

```typescript
// Transform (Babel)
export { KiwiBabelPlugin } from './transform/babel-plugin';
export { createKiwiTransform } from './transform';

// Runtime (Proxy 包装)
export { createKiwiProxy } from './runtime/proxy';
export { KiwiRuntimeAdapter } from './runtime/adapter';
export { __i18nflow_createProxy } from './runtime/auto';

// File Operations
export { KiwiFileAdapter } from './file/typescript';

// Build Tool Plugins
export { KiwiWebpackPlugin } from './plugin/webpack';
export { KiwiRspackPlugin } from './plugin/rspack';
export { KiwiVitePlugin } from './plugin/vite';

// UI Components (re-export from @i18nflow/ui-react)
export { I18nDebugProvider, I18nEditModal, useI18nDebug } from '@i18nflow/ui-react';

// Config
export { KiwiConfig } from './config';
```

---

## 🔄 迁移指南

### 从旧结构迁移

```bash
# 旧方式（需要多个包）
pnpm add -D @i18nflow/adapters-transform
pnpm add -D @i18nflow/adapters-runtime
pnpm add -D @i18nflow/plugin-rspack
pnpm add -D @i18nflow/runtime-react

# 新方式（一个包搞定）
pnpm add -D @i18nflow/kiwi
```

```typescript
// 旧导入
import { CustomProxyTransformAdapter } from '@i18nflow/adapters-transform';
import { CustomProxyRuntimeAdapter } from '@i18nflow/adapters-runtime';
import { RspackPlugin } from '@i18nflow/plugin-rspack';

// 新导入
import { KiwiRspackPlugin } from '@i18nflow/kiwi';
```

---

## ✅ 新结构的优势

1. **更好的内聚性**: 一个 i18n 方案的所有代码在一起
2. **更简单的安装**: 只需安装一个包
3. **更清晰的版本管理**: 每个方案独立版本
4. **更小的依赖体积**: 只安装需要的方案
5. **更容易维护**: 相关代码在同一个仓库目录
6. **更好的文档组织**: 每个包有完整的使用文档

---

## 🚀 开发优先级

### MVP (最小可用产品)

#### 阶段 1: 核心基础（1-2周）

1. @i18nflow/core - 接口定义
2. @i18nflow/shared - 通用工具
3. @i18nflow/ui-react - UI 组件

#### 阶段 2: Kiwi 方案（2-3周）

4. @i18nflow/kiwi - 完整实现
   - Transform (Babel)
   - Runtime (Proxy)
   - File (TypeScript)
   - Plugin (Rspack)

#### 阶段 3: 验证和优化（1周）

- 用 playground/react-kiwi-rspack 验证
- 优化性能和 API
- 完善文档

### 扩展阶段

#### 阶段 4: React Intl 支持（2-3周）

5. @i18nflow/react-intl

#### 阶段 5: React-i18next 支持（2-3周）

6. @i18nflow/react-i18next

#### 阶段 6: Vue 生态（3-4周）

7. @i18nflow/ui-vue
8. @i18nflow/vue-i18n

---

## 📝 总结

新的包结构按 **i18n 方案** 划分，每个包包含该方案的完整功能：

- **Transform** (Babel 插件)
- **Runtime** (运行时适配器)
- **File** (文件操作)
- **Plugins** (构建工具插件)
- **配置和类型定义**

通用的功能（EditModal、工具函数等）提取到 `@i18nflow/shared` 和 `@i18nflow/ui-react`。

这样的设计更符合用户的使用场景，也更容易维护和扩展！🎉
