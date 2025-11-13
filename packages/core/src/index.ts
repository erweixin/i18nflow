/**
 * @i18nflow/core
 * i18nflow 核心抽象层
 */

export const version = '0.0.1';

// TODO: 实现核心接口和抽象类
export interface ITransformAdapter {
  name: string;
  isI18nExpression(node: any): boolean;
  extractI18nKey(node: any): string | null;
  transformExpression(node: any, key: string): any;
  getConfig(): AdapterConfig;
}

export interface IRuntimeAdapter {
  name: string;
  enableProxyWrapper?: boolean;
  wrapI18nObject?: (target: any) => any;
  readTranslation(key: string, locale: string): Promise<string>;
  updateTranslation(key: string, locale: string, value: string): Promise<boolean>;
  getSupportedLocales(): string[];
  getCurrentLocale(): string;
}

export interface IFileAdapter {
  name: string;
  read(filePath: string, key: string): Promise<Record<string, string>>;
  update(filePath: string, key: string, values: Record<string, string>): Promise<boolean>;
  getSupportedExtensions(): string[];
}

export interface AdapterConfig {
  locales: string[];
  translationFiles: Record<string, string>;
  proxyStrategy?: {
    enabled: boolean;
    framework: 'react' | 'vue' | 'svelte';
    autoWrap?: {
      files: string[];
      patterns?: string[];
      detectRules?: DetectRule[];
    };
  };
}

export interface DetectRule {
  type: 'call' | 'variable' | 'import';
  name?: string;
  patterns?: (string | RegExp)[];
  from?: string[];
}

console.log(`@i18nflow/core v${version} loaded`);

