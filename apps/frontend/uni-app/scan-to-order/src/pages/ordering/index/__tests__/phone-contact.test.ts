import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import PhoneDialog from '@/components/phone-contact/PhoneDialog.vue'
import ShopCard from '../components/ShopCard/index.vue'

vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@dcloudio/uni-app', () => ({ onHide: vi.fn(), onShow: vi.fn() }))

it('列表电话使用共用面板，点击不切换门店', async () => {
  const wrapper = mount(ShopCard, {
    props: { shop: { id: 1, name: '门店', linkPhone: '+84 123456789' }, nearest: false, selectText: '进入门店' },
    global: { stubs: { 'wd-icon': true, 'PhoneDialog': true } },
  })
  await wrapper.findAll('button')[0].trigger('tap')
  expect(wrapper.findComponent(PhoneDialog).props('modelValue')).toBe(true)
  expect(wrapper.emitted('select')).toBeUndefined()
  await wrapper.setProps({ shop: { id: 1, name: '门店', linkPhone: '  ' } })
  expect(wrapper.findAll('button')[0].attributes('disabled')).toBeDefined()
  expect(wrapper.findComponent(PhoneDialog).props('modelValue')).toBe(false)
  wrapper.unmount()
})
