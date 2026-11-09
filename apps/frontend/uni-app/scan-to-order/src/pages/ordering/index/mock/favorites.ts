/**
 * ============================================================================
 * 【文件概述】收藏 Mock 状态按顾客归属隔离并持久化，不作为正式服务。
 * 【方法与导出清单】favoriteAccount：顾客数据访问；reset：公共 Mock 重置接缝。
 * 【综合使用示例】import { favoriteAccount } from './favorites'; // 仅 Mock 内调用
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { mockCustomerOwner } from '@/pages/auth/session/mock'

const useData = defineStore('mock-shop-favorites', {
  state: () => ({ accounts: {} as Record<string, number[]> }),
  persist: true,
})

/** 清空演示收藏。无参数。@returns void。@example reset() // => 所有演示收藏为空 */
export function reset() {
  useData().$reset()
}

/** 校验顾客演示凭证。@param authorization 请求凭证。@returns 当前顾客的 ids/set 操作。@example favoriteAccount(headers.Authorization).ids() // => 收藏 ID 数组 */
export function favoriteAccount(authorization: unknown) {
  if (!/^Bearer wx-demo-session-\S+$/.test(String(authorization ?? '')))
    throw new Error('请先登录顾客账号')
  const owner = mockCustomerOwner(authorization)
  const data = useData()
  return {
    ids: () => data.accounts[owner] ?? [],
    set: (ids: number[]) => { data.accounts[owner] = ids },
  }
}
