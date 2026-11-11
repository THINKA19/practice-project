/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡领取领域公开入口；仅显式导出页面流程，不转发 API 或 Mock。
 *
 * 【方法与导出清单】
 * useGiftReceivePage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useGiftReceivePage } from '@/pages/home/service/gift-card-receive'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useGiftReceivePage()
 * page.init({ id: '7', shareToken: 'example-token' }) // => 仅预览
 * page.submit() // => 预览成功后才允许主动领取
 * ```
 * ============================================================================
 */
export { useGiftReceivePage } from './composables/use-page'
