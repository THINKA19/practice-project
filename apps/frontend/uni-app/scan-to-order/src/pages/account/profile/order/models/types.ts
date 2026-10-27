import type { OrderStatus } from './enums'

export type OrderFilter = 'all' | 'pickup' | 'delivery' | 'reservation' | 'dinein'

export type OrderStatusValue = typeof OrderStatus[keyof typeof OrderStatus]

export interface Order {
  /** 开发 Mock 样本标记，真实订单不设置。 */
  demo?: boolean
  id: number
  orderNumber: string
  status: number
  statusStr?: string
  amount?: number
  amountReal: number
  amountLogistics?: number
  score?: number
  goodsNumber?: number
  dateAdd: string
  datePay?: string
  isNeedLogistics?: boolean
  isPay?: boolean
  hxNumber?: string
  /** 取餐号 */
  qudanhao?: string
  shopId?: number
  shopIdZt?: number
  /** 订单所属门店照片 URL，缺失或失败时显示占位。 */
  shopImage?: string
  shopNameZt?: string
  remark?: string
  peisongType?: string
  /** 后端明确返回的履约类型；未知类型只显示在全部订单。 */
  orderType?: 'pickup' | 'delivery' | 'reservation' | 'dinein'
  refundStatus?: number
  [k: string]: unknown
}

export interface OrderGoods {
  id: number
  goodsId: number
  goodsName: string
  pic: string
  number: number
  amount: number
  amountSingle?: number
  property?: string
  isScore?: boolean
  refundStatus?: number
  [k: string]: unknown
}

export interface OrderLogistics {
  linkMan?: string
  mobile?: string
  address?: string
  provinceStr?: string
  cityStr?: string
  areaStr?: string
  [k: string]: unknown
}

export interface OrderDetail {
  orderInfo: Order
  goods: OrderGoods[]
  logistics?: OrderLogistics
  logisticsTraces?: unknown[]
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

export interface OrderListResult {
  orderList: Order[]
  /** 订单 id -> 商品列表 */
  goodsMap: Record<string, OrderGoods[]>
  totalRow?: number
  totalPage?: number
  logisticsMap?: Record<string, unknown>
}

/** 下单商品项（goodsJsonStr 元素） */
export interface OrderGoodsInput {
  goodsId: number
  number: number
  propertyChildIds?: string
  logisticsType?: number
  goodsTimesDay?: string
  goodsTimesItem?: string
  sku?: unknown
  additions?: unknown
  [k: string]: unknown
}

export interface CreateOrderResult {
  id: number
  orderNumber: string
  amountReal: number
  amountTotle?: number
  amountLogistics?: number
  score?: number
  couponUserList?: Array<{ id: number, name: string, money: number, [k: string]: unknown }>
  [k: string]: unknown
}

/** 售后（退款）单 */
export interface RefundApply {
  baseInfo: {
    id: number
    status: number
    type: number
    reason?: string
    remark?: string
    amount?: number
    dateAdd?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

/* ======================================================================
 * 以下为订单页面迁移新增（all-orders / order-details / refund-apply）
 * ==================================================================== */

/** 订单优惠信息（order/detail 的 goodsCoupons；type 0 文本券码，1 图片） */
export interface OrderGoodsCoupon {
  id: number
  type: number
  coupon: string
  [k: string]: unknown
}

/* ---------- 评价 ---------- */

/** 评价等级：0 差评 1 中评 2 好评 */
export type ReputationLevel = 0 | 1 | 2

export interface ReputationItem {
  /** 订单商品 id（OrderGoods.id） */
  id: number | string
  reputation: ReputationLevel
  remark: string
}

/* ---------- 售后 ---------- */

/** 支持售后的订单商品（afterSale 为逗号分隔的售后类型，如 "0,1,2"） */
export interface RefundableGoods extends OrderGoods {
  afterSale?: string
}

/** 售后单（含关联的订单商品），用于售后列表/详情展示 */
export interface RefundApplyRecord extends RefundApply {
  baseInfo: RefundApply['baseInfo'] & {
    orderId?: number
    orderGoodsId?: number
    number?: number
    statusStr?: string
    typeStr?: string
    logisticsStatusStr?: string
    /** 寄回状态：0 无需寄回 1 待填写快递单号 2 已填写 */
    status2?: number
    logisticsContent?: string
  }
  pics?: Array<{ pic: string, [k: string]: unknown }>
  goodInfo?: RefundableGoods
}
