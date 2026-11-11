/**
 * ============================================================================
 * 【文件概述】service/favorites/mock/data.ts，负责开发 Mock 数据与请求处理。
 * 【方法与导出清单】createFavorites
 * 【综合使用示例】
 * import { createFavorites } from '@/pages/home/service/favorites/mock/data'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import tea from '@/mock/assets/images/home/products/tea.jpg'
import coffee from '@/mock/assets/images/home/products/coffee.jpg'
import type { FavoriteItem } from '../models/types'
/**
 * 每次创建独立样本，防止取消收藏影响其他顾客。
 * 无参数。
 * @returns FavoriteItem[]
 * @example // createFavorites 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
export function createFavorites(): FavoriteItem[] {
  return Array.from({ length: 23 }, (_, index) => ({
    id: index + 1,
    goodsName: ['茉莉鲜奶茶', '桂花乌龙', '生椰拿铁'][index % 3],
    price: [18, 16, 22][index % 3],
    picUrl: index % 3 === 2 ? coffee : tea,
    collectTime: '2026-11-09',
  }))
}
