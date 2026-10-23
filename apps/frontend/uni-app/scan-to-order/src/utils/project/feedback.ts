/**
 * 项目基础反馈适配入口。只负责展示，业务和国际化文案由调用方提供。
 * 导出 toast；当前使用 uni.showToast，后续 UI 适配集中在此处。
 * @example toast(t('common.navigationFailed'))
 */

/**
 * 显示纯文字提示。
 * @param title 已翻译的提示文字，空字符串不显示。
 * @returns {void} 发起平台提示。
 * @example toast('操作成功')
 */
export function toast(title: string): void {
  if (title)
    uni.showToast({ title, icon: 'none' })
}
