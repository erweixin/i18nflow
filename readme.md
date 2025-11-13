# i18nflow - 通用化 I18N 可视化调试工具

## 📋 项目概述

**项目名称：** i18nflow

**核心理念：** 让翻译工作像水流一样顺畅 (flow)，实现真正的 WYSIWYG（所见即所得）开发体验。

将当前精妙的"运行时 + 编译时"结合的 I18N 可视化调试工具通用化，支持主流 i18n 库（react-intl、react-i18next、i18next 等）和主流构建工具（webpack、rspack、vite 等）。

---

## 🎯 核心价值

### 当前实现的优势
1. **编译时注入** - Babel 插件自动识别 I18N 调用并注入 `data-i18n-key` 标记
2. **运行时交互** - 按住快捷键点击文案即可编辑，无需查找代码
3. **即时生效** - 修改后自动写入源文件并触发热更新
4. **AI 辅助** - 内置 AI 翻译功能，提供多种候选翻译
5. **零侵入** - 只在开发环境启用，不影响生产代码

### 通用化目标
- 支持 **5+ 主流 i18n 库**
- 支持 **3+ 主流构建工具**
- 支持 **多框架**（React/Vue/Svelte/Solid）
- 支持 **多种文件格式**（.ts/.json/.yaml/.po）
- 提供 **插件化架构**，易于扩展

---

## 🏗️ 技术架构设计

### 核心创新：双重标记策略 🌟

这是 i18nflow 最精妙的设计，解决了编译时无法追踪的场景：

```typescript
// 当前项目的核心实现：Proxy + React Element
function createI18NReactElement(value: string, key: string) {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) {
    return value; // 生产环境直接返回字符串
  }
  
  // 开发环境：创建带 data-i18n-key 的 span 元素
  const element = React.createElement('span', { 'data-i18n-key': key }, value);
  
  // 🔑 关键：使用 Proxy 包装，添加字符串转换方法
  return new Proxy(element, {
    get(target, prop) {
      if (prop === 'toString') return () => value;
      if (prop === 'valueOf') return () => value;
      if (prop === Symbol.toPrimitive) return () => value;
      return target[prop];
    }
  });
}

// I18N 对象本身也是 Proxy，动态返回包装后的元素
const I18N = createI18NProxy(kiwiIntl);
```

#### 🚀 零侵入方案：Babel 自动注入 Proxy

**核心优化：** 通过 Babel 插件自动注入 Proxy 包装，无需修改项目源码！

**当前实现（需要手动修改源码）：**
```typescript
// src/lang/I18N.ts - 需要开发者手动添加 Proxy 包装
import { createI18NProxy } from 'i18nflow-runtime-react/proxy';

const kiwiIntl = KiwiIntl.init(initLocale, {...});
const wrappedI18N = createI18NProxy(kiwiIntl);  // 👈 手动包装
export default wrappedI18N;
```

**Babel 自动注入方案（零侵入）：**
```typescript
// 开发者的原始代码（无需修改）
const kiwiIntl = KiwiIntl.init(initLocale, {...});
export default kiwiIntl;

// ⬇️ Babel 编译后自动转换为：
import { __i18nflow_createProxy } from 'i18nflow-runtime-react/auto';
const kiwiIntl = KiwiIntl.init(initLocale, {...});
export default __i18nflow_createProxy(kiwiIntl, {
  framework: 'react',
  keyPath: 'I18N'
});
```

**实现方案对比：**

| 方案 | 优点 | 缺点 | 推荐度 |
|---|---|---|---|
| **方案 A: 在导出处包装** | ✅ 只包装一次，性能好<br>✅ 类型推导准确 | ⚠️ 需要配置文件路径 | ⭐⭐⭐⭐⭐ 推荐 |
| **方案 B: 在导入处包装** | ✅ 无需配置文件路径<br>✅ 适用范围广 | ❌ 每次导入都包装<br>❌ 可能重复包装 | ⭐⭐⭐ 备选 |
| **方案 C: 手动包装** | ✅ 最直接，可控性强 | ❌ 需要修改源码<br>❌ 侵入性强 | ⭐⭐ 不推荐 |

**推荐实现：方案 A（配置 + Babel 自动注入）**

```typescript
// i18nflow.config.ts
export default {
  adapter: 'custom-proxy',
  proxyStrategy: {
    enabled: true,
    framework: 'react',
    // 🔑 关键配置：指定需要自动包装的文件
    autoWrap: {
      // 方式 1: 指定文件路径（精确匹配）
      files: ['./src/lang/I18N.ts'],
      // 方式 2: 指定匹配模式（灵活匹配）
      patterns: ['**/i18n/*.ts', '**/locales/index.ts'],
      // 检测规则：识别哪些导出需要包装
      detectRules: [
        // 规则 1: 检测 KiwiIntl.init() 调用
        { type: 'call', name: 'KiwiIntl.init' },
        // 规则 2: 检测 i18next.init() 调用
        { type: 'call', name: 'i18next.init' },
        // 规则 3: 检测特定变量名
        { type: 'variable', name: /^(i18n|I18N|intl)$/ },
      ],
    },
  },
};
```

