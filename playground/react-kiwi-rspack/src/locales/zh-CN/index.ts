// 中文语言包
export default {
  app: {
    title: 'Kiwi-Intl + Rspack 示例项目',
    description: '这是一个展示 Kiwi-Intl 多种 API 用法的示例项目',
  },
  welcome: {
    greeting: '你好，{name}！',
    message: '欢迎使用 Kiwi-Intl 国际化解决方案',
    todayIs: '今天是 {date}',
  },
  features: {
    title: '功能特性',
    basic: '基础文案',
    template: '模板插值',
    plural: '复数处理',
    currency: '货币格式化',
    date: '日期格式化',
  },
  examples: {
    basic: {
      title: '基础用法',
      content: '这是最基本的国际化文案使用方式',
    },
    template: {
      title: '模板插值',
      helloUser: '你好，{username}！',
      userInfo: '用户 {name} 今年 {age} 岁',
      multipleVars: '有 {count} 条消息来自 {sender}',
    },
    plural: {
      title: '复数处理',
      itemCount: '{count} 个项目',
      messageCount_zero: '没有消息',
      messageCount_one: '1 条消息',
      messageCount_other: '{count} 条消息',
    },
    format: {
      title: '格式化',
      price: '价格：¥{value}',
      date: '日期：{value}',
      time: '时间：{value}',
    },
  },
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
};

