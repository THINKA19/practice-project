import { afterEach, describe, expect, it, vi } from 'vitest'
import { actionSheet, confirm, showError, withLoading } from '../feedback'
import { PlatformError } from '../errors'

afterEach(() => vi.unstubAllGlobals())
describe('交互失败与用户取消', () => {
  it('并发任务中只有最后一个结束才关闭遮罩，失败也释放计数', async () => {
    const showLoading = vi.fn()
    const hideLoading = vi.fn()
    vi.stubGlobal('uni', { showLoading, hideLoading })
    let finish!: () => void
    const first = withLoading(() => new Promise<void>((resolve) => {
      finish = resolve
    }))
    await expect(withLoading(async () => {
      throw new Error('failed')
    })).rejects.toThrow('failed')
    expect(hideLoading).not.toHaveBeenCalled()
    finish()
    await first
    expect(hideLoading).toHaveBeenCalledOnce()
    expect(showLoading).toHaveBeenCalledOnce()
    await withLoading(async () => 1)
    expect(showLoading).toHaveBeenCalledTimes(2)
    expect(hideLoading).toHaveBeenCalledTimes(2)
  })
  it('识别脚手架 HTTP 普通错误对象的 message', () => {
    const toast = vi.fn()
    vi.stubGlobal('uni', { showToast: toast })
    showError({ type: 'business', code: 400, message: '请求失败' })
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '请求失败' }))
  })
  it('选择菜单取消返回 null，系统失败抛出分类错误', async () => {
    let message = 'showActionSheet:fail cancel'
    vi.stubGlobal('uni', { showActionSheet: (options: UniApp.ShowActionSheetOptions) => options.fail?.({ errMsg: message }) })
    await expect(actionSheet(['item'])).resolves.toBeNull()
    message = 'showActionSheet:fail system unavailable'
    await expect(actionSheet(['item'])).rejects.toMatchObject({ reason: 'System' })
  })
  it('宿主弹窗失败抛出分类错误，主动取消不提示错误', async () => {
    const toast = vi.fn()
    vi.stubGlobal('uni', { showToast: toast, showModal: (options: UniApp.ShowModalOptions) => options.fail?.({ errMsg: 'showModal:fail system unavailable' }) })
    await expect(confirm('test')).rejects.toMatchObject({ reason: 'System' })
    showError(new PlatformError('Cancelled', 'cancel'))
    expect(toast).not.toHaveBeenCalled()
  })
})
