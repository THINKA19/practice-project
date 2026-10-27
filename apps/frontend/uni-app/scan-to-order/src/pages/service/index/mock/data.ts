/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/service/index/mock/data.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createServiceGallery。
 * 【综合使用示例】
 * import { createServiceGallery } from '@/pages/service/index/mock/data'
 * ============================================================================
 */
import type { ActivityGalleryGroup } from '../models/types'
import gallery1 from '@/mock/assets/images/lunbo/01.jpg'
import gallery2 from '@/mock/assets/images/lunbo/02.jpg'
import gallery3 from '@/mock/assets/images/lunbo/03.jpg'
import gallery4 from '@/mock/assets/images/lunbo/04.jpg'
import gallery5 from '@/mock/assets/images/lunbo/05.jpg'
import gallery6 from '@/mock/assets/images/lunbo/06.jpg'
import gallery7 from '@/mock/assets/images/lunbo/07.jpg'
import gallery8 from '@/mock/assets/images/lunbo/08.jpg'

const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6, gallery7, gallery8]

/**
 * 创建服务图文的独立样本。
 * 无参数。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createServiceGallery().length // 6
 */
export function createServiceGallery(): ActivityGalleryGroup[] {
  const groups = [
    { id: 1, title: '门店活动', key: 'activities' },
    { id: 2, title: '用餐环境', key: 'environment' },
    { id: 3, title: '餐品展示', key: 'food' },
    { id: 4, title: '聚会活动', key: 'gatherings' },
    { id: 5, title: '节日主题', key: 'festivals' },
    { id: 6, title: '服务瞬间', key: 'moments' },
  ]
  return groups.map((group, groupIndex) => ({
    id: group.id,
    title: group.title,
    titleKey: `service.groups.${group.key}`,
    images: Array.from({ length: 16 }, (_, index) => ({
      url: galleryImages[(index + groupIndex * 2) % galleryImages.length],
      label: `${group.title} ${index + 1}`,
    })),
  }))
}
