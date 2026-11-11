/**
 * ============================================================================
 * 【文件概述】service/group-buying/mock/data.ts，负责开发 Mock 数据与请求处理。
 * 【方法与导出清单】createGroups
 * 【综合使用示例】
 * import { createGroups } from '@/pages/home/service/group-buying/mock/data'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
import tea from '@/mock/assets/images/home/products/tea.jpg'
import coffee from '@/mock/assets/images/home/products/coffee.jpg'
import type { GroupBuying } from '../models/types'
/**
 * 创建包含进行中与已结束状态的独立团购样本。
 * 无参数。
 * @returns GroupBuying[]
 * @example // createGroups 的调用参数及接入位置见本文件顶部示例和所属页面。
 */
export function createGroups(): GroupBuying[] {
  return Array.from({ length: 18 }, (_, index) => ({
    id: index + 1,
    name: ['双杯茶饮团购', '午后咖啡套餐', '周末茶友欢聚'][index % 3],
    description: '指定茶饮组合套餐，成团后可到店使用。页面展示为开发学习流程。',
    price: 29.9 + index,
    originalPrice: 39.9 + index,
    people: 3,
    joined: 1,
    endsAt: Date.now() + (index === 17 ? -3600000 : 86400000 * (index % 3 + 1)),
    image: index % 3 === 1 ? coffee : tea,
    participating: false,
  }))
}
