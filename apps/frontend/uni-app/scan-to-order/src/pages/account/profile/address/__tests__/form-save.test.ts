import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, it, vi } from 'vitest'
import AddressEditForm from '../components/AddressEditForm/index.vue'
import { useAddressPage } from '../composables/use-page'
import { addressApi } from '../composables/use-requests'

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => ({ hasLogin: true, identity: 'customer' }),
  requireIdentity: () => true,
  useSessionAccountScope: () => ({ ticket: () => 1, current: () => true }),
}))
vi.mock('../composables/use-requests', () => ({ addressApi: { add: vi.fn(), list: vi.fn(() => Promise.resolve([])) } }))
vi.mock('@/utils/project/interaction', () => ({ withLoading: (action: () => Promise<unknown>) => action(), toast: vi.fn(), showError: vi.fn() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Home: { home: '/pages/home/index/index' } } }))

it('实际选择国家和城市、填写字段后提交，与页面状态保持一致', async () => {
  const Host = defineComponent({
    components: { AddressEditForm },
    setup() {
      const page = useAddressPage()
      page.addAddress()
      return { ...page }
    },
    template: '<AddressEditForm :draft="addressData" @input="setField" @save="bindSave" />',
  })
  const wrapper = mount(Host, { global: { stubs: {
    'wd-popup': { props: ['modelValue'], template: '<div v-if="modelValue" class="sheet"><slot /></div>' },
    'wd-icon': true,
  } } })
  try {
    const fields = wrapper.findAll('input')
    await fields[0].trigger('input', { detail: { value: '测试顾客' } })
    await fields[1].trigger('input', { detail: { value: '0912345678' } })
    await wrapper.findAll('.country-picker')[1].trigger('tap')
    await wrapper.findAll('.sheet-option')[0].trigger('tap')
    await wrapper.findAll('.country-picker')[2].trigger('tap')
    await wrapper.findAll('.sheet-option')[1].trigger('tap')
    await wrapper.find('textarea').trigger('input', { detail: { value: '测试街道1号' } })
    await wrapper.find('.save-btn').trigger('tap')
    await flushPromises()
    expect(addressApi.add).toHaveBeenCalledWith(expect.objectContaining({
      linkMan: '测试顾客',
      mobile: '+84912345678',
      countryCode: 'VN',
      regionText: '胡志明市',
      address: '测试街道1号',
      isDefault: true,
    }))
  }
  finally { wrapper.unmount() }
})
