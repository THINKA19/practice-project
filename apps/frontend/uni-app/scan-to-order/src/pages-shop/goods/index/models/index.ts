/** 商品列表项（商家后台） */
export interface ShopGoodsItem {
  id: number
  shopId?: string
  version?: number
  name: string
  cover: string
  price: number
  originPrice: number
  sold: number
  stock: number
  category: string
  /** 1上架 0下架 */
  status: 1 | 0
}

/** 当前门店的商品目录，分类按接口返回顺序展示。 */
export interface ShopGoodsCatalog {
  categories: string[]
  items: ShopGoodsItem[]
}
