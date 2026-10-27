import type { MyCard, MyCardState } from '../models/types'

/** 按激活状态、来源用户及分享凭证推导展示状态，不推断到期或服务端有效性。 */
export function myCardState(c: MyCard): MyCardState {
  if (!c.isActive && !c.fromUid && !c.shareToken) {
    return 'canShare'
  }
  if (!c.isActive && !c.fromUid && c.shareToken) {
    return 'sharing'
  }
  return 'active'
}
