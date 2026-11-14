/**
 * ============================================================================
 * 【文件概述】骑手资料的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderProfileSaveDto：资料保存命令；仅提交原版本、姓名、手机号，不允许修改服务门店或资格。
 * 【综合使用示例】
 * import type { RiderProfileSaveDto } from '@/pages-rider/account/profile/api/profile.dto'
 * const dto: RiderProfileSaveDto = { version: 1, name: '骑手', phone: '13900000000' }
 * ============================================================================
 */
/**
 * 资料保存命令；仅提交原版本、姓名、手机号，不允许修改服务门店或资格。
 * @example const dto: RiderProfileSaveDto = { version: 1, name: '骑手', phone: '13900000000' }
 */
export interface RiderProfileSaveDto { version: number, name: string, phone: string }
