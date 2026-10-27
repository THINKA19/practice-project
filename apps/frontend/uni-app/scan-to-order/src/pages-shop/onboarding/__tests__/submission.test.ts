import { effectScope, ref } from 'vue'
import type { EffectScope } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOnboardingPage } from '../composables/use-page'
import { clearSession } from '@/pages/auth/session'

const mocks = vi.hoisted(() => ({ upload: vi.fn(), submit: vi.fn(), error: vi.fn(), toast: vi.fn() }))

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

vi.mock('../composables/use-requests', () => ({ joinApplyApi: { addComment: mocks.submit, uploadFile: mocks.upload } }))
const scopes: EffectScope[] = []
function page() {
  const scope = effectScope()
  scopes.push(scope)
  return { scope, vm: scope.run(useOnboardingPage)! }
}
afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.useRealTimers()
})

describe('入驻提交', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.submit.mockReset().mockResolvedValue(null)
    mocks.upload.mockReset().mockResolvedValue({ url: 'https://files.test/photo.jpg' })

    vi.stubGlobal('ref', ref)
  })

  it('附件失败时不提交留言、不提示成功并保留表单', async () => {
    const { vm } = page()

    vm.name.value = '联系人'

    vm.mobile.value = '123456789'

    vm.picsList.value = [{ url: '/local/photo.jpg' }]

    mocks.upload.mockRejectedValueOnce(new Error('上传失败'))

    await vm.bindSave()

    expect(mocks.submit).not.toHaveBeenCalled()

    expect(mocks.toast).not.toHaveBeenCalledWith('common.submitSuccess', 'success')

    expect(uni.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '第 1 个附件上传失败，请重试' }))

    expect(vm.name.value).toBe('联系人')

    expect(vm.submitting.value).toBe(false)
  })

  it('正在提交时阻止重复提交', async () => {
    const { vm } = page()

    vm.submitting.value = true

    await vm.bindSave()

    expect(mocks.upload).not.toHaveBeenCalled()

    expect(mocks.submit).not.toHaveBeenCalled()
  })

  it('上传期间编辑表单不改变已确认快照，成功等待返回时仍阻止重复提交', async () => {
    vi.useFakeTimers()
    const { vm } = page()
    vm.name.value = ' 联系人 '
    vm.mobile.value = ' 123456789 '
    vm.content.value = '原申请'
    vm.picsList.value = [{ url: '/first.jpg' }]
    let finish!: (value: { url: string }) => void
    mocks.upload.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const pending = vm.bindSave()
    vm.name.value = '另一个人'
    vm.content.value = '另一个申请'
    vm.picsList.value.push({ url: '/second.jpg' })
    finish({ url: 'https://files.test/first.jpg' })
    await pending
    expect(mocks.upload).toHaveBeenCalledTimes(1)
    expect(mocks.submit).toHaveBeenCalledWith({ type: 1, content: '原申请', extJsonStr: JSON.stringify({ 姓名: '联系人', 联系电话: '123456789', file0: 'https://files.test/first.jpg' }) })
    await vm.bindSave()
    expect(mocks.submit).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    expect(uni.navigateBack).toHaveBeenCalledTimes(1)
  })

  it('换号后停止后续附件和申请，销毁后不再返回或提示', async () => {
    const { scope, vm } = page()
    vm.name.value = '联系人'
    vm.mobile.value = '123456789'
    vm.picsList.value = [{ url: '/first.jpg' }, { url: '/second.jpg' }]
    let finish!: (value: { url: string }) => void
    mocks.upload.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const pending = vm.bindSave()
    clearSession()
    scope.stop()
    finish({ url: 'https://files.test/first.jpg' })
    await pending
    expect(mocks.upload).toHaveBeenCalledTimes(1)
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(uni.showToast).not.toHaveBeenCalled()
    expect(uni.hideLoading).toHaveBeenCalledTimes(1)
    await vm.bindSave()
    expect(uni.showToast).not.toHaveBeenCalled()
  })

  it('提交成功后离开页面会清理延时返回', async () => {
    vi.useFakeTimers()
    const { scope, vm } = page()
    vm.name.value = '联系人'
    vm.mobile.value = '123456789'
    await vm.bindSave()
    scope.stop()
    vi.advanceTimersByTime(1000)
    expect(uni.navigateBack).not.toHaveBeenCalled()
  })
})
