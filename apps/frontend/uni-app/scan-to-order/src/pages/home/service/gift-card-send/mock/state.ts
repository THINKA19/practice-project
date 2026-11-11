/**
 * ============================================================================
 * 【文件概述】赠送模拟状态，独立拥有凭证、过期时间及签发序列。
 * 【方法与导出清单】createShareState、shareState、reset。
 * 【综合使用示例】
 * import { createShareState } from './state'
 * const state = createShareState(() => {})
 * state.get('missing') // => undefined
 * ============================================================================
 */
import type { MyCard } from '../../gift-card'
import { logState } from '../../gift-card-logs/mock'

/**
 * 创建隔离的赠送状态；注入过期事件回调，不向外暴露凭证 Map。
 * @param onExpired (card: MyCard) => void；凭证过期时记录事件。
 * @returns 签发、读取、删除、过期清理与重置操作。
 * @example createShareState(() => {}).get('missing') // => undefined
 */
export function createShareState(onExpired: (card: MyCard) => void) {
  const shares = new Map<string, { owner: string, card: MyCard, remark: string, expires: number }>()
  let serial = 1
  /**
   * 清理已到期凭证，每个凭证仅通知一次。
   * 无参数。
   * @returns {void} 清除卡片分享标识，不改变持卡归属。
   * @example state.expire() // => 到期记录被清理
   */
  function expire() {
    for (const [token, share] of shares) {
      if (share.expires <= Date.now()) {
        shares.delete(token)
        if (share.card.shareToken === token)
          share.card.shareToken = ''
        onExpired(share.card)
      }
    }
  }
  return {
    expire,
    /**
     * 签发新的 24 小时凭证并使旧凭证失效。
     * @param owner string；演示发送账户标识。
     * @param card MyCard；经卡包授权查询的持卡对象。
     * @param remark string；赠送留言。
     * @returns string；新的演示凭证。
     * @example state.issue('sender', card, '祝好') // => 新凭证
     */
    issue(owner: string, card: MyCard, remark: string) {
      if (card.shareToken)
        shares.delete(card.shareToken)
      const token = `demo-gift-${serial++}`
      card.shareToken = token
      shares.set(token, { owner, card, remark, expires: Date.now() + 86400000 })
      return token
    },
    /**
     * 查询有效赠送；仅暴露受控联动所需记录，不暴露整个映射。
     * @param token string；不透明凭证。
     * @returns 赠送记录或 undefined；查询前执行到期清理。
     * @example state.get('missing') // => undefined
     */
    get(token: string) {
      expire()
      const share = shares.get(token)
      return share ? { ...share } : undefined
    },
    /**
     * 完成领取或撤回后使凭证失效。
     * @param token string；待失效凭证。
     * @returns {void} 同步清除原持卡对象的分享标识。
     * @example state.remove(token) // => 后续 get 返回 undefined
     */
    remove(token: string) {
      const share = shares.get(token)
      if (share?.card.shareToken === token)
        share.card.shareToken = ''
      shares.delete(token)
    },
    /**
     * 重置本实例赠送及序列。
     * 无参数。
     * @returns {void} 同时清除当前引用卡片的凭证。
     * @example state.reset() // => 全部凭证失效
     */
    reset() {
      for (const share of shares.values()) share.card.shareToken = ''
      shares.clear()
      serial = 1
    },
  }
}

/** 当前运行环境唯一赠送实例；过期事件委托流水领域。 */
export const shareState = createShareState(card => logState.record(card, 'shareExpired', 'none'))
/**
 * 公共加载器调用的赠送重置。
 * 无参数。
 * @returns {void} 不重置卡包或流水状态。
 * @example reset() // => 全部赠送凭证失效
 */
export function reset() {
  shareState.reset()
}
