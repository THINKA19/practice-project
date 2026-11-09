import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { orderingContentApi } from '../api/content.api'
import { useOrderingNoticeDetailPage } from '../composables/use-notice-detail-page'

vi.mock('../api/content.api', () => ({ orderingContentApi: { notices: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())

it('无效 URL 编号不请求，单条公告响应可展示', async () => {
  const vm = useOrderingNoticeDetailPage()
  await vm.init({ id: '1.5' })
  expect(orderingContentApi.notices).not.toHaveBeenCalled()
  vi.mocked(orderingContentApi.notices).mockResolvedValue({ id: 1, title: '通知', content: '公告正文' })
  await vm.init({ id: '1' })
  expect(vm.message.value?.content).toBe('公告正文')
})

it('切换消息与销毁实例均隔离迟到响应，错误后可以重试', async () => {
  let resolveOld!: (value: unknown) => void
  vi.mocked(orderingContentApi.notices)
    .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    .mockRejectedValueOnce(new Error('网络中断'))
    .mockResolvedValueOnce([{ id: 2, title: '新消息', content: '新正文' }])
  const scope = effectScope()
  const vm = scope.run(() => useOrderingNoticeDetailPage())!
  const old = vm.init({ id: '1' })
  await vm.init({ id: '2' })
  expect(vm.error.value).toBe('网络中断')
  await vm.load()
  expect(vm.message.value?.id).toBe(2)
  expect(vm.error.value).toBe('')
  scope.stop()
  resolveOld([{ id: 1, title: '旧消息', content: '旧正文' }])
  await old
  expect(vm.message.value?.id).toBe(2)
})
