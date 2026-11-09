/**
 * ============================================================================
 * 【文件概述】商品详情 / index.ts
 * 公开边界：显式导出实际消费者使用的能力。
 * 【方法与导出清单】
 * - kanjiaApi：本文件对外声明。
 * - goodsMediaApi：本文件对外声明。
 * 【综合使用示例】
 * import { kanjiaApi } from '@/pages/ordering/menu-goods-details/index'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
export { kanjiaApi } from './api/kanjia.api'
export { goodsMediaApi } from './api/media.api'
