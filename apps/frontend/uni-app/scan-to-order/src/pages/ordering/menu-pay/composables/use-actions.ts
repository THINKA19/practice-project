/**
 * ============================================================================
 * 【文件概述】结算与支付 / composables/use-actions.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - PayOutcome：数据类型契约。
 * - usePayActions：本文件对外声明。
 * 【综合使用示例】
 * import type { PayOutcome } from '@/pages/ordering/menu-pay/composables/use-actions'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
/**
 * 支付上下文 - 应用服务
 * 原 utils/pay.js + components/payment 的业务部分
 */
import type { PayChannel, PayIntent } from '../models/payment.types'
import { orderPayNextAction, parseAlipayQrcode } from '../domain/payment.rules'
import { paymentApi } from '../api/payment.api'
import { requestPayment } from '@/pages/ordering/menu'

function buildPostData(intent: PayIntent) {
  const data: Record<string, string | number> = {
    money: intent.money,
    remark: intent.remark,
    payName: intent.remark,
    ...(intent.extData || {}),
  }

  if (intent.nextAction) {
    data.nextAction = JSON.stringify(intent.nextAction)
  }

  return data
}

/**
 * PayOutcome 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：| { channel: 'wx', paid: true } | { channel: 'alipay', qrcodeImage: string }。
 * @example
 * import type { PayOutcome } from '@/pages/ordering/menu-pay/composables/use-actions'
 * declare const response: PayOutcome
 * const value: PayOutcome = response // => 保留 PayOutcome 的字段与取值约束
 */
export type PayOutcome
  = | { channel: 'wx', paid: true }
    | { channel: 'alipay', qrcodeImage: string }

/**
 * 发起支付
 * - wx：调起微信支付，成功 resolve，用户取消/失败 reject
 * - alipay：返回收款二维码图片，由 UI 展示
 */
async function pay(intent: PayIntent, channel: PayChannel = 'wx'): Promise<PayOutcome> {
  const data = buildPostData(intent)

  if (channel === 'wx') {
    const url = ''

    const res = await paymentApi.wxpay(data, url || undefined)

    await requestPayment(res)

    return { channel: 'wx', paid: true }
  }

  if (channel === 'alipay') {
    const res = await paymentApi.alipayQrcode(data)

    const content = parseAlipayQrcode(res.qrcode)

    if (!content) {
      throw new Error('支付宝下单失败')
    }

    const img = await paymentApi.qrcodeImage(content, 650)

    return { channel: 'alipay', qrcodeImage: img }
  }

  throw new Error('暂不支持该支付方式')
}

/** 支付订单 */
function payOrder(orderId: number | string, money: number, channel: PayChannel = 'wx') {
  return pay({ money, remark: `支付订单 ：${orderId}`, nextAction: orderPayNextAction(orderId) }, channel)
}

/**
 * 创建支付流程入口，UI 决定何时展示和提交。
 * @returns 对象，包含 pay、payOrder。
 * @example
 * import { usePayActions } from '@/pages/ordering/menu-pay/composables/use-actions'
 * usePayActions() // => 对象，包含 pay、payOrder
 */
export function usePayActions() {
  return { pay, payOrder }
}
