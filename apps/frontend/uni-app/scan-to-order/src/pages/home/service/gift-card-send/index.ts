export { cardSendApi } from './api/send.api'
/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡赠送领域公开入口；仅显式导出页面流程，不转发 API 或 Mock。
 *
 * 【方法与导出清单】
 * useGiftSendPage()：创建页面状态；cardSendApi：供卡包撤回赠送。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useGiftSendPage } from '@/pages/home/service/gift-card-send'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useGiftSendPage()
 * await page.init({ cardId: '7' }) // => 查询当前账号卡包
 * await page.prepare() // => 服务端确认后取得分享凭证
 * ```
 * ============================================================================
 */
export { useGiftSendPage } from './composables/use-page'
