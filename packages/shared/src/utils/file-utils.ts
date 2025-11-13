/**
 * 文件操作工具
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 异步读取文件
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf-8');
}

/**
 * 同步读取文件
 */
export function readFileSync(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 异步写入文件
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  // 确保目录存在
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(filePath, content, 'utf-8');
}

/**
 * 同步写入文件
 */
export function writeFileSync(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 同步检查文件是否存在
 */
export function fileExistsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 解析 i18n key，返回文件路径和属性路径
 * @param key I18N key，例如 "components.startCountdown"
 * @param locale 语言，例如 "zh-CN" 或 "en-US"
 * @param baseDir 基础目录
 * @returns { filePath, propertyPath, category }
 */
export function parseI18nKey(
  key: string,
  locale: string,
  baseDir: string = process.cwd()
): {
  filePath: string;
  propertyPath: string[];
  category: string;
} {
  const parts = key.split('.');

  if (parts.length < 2) {
    throw new Error(`Invalid I18N key: ${key}`);
  }

  // 第一部分是文件名（category）
  const category = parts[0];
  // 剩余部分是属性路径
  const propertyPath = parts.slice(1);

  // 构建文件路径
  const langDir = path.join(baseDir, 'src', 'lang', locale);
  const filePath = path.join(langDir, `${category}.ts`);

  return {
    filePath,
    propertyPath,
    category,
  };
}

/**
 * 获取所有支持的语言列表（默认实现）
 */
export function getDefaultLocales(): string[] {
  return ['zh-CN', 'en-US'];
}
