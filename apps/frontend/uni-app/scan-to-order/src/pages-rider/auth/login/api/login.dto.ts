/**
 * ============================================================================
 * 【文件概述】骑手登录的请求与接口契约层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - LoginCredentialsDto：骑手凭证交换 DTO，与本模块校验后的账号密码输入保持一致。
 * 【综合使用示例】
 * import type { LoginCredentialsDto } from '@/pages-rider/auth/login/api/login.dto'
 * const dto: LoginCredentialsDto = { username: 'rider', password: '123456' }
 * ============================================================================
 */
import type { RiderLoginCredentials } from '../models/types'

/**
 * 骑手凭证交换 DTO，与本模块校验后的账号密码输入保持一致。
 * @example const dto: LoginCredentialsDto = { username: 'rider', password: '123456' }
 */
export type LoginCredentialsDto = RiderLoginCredentials

export interface WechatPhoneCredentialsDto {
  loginCode: string
  phoneCode: string
}
