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
