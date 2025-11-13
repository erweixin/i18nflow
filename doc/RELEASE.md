# 📦 发布流程文档

本项目采用**基于 GitHub Release 的半自动发布流程**，确保发布时机完全可控。

## 🎯 发布原则

- ✅ **只有打了 GitHub Release 才会发布到 NPM**
- ✅ **版本号通过 Changesets 自动管理**
- ✅ **发布过程完全自动化**
- ✅ **支持 pre-release（beta、alpha 等）**

---

## 📋 完整发布流程

### 1️⃣ 开发与变更记录

在开发完新功能或修复 bug 后：

```bash
# 记录变更（会交互式提示）
pnpm changeset

# 提示内容：
# 1. 选择要发布的包（空格选择，回车确认）
# 2. 选择版本类型：
#    - patch: 0.1.0 → 0.1.1 (bug 修复)
#    - minor: 0.1.0 → 0.2.0 (新功能)
#    - major: 0.1.0 → 1.0.0 (破坏性变更)
# 3. 输入变更描述（用于 CHANGELOG）
```

**变更描述示例：**

```
feat(kiwi): 添加可选链操作符支持

- 支持 I18N.template?.() 语法
- 支持 I18N?.welcome?.greeting 语法
- 更新 babel-plugin 处理逻辑
```

### 2️⃣ 提交代码

```bash
# 提交变更记录和代码
git add .
git commit -m "feat: add optional chaining support"
git push origin main
```

### 3️⃣ 自动创建版本 PR

**推送到 main 分支后，GitHub Actions 会自动：**

1. 检测到有新的 changesets
2. 运行 `pnpm changeset version`
3. 更新所有相关包的版本号
4. 生成/更新 CHANGELOG.md
5. 创建一个名为 **"chore: version packages"** 的 PR

**PR 内容示例：**

```diff
packages/kiwi/package.json
- "version": "0.1.0"
+ "version": "0.2.0"

packages/kiwi/CHANGELOG.md
+ ## 0.2.0
+
+ ### Minor Changes
+
+ - feat(kiwi): 添加可选链操作符支持
```

### 4️⃣ 审查并合并版本 PR

1. **审查 PR 内容**
   - 检查版本号是否正确
   - 检查 CHANGELOG 内容是否完整
   - 确认所有包的依赖版本已更新

2. **合并 PR**
   ```bash
   # 或者在 GitHub 网页上点击 "Merge pull request"
   ```

### 5️⃣ 创建 GitHub Release

**在 GitHub 上创建 Release：**

1. **访问 Releases 页面**

   ```
   https://github.com/erweixin/i18nflow/releases/new
   ```

2. **填写 Release 信息**

   **Tag version:**（必须以 `v` 开头）

   ```
   v0.2.0
   ```

   **Release title:**

   ```
   Release v0.2.0
   ```

   **Description:**（从 CHANGELOG 复制）

   ```markdown
   ## 新功能

   ### @i18nflow/kiwi

   - feat(kiwi): 添加可选链操作符支持
     - 支持 `I18N.template?.()` 语法
     - 支持 `I18N?.welcome?.greeting` 语法
     - 更新 babel-plugin 处理逻辑

   ## 包版本

   - @i18nflow/core@0.1.0
   - @i18nflow/shared@0.1.0
   - @i18nflow/ui-react@0.1.0
   - @i18nflow/kiwi@0.2.0
   ```

3. **发布 Release**
   - ☑️ 勾选 "Set as the latest release"（正式版本）
   - ☐ 取消勾选 "Set as a pre-release"（除非是 beta 版本）
   - 点击 **"Publish release"**

### 6️⃣ 自动发布到 NPM

**创建 Release 后，GitHub Actions 会自动：**

1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 构建所有包
4. ✅ 发布到 NPM（public 访问）
5. ✅ 生成发布摘要

**查看发布状态：**

```
https://github.com/erweixin/i18nflow/actions
```

**验证发布成功：**

```bash
# 在 NPM 上查看
open https://www.npmjs.com/package/@i18nflow/kiwi

# 或者本地测试
npm info @i18nflow/kiwi
```

