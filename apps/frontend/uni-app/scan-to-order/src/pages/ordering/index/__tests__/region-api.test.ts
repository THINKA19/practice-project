/** 地区边界与实际业务 Mock 请求契约。 */
import { afterEach, expect, it, vi } from 'vitest'
import { normalizeRegionSelection, toShopRegions } from '../models/region-mappers'

afterEach(() => vi.unstubAllEnvs())

it('通过现有请求链获取开放地区树，编码可用于门店筛选', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { shopApi } = await import('../api/shop.api')
  const regions = toShopRegions(await shopApi.regions())
  expect(regions.length).toBeGreaterThan(0)
  const country = regions[0]
  const city = country.cities[0]
  const area = city.districts[0]
  const rows = await shopApi.fetchShops({ countryCode: country.code, cityCode: city.code, districtCode: area.code })
  expect(rows.length).toBeGreaterThan(0)
  expect(rows.every(shop => shop.districtCode === area.code)).toBe(true)
  expect(uni.request).not.toHaveBeenCalled()
}, 30000)

it('拒绝非法结构与重复编码，允许后台没有开放地区', () => {
  expect(toShopRegions([])).toEqual([])
  expect(() => toShopRegions(null)).toThrow('格式错误')
  expect(() => toShopRegions([{ code: 'VN', name: '越南' }])).toThrow('格式错误')
  expect(() => toShopRegions([{ code: 'VN', name: '越南', cities: [{ code: 'VN', name: '重复', districts: [] }] }])).toThrow('格式错误')
  expect(normalizeRegionSelection([], { countryCode: 'VN', cityCode: 'old', districtCode: 'old' })).toEqual({ countryCode: '', cityCode: '', districtCode: '' })
})
