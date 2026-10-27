/** 取餐业务接口模型，服务端状态为事实来源。 */

/** 制作中 / 配送中的订单（接口：GET /order/list → data.orderList） */
export interface OrderDoingItem {
  fulfillment?: 'preparing' | 'ready' | 'delivering'
  id: string | number
  /** 核销码 */
  hxNumber: string
  /** 取单号（自提单展示） */
  qudanhao: string
  /** 是否需要配送（false = 到店自取） */
  isNeedLogistics: boolean
  /** 订单实付金额 */
  amountReal: number
  /** 下单时间 */
  dateAdd: string
}

/** 收货信息（接口：GET /order/list → data.logisticsMap，key = 订单 id） */
export interface LogisticsItem {
  linkMan: string
  mobile: string
  provinceStr: string
  cityStr: string
  areaStr: string
  address: string
}

/** 订单商品行（接口：GET /order/list → data.goodsMap，key = 订单 id） */
export interface GoodsItem {
  id: string | number
  goodsName: string
  /** 规格文案，如「大杯 / 热」，没有规格时为空 */
  property?: string
  /** 数量 */
  number: number
  /** 单价 */
  amount: number
}

/** 订单列表接口的 data */
export interface OrderDoingData {
  orderList: OrderDoingItem[]
  /** 配送单的收货信息，自提单不在里面 */
  logisticsMap: Record<string, LogisticsItem>
  /** 每单的商品行 */
  goodsMap: Record<string, GoodsItem[]>
}
