import React from 'react';
import I18N from '../locales/I18N';

/**
 * 基础用法示例
 * 展示最基本的国际化文案使用方式
 */
const BasicExample: React.FC = () => {
  return (
    <section className="example-section">
      <h3>{I18N.examples.basic.title}</h3>
      <div className="example-content">
        <p className="highlight">{I18N.examples.basic.content}</p>

        <div className="code-block">
          <code>
            {`// 直接访问 I18N 对象的属性
I18N.examples.basic.content`}
          </code>
        </div>

        <div className="feature-list">
          <div className="feature-item">
            <strong>{I18N.features.basic}:</strong>
            <span>{I18N.examples.basic.content}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicExample;
