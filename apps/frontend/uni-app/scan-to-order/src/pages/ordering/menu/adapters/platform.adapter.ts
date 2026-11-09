/**
 * ============================================================================
 * 【文件概述】当前点餐页面使用的平台能力，基于 uni API；不包含业务路由或会话。
 * 【方法与导出清单】getLocation、checkAndAuthorize、openLocation、hideTabBar、showTabBar、stopPullDownRefresh、requestPayment、requestSubscribe、actionSheet。
 * 【综合使用示例】import { getLocation } from './platform.adapter'; const position = await getLocation('gcj02') // 平台定位结果
 * ============================================================================
 */
import { platformError } from './errors.adapter'

/** 请求当前位置。@param type 坐标系。@returns 定位结果，取消或拒绝时 reject。@example await getLocation('gcj02') */
export function getLocation(type: 'wgs84' | 'gcj02' = 'gcj02'): Promise<UniApp.GetLocationSuccess> {
  return new Promise((resolve, reject) => uni.getLocation({ type, success: resolve, fail: e => reject(platformError(e)) }))
}
/** 小程序发起定位权限申请；H5 由 getLocation 本身触发授权。@param scope 权限名。@returns 申请完成。@example await checkAndAuthorize('scope.userLocation') */
export async function checkAndAuthorize(scope: 'scope.userLocation'): Promise<void> {
  // #ifdef MP-WEIXIN
  await new Promise<void>((resolve, reject) => uni.authorize({ scope, success: () => resolve(), fail: e => reject(platformError(e)) }))
  // #endif
}
/** 打开坐标导航。@param options 地点。@returns void。@example openLocation({ latitude: 22, longitude: 114 }) */
export function openLocation(options: UniApp.OpenLocationOptions) {
  uni.openLocation(options)
}
/** 隐藏原生 tabbar。无参数。@returns void。@example hideTabBar() */
export function hideTabBar() {
  uni.hideTabBar({ fail: () => {} })
}
/** 恢复原生 tabbar。无参数。@returns void。@example showTabBar() */
export function showTabBar() {
  uni.showTabBar({ fail: () => {} })
}
/** 结束下拉刷新。无参数。@returns void。@example stopPullDownRefresh() */
export function stopPullDownRefresh() {
  uni.stopPullDownRefresh()
}
/** 调起平台支付。@param data 服务端支付凭证。@returns 支付平台确认；缺少凭证或取消时 reject。@example await requestPayment(serverCredentials) */
export async function requestPayment(data: { timeStamp: string, nonceStr: string, package: string, signType: string, paySign: string }): Promise<void> {
  // #ifdef MP-WEIXIN
  await new Promise<void>((resolve, reject) => wx.requestPayment({ ...data, signType: data.signType as 'MD5' | 'HMAC-SHA256' | 'RSA', success: () => resolve(), fail: e => reject(platformError(e)) }))
  return
  // #endif
  // #ifndef MP-WEIXIN
  throw new Error('当前平台不支持该微信小程序支付凭证')
  // #endif
}
/** 订阅通知授权，仅支持微信小程序；授权结果不影响下单。@param ids 模板 ID。@returns void。@example await requestSubscribe(['template-id']) */
export async function requestSubscribe(ids: string[]): Promise<void> {
  // #ifdef MP-WEIXIN
  await new Promise<void>(resolve => uni.requestSubscribeMessage({ tmplIds: ids, complete: () => resolve() }))
  // #endif
}
/** 显示选项。@param labels 选项文字。@returns 选中下标或 null。@example await actionSheet(['中文','English']) */
export function actionSheet(labels: string[]): Promise<number | null> {
  return new Promise(resolve => uni.showActionSheet({ itemList: labels, success: r => resolve(r.tapIndex), fail: () => resolve(null) }))
}