#### 为什么需要这个双重策略？

**问题场景：** Babel 编译时无法追踪的引用链

```tsx
// ❌ 场景 1：Props 传递多层
<Parent message={I18N.system.welcome} />
  └─> <Child message={props.message} />  // Babel 无法知道 props.message 来自 I18N
      └─> <div>{props.message}</div>     // 无法注入 data-i18n-key

// ❌ 场景 2：动态引用
const config = { title: I18N.chart.title };
// ... 多行代码后
<div>{config.title}</div>  // Babel 难以追踪

// ❌ 场景 3：条件分支
const text = isAdmin ? I18N.admin.title : I18N.user.title;
<div>{text}</div>  // 变量引用，难以追踪
```

**解决方案：** 运行时自带标记

```tsx
// ✅ I18N.system.welcome 本身就是一个 React 元素
const element = I18N.system.welcome;
// 实际是：<span data-i18n-key="system.welcome">欢迎</span>

// ✅ 在 JSX 中直接渲染，自然带上 data-i18n-key
<div>{I18N.system.welcome}</div>
// 渲染为：<div><span data-i18n-key="system.welcome">欢迎</span></div>

// ✅ 在字符串上下文中，自动转换为字符串
console.log(I18N.system.welcome);  // "欢迎" (调用 toString())
<Input placeholder={I18N.system.welcome} />  // placeholder="欢迎"
```

#### 双重策略的配合

| 场景 | 编译时处理 | 运行时处理 | 最终效果 |
|---|---|---|---|
| **简单引用** | ✅ 注入 `String()` 包裹 | ✅ React 元素自带标记 | 双保险 |
| **Props 多层传递** | ❌ 无法追踪 | ✅ React 元素自带标记 | 运行时兜底 |
| **对象存储** | ❌ 无法追踪 | ✅ React 元素自带标记 | 运行时兜底 |
| **字符串属性** | ✅ 注入 `String()` 转换 | ✅ Proxy 提供 `toString()` | 配合工作 |
| **条件表达式** | ⚠️ 部分支持 | ✅ React 元素自带标记 | 运行时兜底 |

**核心优势：**
1. **编译时优化：** 减少运行时的 span 嵌套（直接转字符串）
2. **运行时兜底：** 覆盖所有编译时无法处理的场景
3. **零额外成本：** React 本身就会渲染这些元素，没有性能损失
4. **完全透明：** 开发者无需关心实现细节

---

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户应用层                               │
│  (React/Vue/Svelte + react-intl/i18next/vue-i18n...)        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌────────▼────────┐
│  编译时层         │            │   运行时层       │
│ (Transform)     │◄───────────►│  (Runtime)      │
│  Babel 插件      │   双重策略   │ Proxy + Element │
└────────┬────────┘            └────────┬────────┘
         │                               │
    ┌────▼─────┐                   ┌────▼─────┐
    │ 核心抽象层 │                   │ 核心抽象层 │
    │ (Core)   │                   │ (Core)   │
    └────┬─────┘                   └────┬─────┘
         │                               │
    ┌────▼────┐                     ┌───▼────┐
    │ Adapters│                     │Adapters│
    └────┬────┘                     └───┬────┘
         │                               │
┌────────▼────────────────────────────────▼────────┐
│            Dev Server Middleware                  │
│         (API + File Update + HMR)                 │
└───────────────────────────────────────────────────┘
```

### 核心模块划分

#### 1. **i18nflow-core** - 核心抽象层
```typescript
// 编译时核心接口
interface ITransformAdapter {
  name: string;
  // 检测是否是 i18n 调用
  isI18nExpression(node: ASTNode): boolean;
  // 提取 i18n key
  extractI18nKey(node: ASTNode): string | null;
  // 转换表达式（注入标记）
  transformExpression(node: ASTNode, key: string): ASTNode;
  // 获取配置（翻译文件路径、语言等）
  getConfig(): AdapterConfig;
}

// 运行时核心接口（支持两种标记策略）
interface IRuntimeAdapter {
  name: string;
  
  // 策略 1: Proxy 包装策略（推荐，用于自定义 i18n 对象）
  // 返回值自带 data-i18n-key 标记，无需编译时处理
  enableProxyWrapper?: boolean;
  wrapI18nObject?: (target: any) => any;
  
  // 策略 2: 纯编译时策略（用于第三方库）
  // 依赖编译时注入标记，运行时只负责读写
  readTranslation(key: string, locale: string): Promise<string>;
  updateTranslation(key: string, locale: string, value: string): Promise<boolean>;
  
  // 通用方法
  getSupportedLocales(): string[];
  getCurrentLocale(): string;
}

// 文件操作接口
interface IFileAdapter {
  name: string; // 'typescript' | 'json' | 'yaml' | 'po'
  // 读取文件
  read(filePath: string, key: string): Promise<Record<string, string>>;
  // 更新文件
  update(filePath: string, key: string, values: Record<string, string>): Promise<boolean>;
  // 支持的文件扩展名
  getSupportedExtensions(): string[];
}
```

#### 2. **i18nflow-adapters-***  - 适配器插件

```
i18nflow-adapters-transform/
  ├── react-intl.ts       # FormattedMessage、useIntl 等
  ├── react-i18next.ts    # Trans、useTranslation 等
  ├── i18next.ts          # t() 函数
  ├── vue-i18n.ts         # $t()、<i18n> 等
  └── custom-proxy.ts     # 自定义 I18N 对象（当前实现，Proxy 策略）

