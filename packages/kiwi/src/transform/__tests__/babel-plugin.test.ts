/**
 * Babel 插件测试
 * 测试所有转换场景
 */

import { transformSync } from '@babel/core';
import { describe, it, expect } from 'vitest';
import { createKiwiBabelPlugin } from '../babel-plugin';

// 辅助函数：转换代码
function transform(code: string): string {
  const result = transformSync(code, {
    plugins: [[createKiwiBabelPlugin({ i18nIdentifier: 'I18N' })]],
    filename: 'test.tsx',
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
  });

  return result?.code || '';
}

describe('Babel 插件 - JSX 属性转换', () => {
  describe('原生 HTML 标签的字符串属性', () => {
    it('应该为 input placeholder 添加 String()', () => {
      const code = `
        const Component = () => (
          <input placeholder={I18N.form.placeholder} />
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.form.placeholder)');
      expect(output).toContain('data-i18n-key="form.placeholder"');
    });

    it('应该为 input title 添加 String()', () => {
      const code = `
        const Component = () => (
          <input title={I18N.form.inputTitle} />
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.form.inputTitle)');
      expect(output).toContain('data-i18n-key="form.inputTitle"');
    });

    it('应该为 img alt 添加 String()', () => {
      const code = `
        const Component = () => (
          <img alt={I18N.common.imageAlt} src="test.jpg" />
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.common.imageAlt)');
      expect(output).toContain('data-i18n-key="common.imageAlt"');
    });

    it('应该为 div title 添加 String()', () => {
      const code = `
        const Component = () => (
          <div title={I18N.common.tooltip}>Content</div>
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.common.tooltip)');
      expect(output).toContain('data-i18n-key="common.tooltip"');
    });

    it('应该为 label htmlFor 添加 String()', () => {
      const code = `
        const Component = () => (
          <label htmlFor={I18N.form.fieldId}>Label</label>
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.form.fieldId)');
    });
  });

  describe('自定义组件的属性', () => {
    it('不应该为自定义组件 title 属性添加 String()', () => {
      const code = `
        const Component = () => (
          <Card title={I18N.examples.title} />
        );
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.examples.title)');
      expect(output).toContain('I18N.examples.title');
      expect(output).toContain('data-i18n-key="examples.title"');
    });

    it('不应该为嵌套组件属性添加 String()', () => {
      const code = `
        const Component = () => (
          <NestedChild
            title={I18N.examples.props.nestedTitle}
            subtitle={I18N.examples.props.nestedSubtitle}
          />
        );
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.examples.props.nestedTitle)');
      expect(output).not.toContain('String(I18N.examples.props.nestedSubtitle)');
      expect(output).toContain('I18N.examples.props.nestedTitle');
      expect(output).toContain('I18N.examples.props.nestedSubtitle');
    });

    it('不应该为自定义组件的非字符串属性添加 String()', () => {
      const code = `
        const Component = () => (
          <CustomButton label={I18N.button.submit} />
        );
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.button.submit)');
      expect(output).toContain('I18N.button.submit');
    });
  });

  describe('template 方法调用', () => {
    it('应该为原生标签属性中的 template 调用添加 String()', () => {
      const code = `
        const Component = () => (
          <input placeholder={I18N.template(I18N.form.fieldRequired, { field: 'username' })} />
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.template');
    });

    it('不应该为自定义组件属性中的 template 调用添加 String()', () => {
      const code = `
        const Component = () => (
          <Card title={I18N.template(I18N.common.welcome, { name: 'User' })} />
        );
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.template');
      expect(output).toContain('I18N.template');
    });
  });
});

