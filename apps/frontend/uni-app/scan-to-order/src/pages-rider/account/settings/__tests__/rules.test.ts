import { effectScope } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import type { EffectScope } from 'vue'
import { useRiderSettingsRules } from '../composables/use-rules'
import { fetchRiderRules } from '../api/rules.api'
import { settingsSection, validateRules } from '../models/mappers'
import { createRules } from '../mock/fixtures'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useSessionState } from '@/pages/auth/session'

vi.mock('../api/rules.api', () => ({ fetchRiderRules: vi.fn() }))
const scopes: EffectScope[] = []
function page() {
  seedSession({}, 'rider')
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(useRiderSettingsRules)!
}
afterEach(() => scopes.splice(0).forEach(scope => scope.stop()))
it('规则读取失败可重试，非法结构不进入页面', async () => {
  const data = page()
  vi.mocked(fetchRiderRules).mockResolvedValueOnce({ maxConcurrent: 0 })
  await data.refresh()
  expect(data.rules.value).toBeNull()
  expect(data.error.value).toContain('无效')
  vi.mocked(fetchRiderRules).mockResolvedValueOnce(createRules())
  await data.refresh()
  expect(data.rules.value?.maxConcurrent).toBe(3)
  expect(data.error.value).toBe('')
  expect(data.loading.value).toBe(false)
})
it.each(['logout', 'dispose'])('%s 后的迟到规则不回填', async (kind) => {
  const data = page()
  let finish!: (value: unknown) => void
  vi.mocked(fetchRiderRules).mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = data.refresh()
  if (kind === 'logout')
    useSessionState().clearSession()
  else scopes[0].stop()
  finish(createRules())
  await pending
  expect(data.rules.value).toBeNull()
  expect(data.loading.value).toBe(false)
})
it('页面分区与规则协议分别校验，演示允许不自动超时', () => {
  expect(settingsSection('reminders')).toBe('reminders')
  expect(settingsSection(['reminders'])).toBe('rules')
  expect(validateRules(createRules()).assignmentTimeoutSeconds).toBe(90)
  expect(() => validateRules({ ...createRules(), serviceShops: [null] })).toThrow()
})
