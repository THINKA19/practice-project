/**
 * ============================================================================
 * 【文件概述】service/favorites/models/types.ts，负责业务模型与边界转换。
 * 【方法与导出清单】FavoriteItem、FavoritePage
 * 【综合使用示例】
 * import type { FavoriteItem } from '@/pages/home/service/favorites/models/types'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
/** 收藏商品展示模型，id 为商品标识。 */
export interface FavoriteItem {
  id: number
  goodsName: string
  picUrl: string
  price: number
  collectTime: string
}
/** 收藏分页结果，total 为当前账户收藏总数。 */
export interface FavoritePage { list: FavoriteItem[], total: number }
