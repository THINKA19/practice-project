/**
 * ============================================================================
 * 【文件概述】卡包公开入口；不再代理兑换、赠送、领取与流水请求。
 * 【方法与导出清单】cardApi、myCardState、CardTemplate、CardUserBrief、MyCard。
 * 【综合使用示例】
 * import { cardApi } from '@/pages/home/service/gift-card'
 * const cards = await cardApi.my() // => 当前客户卡包
 * ============================================================================
 */
export { cardApi } from './composables/use-requests'
export { myCardState } from './domain/card.rules'
export type { CardTemplate, CardUserBrief, MyCard } from './models/types'
