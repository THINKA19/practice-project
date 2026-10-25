/**
 * 【文件概述】向微信平台申请一次性 code，不保存业务会话。
 * 【方法与导出清单】getWxCode。
 * 【综合使用示例】const { code } = await getWxCode()
 */
/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}