i18nflow-adapters-runtime/
  ├── react-intl.ts
  ├── react-i18next.ts
  ├── i18next.ts
  ├── vue-i18n.ts
  └── custom-proxy.ts     # 包含 Proxy 包装逻辑

i18nflow-adapters-file/
  ├── typescript.ts       # .ts 文件（AST 操作）
  ├── json.ts            # .json 文件
  ├── yaml.ts            # .yaml/.yml 文件
  └── gettext.ts         # .po/.pot 文件
```

**特别说明：custom-proxy 适配器（含 Babel 自动注入）**

```typescript
// i18nflow-adapters-runtime/custom-proxy.ts
// 实现当前项目的 Proxy 包装策略
export class CustomProxyRuntimeAdapter implements IRuntimeAdapter {
  name = 'custom-proxy';
  enableProxyWrapper = true;  // 启用 Proxy 策略
  
  // 核心：包装 i18n 对象，使返回值自带 data-i18n-key
  wrapI18nObject(target: any, framework: 'react' | 'vue' | 'svelte') {
    if (framework === 'react') {
      return this.createReactProxy(target);
    }
    // 其他框架的实现...
  }
  
  private createReactProxy(target: any, keyPath: string[] = []) {
    return new Proxy(target, {
      get(_, prop: string) {
        const currentKeyPath = [...keyPath, prop];
        const value = target[prop];
        
        if (typeof value === 'string') {
          return createI18NReactElement(value, currentKeyPath.join('.'));
        }
        
        if (isPlainObject(value)) {
          return this.createReactProxy(value, currentKeyPath);
        }
        
        return value;
      }
    });
  }
  
  // ... 其他方法
}

// i18nflow-adapters-transform/custom-proxy.ts
// Babel 转换插件：自动注入 Proxy 包装
export class CustomProxyTransformAdapter implements ITransformAdapter {
  name = 'custom-proxy-transform';
  
  // 检测是否是 i18n 初始化调用
  isI18nInitExpression(node: ASTNode, config: AdapterConfig): boolean {
    const { detectRules } = config.proxyStrategy?.autoWrap || {};
    
    // 规则 1: 检测特定函数调用
    if (t.isCallExpression(node)) {
      const callee = node.callee;
      if (t.isMemberExpression(callee)) {
        const key = buildKeyFromMemberExpression(callee);
        // 例如：KiwiIntl.init()
        return detectRules?.some(rule => 
          rule.type === 'call' && key.includes(rule.name)
        );
      }
    }
    
    return false;
  }
  
  // 转换导出语句，自动注入 Proxy 包装
  transformExport(path: NodePath, state: PluginState) {
    const { node } = path;
    
    // 处理 export default xxx
    if (t.isExportDefaultDeclaration(node)) {
      const declaration = node.declaration;
      
      // 检查导出的变量是否是 i18n 对象
      if (t.isIdentifier(declaration)) {
        const binding = path.scope.getBinding(declaration.name);
        if (binding && this.isI18nInitExpression(binding.path.node.init, state)) {
          // 🔑 关键转换：自动注入 Proxy 包装
          
          // 1. 添加导入语句
          this.addProxyImport(path);
          
          // 2. 包装导出值
          node.declaration = t.callExpression(
            t.identifier('__i18nflow_createProxy'),
            [
              declaration,
              t.objectExpression([
                t.objectProperty(
                  t.identifier('framework'),
                  t.stringLiteral('react')
                ),
              ])
            ]
          );
        }
      }
    }
  }
  
  // 添加 Proxy 工具函数的导入
  private addProxyImport(path: NodePath) {
    const program = path.findParent(p => p.isProgram());
    if (program) {
      // import { __i18nflow_createProxy } from 'i18nflow-runtime-react/auto';
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('__i18nflow_createProxy'),
            t.identifier('__i18nflow_createProxy')
          )
        ],
        t.stringLiteral('i18nflow-runtime-react/auto')
      );
      
      program.node.body.unshift(importDeclaration);
    }
  }
}
```

#### 3. **i18nflow-plugin-***  - 构建工具插件

```
i18nflow-plugin-webpack/
  └── index.ts           # Webpack 插件

i18nflow-plugin-rspack/
  └── index.ts           # Rspack 插件

i18nflow-plugin-vite/
  └── index.ts           # Vite 插件

i18nflow-plugin-rsbuild/
  └── index.ts           # Rsbuild 插件（当前实现）
```

#### 4. **i18nflow-runtime-***  - 框架运行时组件

```
i18nflow-runtime-react/
  ├── I18nDebugProvider.tsx
  ├── I18nEditModal.tsx
  └── useI18nDebug.ts

i18nflow-runtime-vue/
  ├── I18nDebugPlugin.ts
  └── I18nEditModal.vue

i18nflow-runtime-svelte/
  └── I18nDebug.svelte
