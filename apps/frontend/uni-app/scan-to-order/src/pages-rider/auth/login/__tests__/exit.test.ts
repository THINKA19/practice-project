import { expect, it, vi } from 'vitest'
import { useRiderAuth } from '..'
import { useSession } from '@/pages/auth/session'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

vi.mock('@/pages/auth/session/api/session', () => ({ sessionApi: { logout: vi.fn().mockResolvedValue(null) } }))

it('取消退出保留身份，确认后清理唯一会话再返回我的页面', async () => {
  seedSession({}, 'rider')

  const auth = useRiderAuth()

  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: false, cancel: true, errMsg: '' })

  await auth.goBackClient()

  expect(useSession().identity).toBe('rider')

  expect(uni.reLaunch).not.toHaveBeenCalled()

  vi.mocked(uni.showModal).mockResolvedValueOnce({ confirm: true, cancel: false, errMsg: '' })

  await auth.goBackClient()

  expect(useSession().identity).toBeNull()

  expect(uni.reLaunch).toHaveBeenCalledWith({ url: '/pages/account/index/index' })
})
