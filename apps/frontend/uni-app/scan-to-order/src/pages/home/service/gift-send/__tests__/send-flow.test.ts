import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useGiftSendPage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ my: vi.fn(), openShare: vi.fn() }))
vi.mock('../../gift-card', () => ({ cardApi: api }))
vi.mock('@/utils/project/interaction', () => ({ showError: vi.fn() }))
const card = { id: 1, cardId: 10, amount: 20, status: 0 }
beforeEach(() => {
  seedSession()
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
  api.my.mockReset().mockResolvedValue([card])
  api.openShare.mockReset().mockResolvedValue('new-token')
})

it('修改赠送留言后，旧分享响应不能恢复凭证', async () => {
  const scope = effectScope()
  const vm = scope.run(useGiftSendPage)!
  try {
    await vm.init({ cardId: '1' })
    let finish!: (value: string) => void
    api.openShare.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const pending = vm.prepare()
    vm.remark.value = '新的留言'
    finish('old-token')
    await pending
    expect(vm.shareToken.value).toBe('')
    expect(vm.preparing.value).toBe(false)
    expect(vm.shareAppMessage().path).not.toContain('old-token')
    await vm.prepare()
    expect(api.openShare).toHaveBeenLastCalledWith(1, '新的留言')
    expect(vm.shareToken.value).toBe('new-token')
    expect(vm.shareAppMessage().path).toBe('/pages/home/service/gift-receive/index?id=1&shareToken=new-token')
  }
  finally { scope.stop() }
})

it('重新选择赠送卡片后，不允许旧卡片查询覆盖当前卡片', async () => {
  const scope = effectScope()
  const vm = scope.run(useGiftSendPage)!
  try {
    let finish!: (value: typeof card[]) => void
    api.my.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const first = vm.init({ cardId: '1' })
    api.my.mockResolvedValueOnce([{ ...card, id: 2 }])
    await vm.init({ cardId: '2' })
    finish([card])
    await first
    expect(vm.cardUser.value?.id).toBe(2)
  }
  finally { scope.stop() }
})
