/**
 * ============================================================================
 * 【文件概述】骑手登录的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderLoginCredentials：骑手登录输入；账号提交前去除首尾空白，密码保持原样。
 * 【综合使用示例】
 * import type { RiderLoginCredentials } from '@/pages-rider/auth/login/models/types'
 * const form: RiderLoginCredentials = { username: 'rider', password: '123456' }
 * ============================================================================
 */
/**
 * 骑手登录输入；账号提交前去除首尾空白，密码保持原样。
 * @example const form: RiderLoginCredentials = { username: 'rider', password: '123456' }
 */
export interface RiderLoginCredentials { username: string, password: string }
