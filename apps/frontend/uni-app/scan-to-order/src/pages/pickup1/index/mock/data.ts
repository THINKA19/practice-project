/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/pickup1/index/mock/data.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createOrderDetail、createShop、createPickupPreview。
 * 【综合使用示例】
 * import { createOrderDetail } from '@/pages/pickup1/index/mock/data'
 * ============================================================================
 */
import type { OrderDetailData, PickupDemoScene, ShopSubItem } from '../models/order'
import { createPickupOrders, pickupState } from '@/pages/pickup/index/mock'
/**
 * 从取餐模块样本和状态构建详情。
 * @param id 订单标识。
 * @param owner 开发顾客身份标识。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createOrderDetail('不存在') // null
 */
export function createOrderDetail(id: string, owner = 'guest'): OrderDetailData | null {
  const data = createPickupOrders()
  const order = data.orderList.find(item => String(item.id) === id)
  if (!order)
    return null
  return { orderInfo: { ...order, status: pickupState.status(owner, order.hxNumber), shopIdZt: '1' }, goods: data.goodsMap[id] ?? [], logistics: data.logisticsMap[id] ?? null }
}
/**
 * 创建演示门店信息。
 * 无参数。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createShop().info.name // 演示门店名称
 */
export function createShop(): ShopSubItem {
  return { info: { name: '街角餐厅', address: '餐厅一楼', linkPhone: '' } }
}

/**
 * 创建独立的详情演示样本。
 * @param scene 业务演示场景。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createPickupPreview('unpaid').orderInfo.status // 0
 */
export function createPickupPreview(scene: PickupDemoScene = 'pickup'): OrderDetailData {
  return {
    orderInfo: { id: '201', status: scene === 'unpaid' ? 0 : scene === 'finished' ? 3 : scene === 'delivery' ? 2 : 1, hxNumber: 'DEMO-PICKUP-201', qudanhao: 'C16', isNeedLogistics: scene === 'delivery', amountReal: 52, dateAdd: '2026-10-24 12:00:00', shopIdZt: '1' },
    goods: [{ id: 'demo-1', goodsName: '招牌咖啡套餐', property: '咖啡与甜点', amount: 52, number: 1 }],
    logistics: scene === 'delivery' ? { linkMan: '演示顾客', mobile: '13800000000', provinceStr: '广东省', cityStr: '深圳市', areaStr: '南山区', address: '演示收货地址' } : null,
  }
}
