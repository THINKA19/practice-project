import { effectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { useGiftReceivePage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const mocks = vi.hoisted(() => ({ fetch: vi.fn().mockResolvedValue({ cardInfo: { id: 1, name: '礼品卡' } }), navigate: vi.fn() }))
vi.mock('../../gift-card', () => ({ cardApi: { fetchShare: mocks.fetch } }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ setTitle: vi.fn(), confirm: async () => true, withLoading: (action: () => Promise<unknown>) => action() }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))

it('好友链接先预览，主动领取后回到卡包，预览本身不领取', async () => {
  seedSession()
  const scope = effectScope()
  const vm = scope.run(useGiftReceivePage)!
  try {
    vm.init({ id: '1', shareToken: 'gift-token' })
    await flushPromises()
    expect(mocks.fetch).toHaveBeenCalledExactlyOnceWith('1', 'gift-token', true)
    expect(mocks.navigate).not.toHaveBeenCalled()
    vm.submit()
    await flushPromises()
    expect(mocks.fetch).toHaveBeenLastCalledWith('1', 'gift-token', false)
    expect(mocks.navigate).toHaveBeenCalledWith('/pages/home/service/gift-card/index', { tab: 'my' })
  }
  finally { scope.stop() }
})
