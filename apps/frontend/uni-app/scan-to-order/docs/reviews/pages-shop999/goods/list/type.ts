/** 商品列表项（商家后台） */
export interface ShopGoodsItem {
  id: number
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
