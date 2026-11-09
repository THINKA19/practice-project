/**
 * ============================================================================
 * 【文件概述】菜单选品 / api/catalog.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - GoodsQuery：数据类型契约。
 * - catalogApi：本文件对外声明。
 * 【综合使用示例】
 * import type { GoodsQuery } from '@/pages/ordering/menu/api/catalog.api'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import type { AdditionGroupDto, CategoryDto, GoodsDetailDto, GoodsListResultDto, SkuPriceResultDto, TimeScheduleDayDto } from './goods.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

/**
 * GoodsQuery 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：page、pageSize、categoryId、nameLike、shopId、orderBy；必填与可选字段见声明。
 * @example
 * import type { GoodsQuery } from '@/pages/ordering/menu/api/catalog.api'
 * declare const response: GoodsQuery
 * const value: GoodsQuery = response // => 保留 GoodsQuery 的字段与取值约束
 */
export interface GoodsQuery { page?: number, pageSize?: number, categoryId?: number | string, nameLike?: string, shopId?: string, orderBy?: string, [k: string]: string | number | undefined }
const publicRead = { cacheFor: 0, meta: { ignoreAuth: true } }
/**
 * 原始请求；门店范围由调用方传入，转换由 models/mappers 负责。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { catalogApi } from '@/pages/ordering/menu/api/catalog.api'
 * catalogApi.categories // => 读取对应命名能力或配置
 */
export const catalogApi = {
  /**
   * 读取门店范围内的商品分类；返回原始协议，失败沿用现有请求客户端错误。
   * @param shopId 当前商品隔离范围的门店标识。
   * @returns Promise<CategoryDto[]>；转换与业务判断由调用流程完成。
   * @example
   * await catalogApi.categories() // => 后端支持该请求时返回 CategoryDto[]
   */
  categories: async (shopId = '') => http.Get<CategoryDto[]>(endpoints.categories, { ...publicRead, params: { shopId } }),
  /**
   * 按筛选条件分页读取商品；返回原始协议，失败沿用现有请求客户端错误。
   * @param query 分页与业务筛选条件。
   * @returns Promise<GoodsListResultDto>；转换与业务判断由调用流程完成。
   * @example
   * declare const query: Parameters<typeof catalogApi.goodsList>[0]
   * await catalogApi.goodsList(query) // => 后端支持该请求时返回 GoodsListResultDto
   */
  goodsList: async (query: GoodsQuery) => http.Post<GoodsListResultDto>(endpoints.goodsList, query, publicRead),
  /**
   * 读取商品详情和规格；返回原始协议，失败沿用现有请求客户端错误。
   * @param id 目标记录标识。
   * @returns Promise<GoodsDetailDto>；转换与业务判断由调用流程完成。
   * @example
   * await catalogApi.goodsDetail(1) // => 后端支持该请求时返回 GoodsDetailDto
   */
  goodsDetail: async (id: string | number) => http.Get<GoodsDetailDto>(endpoints.goodsDetail, { ...publicRead, params: { id } }),
  /**
   * 读取选中规格的服务端报价；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @param propertyChildIds 已选规格组合串。
   * @returns Promise<SkuPriceResultDto>；转换与业务判断由调用流程完成。
   * @example
   * await catalogApi.goodsPrice(1, '1:11') // => 后端支持该请求时返回 SkuPriceResultDto
   */
  goodsPrice: async (goodsId: number, propertyChildIds: string) => http.Post<SkuPriceResultDto>(endpoints.goodsPrice, { goodsId, propertyChildIds }, publicRead),
  /**
   * 按完整协议参数读取服务端报价；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @returns Promise<SkuPriceResultDto>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof catalogApi.goodsPriceV2>[0]
   * await catalogApi.goodsPriceV2(data) // => 后端支持该请求时返回 SkuPriceResultDto
   */
  goodsPriceV2: async (data: Record<string, unknown>) => http.Post<SkuPriceResultDto>(endpoints.goodsPrice, data, publicRead),
  /**
   * 读取商品可选加料；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @returns Promise<AdditionGroupDto[] | null>；转换与业务判断由调用流程完成。
   * @example
   * await catalogApi.goodsAddition(1) // => 后端支持该请求时返回 AdditionGroupDto[] | null
   */
  goodsAddition: async (goodsId: number | string) => http.Get<AdditionGroupDto[] | null>(endpoints.goodsAddition, { ...publicRead, params: { goodsId } }),
  /**
   * 读取商品可售日期和时段；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @param propertyChildIds 已选规格组合串。
   * @param brandId 品牌筛选标识。
   * @param categoryId 分类筛选标识。
   * @returns Promise<TimeScheduleDayDto[] | null>；转换与业务判断由调用流程完成。
   * @example
   * await catalogApi.timesSchedule(1) // => 后端支持该请求时返回 TimeScheduleDayDto[] | null
   */
  timesSchedule: async (goodsId: number | string, propertyChildIds = '', brandId = '', categoryId = '') => http.Post<TimeScheduleDayDto[] | null>(endpoints.timesSchedule, { goodsId, propertyChildIds, brandId, categoryId }, publicRead),
}
