/**
 * 核心接口定义
 */

import type {
  Framework,
  DetectRule,
  FilePathConfig,
  TranslationValues,
  BatchUpdateResult,
} from './types';

/**
 * Transform 适配器配置
 */
export interface TransformAdapterConfig {
  /** 框架类型 */
  framework: Framework;
  /** i18n 对象或函数的名称 */
  i18nIdentifier?: string;
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * Transform 适配器接口
 * 负责在编译时进行代码转换（如注入 data-i18n-key）
 */
export interface ITransformAdapter {
  /** 适配器名称 */
  name: string;

  /**
   * 创建 Babel 插件
   * @param config 配置项
   * @returns Babel 插件函数
   */
  createBabelPlugin(config?: TransformAdapterConfig): any;

  /**
   * 检测项目是否使用了该 i18n 方案
   * @param rules 检测规则
   * @returns 是否匹配
   */
  detect?(rules: DetectRule[]): boolean;
}

/**
 * Runtime 适配器配置
 */
export interface RuntimeAdapterConfig {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** i18n 实例 */
  i18nInstance?: any;
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * Runtime 适配器接口
 * 负责运行时的 i18n 对象包装和增强
 */
export interface IRuntimeAdapter {
  /** 适配器名称 */
  name: string;

  /**
   * 创建包装后的 i18n 对象（如 Proxy）
   * @param i18nObject 原始 i18n 对象
   * @param config 配置项
   * @returns 包装后的对象
   */
  wrap<T extends object>(i18nObject: T, config?: RuntimeAdapterConfig): T;

  /**
   * 获取指定 key 的翻译值
   * @param i18nObject i18n 对象
   * @param key i18n key
   * @returns 翻译值
   */
  getValue(i18nObject: any, key: string): string | null;

  /**
   * 更新指定 key 的翻译值
   * @param key i18n key
   * @param values 各语言的翻译值
   * @returns 更新结果
   */
  updateValue?(key: string, values: TranslationValues): Promise<BatchUpdateResult>;
}

/**
 * 文件适配器接口
 * 负责读写翻译文件
 */
export interface IFileAdapter {
  /** 适配器名称 */
  name: string;

  /**
   * 读取翻译文件
   * @param filePath 文件路径
   * @returns 翻译对象
   */
  read(filePath: string): Promise<any>;

  /**
   * 写入翻译文件
   * @param filePath 文件路径
   * @param content 翻译对象
   */
  write(filePath: string, content: any): Promise<void>;

  /**
   * 更新指定路径的翻译值
   * @param filePath 文件路径
   * @param propertyPath 属性路径（如 ['components', 'title']）
   * @param newValue 新值
   * @returns 是否成功
   */
  update(filePath: string, propertyPath: string[], newValue: string): Promise<boolean>;

  /**
   * 从文件中提取指定路径的值
   * @param filePath 文件路径
   * @param propertyPath 属性路径
   * @returns 翻译值
   */
  extractValue(filePath: string, propertyPath: string[]): Promise<string | null>;
}

/**
 * 适配器配置
 */
export interface AdapterConfig {
  /** 框架类型 */
  framework: Framework;
  /** 翻译文件路径或配置 */
  files?: string[] | FilePathConfig;
  /** 支持的语言列表 */
  locales?: string[];
  /** 检测规则 */
  detectRules?: DetectRule[];
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 自定义选项 */
  [key: string]: any;
}
