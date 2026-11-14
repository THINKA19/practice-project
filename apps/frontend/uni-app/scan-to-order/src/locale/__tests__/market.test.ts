import { beforeEach, expect, it, vi } from 'vitest'

const storage = new Map<string, unknown>()

beforeEach(() => {
  vi.resetModules()
  storage.clear()
  Object.assign(uni, {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => storage.set(key, value),
    getLocale: () => 'zh-Hans',
    setLocale: vi.fn(),
  })
})

it('selects a local language for the home country and restores both choices', async () => {
  const { homeCountry, selectHomeCountry } = await import('../market')
  const { currentLocale, t } = await import('../index')

  selectHomeCountry('VN')
  expect(currentLocale.value).toBe('vi')
  expect(t('rider.task.grab')).toBe('Nhận đơn ngay')

  selectHomeCountry('TH')
  expect(homeCountry.value).toBe('TH')
  expect(currentLocale.value).toBe('th')
  expect(t('rider.task.grab')).toBe('รับงานทันที')

  vi.resetModules()
  expect((await import('../market')).homeCountry.value).toBe('TH')
  expect((await import('../index')).currentLocale.value).toBe('th')
})

it('keeps a manual language when the home country changes', async () => {
  const { selectHomeCountry } = await import('../market')
  const { currentLocale, setLocale } = await import('../index')

  selectHomeCountry('VN')
  setLocale('zh-Hans')
  selectHomeCountry('TH')

  expect(storage.get('HomeMarketCountry')).toBe('TH')
  expect(currentLocale.value).toBe('zh-Hans')
})

it.each([['LA', 'lo'], ['ID', 'id'], ['LK', 'si']])('recommends %s market language', async (country, locale) => {
  const { selectHomeCountry } = await import('../market')
  selectHomeCountry(country)
  expect(storage.get('Language')).toBe(locale)
  expect(storage.get('LanguageSource')).toBe('market')
})
