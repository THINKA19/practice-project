/**
 * ============================================================================
 * 【文件概述】点餐客户端的显式功能配置，商户营业/配送能力仍以门店接口为准。
 * 【方法与导出清单】orderingSettings：当前客户端开关，未配置值不启用对应能力。
 * 【综合使用示例】import { orderingSettings } from '@/pages/ordering/index'; orderingSettings.mallName // 扫码点餐
 * ============================================================================
 */
/**
 * orderingSettings：供本领域调用的命名能力集合。
 * @returns Readonly<Record<string, string>>；不是独立请求的执行结果。
 * @example
 * import { orderingSettings } from '@/pages/ordering/index/config'
 * orderingSettings.mallName // => 读取对应命名能力或配置
 */
export const orderingSettings: Readonly<Record<string, string>> = { mallName: '扫码点餐', shop_goods_split: '1', goodsSearchShowType: '2', goodsDetailSkuShowType: '0', share_profile: '欢迎来点餐', showSellerNumber: '1' }
