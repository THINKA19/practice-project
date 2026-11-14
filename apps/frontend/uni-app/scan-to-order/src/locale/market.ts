import { ref } from 'vue'
import type { SupportedLocale } from './index'
import { getTemplateByKey, setLocale } from './index'

const storageKey = 'HomeMarketCountry'
const recommendedLocales: Partial<Record<string, SupportedLocale>> = {
  VN: 'vi',
  TH: 'th',
  LA: 'lo',
  ID: 'id',
  LK: 'si',
  CN: 'zh-Hans',
  AU: 'en-AU',
  JP: 'ja',
  KR: 'ko',
  MM: 'my',
  PH: 'fil',
}

function restoreCountry(): string {
  try {
    const value: unknown = uni.getStorageSync(storageKey)
    return typeof value === 'string' && /^[A-Z]{2}$/.test(value) ? value : ''
  }
  catch {
    return ''
  }
}

export const homeCountry = ref(restoreCountry())

export function selectHomeCountry(code: string) {
  if (!/^[A-Z]{2}$/.test(code))
    return
  homeCountry.value = code
  try {
    uni.setStorageSync(storageKey, code)
    const source = uni.getStorageSync('LanguageSource')
    if (source === 'market' || (!source && !uni.getStorageSync('Language')))
      setLocale(recommendedLocales[code] ?? 'en', 'market')
  }
  catch (error) {
    console.warn('[market] Could not save country preference', error)
  }
}

export function marketCountryName(code: string, fallback = code) {
  const key = `market.${code}`
  const label = getTemplateByKey(key)
  return label === key ? fallback : label
}
