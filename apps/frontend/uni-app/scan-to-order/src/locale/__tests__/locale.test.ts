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
  vi.mocked(uni.setStorageSync).mockReset()
  vi.mocked(uni.getStorageSync).mockReset().mockReturnValue('')
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/home/index/index', $page: { fullPath: '/pages/home/index/index' } }] as ReturnType<typeof getCurrentPages>)
})

describe('language switching and native tabbar', () => {
  it('resolves shared locale keys through both translators and preserves interpolation', async () => {
    const { default: i18n, t, setLocale } = await import('../index')
    setLocale('en')
    expect(i18n.global.t('tabbar.home')).toBe('Home')
    expect(t('common.cancel')).toBe('Cancel')
    expect(t('i18n.weight', { heavy: 60 })).toBe('60KG')
    expect(t('i18n.introduction', { name: 'A', detail: { height: 170, weight: 60 } }))
      .toBe('I am A,height:170,weight:60')
    setLocale('vi')
    expect(t('home.user.guest')).toBe('Khách')
  })

  it.each([
    ['zh-Hans', ['首页', '点餐', '服务', '取号', '取餐', '我的']],
    ['en', ['Home', 'Order', 'Service', 'Queue', 'Pickup', 'Me']],
    ['vi', ['Trang chủ', 'Đặt món', 'Dịch vụ', 'Lấy số', 'Nhận món', 'Cá nhân']],
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
    expect(t('home.user.guest')).toBe('Khách')
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

// 验证真正的输入边界和切换失败收尾，避免文档能力与实现漂移。
describe('locale boundaries', () => {
  it.each([['en-US', 'en'], ['vi_VN', 'vi'], ['zh_CN', 'zh-Hans'], ['unknown', 'zh-Hans'], [{}, 'zh-Hans']])('normalizes saved %s at startup', async (saved, expected) => {
    vi.mocked(uni.getStorageSync).mockReturnValue(saved)
    const { currentLocale } = await import('../index')
    expect(currentLocale.value).toBe(expected)
  })

  it('uses the system language if storage cannot be read', async () => {
    vi.mocked(uni.getStorageSync).mockImplementation(() => {
      throw new Error('unavailable')
    })
    vi.mocked(uni.getLocale).mockReturnValue('en-US')
    const { currentLocale } = await import('../index')
    expect(currentLocale.value).toBe('en')
  })

  it('closes the picker and keeps the session language when platform and storage fail', async () => {
    const { useLanguage } = await import('../../components/locale/composables/useLanguage')
    const picker = useLanguage()
    vi.mocked(uni.setLocale).mockImplementation(() => {
      throw new Error('platform')
    })
    vi.mocked(uni.setStorageSync).mockImplementation(() => {
      throw new Error('storage')
    })
    picker.openLanguagePicker()
    expect(() => picker.selectLang('en')).not.toThrow()
    expect(picker.showLangSheet.value).toBe(false)
    expect(picker.selectedLanguage.value.code).toBe('en')
    expect(picker.langOptions.value.filter(item => item.active).map(item => item.code)).toEqual(['en'])
    expect(uni.setStorageSync).toHaveBeenCalledWith('Language', 'en')
  })

  it('returns strings safely for object, array and inherited keys', async () => {
    const { t } = await import('../index')
    expect(t('home')).toBe('home')
    expect(t('coupons.tabs')).toBe('coupons.tabs')
    expect(t('toString')).toBe('toString')
    expect(t('demo.weight', { heavy: 0 })).toBe('0公斤')
  })
})
