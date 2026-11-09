import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import ShopPhotoGallery from '../components/ShopPhotoGallery/index.vue'

const open = vi.fn()
const Preview = defineComponent({
  emits: ['close'],
  setup(_, { expose }) {
    expose({ open })
    return () => null
  },
})
function gallery(photos = ['/cover.jpg', '/inside.jpg']) {
  return mount(ShopPhotoGallery, {
    props: { photos, active: true },
    global: { stubs: { ShopImagePreview: Preview }, config: { compilerOptions: { isCustomElement: tag => ['swiper', 'swiper-item', 'image'].includes(tag) } } },
  })
}
beforeEach(() => open.mockReset())

it('点击当前照片先暂停，关闭预览才恢复，底层保持点击时的位置', async () => {
  const wrapper = gallery()
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('true')
  await wrapper.findAll('image')[1].trigger('tap')
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('false')
  expect(open).toHaveBeenCalledWith({ images: ['/cover.jpg', '/inside.jpg'], startPosition: 1 })
  await wrapper.find('swiper').trigger('change', { detail: { current: 0 } })
  expect(wrapper.find('swiper').attributes('current')).toBe('1')
  wrapper.findComponent(Preview).vm.$emit('close')
  await nextTick()
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('true')
  expect(wrapper.find('swiper').attributes('current')).toBe('1')
  wrapper.unmount()
})

it('拖动不打开预览，下一次正常点击仍可打开', async () => {
  const wrapper = gallery()
  const swiper = wrapper.find('swiper')
  await swiper.trigger('touchstart', { touches: [{ clientX: 100, clientY: 50 }] })
  expect(swiper.attributes('autoplay')).toBe('false')
  await swiper.trigger('touchmove', { touches: [{ clientX: 50, clientY: 50 }] })
  await swiper.trigger('touchend')
  await wrapper.find('image').trigger('tap')
  expect(open).not.toHaveBeenCalled()
  await swiper.trigger('touchstart', { touches: [{ clientX: 50, clientY: 50 }] })
  await swiper.trigger('touchend')
  await wrapper.find('image').trigger('tap')
  expect(open).toHaveBeenCalledTimes(1)
  wrapper.unmount()
})

it('单图和隐藏页面不自动轮播，隐藏时关闭预览也不会恢复', async () => {
  const wrapper = gallery(['/cover.jpg'])
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('false')
  await wrapper.find('image').trigger('tap')
  await wrapper.setProps({ active: false, photos: ['/cover.jpg', '/inside.jpg'] })
  wrapper.findComponent(Preview).vm.$emit('close')
  await nextTick()
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('false')
  await wrapper.setProps({ active: true })
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('true')
  wrapper.unmount()
})

it('预览打开异常不会让轮播永久暂停', async () => {
  open.mockImplementationOnce(() => {
    throw new Error('preview unavailable')
  })
  const wrapper = gallery()
  await wrapper.find('image').trigger('tap')
  expect(wrapper.find('swiper').attributes('autoplay')).toBe('true')
  wrapper.unmount()
})
