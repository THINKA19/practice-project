import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJoinApplyPage } from '../composables/useJoinApplyPage'

const mocks = vi.hoisted(() => ({ upload: vi.fn(), submit: vi.fn(), error: vi.fn(), toast: vi.fn() }))

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))

vi.mock('../api/joinApply', () => ({ joinApplyApi: { addComment: mocks.submit, uploadFile: mocks.upload } }))

describe('入驻提交', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal('ref', ref)
  })

  it('附件失败时不提交留言、不提示成功并保留表单', async () => {
    const vm = useJoinApplyPage()

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
    const vm = useJoinApplyPage()

    vm.submitting.value = true

    await vm.bindSave()

    expect(mocks.upload).not.toHaveBeenCalled()

    expect(mocks.submit).not.toHaveBeenCalled()
  })
})
