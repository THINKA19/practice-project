/**
 * ============================================================================
 * 【文件概述】兑换页面回归，覆盖表单条件、重复写入与会话迟到响应。
 * 【方法与导出清单】无生产导出；Vitest 用例。
 * 【综合使用示例】
 * import { useCardExchangePage } from '../composables/use-page'
 * import { effectScope } from 'vue'
 * const scope = effectScope()
 * const page = scope.run(useCardExchangePage) // => 独立表单状态
 * scope.stop() // => 清理会话监听并作废迟到响应
 * ============================================================================
 */
import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCardExchangePage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const mocks = vi.hoisted(() => ({ exchange: vi.fn(), alert: vi.fn(), error: vi.fn() }))
vi.mock('../api/exchange.api', () => ({ cardExchangeApi: { exchange: mocks.exchange } }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ alert: mocks.alert, showError: mocks.error, setTitle: vi.fn(), toast: vi.fn(), withLoading: (action: () => Promise<unknown>) => action() }))

beforeEach(() => {
  seedSession()
  mocks.exchange.mockReset().mockResolvedValue(null)
  mocks.alert.mockReset().mockResolvedValue(undefined)
  mocks.error.mockReset()
})

it('空兑换码或未确认协议不发送，合法提交清理首尾空白', async () => {
  const scope = effectScope()
  const page = scope.run(useCardExchangePage)!
  try {
    await page.submit()
    page.number.value = ' GIFT-DEMO '
    await page.submit()
    expect(mocks.exchange).not.toHaveBeenCalled()
    page.agree.value = true
    await page.submit()
    expect(mocks.exchange).toHaveBeenCalledExactlyOnceWith({ number: 'GIFT-DEMO' })
    expect(page.redeemed.value).toBe(true)
    await page.submit()
    expect(mocks.exchange).toHaveBeenCalledOnce()
  }
  finally { scope.stop() }
})

it('提交中禁止重复写入，失败保留表单供用户处理', async () => {
  const scope = effectScope()
  const page = scope.run(useCardExchangePage)!
  let reject!: (error: Error) => void
  mocks.exchange.mockReturnValueOnce(new Promise((_, fail) => {
    reject = fail
  }))
  try {
    page.number.value = 'GIFT-DEMO'
    page.agree.value = true
    const pending = page.submit()
    await page.submit()
    expect(mocks.exchange).toHaveBeenCalledOnce()
    reject(new Error('offline'))
    await pending
    expect(page.submitting.value).toBe(false)
    expect(page.redeemed.value).toBe(false)
    expect(page.number.value).toBe('GIFT-DEMO')
    expect(mocks.error).toHaveBeenCalledOnce()
  }
  finally { scope.stop() }
})

it('切换账户后旧兑换成功不弹窗、不恢复完成状态', async () => {
  const scope = effectScope()
  const page = scope.run(useCardExchangePage)!
  let finish!: (value: null) => void
  mocks.exchange.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  try {
    page.number.value = 'GIFT-DEMO'
    page.agree.value = true
    const pending = page.submit()
    seedSession({ userId: 2 })
    finish(null)
    await pending
    expect(page.number.value).toBe('')
    expect(page.redeemed.value).toBe(false)
    expect(mocks.alert).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})
