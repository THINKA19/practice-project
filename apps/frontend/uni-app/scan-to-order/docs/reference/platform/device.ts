// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/**
 * ============================================================================
 * 宿主平台硬件 API 与跨端能力防腐层 (Platform Capabilities & Device API)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于共享平台层（Shared Platform），提供应用与宿主环境（UniApp/微信/OS）
 * 交互的可选辅助函数。简单场景可以直接调用 uni.xxx，无需经过本文件。
 *
 * 核心机制：
 * 1. 异步 Promise 化：将平台原生的 success/fail 回调统一包装为 Promise 风格。
 * 2. 异常归一拦截：底层抛出的脏错误全部经 platformError() 转化为标准 PlatformError。
 * 3. 跨端条件屏蔽：集中处理所有的 #ifdef 环境分支，向业务层暴露纯粹的接口。
 * 4. 依赖注入支持：结合 getPlatformOverrides() 支持本地开发时的硬件 Mock（如模拟支付）。
 *
 * 【方法与能力清单】
 * - 授权与鉴权：checkAndAuthorize, getLoginCode, checkSession
 * - 传感器与硬件：getLocation, scanCode, vibrateShort, chooseImage, chooseLocation
 * - 通信与交互：makePhoneCall, copyText, requestSubscribe
 * - UI 与导航栏：getMenuButtonRect, setTitle, hideTabBar, showTabBar
 * - 支付与开放能力：requestPayment, getShareInfo, navigateToMiniProgram
 *
 * 【综合使用示例】
 * ```typescript
 * import { scanCode, getLocation } from './device'
 * import { isCancelled } from './errors'
 *
 * async function handleTableScan() {
 *   try {
 *     // 1. 调用定位（已封装为 Promise，且处理了无权限异常）
 *     const { latitude, longitude } = await getLocation('gcj02')
 *
 *     // 2. 调用扫码
 *     const qrResult = await scanCode()
 *     console.log('扫码结果:', qrResult)
 *   } catch (error) {
 *     // 3. 使用标准化的取消判定，防止误弹红字报错
 *     if (isCancelled(error)) return
 *
 *     uni.showToast({ title: error.message, icon: 'none' })
 *   }
 * }
 * ```
 * ============================================================================
 */

import { platformError, PlatformError } from './errors'
import { alert, toast } from './feedback'
import type { PlatformPaymentParams } from './overrides'
import { getPlatformOverrides } from './overrides'

/** 地理坐标点 */
export interface GeoPoint {
  latitude: number
  longitude: number
}

/**
 * 获取当前地理定位
 * @param type 坐标系类型（默认 gcj02 国测局坐标系）
 * @returns 包含经纬度的坐标对象
 */
export function getLocation(type: 'wgs84' | 'gcj02' = 'gcj02'): Promise<GeoPoint> {
  if (typeof uni.getLocation !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前平台不支持此定位能力'))
  }
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type,
      success: res => resolve({ latitude: res.latitude, longitude: res.longitude }),
      fail: err => reject(platformError(err)),
    })
  })
}

/**
 * 检查并动态申请指定范围的系统权限
 * @param scope 权限范围字符串（如 'scope.userLocation'）
 */
export function checkAndAuthorize(scope: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // #ifdef MP
    uni.getSetting({
      success(res) {
        const authSetting = res.authSetting as unknown as Record<string, boolean | undefined>
        if (authSetting[scope]) {
          resolve()
          return
        }
        uni.authorize({
          scope,
          success: () => resolve(),
          fail: (error) => {
            reject(platformError(error))
            // 引导用户跳转设置页手动开启权限
            uni.showModal({
              content: '需要获得您的授权以继续提供服务',
              showCancel: false,
              confirmText: '立即授权',
              confirmColor: '#e64340',
              success: () => uni.openSetting({}),
              fail: e => reject(platformError(e)),
            })
          },
        })
      },
      fail: e => reject(platformError(e)),
    })
    // #endif

    // #ifndef MP
    reject(new PlatformError('Unsupported', '当前非小程序平台不支持此授权方式'))
    // #endif
  })
}

