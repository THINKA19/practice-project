/**
 * ============================================================================
 * 【文件概述】骑手资料的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderAccountProfile：版本化骑手资料；含姓名、手机号、加入日期、服务门店与站点，isDemo 站点禁止直接拨号。
 * - RiderProfileDraft：资料编辑草稿；姓名最多 30 字，手机号须为 11 位，提交前去除首尾空白。
 * 【综合使用示例】
 * import type { RiderAccountProfile } from '@/pages-rider/account/profile/models/types'
 * const phone = (profile: RiderAccountProfile) => profile.phone
 * ============================================================================
 */
/**
 * 版本化骑手资料；含姓名、手机号、加入日期、服务门店与站点，isDemo 站点禁止直接拨号。
 * @example const phone = (profile: RiderAccountProfile) => profile.phone
 */
export interface RiderAccountProfile {
  id: string
  name: string
  phone: string
  joinedAt: string
  version: number
  serviceShops: { id: string, name: string }[]
  station: { name: string, contactName: string, phone: string, isDemo: boolean }
}
/**
 * 资料编辑草稿；姓名最多 30 字，手机号须为 11 位，提交前去除首尾空白。
 * @example const draft: RiderProfileDraft = { name: '骑手', phone: '13900000000' }
 */
export interface RiderProfileDraft { name: string, phone: string }
