import { t } from './index'
import zhHans from './zh-Hans.json'

const keys = new Map(Object.entries(zhHans.shop.messages).map(([key, value]) => [value, `shop.messages.${key}`]))

/**
 * 通过中文原文匹配既有商家展示文案。未知文本原样返回。
 * @param value 页面或接口提供的展示值。
 * @returns 当前语言的文案，空值返回空字符串。
 * @example shopText('商品管理')
 */
export function shopText(value: unknown): string {
  const text = value == null ? '' : String(value)
  const key = keys.get(text)
  return key ? t(key) : text
}
