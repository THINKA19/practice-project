import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useFeedbackPage } from '../composables/use-page'
import { submitFeedback } from '../composables/use-actions'
import { back, showError, toast } from '@/utils/project/interaction'

const session = reactive({ sessionRevision: 0 })
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => session, requireIdentity: () => true }))
vi.mock('../composables/use-actions', () => ({ submitFeedback: vi.fn() }))
vi.mock('@/utils/project/interaction', () => ({ back: vi.fn(), showError: vi.fn(), toast: vi.fn(), chooseImage: vi.fn() }))
beforeEach(() => {
  vi.clearAllMocks()

  session.sessionRevision++
})
it('空白字段和无效选填手机不提交', async () => {
  const scope = effectScope()

  const form = scope.run(useFeedbackPage)!

  form.form.name = '  '

  form.form.content = '意见'

  await form.bindSave()

  expect(submitFeedback).not.toHaveBeenCalled()

  form.form.name = '顾客'

  form.form.mobile = '123'

  await form.bindSave()

  expect(submitFeedback).not.toHaveBeenCalled()

  scope.stop()
})
it('重复点击只发送一次，失败保留表单和附件，不提示成功', async () => {
  let reject!: (reason: unknown) => void

  vi.mocked(submitFeedback).mockReturnValue(new Promise((_, fail) => {
    reject = fail
  }))

  const scope = effectScope()

  const form = scope.run(useFeedbackPage)!

  Object.assign(form.form, { name: '顾客', content: '意见' })

  form.picsList.value = ['/tmp/a.jpg']

  const pending = form.bindSave()

  await form.bindSave()

  expect(submitFeedback).toHaveBeenCalledTimes(1)

  reject(new Error('上传失败'))

  await pending

  expect(form.form.content).toBe('意见')

  expect(form.picsList.value).toEqual(['/tmp/a.jpg'])

  expect(showError).toHaveBeenCalled()

  expect(toast).not.toHaveBeenCalledWith('提交成功', 'success')

  scope.stop()
})
it('换账户后旧请求成功不能提示或返回，新表单立即清空', async () => {
  let resolve!: (value: unknown) => void

  vi.mocked(submitFeedback).mockReturnValue(new Promise((done) => {
    resolve = done
  }))

  const scope = effectScope()

  const form = scope.run(useFeedbackPage)!

  Object.assign(form.form, { name: '旧账户', content: '意见' })

  const pending = form.bindSave()

  session.sessionRevision++

  resolve(null)

  await pending

  expect(form.form.name).toBe('')

  expect(toast).not.toHaveBeenCalled()

  expect(back).not.toHaveBeenCalled()

  scope.stop()
})

vi.mock('@/pages/routes', () => ({ ClientRoutes: { Account: { my: '/pages/account/index/index' } } }))
