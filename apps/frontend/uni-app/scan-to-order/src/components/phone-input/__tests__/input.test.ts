import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import PhoneInput from '../index.vue'
import type { PhoneInputHandle } from '../types'

function render(required = false) {
  return mount(PhoneInput, { props: { modelValue: '', country: 'VN', required }, global: { stubs: {
    'wd-popup': { props: ['modelValue'], template: '<view v-if="modelValue" class="sheet"><slot /></view>' },
    'wd-icon': true,
  } } })
}

it('默认统一展示国家区号和小折角，不显示额外的切换文字', async () => {
  const wrapper = render()
  try {
    expect(wrapper.find('.phone-country-value').text()).toBe('越南 +84')
    expect(wrapper.find('.phone-chevron').exists()).toBe(true)
    expect(wrapper.find('.phone-switch').exists()).toBe(false)
    await wrapper.find('.country-picker').trigger('tap')
    expect(wrapper.find('.sheet').text()).toContain('越南 +84')
  }
  finally {
    wrapper.unmount()
  }
})

it('选填空号通过，已填非法号码拦截，外部清空后重置错误', async () => {
  const wrapper = render()
  const api = wrapper.vm as unknown as PhoneInputHandle
  try {
    expect(api.validate()).toBe(true)
    await wrapper.find('input').trigger('input', { detail: { value: '123' } })
    expect(api.validate()).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.phone-error').exists()).toBe(true)
    await wrapper.find('.phone-clear').trigger('tap')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(api.validate()).toBe(true)
    await wrapper.setProps({ modelValue: '0912345678' })
    expect(api.validate()).toBe(true)
    await wrapper.setProps({ modelValue: '' })
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    expect(api.validate()).toBe(true)
  }
  finally {
    wrapper.unmount()
  }
})

it('必填提交显示空号错误，国家选择只更新区号，不更改号码', async () => {
  const wrapper = render(true)
  try {
    expect((wrapper.vm as unknown as PhoneInputHandle).validate()).toBe(false)
    await wrapper.find('.country-picker').trigger('tap')
    expect(wrapper.findAll('.sheet-option')).toHaveLength(5)
    await wrapper.findAll('.sheet-option')[3].trigger('tap')
    expect(wrapper.emitted('update:country')).toEqual([['TH']])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ country: 'TH', modelValue: '0812345678' })
    expect((wrapper.vm as unknown as PhoneInputHandle).validate()).toBe(true)
  }
  finally {
    wrapper.unmount()
  }
})

it('禁用后关闭选择器，不响应号码输入或国家选择', async () => {
  const wrapper = render()
  try {
    await wrapper.find('.country-picker').trigger('tap')
    expect(wrapper.find('.sheet').exists()).toBe(true)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('.sheet').exists()).toBe(false)
    await wrapper.find('.country-picker').trigger('tap')
    await wrapper.find('input').trigger('input', { detail: { value: '0912345678' } })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.sheet').exists()).toBe(false)
  }
  finally {
    wrapper.unmount()
  }
})