```

#### 5. **i18nflow-server** - Dev Server 中间件

```typescript
// 通用中间件，支持各种构建工具
interface ServerMiddlewareOptions {
  fileAdapter: IFileAdapter;
  runtimeAdapter: IRuntimeAdapter;
  hmrCallback?: () => void;
}

function createI18nMiddleware(options: ServerMiddlewareOptions) {
  return async (req, res, next) => {
    // 处理 /api/i18n/read
    // 处理 /api/i18n/update
    // 处理 /api/i18n/translate
    // 触发 HMR
  };
}
```

---

## 🔍 技术可行性分析

### 1. 编译时转换的可行性 ✅

**Babel 生态的优势：**
- Babel 是语言无关的 AST 转换工具
- 支持 JSX、TypeScript、Vue SFC
- 可以集成到任何构建工具中

**双重策略的互补性：**
- **Proxy 策略（推荐）：** 运行时自带标记，覆盖所有场景，包括编译时无法追踪的引用
- **编译时策略：** 优化性能，减少运行时的 DOM 节点嵌套
- **结合使用：** 取长补短，达到最佳效果

**各 i18n 库的模式识别：**

| 库 | 调用模式 | AST 节点类型 | 提取难度 | 推荐策略 |
|---|---|---|---|---|
| react-intl | `<FormattedMessage id="key" />` | JSXElement | 简单 | 编译时 |
| react-intl | `intl.formatMessage({ id: 'key' })` | CallExpression | 中等 | 编译时 |
| react-i18next | `<Trans i18nKey="key" />` | JSXElement | 简单 | 编译时 |
| react-i18next | `t('key')` | CallExpression | 简单 | 编译时 |
| i18next | `i18next.t('key')` | MemberExpression | 简单 | 编译时 |
| vue-i18n | `$t('key')` | CallExpression | 简单 | 编译时 |
| vue-i18n | `<i18n-t keypath="key" />` | JSXElement | 简单 | 编译时 |
| 自定义（当前） | `I18N.category.key` | MemberExpression | 中等 | **Proxy（运行时）** ⭐ |

**结论：** ✅ 所有主流库的模式都可以通过 Babel AST 识别并转换

**特殊优势：** 自定义 I18N 对象采用 Proxy 策略，无需编译时追踪，天然覆盖所有引用场景

---

### 2. 运行时交互的可行性 ✅

**DOM 标记方案（两种策略）：**

**策略 1: Proxy 包装 - 运行时自带标记 ⭐**
```typescript
// I18N.system.welcome 返回的就是：
// <span data-i18n-key="system.welcome">欢迎</span>

// 优势：
// ✅ 覆盖所有场景，包括 props 多层传递
// ✅ 无需编译时追踪，降低复杂度
// ✅ 100% 可靠，不会遗漏
```

**策略 2: 编译时注入 - Babel 添加标记**
```typescript
// 编译前：<div>{I18N.system.welcome}</div>
// 编译后：<div data-i18n-key="system.welcome">{String(I18N.system.welcome)}</div>

// 优势：
// ✅ 减少 DOM 嵌套（没有额外的 span）
// ✅ 适用于第三方库（无法修改源码）
```

**事件监听方案：**
- React: 使用 Context + Portal
- Vue: 使用 Plugin + Teleport
- Svelte: 使用 Context + Slot
- 框架无关：直接监听 `document.addEventListener('click', ...)`

**结论：** ✅ 运行时交互方案框架无关，完全可行；Proxy 策略是杀手锏功能

---

### 3. 文件更新的可行性 ✅

**文件格式支持：**

| 格式 | 操作方式 | 难度 | 现有工具 |
|---|---|---|---|
| TypeScript (.ts) | AST 解析修改 | 中 | @babel/parser + generator |
| JSON (.json) | JSON.parse/stringify | 简单 | 原生 |
| YAML (.yaml) | yaml.parse/stringify | 简单 | js-yaml |
| Gettext (.po) | PO 解析器 | 中 | node-gettext |

**键路径解析：**
- 嵌套对象: `user.profile.name` → `{ user: { profile: { name: '...' } } }`
- 数组: `errors[0]` → `{ errors: ['...'] }`
- 命名空间: `namespace:key` → 不同文件或前缀

**结论：** ✅ 所有主流文件格式都有成熟的解析工具

---

### 4. 构建工具集成的可行性 ✅

**各构建工具的插件系统：**

| 工具 | Babel 集成 | 中间件支持 | HMR API |
|---|---|---|---|
| Webpack | ✅ babel-loader | ✅ devServer.setupMiddlewares | ✅ hot.accept() |
| Rspack | ✅ babel-loader | ✅ devServer.setupMiddlewares | ✅ hot.accept() |
| Vite | ✅ @vitejs/plugin-react | ✅ configureServer | ✅ import.meta.hot |
| Rsbuild | ✅ api.modifyRspackConfig | ✅ setupMiddlewares | ✅ module.hot |

**插件钩子统一：**
```typescript
interface BuildToolPlugin {
  // 注入 Babel 转换
  addTransform(transform: BabelPlugin): void;
  // 注册中间件
  addMiddleware(middleware: Middleware): void;
  // 触发 HMR
  triggerHMR(files: string[]): void;
}
```

**结论：** ✅ 所有主流构建工具都支持 Babel + 中间件 + HMR

---

## 🛠️ 实施计划

### 阶段 1: 核心抽象层 (2 周)

**目标：** 建立插件化架构基础

#### Week 1: 核心接口设计
- [ ] 定义 `ITransformAdapter` 接口（包含自动注入能力）
- [ ] 定义 `IRuntimeAdapter` 接口（支持 Proxy 策略）
- [ ] 定义 `IFileAdapter` 接口
- [ ] 实现适配器注册机制
- [ ] 实现配置系统（支持 autoWrap 配置）

**交付物：**
```typescript
// packages/core/src/index.ts
export { TransformCore, RuntimeCore, FileCore };
export { ITransformAdapter, IRuntimeAdapter, IFileAdapter };
export { AdapterRegistry };

