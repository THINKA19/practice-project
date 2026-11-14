import { describe, expect, it, vi } from 'vitest'
import { useRiderProfileStore } from '../composables/use-store'
import { fetchRiderProfile, saveRiderProfile } from '../api/profile.api'
import type { RiderAccountProfile } from '../models/types'
import { useSessionState } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

vi.mock('../api/profile.api', () => ({ fetchRiderProfile: vi.fn(), saveRiderProfile: vi.fn() }))
const profile: RiderAccountProfile = { id: 'R1', name: '新姓名', phone: '13900000000', version: 2, joinedAt: '2026-10-11', serviceShops: [], station: { name: '演示站', contactName: '站长', phone: '', isDemo: true } }
describe('骑手资料请求身份隔离', () => {
  it('保存资料不直接改写只读会话，退出清空资料', async () => {
    const session = useSessionState()
    seedSession({ nickname: '旧姓名' }, 'rider')
    vi.mocked(saveRiderProfile).mockResolvedValue(profile)
    const store = useRiderProfileStore()
    expect(await store.save(profile.name, profile.phone, 1)).toBe(true)
    expect(store.profile?.name).toBe('新姓名')
    expect(session.userInfo.nickname).toBe('旧姓名')
    session.clearSession()
    expect(store.profile).toBeNull()
  })
  it('退出后以相同token重新登录，旧保存响应也不能覆盖新会话', async () => {
    const session = useSessionState()
    seedSession({ nickname: '当前姓名' }, 'rider')
    let resolve!: (value: RiderAccountProfile) => void
    vi.mocked(saveRiderProfile).mockReturnValue(new Promise((done) => {
      resolve = done
    }))
    const store = useRiderProfileStore()
    const saving = store.save('旧请求', profile.phone, 1)
    session.clearSession()
    seedSession({ nickname: '当前姓名' }, 'rider')
    resolve(profile)
    expect(await saving).toBe(false)
    expect(store.profile).toBeNull()
    expect(session.userInfo.nickname).toBe('当前姓名')
  })
  it('资料读取期间退出，迟到响应不能回填', async () => {
    const session = useSessionState()
    seedSession({ nickname: '旧姓名' }, 'rider')
    let resolve!: (value: RiderAccountProfile) => void
    vi.mocked(fetchRiderProfile).mockReturnValue(new Promise((done) => {
      resolve = done
    }))
    const store = useRiderProfileStore()
    const loading = store.refresh()
    session.clearSession()
    resolve(profile)
    await loading
    expect(store.profile).toBeNull()
    expect(store.loading).toBe(false)
  })
})