describe('Babel 插件 - JSX 子元素转换', () => {
  describe('直接 I18N 调用', () => {
    it('应该为 JSX 子元素中的直接 I18N 调用添加 String()', () => {
      const code = `
        const Component = () => (
          <div>{I18N.common.title}</div>
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.common.title)');
      expect(output).toContain('data-i18n-key="common.title"');
    });

    it('应该为嵌套 JSX 中的 I18N 调用添加 String()', () => {
      const code = `
        const Component = () => (
          <div>
            <h1>{I18N.page.title}</h1>
            <p>{I18N.page.description}</p>
          </div>
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.page.title)');
      expect(output).toContain('String(I18N.page.description)');
    });

    it('应该为 template 调用添加 String()', () => {
      const code = `
        const Component = () => (
          <div>{I18N.template(I18N.common.welcome, { name: 'User' })}</div>
        );
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.template');
    });
  });

  describe('变量引用', () => {
    it('不应该为变量引用添加 String()', () => {
      const code = `
        const Component = () => {
          const items = [{ label: I18N.menu.item1 }];
          return (
            <div>
              {items.map(item => <span key={item.label}>{item.label}</span>)}
            </div>
          );
        };
      `;
      const output = transform(code);

      // 变量引用 item.label 不应该被包裹
      expect(output).toMatch(/>\s*\{item\.label\}\s*</);
    });

    it('不应该为 props 传递的变量添加 String()', () => {
      const code = `
        const Component = ({ title }) => {
          return <h1>{title}</h1>;
        };
      `;
      const output = transform(code);

      expect(output).not.toContain('String(title)');
    });
  });
});

describe('Babel 插件 - 对象属性转换', () => {
  describe('对象中的 I18N 值', () => {
    it('不应该为对象属性中的 I18N 值添加 String()', () => {
      const code = `
        const Component = () => {
          const cardData = {
            title: I18N.examples.props.nestedTitle,
            subtitle: I18N.examples.props.nestedSubtitle,
          };
          return null;
        };
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.examples.props.nestedTitle)');
      expect(output).not.toContain('String(I18N.examples.props.nestedSubtitle)');
      expect(output).toContain('I18N.examples.props.nestedTitle');
    });

    it('不应该为数组中的对象属性添加 String()', () => {
      const code = `
        const Component = () => {
          const items = [
            { label: I18N.menu.item1, value: '1' },
            { label: I18N.menu.item2, value: '2' },
          ];
          return null;
        };
      `;
      const output = transform(code);

      expect(output).not.toContain('String(I18N.menu.item1)');
      expect(output).not.toContain('String(I18N.menu.item2)');
    });
  });

  describe('函数返回值', () => {
    it('应该为箭头函数隐式返回的 I18N 值添加 String()', () => {
      const code = `
        const Component = () => {
          const config = {
            formatter: () => I18N.chart.label,
          };
          return null;
        };
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.chart.label)');
    });

    it('应该为显式 return 语句中的 I18N 值添加 String()', () => {
      const code = `
        const Component = () => {
          const config = {
            formatter: () => {
              return I18N.chart.label;
            },
          };
          return null;
        };
      `;
      const output = transform(code);

      expect(output).toContain('String(I18N.chart.label)');
    });
  });
});

describe('Babel 插件 - 复杂场景', () => {
  it('应该正确处理混合场景：对象 + props 传递 + JSX 渲染', () => {
    const code = `
      const Card = ({ title, description }) => {
        return (
          <div>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
        );
      };

      const Component = () => {
        const cardData = {
          title: I18N.examples.props.cardTitle,
          description: I18N.examples.props.cardDescription,
        };
        return <Card {...cardData} />;
      };
    `;
    const output = transform(code);

    // 对象中的 I18N 值不应该被包裹
    expect(output).toContain('I18N.examples.props.cardTitle');
    expect(output).toContain('I18N.examples.props.cardDescription');

    // props 传递的变量不应该被包裹
    expect(output).not.toContain('String(title)');
    expect(output).not.toContain('String(description)');
  });

  it('应该正确处理表单示例', () => {
    const code = `
      const FormExample = () => {
        return (
          <form>
            <input
              placeholder={I18N.form.usernamePlaceholder}
              name="username"
            />
            <input
              placeholder={I18N.form.passwordPlaceholder}
              type="password"
            />
            <button type="submit">{I18N.button.submit}</button>
          </form>
        );
      };
    `;
    const output = transform(code);

    // 原生 input placeholder 应该被包裹
    expect(output).toContain('String(I18N.form.usernamePlaceholder)');
    expect(output).toContain('String(I18N.form.passwordPlaceholder)');

    // button 子元素中的直接调用应该被包裹
    expect(output).toContain('String(I18N.button.submit)');
  });

  it('应该正确处理列表渲染场景', () => {
    const code = `
      const ListExample = () => {
        const items = [
          { label: I18N.menu.item1, value: '1' },
          { label: I18N.menu.item2, value: '2' },
        ];

        return (
          <ul>
            {items.map(item => (
              <li key={item.value}>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        );
      };
    `;
    const output = transform(code);

    // 对象中的值不应该被包裹
    expect(output).toContain('I18N.menu.item1');
    expect(output).toContain('I18N.menu.item2');

    // 变量引用不应该被包裹
    expect(output).not.toContain('String(item.label)');
  });

  it('应该正确处理嵌套组件场景', () => {
    const code = `
      const NestedChild = ({ title, subtitle }) => {
        return (
          <div>
            <h5>{title}</h5>
            <p>{subtitle}</p>
          </div>
        );
      };

      const NestedComponentExample = () => {
        return (
          <NestedParent>
            <NestedChild
              title={I18N.examples.props.nestedTitle}
              subtitle={I18N.examples.props.nestedSubtitle}
            />
          </NestedParent>
        );
      };
    `;
    const output = transform(code);

    // 自定义组件属性不应该被包裹
    expect(output).not.toContain('String(I18N.examples.props.nestedTitle)');
    expect(output).not.toContain('String(I18N.examples.props.nestedSubtitle)');

    // props 传递的变量不应该被包裹
    expect(output).not.toContain('String(title)');
    expect(output).not.toContain('String(subtitle)');
  });
});

describe('Babel 插件 - 边界情况', () => {
  it('不应该重复转换已经被 String() 包裹的表达式', () => {
    const code = `
      const Component = () => (
        <div>{String(I18N.common.title)}</div>
      );
    `;
    const output = transform(code);

    // 不应该出现 String(String(...))
    expect(output).not.toContain('String(String(');
    expect(output).toContain('String(I18N.common.title)');
  });

  it('应该跳过已经有 data-i18n-key 的元素', () => {
    const code = `
      const Component = () => (
        <div data-i18n-key="common.title">{I18N.common.title}</div>
      );
    `;
    const output = transform(code);

    // 应该保持原有的 data-i18n-key
    expect(output).toContain('data-i18n-key="common.title"');
  });

  it('应该正确处理可选链调用', () => {
    const code = `
      const Component = () => (
        <div>{I18N?.common?.title}</div>
      );
    `;
    const output = transform(code);

    // 应该能处理可选链
    expect(output).toBeDefined();
  });

  it('应该正确处理 template 的可选链调用', () => {
    const code = `
      const Component = () => (
        <div>{I18N?.template?.(I18N.common.welcome, { name: 'User' })}</div>
      );
    `;
    const output = transform(code);

    // 应该能处理 template 的可选链
    expect(output).toBeDefined();
    expect(output).toContain('String(');
  });

  it('不应该处理非 I18N 对象的表达式', () => {
    const code = `
      const Component = () => {
        const obj = { title: 'test' };
        return <div>{obj.title}</div>;
      };
    `;
    const output = transform(code);

    // 不应该添加 String()
    expect(output).not.toContain('String(obj.title)');
  });

  it('应该正确处理组件名称大小写边界', () => {
    const code = `
      const Component = () => (
        <>
          <div title={I18N.common.tooltip}>Native</div>
          <Div title={I18N.common.tooltip}>Custom</Div>
        </>
      );
    `;
    const output = transform(code);

    // 小写 div 应该被包裹
    const divMatch = output.match(/<div[^>]*>/);
    expect(divMatch?.[0]).toContain('String(I18N.common.tooltip)');

    // 大写 Div (自定义组件) 不应该被包裹
    const customDivMatch = output.match(/<Div[^>]*>/);
    expect(customDivMatch?.[0]).not.toContain('String(');
  });
});

describe('Babel 插件 - data-i18n-key 属性添加', () => {
  it('应该为原生标签添加 data-i18n-key', () => {
    const code = `
      const Component = () => (
        <input placeholder={I18N.form.placeholder} />
      );
    `;
    const output = transform(code);

    expect(output).toContain('data-i18n-key="form.placeholder"');
  });

  it('应该为自定义组件添加 data-i18n-key', () => {
    const code = `
      const Component = () => (
        <Card title={I18N.examples.title} />
      );
    `;
    const output = transform(code);

    expect(output).toContain('data-i18n-key="examples.title"');
  });

  it('应该为 JSX 子元素的父元素添加 data-i18n-key', () => {
    const code = `
      const Component = () => (
        <div>{I18N.common.title}</div>
      );
    `;
    const output = transform(code);

    expect(output).toContain('data-i18n-key="common.title"');
  });

  it('应该为 template 调用添加 data-i18n-key', () => {
    const code = `
      const Component = () => (
        <div>{I18N.template(I18N.form.required, { field: 'name' })}</div>
      );
    `;
    const output = transform(code);

    expect(output).toContain('data-i18n-key="form.required"');
  });
});

describe('Babel 插件 - Template 方法调用', () => {
  it('应该正确处理 JSX 子元素中的 I18N.template?.()', () => {
    const code = `
      const Component = ({ username }) => (
        <p className="result">
          {I18N.template?.(I18N.examples.template.helloUser, { username })}
        </p>
      );
    `;
    const output = transform(code);

    // template 调用应该被添加 String()
    expect(output).toContain('String(I18N.template?.(');
    // 但第一个参数（I18N.examples.template.helloUser）不应该被添加 String()
    expect(output).not.toContain('String(I18N.examples.template.helloUser)');
    // 应该提取 template 的 key
    expect(output).toContain('data-i18n-key="examples.template.helloUser"');
  });

  it('应该正确处理 JSX 子元素中的 I18N.template()', () => {
    const code = `
      const Component = ({ username }) => (
        <p>
          {I18N.template(I18N.examples.template.userInfo, { name: username, age: 25 })}
        </p>
      );
    `;
    const output = transform(code);

    expect(output).toContain('String(I18N.template(');
    expect(output).not.toContain('String(I18N.examples.template.userInfo)');
    expect(output).toContain('data-i18n-key="examples.template.userInfo"');
  });

  it('应该正确处理变量中的 template 调用', () => {
    const code = `
      const Component = () => {
        const greeting = I18N.template(I18N.greetings.hello, { name: 'Alice' });
        return <div>{greeting}</div>;
      };
    `;
    const output = transform(code);

    // 变量声明中的 template 调用不需要 String()
    expect(output).not.toContain('String(I18N.template(');
    // 变量引用在 JSX 中也不需要 String()，保持为 React 元素
    expect(output).toMatch(/{\s*greeting\s*}/);
  });

  it('应该正确处理 template 调用的嵌套参数', () => {
    const code = `
      const Component = () => (
        <div>
          {I18N.template?.(I18N.examples.template.multipleVars, {
            count: 5,
            sender: 'Bob'
          })}
        </div>
      );
    `;
    const output = transform(code);

    expect(output).toContain('String(I18N.template?.(');
    expect(output).not.toContain('String(I18N.examples.template.multipleVars)');
    expect(output).toContain('data-i18n-key="examples.template.multipleVars"');
  });

  it('应该正确区分 template 方法和 template 对象属性', () => {
    const code = `
      const Component = () => {
        // I18N.examples.template 是一个对象（不是方法）
        const text1 = I18N.examples.template.helloUser;

        // I18N.template 是一个方法
        const text2 = I18N.template(text1, { username: 'Alice' });

        return (
          <div>
            <p>{text1}</p>
            <p>{text2}</p>
          </div>
        );
      };
    `;
    const output = transform(code);

    // text1 是变量引用，不应该被包裹 String()
    expect(output).toMatch(/const text1 = I18N\.examples\.template\.helloUser/);
    expect(output).not.toContain('String(I18N.examples.template.helloUser)');

    // text2 是变量引用，不应该被包裹 String()
    expect(output).toMatch(/const text2 = I18N\.template\(/);

    // JSX 中的变量引用都不应该被包裹 String()
    expect(output).toContain('{text1}');
    expect(output).toContain('{text2}');
  });
});
