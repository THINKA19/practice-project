/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / mock/entry.mock.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - default：本文件对外声明。
 * - reset：本文件对外声明。
 * 【综合使用示例】
 * import { default } from '@/pages/ordering/menu-cart/mock/entry.mock'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 开发 Mock 登记与状态重置入口。 */
import { cartState } from './state'

export { default } from './handlers'
/**
 * reset：供本领域调用的数据声明。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { reset } from '@/pages/ordering/menu-cart/mock/entry.mock'
 * reset // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const reset = cartState.reset
