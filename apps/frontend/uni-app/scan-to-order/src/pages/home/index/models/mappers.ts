import type { BannerDto } from '../api/banner.dto'
import type { Banner } from './types'

/** 将空响应转换为空列表，过滤缺失或空白图片地址的轮播记录。 */
export function parseBanners(data: BannerDto[] | null): Banner[] {
  return Array.isArray(data) ? data.filter(item => item && typeof item.picUrl === 'string' && item.picUrl.trim()) : []
}
