/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡兑换领域公开入口；仅显式导出页面流程，不转发 API 或 Mock。
 *
 * 【方法与导出清单】
 * useCardExchangePage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useCardExchangePage } from '@/pages/home/service/gift-card-exchange'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useCardExchangePage()
 * page.number.value = 'example-code'
 * page.agree.value = true
 * await page.submit() // => 仅服务端兑换成功后进入完成状态
 * ```
 * ============================================================================
 */
export { useCardExchangePage } from './composables/use-page'
