/**
 * 文件更新工具
 * 使用 AST 解析和更新 TypeScript 文件中的 i18n 内容
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

/**
 * 更新 i18n 文件中的指定属性值
 * @param {string} filePath - 文件路径
 * @param {string[]} propertyPath - 属性路径，例如 ["startCountdown"]
 * @param {string} newValue - 新的翻译值
 * @returns {Promise<boolean>} - 是否成功更新
 */
async function updateI18nFile(filePath, propertyPath, newValue) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf-8');

    // 解析为 AST
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    let updated = false;

    // 遍历 AST
    traverse(ast, {
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;

        // 确保是对象表达式
        if (t.isObjectExpression(declaration)) {
          // 查找并更新属性
          updated = updateProperty(declaration, propertyPath, newValue);
        }
      },
    });

    if (updated) {
      // 生成新的代码
      const output = generate(
        ast,
        {
          retainLines: false,
          comments: true,
          // 关键配置：保留 Unicode 字符（中文等），不转义为 \uXXXX
          jsescOption: {
            minimal: true,
          },
        },
        content
      );

      // 写回文件
      fs.writeFileSync(filePath, output.code, 'utf-8');
      console.log(`✅ Updated: ${filePath} -> ${propertyPath.join('.')} = "${newValue}"`);
      return true;
    } else {
      console.warn(`⚠️  Property not found: ${propertyPath.join('.')}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating file: ${filePath}`, error);
    throw error;
  }
}

/**
 * 递归更新对象属性
 * @param {Object} objectExpression - ObjectExpression AST 节点
 * @param {string[]} propertyPath - 属性路径
 * @param {string} newValue - 新值
 * @returns {boolean} - 是否找到并更新
 */
function updateProperty(objectExpression, propertyPath, newValue) {
  if (propertyPath.length === 0) {
    return false;
  }

  const [currentKey, ...restPath] = propertyPath;

  // 查找对应的属性
  for (const prop of objectExpression.properties) {
    if (t.isObjectProperty(prop) || t.isObjectMethod(prop)) {
      let keyName = null;

      // 获取属性名
      if (t.isIdentifier(prop.key)) {
        keyName = prop.key.name;
      } else if (t.isStringLiteral(prop.key)) {
        keyName = prop.key.value;
      }

      if (keyName === currentKey) {
        // 如果还有更深的路径，继续递归
        if (restPath.length > 0) {
          if (t.isObjectExpression(prop.value)) {
            return updateProperty(prop.value, restPath, newValue);
          }
        } else {
          // 找到目标属性，更新值
          prop.value = t.stringLiteral(newValue);
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * 批量更新多个语言的翻译
 * @param {Object} updates - 更新配置对象
 * @param {string} updates.key - I18N key
 * @param {Object} updates.values - 语言-值映射，例如 { "zh-CN": "中文", "en-US": "English" }
 * @returns {Promise<Object>} - 更新结果
 */
async function batchUpdateI18n(updates) {
  const { key, values } = updates;
  const parts = key.split('.');

  if (parts.length < 2) {
    throw new Error(`Invalid I18N key: ${key}`);
  }

  const category = parts[0];
  const propertyPath = parts.slice(1);

  const results = {};

  // 遍历每个语言进行更新
  for (const [locale, value] of Object.entries(values)) {
    const filePath = path.join(process.cwd(), 'src', 'lang', locale, `${category}.ts`);

    try {
      const success = await updateI18nFile(filePath, propertyPath, value);
      results[locale] = { success, filePath };
    } catch (error) {
      results[locale] = { success: false, error: error.message };
    }
  }

  return results;
}

/**
 * 读取指定 key 的翻译内容
 * @param {string} key - I18N key
 * @returns {Promise<Object>} - 语言-值映射
 */
async function readI18nValue(key) {
  const parts = key.split('.');

  if (parts.length < 2) {
    throw new Error(`Invalid I18N key: ${key}`);
  }

  const category = parts[0];
  const propertyPath = parts.slice(1);

  const values = {};
  const locales = ['zh-CN', 'en-US'];

  for (const locale of locales) {
    const filePath = path.join(process.cwd(), 'src', 'lang', locale, `${category}.ts`);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const value = extractValueFromContent(content, propertyPath);
      values[locale] = value;
    } catch (error) {
      console.error(`Error reading ${locale}:`, error);
      values[locale] = null;
    }
  }

  return values;
}

/**
 * 从文件内容中提取指定属性的值
 * @param {string} content - 文件内容
 * @param {string[]} propertyPath - 属性路径
 * @returns {string|null} - 属性值
 */
function extractValueFromContent(content, propertyPath) {
  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    let result = null;

    traverse(ast, {
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;
        if (t.isObjectExpression(declaration)) {
          result = findPropertyValue(declaration, propertyPath);
        }
      },
    });

    return result;
  } catch (error) {
    console.error('Error extracting value:', error);
    return null;
  }
}

/**
 * 查找对象中指定路径的属性值
 * @param {Object} objectExpression - ObjectExpression AST 节点
 * @param {string[]} propertyPath - 属性路径
 * @returns {string|null} - 属性值
 */
function findPropertyValue(objectExpression, propertyPath) {
  if (propertyPath.length === 0) {
    return null;
  }

  const [currentKey, ...restPath] = propertyPath;

  for (const prop of objectExpression.properties) {
    if (t.isObjectProperty(prop)) {
      let keyName = null;

      if (t.isIdentifier(prop.key)) {
        keyName = prop.key.name;
      } else if (t.isStringLiteral(prop.key)) {
        keyName = prop.key.value;
      }

      if (keyName === currentKey) {
        if (restPath.length > 0) {
          if (t.isObjectExpression(prop.value)) {
            return findPropertyValue(prop.value, restPath);
          }
        } else {
          if (t.isStringLiteral(prop.value)) {
            return prop.value.value;
          }
        }
      }
    }
  }

  return null;
}

module.exports = {
  updateI18nFile,
  batchUpdateI18n,
  readI18nValue,
};
