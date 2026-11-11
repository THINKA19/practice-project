/**
 * ============================================================================
 * 【文件概述】卡包唯一 Mock 登记入口，重置仅归卡包自身。
 * 【方法与导出清单】default、reset。
 * 【综合使用示例】
 * import entry from './entry.mock'
 * const routes = entry.data // => 卡包请求登记
 * ============================================================================
 */
export { default } from './handlers'
export { reset } from './state'
