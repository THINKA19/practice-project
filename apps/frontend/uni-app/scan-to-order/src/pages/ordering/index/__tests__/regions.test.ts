import { expect, it } from 'vitest'
import { shopRegions } from '../mock/fixtures/regions'

it('三国每个目的地都有独立的区域内容，不再用同一套通用占位项补齐', () => {
  expect(shopRegions.map(country => country.code)).toEqual(['VN', 'TH', 'LA'])
  const codes: string[] = []
  const lists: string[] = []
  for (const country of shopRegions) {
    expect(country.cities).toHaveLength(10)
    for (const city of country.cities) {
      expect(city.districts.length).toBeGreaterThanOrEqual(3)
      lists.push(city.districts.map(area => area.name).join('|'))
      for (const area of city.districts) {
        codes.push(area.code)
        expect(area.code.startsWith(`${city.code}-`)).toBe(true)
        expect(area.code).not.toContain('-AREA-')
        expect(area.name).not.toMatch(/中心商圈|北部片区|南部片区|东部片区|西部片区|车站周边|大学周边|商业街区/)
      }
    }
  }
  expect(new Set(codes).size).toBe(codes.length)
  expect(new Set(lists).size).toBe(30)
})

it.each([
  ['VN-HUE', '顺化皇城周边'],
  ['VN-NTR', '陈富海滨'],
  ['VN-DLT', '春香湖周边'],
  ['VN-VTU', '前滩（Bai Truoc）'],
  ['VN-PQC', '阳东（Duong Dong）'],
  ['TH-USM', '查汶海滩'],
  ['LA-PKZ', '道亨市场周边'],
])('%s 提供对应目的地的区域 %s', (cityCode, name) => {
  const city = shopRegions.flatMap(country => country.cities).find(city => city.code === cityCode)
  expect(city?.districts.map(area => area.name)).toContain(name)
})
