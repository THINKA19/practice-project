import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { expect, it } from 'vitest'
import { PageState } from '../index'
import { setLocale } from '@/locale'

it('shows the same loading label and hides empty content and actions until loading completes', async () => {
  setLocale('zh-Hans')
  const wrapper = mount(PageState, {
    props: { status: 'loading', title: '业务空状态', description: '空状态说明', fill: true },
    slots: { default: () => h('button', { style: { backgroundColor: '#169b50' } }, '去下单') },
  })
  expect(wrapper.text()).toBe('正在加载中')
  expect(wrapper.find('.wd-loading--vertical').exists()).toBe(true)
  expect(wrapper.find('.wd-loading__spinner--dots').exists()).toBe(true)
  expect(wrapper.find('.wd-empty').exists()).toBe(false)
  expect(wrapper.find('button').exists()).toBe(false)
  await wrapper.setProps({ status: 'empty' })
  expect(wrapper.find('.wd-loading').exists()).toBe(false)
  expect(wrapper.text()).toContain('业务空状态')
  expect(wrapper.text()).toContain('空状态说明')
  expect(wrapper.find('button').attributes('style')).toContain('rgb(22, 155, 80)')
  await wrapper.setProps({ status: 'error', title: '暂时无法获取数据', description: undefined })
  expect(wrapper.text()).toContain('暂时无法获取数据')
  expect(wrapper.text()).not.toContain('点击重试')
  wrapper.unmount()
})
