/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / api/cart.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - cartApi：本文件对外声明。
 * 【综合使用示例】
 * import { cartApi } from '@/pages/ordering/menu-cart/api/cart.api'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { getAuthorizationHeaders } from '@/pages/auth/session'
import type { AddCartRequestDto, CartInfoDto } from './cart.dto'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'
/**
 * 请求层只发送原始协议字段。SKU 序列化由模型 mapper 完成。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { cartApi } from '@/pages/ordering/menu-cart/api/cart.api'
 * cartApi.info // => 读取对应命名能力或配置
 */
export const cartApi = {
  /**
   * 读取购物车原始快照；返回原始协议，失败沿用现有请求客户端错误。
   * @param type 购物车业务类型，默认空字符串。
   * @returns Promise<CartInfoDto | null>；转换与业务判断由调用流程完成。
   * @example
   * await cartApi.info() // => 后端支持该请求时返回 CartInfoDto | null
   */
  info: async (type = '') => http.Get<CartInfoDto | null>(endpoints.info, { cacheFor: 0, params: { type }, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } }),
  /**
   * 提交已序列化的加购请求；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @param type 购物车业务类型，默认空字符串。
   * @returns Promise<CartInfoDto>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof cartApi.add>[0]
   * await cartApi.add(data) // => 后端支持该请求时返回 CartInfoDto
   */
  add: async (data: AddCartRequestDto, type = '') => http.Post<CartInfoDto>(endpoints.add, { ...data, type }, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } }),
  /**
   * 更新服务端购物车条目数量；返回原始协议，失败沿用现有请求客户端错误。
   * @param key 购物车条目标识或桌台校验密钥，不能用商品 ID 代替。
   * @param number 目标商品数量，须符合库存与起购约束。
   * @param type 购物车业务类型，默认空字符串。
   * @returns Promise<CartInfoDto>；转换与业务判断由调用流程完成。
   * @example
   * await cartApi.modifyNumber('cart-item-key', 1) // => 后端支持该请求时返回 CartInfoDto
   */
  modifyNumber: async (key: string, number: number, type = '') => http.Post<CartInfoDto>(endpoints.modifyNumber, { key, number, type }, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } }),
  /**
   * 删除服务端购物车条目；返回原始协议，失败沿用现有请求客户端错误。
   * @param key 购物车条目标识或桌台校验密钥，不能用商品 ID 代替。
   * @param type 购物车业务类型，默认空字符串。
   * @returns Promise<CartInfoDto | null>；转换与业务判断由调用流程完成。
   * @example
   * await cartApi.remove('cart-item-key') // => 后端支持该请求时返回 CartInfoDto | null
   */
  remove: async (key: string, type = '') => http.Post<CartInfoDto | null>(endpoints.remove, { key, type }, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } }),
  /**
   * 清空当前购物车；返回原始协议，失败沿用现有请求客户端错误。
   * @param type 购物车业务类型，默认空字符串。
   * @returns Promise<null>；转换与业务判断由调用流程完成。
   * @example
   * await cartApi.empty() // => 后端支持该请求时返回 null
   */
  empty: async (type = '') => http.Post<null>(endpoints.empty, { type }, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } }),
}
