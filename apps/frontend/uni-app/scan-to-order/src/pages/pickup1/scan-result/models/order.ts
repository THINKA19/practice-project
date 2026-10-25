/** 取餐业务接口模型，服务端状态为事实来源。 */

/** 订单金额信息（接口：GET /order/orderDetail → data.orderInfo） */
export interface OrderInfo {
  /** 订单状态：1 待取餐 / 2 配送中 / 3·4 已完成 */
  status: number
  fulfillment?: 'preparing' | 'ready' | 'delivering'
  /** 商品金额 */
  amount: number
  /** 运费 */
  amountLogistics: number
  /** 实付金额 */
  amountReal: number
}

/** 订单商品行（接口：GET /order/orderDetail → data.goods） */
export interface GoodsItem {
  id: string | number
  /** 商品图 */
  pic: string
  goodsName: string
  /** 规格文案，如「大杯 / 热」，没有规格时为空 */
  property?: string
  /** 单价 */
  amount: number
  /** 数量 */
  number: number
}

/** 收货信息（接口：GET /order/orderDetail → data.logistics，自提单为 null） */
export interface LogisticsItem {
  linkMan: string
  mobile: string
  provinceStr: string
  cityStr: string
  areaStr: string
  address: string
}

/** 订单用到的券（接口：GET /order/orderDetail → data.goodsCoupons） */
export interface GoodsCouponItem {
  id: string | number
  /** 0 文案券 / 1 图片券 */
  type: number
  /** type=0 时是文案，type=1 时是图片地址 */
  coupon: string
}

/** 核销详情接口的 data */
export interface ScanOrderDetail {
  orderInfo: OrderInfo
  goods: GoodsItem[]
  logistics: LogisticsItem | null
  /** 这一单用掉的券，没用券时为 null */
  goodsCoupons: GoodsCouponItem[] | null
}
