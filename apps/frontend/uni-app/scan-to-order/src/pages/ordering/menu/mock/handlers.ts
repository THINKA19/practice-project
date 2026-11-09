/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/handlers.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { categories, createGoodsDetail, goods, goodsAdditions, quoteMockSku, schedule } from './fixtures/goods'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.categories}`]: withFailure(({ query }) => {
    const scope = query.shopId ? String(query.shopId).split(',') : null
    const available = new Set(goods.filter(item => !scope || scope.includes(String(item.shopId))).map(item => item.categoryId))
    return ok(structuredClone(categories.filter(item => available.has(item.id))))
  }),
  [`[POST]${endpoints.goodsList}`]: withFailure(({ data }) => {
    const q = data as { categoryId?: string | number, shopId?: string, nameLike?: string, k?: string, page?: number, pageSize?: number, orderBy?: string }

    const search = q.nameLike ?? q.k ?? ''

    const rows = goods.filter(g => (!q.categoryId || g.categoryId === Number(q.categoryId)) && (!q.shopId || q.shopId.split(',').includes(String(g.shopId))) && g.name.includes(search))

    if (q.orderBy === 'priceUp')
      rows.sort((a, b) => a.minPrice - b.minPrice)

    if (q.orderBy === 'ordersDown')
      rows.sort((a, b) => (b.numberSells ?? 0) - (a.numberSells ?? 0))

    const size = Math.max(1, Number(q.pageSize) || 20)

    const page = Math.max(1, Number(q.page) || 1)

    return ok({ result: structuredClone(rows.slice((page - 1) * size, page * size)), totalRow: rows.length, totalPage: Math.ceil(rows.length / size) })
  }),
  [`[GET]${endpoints.goodsDetail}`]: withFailure(({ query }) => {
    const detail = createGoodsDetail(Number(query.id))

    return detail ? ok(detail) : fail('商品不存在', 404)
  }),
  [`[POST]${endpoints.goodsPrice}`]: withFailure(({ data }) => {
    const q = data as { goodsId?: number, propertyChildIds?: string }

    const item = goods.find(g => g.id === Number(q.goodsId))

    if (!item)
      return fail('商品不存在', 404)
    const price = quoteMockSku(item.id, q.propertyChildIds)
    return price === null ? fail('商品规格无效') : ok({ price, originalPrice: item.originalPrice, stores: item.stores, score: 0 })
  }),
  [`[GET]${endpoints.goodsAddition}`]: withFailure(({ query }) => ok(structuredClone(goodsAdditions(Number(query.goodsId))))),
  [`[POST]${endpoints.timesSchedule}`]: withFailure(() => ok(structuredClone(schedule))),
  [`[GET]${endpoints.pingtuanSet}`]: withFailure(({ query }) => ok({ goodsId: Number(query.goodsId), numberOrder: 2, timeoutHours: 24 })),
  [`[GET]${endpoints.pingtuanJoinUsers}`]: withFailure(() => ok([])),
  [`[POST]${endpoints.pingtuanOpen}`]: withFailure(() => fail('演示环境未开放真实拼团'), { write: true }),
})
