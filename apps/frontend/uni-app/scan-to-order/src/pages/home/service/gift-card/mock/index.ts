/**
 * ============================================================================
 * 【文件概述】卡包 Mock 专用出口；不导出请求登记、内部映射或其他领域状态。
 * 【方法与导出清单】cards、owner、addCard、transferCard。
 * 【综合使用示例】
 * import { addCard } from '@/pages/home/service/gift-card/mock'
 * addCard('customer', 1) // => 为演示账户发卡
 * ============================================================================
 */
export { addCard, cards, owner, transferCard } from './state'