// 核心特性：Babel 自动注入支持
export { AutoWrapDetector, ProxyInjector };
```

#### Week 2: 重构当前实现 + Babel 自动注入
- [ ] 将当前 Babel 插件重构为 `CustomTransformAdapter`
- [ ] **实现 Babel 自动注入 Proxy 包装逻辑** ⭐
- [ ] 实现检测规则引擎（识别 i18n 初始化代码）
- [ ] 将当前文件操作重构为 `TypeScriptFileAdapter`
- [ ] 将当前运行时重构为 `CustomRuntimeAdapter`
- [ ] 确保重构后功能与现有一致
- [ ] 编写单元测试（重点测试自动注入）

**交付物：**
```typescript
// packages/adapters-transform/src/custom-proxy.ts
export class CustomProxyTransformAdapter implements ITransformAdapter {
  // 自动检测 i18n 初始化代码
  detectI18nInit(node: ASTNode, rules: DetectRule[]): boolean;
  
  // 自动注入 Proxy 包装
  injectProxyWrapper(path: NodePath, options: InjectOptions): void;
}

// packages/adapters-file/src/typescript.ts
export class TypeScriptFileAdapter implements IFileAdapter { ... }

// packages/adapters-runtime/src/custom-proxy.ts
export class CustomProxyRuntimeAdapter implements IRuntimeAdapter { ... }

// packages/runtime-react/src/auto.ts
// 自动导入的 Proxy 包装函数
export function __i18nflow_createProxy(target: any, options: ProxyOptions) { ... }
```

---

### 阶段 2: 适配器开发 (4 周)

#### Week 3-4: Transform 适配器

**react-intl (1 周):**
- [ ] 识别 `<FormattedMessage id="..." />`
- [ ] 识别 `intl.formatMessage({ id: "..." })`
- [ ] 识别 `defineMessages({ key: { id: "..." } })`
- [ ] 注入 `data-i18n-key` 到 JSX 父元素
- [ ] 编写测试用例

**react-i18next (0.5 周):**
- [ ] 识别 `<Trans i18nKey="..." />`
- [ ] 识别 `t('key')`
- [ ] 识别 `useTranslation()` hook
- [ ] 编写测试用例

**i18next (0.5 周):**
- [ ] 识别 `i18next.t('key')`
- [ ] 识别 `i18n.t('key')`
- [ ] 支持命名空间 `t('namespace:key')`
- [ ] 编写测试用例

#### Week 5: Runtime 适配器

**react-intl:**
- [ ] 集成 `react-intl` 的 `IntlShape`
- [ ] 读取翻译: 从 messages 对象
- [ ] 更新翻译: 重新加载 messages

**react-i18next:**
- [ ] 集成 `i18next` 实例
- [ ] 读取翻译: `i18n.getResource()`
- [ ] 更新翻译: `i18n.addResource()`

**i18next:**
- [ ] 同 react-i18next
- [ ] 支持多命名空间

#### Week 6: File 适配器

**JSON (2 天):**
- [ ] 解析嵌套结构
- [ ] 原子化更新（避免冲突）
- [ ] 保持格式化（缩进、换行）

**YAML (2 天):**
- [ ] 使用 `js-yaml` 解析
- [ ] 保持注释
- [ ] 保持格式

**Gettext (1 天):**
- [ ] 使用 `node-gettext` 解析 .po
- [ ] 更新 msgid/msgstr
- [ ] 处理复数形式

---

### 阶段 3: 构建工具插件 (3 周)

#### Week 7: Webpack Plugin

**核心功能:**
- [ ] 通过 `babel-loader` 注入转换
- [ ] 使用 `devServer.setupMiddlewares` 注册中间件
- [ ] 集成 Webpack HMR API
- [ ] 配置项设计

**配置示例:**
```javascript
// webpack.config.js
const { I18nWysiwygPlugin } = require('@i18n-wysiwyg/plugin-webpack');

