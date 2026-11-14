/**
 * ============================================================================
 * 【文件概述】个人中心的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderSettingItem：个人中心菜单项；含可见名称、用途描述、图标、颜色及点击行为。
 * - RiderAccountOverview：个人中心概览；level 为等级文字，rating 为 0～5 或未知 null，completedCount 为非负累计单量。
 * 【综合使用示例】
 * import type { RiderSettingItem } from '@/pages-rider/account/index/models/types'
 * const open = (item: RiderSettingItem) => item.action?.()
 * ============================================================================
 */
/**
 * 个人中心菜单项；含可见名称、用途描述、图标、颜色及点击行为。
 * @example const open = (item: RiderSettingItem) => item.action()
 */
export interface RiderSettingItem { name: string, description: string, icon: string, color: string, action?: () => void, contact?: boolean }

/**
 * 个人中心概览；level 为等级文字，rating 为 0～5 或未知 null，completedCount 为非负累计单量。
 * @example const ratingText = (value: RiderAccountOverview) => value.rating ?? '—'
 */
export interface RiderAccountOverview { level: string, rating: number | null, completedCount: number }
