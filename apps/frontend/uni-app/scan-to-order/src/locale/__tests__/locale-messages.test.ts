import path from 'node:path'
import { expect, it } from 'vitest'
import { initLocales } from '@dcloudio/uni-cli-shared'

it('loads module objects directly from the shared locale files', () => {
  const directory = path.resolve(process.cwd(), 'src/locale')
  const locales = initLocales(directory)
  expect(locales.en.tabbar.home).toBe('Home')
  expect(locales.vi.tabbar.home).toBe('Trang chủ')
  expect(locales['zh-Hans'].tabbar.home).toBe('首页')
})

// 每种语言必须具有相同的叶子键和占位变量，避免新增文案只补一种语言。
it('keeps the three languages aligned by leaf keys and interpolation names', async () => {
  const bundles = await Promise.all([import('../zh-Hans.json'), import('../en.json'), import('../vi.json')])
  function leaves(value: unknown, prefix = ''): Record<string, string> {
    if (typeof value === 'string')
      return { [prefix]: value }
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      Object.entries(leaves(child, prefix ? `${prefix}.${key}` : key)),
    ))
  }
  const [base, ...others] = bundles.map(bundle => leaves(bundle.default))
  const parameters = (text: string) => [...text.matchAll(/\{([^}]+)\}/g)].map(match => match[1]).sort()
  for (const other of others) {
    expect(Object.keys(other).sort()).toEqual(Object.keys(base).sort())
    for (const key of Object.keys(base))
      expect(parameters(other[key]), key).toEqual(parameters(base[key]))
  }
})
