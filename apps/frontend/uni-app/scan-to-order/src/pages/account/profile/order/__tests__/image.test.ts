import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import OrderImage from '../components/OrderImage/index.vue'

it('缺图和加载失败使用占位，新地址可以重新加载', async () => {
  const wrapper = mount(OrderImage)
  expect(wrapper.text()).toContain('暂无图片')
  expect(wrapper.find('image').exists()).toBe(false)
  await wrapper.setProps({ src: 'https://example.com/a.jpg' })
  expect(wrapper.text()).toContain('图片加载中')
  await wrapper.find('image').trigger('error')
  expect(wrapper.text()).toContain('暂无图片')
  expect(wrapper.find('image').exists()).toBe(false)
  await wrapper.setProps({ src: 'https://example.com/b.jpg' })
  expect(wrapper.find('image').exists()).toBe(true)
  await wrapper.find('image').trigger('load')
  expect(wrapper.find('.image-placeholder').exists()).toBe(false)
  wrapper.unmount()
})
