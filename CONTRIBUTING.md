# 贡献指南

感谢你对 i18nflow 项目的关注！我们欢迎任何形式的贡献。

## 🚀 开始之前

1. Fork 这个仓库
2. 克隆你的 fork：`git clone https://github.com/your-username/i18nflow.git`
3. 安装依赖：`pnpm install`
4. 创建新分支：`git checkout -b feature/your-feature-name`

## 📝 开发流程

### 1. 确保代码质量

```bash
# 构建
pnpm build

# 测试
pnpm test

# Lint
pnpm lint

# 格式化
pnpm format
```

### 2. 添加变更记录

如果你的修改会影响用户，请添加 changeset：

```bash
pnpm changeset
```

### 3. 提交代码

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
git commit -m "feat(core): add new feature"
git commit -m "fix(plugin-webpack): fix bug"
git commit -m "docs: update README"
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具链

### 4. 推送并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 🎯 代码规范

- 使用 TypeScript
- 遵循 Prettier 配置
- 添加必要的类型注释
- 编写测试用例
- 更新相关文档

## 📦 添加新包

参考 [QUICK_START.md](./QUICK_START.md) 中的"添加新包"章节。

## 🐛 报告 Bug

在 [GitHub Issues](https://github.com/your-username/i18nflow/issues) 中创建 issue，包含：

1. Bug 描述
2. 重现步骤
3. 预期行为
4. 实际行为
5. 环境信息（Node 版本、OS 等）

## 💡 功能建议

欢迎在 [GitHub Discussions](https://github.com/your-username/i18nflow/discussions) 中讨论新功能。

## 📄 许可证

提交代码即表示你同意将代码以 MIT 许可证发布。

---

再次感谢你的贡献！❤️

