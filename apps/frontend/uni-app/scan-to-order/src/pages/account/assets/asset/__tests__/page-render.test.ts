import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  session: { sessionRevision: 0, identity: 'customer', updateNowTime: vi.fn() },
  api: { amount: vi.fn(), rechargeRules: vi.fn(), recharge: vi.fn() },
}))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(mocks.session), requireIdentity: () => true }))
vi.mock('../../asset/composables/use-requests', () => ({ assetApi: mocks.api }))
vi.mock('../../asset/composables/use-context', () => ({ isAssetDemo: () => true }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Account: { rechargeLog: '/recharge-log', cashLog: '/cash-log' } } }))
afterEach(() => vi.unstubAllGlobals())

it('从记录页返回仍刷新余额，但不向充值区域前插入加载提示', async () => {
  const show: Array<() => void> = []
  vi.stubGlobal('definePage', vi.fn())
  vi.stubGlobal('onLoad', vi.fn())
  vi.stubGlobal('onShow', (fn: () => void) => show.push(fn))
  mocks.api.amount.mockResolvedValue({ balance: 128.5, freeze: 0, score: 260 })
  mocks.api.rechargeRules.mockResolvedValue([{ id: 1, confine: 100, send: 15 }])
  const Page = (await import('../index.vue')).default
  const wrapper = mount(Page, { global: { stubs: { 'wd-popup': true, 'wd-input': true, 'wd-button': true, 'wd-icon': true } } })
  try {
    show.forEach(fn => fn())
    await vi.waitFor(() => expect(wrapper.text()).toContain('128.50'))
    const section = wrapper.get('.section').element
    let complete!: (value: { balance: number, freeze: number, score: number }) => void
    mocks.api.amount.mockImplementationOnce(() => new Promise((resolve) => {
      complete = resolve
    }))
    show.forEach(fn => fn())
    await nextTick()
    expect(mocks.api.amount).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.wallet-status').exists()).toBe(false)
    expect(wrapper.get('.section').element).toBe(section)
    expect(wrapper.text()).toContain('128.50')
    complete({ balance: 150, freeze: 0, score: 260 })
    await vi.waitFor(() => expect(wrapper.text()).toContain('150.00'))
  }
  finally { wrapper.unmount() }
})
