import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useRiderAccountContact } from '../composables/use-contact'
import { useRiderProfileStore } from '@/pages-rider/account/profile'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { createProfile } from '../../profile/mock/fixtures'

const mocks = vi.hoisted(() => ({ confirm: vi.fn(), toast: vi.fn() }))
vi.mock('@/utils/project/interaction', () => ({ confirm: mocks.confirm, toast: mocks.toast }))
vi.mock('@/pages-rider/account/profile/api/profile.api', () => ({ fetchRiderProfile: vi.fn(), saveRiderProfile: vi.fn() }))
it('演示站点只能复制，真实站点返回号码给电话组件', async () => {
  seedSession({}, 'rider')
  const store = useRiderProfileStore()
  store.profile = createProfile('1', '骑手')
  const copy = vi.fn()
  Object.assign(uni, { setClipboardData: copy })
  mocks.confirm.mockResolvedValue(true)
  const scope = effectScope()
  const page = scope.run(useRiderAccountContact)!
  await expect(page.resolveStationPhone()).resolves.toBeUndefined()
  expect(copy).toHaveBeenCalledWith(expect.objectContaining({ data: store.profile.station.phone }))
  store.profile.station.isDemo = false
  await expect(page.resolveStationPhone()).resolves.toBe(store.profile.station.phone)
  scope.stop()
})
it.each(['account', 'dispose'])('%s 变化后旧确认不得拨号', async (kind) => {
  seedSession({}, 'rider')
  const store = useRiderProfileStore()
  store.profile = createProfile('1', '骑手')
  store.profile.station.isDemo = false
  let finish!: (value: boolean) => void
  mocks.confirm.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const page = scope.run(useRiderAccountContact)!
  const pending = page.resolveStationPhone()
  if (kind === 'account')
    seedSession({ userId: 2 }, 'rider')
  else scope.stop()
  finish(true)
  await expect(pending).resolves.toBeUndefined()
  scope.stop()
})
