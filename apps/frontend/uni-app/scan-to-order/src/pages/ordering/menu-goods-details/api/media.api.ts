/**
 * ============================================================================
 * 【文件概述】商品视频与分享码请求；只声明当前页面所需协议，真实后端待对接。
 * 【方法与导出清单】goodsMediaApi：视频信息和微信商品分享码。
 * 【综合使用示例】import { goodsMediaApi } from '@/pages/ordering/menu-goods-details'; await goodsMediaApi.videoDetail('video-id')
 * ============================================================================
 */
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

/**
 * goodsMediaApi：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { goodsMediaApi } from '@/pages/ordering/menu-goods-details/api/media.api'
 * goodsMediaApi.videoDetail // => 读取对应命名能力或配置
 */
export const goodsMediaApi = {
  /**
   * 读取商品视频播放地址；返回原始协议，失败沿用现有请求客户端错误。
   * @param id 目标记录标识。
   * @returns Promise<{ fdMp4?: string }>；转换与业务判断由调用流程完成。
   * @example
   * await goodsMediaApi.videoDetail('demo') // => 后端支持该请求时返回 { fdMp4?: string }
   */
  videoDetail: (id: string) => http.Get<{ fdMp4?: string }>(endpoints.videoDetail, { params: { id }, cacheFor: 0, meta: { ignoreAuth: true } }).send(),
  /**
   * 生成商品分享小程序码；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @returns Promise<string>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof goodsMediaApi.wxaQrcode>[0]
   * await goodsMediaApi.wxaQrcode(data) // => 后端支持该请求时返回 string
   */
  wxaQrcode: (data: { scene: string, page: string, is_hyaline: boolean, autoColor: boolean, expireHours: number }) => http.Post<string>(endpoints.shareCode, data, { cacheFor: 0, meta: { ignoreAuth: true } }).send(),
}
