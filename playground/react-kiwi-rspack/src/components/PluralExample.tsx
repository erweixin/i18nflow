import React, { useState } from 'react';
import I18N from '../locales/I18N';

/**
 * 复数处理示例
 * 展示 Kiwi-Intl 的复数处理能力
 */
const PluralExample: React.FC = () => {
  const [itemCount, setItemCount] = useState(5);
  const [messageCount, setMessageCount] = useState(0);

  // 根据数量返回对应的复数形式
  const getPluralMessage = (count: number): string | undefined => {
    if (count === 0) {
      return I18N.examples.plural.messageCount_zero;
    } else if (count === 1) {
      return I18N.examples.plural.messageCount_one;
    } else {
      return I18N.template?.(I18N.examples.plural.messageCount_other, { count });
    }
  };

  return (
    <section className="example-section">
      <h3>{I18N.examples.plural.title}</h3>
      <div className="example-content">
        {/* 示例 1: 简单计数 */}
        <div className="demo-box">
          <h4>1. 基础计数</h4>
          <div className="counter-controls">
            <button onClick={() => setItemCount(Math.max(0, itemCount - 1))}>-</button>
            <span className="counter-value">{itemCount}</span>
            <button onClick={() => setItemCount(itemCount + 1)}>+</button>
          </div>
          <p className="result">
            {I18N.template?.(I18N.examples.plural.itemCount, { count: itemCount })}
          </p>
          <div className="code-block">
            <code>{`I18N.template(I18N.examples.plural.itemCount, { count: ${itemCount} })`}</code>
          </div>
        </div>

        {/* 示例 2: 复数形式处理 */}
        <div className="demo-box">
          <h4>2. 复数形式处理 (zero/one/other)</h4>
          <div className="counter-controls">
            <button onClick={() => setMessageCount(Math.max(0, messageCount - 1))}>-</button>
            <span className="counter-value">{messageCount}</span>
            <button onClick={() => setMessageCount(messageCount + 1)}>+</button>
          </div>
          <p className="result">{getPluralMessage(messageCount)}</p>
          <div className="code-block">
            <code>
              {`// 根据数量选择不同的文案
const getPluralMessage = (count: number) => {
  if (count === 0) return I18N.examples.plural.messageCount_zero;
  if (count === 1) return I18N.examples.plural.messageCount_one;
  return I18N.template?.(I18N.examples.plural.messageCount_other, { count });
};`}
            </code>
          </div>
        </div>

        {/* 显示当前状态 */}
        <div className="demo-box status-box">
          <h4>当前状态</h4>
          <ul>
            <li>
              <strong>项目数:</strong> {itemCount}
            </li>
            <li>
              <strong>消息数:</strong> {messageCount}
            </li>
            <li>
              <strong>复数形式:</strong>{' '}
              {messageCount === 0 ? 'zero' : messageCount === 1 ? 'one' : 'other'}
            </li>
          </ul>
        </div>

        {/* API 说明 */}
        <div className="api-note">
          <h4>📘 复数处理说明</h4>
          <p>Kiwi-Intl 支持多种复数形式的处理：</p>
          <ul>
            <li>
              <strong>zero:</strong> 数量为 0 时的特殊文案
            </li>
            <li>
              <strong>one:</strong> 数量为 1 时的文案
            </li>
            <li>
              <strong>other:</strong> 其他数量的文案（通常使用 template 插值）
            </li>
          </ul>
          <p>
            通过在语言包中定义不同后缀的 key（如 messageCount_zero），可以实现复数形式的本地化。
          </p>
        </div>
      </div>
    </section>
  );
};

export default PluralExample;
