/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / api/shop.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - FetchShopsQuery：数据类型契约。
 * - shopApi：本文件对外声明。
 * 【综合使用示例】
 * import type { FetchShopsQuery } from '@/pages/ordering/index/api/shop.api'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import type { DistanceDto, ShopDetailDto, ShopDto, TableSessionDto } from './shop.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { ShopCategory } from '../models/types'

/**
 * FetchShopsQuery 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：curlatitude、curlongitude、nameLike、countryCode、cityCode、districtCode、pageSize、page；必填与可选字段见声明。
 * @example
 * import type { FetchShopsQuery } from '@/pages/ordering/index/api/shop.api'
 * declare const response: FetchShopsQuery
 * const value: FetchShopsQuery = response // => 保留 FetchShopsQuery 的字段与取值约束
 */
export interface FetchShopsQuery { category?: ShopCategory, capability?: 'table-booking', curlatitude?: number, curlongitude?: number, nameLike?: string, countryCode?: string, cityCode?: string, districtCode?: string, pageSize?: number, page?: number, [k: string]: string | number | undefined }
const publicRead = { cacheFor: 0, meta: { ignoreAuth: true } }
/**
 * shopApi：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { shopApi } from '@/pages/ordering/index/api/shop.api'
 * shopApi.fetchShops // => 读取对应命名能力或配置
 */
export const shopApi = {
  /** 获取顾客收藏。无参数。@returns Promise<unknown>，模型层验证 ID 数组；失败抛错。@example await shopApi.favorites() // => 后端支持时返回收藏 ID 数组 */
  favorites: async () => http.Get<unknown>(endpoints.favorites, { ...publicRead, headers: getAuthorizationHeaders('customer') }),
  /** 幂等设置收藏。@param shopId 门店 ID。@param favorite 是否收藏。@returns Promise<unknown>，服务端完整收藏 ID 数组待校验。@example await shopApi.setFavorite(1, true) // => 后端确认后的 ID 数组 */
  setFavorite: async (shopId: number, favorite: boolean) => http.Post<unknown>(endpoints.favorites, { shopId, favorite }, { ...publicRead, headers: getAuthorizationHeaders('customer') }),
  /** 获取后台已开放地区；服务端负责开放规则与排序。无参数。@returns 待边界校验的地区树。@example await shopApi.regions() */
  regions: async () => http.Get<unknown>(endpoints.regions, publicRead),
  /**
   * 按关键词与地区分页读取门店；返回原始协议，失败沿用现有请求客户端错误。
   * @param query 分页与业务筛选条件。
   * @returns Promise<ShopDto[]>；转换与业务判断由调用流程完成。
   * @example
   * declare const query: Parameters<typeof shopApi.fetchShops>[0]
   * await shopApi.fetchShops(query) // => 后端支持该请求时返回 ShopDto[]
   */
  fetchShops: async (query: FetchShopsQuery) => http.Post<ShopDto[]>(endpoints.fetchShops, query, query.category === 'favorites' ? { ...publicRead, headers: getAuthorizationHeaders('customer') } : publicRead),
  /**
   * 读取指定记录的详情；返回原始协议，失败沿用现有请求客户端错误。
   * @param id 目标记录标识。
   * @returns Promise<ShopDetailDto>；转换与业务判断由调用流程完成。
   * @example
   * await shopApi.detail(1) // => 后端支持该请求时返回 ShopDetailDto
   */
  detail: async (id: string | number) => http.Get<ShopDetailDto>(endpoints.detail, { ...publicRead, params: { id } }),
  /**
   * 通过桌台密钥换取服务端桌台会话；返回原始协议，失败沿用现有请求客户端错误。
   * @param tableId 桌台标识。
   * @param key 购物车条目标识或桌台校验密钥，不能用商品 ID 代替。
   * @returns Promise<TableSessionDto>；转换与业务判断由调用流程完成。
   * @example
   * await shopApi.cyTableToken('demo', 'cart-item-key') // => 后端支持该请求时返回 TableSessionDto
   */
  cyTableToken: async (tableId: string, key: string) => http.Post<TableSessionDto>(endpoints.cyTableToken, { id: tableId, k: key }, publicRead),
  /**
   * 读取自提门店列表；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @returns Promise<ShopDto[] | { result?: ShopDto[] }>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof shopApi.pickPoints>[0]
   * await shopApi.pickPoints(data) // => 后端支持该请求时返回 ShopDto[] | { result?: ShopDto[] }
   */
  pickPoints: async (data: Record<string, unknown>) => http.Post<ShopDto[] | { result?: ShopDto[] }>(endpoints.pickPoints, data, { cacheFor: 0 }),
  /**
   * 请求服务端计算两点距离；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @returns Promise<DistanceDto>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof shopApi.gpsDistance>[0]
   * await shopApi.gpsDistance(data) // => 后端支持该请求时返回 DistanceDto
   */
  gpsDistance: async (data: Record<string, unknown>) => http.Post<DistanceDto>(endpoints.gpsDistance, data, publicRead),
}
