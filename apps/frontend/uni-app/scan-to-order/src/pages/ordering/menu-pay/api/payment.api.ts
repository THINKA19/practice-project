/**
 * ============================================================================
 * 【文件概述】结算与支付 / api/payment.api.ts
 * 请求层：维护原始请求协议和返回类型，复用现有 HTTP 客户端。
 * 【方法与导出清单】
 * - paymentApi：本文件对外声明。
 * 【综合使用示例】
 * import { paymentApi } from '@/pages/ordering/menu-pay/api/payment.api'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { getAuthorizationHeaders } from '@/pages/auth/session'
import { endpoints } from './endpoints'

/**
 * 支付上下文 - 业务接口
 */
import type { PayBillDiscountDto, PeisongFeeDto, WxPayDataDto } from './payment.dto'
import { http } from '@/http/alova'

/**
 * paymentApi：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { paymentApi } from '@/pages/ordering/menu-pay/api/payment.api'
 * paymentApi.qrcodeImage // => 读取对应命名能力或配置
 */
export const paymentApi = {
  /**
   * 生成二维码图片；返回原始协议，失败沿用现有请求客户端错误。
   * @param content 待编码的二维码内容。
   * @param size 二维码尺寸参数。
   * @returns Promise<string>；转换与业务判断由调用流程完成。
   * @example
   * await paymentApi.qrcodeImage('demo', 256) // => 后端支持该请求时返回 string
   */
  qrcodeImage: (content: string, size: number) => http.Post<string>(endpoints.qrcodeImage, { content, size }, { cacheFor: 0 }).send(),
  /**
   * 提交微信支付预下单；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @param url 业务已配置的支付接口地址。
   * @returns Alova Method<WxPayDataDto>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof paymentApi.wxpay>[0]
   * await paymentApi.wxpay(data) // => 后端支持该请求时返回 WxPayDataDto
   */
  wxpay(data: Record<string, unknown>, url: string = endpoints.wxpay) {
    return http.Post<WxPayDataDto>(url, data, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } })
  },
  /**
   * 提交支付宝预下单并读取二维码；返回原始协议，失败沿用现有请求客户端错误。
   * @param data 按当前接口字段约定构造的协议数据。
   * @returns Alova Method<{ qrcode: string }>；转换与业务判断由调用流程完成。
   * @example
   * declare const data: Parameters<typeof paymentApi.alipayQrcode>[0]
   * await paymentApi.alipayQrcode(data) // => 后端支持该请求时返回 { qrcode: string }
   */
  alipayQrcode(data: Record<string, unknown>) {
    return http.Post<{ qrcode: string }>(endpoints.alipayQrcode, data, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } })
  },
  /**
   * 提交优惠买单余额支付；返回原始协议，失败沿用现有请求客户端错误。
   * @param money 买单金额，最终金额与扣款由后端确认。
   * @param pwd 当前协议要求的支付校验值。
   * @returns Alova Method<unknown>；转换与业务判断由调用流程完成。
   * @example
   * await paymentApi.payBill(1) // => 后端支持该请求时返回 unknown
   */
  payBill(money: number, pwd = '') {
    return http.Post<unknown>(endpoints.payBill, { money, pwd }, { cacheFor: 0, headers: getAuthorizationHeaders('customer'), meta: { ignoreAuth: true } })
  },
  /**
   * 读取买单优惠档位；返回原始协议，失败沿用现有请求客户端错误。 无参数。
   * @returns Alova Method<PayBillDiscountDto[]>；转换与业务判断由调用流程完成。
   * @example
   * await paymentApi.payBillDiscounts() // => 后端支持该请求时返回 PayBillDiscountDto[]
   */
  payBillDiscounts() {
    return http.Get<PayBillDiscountDto[]>(endpoints.payBillDiscounts, { cacheFor: 0, meta: { ignoreAuth: true } })
  },
  /**
   * 读取配送费阶梯；返回原始协议，失败沿用现有请求客户端错误。 无参数。
   * @returns Alova Method<PeisongFeeDto[]>；转换与业务判断由调用流程完成。
   * @example
   * await paymentApi.peisongFeeList() // => 后端支持该请求时返回 PeisongFeeDto[]
   */
  peisongFeeList() {
    return http.Get<PeisongFeeDto[]>(endpoints.peisongFeeList, { cacheFor: 0, meta: { toast: false } })
  },
}
