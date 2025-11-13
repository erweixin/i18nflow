/**
 * 核心类型定义
 */

/**
 * 支持的框架类型
 */
export type Framework = 'react' | 'vue';

/**
 * i18n 解决方案类型
 */
export type I18nSolution = 'kiwi' | 'react-intl' | 'react-i18next' | 'vue-i18n';

/**
 * 检测规则类型
 */
export type DetectRuleType = 'call' | 'import' | 'identifier';

/**
 * 检测规则配置
 */
export interface DetectRule {
  /** 规则类型 */
  type: DetectRuleType;
  /** 匹配名称 */
  name: string;
  /** 可选的模块路径（用于 import 类型） */
  module?: string;
}

/**
 * 语言映射
 */
export type LocaleMap = Record<string, string>;

/**
 * 翻译值映射
 */
export type TranslationValues = Record<string, string>;

/**
 * 文件路径配置
 */
export interface FilePathConfig {
  /** 语言目录 */
  localeDir: string;
  /** 文件名模式，例如: "{locale}/{category}.ts" */
  pattern: string;
}

/**
 * 更新结果
 */
export interface UpdateResult {
  /** 是否成功 */
  success: boolean;
  /** 文件路径 */
  filePath?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 批量更新结果
 */
export type BatchUpdateResult = Record<string, UpdateResult>;
