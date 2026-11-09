import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import RegionPicker from '../components/RegionPicker/index.vue'
import { shopRegions } from '../mock/fixtures/regions'

function setup() {
  return mount(RegionPicker, {
    props: { regions: shopRegions, ready: true, modelValue: false, selection: { countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1' } },
    global: { stubs: { 'wd-popup': { template: '<div><slot /></div>' }, 'wd-icon': true, 'scroll-view': { template: '<div><slot /></div>' } } },
  })
}

it('加载与失败时禁止确认并提供重试，空目录不显示全部地区', async () => {
  const wrapper = setup()
  await wrapper.setProps({ modelValue: true, loading: true, ready: false })
  await wrapper.get('.region-confirm').trigger('tap')
  expect(wrapper.emitted('apply')).toBeUndefined()
  expect(wrapper.find('.region-columns').exists()).toBe(false)
  await wrapper.setProps({ loading: false, error: '加载失败' })
  await wrapper.findAll('button')[0].trigger('tap')
  expect(wrapper.emitted('retry')).toHaveLength(1)
  await wrapper.setProps({ error: '', ready: true, regions: [] })
  expect(wrapper.text()).toContain('暂无开放地区')
  await wrapper.get('.region-confirm').trigger('tap')
  expect(wrapper.emitted('apply')).toBeUndefined()
  wrapper.unmount()
})

it('三级联动先编辑草稿，切换上级清理下级，确认前不改变门店筛选', async () => {
  const wrapper = setup()
  await wrapper.setProps({ modelValue: true })
  const tap = async (text: string) => {
    const option = wrapper.findAll('.region-option').find(item => item.text() === text)!
    await option.trigger('tap')
  }
  await tap('泰国')
  expect(wrapper.text()).toContain('不限区域')
  expect(wrapper.text()).not.toContain('第一郡')
  await tap('曼谷')
  await tap('瓦他那区')
  expect(wrapper.emitted('apply')).toBeUndefined()
  await wrapper.find('.region-confirm').trigger('tap')
  expect(wrapper.emitted('apply')?.[0]).toEqual([{ countryCode: 'TH', cityCode: 'TH-BKK', districtCode: 'TH-BKK-WTN' }])
  wrapper.unmount()
})

it('连续切换三国全部城市时重建区域滚动容器，显示当前城市区域并清除旧选择', async () => {
  const wrapper = setup()
  await wrapper.setProps({ modelValue: true })
  await wrapper.findAll('.region-column')[0].find('.region-option').trigger('tap')
  for (const country of shopRegions) {
    const countryOption = wrapper.findAll('.region-column')[0].findAll('.region-option').find(option => option.text() === country.name)!
    await countryOption.trigger('tap')
    for (const city of country.cities) {
      const previous = wrapper.find('.district-options').element
      const previousCity = wrapper.findAll('.region-column')[1].findAll('.region-option.active')[0]?.text()
      await wrapper.find('.city-options').findAll('.region-option').find(option => option.text() === city.name)!.trigger('tap')
      expect(wrapper.findAll('.region-column')[2].find('.column-title').text()).toBe(`${city.name} · 区域`)
      expect(wrapper.find('.district-options').findAll('.region-option').map(option => option.text())).toEqual(['不限', ...city.districts.map(area => area.name)])
      expect(wrapper.find('.district-options').find('.region-option.active').text()).toBe('不限')
      if (previousCity !== city.name)
        expect(wrapper.find('.district-options').element).not.toBe(previous)
      await wrapper.find('.district-options').findAll('.region-option')[1].trigger('tap')
      await wrapper.find('.region-confirm').trigger('tap')
      expect(wrapper.emitted('apply')?.at(-1)).toEqual([{ countryCode: country.code, cityCode: city.code, districtCode: city.districts[0].code }])
    }
  }
  wrapper.unmount()
})

it('取消草稿后再次打开恢复已确认地区，选择不限后确认才能解除筛选', async () => {
  const wrapper = setup()
  await wrapper.setProps({ modelValue: true })
  await wrapper.findAll('.region-option').find(item => item.text() === '不限')!.trigger('tap')
  await wrapper.setProps({ modelValue: false })
  expect(wrapper.emitted('apply')).toBeUndefined()
  await wrapper.setProps({ modelValue: true })
  expect(wrapper.findAll('.region-option.active').map(item => item.text())).toEqual(['越南', '胡志明市', '第一郡'])
  await wrapper.findAll('.region-option').find(item => item.text() === '不限')!.trigger('tap')
  await wrapper.find('.region-confirm').trigger('tap')
  expect(wrapper.text()).toContain('不限城市')
  expect(wrapper.text()).toContain('不限区域')
  expect(wrapper.text()).toContain('默认排序')
  expect(wrapper.text()).not.toContain('重置')
  expect(wrapper.emitted('apply')?.[0]).toEqual([{ countryCode: '', cityCode: '', districtCode: '' }])
  wrapper.unmount()
})
