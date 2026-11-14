import { CLIENT_HOME_URL } from '@/constants/routes'

/**
 * 登录页周边跳转：返回客户端 / 联系客服
 * （忘记密码为 UI 预留，后端未开放重置接口前仅提示）
 */
export function useNavigation() {
  function handleForgotPassword() {
    uni.showToast({ title: '请联系平台管理员重置密码', icon: 'none' })
  }

  function goContactService() {
    uni.showToast({ title: '客服微信：beefood-admin', icon: 'none' })
  }

  function goBackClient() {
    uni.switchTab({ url: CLIENT_HOME_URL })
  }

  return {
    handleForgotPassword,
    goContactService,
    goBackClient,
  }
}
