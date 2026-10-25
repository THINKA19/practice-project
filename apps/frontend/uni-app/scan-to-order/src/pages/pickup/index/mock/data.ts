/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup/index/mock/data.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createPickupOrders。
 * 【综合使用示例】
 * import { createPickupOrders } from '@/pages/pickup/index/mock/data'
 * ============================================================================
 */
import type { OrderDoingData } from '../models/order'
/**
 * 创建独立的取餐订单样本。
 * 无参数。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createPickupOrders().orderList.length // 2
 */
export function createPickupOrders(): OrderDoingData {
  return {
    orderList: [
      { id: '101', hxNumber: 'MOCK-PICKUP-101', qudanhao: 'A08', isNeedLogistics: false, amountReal: 45.5, dateAdd: '2026-10-23 11:30:00' },
      { id: '102', hxNumber: 'MOCK-PICKUP-102', qudanhao: 'B02', isNeedLogistics: true, amountReal: 38, dateAdd: '2026-10-23 11:40:00' },
    ],
    goodsMap: {
      101: [{ id: 'g1', goodsName: '美式咖啡', property: '大杯 / 热', number: 2, amount: 18 }, { id: 'g2', goodsName: '贝果', number: 1, amount: 9.5 }],
      102: [{ id: 'g3', goodsName: '奶茶', property: '少冰', number: 1, amount: 22 }, { id: 'g4', goodsName: '蛋糕', number: 1, amount: 16 }],
    },
    logisticsMap: { 102: { linkMan: '模拟顾客', mobile: '13800000000', provinceStr: '广东省', cityStr: '深圳市', areaStr: '南山区', address: '模拟门店旁 1 号' } },
  }
}
