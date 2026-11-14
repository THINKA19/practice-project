/**
 * 【文件概述】商家分包本地模拟凭证交换；仅由本模块开发分支加载。
 * 【方法与导出清单】login
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { disabledStaffAccounts } from '@/pages-shop/staff/index/mock'
import { sessionState } from '@/pages/auth/session/mock'
/** 模拟老板 shop 和员工 shop-staff，密码均为 123456。 */
export async function login(username: string, password: string) {
  if (!['shop', 'shop-staff'].includes(username) || password !== '123456')
    throw new Error('模拟账号或密码错误')

  if (username === 'shop-staff' && disabledStaffAccounts.has('20002'))
    throw new Error('员工账号已停用')

  return sessionState.issue('shop', import.meta.env.VITE_AUTH_MODE === 'double', username === 'shop' ? 20001 : 20002)
}
