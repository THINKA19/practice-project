/**
 * ============================================================================
 * 【文件概述】礼品卡send流程回归；验证异步状态隔离、失败恢复和参数边界。
 * 【方法与导出清单】无生产导出；Vitest 用例使用公开页面控制器验证行为。
 * 【综合使用示例】
 * import { effectScope } from 'vue'
 * import { useGiftSendPage } from '../composables/use-page'
 * const scope = effectScope()
 * const page = scope.run(useGiftSendPage) // => 创建隔离的页面状态；外部接口由用例替身提供
 * scope.stop() // => 释放会话监听
 * ============================================================================
 */
import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useGiftSendPage } from '../composables/use-page'
import { giftReceivePath, giftReceiveUrl, parseGiftReceiveUrl } from '../../routes'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ my: vi.fn(), openShare: vi.fn() }))
vi.mock('../../gift-card', async importOriginal => ({ ...await importOriginal<typeof import('../../gift-card')>(), cardApi: api }))
vi.mock('../api/send.api', () => ({ cardSendApi: api }))
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
    expect(api.openShare).toHaveBeenLastCalledWith({ id: 1, remark: '新的留言' })
    expect(vm.shareToken.value).toBe('new-token')
    expect(vm.shareAppMessage().path).toBe('/pages/home/service/gift-card-receive/index?id=1&shareToken=new-token')
  }
  finally {
    scope.stop()
  }
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
  finally {
    scope.stop()
  }
})

it('加载失败后原页重试，非法卡号不查询卡包', async () => {
  const scope = effectScope()
  const vm = scope.run(useGiftSendPage)!
  try {
    await vm.init({ cardId: '0' })
    expect(api.my).not.toHaveBeenCalled()
    api.my.mockRejectedValueOnce(new Error('offline'))
    await vm.init({ cardId: '1' })
    expect(vm.failed.value).toBe(true)
    await vm.retry()
    expect(vm.failed.value).toBe(false)
    expect(vm.cardUser.value?.id).toBe(1)
  }
  finally { scope.stop() }
})

it('重新打开赠送中的卡复用原凭证，好友已收到的链接保持有效', async () => {
  const scope = effectScope()
  const vm = scope.run(useGiftSendPage)!
  api.my.mockResolvedValueOnce([{ ...card, shareToken: 'existing-token' }])
  try {
    await vm.init({ cardId: '1' })
    expect(vm.shareToken.value).toBe('existing-token')
    expect(vm.shareAppMessage().path).toBe(giftReceivePath(1, 'existing-token'))
    expect(api.openShare).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})

it.each([
  ['hash', 'https://example.com/order/#/pages/home/service/gift-card/index', 'https://example.com/order/#/pages/home/service/gift-card-receive/index?id=7&shareToken=a%2Bb%2F%3F%26%25'],
  ['history', 'https://example.com/order/pages/home/service/gift-card/index', 'https://example.com/order/pages/home/service/gift-card-receive/index?id=7&shareToken=a%2Bb%2F%3F%26%25'],
])('h5 %s 领取链接保留部署目录和完整凭证，拒绝其他站点', (mode, current, expected) => {
  const path = giftReceivePath(7, 'a+b/?&%')
  const url = giftReceiveUrl(path, current, mode, '/order/')
  expect(url).toBe(expected)
  expect(parseGiftReceiveUrl(url, current, mode, '/order/')).toBe(path)
  expect(parseGiftReceiveUrl(url.replace('example.com', 'other.example'), current, mode, '/order/')).toBeNull()
  expect(parseGiftReceiveUrl(url.replace('id=7', 'id=0'), current, mode, '/order/')).toBeNull()
})
