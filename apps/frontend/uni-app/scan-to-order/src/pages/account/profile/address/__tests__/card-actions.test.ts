import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import i18n from '@/locale'

const actions = vi.hoisted(() => ({ editAddress: vi.fn(), selectTap: vi.fn(), chooseAddress: vi.fn(), deleteAddress: vi.fn(), addAddress: vi.fn(), goBack: vi.fn() }))
const selectionMode = ref(false)
vi.mock('../composables/use-page', () => ({ useAddressPage: () => ({
  ...actions,
  addressList: ref([{ id: 7, linkMan: '顾客', mobile: '+84912345678', countryCode: 'VN', regionText: '胡志明市', address: '一号街道', isDefault: false }]),
  loaded: ref(true),
  addressEdit: ref(false),
  failed: ref(false),
  loading: ref(false),
  editingLoading: ref(false),
  saving: ref(false),
  selectionMode,
  selectedId: ref(''),
  choosing: ref(false),
  addressData: ref({}),
}) }))
beforeEach(() => {
  vi.clearAllMocks()
  selectionMode.value = false
})
afterEach(() => vi.unstubAllGlobals())

it('点击卡片内容不编辑或设置默认，仅操作按钮触发业务动作', async () => {
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { plugins: [i18n], stubs: { 'wd-navbar': true, 'wd-icon': true } } })
  try {
    await wrapper.find('.left-text').trigger('tap')
    await wrapper.find('.contact-name').trigger('tap')
    await wrapper.find('.address-detail').trigger('tap')
    expect(actions.editAddress).not.toHaveBeenCalled()
    expect(actions.selectTap).not.toHaveBeenCalled()
    await wrapper.find('.set-default').trigger('tap')
    expect(actions.selectTap).toHaveBeenCalledWith(7)
    expect(actions.editAddress).not.toHaveBeenCalled()
    await wrapper.find('.address-action').trigger('tap')
    expect(actions.editAddress).toHaveBeenCalledWith(7)
  }
  finally { wrapper.unmount() }
})

it('选择模式点击卡片使用地址，编辑、删除、设默认不冒泡误选', async () => {
  selectionMode.value = true
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', vi.fn())
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { plugins: [i18n], stubs: { 'wd-navbar': true, 'wd-icon': true } } })
  try {
    await wrapper.find('.left-text').trigger('tap')
    expect(actions.chooseAddress).toHaveBeenCalledWith(7)
    expect(actions.selectTap).not.toHaveBeenCalled()
    actions.chooseAddress.mockClear()
    await wrapper.find('.set-default').trigger('tap')
    await wrapper.find('[aria-label="编辑地址"]').trigger('tap')
    await wrapper.find('[aria-label="删除地址"]').trigger('tap')
    expect(actions.chooseAddress).not.toHaveBeenCalled()
    expect(actions.selectTap).toHaveBeenCalledWith(7)
    expect(actions.editAddress).toHaveBeenCalledWith(7)
    expect(actions.deleteAddress).toHaveBeenCalledWith(7)
  }
  finally {
    wrapper.unmount()
  }
})
