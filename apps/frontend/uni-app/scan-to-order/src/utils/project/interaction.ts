/** 平台交互工具；提示文案和返回失败的目标均由业务调用方提供。 */
import { navigate } from '@/utils/project/navigation'

export function toast(title: string, icon: 'none' | 'success' = 'none') {
  uni.showToast({ title, icon })
}
export function showError(error: unknown) {
  toast(error instanceof Error ? error.message : '操作失败，请重试')
}
export function confirm(options: UniApp.ShowModalOptions): Promise<boolean> {
  return new Promise(resolve => uni.showModal({ ...options, success: result => resolve(result.confirm), fail: () => resolve(false) }))
}
export async function alert(content: string) {
  await confirm({ content, showCancel: false })
}
export function showLoading() {
  uni.showLoading({ title: '加载中', mask: true })
}
export function hideLoading() {
  uni.hideLoading()
}
export async function withLoading<T>(action: () => Promise<T>): Promise<T> {
  showLoading()

  try {
    return await action()
  }
  finally {
    hideLoading()
  }
}
export function setTitle(title?: string) {
  if (title)
    uni.setNavigationBarTitle({ title })
}
export function back(fallback: string) {
  uni.navigateBack({ delta: 1, fail: () => {
    void navigate(fallback)
  } })
}
export function chooseLocation(): Promise<UniApp.ChooseLocationSuccess> {
  return new Promise((resolve, reject) => uni.chooseLocation({ success: resolve, fail: reject }))
}
export function chooseImage(count: number): Promise<string[]> {
  return new Promise((resolve, reject) => uni.chooseImage({ count, success: result => resolve(typeof result.tempFilePaths === 'string' ? [result.tempFilePaths] : result.tempFilePaths), fail: reject }))
}
export function previewImage(urls: string[], current: string) {
  uni.previewImage({ urls, current })
}
export function makePhoneCall(phone: string) {
  if (phone)
    uni.makePhoneCall({ phoneNumber: phone, fail: showError })
}
