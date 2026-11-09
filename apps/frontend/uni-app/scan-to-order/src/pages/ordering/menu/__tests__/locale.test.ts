import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useOrderingLocale } from '../composables/use-locale'
/** 校验旧页面文案已经在 ordering 内适配，保持公共资源与语言状态不变。 */
import fs from 'node:fs'
import path from 'node:path'
import fallback from '../locale/zh-Hans.json'
import globalZh from '@/locale/zh-Hans.json'

const globalTranslation = vi.hoisted(() => ({ t: vi.fn((key: string) => `global:${key}`), te: vi.fn((key: string) => key === 'common.loading') }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ ...globalTranslation, locale: ref('en') }) }))
it('已有公共文案仍交给现有翻译器，旧页面文案使用本模块回退', () => {
  const locale = useOrderingLocale()
  expect(locale.t('common.loading')).toBe('global:common.loading')
  expect(locale.t('cart.title')).toBe('购物车')
  expect(locale.t('pay.title')).toBe('确认订单')
  expect(locale.locale.value).toBe('en')
  expect(globalTranslation.t).not.toHaveBeenCalledWith('cart.title', {})
})
function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)])
}
function read(source: unknown, key: string) {
  return key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined, source)
}
it('所有 ordering 静态页面文案都有正式全局资源或模块回退，不显示技术键名', () => {
  const missing = new Set<string>()
  for (const file of files(path.resolve('src/pages/ordering')).filter(file => /\.(?:vue|ts)$/.test(file) && !file.includes('__tests__'))) {
    const text = fs.readFileSync(file, 'utf8')
    for (const match of text.matchAll(/\bt\('([^']+)'/g)) {
      if (typeof read(globalZh, match[1]) !== 'string' && typeof read(fallback, match[1]) !== 'string')
        missing.add(match[1])
    }
  }
  expect([...missing]).toEqual([])
})
