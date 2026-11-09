import { shops } from '@/pages/ordering/index/mock'
import { afterEach, expect, it, vi } from 'vitest'
import { categories, createGoodsDetail, goods } from '../fixtures/goods'
import { toGoodsDetail } from '../../models/goods.mappers'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('@/pages/auth/session', async original => ({ ...await original<typeof import('@/pages/auth/session')>(), getAuthorizationHeaders: () => ({ Authorization: 'Bearer wx-demo-session-ordering' }) }))

vi.mock('@/utils/toLoginPage', () => ({ toLoginPage: vi.fn() }))
afterEach(() => vi.unstubAllEnvs())

it('模型映射隔离可修改的规格和商品快照', () => {
  const dto = createGoodsDetail(102)!
  const model = toGoodsDetail(dto)
  model.basicInfo.name = 'changed'
  model.properties![0].childsCurGoods[0].name = 'changed'
  expect(dto.basicInfo.name).toBe('鲜柠茶')
  expect(dto.properties![0].childsCurGoods[0].name).toBe('标准杯')
})

it('现有请求客户端通过已登记 Mock 查询详情、分页、空列表和规格价', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { catalogApi } = await import('../../api/catalog.api')
  const first = await catalogApi.goodsList({ page: 1, pageSize: 1 })
  const second = await catalogApi.goodsList({ page: 2, pageSize: 1 })
  expect(first.totalRow).toBe(goods.length)
  expect(second.result[0].id).not.toBe(first.result[0].id)
  expect((await catalogApi.goodsList({ nameLike: '不存在' })).result).toEqual([])
  expect((await catalogApi.goodsDetail(102)).properties).toHaveLength(1)
  expect((await catalogApi.goodsPrice(102, '1:12,')).price).toBe(15)
  await expect(catalogApi.goodsDetail(999)).rejects.toThrow('商品不存在')
  expect(uni.request).not.toHaveBeenCalled()
}, 20000)

it('门店和支付能力复用登记路径，支付不会返回伪造成功', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { shopApi } = await import('../../../index/api/shop.api')
  const { paymentApi } = await import('../../../menu-pay/api/payment.api')
  expect(await shopApi.fetchShops({ nameLike: '不存在' })).toEqual([])
  expect((await shopApi.detail(1)).info.name).toBe('福记饭店')
  expect(await paymentApi.payBillDiscounts()).toEqual(expect.arrayContaining([expect.objectContaining({ consume: 100, discounts: 12 })]))
  await expect(paymentApi.wxpay({ money: 88 })).rejects.toThrow('不创建真实微信支付单')
  await expect(paymentApi.payBill(88)).rejects.toThrow('不扣除真实余额')
}, 20000)

it('四类菜单提供足量商品与真实存在的本地图片，分类分页保持隔离', async () => {
  expect(categories).toHaveLength(7)
  const genericCategories = categories.filter(category => category.id < 1000)
  expect(new Set(goods.map(item => item.id)).size).toBe(goods.length)
  for (const category of genericCategories) {
    const items = goods.filter(item => item.categoryId === category.id)
    expect(items.length).toBeGreaterThanOrEqual(6)
    for (const item of items) {
      expect(fs.existsSync(path.resolve(item.pic.replace(/^\//, '')))).toBe(true)
      expect(createGoodsDetail(item.id)?.pics?.[0].pic).toBe(item.pic)
    }
  }
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { catalogApi } = await import('../../api/catalog.api')
  for (const category of genericCategories) {
    const page = await catalogApi.goodsList({ categoryId: category.id, page: 1, pageSize: 5 })
    expect(page.result).toHaveLength(5)
    expect(page.result.every(item => item.categoryId === category.id)).toBe(true)
    expect(page.totalRow).toBe(goods.filter(item => item.categoryId === category.id).length)
  }
}, 20000)

it('全部门店拥有独立菜单，各国分类、详情、规格和未知门店空数据保持一致', async () => {
  for (const shop of shops) {
    const menu = goods.filter(item => item.shopId === shop.id)
    expect(menu.length).toBe(shop.id === 100 ? 6 : 36)
    expect(new Set(menu.map(item => item.categoryId)).size).toBe(shop.id === 100 ? 3 : 4)
    for (const item of menu)
      expect(createGoodsDetail(item.id)?.basicInfo.shopId).toBe(shop.id)
  }
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { catalogApi } = await import('../../api/catalog.api')
  for (const country of ['VN', 'LA', 'TH']) {
    const shop = shops.find(item => item.countryCode === country && item.id !== 1)!
    expect(await catalogApi.categories(String(shop.id))).toHaveLength(shop.id === 100 ? 3 : 4)
    const response = await catalogApi.goodsList({ shopId: String(shop.id), pageSize: 100 })
    expect(response.result).toHaveLength(shop.id === 100 ? 6 : 36)
    expect(response.result.every(item => item.shopId === shop.id)).toBe(true)
    const sku = response.result.find(item => item.propertyIds)!
    const detail = await catalogApi.goodsDetail(sku.id)
    expect(detail.basicInfo.shopId).toBe(shop.id)
    const options = detail.properties!.map(group => `${group.id}:${group.childsCurGoods[0].id}`).join(',')
    expect((await catalogApi.goodsPrice(sku.id, options)).price).toBe(sku.minPrice)
    expect(await catalogApi.goodsAddition(sku.id)).not.toEqual([])
  }
  expect(await catalogApi.categories('99999')).toEqual([])
  expect((await catalogApi.goodsList({ shopId: '99999' })).result).toEqual([])
}, 20000)

it('莲香米粉通过正式请求链核价，区分口味条目并拒绝其他商品加料', async () => {
  vi.resetModules()
  vi.stubEnv('DEV', true)
  vi.stubEnv('VITE_USE_MOCK', 'true')
  const { catalogApi } = await import('../../api/catalog.api')
  const { cartApi } = await import('../../../menu-cart/api/cart.api')
  const type = 'noodle-contract'
  await cartApi.empty(type)
  const options = [{ optionId: 101, optionValueId: 1013 }, { optionId: 102, optionValueId: 1022 }, { optionId: 103, optionValueId: 1031 }]
  expect((await catalogApi.goodsPrice(100901, '101:1013,102:1022,103:1031')).price).toBe(6.8)
  const request = { goodsId: 100901, number: 2, sku: JSON.stringify(options), addition: JSON.stringify([{ pid: 100, id: 1001 }]) }
  let cart = await cartApi.add(request, type)
  expect(cart.items).toHaveLength(1)
  expect(cart.items[0]).toMatchObject({ shopId: 100, price: 7.3, number: 2 })
  expect(cart.items[0].sku).toEqual(expect.arrayContaining([expect.objectContaining({ optionValueName: '大份' })]))
  cart = await cartApi.add({ ...request, number: 1 }, type)
  expect(cart.items).toHaveLength(1)
  expect(cart.items[0].number).toBe(3)
  options[1].optionValueId = 1021
  cart = await cartApi.add({ ...request, number: 1, sku: JSON.stringify(options) }, type)
  expect(cart.items).toHaveLength(2)
  await expect(cartApi.add({ ...request, addition: JSON.stringify([{ pid: 1, id: 1 }]) }, type)).rejects.toThrow('无效或重复加料')
  await cartApi.empty(type)
}, 20000)
