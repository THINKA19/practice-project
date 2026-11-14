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

/** 输入业务字段；取消和平台失败返回 null。@param options 标题、占位文字 @returns 输入文本或 null @example await prompt({ title: '库存' }) // 文本或 null */
export function prompt(options: { title: string, placeholder?: string }): Promise<string | null> {
  return new Promise(resolve => uni.showModal({ title: options.title, editable: true, placeholderText: options.placeholder, success: result => resolve(result.confirm ? (result.content || '').trim() : null), fail: () => resolve(null) }))
}
/** 显式区分确认与取消按钮。@param options 弹窗配置 @returns 操作或关闭 @example await choose({ title: '操作' }) // confirm、cancel 或 dismiss */
export function choose(options: UniApp.ShowModalOptions): Promise<'confirm' | 'cancel' | 'dismiss'> {
  return new Promise(resolve => uni.showModal({ ...options, success: result => resolve(result.confirm ? 'confirm' : result.cancel ? 'cancel' : 'dismiss'), fail: () => resolve('dismiss') }))
}
/** 选择一项操作。@param itemList 操作名称 @returns 索引或 null @example await actionSheet(['选择']) // 0 或 null */
export function actionSheet(itemList: string[]): Promise<number | null> {
  return new Promise(resolve => uni.showActionSheet({ itemList, success: result => resolve(result.tapIndex), fail: () => resolve(null) }))
}
/** 判断平台用户取消。@param error 平台错误 @returns 是否取消 @example isCancelled({ errMsg: 'chooseImage:fail cancel' }) // true */
export function isCancelled(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'errMsg' in error && /cancel/i.test(String(error.errMsg))
}
