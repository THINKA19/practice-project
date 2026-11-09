/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / api/endpoints.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - endpoints：本文件对外声明。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/ordering/menu-cart/api/endpoints'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 后端路径清单；网关由接口函数显式选择。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { endpoints } from '@/pages/ordering/menu-cart/api/endpoints'
 * endpoints // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const endpoints = {
  /** 查询当前记录；main 网关。 */
  info: '/shopping-cart/info',
  /** 新增记录；main 网关。 */
  add: '/shopping-cart/add',
  /** 修改条目数量；main 网关。 */
  modifyNumber: '/shopping-cart/modifyNumber',
  /** 删除记录；main 网关。 */
  remove: '/shopping-cart/remove',
  /** 清空购物车；main 网关。 */
  empty: '/shopping-cart/empty',
} as const
