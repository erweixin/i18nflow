// English language pack
export default {
  app: {
    title: 'Kiwi-Intl + Rspack Demo',
    description: 'A demo project showcasing various Kiwi-Intl API usages',
  },
  welcome: {
    greeting: 'Hello, {name}!',
    message: 'Welcome to Kiwi-Intl internationalization solution',
    todayIs: 'Today is {date}',
  },
  features: {
    title: 'Features',
    basic: 'Basic Text',
    template: 'Template Interpolation',
    plural: 'Pluralization',
    currency: 'Currency Format',
    date: 'Date Format',
  },
  examples: {
    basic: {
      title: 'Basic Usage',
      content: 'This is the most basic way to use internationalized text',
    },
    template: {
      title: 'Template Interpolation',
      helloUser: 'Hello, {username}!',
      userInfo: 'User {name} is {age} years old',
      multipleVars: 'You have {count} messages from {sender}',
    },
    plural: {
      title: 'Pluralization',
      itemCount: '{count} items',
      messageCount_zero: 'No messages',
      messageCount_one: '1 message',
      messageCount_other: '{count} messages',
    },
    format: {
      title: 'Formatting',
      price: 'Price: ${value}',
      date: 'Date: {value}',
      time: 'Time: {value}',
    },
  },
  button: {
    switchLanguage: 'Switch Language',
    refresh: 'Refresh',
    submit: 'Submit',
    cancel: 'Cancel',
  },
  form: {
    username: 'Username',
    password: 'Password',
    email: 'Email',
    phone: 'Phone',
    placeholder: {
      username: 'Enter username',
      password: 'Enter password',
      email: 'Enter email address',
    },
    validation: {
      required: '{field} is required',
      minLength: '{field} must be at least {min} characters',
      maxLength: '{field} must be at most {max} characters',
      invalid: '{field} format is invalid',
    },
  },
  notification: {
    success: 'Operation successful!',
    error: 'Operation failed: {message}',
    warning: 'Warning: {message}',
    info: 'Info: {message}',
  },
};

