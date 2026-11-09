import { shallowMount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import BannerCarousel from '../index.vue'

const ad = { id: 1, picUrl: '/ad.jpg', type: 'ordering_ad' }
const global = { stubs: { 'wd-swiper': true } }

it('无有效广告时隐藏整个区域，有单张广告时静态展示', async () => {
  const wrapper = shallowMount(BannerCarousel, { props: { items: [], label: '广告' }, global })
  expect(wrapper.find('.banner-carousel').exists()).toBe(false)
  await wrapper.setProps({ items: [{ ...ad, picUrl: '' }] })
  expect(wrapper.find('.banner-carousel').exists()).toBe(false)
  await wrapper.setProps({ items: [ad] })
  expect(wrapper.find('.carousel-label').text()).toBe('广告')
  expect(wrapper.find('wd-swiper-stub').attributes('autoplay')).toBe('false')
  expect(wrapper.find('wd-swiper-stub').attributes('height')).toBe('150rpx')
  wrapper.unmount()
})

it('多张广告自动轮播，过滤无图记录后仍打开正确的广告', () => {
  const second = { ...ad, id: 2, linkUrl: '/pages/home/index/index' }
  const wrapper = shallowMount(BannerCarousel, { props: { items: [{ ...ad, picUrl: ' ' }, ad, second] }, global })
  const swiper = wrapper.findComponent({ name: 'wd-swiper' })
  expect(wrapper.find('wd-swiper-stub').attributes('autoplay')).toBe('true')
  swiper.vm.$emit('click', { index: 1 })
  expect(wrapper.emitted('select')).toEqual([[second]])
  wrapper.unmount()
})
