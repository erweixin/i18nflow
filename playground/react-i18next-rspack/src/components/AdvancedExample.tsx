import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * 卡片组件 - 演示 Props 传递
 */
interface CardProps {
  title: string;
  description: string;
  status: string;
  buttonLabel: string;
  onButtonClick?: () => void;
}

function Card({ title, description, status, buttonLabel, onButtonClick }: CardProps) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: 'white',
      }}
    >
      <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{title}</h4>
      <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>{description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {status}
        </span>
        <button
          onClick={onButtonClick}
          style={{
            padding: '6px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * 产品卡片组件 - 演示 map 返回组件
 */
interface Product {
  id: string;
  nameKey: string;
  categoryKey: string;
  price: number;
  stock: number;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  t: any;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, t, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: 'white',
        position: 'relative',
        opacity: isOutOfStock ? 0.6 : 1,
      }}
    >
      {product.discount && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#ff5722',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {t('mapExample.productCard.discount', { percent: product.discount })}
        </div>
      )}

      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
        {t(`mapExample.products.${product.nameKey}.name`)}
      </h4>

      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
        <strong>{t('mapExample.productCard.category')}:</strong>{' '}
        {t(`mapExample.products.${product.nameKey}.category`)}
      </p>

      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
        <strong>{t('mapExample.productCard.price')}:</strong>{' '}
        {t('mapExample.productCard.priceLabel', { price: product.price })}
      </p>

      <p style={{ margin: '5px 0', fontSize: '14px' }}>
        <strong>{t('mapExample.productCard.stock')}:</strong>{' '}
        {isOutOfStock ? (
          <span style={{ color: '#f44336' }}>{t('mapExample.productCard.outOfStock')}</span>
        ) : (
          <span style={{ color: '#4caf50' }}>
            {t('mapExample.productCard.inStock', { count: product.stock })}
          </span>
        )}
      </p>

      <button
        onClick={() => onAddToCart(product)}
        disabled={isOutOfStock}
        style={{
          marginTop: '10px',
          width: '100%',
          padding: '10px',
          backgroundColor: isOutOfStock ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {t('mapExample.productCard.addToCart')}
      </button>
    </div>
  );
}

/**
 * 表格行组件 - 演示复杂嵌套
 */
interface TableRowData {
  id: number;
  name: string;
  status: string;
  date: string;
}

interface TableRowProps {
  data: TableRowData;
  t: any;
  onAction: (action: string, data: TableRowData) => void;
}

function TableRow({ data, t, onAction }: TableRowProps) {
  return (
    <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
      <td style={{ padding: '12px', textAlign: 'center' }}>{data.id}</td>
      <td style={{ padding: '12px' }}>{data.name}</td>
      <td style={{ padding: '12px' }}>
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: data.status === 'active' ? '#d4edda' : '#fff3cd',
            color: data.status === 'active' ? '#155724' : '#856404',
            borderRadius: '12px',
            fontSize: '12px',
          }}
        >
          {data.status}
        </span>
      </td>
      <td style={{ padding: '12px' }}>{data.date}</td>
      <td style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          <button
            onClick={() => onAction('view', data)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {t('complexNesting.actions.view')}
          </button>
          <button
            onClick={() => onAction('edit', data)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {t('complexNesting.actions.edit')}
          </button>
          <button
            onClick={() => onAction('delete', data)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {t('complexNesting.actions.delete')}
          </button>
        </div>
      </td>
    </tr>
  );
}

/**
 * 高级示例主组件
 */
export default function AdvancedExample() {
  const { t, i18n } = useTranslation('advanced');
  const [notification, setNotification] = useState('');

  // 对象变量示例
  const userObject = {
    name: t('exampleData.userName1'),
    age: 28,
    email: 'john@example.com',
    city: t('exampleData.city1'),
    phone: '+86 138-0000-0000',
  };

  // 数组变量示例
  const fruits = ['apple', 'banana', 'orange', 'grape', 'watermelon'];

  // 产品列表（用于 map 示例）
  const products: Product[] = [
    { id: '1', nameKey: 'laptop', categoryKey: 'electronics', price: 5999, stock: 5, discount: 10 },
    { id: '2', nameKey: 'phone', categoryKey: 'electronics', price: 3999, stock: 10, discount: 15 },
    { id: '3', nameKey: 'book', categoryKey: 'books', price: 89, stock: 20 },
    { id: '4', nameKey: 'headphones', categoryKey: 'accessories', price: 299, stock: 0 },
  ];

  // 表格数据
  const tableData: TableRowData[] = [
    { id: 1, name: t('exampleData.projectA'), status: 'active', date: '2024-01-15' },
    { id: 2, name: t('exampleData.projectB'), status: 'pending', date: '2024-01-16' },
    { id: 3, name: t('exampleData.projectC'), status: 'active', date: '2024-01-17' },
  ];

  const handleAddToCart = () => {
    setNotification(t('dynamicComponents.notification.success'));
    setTimeout(() => setNotification(''), 3000);
  };

  const handleTableAction = (action: string, data: TableRowData) => {
    if (action === 'delete') {
      if (confirm(t('complexNesting.actions.confirm', { name: data.name }))) {
        setNotification(t('dynamicComponents.notification.success'));
      }
    } else {
      setNotification(
        t('dynamicComponents.notification.info', { message: `${action} ${data.name}` })
      );
    }
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>{t('title')}</h2>
      <p style={{ color: '#666', marginBottom: '25px' }}>{t('description')}</p>

      {/* 通知消息 */}
      {notification && (
        <div
          style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
          }}
        >
          {notification}
        </div>
      )}

      {/* 1. Props 传递示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('propsExample.title')}</h3>
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
          {t('propsExample.description')}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '15px',
          }}
        >
          <Card
            title={t('propsExample.cardTitle', { title: t('propsExample.card1Title') })}
            description={t('propsExample.cardDescription', {
              description: t('propsExample.card1Description'),
            })}
            status={t('propsExample.status.active')}
            buttonLabel={t('propsExample.buttonLabel')}
            onButtonClick={() => alert(t('propsExample.tooltip'))}
          />
          <Card
            title={t('propsExample.cardTitle', { title: t('propsExample.card2Title') })}
            description={t('propsExample.cardDescription', {
              description: t('propsExample.card2Description'),
            })}
            status={t('propsExample.status.pending')}
            buttonLabel={t('propsExample.buttonLabel')}
          />
          <Card
            title={t('propsExample.cardTitle', { title: t('propsExample.card3Title') })}
            description={t('propsExample.cardDescription', {
              description: t('propsExample.card3Description'),
            })}
            status={t('propsExample.status.completed')}
            buttonLabel={t('propsExample.buttonLabel')}
          />
        </div>
      </section>

      {/* 2. Array.map 产品卡片示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('mapExample.title')}</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          {products.map(product => (
            <ProductCard key={product.id} product={product} t={t} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>

      {/* 3. 对象变量示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('objectExample.title')}</h3>
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '15px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
            {t('objectExample.userInfoObject')}
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              fontSize: '14px',
            }}
          >
            <div>
              <strong>{t('objectExample.userProfile.name')}:</strong> {userObject.name}
            </div>
            <div>
              <strong>{t('objectExample.userProfile.age')}:</strong> {userObject.age}
            </div>
            <div>
              <strong>{t('objectExample.userProfile.email')}:</strong> {userObject.email}
            </div>
            <div>
              <strong>{t('objectExample.userProfile.phone')}:</strong> {userObject.phone}
            </div>
          </div>
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: '5px 0', color: '#1976d2' }}>
              📝{' '}
              {t('objectExample.displayText', {
                name: userObject.name,
                age: userObject.age,
                email: userObject.email,
              })}
            </p>
            <p style={{ margin: '5px 0', color: '#1976d2' }}>
              📝{' '}
              {t('objectExample.fullInfo', {
                name: userObject.name,
                age: userObject.age,
                city: userObject.city,
                phone: userObject.phone,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* 4. 数组变量示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('arrayExample.title')}</h3>
        <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{t('arrayExample.listTitle')}</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
            {fruits.map((fruit, index) => (
              <span
                key={index}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '20px',
                  fontSize: '14px',
                }}
              >
                {t(`arrayExample.items.${fruit}`)}
              </span>
            ))}
          </div>
          <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
            {t('arrayExample.itemCount', { count: fruits.length })}
          </p>
          <p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
            {t('arrayExample.selectedItems', {
              items: fruits.map(f => t(`arrayExample.items.${f}`)).join(', '),
            })}
          </p>
        </div>
      </section>

      {/* 5. 复杂表格嵌套示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('complexNesting.title')}</h3>
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '15px',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  {t('complexNesting.tableHeaders.id')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  {t('complexNesting.tableHeaders.name')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  {t('complexNesting.tableHeaders.status')}
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  {t('complexNesting.tableHeaders.date')}
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  {t('complexNesting.tableHeaders.action')}
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(row => (
                <TableRow key={row.id} data={row} t={t} onAction={handleTableAction} />
              ))}
            </tbody>
          </table>
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
            }}
          >
            {tableData.map((row, index) => (
              <p key={row.id} style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                {t('complexNesting.rowInfo', { index: index + 1, name: row.name, id: row.id })}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 条件渲染示例 */}
      <section style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('conditionalRender.title')}</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {[
            { isLoggedIn: true, username: t('exampleData.userName1') },
            { isLoggedIn: false, username: '' },
          ].map((user, index) => (
            <div
              key={index}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                borderLeft: `4px solid ${user.isLoggedIn ? '#4caf50' : '#ff9800'}`,
              }}
            >
              {user.isLoggedIn ? (
                <p style={{ margin: 0, color: '#2e7d32' }}>
                  ✅ {t('conditionalRender.loginStatus.loggedIn', { username: user.username })}
                </p>
              ) : (
                <p style={{ margin: 0, color: '#f57c00' }}>
                  ⚠️ {t('conditionalRender.loginStatus.loggedOut')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. 模板字符串复杂示例 */}
      <section>
        <h3 style={{ color: '#27ae60', marginBottom: '15px' }}>{t('templateLiterals.title')}</h3>
        <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ margin: '10px 0', fontSize: '14px', color: '#333' }} suppressHydrationWarning>
            🌤️{' '}
            {t('templateLiterals.greeting', {
              name: t('exampleData.userName1'),
              date: new Date().toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'),
              weather: t('exampleData.weather'),
            })}
          </p>
          <p style={{ margin: '10px 0', fontSize: '14px', color: '#333' }}>
            💰 {t('templateLiterals.summary', { total: 3, price: 150, discount: 20, final: 130 })}
          </p>
          <p style={{ margin: '10px 0', fontSize: '14px', color: '#333' }} suppressHydrationWarning>
            📊{' '}
            {t('templateLiterals.userStatus', {
              username: t('exampleData.userName2'),
              time: new Date().toLocaleTimeString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US'),
              location: t('exampleData.city1'),
              action: t('exampleData.action'),
              count: 5,
              item: t('exampleData.item'),
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
