/** 取餐业务接口模型，服务端状态为事实来源。 */

/** 订单主体（接口：GET /order/detail → data.orderInfo） */
export interface OrderInfo {
  id: string | number
  /** 订单状态：-1 已关闭 / 0 待支付 / 1 待取餐·配送中 / 2 配送中 / 3·4 已完成 */
  status: number
  /** 核销码 */
  hxNumber?: string
  /** 取单号（自提单展示） */
  qudanhao?: string
  /** 是否需要配送（false = 到店自取） */
  isNeedLogistics: boolean
  /** 订单实付金额 */
  amountReal: number
  /** 下单时间 */
  dateAdd: string
  /** 关闭时间（已关闭的订单才有） */
  dateClose?: string
  /** 下单门店 id（用来查门店详情） */
  shopIdZt?: string | number
}

/** 订单商品行（接口：GET /order/detail → data.goods） */
export interface GoodsItem {
  id: string | number
  goodsName: string
  /** 规格文案，如「大杯 / 热」，没有规格时为空 */
  property?: string
  /** 单价 */
  amount: number
  /** 数量 */
  number: number
}

/** 收货信息（接口：GET /order/detail → data.logistics，自提单为 null） */
export interface LogisticsItem {
  linkMan: string
  mobile: string
  provinceStr: string
  cityStr: string
  areaStr: string
  address: string
}

/** 订单详情接口的 data */
export interface OrderDetailData {
  orderInfo: OrderInfo
  goods: GoodsItem[]
  logistics: LogisticsItem | null
}

/** 门店详情（接口：GET /shop/subdetail → data） */
export interface ShopSubItem {
  info: {
    name: string
    address: string
    linkPhone: string
  }
}

/** 详情展示场景，独立于取餐列表。 */
export type PickupDemoScene = 'pickup' | 'delivery' | 'unpaid' | 'finished'

export const PICKUP_DEMO_SCENES: { value: PickupDemoScene, label: string }[] = [
  { value: 'pickup', label: 'pickupPreview.pickupScene' },
  { value: 'delivery', label: 'pickupPreview.deliveryScene' },
  { value: 'unpaid', label: 'pickupPreview.unpaidScene' },
  { value: 'finished', label: 'pickupPreview.finishedScene' },
]
