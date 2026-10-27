import { beforeEach, expect, it, vi } from 'vitest'
import { submitFeedback } from '../composables/use-actions'
import { feedbackApi } from '../composables/use-requests'
import { uploadAttachment } from '@/pages/account/index'

let revision = 0
vi.mock('@/pages/auth/session', () => ({ getSessionRevision: () => revision }))
vi.mock('../composables/use-requests', () => ({ feedbackApi: { submit: vi.fn() } }))
vi.mock('@/pages/account/index', () => ({ uploadAttachment: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()
  revision++
})

it('任一附件上传失败都不提交缺少附件的反馈', async () => {
  vi.mocked(uploadAttachment).mockResolvedValueOnce('https://files.test/a.jpg').mockRejectedValueOnce(new Error('上传失败'))
  await expect(submitFeedback({ name: '顾客', content: '问题', files: ['/a.jpg', '/b.jpg'] })).rejects.toThrow('上传失败')
  expect(feedbackApi.submit).not.toHaveBeenCalled()
})

it('上传期间换账户，不得用新账户继续提交旧表单', async () => {
  let finish!: (url: string) => void
  vi.mocked(uploadAttachment).mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const pending = submitFeedback({ name: '旧账户', content: '问题', files: ['/a.jpg', '/b.jpg'] })
  revision++
  finish('https://files.test/a.jpg')
  await expect(pending).rejects.toThrow('账户已切换')
  expect(uploadAttachment).toHaveBeenCalledTimes(1)
  expect(feedbackApi.submit).not.toHaveBeenCalled()
})
