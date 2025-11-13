import React, { useState } from 'react';
import I18N from '../locales/I18N';

/**
 * 模板插值示例
 * 展示 Kiwi-Intl 的 template API 用法
 */
const TemplateExample: React.FC = () => {
  const [username, setUsername] = useState('Alice');
  const [age, setAge] = useState(25);
  const [messageCount, setMessageCount] = useState(5);
  const [sender, setSender] = useState('Bob');

  return (
    <section className="example-section">
      <h3>{I18N.examples.template.title}</h3>
      <div className="example-content">

        {/* 示例 1: 单个变量插值 */}
        <div className="demo-box">
          <h4>1. 单个变量插值</h4>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入用户名"
          />
          <p className="result">
            {/* 使用 template 方法进行变量替换 */}
            {I18N.template?.(I18N.examples.template.helloUser, { username })}
          </p>
          <div className="code-block">
            <code>
              {`I18N.template(I18N.examples.template.helloUser, { username })`}
            </code>
          </div>
        </div>

        {/* 示例 2: 多个变量插值 */}
        <div className="demo-box">
          <h4>2. 多个变量插值</h4>
          <div className="input-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="姓名"
            />
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="年龄"
            />
          </div>
          <p className="result">
            {I18N.template?.(I18N.examples.template.userInfo, {
              name: username,
              age: age,
            })}
          </p>
          <div className="code-block">
            <code>
              {`I18N.template(I18N.examples.template.userInfo, {
  name: username,
  age: age
})`}
            </code>
          </div>
        </div>

        {/* 示例 3: 复杂场景 - 多个变量 */}
        <div className="demo-box">
          <h4>3. 复杂变量插值</h4>
          <div className="input-group">
            <input
              type="number"
              value={messageCount}
              onChange={(e) => setMessageCount(Number(e.target.value))}
              placeholder="消息数量"
            />
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="发送者"
            />
          </div>
          <p className="result">
            {I18N.template?.(I18N.examples.template.multipleVars, {
              count: messageCount,
              sender: sender,
            })}
          </p>
          <div className="code-block">
            <code>
              {`I18N.template(I18N.examples.template.multipleVars, {
  count: messageCount,
  sender: sender
})`}
            </code>
          </div>
        </div>

        {/* API 说明 */}
        <div className="api-note">
          <h4>📘 Template API 说明</h4>
          <p>
            <code>I18N.template(text, variables)</code> 方法用于将变量插入到文本模板中。
          </p>
          <ul>
            <li><strong>text:</strong> 包含 {`{variableName}`} 占位符的文本模板</li>
            <li><strong>variables:</strong> 包含要替换的变量的对象</li>
            <li><strong>返回值:</strong> 替换变量后的完整文本</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TemplateExample;