/** 触发手机短震动（15ms 左右反馈） */
export function vibrateShort(): Promise<void> {
  if (typeof uni.vibrateShort !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前平台不支持震动反馈'))
  }
  return new Promise((resolve, reject) => {
    uni.vibrateShort({
      success: () => resolve(),
      fail: err => reject(platformError(err)),
    })
  })
}

/** 获取宿主平台（如微信）的登录凭证 code，用于静默登录换取 Token */
export function getLoginCode(): Promise<string> {
  const override = getPlatformOverrides().loginCode
  if (override) {
    return override().catch((error) => {
      throw platformError(error)
    })
  }

  if (typeof uni.login !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前平台不支持原生登录态获取'))
  }

  return new Promise((resolve, reject) => {
    uni.login({
      // #ifdef MP-WEIXIN
      provider: 'weixin',
      // #endif
      success: res => resolve(res.code),
      fail: (err) => {
        toast('获取环境登录凭证失败')
        reject(platformError(err))
      },
    })
  })
}

/** 检查平台层面的登录态 Session 是否过期 */
export function checkSession(): Promise<boolean> {
  const override = getPlatformOverrides().checkSession
  if (override)
    return override()

  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    uni.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false),
    })
    // #endif
    // #ifndef MP-WEIXIN
    resolve(true)
    // #endif
  })
}

export type WxPayParams = PlatformPaymentParams

/** 调起微信小程序支付；其他平台返回 Unsupported，测试替身优先。 */
export function requestPayment(params: WxPayParams): Promise<void> {
  const override = getPlatformOverrides().requestPayment
  if (override) {
    return override(params).catch((error) => {
      throw platformError(error)
    })
  }

  // #ifdef MP-WEIXIN
  if (typeof uni.requestPayment !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前平台不支持原生支付组件'))
  }

  return new Promise((resolve, reject) => {
    // 当前 uni 类型把 App 专用字段也标为必填；小程序参数单独约束，不伪造订单。
    const options: Omit<UniApp.RequestPaymentOptions, 'provider' | 'orderInfo'> = {
      timeStamp: params.timeStamp,
      nonceStr: params.nonceStr,
      package: params.package,
      signType: params.signType,
      paySign: params.paySign,
      success: () => resolve(),
      fail: err => reject(platformError(err)),
    }
    uni.requestPayment(options as UniApp.RequestPaymentOptions)
  })
  // #endif
  // #ifndef MP-WEIXIN
  return Promise.reject(new PlatformError('Unsupported', '此支付入口仅支持微信小程序'))
  // #endif
}

/** 调起消息订阅授权面板（仅微信小程序），失败/拒绝不阻断主流程 */
export function requestSubscribe(tmplIds: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (!tmplIds.length) {
      resolve()
      return
    }
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds,
      complete: () => resolve(), // 无论成功失败都放行
    } as UniApp.RequestSubscribeMessageOption)
    // #endif
    // #ifndef MP-WEIXIN
    resolve()
    // #endif
  })
}

/** 调起摄像头扫码，返回解析结果字符串 */
export function scanCode(): Promise<string> {
  if (typeof uni.scanCode !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前设备不支持扫码功能'))
  }
  return new Promise((resolve, reject) => {
    uni.scanCode({
      success: res => resolve(res.result),
      fail: err => reject(platformError(err)),
    })
  })
}

/** 拨打系统电话 */
export function makePhoneCall(phoneNumber?: string | null, onFail?: () => void) {
  if (!phoneNumber)
    return
  uni.makePhoneCall({
    phoneNumber,
    fail: () => onFail?.(),
  })
}

/** 复制文本到系统剪贴板 */
export function copyText(data: string, tip = '已复制') {
  uni.setClipboardData({
    data,
    success: () => toast(tip, 'success'),
  })
}

/** 打开原生内置地图查看指定坐标位置 */
export function openLocation(p: GeoPoint & { name?: string, address?: string }) {
  uni.openLocation({
    latitude: Number(p.latitude),
    longitude: Number(p.longitude),
    name: p.name,
    address: p.address,
    scale: 18,
  })
}

