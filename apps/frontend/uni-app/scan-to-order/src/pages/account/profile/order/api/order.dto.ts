/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export interface CreateOrderResultDto {
  id: number
  orderNumber: string
  amountReal: number
  amountTotle?: number
  amountLogistics?: number
  score?: number
  couponUserList?: Array<{ id: number, name: string, money: number, [k: string]: unknown }>
  [k: string]: unknown
}

export interface OrderDetailDto {
  orderInfo: OrderDto
  goods: OrderGoodsDto[]
  logistics?: OrderLogisticsDto
  logisticsTraces?: unknown[]
  extJson?: Record<string, unknown>
  [k: string]: unknown
}

export interface OrderListResultDto {
  orderList: OrderDto[]
  /** 订单 id -> 商品列表 */
  goodsMap: Record<string, OrderGoodsDto[]>
  totalRow?: number
  totalPage?: number
  logisticsMap?: Record<string, unknown>
}

/** 售后（退款）单 */
export interface RefundApplyDto {
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

export interface OrderDto {
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

export interface OrderGoodsDto {
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

export interface OrderLogisticsDto {
  linkMan?: string
  mobile?: string
  address?: string
  provinceStr?: string
  cityStr?: string
  areaStr?: string
  [k: string]: unknown
}
