/**
 * ============================================================================
 * 【文件概述】结算与支付 / domain/payment.rules.ts
 * 规则层：维护不依赖页面生命周期的纯业务规则。
 * 【方法与导出清单】
 * - ORDER_NEXT_ACTION_TYPE：本文件对外声明。
 * - orderPayNextAction：生成指定订单支付后的业务动作。
 * - planOrderPayment：结合余额与积分生成订单支付计划。
 * - matchPayBillRule：匹配消费金额可使用的买单优惠规则。
 * - applyPayBillDiscount：按命中的买单规则计算优惠后的金额。
 * - planYouhuiPay：根据消费金额、优惠规则和余额生成买单计划。
 * - parseAlipayQrcode：解析支付宝二维码返回值，拒绝无效内容。
 * - matchPeisongFee：按配送距离匹配服务端提供的配送费档位。
 * 【综合使用示例】
 * import { ORDER_NEXT_ACTION_TYPE } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { NextAction, PayBillDiscount, PayPlan, PeisongFee, YouhuiPayPlan } from '../models/payment.types'

/** 普通点餐只提交现金结算订单，不发起线上支付。 */
export function cashSettlementNotice(type: 'zq' | 'kd') {
  return type === 'kd' ? '仅提交订单，无需线上支付，收货时现金结算' : '仅提交订单，无需线上支付，到店现金结算'
}
/**
 * 支付上下文 - 领域模型与规则
 */
/** 当前点餐协议金额为元，转换成分后相减。 */
function subMoney(a: number, b: number) {
  return (Math.round(a * 100) - Math.round(b * 100)) / 100
}

/**
 * nextAction.type：支付订单
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { ORDER_NEXT_ACTION_TYPE } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * ORDER_NEXT_ACTION_TYPE // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const ORDER_NEXT_ACTION_TYPE = 0

/**
 * 支付订单的后续动作（支付成功后由后端将订单置为已支付）
 * @param orderId {number | string} 服务端订单标识。
 * @returns NextAction。
 * @example
 * import { orderPayNextAction } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const orderId: Parameters<typeof orderPayNextAction>[0]
 * orderPayNextAction(orderId) // => NextAction
 */
export function orderPayNextAction(orderId: number | string): NextAction {
  return { type: ORDER_NEXT_ACTION_TYPE, id: orderId }
}

/**
 * 结合余额与积分生成订单支付计划。
 * @param orderMoney {number} 订单待支付金额。
 * @param needScore {number} 订单需要的积分。
 * @param asset {{ balance: number, score: number }} 当前账户余额与积分快照。
 * @returns PayPlan。
 * @example
 * import { planOrderPayment } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const orderMoney: Parameters<typeof planOrderPayment>[0]
 * declare const needScore: Parameters<typeof planOrderPayment>[1]
 * declare const asset: Parameters<typeof planOrderPayment>[2]
 * planOrderPayment(orderMoney, needScore, asset) // => PayPlan
 */
export function planOrderPayment(orderMoney: number, needScore: number, asset: { balance: number, score: number }): PayPlan {
  const balance = Number(asset.balance) || 0

  if ((asset.score || 0) < (needScore || 0)) {
    return { ok: false, reason: 'scoreNotEnough', orderMoney, balance, remain: orderMoney, needScore }
  }

  const remain = Math.max(0, subMoney(orderMoney, balance))

  return { ok: true, orderMoney, balance, remain, needScore: needScore || 0 }
}

/**
 * 优惠买单命中的满减规则：按门槛从高到低取第一条满足的（与 bee-master youhui-pay 一致）
 * @param money {number} 界面金额，最终以服务端计费为准。
 * @param rules {PayBillDiscount[]} 服务端买单优惠规则。
 * @returns PayBillDiscount | undefined。
 * @example
 * import { matchPayBillRule } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const money: Parameters<typeof matchPayBillRule>[0]
 * declare const rules: Parameters<typeof matchPayBillRule>[1]
 * matchPayBillRule(money, rules) // => PayBillDiscount | undefined
 */
export function matchPayBillRule(money: number, rules: PayBillDiscount[]): PayBillDiscount | undefined {
  return [...rules].sort((a, b) => b.consume - a.consume).find(r => money >= r.consume)
}

/**
 * 优惠买单：按满减规则计算实付
 * @param money {number} 界面金额，最终以服务端计费为准。
 * @param rules {PayBillDiscount[]} 服务端买单优惠规则。
 * @returns { discount: number, pay: number }。
 * @example
 * import { applyPayBillDiscount } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const money: Parameters<typeof applyPayBillDiscount>[0]
 * declare const rules: Parameters<typeof applyPayBillDiscount>[1]
 * applyPayBillDiscount(money, rules) // => { discount: number, pay: number }
 */
export function applyPayBillDiscount(money: number, rules: PayBillDiscount[]): { discount: number, pay: number } {
  const rule = matchPayBillRule(money, rules)

  const discount = rule ? rule.discounts : 0

  return { discount, pay: Math.max(0, subMoney(money, discount)) }
}

/**
 * 优惠买单支付计划：满减后余额优先抵扣，余下在线支付
 * @param amount {number} 本次消费金额，最终收费以服务端为准。
 * @param rules {PayBillDiscount[]} 服务端买单优惠规则。
 * @param balance {number} 当前账户余额，最终可用金额由后端确认。
 * @returns YouhuiPayPlan。
 * @example
 * import { planYouhuiPay } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const amount: Parameters<typeof planYouhuiPay>[0]
 * declare const rules: Parameters<typeof planYouhuiPay>[1]
 * declare const balance: Parameters<typeof planYouhuiPay>[2]
 * planYouhuiPay(amount, rules, balance) // => YouhuiPayPlan
 */
export function planYouhuiPay(amount: number, rules: PayBillDiscount[], balance: number): YouhuiPayPlan {
  const rule = matchPayBillRule(amount, rules)

  const needPayAmount = rule ? subMoney(amount, rule.discounts) : amount

  const wxpayAmount = subMoney(needPayAmount, balance)

  return { rule, needPayAmount, wxpayAmount }
}

/**
 * 支付宝预下单返回的二维码内容
 * @param raw {string} 服务端原始二维码文本。
 * @returns string | null。
 * @example
 * import { parseAlipayQrcode } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const raw: Parameters<typeof parseAlipayQrcode>[0]
 * parseAlipayQrcode(raw) // => string | null
 */
export function parseAlipayQrcode(raw: string): string | null {
  try {
    const obj = JSON.parse(raw) as { alipay_trade_precreate_response?: { qr_code?: string } }

    return obj.alipay_trade_precreate_response?.qr_code || null
  }
  catch {
    return null
  }
}

/**
 * 按距离匹配配送费档位（原 pay/index.js：第一个 distance >= 实际距离 的档位）
 * @param list {PeisongFee[]} 配送费档位列表。
 * @param distance {number} 配送距离或距离展示值，单位千米。
 * @returns PeisongFee | undefined。
 * @example
 * import { matchPeisongFee } from '@/pages/ordering/menu-pay/domain/payment.rules'
 * declare const list: Parameters<typeof matchPeisongFee>[0]
 * declare const distance: Parameters<typeof matchPeisongFee>[1]
 * matchPeisongFee(list, distance) // => PeisongFee | undefined
 */
export function matchPeisongFee(list: PeisongFee[], distance: number): PeisongFee | undefined {
  if (!Number.isFinite(distance) || distance < 0)
    return undefined
  return list.filter(f => Number.isFinite(Number(f.distance)) && Number(f.distance) >= distance)
    .sort((a, b) => Number(a.distance) - Number(b.distance))[0]
}
