/**
 * 【文件概述】商家分包本地模拟凭证交换；仅由本模块开发分支加载。
 * 【方法与导出清单】login
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { sessionState } from '@/pages/auth/session/mock'
/** 模拟账号 shop / 123456；仅签发该端身份。 */
export async function login(username: string, password: string) {
  if (username !== 'shop' || password !== '123456')
    throw new Error('模拟账号或密码错误')

  return sessionState.issue('shop', import.meta.env.VITE_AUTH_MODE === 'double')
}
