/**
 * ============================================================================
 * 【文件概述】service/group-buying/index.ts，负责业务公开能力。
 * 【方法与导出清单】groupBuyingApi、GroupBuying、GroupBuyingPage
 * 【综合使用示例】
 * import { groupBuyingApi } from '@/pages/home/service/group-buying/index'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
export { groupBuyingApi } from './api/group-buying.api'
export type { GroupBuying, GroupBuyingPage } from './models/types'
