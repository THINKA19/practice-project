/**
 * 【文件概述】通过条件编译选择微信小程序或浏览器登录渠道。
 * 【方法与导出清单】getWechatEnvironment。
 * 【综合使用示例】const { channel } = getWechatEnvironment()
 */
import type { WechatChannel } from '../models/types'

/** 通过条件编译确定微信登录渠道；仅在浏览器渠道内识别移动浏览器展示提示。 */
export function getWechatEnvironment(): {
  channel: WechatChannel
  mobileBrowser: boolean
} {
  let channel: WechatChannel = 'web'

  let mobileBrowser = false

  // #ifdef MP-WEIXIN
  channel = 'mini'

  // #endif
  // #ifdef H5
  const ua = navigator.userAgent

  channel = /MicroMessenger/i.test(ua) ? 'wechat-h5' : 'web'

  mobileBrowser = channel === 'web' && /Android|iPhone|iPad/i.test(ua)

  // #endif
  return { channel, mobileBrowser }
}