module.exports = {
  plugins: [
    new I18nWysiwygPlugin({
      adapter: 'react-intl', // 或 'react-i18next', 'custom'
      fileAdapter: 'json',   // 或 'typescript', 'yaml'
      locales: ['en-US', 'zh-CN'],
      translationFiles: {
        'en-US': './src/locales/en-US.json',
        'zh-CN': './src/locales/zh-CN.json',
      },
      ai: {
        enabled: true,
        provider: 'openai', // 或 'azure', 'custom'
        apiKey: process.env.OPENAI_API_KEY,
      },
    }),
  ],
};
```

#### Week 8: Vite Plugin

**核心功能:**
- [ ] 使用 `@vitejs/plugin-react` 的 `babel` 选项
- [ ] 使用 `configureServer` 注册中间件
- [ ] 集成 Vite HMR API (`import.meta.hot`)
- [ ] 支持 Vue SFC (通过 `@vitejs/plugin-vue`)

**配置示例:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { i18nWysiwyg } from '@i18n-wysiwyg/plugin-vite';

export default defineConfig({
  plugins: [
    i18nWysiwyg({
      adapter: 'react-i18next',
      fileAdapter: 'json',
      // ... 同 webpack
    }),
  ],
});
```

#### Week 9: Rspack/Rsbuild Plugin

- [ ] 基于当前 Rsbuild 实现迁移
- [ ] 使用新的适配器系统
- [ ] 确保兼容性

---

### 阶段 4: 运行时组件 (2 周)

#### Week 10: React 运行时

**组件库:**
- [ ] `<I18nDebugProvider>` - Context Provider
- [ ] `<I18nEditModal>` - 编辑弹窗（支持多适配器）
- [ ] `useI18nDebug()` - Hook（读取、更新、AI 翻译）

**优化:**
- [ ] 使用 `React.lazy` 按需加载 Modal
- [ ] 使用 `useMemo` 优化性能
- [ ] 支持自定义快捷键

#### Week 11: Vue 运行时

**组件库:**
- [ ] Vue Plugin 实现
- [ ] `<I18nEditModal>` - Composition API
- [ ] `useI18nDebug()` - Composable

**特殊处理:**
- [ ] 支持 Vue SFC 中的 `<i18n>` 块
- [ ] 支持 Options API
- [ ] 支持 Composition API

---

### 阶段 5: 文档与示例 (1 周)

#### Week 12: 完善文档

**文档结构:**
```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
├── adapters/
│   ├── react-intl.md
│   ├── react-i18next.md
│   ├── i18next.md
│   └── custom.md
├── build-tools/
│   ├── webpack.md
│   ├── vite.md
│   └── rsbuild.md
├── advanced/
│   ├── custom-adapter.md
│   ├── file-formats.md
│   └── ai-translation.md
└── api/
    ├── core.md
    ├── transform-adapter.md
    └── runtime-adapter.md
```

**示例项目:**
```
playground/
├── react-kiwi-rspack/      # Kiwi-Intl + Rspack 1.x
├── react-intl-webpack/     # React-Intl + Webpack (待添加)
├── react-i18next-vite/     # React-i18next + Vite (待添加)
└── vue-i18n-vite/          # Vue-i18n + Vite (待添加)
```

---

### 阶段 6: 测试与优化 (1 周)

#### Week 13: 测试覆盖

- [ ] 单元测试 (Jest)
  - Core 模块: 100% 覆盖
  - Adapters: 90%+ 覆盖
  - Plugins: 80%+ 覆盖
- [ ] 集成测试 (Playwright)
  - 完整的 E2E 流程
  - 多浏览器兼容性
- [ ] 性能测试
  - 编译时开销 < 5%
  - 运行时内存占用 < 10MB

---

## 📦 发布策略

### 包结构

```
@i18n-wysiwyg/
├── core                      # 核心抽象层
├── adapters-transform        # Transform 适配器
├── adapters-runtime          # Runtime 适配器
├── adapters-file            # File 适配器
├── plugin-webpack           # Webpack 插件
├── plugin-vite              # Vite 插件
├── plugin-rspack            # Rspack 插件
├── plugin-rsbuild           # Rsbuild 插件
├── runtime-react            # React 运行时
├── runtime-vue              # Vue 运行时
└── server                   # Dev Server 中间件
```

### 版本管理

- 使用 Lerna/Turborepo 管理 monorepo
- 采用统一版本号策略
- 发布到 npm registry

### 向后兼容

- 当前项目的集成方式保持不变
- 新架构作为 v2 版本发布
- 提供迁移指南

---

## 🔮 未来扩展

### Phase 2 功能 (3-6 个月后)

1. **更多框架支持**
   - Solid.js
   - Preact
   - Angular

2. **更多 i18n 库支持**
   - FormatJS
   - LinguiJS
   - typesafe-i18n

3. **高级功能**
   - 翻译记忆库 (Translation Memory)
   - 术语表管理 (Glossary)
   - 批量翻译
   - 翻译质量检查
   - 翻译历史版本

4. **协作功能**
   - 多人同时编辑
   - 审核流程
   - 评论功能
   - Git 集成（自动提交）

5. **AI 增强**
   - 上下文感知翻译
   - 术语一致性检查
   - 翻译风格统一
   - 支持更多 AI 提供商

---

## 🎓 技术难点与解决方案

### 难点 1: Vue SFC 中的 `<i18n>` 块

**问题：** Vue 单文件组件的 `<i18n>` 块需要特殊处理

