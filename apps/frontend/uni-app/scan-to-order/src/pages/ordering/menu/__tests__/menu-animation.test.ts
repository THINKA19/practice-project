import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import GoodsList from '../components/catalog/GoodsList/index.vue'

vi.mock('@/components/page-state', () => ({ PageState: { template: '<div />' } }))
vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('../composables/use-menu', () => ({ sectionAnchor: (id: number) => `menu-cat-${id}` }))

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('uni', {
    ...uni,
    createSelectorQuery: () => {
      const selectors: string[] = []
      const query = {
        in: () => query,
        select: (selector: string) => {
          selectors.push(selector)
          return query
        },
        selectAll: (selector: string) => {
          selectors.push(selector)
          return query
        },
        boundingClientRect: () => query,
        exec: (callback: (nodes: unknown[]) => void) => callback(selectors.map(selector => selector === '.goods-section' ? [] : selector === '.goods-content' ? { height: 3000 } : selector === '.goods-scroll' ? { top: 0, height: 400 } : { top: selector === '#menu-cat-2' ? 1000 : 500 })),
      }
      return query
    },
  })
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})
function mountList() {
  return mount(GoodsList, { global: { stubs: { 'wd-swiper': true, 'BannerCarousel': false }, config: { compilerOptions: { isCustomElement: (tag: string) => ['scroll-view', 'view'].includes(tag) } } }, props: { sections: [], banners: [], countdowns: {}, actions: {}, badges: {}, scrollIntoView: '', empty: false } })
}
it('分类切换经过中间位置平滑到达目标，卸载后停止动画', async () => {
  const wrapper = mountList()
  await wrapper.setProps({ scrollIntoView: 'menu-cat-2' })
  await nextTick()
  await vi.advanceTimersByTimeAsync(320)
  const middle = Number(wrapper.find('scroll-view').attributes('scroll-top'))
  expect(middle).toBeGreaterThan(0)
  expect(middle).toBeLessThan(1000)
  await vi.advanceTimersByTimeAsync(400)
  expect(Number(wrapper.find('scroll-view').attributes('scroll-top'))).toBe(1000)
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
})
it('新分类会取消旧动画，用户触摸时停止自动滑动', async () => {
  const wrapper = mountList()
  await wrapper.setProps({ scrollIntoView: 'menu-cat-2' })
  await nextTick()
  await vi.advanceTimersByTimeAsync(100)
  await wrapper.setProps({ scrollIntoView: 'menu-cat-3' })
  await nextTick()
  await vi.advanceTimersByTimeAsync(700)
  expect(Number(wrapper.find('scroll-view').attributes('scroll-top'))).toBe(500)
  await wrapper.setProps({ scrollIntoView: 'menu-cat-2' })
  await nextTick()
  await wrapper.find('scroll-view').trigger('touchstart')
  expect(vi.getTimerCount()).toBe(0)
  wrapper.unmount()
})

it('空菜单活动图保持110rpx，无活动图时不留空轮播容器', async () => {
  const wrapper = mountList()
  await wrapper.setProps({ empty: true, banners: [{ id: 1, picUrl: '/demo.jpg' }] })
  expect(wrapper.find('.banner').exists()).toBe(true)
  const swiper = wrapper.find('wd-swiper-stub')
  expect(swiper.attributes('height')).toBe('110rpx')
  expect(swiper.attributes('autoplay')).toBe('false')
  await wrapper.setProps({ banners: [] })
  expect(wrapper.find('.banner').exists()).toBe(false)
  wrapper.unmount()
})
