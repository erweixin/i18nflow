# 📦 发包类型控制指南

## 🎯 只发布 packages 里的包

### ✅ 已配置

1. **playground 项目已标记为 private**

   ```json
   // playground/react-kiwi-rspack/package.json
   {
     "private": true // 不会被发布到 NPM
   }
   ```

2. **changeset 忽略根项目**

   ```json
   // .changeset/config.json
   {
     "ignore": ["i18nflow"] // 忽略根 package.json
   }
   ```

3. **pnpm publish 只会发布 public 包**
   ```bash
   pnpm -r publish  # 自动跳过 private: true 的包
   ```

### 📦 会发布的包

```
✅ @i18nflow/core       (packages/core)
✅ @i18nflow/shared     (packages/shared)
✅ @i18nflow/ui-react   (packages/ui-react)
✅ @i18nflow/kiwi       (packages/kiwi)
```

### 🚫 不会发布的包

```
❌ i18nflow             (根项目)
❌ react-kiwi-rspack-demo (playground - private: true)
```

---

## 🏷️ 控制发包类型

### 方式一：正式版本（Stable Release）

**用于生产环境的稳定版本**

```bash
# 1. 记录变更（正常流程）
pnpm changeset
# 选择包、版本类型（patch/minor/major）、输入描述

# 2. 提交代码
git add .
git commit -m "feat: add new feature"
git push

# 3. 等待并合并 Version PR

# 4. 创建 GitHub Release
# Tag: v0.2.0
# Title: Release v0.2.0
# ☑️ "Set as the latest release"
# ☐ "Set as a pre-release" (不勾选)

# 5. 自动发布
# NPM tag: latest
# 版本号: 0.2.0
```

**结果：**

```bash
npm install @i18nflow/kiwi
# 安装 0.2.0 (latest)
```

---

### 方式二：Beta 版本（Pre-release）

**用于测试的 beta 版本**

#### Step 1: 进入 Pre-release 模式

```bash
# 进入 beta 模式
pnpm changeset pre enter beta

# 查看状态（会显示当前处于 pre 模式）
cat .changeset/pre.json
```

**会生成 `.changeset/pre.json`：**

```json
{
  "mode": "pre",
  "tag": "beta",
  "initialVersions": {
    "@i18nflow/core": "0.1.0",
    "@i18nflow/kiwi": "0.1.0"
    // ...
  },
  "changesets": []
}
```

#### Step 2: 记录变更

```bash
# 正常记录变更
pnpm changeset
# 选择包、版本类型、输入描述
```

#### Step 3: 更新版本

```bash
# 版本号会变成 beta 格式
pnpm changeset version

# 查看版本变化
git diff packages/*/package.json
```

**版本号示例：**

```
0.1.0 → 0.2.0-beta.0
0.2.0-beta.0 → 0.2.0-beta.1
```

#### Step 4: 提交并创建 Release

```bash
# 提交
git add .
git commit -m "chore: version packages (beta)"
git push

# 创建 GitHub Release
# Tag: v0.2.0-beta.0
# Title: Release v0.2.0-beta.0 (Beta)
# ☑️ "Set as a pre-release" (勾选)
# ☐ "Set as the latest release" (不勾选)
```

#### Step 5: 自动发布到 NPM

```bash
# NPM tag: beta
# 版本号: 0.2.0-beta.0
```

**安装 beta 版本：**

```bash
# 显式指定版本
npm install @i18nflow/kiwi@0.2.0-beta.0

# 或使用 beta tag
npm install @i18nflow/kiwi@beta
```

#### Step 6: 发布更多 Beta 版本（可选）

```bash
# 继续记录变更
pnpm changeset

# 更新版本（自动递增 beta 号）
pnpm changeset version
# 0.2.0-beta.0 → 0.2.0-beta.1

# 提交并创建 Release
git add .
git commit -m "chore: version packages (beta.1)"
git push

# 创建 Release: v0.2.0-beta.1
```

#### Step 7: 退出 Pre-release 模式

**当 beta 测试完成，准备发布正式版：**

```bash
# 退出 pre 模式
pnpm changeset pre exit

# 更新版本（移除 beta 标签）
pnpm changeset version
# 0.2.0-beta.1 → 0.2.0

# 提交
git add .
git commit -m "chore: version packages (stable)"
git push

# 创建正式版 Release: v0.2.0
```

---

