/**
 * ============================================================================
 * 【文件概述】商品详情 / api/endpoints.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - endpoints：本文件对外声明。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/ordering/menu-goods-details/api/endpoints'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 商品详情专属接口路径。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { endpoints } from '@/pages/ordering/menu-goods-details/api/endpoints'
 * endpoints // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const endpoints = {
  videoDetail: '/ordering/goods/video',
  shareCode: '/ordering/goods/share-code',
  kanjiaSet: '/shop/goods/kanjia/set/v2',
  kanjiaJoin: '/shop/goods/kanjia/join',
  kanjiaDetail: '/shop/goods/kanjia/info',
  kanjiaHelp: '/shop/goods/kanjia/help',
  kanjiaMyHelp: '/shop/goods/kanjia/myHelp',
} as const
