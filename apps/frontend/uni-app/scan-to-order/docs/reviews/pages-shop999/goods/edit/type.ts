/** 规格属性组（如辣度 / 温度 / 配料） */
export interface AttrGroup {
  /** 规格名称 */
  k: string
  /** 选项值列表 */
  list: string[]
  /** 是否必选 */
  required: boolean
}

/** 商品编辑表单 */
export interface GoodsEditForm {
  cover: string
  banners: string[]
  name: string
  /** 分类下标，0 = 未选择 */
  category: number
  price: number | null
  originPrice: number | null
  stock: number | null
  sold: number
  description: string
  attrs: AttrGroup[]
  tags: string[]
  /** 1上架 0下架 */
  status: 0 | 1
}
