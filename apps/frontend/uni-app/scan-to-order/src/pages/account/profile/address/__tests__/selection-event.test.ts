import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { useAddressView } from '../composables/use-view'

const m = vi.hoisted(() => ({ setDefault: vi.fn() }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => ({ hasLogin: true, identity: 'customer' }),
  requireIdentity: () => true,
  useSessionAccountScope: () => ({ ticket: () => 1, current: () => true }),
}))
vi.mock('../composables/use-requests', () => ({ addressApi: {
  list: async () => [{ id: 7, linkMan: '顾客', mobile: '+84912345678', address: '本次地址' }],
  setDefault: m.setDefault,
} }))
vi.mock('@/utils/project/interaction', () => ({ setTitle: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())

it('选择地址通过当前页面事件通道返回 ID，并返回结算页', async () => {
  vi.stubGlobal('onLoad', (callback: (query: { select: string }) => void) => callback({ select: '1' }))
  vi.stubGlobal('onShow', (callback: () => void) => callback())
  vi.stubGlobal('getCurrentPages', () => [{}, {}])
  const emit = vi.fn()
  const Host = defineComponent({ setup: useAddressView, template: '<button @click="vm.chooseAddress(7)">使用地址</button>' })
  const wrapper = mount(Host, { global: { mixins: [{ methods: { getOpenerEventChannel: () => ({ emit }) } }] } })
  try {
    await flushPromises()
    await wrapper.find('button').trigger('click')
    expect(emit).toHaveBeenCalledWith('addressSelected', { id: 7 })
    expect(uni.navigateBack).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
    expect(m.setDefault).not.toHaveBeenCalled()
    await wrapper.find('button').trigger('click')
    expect(emit).toHaveBeenCalledTimes(1)
  }
  finally {
    wrapper.unmount()
  }
})
