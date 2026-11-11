/**
 * ============================================================================
 * 【文件概述】赠送 Mock 专用出口，不加载请求登记。
 * 【方法与导出清单】shareState：凭证生命周期操作。
 * 【综合使用示例】
 * import { shareState } from '@/pages/home/service/gift-card-send/mock'
 * shareState.expire() // => 清理到期赠送
 * ============================================================================
 */
export { shareState } from './state'
