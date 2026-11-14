import { ref } from 'vue'
import { getCode } from '@/api/modules/auth/account'

/**
 * 图形验证码
 * 后端关闭验证码时（captchaEnabled: false）静默降级，不展示输入框
 */
/** 验证码自动刷新间隔（5 分钟，与后端有效期保持一致） */
const CAPTCHA_REFRESH_INTERVAL = 5 * 60 * 1000

/** 验证码接口返回结构见 @/api/modules/auth/account getCode */

export function useCaptcha() {
  const captchaData = ref<{ captchaEnabled: boolean; image: string }>({
    captchaEnabled: false,
    image: '',
  })
  let refreshCaptchaTimer: ReturnType<typeof setTimeout> | null = null

  function stopCaptchaTimer() {
    if (refreshCaptchaTimer) {
      clearTimeout(refreshCaptchaTimer)
      refreshCaptchaTimer = null
    }
  }

  /** 排一次自动刷新：setTimeout 只触发一次，所以刷新成功后要在 refreshCaptcha 里重新排期 */
  function startCaptchaTimer() {
    stopCaptchaTimer()
    refreshCaptchaTimer = setTimeout(refreshCaptcha, CAPTCHA_REFRESH_INTERVAL)
  }

  /**
   * 拉取验证码（mock 下默认关闭，切真实后端后自动生效）
   * - 关闭时清空图片并停掉定时器；
   * - 请求失败按「未开启」降级，不阻塞登录（用户可点图片重试）；
   * - 开启时刷新即重新排期，保证每 5 分钟自动换一张。
   */
  async function refreshCaptcha() {
    try {
      const captchaRes = await getCode()
      captchaData.value = captchaRes.captchaEnabled
        ? { captchaEnabled: true, image: `data:image/gif;base64,${captchaRes.image}` }
        : { captchaEnabled: false, image: '' }
    }
    catch {
      captchaData.value = { captchaEnabled: false, image: '' }
    }

    if (captchaData.value.captchaEnabled)
      startCaptchaTimer()
    else
      stopCaptchaTimer()
  }

  return {
    captchaData,
    refreshCaptcha,
    startCaptchaTimer,
    stopCaptchaTimer,
  }
}
