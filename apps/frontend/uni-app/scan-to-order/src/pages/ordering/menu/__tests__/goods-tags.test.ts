import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import GoodsTags from '../components/catalog/GoodsTags.vue'

it('按接口顺序展示标签，自定义文案也可重点展示，缺省级别按普通展示', async () => {
  const wrapper = mount(GoodsTags, {
    props: { tags: [
      { label: '老板私藏', tone: 'green', emphasis: 'primary' },
      { label: '新品上市', tone: 'orange' },
    ] },
  })
  const tags = wrapper.findAll('.goods-tag')
  expect(tags.map(tag => tag.text())).toEqual(['老板私藏', '新品上市'])
  expect(tags[0].classes()).toContain('text-24rpx')
  expect(tags[0].classes()).toContain('bg-[#edf7ef]')
  expect(tags[1].classes()).toContain('text-20rpx')
  expect(tags[1].classes()).toContain('text-[#8a7b6b]')
  expect(tags[1].classes().some(name => name.startsWith('bg-'))).toBe(false)
  await wrapper.setProps({ tags: [{ label: '老板私藏', tone: 'orange', emphasis: 'normal' }] })
  expect(wrapper.find('.goods-tag').classes()).toContain('text-20rpx')
  expect(wrapper.find('.goods-tag').classes().some(name => name.startsWith('bg-'))).toBe(false)
  wrapper.unmount()
})

it('过滤空文案及重复标签，最多显示两个，无标签不占位', async () => {
  const wrapper = mount(GoodsTags, {
    props: { tags: [{ label: ' ' }, { label: '新品' }, { label: ' 新品 ' }, { label: '招牌' }, { label: '限定' }] },
  })
  expect(wrapper.findAll('.goods-tag').map(tag => tag.text())).toEqual(['新品', '招牌'])
  await wrapper.setProps({ tags: undefined })
  expect(wrapper.find('.goods-tags').exists()).toBe(false)
  wrapper.unmount()
})
