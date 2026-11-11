/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡记录领域公开入口；仅显式导出页面流程，不转发 API 或 Mock。
 *
 * 【方法与导出清单】
 * useCardLogsPage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useCardLogsPage } from '@/pages/home/service/gift-card-logs'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useCardLogsPage()
 * await page.init({ cardId: '7' }) // => 当前账号持卡时加载第一页
 * await page.loadMore() // => 未到底且空闲时加载后续记录
 * ```
 * ============================================================================
 */
export { useCardLogsPage } from './composables/use-page'
