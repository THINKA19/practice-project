import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import Page from '../index.vue'

const list = vi.hoisted(() => vi.fn())
vi.mock('../api/group-buying.api', () => ({ groupBuyingApi: { list } }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => ({ sessionRevision: 0 }) }))
vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))

it('触底追加，失败重试同一页，从详情返回时刷新参团状态并保留已加载的页', async () => {
  const onShow = vi.fn<(callback: () => void) => void>()
  const onReachBottom = vi.fn<(callback: () => void) => void>()
  vi.stubGlobal('onShow', onShow)
  vi.stubGlobal('onReachBottom', onReachBottom)
  vi.stubGlobal('onPullDownRefresh', vi.fn())
  vi.stubGlobal('definePage', vi.fn())
  let joined = false
  list.mockImplementation(async (page: number) => ({
    total: 18,
    list: Array.from({ length: page === 1 ? 10 : 8 }, (_, i) => {
      const id = (page - 1) * 10 + i + 1
      return { id, name: `活动 ${id}`, price: 10, originalPrice: 20, people: 3, joined: joined && id === 18 ? 2 : 1, participating: joined && id === 18 }
    }),
  }))
  const view = mount(Page)
  try {
    const show = onShow.mock.calls[0][0]
    const reachBottom = onReachBottom.mock.calls[0][0]
    show()
    await flushPromises()
    expect(view.text()).toContain('活动 10')
    expect(view.text()).not.toContain('活动 11')
    expect(view.find('button').exists()).toBe(false)

    list.mockRejectedValueOnce(new Error('network'))
    reachBottom()
    await flushPromises()
    expect(view.text()).toContain('加载失败，点击重试')
    await view.get('button').trigger('tap')
    await flushPromises()
    expect(list.mock.calls.map(([page]) => page)).toEqual([1, 2, 2])
    expect(view.text()).toContain('活动 18')
    expect(view.text()).toContain('已经到底了')

    joined = true
    show()
    await flushPromises()
    expect(view.text()).toContain('已参团，查看进度')
    expect(view.text()).toContain('活动 18')
    expect(view.find('button').exists()).toBe(false)
    reachBottom()
    expect(list.mock.calls.map(([page]) => page)).toEqual([1, 2, 2, 1, 2])
  }
  finally {
    view.unmount()
    vi.unstubAllGlobals()
  }
})
