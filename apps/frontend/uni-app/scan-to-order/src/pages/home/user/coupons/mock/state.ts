import type { CouponTemplate, MyCoupon } from '../models/types'

/** 写入只修改当前顾客的样本，公共券池保持不变。 */
const accounts = new Map<string, { mine: MyCoupon[], claimed: Set<number>, exchanged: Set<string> }>()
const passwordNames = new Map([[1, '茶友见面礼'], [4, '下午茶专享'], [7, '周末欢聚礼'], [10, '饮品尝鲜礼'], [18, '茶饮会员礼'], [32, '好友分享礼']])

export const couponTemplates: CouponTemplate[] = Array.from({ length: 56 }, (_, i) => ({
  id: i + 1,
  name: passwordNames.get(i) ?? `饮品优惠券 ${i + 1}`,
  moneyMin: 5,
  moneyMax: 5,
  moneyHreshold: 20,
  moneyType: 0,
  pwd: passwordNames.has(i),
  dateEnd: '2027-12-31',
  numberLeft: 100,
  couponRefs: i === 2 ? [{ type: 0, refId: 1 }] : [],
}))
export function couponDemo(owner: string) {
  let account = accounts.get(owner)
  if (!account) {
    account = {
      mine: [
        ...[1, 2, 3].map(id => ({ id, pid: id, name: '饮品满减券', money: 5, moneyHreshold: 20, moneyType: 0, status: 0, dateEnd: '2027-12-31 23:59:59' })),
        { id: 4, pid: 4, name: '已使用优惠券', money: 5, moneyHreshold: 20, moneyType: 0, status: 1, statusStr: '已使用', dateEnd: '2026-01-01' },
      ],
      claimed: new Set<number>(),
      exchanged: new Set<string>(),
    }
    accounts.set(owner, account)
  }
  return account
}
export function addDemoCoupon(owner: string, template: CouponTemplate) {
  const account = couponDemo(owner)
  const id = Math.max(0, ...account.mine.map(item => item.id)) + 1
  account.mine.unshift({
    id,
    pid: template.id,
    name: template.name,
    money: template.moneyMin,
    moneyHreshold: template.moneyHreshold,
    moneyType: template.moneyType,
    status: 0,
    dateEnd: template.dateEnd,
  })
}
export function resetCouponDemo() {
  accounts.clear()
}
