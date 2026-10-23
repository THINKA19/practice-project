// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/**
 * ============================================================================
 * 跨端交互反馈与 UI 提示端口 (Platform Feedback)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于共享平台层（Shared Platform），接管全站所有的 Toast 提示、Loading 遮罩、
 * Modal 弹窗及 ActionSheet 动作面板，作为可选辅助工具。
 * 简单场景可以直接调用 uni.showXxx；并发任务建议统一使用 withLoading。
 *
 * 核心机制：
 * 1. 异步 Promise 化：将所有用户选择弹窗（confirm、choose、prompt）转换为 Promise，消除回调。
 * 2. 异常静默与统一收口（showError）：智能识别原生取消操作与后端 ApiError，统一处理错误提示。
 * 3. 跨端 UI 替换预留：未来如需适配 PC 端后台（如替换为 Element Plus 的 Message），只需在此文件内切换底层实现，业务层完全无感。
 * 4. 自动化 Loading：提供 withLoading 高阶函数，自动管理异步操作前后的 Loading 状态。
 *
 * 【方法与能力清单】
 * - 基础提示：toast, showLoading, hideLoading, withLoading
 * - 对话框类：confirm (确/取), choose (明确结果), alert (仅提示), prompt (输入框)
 * - 底部面板：actionSheet
 * - 错误处理：showError (智能错误解析与展示)
 *
 * 【综合使用示例】
 * ```typescript
 * import { toast, confirm, withLoading, showError } from './feedback'
 * import { submitOrder } from '@/services/order'
 *
 * async function handleCheckout() {
 *   try {
 *     // 1. 优雅的异步弹窗确认
 *     const isOk = await confirm({ title: '确认', content: '是否立即下单并支付？' })
 *     if (!isOk) return
 *
 *     // 2. 自动管理 Loading 遮罩的异步请求
 *     await withLoading(() => submitOrder(), '订单提交中...')
 *     toast('下单成功', 'success')
 *
 *   } catch (error) {
 *     // 3. 智能容错：自动甄别 ApiError、网络错误或用户主动取消（不误弹报错）
 *     showError(error)
 *   }
 * }
 * ```
 * ============================================================================
 */

import { platformError, PlatformError } from './errors'

/**
 * 弹出轻量提示框 (Toast)
 * @param title 提示文本（为空则不触发）
 * @param icon 图标类型，默认 'none' (纯文本)
 * @param duration 显示持续时间，默认 2000 毫秒
 */
export function toast(title: string, icon: 'none' | 'success' | 'error' | 'loading' = 'none', duration = 2000) {
  if (!title)
    return
  uni.showToast({ title, icon, duration })
}

/** 显示全局防误触全屏透明遮罩 Loading */
export function showLoading(title = '') {
  uni.showLoading({ title, mask: true })
}

/** 隐藏全局 Loading */
export function hideLoading() {
  uni.hideLoading()
}

let pendingLoadingTasks = 0

/**
 * 包装异步任务，最后一个并发任务结束后关闭遮罩；期间不要混用手动 hideLoading。
 * @param task 需要执行的 Promise 异步任务函数
 * @param title Loading 提示文案
 * @returns 任务函数的原始返回值
 */
export async function withLoading<T>(task: () => Promise<T>, title = ''): Promise<T> {
  if (pendingLoadingTasks === 0)
    showLoading(title)
  pendingLoadingTasks++
  try {
    return await task()
  }
  finally {
    pendingLoadingTasks--
    if (pendingLoadingTasks === 0)
      hideLoading()
  }
}

export interface ConfirmOptions {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  confirmColor?: string
}

/**
 * 标准双向确认框
 * @param options 配置项或单纯的文本内容
 * @returns Promise<boolean> 用户点击确定返回 true，取消返回 false
 */
export function confirm(options: ConfirmOptions | string): Promise<boolean> {
  const opt = typeof options === 'string' ? { content: options } : options
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: opt.title || '',
      content: opt.content,
      showCancel: opt.showCancel !== false,
      confirmText: opt.confirmText,
      cancelText: opt.cancelText,
      confirmColor: opt.confirmColor,
      success: res => resolve(!!res.confirm),
      fail: error => reject(platformError(error)),
    })
  })
}

export interface PromptOptions {
  title?: string
  placeholder?: string
  confirmText?: string
}

/**
 * 输入框弹窗（注意：editable 特性在某些低版本 H5 可能降级，小程序端表现最佳）
 * @returns 用户点击确定时返回去除首尾空格的字符串，取消则返回 null
 */
export function prompt(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: options.title || '',
      editable: true,
      placeholderText: options.placeholder,
      confirmText: options.confirmText,
      success: res => resolve(res.confirm ? (res.content || '').trim() : null),
      fail: error => reject(platformError(error)),
    })
  })
}

/**
 * 带业务语义的确认选择
 * 与 confirm 不同，此方法明确区分 'confirm' 与 'cancel'，常用于取消按钮同样会触发后续业务流程的场景
 */
export function choose(options: ConfirmOptions): Promise<'confirm' | 'cancel'> {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: options.title || '',
      content: options.content,
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      success: res => resolve(res.confirm ? 'confirm' : 'cancel'),
      fail: error => reject(platformError(error)),
    })
  })
}

/**
 * 强提示弹窗（无取消按钮），用户只能点击“我知道了”
 */
export function alert(content: string, title = ''): Promise<boolean> {
  return confirm({ title, content, showCancel: false })
}

/**
 * 底部操作菜单面板
 * @param itemList 按钮文案数组
 * @returns 返回用户点击的索引值，若用户点背景取消则返回 null
 */
export function actionSheet(itemList: string[]): Promise<number | null> {
  return new Promise((resolve, reject) => {
    uni.showActionSheet({
      itemList,
      success: res => resolve(res.tapIndex),
      fail: (error) => {
        const failure = platformError(error)
        // 用户主动取消不上抛异常，仅视为放弃操作返回 null
        if (failure.reason === 'Cancelled') {
          resolve(null)
        }
        else {
          reject(failure)
        }
      },
    })
  })
}

/**
 * 统一异常静默与错误解析展板
 * @param e 捕获到的任意 Error 或字符串
 * @param fallback 降级默认提示文案
 */
export function showError(e: unknown, fallback = '操作失败') {
  // 1. 过滤原生平台的用户主动取消动作
  if (e instanceof PlatformError && e.reason === 'Cancelled') {
    return
  }

  // 兼容现有 HTTP 返回的普通错误对象。
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
    toast(e.message || fallback)
    return
  }

  // 3. 原生 JS 异常
  if (e instanceof Error) {
    toast(e.message || fallback)
    return
  }

  // 4. 兜底纯文本或默认文案
  toast(typeof e === 'string' ? e : fallback)
}
