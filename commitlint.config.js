module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // Bug 修复
        'docs', // 文档更新
        'style', // 代码格式（不影响代码运行的变动）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'build', // 构建系统或外部依赖的变动
        'ci', // CI 配置文件和脚本的变动
        'chore', // 其他不修改 src 或 test 文件的变动
        'revert', // 回滚 commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-empty': [0],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [0, 'never', '.'],
    'subject-case': [0],
    'header-max-length': [2, 'always', 200],
  },
};
