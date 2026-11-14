import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import { t } from '@/locale'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useRiderTaskStore } from '../composables/use-store'
import { createTasks, demoGrant } from '../mock/fixtures'

const route = vi.hoisted(() => ({ load: (_options: { id: string }) => {} }))
const feedback = vi.hoisted(() => ({ show: vi.fn(), close: vi.fn() }))
vi.mock('@wot-ui/ui/components/wd-toast', () => ({ useToast: () => feedback }))
vi.mock('@dcloudio/uni-app', () => ({
  onLoad: (callback: typeof route.load) => { route.load = callback },
  onShow: vi.fn(),
  onHide: vi.fn(),
  onUnload: vi.fn(),
}))

it('接单前隐藏详细送达地址，接单后缺少坐标仍可复制当前阶段地址', async () => {
  const Detail = (await import('../detail.vue')).default
  seedSession({ userId: 30001 }, 'rider')
  vi.stubGlobal('definePage', vi.fn())
  const copy = vi.fn()
  vi.stubGlobal('uni', { ...uni, setClipboardData: copy, hideToast: vi.fn() })
  const store = useRiderTaskStore()
  const order = createTasks(demoGrant('30001')!, '30001')[0]
  store.riderId = '30001'
  store.online = true
  store.orders = [order]
  const page = mount(Detail, { global: { stubs: { 'wd-button': { template: '<button><slot /></button>' }, 'wd-toast': true } } })
  const action = (label: string) => page.findAll('button').find(button => button.text() === t(label))
  try {
    route.load({ id: order.id })
    await nextTick()
    expect(page.text()).toContain(order.deliveryArea)
    expect(page.text()).not.toContain(order.address)
    expect(action('rider.task.copyAddress')).toBeUndefined()

    store.orders = [{ ...order, riderId: '30001', status: 'accepted', pickupPoint: undefined }]
    await nextTick()
    expect(page.text()).toContain(order.pickupNote)
    expect(page.text()).toContain(order.pickupCode)
    await action('rider.task.navigatePickup')!.trigger('click')
    expect(uni.showToast).toHaveBeenCalledWith({ title: t('rider.task.noLocation'), icon: 'none' })
    await action('rider.task.copyAddress')!.trigger('click')
    expect(copy).toHaveBeenLastCalledWith(expect.objectContaining({ data: order.shopAddress }))
    copy.mock.lastCall?.[0].success()
    expect(feedback.show).toHaveBeenLastCalledWith({ msg: t('rider.task.copyAddressSuccess'), position: 'bottom', duration: 2000 })

    store.orders = [{ ...order, riderId: '30001', status: 'delivering' }]
    await nextTick()
    expect(page.text()).toContain(order.deliveryNote)
    expect(page.text().indexOf(order.address)).toBeLessThan(page.text().indexOf(order.shopAddress))
    await action('rider.task.copyAddress')!.trigger('click')
    expect(copy).toHaveBeenLastCalledWith(expect.objectContaining({ data: order.address }))
    copy.mock.lastCall?.[0].fail()
    expect(feedback.show).toHaveBeenLastCalledWith({ msg: t('rider.task.copyAddressFailed'), position: 'bottom', duration: 2000 })
  }
  finally {
    page.unmount()
    vi.unstubAllGlobals()
  }
})
