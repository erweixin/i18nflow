/**
 * @i18nflow/core
 * 核心接口和类型定义
 */

// 导出类型
export type {
  Framework,
  I18nSolution,
  DetectRuleType,
  DetectRule,
  LocaleMap,
  TranslationValues,
  FilePathConfig,
  UpdateResult,
  BatchUpdateResult,
} from './types';

// 导出接口
export type {
  TransformAdapterConfig,
  ITransformAdapter,
  RuntimeAdapterConfig,
  IRuntimeAdapter,
  IFileAdapter,
  AdapterConfig,
} from './interfaces';
