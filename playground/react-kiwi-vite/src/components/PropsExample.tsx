import React from 'react';
import I18N from '../locales/I18N';

/**
 * Props 传递示例
 * 展示通过 props 传递 I18N 值的复杂场景
 */

// 子组件：接收 I18N 值作为 props
interface CardProps {
  title: string; // 从父组件传递的 I18N 值
  description: string; // 从父组件传递的 I18N 值
  buttonText: string; // 从父组件传递的 I18N 值
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, buttonText, onClick }) => {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p>{description}</p>
      <button onClick={onClick}>{buttonText}</button>
    </div>
  );
};

// 子组件：接收数组中的 I18N 值
interface ListItemProps {
  label: string; // 从数组项中传递的 I18N 值
  value: string; // 从数组项中传递的 I18N 值
}

const ListItem: React.FC<ListItemProps> = ({ label, value }) => {
  return (
    <div className="list-item">
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </div>
  );
};

// 子组件：接收对象中的 I18N 值
interface InfoCardProps {
  info: {
    name: string; // 对象中的 I18N 值
    role: string; // 对象中的 I18N 值
    department: string; // 对象中的 I18N 值
  };
}

const InfoCard: React.FC<InfoCardProps> = ({ info }) => {
  return (
    <div className="info-card">
      <h4>{info.name}</h4>
      <p>
        {I18N.examples.props.role}: {info.role}
      </p>
      <p>
        {I18N.examples.props.department}: {info.department}
      </p>
    </div>
  );
};

// 主示例组件
const PropsExample: React.FC = () => {
  // 场景 1: 直接传递 I18N 值给子组件
  const cardData = {
    title: I18N.examples.props.cardTitle,
    description: I18N.examples.props.cardDescription,
    buttonText: I18N.button.submit,
  };

  // 场景 2: 数组中的 I18N 值
  const listItems = [
    {
      label: I18N.examples.props.label1,
      value: I18N.examples.props.value1,
    },
    {
      label: I18N.examples.props.label2,
      value: I18N.examples.props.value2,
    },
    {
      label: I18N.examples.props.label3,
      value: I18N.examples.props.value3,
    },
  ];

  // 场景 3: 对象中的 I18N 值
  const userInfo = {
    name: I18N.examples.props.userName,
    role: I18N.examples.props.userRole,
    department: I18N.examples.props.userDepartment,
  };

  // 场景 4: 动态生成的数据（包含 I18N 值）
  const menuItems = [
    {
      id: 1,
      text: I18N.examples.props.menuItem1,
      icon: '📊',
    },
    {
      id: 2,
      text: I18N.examples.props.menuItem2,
      icon: '⚙️',
    },
    {
      id: 3,
      text: I18N.examples.props.menuItem3,
      icon: '👤',
    },
  ];

  return (
    <section className="example-section">
      <h3>{I18N.examples.props.title}</h3>
      <div className="example-content">
        <p className="highlight">{I18N.examples.props.description}</p>

        {/* 场景 1: 直接传递 I18N 值 */}
        <div className="example-subsection">
          <h4>{I18N.examples.props.scenario1}</h4>
          <div className="code-block">
            <code>
              {`// 父组件中定义
const cardData = {
  title: I18N.examples.props.cardTitle,
  description: I18N.examples.props.cardDescription,
  buttonText: I18N.button.submit,
};

// 传递给子组件
<Card {...cardData} />`}
            </code>
          </div>
          <Card {...cardData} onClick={() => alert('Card clicked!')} />
        </div>

        {/* 场景 2: 数组中的 I18N 值 */}
        <div className="example-subsection">
          <h4>{I18N.examples.props.scenario2}</h4>
          <div className="code-block">
            <code>
              {`// 数组中的 I18N 值
const listItems = [
  { label: I18N.examples.props.label1, value: I18N.examples.props.value1 },
  { label: I18N.examples.props.label2, value: I18N.examples.props.value2 },
];

// 遍历渲染
{listItems.map((item, index) => (
  <ListItem key={index} {...item} />
))}`}
            </code>
          </div>
          <div className="list-container">
            {listItems.map((item, index) => (
              <ListItem key={index} {...item} />
            ))}
          </div>
        </div>

        {/* 场景 3: 对象中的 I18N 值 */}
        <div className="example-subsection">
          <h4>{I18N.examples.props.scenario3}</h4>
          <div className="code-block">
            <code>
              {`// 对象中的 I18N 值
const userInfo = {
  name: I18N.examples.props.userName,
  role: I18N.examples.props.userRole,
  department: I18N.examples.props.userDepartment,
};

// 传递给子组件
<InfoCard info={userInfo} />`}
            </code>
          </div>
          <InfoCard info={userInfo} />
        </div>

        {/* 场景 4: 动态生成的数据 */}
        <div className="example-subsection">
          <h4>{I18N.examples.props.scenario4}</h4>
          <div className="code-block">
            <code>
              {`// 动态数据中包含 I18N 值
const menuItems = [
  { id: 1, text: I18N.examples.props.menuItem1, icon: '📊' },
  { id: 2, text: I18N.examples.props.menuItem2, icon: '⚙️' },
];

// 在 map 中使用
{menuItems.map(item => (
  <div key={item.id}>
    {item.icon} {item.text}
  </div>
))}`}
            </code>
          </div>
          <div className="menu-container">
            {menuItems.map(item => (
              <div key={item.id} className="menu-item">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 场景 5: 嵌套组件传递 */}
        <div className="example-subsection">
          <h4>{I18N.examples.props.scenario5}</h4>
          <div className="code-block">
            <code>
              {`// 多层组件传递
<ParentComponent>
  <ChildComponent title={I18N.examples.props.nestedTitle} />
</ParentComponent>`}
            </code>
          </div>
          <NestedComponentExample />
        </div>
      </div>
    </section>
  );
};

// 场景 5: 嵌套组件示例
interface NestedChildProps {
  title: string;
  subtitle: string;
}

const NestedChild: React.FC<NestedChildProps> = ({ title, subtitle }) => {
  return (
    <div className="nested-child">
      <h5>{title}</h5>
      <p>{subtitle}</p>
    </div>
  );
};

const NestedParent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="nested-parent">{children}</div>;
};

const NestedComponentExample: React.FC = () => {
  return (
    <NestedParent>
      <NestedChild
        title={I18N.examples.props.nestedTitle}
        subtitle={I18N.examples.props.nestedSubtitle}
      />
    </NestedParent>
  );
};

export default PropsExample;
