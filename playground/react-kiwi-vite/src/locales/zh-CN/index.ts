import module from './module';
import examples from './examples';

// 中文语言包
export default {
  ...module,
  features: {
    title: '功能特性',
    basic: '基础文案',
    template: '模板插值',
    plural: '复数处理',
    currency: '货币格式化',
    date: '日期格式化',
  },
  examples,
  button: {
    switchLanguage: '切换语言',
    refresh: '刷新',
    submit: '提交',
    cancel: '取消',
  },
  form: {
    username: '用户名',
    password: '密码',
    email: '邮箱',
    phone: '手机号',
    placeholder: {
      username: '请输入用户名',
      password: '请输入密码',
      email: '请输入邮箱地址',
    },
    validation: {
      required: '{field} 不能为空',
      minLength: '{field} 至少需要 {min} 个字符',
      maxLength: '{field} 最多 {max} 个字符',
      invalid: '{field} 格式不正确',
    },
  },
  notification: {
    success: '操作成功！',
    error: '操作失败：{message}',
    warning: '警告：{message}',
    info: '提示：{message}',
  },
  footer: {
    poweredBy: 'Powered by',
    and: ' & ',
    devModeTip: '💡 开发模式：按住 Ctrl+Shift (Mac: Cmd+Shift) 点击文案即可编辑',
  },
};
