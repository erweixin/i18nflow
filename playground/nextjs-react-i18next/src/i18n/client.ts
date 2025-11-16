'use client';

import i18next, { i18n as I18nInstance } from 'i18next';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { useEffect, useMemo } from 'react';
import { wrapTFunction } from '@i18nflow/react-i18next';
import { getOptions, languages } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// 为每种语言创建并缓存 i18next 实例
const instances: Record<string, I18nInstance> = {};

function getI18nInstance(lng: string) {
  if (!instances[lng]) {
    const instance = i18next.createInstance();
    instance
      .use(initReactI18next)
      .use(
        resourcesToBackend(
          (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
        )
      )
      .init({
        ...getOptions(lng),
        lng,
        preload: runsOnServerSide ? languages : [],
      });
    instances[lng] = instance;
  }
  return instances[lng];
}

export function useTranslation(
  lng: string,
  ns: string = 'common',
  options: { keyPrefix?: string } = {}
) {
  const i18n = getI18nInstance(lng);
  const ret = useTranslationOrg(ns, { i18n, ...options });

  // 确保使用正确的语言（处理语言切换）
  const { i18n: i18nFromHook, t: originalT } = ret;
  useEffect(() => {
    if (i18nFromHook.resolvedLanguage === lng) return;
    i18nFromHook.changeLanguage(lng);
  }, [lng, i18nFromHook]);

  // 包装 t 函数，添加 i18nflow 调试功能
  // context 格式: 'namespace' 或 'namespace:keyPrefix'
  const context = useMemo(() => {
    return options.keyPrefix ? `${ns}:${options.keyPrefix}` : ns;
  }, [ns, options.keyPrefix]);

  const t = useMemo(() => {
    return wrapTFunction(originalT, context);
  }, [originalT, context]);

  return { ...ret, t };
}