/** 打开地图选择器并让用户选择一个地点 */
export function chooseLocation(): Promise<UniApp.ChooseLocationSuccess> {
  if (typeof uni.chooseLocation !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '不支持地点选择功能'))
  }
  return new Promise((resolve, reject) => {
    uni.chooseLocation({
      success: res => resolve(res),
      fail: err => reject(platformError(err)),
    })
  })
}

/** 调起原生相册选取图片 */
export function chooseImage(count = 1, sizeType: ('original' | 'compressed')[] = ['compressed']): Promise<string[]> {
  if (typeof uni.chooseImage !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '当前设备不支持图片选择'))
  }
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      success: res => resolve(res.tempFilePaths as string[]),
      fail: err => reject(platformError(err)),
    })
  })
}

/** 全屏预览图片组 */
export function previewImage(urls: string[], current?: string) {
  uni.previewImage({ urls, current })
}

/** 动态设置原生导航栏标题 */
export function setTitle(title?: string | null) {
  if (title) {
    uni.setNavigationBarTitle({ title })
  }
}

/** 计算右上角胶囊按钮的布局位置（用于开发自定义透明导航栏） */
export function getMenuButtonRect() {
  // #ifdef MP
  try {
    return uni.getMenuButtonBoundingClientRect()
  }
  catch {}
  // #endif

  // 保底降级策略：非小程序环境返回近似值适配
  const sys = uni.getSystemInfoSync()
  const top = (sys.statusBarHeight || 20) + 4
  return {
    top,
    bottom: top + 32,
    height: 32,
    width: 87,
    left: (sys.windowWidth || 375) - 97,
    right: (sys.windowWidth || 375) - 10,
  }
}

/** 隐藏原生底部导航栏 */
export function hideTabBar() {
  uni.hideTabBar({ fail: () => {} })
}

/** 显示原生底部导航栏 */
export function showTabBar() {
  uni.showTabBar({ fail: () => {} })
}

/** 展示全屏阻塞性错误提示详情 */
export function alertMessage(msg: string) {
  return alert(msg)
}

/** 解密并获取微信群分享的加密信息包 */
export function getShareInfo(shareTicket: string): Promise<{ encryptedData: string, iv: string } | null> {
  return new Promise((resolve) => {
    // #ifdef MP-WEIXIN
    uni.getShareInfo({
      shareTicket,
      success: (res: { encryptedData: string, iv: string }) => resolve({ encryptedData: res.encryptedData, iv: res.iv }),
      fail: () => resolve(null),
    } as unknown as UniApp.GetShareInfoOptions)
    // #endif
    // #ifndef MP-WEIXIN
    void shareTicket
    resolve(null)
    // #endif
  })
}

/** 强制停止页面的原生下拉刷新动画 */
export function stopPullDownRefresh() {
  uni.stopPullDownRefresh()
}

/** 打开企业微信绑定的客服聊天窗口 */
export function openCustomerServiceChat(url: string, corpId: string) {
  // #ifdef MP-WEIXIN
  wx.openCustomerServiceChat({
    extInfo: { url },
    corpId,
    fail: err => console.error('[Platform] Customer chat open failed:', err),
  })
  // #endif
}

/** 跳转到当前生态内的其他小程序（如矩阵号、第三方发票程序） */
export function navigateToMiniProgram(appId: string, path: string) {
  // #ifdef MP
  uni.navigateToMiniProgram({ appId, path })
  // #endif
}

/** 隐藏右上角的转发给朋友与分享朋友圈按钮（保护仅限内部使用的敏感页面） */
export function hideShareMenu() {
  // #ifdef MP-WEIXIN
  uni.hideShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] } as UniApp.HideShareMenuOptions)
  // #endif
}

/** 保存海报/图片资源至设备本地相册 */
export function saveImageToPhotosAlbum(filePath: string): Promise<void> {
  if (typeof uni.saveImageToPhotosAlbum !== 'function') {
    return Promise.reject(new PlatformError('Unsupported', '不支持保存图片至相册'))
  }
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: err => reject(platformError(err)),
    })
  })
}
