import { createApp, nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { expect, it } from 'vitest'
import { createSessionState } from '../state'
import { useMockSessionData } from '../storage'
import type { MockSessionData } from '../storage'

function install(data: Record<string, string>) {
  const pinia = createPinia()
  pinia.use(createPersistedState({ storage: {
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = value },
  } }))
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return createSessionState(Date.now, () => useMockSessionData())
}
it('重新创建运行时后仍识别已签发身份，退出后旧凭证不能恢复', async () => {
  const data: Record<string, string> = {}
  const first = install(data)
  const credential = first.issue('customer') as { token: string }
  await nextTick()
  useMockSessionData().$persist()
  const second = install(data)
  expect(second.profile(credential.token)?.userId).toBe(10001)
  expect(second.profile(credential.token)?.avatar).toBe('/static/images/avatar.jpg')
  second.logout(credential.token)
  await nextTick()
  useMockSessionData().$persist()
  const third = install(data)
  expect(third.profile(credential.token)).toBeNull()
  const next = third.issue('customer') as { token: string }
  expect(third.profile(next.token)?.userId).toBe(10001)
})
it('重启后可刷新双凭证，旧凭证作废且保留用户头像', () => {
  let data: MockSessionData = { sessions: [], users: [] }
  const first = createSessionState(Date.now, () => data)
  const credential = first.issue('customer', true) as { accessToken: string, refreshToken: string }
  data = JSON.parse(JSON.stringify(data))
  const second = createSessionState(Date.now, () => data)
  const updated = second.refresh(credential.refreshToken) as { accessToken: string }
  expect(updated).toBeTruthy()
  expect(second.profile(credential.accessToken)).toBeNull()
  expect(second.profile(updated.accessToken)?.avatar).toBe('/static/images/avatar.jpg')
})
it('不接受未签发、过期或损坏的存储凭证', () => {
  let now = 1000
  let data: MockSessionData = { sessions: [], users: [] }
  const first = createSessionState(() => now, () => data)
  const credential = first.issue('customer') as { token: string }
  now += 3600001
  data = JSON.parse(JSON.stringify(data))
  const second = createSessionState(() => now, () => data)
  expect(second.profile(credential.token)).toBeNull()
  expect(second.profile('wx-demo-session-unissued')).toBeNull()
})
