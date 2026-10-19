import { beforeEach, describe, expect, it, vi } from 'vitest'

// 插值示例只用于测试，不要求业务语言包保留演示文案。
vi.mock('../en.json', async (importOriginal) => {
  const original = await importOriginal<{ default: Record<string, unknown> }>()
  return { default: { ...original.default, i18n: {
    weight: '{heavy}KG',
    introduction: 'I am {name},height:{detail.height},weight:{detail.weight}',
  } } }
})

beforeEach(() => {
  vi.resetModules()
  Object.assign(uni, {
    getLocale: vi.fn(() => 'zh-Hans'),
    setLocale: vi.fn(),
    setTabBarItem: vi.fn(),
  })
  vi.mocked(uni.getStorageSync).mockReturnValue('')
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/home/index/index', $page: { fullPath: '/pages/home/index/index' } }] as ReturnType<typeof getCurrentPages>)
})

describe('language switching and native tabbar', () => {
  it('resolves shared locale keys through both translators and preserves interpolation', async () => {
    const { i18n, t, setLocale } = await import('../index')
    setLocale('en')
    expect(i18n.global.t('tabbar.home')).toBe('Home')
    expect(t('common.cancel')).toBe('Cancel')
    expect(t('i18n.weight', { heavy: 60 })).toBe('60KG')
    expect(t('i18n.introduction', { name: 'A', detail: { height: 170, weight: 60 } }))
      .toBe('I am A,height:170,weight:60')
    setLocale('vi')
    expect(t('tabbar.about')).toBe('关于')
  })

  it.each([
    ['zh-Hans', ['首页', '点餐', '服务', '取号', '取餐', '我的']],
    ['en', ['Home', 'Order', 'Services', 'Queue', 'Pickup', 'Me']],
    ['vi', ['Trang chủ', 'Đặt món', 'Dịch vụ', 'Lấy số', 'Nhận món', 'Tôi']],
  ])('updates all native labels for %s and saves the choice', async (code, labels) => {
    const { setLocale, currentLocale } = await import('../index')
    const { setTabbarItem, getI18nText } = await import('../../tabbar/i18n')
    setLocale(code)
    setTabbarItem()
    expect(currentLocale.value).toBe(code)
    expect(uni.setStorageSync).toHaveBeenCalledWith('Language', code)
    labels.forEach((text, index) => expect(uni.setTabBarItem).toHaveBeenCalledWith({ index, text }))
    expect(getI18nText('中文原文')).toBe('中文原文')
  })

  it('restores a saved language on fresh module initialization', async () => {
    vi.mocked(uni.getStorageSync).mockReturnValue('vi')
    const { currentLocale, t } = await import('../index')
    expect(currentLocale.value).toBe('vi')
    expect(t('tabbar.home')).toBe('Trang chủ')
    expect(t('tabbar.about')).toBe('关于')
  })

  it('normalizes legacy and unsupported saved values', async () => {
    const { normalizeLocale } = await import('../index')
    expect(normalizeLocale('zh_CN')).toBe('zh-Hans')
    expect(normalizeLocale('unknown')).toBe('zh-Hans')
    expect(normalizeLocale('en-US')).toBe('en')
    expect(normalizeLocale('vi_VN')).toBe('vi')
  })

  it('preserves placeholders when interpolation data is missing', async () => {
    const { t, setLocale, getTemplateByKey } = await import('../index')
    setLocale('en')
    expect(uni.setLocale).toHaveBeenCalledWith('en')
    expect(t('i18n.weight')).toBe('{heavy}KG')
    expect(t('i18n.introduction', { name: 'A' }))
      .toBe('I am A,height:{detail.height},weight:{detail.weight}')
    expect(getTemplateByKey('')).toBe('')
    expect(t('missing.key')).toBe('missing.key')
  })

  it('does not update native tabs before a page exists or on a non-tab page', async () => {
    const { setTabbarItem } = await import('../../tabbar/i18n')
    vi.mocked(getCurrentPages).mockReturnValue([])
    setTabbarItem()
    vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/auth/login', $page: { fullPath: '/pages/auth/login' } }] as ReturnType<typeof getCurrentPages>)
    setTabbarItem()
    expect(uni.setTabBarItem).not.toHaveBeenCalled()
  })

  it('keeps picker visibility local while sharing the language', async () => {
    const { useLanguage } = await import('../../components/locale/composables/useLanguage')
    const first = useLanguage()
    const second = useLanguage()
    first.openLanguagePicker()
    expect(first.showLangSheet.value).toBe(true)
    expect(second.showLangSheet.value).toBe(false)
    first.selectLang('vi')
    expect(first.showLangSheet.value).toBe(false)
    expect(second.selectedLanguage.value.code).toBe('vi')
    first.selectLang('invalid')
    expect(second.selectedLanguage.value.code).toBe('vi')
  })
})
