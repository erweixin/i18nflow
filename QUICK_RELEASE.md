# 🚀 快速发布指南

## 三步发布到 NPM

### 1️⃣ 记录变更

```bash
pnpm changeset
```

按提示操作：

- 选择要发布的包（空格选择）
- 选择版本类型（patch/minor/major）
- 输入变更描述

### 2️⃣ 提交并等待 PR

```bash
git add .
git commit -m "feat: your feature"
git push
```

GitHub Actions 会自动创建 **"chore: version packages"** PR

### 3️⃣ 合并 PR 并创建 Release

1. **合并版本 PR**
2. **创建 GitHub Release**:
   - Tag: `v0.2.0`（必须以 v 开头）
   - Title: `Release v0.2.0`
   - Description: 从 CHANGELOG 复制
3. **点击 "Publish release"**

**🎉 完成！NPM 会自动发布**

---

## ⚙️ 首次配置（只需一次）

### 1. 生成 NPM Token

访问：https://www.npmjs.com/settings/YOUR_USERNAME/tokens

- 点击 "Generate New Token"
- 类型选择 **"Automation"**
- 复制 token

### 2. 配置 GitHub Secret

访问：https://github.com/erweixin/i18nflow/settings/secrets/actions

- 点击 "New repository secret"
- Name: `NPM_TOKEN`
- Value: 粘贴你的 token
- 保存

**✅ 配置完成！**

---

## 📝 示例流程

```bash
# 1. 开发新功能
git checkout -b feat/new-feature
# ... 编写代码 ...

# 2. 记录变更
pnpm changeset
# 选择: @i18nflow/kiwi
# 类型: minor
# 描述: feat: add optional chaining support

# 3. 提交
git add .
git commit -m "feat: add optional chaining support"
git push

# 4. 创建 PR，审查后合并到 main

# 5. 等待 "chore: version packages" PR 自动创建

# 6. 审查并合并版本 PR

# 7. 在 GitHub 创建 Release
# Tag: v0.2.0
# Title: Release v0.2.0
# Description: 复制 CHANGELOG 内容
# 点击 "Publish release"

# 8. 验证发布
npm info @i18nflow/kiwi
# 应该显示 version: 0.2.0
```

---

## 🔍 常用命令

```bash
# 查看待发布的变更
pnpm changeset status

# 本地预览版本更新（不会真正更新）
pnpm changeset version --dry-run

# 测试发布（不会真正发布）
pnpm -r publish --dry-run --no-git-checks

# 查看包信息
npm info @i18nflow/kiwi
```

---

## ❓ 常见问题

**Q: 如何发布 beta 版本？**

```bash
pnpm changeset pre enter beta
pnpm changeset
pnpm changeset version
# 提交后，创建 Release 时勾选 "Set as a pre-release"
```

**Q: 发布失败了怎么办？**

1. 查看 GitHub Actions 日志
2. 检查 NPM Token 是否有效
3. 删除失败的 Release，修复问题后重新创建

**Q: 如何只发布某个包？**

在 `pnpm changeset` 时只选择该包即可

**Q: Version PR 没有自动创建？**

检查 `.changeset` 目录下是否有 `.md` 文件，如果有才会创建 PR

---

## 📚 更多信息

详细文档请查看：[RELEASE.md](./RELEASE.md)

遇到问题？[提交 Issue](https://github.com/erweixin/i18nflow/issues)
