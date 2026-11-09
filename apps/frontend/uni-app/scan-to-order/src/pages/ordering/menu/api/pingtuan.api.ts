/**
 * ============================================================================
 * 【文件概述】菜单选品 / api/pingtuan.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - pingtuanApi：本文件对外声明。
 * 【综合使用示例】
 * import { pingtuanApi } from '@/pages/ordering/menu/api/pingtuan.api'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { endpoints } from './endpoints'
import type { PingtuanJoinerDto, PingtuanOpenDto, PingtuanSetDto } from './goods.dto'
import { http } from '@/http/alova'

/**
 * pingtuanApi：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { pingtuanApi } from '@/pages/ordering/menu/api/pingtuan.api'
 * pingtuanApi // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const pingtuanApi = {

  /**
   * 读取商品活动配置；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @returns Alova Method<PingtuanSetDto>；转换与业务判断由调用流程完成。
   * @example
   * await pingtuanApi.set(1) // => 后端支持该请求时返回 PingtuanSetDto
   */
  set(goodsId: number | string) {
    return http.Get<PingtuanSetDto>(endpoints.pingtuanSet, { cacheFor: 0, meta: { ignoreAuth: true }, params: { goodsId } })
  },

  /**
   * 发起商品拼团；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @param extJsonStr 活动扩展 JSON 文本。
   * @returns Alova Method<PingtuanOpenDto>；转换与业务判断由调用流程完成。
   * @example
   * await pingtuanApi.open(1) // => 后端支持该请求时返回 PingtuanOpenDto
   */
  open(goodsId: number | string, extJsonStr = '') {
    return http.Post<PingtuanOpenDto>(endpoints.pingtuanOpen, { goodsId, extJsonStr }, { cacheFor: 0 })
  },

  /**
   * 读取拼团参与者；返回原始协议，失败沿用现有请求客户端错误。
   * @param tuanId 拼团活动标识。
   * @returns Alova Method<PingtuanJoinerDto[]>；转换与业务判断由调用流程完成。
   * @example
   * await pingtuanApi.joinUsers(1) // => 后端支持该请求时返回 PingtuanJoinerDto[]
   */
  joinUsers(tuanId: number | string) {
    return http.Get<PingtuanJoinerDto[]>(endpoints.pingtuanJoinUsers, { cacheFor: 0, meta: { ignoreAuth: true }, params: { tuanId } })
  },
}
