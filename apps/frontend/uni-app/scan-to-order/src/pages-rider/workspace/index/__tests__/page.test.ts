import { mount } from '@vue/test-utils'
import { effectScope, nextTick } from 'vue'
import { t } from '@/locale'
import { expect, it, vi } from 'vitest'
import { RiderRoutes } from '@/pages-rider/routes'
import { useRiderWorkspacePage } from '../composables/use-page'
import { useRiderTaskStore } from '@/pages-rider/delivery/task'
import { useRiderProfileStore } from '@/pages-rider/account/profile'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { createTasks, demoGrant } from '../../../delivery/task/mock/fixtures'
import { createProfile } from '../../../account/profile/mock/fixtures'

vi.mock('../api/workspace.api', () => ({ fetchRiderWorkspace: vi.fn().mockResolvedValue({ announcement: '演示', incomeTarget: 120 }) }))
const lifecycle = vi.hoisted(() => ({ pull: async () => {}, show: [] as (() => void)[], hide: [] as (() => void)[] }))
vi.mock('@dcloudio/uni-app', () => ({ onLoad: vi.fn(), onShow: (fn: () => void) => lifecycle.show.push(fn), onHide: (fn: () => void) => lifecycle.hide.push(fn), onUnload: vi.fn(), onPullDownRefresh: (callback: () => Promise<void>) => {
  lifecycle.pull = callback
} }))
vi.mock('@/pages-rider/delivery/task/api/tasks.api', () => ({ fetchRiderTasks: vi.fn(), setRiderOnline: vi.fn(), submitRiderAction: vi.fn() }))
vi.mock('@/pages-rider/account/profile/api/profile.api', () => ({ fetchRiderProfile: vi.fn(), saveRiderProfile: vi.fn() }))
it('工作台跟随所属模块的资料和任务更新，不建立第二份统计或姓名', async () => {
  seedSession({}, 'rider')
  const scope = effectScope()
  const page = scope.run(useRiderWorkspacePage)!
  const account = useRiderProfileStore()
  account.profile = createProfile('1', '已修改姓名')
  const tasks = useRiderTaskStore()
  tasks.riderId = '1'
  tasks.orders = [{ ...createTasks(demoGrant('30001')!, '1')[0], serviceArea: undefined, deliveryFee: 6, riderId: '1', status: 'done', settledAt: new Date().toISOString() }]
  expect(page.profile.value?.name).toBe('已修改姓名')
  expect(page.stats.value.todayIncome).toBe(6)
  expect(page.target.value).toBeNull()
  await page.refreshOverview()
  expect(page.progress.value).toBe(5)
  scope.stop()
})
it('下拉刷新结束后关闭系统刷新反馈', async () => {
  seedSession({}, 'rider')
  const stop = vi.fn()
  Object.assign(uni, { stopPullDownRefresh: stop })
  const scope = effectScope()
  scope.run(useRiderWorkspacePage)
  await lifecycle.pull()
  expect(stop).toHaveBeenCalledTimes(1)
  scope.stop()
})

it('removes an expired assignment from the visible list and only warns once', async () => {
  const Workspace = (await import('../index.vue')).default
  seedSession({}, 'rider')
  vi.stubGlobal('definePage', vi.fn())
  vi.useFakeTimers()
  const tasks = useRiderTaskStore()
  tasks.riderId = '30001'
  tasks.online = true
  tasks.maxConcurrent = 3
  const orders = createTasks(demoGrant('30001')!, '30001')
  tasks.orders = [orders[0], orders.find(task => task.status === 'assigned')!]
  const wrapper = mount(Workspace, { global: { stubs: { 'wd-button': true, 'wd-toast': true } } })
  try {
    lifecycle.show.at(-1)?.()
    const cards = wrapper.findAll('.rider-task')
    expect(cards).toHaveLength(2)
    expect(cards[0].text()).toContain(t('rider.task.remaining', { time: '01:30' }))
    expect(cards[1].text()).toContain(t('rider.task.hall'))
    expect(wrapper.text()).toContain(t('rider.workspace.pendingAssignments'))
    expect(wrapper.text()).toContain(t('rider.workspace.reservedAssignments', { count: 1 }))
    vi.advanceTimersByTime(60_000)
    await nextTick()
    expect(wrapper.findAll('.rider-task')[0].text()).toContain(t('rider.task.remaining', { time: '00:30' }))
    vi.advanceTimersByTime(30_000)
    await nextTick()
    expect(wrapper.findAll('.rider-task')).toHaveLength(1)
    expect(wrapper.get('.rider-task').text()).toContain(t('rider.task.hall'))
    expect(uni.showToast).toHaveBeenCalledWith({ title: t('rider.task.expired'), icon: 'none' })
    vi.advanceTimersByTime(5_000)
    const warnings = vi.mocked(uni.showToast).mock.calls.filter(([options]) => options?.title === t('rider.task.expired'))
    expect(warnings).toHaveLength(1)
    lifecycle.hide.at(-1)?.()
    expect(vi.getTimerCount()).toBe(0)
  }
  finally {
    wrapper.unmount()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  }
})

