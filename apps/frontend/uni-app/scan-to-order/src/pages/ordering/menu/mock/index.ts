/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/index.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - additions：本文件对外声明。
 * - createGoodsDetail：本文件对外声明。
 * - goods：本文件对外声明。
 * 【综合使用示例】
 * import { additions } from '@/pages/ordering/menu/mock/index'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 仅供开发 Mock 之间共享目录样本；不由生产公共入口导出。 */
export { additions, createGoodsDetail, goods, goodsAdditions, quoteMockSku } from './fixtures/goods'
