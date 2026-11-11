/**
 * ============================================================================
 * 【文件概述】礼品卡receive流程回归；验证异步状态隔离、失败恢复和参数边界。
 * 【方法与导出清单】无生产导出；Vitest 用例使用公开页面控制器验证行为。
 * 【综合使用示例】
 * import { effectScope } from 'vue'
 * import { useGiftReceivePage } from '../composables/use-page'
 * const scope = effectScope()
 * const page = scope.run(useGiftReceivePage) // => 创建隔离的页面状态；外部接口由用例替身提供
 * scope.stop() // => 释放会话监听
 * ============================================================================
 */
import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { useGiftReceivePage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { clearSession, redirectToLogin } from '@/pages/auth/session'
import { giftReceivePath } from '../../routes'

const mocks = vi.hoisted(() => ({ fetch: vi.fn().mockResolvedValue({ cardUser: { id: 1, cardId: 1, amount: 100, status: 0 }, cardInfo: { id: 1, name: '礼品卡', amount: 100 } }), navigate: vi.fn() }))
vi.mock('../api/receive.api', () => ({ cardReceiveApi: { fetchShare: mocks.fetch } }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ setTitle: vi.fn(), confirm: async () => true, withLoading: (action: () => Promise<unknown>) => action() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))

it('登录回跳保留卡号与完整凭证，恢复页面后先预览', async () => {
  clearSession()
  const navigateTo = vi.fn()
  Object.assign(uni, { navigateTo })
  vi.stubGlobal('getCurrentPages', () => [])
  mocks.fetch.mockClear()
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  const query = { id: '1', shareToken: 'token+/%&' }
  try {
    vm.init(query)
    redirectToLogin.flush()
    expect(vm.loginRequired.value).toBe(true)
    expect(mocks.fetch).not.toHaveBeenCalled()
    const url = navigateTo.mock.calls[0][0].url as string
    expect(new URLSearchParams(url.split('?')[1]).get('redirect')).toBe(giftReceivePath(query.id, query.shareToken))
    seedSession()
    vm.init(query)
    await flushPromises()
    expect(vm.loginRequired.value).toBe(false)
    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith({ ...query, calculate: true })
  }
  finally {
    redirectToLogin.cancel()
    mocks.fetch.mockClear()
    scope.stop()
    vi.unstubAllGlobals()
  }
})

it('好友链接先预览，主动领取后回到卡包，预览本身不领取', async () => {
  seedSession()
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  try {
    vm.init({ id: '1', shareToken: 'gift-token' })
    await flushPromises()
    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith({ id: '1', shareToken: 'gift-token', calculate: true })
    expect(mocks.navigate).not.toHaveBeenCalled()
    vm.submit()
    await flushPromises()
    expect(mocks.fetch).toHaveBeenLastCalledWith({ id: '1', shareToken: 'gift-token', calculate: false })
    expect(mocks.navigate).toHaveBeenCalledWith('/pages/home/service/gift-card/index', { tab: 'my' })
  }
  finally {
    scope.stop()
  }
})

it('预览失败留在页面重查，不当作领取成功或强制离开', async () => {
  seedSession()
  mocks.fetch.mockReset().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ cardUser: { id: 1, cardId: 1, amount: 100, status: 0 }, cardInfo: { id: 1, name: '礼品卡', amount: 100 } })
  mocks.navigate.mockClear()
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  try {
    vm.init({ id: '1', shareToken: 'gift-token' })
    await flushPromises()
    expect(vm.failed.value).toBe(true)
    expect(mocks.navigate).not.toHaveBeenCalled()
    await vm.retry()
    expect(vm.failed.value).toBe(false)
    expect(vm.cardInfo.value?.name).toBe('礼品卡')
    expect(mocks.fetch).toHaveBeenLastCalledWith({ id: '1', shareToken: 'gift-token', calculate: true })
  }
  finally { scope.stop() }
})

it('更换分享链接后旧预览不可覆盖新卡，非法链接不请求', async () => {
  seedSession()
  mocks.fetch.mockReset()
  let finish!: (value: unknown) => void
  mocks.fetch.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  mocks.fetch.mockResolvedValueOnce({ cardUser: { id: 2, cardId: 2, amount: 100, status: 0 }, cardInfo: { id: 2, name: '新卡', amount: 100 } })
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  try {
    vm.init({ id: '1', shareToken: 'old' })
    vm.init({ id: '2', shareToken: 'new' })
    await flushPromises()
    finish({ cardInfo: { id: 1, name: '旧卡' } })
    await flushPromises()
    expect(vm.cardInfo.value?.name).toBe('新卡')
    vm.init({ id: '0', shareToken: 'invalid' })
    await vm.retry()
    vm.submit()
    expect(vm.invalid.value).toBe(true)
    expect(vm.cardInfo.value).toBeUndefined()
    expect(mocks.fetch).toHaveBeenCalledTimes(2)
  }
  finally { scope.stop() }
})

it('旧预览先结束也不能解锁新请求的提交状态', async () => {
  seedSession()
  mocks.fetch.mockReset()
  let finishOld!: (value: unknown) => void
  let finishNew!: (value: unknown) => void
  mocks.fetch.mockReturnValueOnce(new Promise((resolve) => {
    finishOld = resolve
  }))
  mocks.fetch.mockReturnValueOnce(new Promise((resolve) => {
    finishNew = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  try {
    vm.init({ id: '1', shareToken: 'old' })
    vm.init({ id: '2', shareToken: 'new' })
    finishOld({ cardInfo: { id: 1 } })
    await flushPromises()
    expect(vm.submitting.value).toBe(true)
    finishNew({ cardUser: { id: 2, cardId: 2, amount: 100, status: 0 }, cardInfo: { id: 2, name: '新卡', amount: 100 } })
    await flushPromises()
    expect(vm.submitting.value).toBe(false)
    expect(vm.cardInfo.value?.id).toBe(2)
  }
  finally { scope.stop() }
})
