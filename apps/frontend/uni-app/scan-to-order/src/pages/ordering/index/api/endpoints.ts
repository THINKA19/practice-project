/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / api/endpoints.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - endpoints：本文件对外声明。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/ordering/index/api/endpoints'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 后端路径清单；网关由接口函数显式选择。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { endpoints } from '@/pages/ordering/index/api/endpoints'
 * endpoints // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const endpoints = {
  favorites: '/shop/subshop/favorites',
  /** 获取已开放经营地区树；前后端待联调的新契约。 */
  regions: '/shop/subshop/regions',
  /** 查询门店列表；main 网关。 */
  fetchShops: '/shop/subshop/list',
  /** 查询详情；main 网关。 */
  detail: '/shop/subshop/detail/v2',
  /** 用桌台密钥换取会话；main 网关。 */
  cyTableToken: '/cyTable/token',
  /** 查询自提点；common 网关。 */
  pickPoints: '/shop/subshop/pickPoints',
  /** 查询两点地图距离（米）；mainRoot 网关。 */
  gpsDistance: '/common/map/qq/distance',
} as const
