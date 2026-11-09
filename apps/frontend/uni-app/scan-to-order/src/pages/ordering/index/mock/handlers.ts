/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / mock/handlers.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { shops } from './fixtures/shop'
import { shopRegions } from './fixtures/regions'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { favoriteAccount } from './favorites'
import { visiblePromotions } from '../domain/promotion.rules'

export default defineMock({
  [`[GET]${endpoints.favorites}`]: withFailure(({ headers }) => {
    try {
      return ok([...favoriteAccount(headers.Authorization).ids()])
    }
    catch { return fail('请先登录顾客账号', 401) }
  }),
  [`[POST]${endpoints.favorites}`]: withFailure(({ headers, data }) => {
    try {
      const account = favoriteAccount(headers.Authorization)
      const body = data as { shopId?: number, favorite?: boolean }
      if (!shops.some(shop => shop.id === body.shopId) || typeof body.favorite !== 'boolean')
        return fail('门店或收藏参数无效')
      const next = account.ids().filter(id => id !== body.shopId)
      if (body.favorite)
        next.push(body.shopId!)
      account.set(next)
      return ok([...next])
    }
    catch { return fail('请先登录顾客账号', 401) }
  }, { write: true }),
  // 模拟后台只开放已有可展示门店的地区；页面不直接引用样本。
  [`[GET]${endpoints.regions}`]: withFailure(() => ok(shopRegions.map(country => ({
    ...country,
    cities: country.cities.map(city => ({
      ...city,
      districts: city.districts.filter(area => shops.some(shop => shop.countryCode === country.code && shop.cityCode === city.code && shop.districtCode === area.code)),
    })).filter(city => city.districts.length),
  })).filter(country => country.cities.length))),
  [`[POST]${endpoints.fetchShops}`]: withFailure(({ data, headers }) => {
    const q = data as { category?: string, capability?: string, nameLike?: string, countryCode?: string, cityCode?: string, districtCode?: string, page?: number, pageSize?: number }
    let favorites: number[] = []
    if (q.category === 'favorites') {
      try {
        favorites = favoriteAccount(headers.Authorization).ids()
      }
      catch { return fail('请先登录顾客账号', 401) }
    }

    const keyword = (q.nameLike ?? '').trim().toLocaleLowerCase()
    const rows = shops.filter(s => (!q.countryCode || s.countryCode === q.countryCode)
      && (q.capability !== 'table-booking' || s.id % 2 === 1)
      && (q.category !== 'favorites' || favorites.includes(s.id))
      && (q.category !== 'promotions' || visiblePromotions(s).length > 0)
      && (!q.cityCode || s.cityCode === q.cityCode)
      && (!q.districtCode || s.districtCode === q.districtCode)
      && `${s.name} ${s.address ?? ''}`.toLocaleLowerCase().includes(keyword))

    const size = Math.max(1, Number(q.pageSize) || 20)

    const page = Math.max(1, Number(q.page) || 1)

    return ok(structuredClone(rows.slice((page - 1) * size, page * size).map(shop => ({ ...shop, promotions: visiblePromotions(shop) }))))
  }),
  [`[GET]${endpoints.detail}`]: withFailure(({ query }) => {
    const shop = shops.find(s => s.id === Number(query.id))
    const country = shopRegions.find(item => item.code === shop?.countryCode)
    const city = country?.cities.find(item => item.code === shop?.cityCode)
    const district = city?.districts.find(item => item.code === shop?.districtCode)

    return shop ? ok({ info: { ...structuredClone(shop), promotions: visiblePromotions(shop), countryName: country?.name, cityName: city?.name, districtName: district?.name }, extJson: {} }) : fail('门店不存在', 404)
  }),
  [`[POST]${endpoints.pickPoints}`]: withFailure(() => ok({ result: structuredClone(shops.map(shop => ({ ...shop, promotions: visiblePromotions(shop) }))) })),
  [`[POST]${endpoints.gpsDistance}`]: withFailure(() => ok({ result: { rows: [{ elements: [{ distance: 1200 }] }] } })),
  [`[POST]${endpoints.cyTableToken}`]: withFailure(() => fail('演示桌台不能签发登录凭证，请使用演示登录'), { write: true }),
})
