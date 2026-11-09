/**
 * ============================================================================
 * 【文件概述】结算与支付 / api/endpoints.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - endpoints：本文件对外声明。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/ordering/menu-pay/api/endpoints'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 后端路径清单；网关由接口函数显式选择。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { endpoints } from '@/pages/ordering/menu-pay/api/endpoints'
 * endpoints // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const endpoints = {
  qrcodeImage: '/ordering/payment/qrcode-image',
  /** 微信支付预下单（允许配置覆盖路径）；main 网关。 */
  wxpay: '/pay/wx/wxapp',
  /** 支付宝预下单获取二维码；main 网关。 */
  alipayQrcode: '/pay/alipay/gate/qrcode',
  /** 余额优惠买单；main 网关。 */
  payBill: '/payBill/pay',
  /** 查询买单满减规则；main 网关。 */
  payBillDiscounts: '/payBill/discounts',
  /** 查询配送距离档位；main 网关。 */
  peisongFeeList: '/fee/peisong/list',
} as const
