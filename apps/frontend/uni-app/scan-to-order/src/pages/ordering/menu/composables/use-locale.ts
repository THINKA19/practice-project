/**
 * ============================================================================
 * 【文件概述】ordering 页面文案适配；优先复用全局现有资源，旧页面专属键在模块内回退中文。
 * 【方法与导出清单】useOrderingLocale：当前语言状态与页面文案函数。
 * 【综合使用示例】import { useOrderingLocale } from './use-locale'; useOrderingLocale().t('cart.title') // 购物车
 * ============================================================================
 */
import { useI18n } from 'vue-i18n'

import messages from '../locale/zh-Hans.json'

/** 获取页面翻译，不修改全局语言资源或配置。无参数。@returns 与现有 i18n 共享的语言状态及模块回退翻译。@example useOrderingLocale().t('pay.title') // 确认订单 */
export function useOrderingLocale() {
  const composer = useI18n({ useScope: 'global' })
  function translate(key: string, params: Record<string, unknown> = {}): string {
    if (composer.te(key) || composer.te(key, 'zh-Hans'))
      return composer.t(key, params)
    const value = key.split('.').reduce<unknown>((current, part) => current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined, messages)
    if (typeof value !== 'string')
      return key
    return value.replace(/\{([^}]+)\}/g, (match, name: string) => typeof params[name] === 'string' || typeof params[name] === 'number' ? String(params[name]) : match)
  }
  return { ...composer, t: translate }
}
