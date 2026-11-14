/** 规格属性组（如辣度 / 温度 / 配料） */
export interface AttrGroup {
  /** 规格名称 */
  k: string
  /** 选项值列表 */
  list: string[]
  /** 是否必选 */
  required: boolean
}

/** 管理员维护的商品资料与门店运营数据。 */
export interface GoodsEditForm {
  cover: string
  banners: string[]
  name: string
  /** 分类下标，0 = 未选择 */
  category: number
  price: number | undefined
  originPrice: number | undefined
  stock: number | undefined
  sold: number
  description: string
  attrs: AttrGroup[]
  tags: string[]
  /** 1上架 0下架 */
  status: 0 | 1
}

/** 店铺端允许保存的运营字段。 */
export interface GoodsPriceUpdate {
  price: number
}
