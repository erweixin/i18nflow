/**
 * Kiwi TypeScript 文件适配器
 * 用于读写 TypeScript 格式的翻译文件
 */

import type { IFileAdapter } from '@i18nflow/core';
import {
  parseCode,
  generateCode,
  traverse,
  t,
  findPropertyValue,
  updateProperty,
} from '@i18nflow/shared';
import { readFile, writeFile } from '@i18nflow/shared/server';

export class KiwiTypeScriptFileAdapter implements IFileAdapter {
  name = 'kiwi-typescript';

  /**
   * 读取翻译文件
   */
  async read(filePath: string): Promise<any> {
    const content = await readFile(filePath);
    const ast = parseCode(content);

    let result: any = null;

    traverse(ast, {
      ExportDefaultDeclaration: path => {
        const declaration = path.node.declaration;
        if (t.isObjectExpression(declaration)) {
          result = this.objectExpressionToPlainObject(declaration);
        }
      },
    });

    return result;
  }

  /**
   * 写入翻译文件
   */
  async write(filePath: string, content: any): Promise<void> {
    // 将对象转换为 AST
    const objectExpression = this.plainObjectToObjectExpression(content);
    const exportStatement = t.exportDefaultDeclaration(objectExpression);
    const program = t.program([exportStatement]);

    const { code } = generateCode(program);
    await writeFile(filePath, code);
  }

  /**
   * 更新指定路径的翻译值
   */
  async update(filePath: string, propertyPath: string[], newValue: string): Promise<boolean> {
    try {
      const content = await readFile(filePath);
      const ast = parseCode(content);

      let updated = false;

      traverse(ast, {
        ExportDefaultDeclaration(path) {
          const declaration = path.node.declaration;
          if (t.isObjectExpression(declaration)) {
            updated = updateProperty(declaration, propertyPath, newValue);
          }
        },
      });

      if (updated) {
        const { code } = generateCode(ast);
        await writeFile(filePath, code);
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
   * 从文件中提取指定路径的值
   */
  async extractValue(filePath: string, propertyPath: string[]): Promise<string | null> {
    try {
      const content = await readFile(filePath);
      const ast = parseCode(content);

      let result: string | null = null;

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
   * 将 ObjectExpression 转换为普通对象
   */
  objectExpressionToPlainObject(node: t.ObjectExpression): any {
    const result: any = {};

    for (const prop of node.properties) {
      if (t.isObjectProperty(prop)) {
        let key: string | null = null;

        if (t.isIdentifier(prop.key)) {
          key = prop.key.name;
        } else if (t.isStringLiteral(prop.key)) {
          key = prop.key.value;
        }

        if (key) {
          if (t.isStringLiteral(prop.value)) {
            result[key] = prop.value.value;
          } else if (t.isObjectExpression(prop.value)) {
            result[key] = this.objectExpressionToPlainObject(prop.value);
          }
        }
      }
    }

    return result;
  }

  /**
   * 将普通对象转换为 ObjectExpression
   */
  plainObjectToObjectExpression(obj: any): t.ObjectExpression {
    const properties: t.ObjectProperty[] = [];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        properties.push(t.objectProperty(t.identifier(key), t.stringLiteral(value)));
      } else if (typeof value === 'object' && value !== null) {
        properties.push(
          t.objectProperty(t.identifier(key), this.plainObjectToObjectExpression(value))
        );
      }
    }

    return t.objectExpression(properties);
  }
}