**解决方案：**
```javascript
// 使用 @vue/compiler-sfc 解析 SFC
const { parse } = require('@vue/compiler-sfc');
const { descriptor } = parse(source);
const i18nBlock = descriptor.customBlocks.find(b => b.type === 'i18n');
```

### 难点 2: TypeScript 文件的安全更新

**问题：** 修改 .ts 文件时保持类型安全

**解决方案：**
```javascript
// 使用 TypeScript Compiler API
import ts from 'typescript';
const sourceFile = ts.createSourceFile(...);
const transformer = (context) => (rootNode) => {
  // AST 转换
};
const result = ts.transform(sourceFile, [transformer]);
```

### 难点 3: Babel 自动注入 Proxy 的准确性

**问题：** 如何准确识别哪些导出需要包装？

**挑战：**
1. 不同项目的 i18n 初始化方式不同
2. 可能有多个导出，只有部分需要包装
3. 避免误包装（如普通对象）

**解决方案：基于规则的检测引擎**

```typescript
// 检测规则配置
const detectRules = [
  // 规则 1: 检测特定函数调用
  {
    type: 'call',
    patterns: ['KiwiIntl.init', 'i18next.init', 'createI18n'],
  },
  // 规则 2: 检测变量名模式
  {
    type: 'variable',
    patterns: [/^(i18n|I18N|intl|Intl)$/],
  },
  // 规则 3: 检测特定导入来源
  {
    type: 'import',
    from: ['kiwi-intl', 'i18next', 'vue-i18n'],
  },
];

// Babel 插件中的检测逻辑
function shouldWrapExport(path: NodePath, rules: DetectRule[]): boolean {
  const binding = getExportBinding(path);
  
  for (const rule of rules) {
    if (rule.type === 'call') {
      // 检查初始化表达式
      if (isCallExpressionMatching(binding.init, rule.patterns)) {
        return true;
      }
    }
    
    if (rule.type === 'variable') {
      // 检查变量名
      if (rule.patterns.some(p => p.test(binding.name))) {
        return true;
      }
    }
    
    if (rule.type === 'import') {
      // 检查导入来源
      if (isImportedFrom(binding, rule.from)) {
        return true;
      }
    }
  }
  
  return false;
}
```

**优势：**
- ✅ 高度可配置，适应不同项目
- ✅ 多种检测维度，准确率高
- ✅ 支持自定义规则扩展

### 难点 4: Props 多层传递的追踪

**问题：** 编译时无法追踪多层传递的 props

**示例：**
```tsx
// 父组件
<Parent message={I18N.system.welcome} />

// 子组件
function Parent({ message }) {
  return <Child msg={message} />;  // 编译时丢失了 I18N 的追踪
}

// 孙组件
function Child({ msg }) {
  return <div>{msg}</div>;  // 无法注入 data-i18n-key
}
```

**解决方案：Proxy 策略自动解决 ⭐**
```tsx
// I18N.system.welcome 本身就是：
// <span data-i18n-key="system.welcome">欢迎</span>

// 无论传递多少层，标记都会保留
<Parent message={I18N.system.welcome} />
  └─> <Child msg={props.message} />
      └─> <div>{props.msg}</div>
      // 渲染结果：
      // <div><span data-i18n-key="system.welcome">欢迎</span></div>
```

**核心优势：**
- ✅ 无需编译时追踪，运行时自然保留标记
- ✅ 支持任意层级的传递
- ✅ 支持动态引用、条件分支等复杂场景

### 难点 5: 实时预览翻译更改

**问题：** 修改翻译后立即看到效果，不刷新页面

**解决方案：**
```javascript
// 使用 HMR API + 局部刷新
if (module.hot) {
  module.hot.accept('./locales/en-US.json', () => {
    i18n.reloadResources(); // react-i18next
    // 或
    IntlProvider.updateMessages(); // react-intl
    // 或（Proxy 策略）
    // 自动生效，因为 I18N 对象是动态代理
  });
}
```

### 难点 6: 多文件格式的统一抽象

**问题：** JSON/YAML/PO 格式差异大

**解决方案：**
```typescript
// 统一的内部格式
interface TranslationData {
  [key: string]: string | TranslationData;
}

// 各适配器负责转换
class JsonFileAdapter implements IFileAdapter {
  async read(path: string): Promise<TranslationData> {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content); // 直接返回
  }
}

class GettextFileAdapter implements IFileAdapter {
  async read(path: string): Promise<TranslationData> {
    const po = await parsePO(path);
    // 转换 PO -> TranslationData
    return convertPoToData(po);
  }
}
```

---

## ✅ 技术可行性总结

| 维度 | 可行性 | 理由 |
|---|---|---|
| **Proxy 双重策略** | ✅ 极高 | ⭐ **核心创新**，解决编译时无法追踪的所有场景 |
| **编译时转换** | ✅ 高 | Babel 生态成熟，所有模式可识别 |
| **运行时交互** | ✅ 高 | DOM API 通用，框架无关 |
| **文件更新** | ✅ 高 | 成熟的解析工具，AST 操作可靠 |
| **构建工具集成** | ✅ 高 | 所有工具都支持 Babel + 中间件 |
| **插件化架构** | ✅ 高 | 接口清晰，扩展性强 |
| **性能影响** | ✅ 低 | 仅开发环境，Proxy 开销可忽略 |
| **维护成本** | ⚠️ 中 | 需要持续跟进各库的更新 |