it('keeps the same address layout and copies the active stop in each delivery stage', async () => {
  const Workspace = (await import('../index.vue')).default
  seedSession({}, 'rider')
  vi.stubGlobal('definePage', vi.fn())
  const copy = vi.fn()
  vi.stubGlobal('uni', { ...uni, setClipboardData: copy })
  const tasks = useRiderTaskStore()
  tasks.riderId = '30001'
  const order = { ...createTasks(demoGrant('30001')!, '30001')[0], riderId: '30001' }
  tasks.orders = [{ ...order, status: 'accepted' }]
  const wrapper = mount(Workspace, { global: { stubs: { 'wd-button': true, 'wd-toast': true } } })
  const copyButton = () => wrapper.findAll('.task-pill').find(button => button.text() === t('rider.task.copyAddress'))
  try {
    expect(wrapper.get('switch').attributes('disabled')).toBe('true')
    expect(wrapper.text()).toContain(t('rider.workspace.voiceOnlineOnly'))
    expect(wrapper.text()).not.toContain(t('rider.workspace.voice'))
    tasks.online = true
    await nextTick()
    expect(wrapper.get('switch').attributes('disabled')).toBe('false')
    expect(wrapper.text()).not.toContain(t('rider.workspace.voiceOnlineOnly'))
    expect(wrapper.text()).toContain(t('rider.workspace.voice'))
    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    expect(wrapper.get('.rider-task').text()).toContain(t('rider.task.pickupAddress'))
    await copyButton()!.trigger('click')
    expect(copy).toHaveBeenLastCalledWith(expect.objectContaining({ data: order.shopAddress }))

    tasks.orders = [{ ...order, status: 'delivering' }]
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    expect(wrapper.get('.rider-task').text()).toContain(t('rider.task.deliveryAddress'))
    await copyButton()!.trigger('click')
    expect(copy).toHaveBeenLastCalledWith(expect.objectContaining({ data: order.address }))

    tasks.orders = [{ ...order, status: 'delivering', address: ' ' }]
    await nextTick()
    expect(copyButton()).toBeUndefined()
  }
  finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})

it('puts the delivery destination and its own distance first, with a separate history entry', async () => {
  const Workspace = (await import('../index.vue')).default
  seedSession({}, 'rider')
  vi.stubGlobal('definePage', vi.fn())
  const tasks = useRiderTaskStore()
  tasks.riderId = '30001'
  tasks.maxConcurrent = 3
  tasks.orders = [{
    ...createTasks(demoGrant('30001')!, '30001')[0],
    riderId: '30001',
    status: 'delivering',
    distance: '0.7 km',
    deliveryDistanceKm: 1.8,
  }]
  const wrapper = mount(Workspace, { global: { stubs: { 'wd-button': true, 'wd-toast': true } } })
  try {
    await wrapper.findAll('[role="tab"]')[2].trigger('click')
    const card = wrapper.get('.rider-task')
    expect(card.text()).toContain(t('rider.task.deliveryDistance', { distance: '1.8' }))
    expect(card.text()).not.toContain('0.7 km')
    const destination = tasks.orders[0].address
    expect(card.text()).toContain(destination)
    expect(card.text().indexOf(destination)).toBeLessThan(card.text().indexOf('禾味厨房'))
    const navigate = vi.spyOn(uni, 'navigateTo')
    try {
      expect(wrapper.findAll('.stats-card')).toHaveLength(1)
      await wrapper.get('.stats-card .grid').trigger('click')
      expect(navigate).not.toHaveBeenCalled()
      await wrapper.get('.records-link').trigger('click')
      expect(navigate.mock.calls.map(([options]) => options.url)).toEqual([RiderRoutes.Delivery.tasks])
    }
    finally {
      navigate.mockRestore()
    }
  }
  finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})
