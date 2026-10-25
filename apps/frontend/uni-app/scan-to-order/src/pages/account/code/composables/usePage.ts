/**
 * 动态会员码 ViewModel
 * 来源：bee-master/pages/my/user-code.js
 * 动态码有时效，页面可见期间定时刷新
 */
import { useI18n } from 'vue-i18n'
import { identityApi, reloginIfNeeded } from '@/shared/session'
import { assetApi } from '@/pages/account/asset'
import { setTitle } from '@/shared/platform/device'
import { showError } from '@/shared/platform/feedback'

/** 会员码自动刷新间隔（毫秒） */
export const USER_CODE_REFRESH_MS = 60 * 1000

export function usePage() {
  const { t } = useI18n()

  const balance = ref<number>(0)
  const freeze = ref<number>(0)
  const score = ref<number>(0)
  const growth = ref<number>(0)
  const userCode = ref('')

  let timer: ReturnType<typeof setInterval> | null = null

  async function getUserAmount() {
    const res = await assetApi.amount()
    balance.value = res.balance
    freeze.value = res.freeze
    score.value = res.score
    growth.value = res.growth || 0
  }

  async function dynamicUserCode() {
    userCode.value = await identityApi.dynamicUserCode()
  }

  async function load(retried = false): Promise<void> {
    try {
      await Promise.all([getUserAmount(), dynamicUserCode()])
    }
    catch (e) {
      if (!retried && await reloginIfNeeded(e)) {
        return load(true)
      }
      showError(e)
    }
  }

  function init() {
    setTitle(t('my.userCode'))
    load()
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    timer = setInterval(() => {
      dynamicUserCode().catch(() => {})
    }, USER_CODE_REFRESH_MS)
  }

  function stopAutoRefresh() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /** 下拉刷新（停止动画由 View 处理） */
  function pullDownRefresh() {
    return load()
  }

  return {
    balance,
    freeze,
    score,
    growth,
    userCode,
    init,
    startAutoRefresh,
    stopAutoRefresh,
    pullDownRefresh,
  }
}
