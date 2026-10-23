/**
 * 应用国际化入口：三语资源、语言恢复/切换和普通 TS 文案插值。
 * 导出 currentLocale、normalizeLocale、setLocale、getTemplateByKey、t；默认导出 Vue 插件。
 * @example setLocale('en'); t('home.user.guest') // Guest
 */
import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './en.json'
import zhHans from './zh-Hans.json'
import vi from './vi.json'

const messages = { en, 'zh-Hans': zhHans, vi }
export type SupportedLocale = keyof typeof messages

/**
 * 规范化缓存或系统语言；不支持的值使用简体中文。
 * @param value 不可信的缓存/系统语言值。
 * @returns 项目支持的语言代码。
 * @example normalizeLocale('vi_VN') // vi
 */
export function normalizeLocale(value: unknown): SupportedLocale {
  const code = typeof value === 'string' ? value.trim().replace(/_/g, '-').toLowerCase() : ''
  if (code === 'en' || code.startsWith('en-'))
    return 'en'
  if (code === 'vi' || code.startsWith('vi-'))
    return 'vi'
  return 'zh-Hans'
}

/**
 * 启动读取语言，缓存读取失败时使用系统语言。
 * @returns 规范化语言；系统读取失败时使用中文。
 * @example readInitialLocale() // zh-Hans
 */
function readInitialLocale(): SupportedLocale {
  try {
    const saved: unknown = uni.getStorageSync('Language')
    if (saved)
      return normalizeLocale(saved)
  }
  catch (error) {
    console.warn('[i18n] 读取语言缓存失败', error)
  }
  try {
    return normalizeLocale(uni.getLocale())
  }
  catch {
    return 'zh-Hans'
  }
}

const i18n = createI18n({
  locale: readInitialLocale(),
  fallbackLocale: 'zh-Hans',
  messages,
  allowComposition: true,
})

export const currentLocale = computed(() => i18n.global.locale)

/**
 * 切换当前会话语言；平台同步或缓存写入失败不会阻断界面切换。
 * @param locale 支持的精确语言代码；非法值忽略。
 * @returns {void} 无返回值。
 * @example setLocale('vi') // 更新已绑定的三语文案
 */
export function setLocale(locale: string): void {
  if (!Object.prototype.hasOwnProperty.call(messages, locale))
    return
  i18n.global.locale = locale as SupportedLocale
  try {
    uni.setLocale(locale)
  }
  catch (error) {
    console.warn('[i18n] 同步平台语言失败', error)
  }
  try {
    uni.setStorageSync('Language', locale)
  }
  catch (error) {
    console.warn('[i18n] 保存语言失败，本次会话仍生效', error)
  }
}

/**
 * 读取对象自有路径，兼容顶层完整键和嵌套键。
 * @param source 语言资源或插值数据。
 * @param key 点分路径。
 * @returns 对应值，缺失为 undefined。
 * @example readPath({ user: { name: 'A' } }, 'user.name') // A
 */
function readPath(source: unknown, key: string): unknown {
  if (source && typeof source === 'object' && Object.prototype.hasOwnProperty.call(source, key))
    return (source as Record<string, unknown>)[key]
  return key.split('.').reduce<unknown>((value, part) => {
    if (!value || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, part))
      return undefined
    return (value as Record<string, unknown>)[part]
  }, source)
}

/**
 * 获取字符串模板；缺失时回退中文，对象/数组或未知键返回键名。
 * @param key 语言资源键。
 * @returns 可安全插值的字符串，空键返回空字符串。
 * @example getTemplateByKey('home.user.guest') // 游客
 */
export function getTemplateByKey(key: string): string {
  if (!key)
    return ''
  const value = readPath(messages[normalizeLocale(currentLocale.value)], key)
  if (typeof value === 'string')
    return value
  const fallback = readPath(zhHans, key)
  return typeof fallback === 'string' ? fallback : key
}

/**
 * 替换命名及嵌套变量；缺失或非标量变量保留占位符。
 * @param template 原始语言模板。
 * @param data 插值数据。
 * @returns 格式化字符串。
 * @example formatI18n('{detail.height}cm', { detail: { height: 170 } }) // 170cm
 */
function formatI18n(template: string, data?: Record<string, unknown>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key: string) => {
    const value = readPath(data, key.trim())
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : match
  })
}

/**
 * 普通 TS 翻译入口；派生界面文案应在 computed 中调用，提示文案在事件触发时调用。
 * @param key 字符串模板键，不接受对象/数组作为翻译结果。
 * @param data 可选的命名或嵌套插值数据；不提供复数、链接消息等语法。
 * @returns 翻译及插值后的字符串。
 * @example t('welfare.total', { count: 2 }) // 共 2 张券（按当前语言模板）
 */
export function t(key: string, data?: Record<string, unknown>): string {
  return formatI18n(getTemplateByKey(key), data)
}
export default i18n
