import { orderRequests } from '../api/order.api'

/**
 * 订单上下文 - 业务接口（下单、列表、详情、操作、核销、售后、扫码桌台下单）
 */
import type { OrderListResult } from '../models/types'
import { uploadAttachment } from '@/pages/account/index'

/**
 * 上传售后凭证等订单附件（原 WXAPI.uploadFileV2），返回文件地址
 * 委托账户附件模块公开入口，订单保留售后凭证的业务命名
 */
export async function uploadOrderFile(filePath: string): Promise<string> {
  return uploadAttachment(filePath)
}

/** 订单业务门面：提供列表空值处理、门店电话提取及开发操作限制，不持有页面状态。 */
export const orderApi = {
  /** 开发 Mock 专用状态演示，不调用真实支付或退款接口。 */
  async demoAction(orderId: number, action: 'pay' | 'refund') {
    if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK !== 'true')
      throw new Error('仅开发 Mock 环境支持演示操作')
    return orderRequests.demoAction(orderId, action)
  },
  async shopPhone(id: number) {
    const result = await orderRequests.shopPhone(id)

    return typeof result?.info?.linkPhone === 'string' ? result.info.linkPhone : ''
  },
  /** 下单；calculate=true 时仅试算价格不生成订单 */
  create(data: Record<string, unknown>) {
    return orderRequests.create(data).then((result) => {
      return result
    })
  },
  async list(data: Record<string, unknown>): Promise<OrderListResult> {
    return (await orderRequests.list(data)) || { orderList: [], goodsMap: {} }
  },
  detail(id: string | number, hxNumber = '', peisongOrderId = '') {
    return orderRequests.detail(id, hxNumber, peisongOrderId)
  },
  close(orderId: number | string) {
    return orderRequests.close(orderId)
  },
  remove(orderId: number | string) {
    return orderRequests.remove(orderId)
  },
  /** 使用余额支付 */
  payByBalance(orderId: number | string) {
    return orderRequests.payByBalance(orderId).then((result) => {
      return result
    })
  },
  /** 确认收货 */
  delivery(orderId: number | string) {
    return orderRequests.delivery(orderId)
  },
  /** 评价，postJsonString 为评价内容 JSON */
  reputation(postJsonString: string) {
    return orderRequests.reputation(postJsonString)
  },
  /** 核销 */
  hx(data: Record<string, unknown>) {
    return orderRequests.hx(data)
  },
  /** 扫码点餐：加菜到桌台订单 */
  cyTableAddOrder(data: Record<string, unknown>) {
    return orderRequests.cyTableAddOrder(data)
  },

  /* ---------- 售后 ---------- */
  refundApply(data: Record<string, unknown>) {
    return orderRequests.refundApply(data)
  },
  refundApplyDetail(orderId: number | string, orderGoodsId: number | string = '') {
    return orderRequests.refundApplyDetail(orderId, orderGoodsId)
  },
  refundApplyCancel(orderId: number | string, orderGoodsId: number | string = '') {
    return orderRequests.refundApplyCancel(orderId, orderGoodsId)
  },
  refundApplySetBackLogistics(data: Record<string, unknown>) {
    return orderRequests.refundApplySetBackLogistics(data)
  },
}
