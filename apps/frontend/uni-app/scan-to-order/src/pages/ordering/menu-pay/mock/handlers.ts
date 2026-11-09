/**
 * ============================================================================
 * 【文件概述】结算与支付 / mock/handlers.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { deliveryFees, discounts } from './fixtures/payment'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[POST]${endpoints.qrcodeImage}`]: withFailure(() => fail('演示环境不生成真实收款码'), { write: true }),
  [`[GET]${endpoints.payBillDiscounts}`]: withFailure(() => ok(structuredClone(discounts))),
  [`[GET]${endpoints.peisongFeeList}`]: withFailure(() => ok(structuredClone(deliveryFees))),
  [`[POST]${endpoints.wxpay}`]: withFailure(() => fail('演示环境不创建真实微信支付单', 503), { write: true }),
  [`[POST]${endpoints.alipayQrcode}`]: withFailure(() => fail('演示环境不创建真实支付宝支付单', 503), { write: true }),
  [`[POST]${endpoints.payBill}`]: withFailure(() => fail('演示环境不扣除真实余额', 503), { write: true }),
})