---

## 🚀 快速命令参考

```bash
# 记录变更
pnpm changeset

# 查看将要发布的版本（本地预览）
pnpm changeset status

# 手动更新版本（通常由 CI 自动完成）
pnpm changeset version

# 构建所有包
pnpm build

# 本地测试发布（不会真正发布）
pnpm -r publish --dry-run --no-git-checks
```

---

## 📌 版本号规则

遵循 [Semantic Versioning 2.0.0](https://semver.org/)：

```
版本格式：MAJOR.MINOR.PATCH

MAJOR: 不兼容的 API 修改
MINOR: 向下兼容的功能性新增
PATCH: 向下兼容的问题修正
```

**示例：**

```
0.1.0 → 0.1.1  (PATCH: 修复 bug)
0.1.1 → 0.2.0  (MINOR: 添加新功能)
0.2.0 → 1.0.0  (MAJOR: 破坏性变更)
```

---

## 🔖 Pre-release 版本

发布 beta、alpha 等测试版本：

### 1. 创建 pre-release changeset

```bash
pnpm changeset pre enter beta
pnpm changeset
pnpm changeset version
```

**版本号变化：**

```
0.1.0 → 0.2.0-beta.0
0.2.0-beta.0 → 0.2.0-beta.1
```

### 2. 创建 Pre-release

在 GitHub Release 页面：

- Tag: `v0.2.0-beta.0`
- ☑️ 勾选 **"Set as a pre-release"**
- 发布

### 3. 退出 pre-release 模式

```bash
pnpm changeset pre exit
pnpm changeset version  # 生成正式版本
```

---

## 🛠️ 发布检查清单

发布前请确认：

- [ ] 所有测试通过 (`pnpm test`)
- [ ] 代码已通过 lint (`pnpm lint`)
- [ ] 类型检查通过 (`pnpm type-check`)
- [ ] 构建成功 (`pnpm build`)
- [ ] CHANGELOG 内容准确
- [ ] 版本号符合语义化规范
- [ ] 已合并版本 PR
- [ ] README 和文档已更新

---

## ⚠️ 注意事项

### 1. NPM Token 配置

**首次发布需要配置 NPM Token：**

1. 登录 NPM: https://www.npmjs.com
2. 生成 Automation token: Settings → Access Tokens → Generate New Token
3. 在 GitHub 添加 Secret:
   - Settings → Secrets → Actions
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 token

### 2. NPM 组织权限

确保你的 NPM 账号有 `@i18nflow` 组织的发布权限：

```bash
# 查看组织成员
npm org ls i18nflow

# 添加成员（需要组织 owner 权限）
npm org set i18nflow your-username developer
```

### 3. 版本号不要手动修改

❌ **不要直接修改 package.json 中的 version**
✅ **使用 changeset 管理版本**

```bash
# 错误做法
vim packages/kiwi/package.json  # 手动改 version

# 正确做法
pnpm changeset                  # 记录变更
pnpm changeset version         # 自动更新版本
```

### 4. Tag 格式要求

**GitHub Release Tag 必须以 `v` 开头：**

```
✅ v0.1.0
✅ v1.0.0-beta.1
❌ 0.1.0
❌ release-0.1.0
```

### 5. 发布失败处理

如果发布失败：

1. **查看 GitHub Actions 日志**

   ```
   https://github.com/erweixin/i18nflow/actions
   ```

2. **常见问题：**
   - NPM Token 过期 → 重新生成并更新 Secret
   - 包名已存在 → 检查 NPM 上是否已发布
   - 权限不足 → 联系组织管理员

3. **重新发布：**
   ```bash
   # 删除 GitHub Release
   # 修复问题后重新创建 Release
   ```

---

## 📚 相关资源

- [Changesets 文档](https://github.com/changesets/changesets)
- [NPM 文档](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🤝 获取帮助

遇到问题？

1. 查看 [GitHub Issues](https://github.com/erweixin/i18nflow/issues)
2. 查看 [GitHub Actions 日志](https://github.com/erweixin/i18nflow/actions)
3. 联系维护者：[@erweixin](https://github.com/erweixin)
