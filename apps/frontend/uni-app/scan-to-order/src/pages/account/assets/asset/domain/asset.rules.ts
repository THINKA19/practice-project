import type { RechargeRule } from '../models/types'

/** 充值满送规则文案（金额 → 赠送） */
export function rechargeBonus(rules: RechargeRule[], money: number): number {
  const matched = rules.filter(r => r.confine > 0 && money >= r.confine).sort((a, b) => b.confine - a.confine)[0]
  if (!matched) {
    return 0
  }
  return matched.loop ? Math.floor(money / matched.confine) * matched.send : matched.send
}

/** 将充值输入转换为有效金额（元）；非正数、非法精度或超出安全整数分范围返回 null。 */
export function parseRechargeAmount(value: string): number | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim()))
    return null
  const amount = Number(value)
  return amount > 0 && Number.isSafeInteger(Math.round(amount * 100)) ? amount : null
}
