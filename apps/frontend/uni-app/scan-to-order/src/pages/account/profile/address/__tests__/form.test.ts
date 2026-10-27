import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import i18n from '@/locale'
import AddressEditForm from '../components/AddressEditForm/index.vue'

it('必填红星、五国电话和配送国家联动选择分开，不展示地图入口', async () => {
  const wrapper = mount(AddressEditForm, { props: { draft: {
    linkMan: '',
    mobile: '',
    address: '',
    phoneCountry: 'VN',
    countryCode: '',
    regionText: '',
  } }, global: { plugins: [i18n], stubs: {
    'wd-popup': { props: ['modelValue'], template: '<div v-if="modelValue" class="sheet"><slot /></div>' },
    'wd-icon': true,
  } } })
  try {
    expect(wrapper.findAll('.label .required')).toHaveLength(5)
    expect(wrapper.text()).not.toContain('地图定位')
    await wrapper.findAll('.country-picker')[0].trigger('tap')
    expect(wrapper.findAll('.sheet-option')).toHaveLength(5)
    expect(wrapper.find('.sheet').text()).toContain('中国 +86')
    await wrapper.findAll('.sheet-option')[3].trigger('tap')
    expect(wrapper.emitted('input')?.[0]).toEqual(['phoneCountry', 'TH'])
    await wrapper.findAll('.country-picker')[1].trigger('tap')
    expect(wrapper.findAll('.sheet-option')).toHaveLength(5)
    expect(wrapper.find('.sheet').text()).not.toContain('中国')
    expect(wrapper.find('.sheet').text()).toContain('马来西亚')
    await wrapper.findAll('.sheet-option')[0].trigger('tap')
    await wrapper.setProps({ draft: { ...wrapper.props('draft'), countryCode: 'VN' } })
    await wrapper.findAll('.country-picker')[2].trigger('tap')
    expect(wrapper.find('.sheet').text()).toContain('胡志明市')
    expect(wrapper.find('.sheet').text()).not.toContain('曼谷')
    await wrapper.findAll('.sheet-option')[1].trigger('tap')
    expect(wrapper.emitted('input')?.at(-1)).toEqual(['regionText', '胡志明市'])
    expect(wrapper.find('.form-panel').findAll('.row-wrap')).toHaveLength(5)
  }
  finally { wrapper.unmount() }
})

it('手机号失焦即显示错误，改正确后消失，切换区号重新校验并拦截保存', async () => {
  const draft = { linkMan: '', mobile: '', address: '', phoneCountry: 'VN', countryCode: '', regionText: '' }
  const wrapper = mount(AddressEditForm, { props: { draft }, global: { plugins: [i18n], stubs: { 'wd-popup': true, 'wd-icon': true } } })
  try {
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await wrapper.setProps({ draft: { ...draft, mobile: '123' } })
    await wrapper.findAll('input')[1].trigger('blur')
    expect(wrapper.find('.phone-error').exists()).toBe(true)
    await wrapper.find('.save-btn').trigger('tap')
    expect(wrapper.emitted('save')).toBeUndefined()
    await wrapper.setProps({ draft: { ...draft, mobile: '0912345678' } })
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await wrapper.setProps({ draft: { ...draft, mobile: '0912345678', phoneCountry: 'CN' } })
    expect(wrapper.find('.phone-error').exists()).toBe(true)
    await wrapper.setProps({ draft: { ...draft, mobile: '13800000000', phoneCountry: 'CN' } })
    await wrapper.find('.save-btn').trigger('tap')
    expect(wrapper.emitted('save')).toHaveLength(1)
  }
  finally { wrapper.unmount() }
})

it('空号码不因聚焦或失焦报错，重新输入时清除旧错误并校验最新输入', async () => {
  const draft = { linkMan: '', mobile: '', address: '', phoneCountry: 'VN', countryCode: '', regionText: '' }
  const wrapper = mount(AddressEditForm, { props: { draft }, global: { plugins: [i18n], stubs: { 'wd-popup': true, 'wd-icon': true } } })
  try {
    const input = wrapper.findAll('input')[1]
    await input.trigger('focus')
    await input.trigger('blur')
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await wrapper.setProps({ draft: { ...draft, phoneCountry: 'CN' } })
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await input.trigger('focus')
    await input.trigger('input', { detail: { value: '123' } })
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await input.trigger('blur')
    expect(wrapper.find('.phone-error').exists()).toBe(true)
    await input.trigger('focus')
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await input.trigger('input', { detail: { value: '13800000000' } })
    await input.trigger('blur')
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await input.trigger('input', { detail: { value: '' } })
    await input.trigger('blur')
    expect(wrapper.find('.phone-error').exists()).toBe(false)
    await wrapper.find('.save-btn').trigger('tap')
    expect(wrapper.find('.phone-error').exists()).toBe(true)
    expect(wrapper.emitted('save')).toBeUndefined()
  }
  finally { wrapper.unmount() }
})
