/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / models/mappers.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - toShop：规范化门店可选数组与展示文本，保留原始坐标事实。
 * - toShopDetail：转换门店详情的 info，保留接口扩展字段。
 * - toPickPoints：兼容数组与 result 容器，转换自提门店列表。
 * - toDistance：读取距离接口的首个元素，供配送距离计算使用。
 * 【综合使用示例】
 * import { toShop } from '@/pages/ordering/index/models/mappers'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { Shop, ShopDetail } from './types'
import type { DistanceDto, ShopDetailDto, ShopDto } from '../api/shop.dto'
import { parsePromotions } from '../domain/promotion.rules'

/**
 * 规范化门店可选数组与展示文本，保留原始坐标事实。
 * @param dto {ShopDto} 服务端原始响应。
 * @returns Shop。
 * @example
 * import { toShop } from '@/pages/ordering/index/models/mappers'
 * declare const dto: Parameters<typeof toShop>[0]
 * toShop(dto) // => Shop
 */
export function toShop(dto: ShopDto): Shop {
  return {
    ...dto,
    businessState: ['open', 'upcoming', 'suspended', 'resting'].includes(dto.businessState ?? '') ? dto.businessState : undefined,
    openingHours: typeof dto.openingHours === 'string' ? dto.openingHours.trim() : undefined,
    openingState: dto.openingState === 'new' || dto.openingState === 'upcoming' ? dto.openingState : undefined,
    openingDate: typeof dto.openingDate === 'string' ? dto.openingDate : undefined,
    newUntil: typeof dto.newUntil === 'string' ? dto.newUntil : undefined,
    promotions: parsePromotions(dto.promotions),
    countryName: typeof dto.countryName === 'string' ? dto.countryName : undefined,
    cityName: typeof dto.cityName === 'string' ? dto.cityName : undefined,
    districtName: typeof dto.districtName === 'string' ? dto.districtName : undefined,
    photos: Array.isArray(dto.photos) ? dto.photos.filter((item): item is string => typeof item === 'string' && !!item.trim()) : [],
    services: Array.isArray(dto.services) ? dto.services.filter((item): item is string => typeof item === 'string' && !!item.trim()) : [],
    arrivalGuide: typeof dto.arrivalGuide === 'string' ? dto.arrivalGuide : undefined,
    parkingInfo: typeof dto.parkingInfo === 'string' ? dto.parkingInfo : undefined,
    notice: typeof dto.notice === 'string' ? dto.notice : undefined,
  }
}
/**
 * 转换门店详情的 info，保留接口扩展字段。
 * @param dto {ShopDetailDto} 服务端原始响应。
 * @returns ShopDetail。
 * @example
 * import { toShopDetail } from '@/pages/ordering/index/models/mappers'
 * declare const dto: Parameters<typeof toShopDetail>[0]
 * toShopDetail(dto) // => ShopDetail
 */
export function toShopDetail(dto: ShopDetailDto): ShopDetail {
  return { ...dto, info: toShop(dto.info) }
}
/**
 * 兼容数组与 result 容器，转换自提门店列表。
 * @param dto {ShopDto[] | { result?: ShopDto[] }} 服务端原始响应。
 * @returns Shop[]。
 * @example
 * import { toPickPoints } from '@/pages/ordering/index/models/mappers'
 * declare const dto: Parameters<typeof toPickPoints>[0]
 * toPickPoints(dto) // => Shop[]
 */
export function toPickPoints(dto: ShopDto[] | { result?: ShopDto[] }): Shop[] {
  return (Array.isArray(dto) ? dto : dto.result ?? []).map(toShop)
}
/**
 * 读取距离接口的首个元素，供配送距离计算使用。
 * @param dto {DistanceDto} 服务端原始响应。
 * @returns number。
 * @example
 * import { toDistance } from '@/pages/ordering/index/models/mappers'
 * declare const dto: Parameters<typeof toDistance>[0]
 * toDistance(dto) // => number
 */
export function toDistance(dto: DistanceDto): number {
  return Number(dto.result?.rows?.[0]?.elements?.[0]?.distance ?? 0)
}
