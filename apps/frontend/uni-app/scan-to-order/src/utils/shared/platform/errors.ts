/**
 * ============================================================================
 * 宿主平台硬件与原生调用异常适配内核 (Platform Error Adaptor)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于共享平台能力适配层（Shared Platform），主要负责清洗、分类并归一化
 * 宿主环境（UniApp / 微信小程序 / Web / 原生 App）在调用原生 API、硬件设备及
 * 授权流程时产生的各种弱类型、非标准 errMsg 异常对象。
 *
 * 核心机制：
 * 1. 语义化分类（Semantic Mapping）：
 *    将模糊的原生平台错误信息转化为强类型的 PlatformFailure ('Unsupported' | 'Denied' | 'Cancelled' | 'System')。
 * 2. 行为级静默判定（isCancelled）：
 *    精准识别用户主动点击“取消/关闭”的行为（如关闭扫码、放弃选图、取消定位授权），便于调用方静默处理。
 * 3. 隐私合规拦截标记（privacy）：
 *    自动识别小程序隐私指引协议拦截并打标，便于上层快速拉起隐私协议授权弹窗。
 *
 * 【方法与接口清单】
 * - PlatformFailure                   : 归一化后的平台错误大类字面量
 * - PlatformError                     : 统一的平台异常基类，继承自标准 Error
 * - isCancelled(error)                : 判定是否为用户主动取消行为（用于静默忽略）
 * - platformError(error)              : 工厂解析函数，将任意未知异常转换为标准 PlatformError
 *
 * 【综合使用示例】
 * ```typescript
 * import { platformError, isCancelled } from '@/utils/shared/platform/errors'
 *
 * async function handleScanTable() {
 *   try {
 *     const res = await uni.scanCode({ onlyFromCamera: true })
 *     return res.result
 *   } catch (rawErr) {
 *     const err = platformError(rawErr)
 *
 *     // 用户自行点击了左上角返回或关闭摄像头，不做任何阻断提示
 *     if (isCancelled(err)) {
 *       return null
 *     }
 *
 *     // 微信隐私权限未授权
 *     if (err.detail === 'privacy') {
 *       openPrivacyDialog()
 *       return null
 *     }
 *
 *     // 其他故障弹出真实文案
 *     uni.showToast({ title: err.message, icon: 'none' })
 *     throw err
 *   }
 * }
 * ```
 * ============================================================================
 */

/** 归一化后的宿主平台故障类别 */
export type PlatformFailure = 'Unsupported' | 'Denied' | 'Cancelled' | 'System'

/**
 * 宿主平台标准异常类
 */
export class PlatformError extends Error {
  /**
   * @param reason 归一化故障分类
   * @param message 格式化后的错误提示文本
   * @param original 底层原生捕获到的原始异常对象
   * @param detail 扩展特定场景标记（如 'privacy' 隐私政策阻断）
   */
  constructor(
    readonly reason: PlatformFailure,
    message: string,
    readonly original?: unknown,
    readonly detail?: 'privacy',
  ) {
    super(message)
    this.name = 'PlatformError'
  }
}

/**
 * 校验传入的未知异常是否为“用户主动取消”行为
 * 常见于：扫码退出、图片选择放弃、系统原生弹窗取消等，调用方通常应做静默忽略处理
 *
 * @param error 捕获到的任意异常对象
 * @returns true 表示用户主动取消，无需给用户弹红字报错
 *
 * @example
 * if (isCancelled(error)) return
 */
export function isCancelled(error: unknown): boolean {
  return error instanceof PlatformError
    ? error.reason === 'Cancelled'
    : platformError(error).reason === 'Cancelled'
}

/**
 * 解析并转换任意底层平台原始错误对象为类型安全的 PlatformError 实例
 *
 * @param error 宿主环境抛出的错误（可能是包含 errMsg 的 UniApp/微信异常，也可能是原生 Error）
 * @returns 规范化的 PlatformError 实例
 *
 * @example
 * const err = platformError({ errMsg: 'chooseImage:fail cancel' })
 * console.log(err.reason) // => 'Cancelled'
 */
export function platformError(error: unknown): PlatformError {
  if (error instanceof PlatformError) {
    return error
  }

  const message
    = error && typeof error === 'object' && 'errMsg' in error
      ? String((error as { errMsg: unknown }).errMsg)
      : error instanceof Error
        ? error.message
        : '系统调用失败'

  const privacy = /privacy permission/i.test(message)

  const reason: PlatformFailure = /not support|unsupported|not implemented/i.test(message)
    ? 'Unsupported'
    : /cancel/i.test(message)
      ? 'Cancelled'
      : privacy || /deny|denied|permission|not authorized/i.test(message)
        ? 'Denied'
        : 'System'

  return new PlatformError(reason, message, error, privacy ? 'privacy' : undefined)
}
