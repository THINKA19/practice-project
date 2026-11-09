/**
 * ============================================================================
 * 【文件概述】商品详情 / api/kanjia.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - kanjiaApi：本文件对外声明。
 * 【综合使用示例】
 * import { kanjiaApi } from '@/pages/ordering/menu-goods-details/api/kanjia.api'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { endpoints } from './endpoints'
import type { KanjiaInfoDto, KanjiaSetDto } from './kanjia.dto'

import { http } from '@/http/alova'

/**
 * kanjiaApi：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { kanjiaApi } from '@/pages/ordering/menu-goods-details/api/kanjia.api'
 * kanjiaApi // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const kanjiaApi = {

  /**
   * 读取商品活动配置；返回原始协议，失败沿用现有请求客户端错误。
   * @param goodsId 商品标识。
   * @returns Alova Method<KanjiaSetDto[]>；转换与业务判断由调用流程完成。
   * @example
   * await kanjiaApi.set(1) // => 后端支持该请求时返回 KanjiaSetDto[]
   */
  set(goodsId: number | string) {
    return http.Get<KanjiaSetDto[]>(endpoints.kanjiaSet, { cacheFor: 0, meta: { ignoreAuth: true }, params: { goodsId } })
  },

  /**
   * 提交参加活动请求；返回原始协议，失败沿用现有请求客户端错误。
   * @param kjid 砍价活动标识。
   * @returns Alova Method<unknown>；转换与业务判断由调用流程完成。
   * @example
   * await kanjiaApi.join(1) // => 后端支持该请求时返回 unknown
   */
  join(kjid: number | string) {
    return http.Post<unknown>(endpoints.kanjiaJoin, { kjid })
  },

  /**
   * 读取指定记录的详情；返回原始协议，失败沿用现有请求客户端错误。
   * @param kjid 砍价活动标识。
   * @param joiner 砍价参与者标识。
   * @returns Alova Method<KanjiaInfoDto>；转换与业务判断由调用流程完成。
   * @example
   * await kanjiaApi.detail(1, 1) // => 后端支持该请求时返回 KanjiaInfoDto
   */
  detail(kjid: number | string, joiner: number | string) {
    return http.Get<KanjiaInfoDto>(endpoints.kanjiaDetail, { cacheFor: 0, meta: { ignoreAuth: true }, params: { kjid, joiner } })
  },

  /**
   * 提交砍价助力请求；返回原始协议，失败沿用现有请求客户端错误。
   * @param kjid 砍价活动标识。
   * @param joinerUser 被助力用户标识。
   * @param remark 随请求提交的活动备注。
   * @returns Alova Method<unknown>；转换与业务判断由调用流程完成。
   * @example
   * await kanjiaApi.help(1, 1) // => 后端支持该请求时返回 unknown
   */
  help(kjid: number | string, joinerUser: number | string, remark = '') {
    return http.Post<unknown>(endpoints.kanjiaHelp, { kjid, joinerUser, remark })
  },

  /**
   * 读取当前用户的砍价助力记录；返回原始协议，失败沿用现有请求客户端错误。
   * @param kjid 砍价活动标识。
   * @param joinerUser 被助力用户标识。
   * @returns Alova Method<unknown>；转换与业务判断由调用流程完成。
   * @example
   * await kanjiaApi.myHelp(1, 1) // => 后端支持该请求时返回 unknown
   */
  myHelp(kjid: number | string, joinerUser: number | string) {
    return http.Get<unknown>(endpoints.kanjiaMyHelp, { cacheFor: 0, params: { kjid, joinerUser } })
  },
}
