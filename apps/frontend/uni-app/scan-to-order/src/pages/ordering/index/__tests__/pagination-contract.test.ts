import fs from 'node:fs'
import path from 'node:path'
import { expect, it, vi } from 'vitest'
import { shops } from '../mock/fixtures/shop'
import type { ShopDto } from '../api/shop.dto'

it('二十六家门店按六条请求加载，无重复，并支持国家、城市、地址和空结果', async () => {
  expect(shops).toHaveLength(26)
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { shopApi } = await import('../api/shop.api')
  const rows: ShopDto[] = []
  for (let page = 1; page <= 5; page++) {
    const batch = await shopApi.fetchShops({ page, pageSize: 6 })
    expect(batch).toHaveLength(page === 5 ? 2 : 6)
    rows.push(...batch)
  }
  expect(new Set(rows.map(item => item.id)).size).toBe(26)
  const thailand = await shopApi.fetchShops({ countryCode: 'TH', page: 1, pageSize: 6 })
  expect(thailand).toHaveLength(6)
  expect(thailand.every(item => item.countryCode === 'TH')).toBe(true)
  const city = await shopApi.fetchShops({ countryCode: 'VN', cityCode: 'VN-SGN', nameLike: '示范路 2', page: 1, pageSize: 6 })
  expect(city).toHaveLength(1)
  expect(city[0].cityCode).toBe('VN-SGN')
  expect(await shopApi.fetchShops({ countryCode: 'TH', cityCode: 'VN-SGN', page: 1, pageSize: 6 })).toEqual([])
  const district = await shopApi.fetchShops({ countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1', page: 1, pageSize: 6 })
  // 福记演示店已补齐地区；同一区域应同时返回原店与生成样本。
  expect(district.map(item => item.id).sort((a, b) => a - b)).toEqual([1, 100])
  expect(district.every(item => item.districtCode === 'VN-SGN-1')).toBe(true)
  expect(uni.request).not.toHaveBeenCalled()
}, 30000)

it('门店封面使用存在的本地图片，旧门店标识保持稳定', () => {
  expect(shops[0].id).toBe(1)
  expect(shops[0].name).toBe('福记饭店')
  for (const shop of shops)
    expect(fs.existsSync(path.resolve('src', shop.pic!.replace(/^\//, '')))).toBe(true)
})
