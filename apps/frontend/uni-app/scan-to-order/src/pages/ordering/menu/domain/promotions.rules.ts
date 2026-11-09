/**
 * ============================================================================
 * 【文件概述】菜单选品 / domain/promotions.rules.ts
 * 规则层：维护不依赖页面生命周期的纯业务规则。
 * 【方法与导出清单】
 * - pingtuanAvatars：整理参团头像并补充未满员的展示占位。
 * 【综合使用示例】
 * import { pingtuanAvatars } from '@/pages/ordering/menu/domain/promotions.rules'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { PingtuanJoiner, PingtuanSet } from '../models/goods.types'
/**
 * 拼团头像位（不足人数用占位图补齐）
 * @param set {PingtuanSet} 拼团活动配置。
 * @param joiners {PingtuanJoiner[]} 已参团用户列表。
 * @param placeholder {默认 '/static/images/who.png'} 未满员位置的展示图片。
 * @returns string[]。
 * @example
 * import { pingtuanAvatars } from '@/pages/ordering/menu/domain/promotions.rules'
 * declare const set: Parameters<typeof pingtuanAvatars>[0]
 * declare const joiners: Parameters<typeof pingtuanAvatars>[1]
 * pingtuanAvatars(set, joiners) // => string[]
 */
export function pingtuanAvatars(set: PingtuanSet, joiners: PingtuanJoiner[], placeholder = '/static/images/who.png'): string[] {
  const avatars = Array.from({ length: set.numberOrder }, () => placeholder)

  joiners.slice(0, set.numberOrder).forEach((j, i) => {
    avatars[i] = j.apiExtUserHelp?.avatarUrl || placeholder
  })

  return avatars
}