### 方式三：Alpha 版本

**用于早期测试的 alpha 版本**

```bash
# 进入 alpha 模式
pnpm changeset pre enter alpha

# 后续流程与 beta 相同
# 版本号: 0.2.0-alpha.0, 0.2.0-alpha.1, ...
# NPM tag: alpha

# 安装
npm install @i18nflow/kiwi@alpha
```

---

### 方式四：RC 版本（Release Candidate）

**用于发布候选版本**

```bash
# 进入 rc 模式
pnpm changeset pre enter rc

# 版本号: 0.2.0-rc.0, 0.2.0-rc.1, ...
# NPM tag: rc

# 安装
npm install @i18nflow/kiwi@rc
```

---

## 📊 版本号对比

| 模式       | 版本号示例      | NPM Tag  | 适用场景 |
| ---------- | --------------- | -------- | -------- |
| **Stable** | `0.2.0`         | `latest` | 生产环境 |
| **Beta**   | `0.2.0-beta.0`  | `beta`   | 公开测试 |
| **Alpha**  | `0.2.0-alpha.0` | `alpha`  | 内部测试 |
| **RC**     | `0.2.0-rc.0`    | `rc`     | 发布候选 |

---

## 🔍 验证发布

### 查看 NPM 上的版本

```bash
# 查看所有版本
npm view @i18nflow/kiwi versions

# 查看 latest tag
npm view @i18nflow/kiwi dist-tags

# 输出示例：
# {
#   latest: '0.2.0',
#   beta: '0.3.0-beta.0',
#   alpha: '0.4.0-alpha.1'
# }
```

### 安装特定版本

```bash
# 默认安装 latest
npm install @i18nflow/kiwi
# → 0.2.0

# 安装 beta
npm install @i18nflow/kiwi@beta
# → 0.3.0-beta.0

# 安装具体版本
npm install @i18nflow/kiwi@0.3.0-beta.0
```

---

## ⚠️ 重要注意事项

### 1. Pre-release 模式是全局的

```bash
# 进入 beta 模式后，所有包都会使用 beta 版本号
pnpm changeset pre enter beta

# 如果只想某个包是 beta，需要手动处理
# 不推荐，建议所有包版本保持一致
```

### 2. 不要忘记退出 Pre-release 模式

```bash
# 发布正式版前必须退出
pnpm changeset pre exit

# 检查是否在 pre 模式
ls .changeset/pre.json
# 如果文件存在，说明还在 pre 模式
```

### 3. GitHub Release 的勾选很重要

```
正式版：
☑️ "Set as the latest release"
☐ "Set as a pre-release"

Beta/Alpha 版：
☐ "Set as the latest release"
☑️ "Set as a pre-release"
```

### 4. 版本号必须匹配

```
GitHub Release Tag: v0.2.0-beta.0
package.json version: 0.2.0-beta.0
必须一致！
```

---

## 📝 快速命令参考

```bash
# === 正式版本 ===
pnpm changeset
git commit && git push
# 等待 Version PR，合并后创建 Release (v0.2.0)

# === Beta 版本 ===
pnpm changeset pre enter beta
pnpm changeset
pnpm changeset version
git commit && git push
# 创建 Release (v0.2.0-beta.0)，勾选 "pre-release"

# 退出 Beta
pnpm changeset pre exit
pnpm changeset version
git commit && git push
# 创建 Release (v0.2.0)

# === 查看状态 ===
pnpm changeset status          # 查看待发布的变更
cat .changeset/pre.json        # 查看是否在 pre 模式
npm view @i18nflow/kiwi versions  # 查看已发布的版本
```

---

## 🎯 推荐发布流程

### 日常开发

```
开发 → changeset → 提交 → 合并 PR → 创建 Release → 自动发布
```

### 需要测试

```
开发 → pre enter beta → changeset → version →
提交 → 创建 Beta Release → 测试 →
pre exit → version → 提交 → 创建正式 Release
```

### 紧急修复

```
修复 → changeset (patch) → 提交 → 合并 →
创建 Release (patch 版本) → 自动发布
```

---

## 🔗 相关文档

- [RELEASE.md](./RELEASE.md) - 完整发布流程
- [QUICK_RELEASE.md](./QUICK_RELEASE.md) - 快速发布指南
- [Changesets Pre-release](https://github.com/changesets/changesets/blob/main/docs/prereleases.md)
