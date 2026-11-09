/**
 * ============================================================================
 * 【文件概述】菜单选品 / models/goods.mappers.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - toGoodsList：复制商品分页数据与商品条目，隔离原始 DTO 引用。
 * - toGoodsDetail：复制商品详情及规格列表，隔离原始 DTO 引用。
 * 【综合使用示例】
 * import { toGoodsList } from '@/pages/ordering/menu/models/goods.mappers'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { GoodsDetailDto, GoodsListResultDto } from '../api/goods.dto'
import type { GoodsDetail, GoodsListResult } from './goods.types'

/**
 * 复制商品分页数据与商品条目，隔离原始 DTO 引用。
 * @param dto {GoodsListResultDto} 服务端原始响应。
 * @returns GoodsListResult。
 * @example
 * import { toGoodsList } from '@/pages/ordering/menu/models/goods.mappers'
 * declare const dto: Parameters<typeof toGoodsList>[0]
 * toGoodsList(dto) // => GoodsListResult
 */
export function toGoodsList(dto: GoodsListResultDto): GoodsListResult {
  return { ...dto, result: dto.result.map(g => ({ ...g })) }
}
/**
 * 复制商品详情及规格列表，隔离原始 DTO 引用。
 * @param dto {GoodsDetailDto} 服务端原始响应。
 * @returns GoodsDetail。
 * @example
 * import { toGoodsDetail } from '@/pages/ordering/menu/models/goods.mappers'
 * declare const dto: Parameters<typeof toGoodsDetail>[0]
 * toGoodsDetail(dto) // => GoodsDetail
 */
export function toGoodsDetail(dto: GoodsDetailDto): GoodsDetail {
  return { ...dto, basicInfo: { ...dto.basicInfo }, properties: dto.properties?.map(p => ({ ...p, childsCurGoods: p.childsCurGoods.map(c => ({ ...c })) })), pics: dto.pics?.map(p => ({ ...p })), subPics: dto.subPics?.map(p => ({ ...p })) }
}