**总体评估：✅ 该方案在技术上完全可行，且具有很高的实用价值。**

**核心竞争力：** Proxy + React Element 的双重策略是业界首创，完美解决了编译时追踪的局限性。

---

## 📊 开发资源评估

### 人力需求
- **核心开发:** 2-3 人（全职）
- **周期:** 13 周（约 3 个月）
- **维护:** 1 人（长期）

### 技术栈
- **语言:** TypeScript
- **构建:** Turborepo + pnpm
- **测试:** Jest + Playwright
- **文档:** VitePress
- **CI/CD:** GitHub Actions

### 第三方依赖
```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "@babel/generator": "^7.23.0",
    "@babel/types": "^7.23.0",
    "js-yaml": "^4.1.0",
    "node-gettext": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 🚀 快速开始（当前项目适配）

当核心库发布后，当前项目可以这样迁移：

```bash
# 安装新包
pnpm add -D i18nflow-plugin-rsbuild i18nflow-adapters-runtime i18nflow-runtime-react

# 更新配置
```

```typescript
// rsbuild.config.ts
import { i18nflow } from 'i18nflow-plugin-rsbuild';

export default {
  plugins: [
    i18nflow({
      adapter: 'custom-proxy', // ⭐ 使用 Proxy 策略（当前实现）
      fileAdapter: 'typescript',
      locales: ['zh-CN', 'en-US'],
      translationFiles: {
        'zh-CN': './src/locales/zh-CN/index.ts',
        'en-US': './src/locales/en-US/index.ts',
      },
      // 🚀 Proxy 自动注入配置（零侵入！）
      proxyStrategy: {
        enabled: true,
        framework: 'react',
        // 方式 1: 自动注入（推荐）- 无需修改源码
        autoWrap: {
          files: ['./src/lang/I18N.ts'],  // 指定需要包装的文件
          detectRules: [
            { type: 'call', name: 'KiwiIntl.init' },  // 检测规则
          ],
        },
        // 方式 2: 手动包装（如果需要更多控制）
        // manualWrap: {
        //   i18nObjectPath: './src/lang/I18N.ts',
        // },
      },
    }),
  ],
};
```

```tsx
// src/lang/I18N.ts
// 🎉 无需任何修改！Babel 会自动注入 Proxy 包装

import KiwiIntl from 'kiwi-intl';
import zhCN from './zh-CN';
import enUS from './en-US';

const kiwiIntl = KiwiIntl.init('zh-CN', {
  'zh-CN': zhCN,
  'en-US': enUS,
});

export default kiwiIntl;  // Babel 会自动转换为包装后的版本
```

```tsx
// src/App.tsx
import { I18nDebugProvider } from 'i18nflow-runtime-react';

function App() {
  return (
    <I18nDebugProvider enabled={process.env.NODE_ENV === 'development'}>
      {/* 现有代码 */}
    </I18nDebugProvider>
  );
}
```

**迁移优势：**
- ✅ **零侵入：无需修改 I18N.ts 源码！**（Babel 自动注入）
- ✅ 配置简单，只需指定文件路径和检测规则
- ✅ 类型安全，TypeScript 完全兼容
- ✅ 更好的开发体验和可维护性

---

## 📝 总结

**i18nflow** 这个技术方案具有以下优势：

1. **核心创新：Proxy 双重策略 + Babel 自动注入** ⭐
   - 运行时 Proxy 包装 + 编译时 Babel 转换
   - **Babel 自动注入，零侵入，无需修改源码**
   - 完美解决 props 多层传递、动态引用等编译时无法追踪的场景
   - 业界首创，技术壁垒高

2. **渐进式架构** 
   - 核心抽象 + 适配器模式，易于扩展
   - 支持两种策略：Proxy（自定义）+ 编译时（第三方库）

3. **向后兼容** 
   - 当前实现可无缝迁移到新架构
   - 作为 `custom-proxy` 适配器保留

4. **技术先进** 
   - 编译时 + 运行时双保险
   - WYSIWYG 体验，点击即编辑
   - AI 辅助翻译

5. **社区价值** 
   - 填补市场空白（目前没有类似工具）
   - 解决真实痛点（翻译查找困难）
   - 开源社区友好

6. **商业潜力** 
   - 可发展为 SaaS 产品（翻译管理平台）
   - 支持团队协作、审核流程
   - 企业级功能（术语库、翻译记忆）

**建议：** 先完成阶段 1-3（核心层 + 主流适配器 + 主流构建工具），发布 MVP 版本，收集社区反馈后再迭代。

**核心卖点：** "让翻译工作像水流一样顺畅 (flow)，Proxy 策略覆盖 100% 场景，无需担心编译时追踪失败。"

---

**项目名称:** i18nflow  
**文档版本:** v1.0  
**最后更新:** 2025-11-13  
**作者:** AI Assistant  
**状态:** 待审核

