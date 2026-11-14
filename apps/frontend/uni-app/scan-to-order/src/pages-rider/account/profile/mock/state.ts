/**
 * ============================================================================
 * 【文件概述】骑手资料的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - read：骑手资料模拟数据读取；拒绝无效骑手凭证。
 * - save：按资料版本保存模拟姓名与电话，返回隔离的最新副本。
 * - reset：清空本模块的模拟数据；下一次读取重新创建样本。
 * 【综合使用示例】
 * import { read } from '@/pages-rider/account/profile/mock/state'
 * read(authorization) // 当前模拟账号的数据副本
 * ============================================================================
 */
import { sessionState } from '@/pages/auth/session/mock'
import { profileDraftError } from '../domain/profile.rules'
import { createProfile } from './fixtures'
import type { RiderAccountProfile } from '../models/types'

const profiles = new Map<string, RiderAccountProfile>()
/**
 * 骑手资料模拟数据读取；拒绝无效骑手凭证。
 * @param authorization {string} Bearer 模拟会话凭证
 * @returns 当前模拟骑手的业务资料或规则；非法凭证抛错。
 * @example read(authorization) // 当前模拟账号的数据副本
 */
export function read(authorization: string): RiderAccountProfile {
  const user = sessionState.profile(authorization.replace(/^Bearer /, ''))
  if (user?.identity !== 'rider')
    throw new Error('骑手登录已失效')
  const id = String(user.userId)
  if (!profiles.has(id))
    profiles.set(id, createProfile(id, user.nickname))
  return JSON.parse(JSON.stringify(profiles.get(id))) as RiderAccountProfile
}
/**
 * 按资料版本保存模拟姓名与电话，返回隔离的最新副本。
 * @param authorization {string} Bearer 模拟会话凭证
 * @param version {number} 资料乐观锁版本
 * @param name {string} 骑手展示姓名
 * @param phone {string} 11 位手机号
 * @returns 更新后资料副本；版本冲突或草稿非法时抛错。
 * @example save(authorization, 1, '骑手', '13900000000') // 版本有效时返回 version=2 的资料
 */
export function save(authorization: string, version: number, name: string, phone: string) {
  const issue = profileDraftError({ name, phone })
  if (issue)
    throw new Error(issue)
  const profile = read(authorization)
  if (profile.version !== version)
    throw new Error('资料已更新，请重新加载后保存')
  const updated = { ...profile, version: version + 1, name, phone }
  profiles.set(profile.id, updated)
  return read(authorization)
}

/**
 * 清空本模块的模拟数据；下一次读取重新创建样本。
 * 无参数。
 * @returns {void} 不影响真实登录会话
 * @example reset() // void；不影响真实登录会话
 */
export function reset() {
  profiles.clear()
}
