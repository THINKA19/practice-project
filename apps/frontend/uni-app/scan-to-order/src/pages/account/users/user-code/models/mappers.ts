import type { MemberCode } from './types'

/**
 * 校验开发响应，拒绝空码、过期码及未标记的样本；不适用于真实核销协议。
 * @param value Alova 解包后的业务数据。
 * @param now 当前 Unix 毫秒时间戳，测试可传固定时间。
 * @returns 经校验且只包含已知字段的开发码。
 * @example parseMemberCode(data)
 */
export function parseMemberCode(value: unknown, now = Date.now()): MemberCode {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('会员码数据格式错误')
  const data = value as Record<string, unknown>
  if (typeof data.code !== 'string' || !/^DEMO-[A-Za-z0-9-]{1,100}$/.test(data.code)
    || !Number.isSafeInteger(data.expiresAt) || Number(data.expiresAt) <= now
    || Number(data.expiresAt) > now + 60000 || data.demo !== true) {
    throw new Error('会员码数据无效或已过期')
  }
  return { code: data.code, expiresAt: Number(data.expiresAt), demo: true }
}
