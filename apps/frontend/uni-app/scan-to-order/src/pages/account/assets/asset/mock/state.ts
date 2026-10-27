import type { CashLog } from '../../asset-cash-log'
import type { PayLog } from '../../asset-recharge-log'
import { mockCustomerOwner } from '@/pages/auth/session/mock'
import { parseRechargeAmount, rechargeBonus } from '../domain/asset.rules'
import type { RechargeRule } from '../models/types'

export const demoRules: RechargeRule[] = [
  { id: 1, confine: 50, send: 5 },
  { id: 2, confine: 100, send: 15 },
  { id: 3, confine: 200, send: 40 },
]
interface Wallet {
  balanceCents: number
  cash: CashLog[]
  pay: PayLog[]
  requests: Map<string, number>
}
const wallets = new Map<string, Wallet>()
export function assetDemoOwner(authorization: unknown, write = false) {
  const value = String(authorization ?? '')
  if (write && !/^Bearer wx-demo-session-\S+$/.test(value))
    throw new Error('请先登录顾客账户')
  return mockCustomerOwner(authorization)
}
export function walletDemo(owner: string): Wallet {
  let wallet = wallets.get(owner)
  if (!wallet) {
    wallet = {
      balanceCents: 12850,
      requests: new Map(),
      cash: Array.from({ length: 56 }, (_, i) => ({
        id: 56 - i,
        amount: i % 2 ? -18 : 55,
        balance: 128.5,
        typeStr: i % 2 ? '订单消费' : '余额充值',
        dateAdd: '2026-10-20 12:00:00',
      })),
      pay: Array.from({ length: 56 }, (_, i) => ({
        id: 56 - i,
        money: 50,
        status: 1,
        statusStr: '成功',
        payGateStr: '演示充值',
        dateAdd: '2026-10-20 12:00:00',
        dateUpdate: '2026-10-20 12:00:00',
      })),
    }
    wallets.set(owner, wallet)
  }
  return wallet
}
export function demoAmount(owner: string) {
  return { balance: walletDemo(owner).balanceCents / 100, freeze: 0, score: 260, growth: 0 }
}
export function demoRecharge(owner: string, amount: unknown, requestId: unknown) {
  if (typeof amount !== 'number' || parseRechargeAmount(String(amount)) === null || typeof requestId !== 'string' || !requestId)
    throw new Error('充值参数无效')
  const wallet = walletDemo(owner)
  const previous = wallet.requests.get(requestId)
  if (previous !== undefined) {
    if (previous !== amount)
      throw new Error('请勿修改已提交的充值金额')
    return demoAmount(owner)
  }
  const cents = Math.round((amount + rechargeBonus(demoRules, amount)) * 100)
  if (!Number.isSafeInteger(wallet.balanceCents + cents))
    throw new Error('充值金额超出限制')
  wallet.balanceCents += cents
  wallet.requests.set(requestId, amount)
  const dateAdd = new Date().toISOString()
  wallet.cash.unshift({ id: (wallet.cash[0]?.id ?? 0) + 1, amount: cents / 100, balance: wallet.balanceCents / 100, typeStr: '演示充值及赠送', dateAdd })
  wallet.pay.unshift({ id: (wallet.pay[0]?.id ?? 0) + 1, money: amount, status: 1, statusStr: '成功', payGateStr: '演示充值', dateAdd, dateUpdate: dateAdd })
  return demoAmount(owner)
}
export function resetWalletDemo() {
  wallets.clear()
}
