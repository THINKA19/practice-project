import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useMemberCenterPage } from '../composables/use-page'

const mocks = vi.hoisted(() => ({ guard: vi.fn(), navigate: vi.fn(), toast: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({
  useSessionState: () => reactive({ hasLogin: false, identity: null, sessionRevision: 0, updateNowTime: vi.fn() }),
  requireIdentity: mocks.guard,
}))
vi.mock('@/pages/account/assets/asset', () => ({ assetApi: { amount: vi.fn() }, isAssetDemo: () => false }))
vi.mock('../composables/use-requests', () => ({ levelApi: { available: false, levels: vi.fn() } }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
vi.mock('@/utils/project/feedback', () => ({ toast: mocks.toast }))
vi.mock('@/locale', () => ({ t: () => '页面打开失败' }))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.guard.mockReturnValue(true)
  mocks.navigate.mockResolvedValue({ ok: true })
})

it('会员服务校验顾客身份，导航到已注册业务页并反馈导航失败', async () => {
  const scope = effectScope()
  const page = scope.run(useMemberCenterPage)!
  try {
    mocks.guard.mockReturnValue(false)
    await page.openService('wallet')
    expect(mocks.guard).toHaveBeenCalledWith('customer')
    expect(mocks.navigate).not.toHaveBeenCalled()
    mocks.guard.mockReturnValue(true)
    const targets = {
      wallet: '/pages/account/assets/asset/index',
      score: '/pages/account/assets/score/index',
      code: '/pages/account/users/user-code/index',
      coupons: '/pages/home/user/coupons/index',
    } as const
    for (const service of Object.keys(targets) as (keyof typeof targets)[]) {
      await page.openService(service)
      expect(mocks.navigate).toHaveBeenLastCalledWith(targets[service])
    }
    mocks.navigate.mockResolvedValue({ ok: false })
    await page.openService('code')
    expect(mocks.toast).toHaveBeenCalledWith('页面打开失败')
  }
  finally {
    scope.stop()
  }
})
