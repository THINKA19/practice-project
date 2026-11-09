import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import ShopImagePreview from '../components/ShopImagePreview/index.vue'

function viewer() {
  return mount(ShopImagePreview, { global: {
    stubs: { WdOverlay: { template: '<div><slot /></div>' } },
    config: { compilerOptions: { isCustomElement: tag => ['view', 'text', 'swiper', 'swiper-item', 'image', 'movable-area', 'movable-view'].includes(tag) } },
  } })
}
it('箭头和滑动共享当前照片，首尾禁用且不循环', async () => {
  const wrapper = viewer()
  wrapper.vm.open({ images: ['/one.jpg', '/two.jpg', '/three.jpg'], startPosition: 0 })
  await nextTick()
  const previous = () => wrapper.find('[aria-label="上一张"]')
  const next = () => wrapper.find('[aria-label="下一张"]')
  expect(previous().attributes('disabled')).toBeDefined()
  expect(next().attributes('disabled')).toBeUndefined()
  expect(wrapper.find('swiper').attributes('circular')).toBe('false')
  await next().trigger('tap')
  expect(wrapper.text()).toContain('2 / 3')
  await wrapper.find('swiper').trigger('change', { detail: { current: 2 } })
  expect(wrapper.text()).toContain('3 / 3')
  expect(next().attributes('disabled')).toBeDefined()
  await previous().trigger('tap')
  expect(wrapper.text()).toContain('2 / 3')
  await wrapper.find('[aria-label="关闭预览"]').trigger('tap')
  expect(wrapper.emitted('close')).toHaveLength(1)
  expect(wrapper.find('swiper').exists()).toBe(false)
  wrapper.unmount()
})

it('单张位置图片可以放大缩小，放大时禁止滑动换图，关闭重开重置比例', async () => {
  const wrapper = viewer()
  wrapper.vm.open({ images: ['/map.png'], startPosition: 0 })
  await nextTick()
  expect(wrapper.find('[aria-label="上一张"]').exists()).toBe(false)
  expect(wrapper.find('[aria-label="缩小图片"]').attributes('disabled')).toBeDefined()
  await wrapper.find('[aria-label="放大图片"]').trigger('tap')
  expect(wrapper.text()).toContain('150%')
  expect(wrapper.find('swiper').attributes('disable-touch')).toBe('true')
  await wrapper.find('movable-view').trigger('scale', { detail: { scale: 4 } })
  expect(wrapper.find('[aria-label="放大图片"]').attributes('disabled')).toBeDefined()
  await wrapper.find('[aria-label="缩小图片"]').trigger('tap')
  expect(wrapper.text()).toContain('350%')
  wrapper.vm.close()
  wrapper.vm.open({ images: ['/new-map.png'], startPosition: 0 })
  await nextTick()
  expect(wrapper.text()).toContain('100%')
  expect(wrapper.find('image').attributes('src')).toBe('/new-map.png')
  wrapper.unmount()
})
