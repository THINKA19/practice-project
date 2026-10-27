import type { Assets, CustomerProfileForm, UploadedAttachment } from './types'
import { profileError } from '../domain/account.rules'

/** 校验外部数据，不把缺失或无效字段转换为零。 */
export function parseAssets(value: unknown): Assets {
  if (!value || typeof value !== 'object')
    throw new Error('Invalid assets')
  const data = value as Record<string, unknown>
  for (const key of ['couponCount', 'balanceCents', 'points']) {
    if (typeof data[key] !== 'number' || !Number.isSafeInteger(data[key]) || data[key] < 0)
      throw new Error('Invalid assets')
  }
  if (data.demo !== true)
    throw new Error('Invalid asset source')
  return { couponCount: data.couponCount as number, balanceCents: data.balanceCents as number, points: data.points as number, demo: true }
}

/** 校验上传协议并提取地址；服务端不确认成功或地址无效时拒绝继续提交业务表单。 */
export function parseUploadedAttachment(raw: string): UploadedAttachment {
  const body: unknown = JSON.parse(raw)
  if (!body || typeof body !== 'object' || !('code' in body) || ![0, 200].includes(Number(body.code)) || !('data' in body))
    throw new Error('附件上传未确认')
  const data = body.data
  if (!data || typeof data !== 'object' || !('url' in data) || typeof data.url !== 'string' || !/^https?:\/\//.test(data.url))
    throw new Error('附件地址无效')
  return { url: data.url }
}

/** 校验资料响应并仅保留前端编辑需要的性别和生日字段。 */
export function parseProfile(value: unknown): CustomerProfileForm {
  if (!value || typeof value !== 'object')
    throw new Error('资料格式错误')
  const data = value as Record<string, unknown>
  if (typeof data.birthday !== 'string' || !['unknown', 'male', 'female'].includes(String(data.gender))) {
    throw new Error('资料格式错误')
  }
  const form = data as unknown as CustomerProfileForm
  if (profileError(form))
    throw new Error('资料格式错误')
  return { gender: form.gender, birthday: form.birthday }
}
