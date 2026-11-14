import { beforeEach, expect, it } from 'vitest'
import { sessionState } from '@/pages/auth/session/mock'
import { read, reset, save } from '../mock'
import { profileDraftError } from '../domain/profile.rules'
import { toRiderProfile } from '../models/mappers'

function authorization(userId: number) {
  const token = sessionState.issue('rider', false, userId)
  return `Bearer ${'token' in token ? token.token : token.accessToken}`
}
beforeEach(() => {
  reset()
  sessionState.reset()
})
it('资料按账号隔离，保存检查版本，读取副本不能直接修改后端', () => {
  const a = authorization(1)
  const b = authorization(2)
  const old = read(a)
  const changed = save(a, old.version, '新姓名', '13900000000')
  expect(changed.version).toBe(old.version + 1)
  expect(read(b).name).not.toBe('新姓名')
  changed.station.phone = 'changed'
  expect(read(a).station.phone).not.toBe('changed')
  expect(() => save(a, old.version, '过期覆盖', '13900000000')).toThrow('重新加载')
})
it('统一表单规则拒绝空姓名和非法电话，响应校验拒绝残缺站点', () => {
  expect(profileDraftError({ name: ' ', phone: '13900000000' })).not.toBe('')
  expect(profileDraftError({ name: '骑手', phone: '123' })).not.toBe('')
  expect(profileDraftError({ name: ' 骑手 ', phone: '13900000000' })).toBe('')
  const a = authorization(1)
  expect(() => save(a, 1, '骑手', '123')).toThrow()
  expect(() => toRiderProfile({ ...read(a), station: null })).toThrow('资料无效')
})
