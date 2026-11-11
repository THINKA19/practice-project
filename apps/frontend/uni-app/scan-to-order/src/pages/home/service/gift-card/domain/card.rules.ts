import type { MyCard, MyCardState } from '../models/types'

/** 按激活状态、来源用户及分享凭证推导展示状态，识别有效期与耗尽；未知 status 仍由服务端判定。 */
export function myCardState(c: MyCard): MyCardState {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (c.dateEnd && /^\d{4}-\d{2}-\d{2}/.test(c.dateEnd) && c.dateEnd.slice(0, 10) < today)
    return 'expired'
  if (c.amount <= 0)
    return 'empty'
  if (!c.isActive && !c.fromUid && !c.shareToken) {
    return 'canShare'
  }
  if (!c.isActive && !c.fromUid && c.shareToken) {
    return 'sharing'
  }
  return 'active'
}
