/**
 * ============================================================================
 * 【文件概述】菜单选品 / api/endpoints.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - endpoints：本文件对外声明。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/ordering/menu/api/endpoints'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 后端路径清单；网关由接口函数显式选择。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { endpoints } from '@/pages/ordering/menu/api/endpoints'
 * endpoints // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const endpoints = {
  notice: '/ordering/notice',
  /** 查询商品分类；main 网关。 */
  categories: '/shop/goods/category/all',
  /** 查询商品列表；main 网关。 */
  goodsList: '/shop/goods/list/v2',
  /** 查询商品详情；main 网关。 */
  goodsDetail: '/shop/goods/detail',
  /** 查询规格价格；main 网关。 */
  goodsPrice: '/shop/goods/price',
  /** 查询商品加料；main 网关。 */
  goodsAddition: '/shop/goods/goodsAddition',
  /** 查询商品可售时段；main 网关。 */
  timesSchedule: '/shop/goods/times/schedule',
  /** 查询商品拼团配置；common 网关。 */
  pingtuanSet: '/shop/goods/pingtuan/set',
  /** 发起拼团；common 网关。 */
  pingtuanOpen: '/shop/goods/pingtuan/open',
  /** 查询参团用户；common 网关。 */
  pingtuanJoinUsers: '/shop/goods/pingtuan/joiner',
} as const
