/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡兑换领域业务编排层；通过本模块 API 与会话公开入口访问数据，隔离账号切换后的迟到响应。
 *
 * 【方法与导出清单】
 * useCardExchangePage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useCardExchangePage } from '@/pages/home/service/gift-card-exchange'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useCardExchangePage()
 * page.number.value = 'example-code'
 * page.agree.value = true
 * await page.submit() // => 仅服务端兑换成功后进入完成状态
 * ```
 * ============================================================================
 */
import { ref } from 'vue'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { useI18n } from 'vue-i18n'
import { cardExchangeApi } from '../api/exchange.api'
import { alert, setTitle, showError, toast, withLoading } from '@/utils/project/interaction'

import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/** 礼品卡使用协议（CMS 单页 key） */
const AGREEMENT_KEY = 'lipinkaxieyi'

/**
 * 装配礼品卡兑换的响应式状态与操作。
 * 无参数；须在 Vue setup 或响应式作用域内调用。
 * @returns 独立的响应式状态和操作方法；请求失败由页面状态或交互提示表达。
 * @example const page = useCardExchangePage() // => 初始状态独立，尚未发起请求
 */
export function useCardExchangePage() {
  const { t } = useI18n()

  const number = ref('')

  const agree = ref(false)

  const submitting = ref(false)
  const redeemed = ref(false)
  const scope = useSessionAccountScope(() => {
    number.value = ''
    agree.value = false
    redeemed.value = false
    submitting.value = false
  })

  /**
   * 设置兑换页标题。
   * 无参数。
   * @returns {void} 更新原生导航标题。
   * @example
   * page.init() // => 使用当前语言设置标题
   */
  function init() {
    setTitle(t('card.exchange.title'))
  }

  /**
   * 切换协议确认状态。
   * 无参数。
   * @returns {void} 翻转 agree。
   * @example
   * page.toggleAgree() // => 初始 false 变为 true
   */
  function toggleAgree() {
    agree.value = !agree.value
  }

  /**
   * 打开礼品卡使用协议。
   * 无参数。
   * @returns {void} 导航至协议 CMS 页面。
   * @example
   * page.xieyi() // => 打开 lipinkaxieyi 协议
   */
  function xieyi() {
    void navigate(ClientRoutes.Account.about, { key: AGREEMENT_KEY })
  }

  /**
   * 兑换完成后返回卡包；返回失败时重定向。
   * 无参数。
   * @returns {void} 仅当前会话且已兑换时执行导航。
   * @example
   * page.openMyCards() // => 未兑换时不导航
   */
  function openMyCards() {
    if (!redeemed.value)
      return
    const ticket = scope.ticket()
    const redirect = () => {
      if (scope.current(ticket)) {
        uni.redirectTo({
          url: `${ClientRoutes.Home.card}?tab=my`,
          fail: () => toast('暂时无法打开卡包，请重试'),
        })
      }
    }
    const pages = getCurrentPages()
    if (pages[pages.length - 2]?.route?.replace(/^\//, '') === ClientRoutes.Home.card.slice(1)) {
      uni.navigateBack({ delta: 1, fail: redirect })
      return
    }
    redirect()
  }

  /**
   * 校验兑换码、协议与客户身份，再提交兑换。
   * 无参数。
   * @returns Promise<void>；防重复提交，成功提示并返回，失败显示错误。
   * @example
   * page.number.value = 'example-code'
   * page.agree.value = true
   * await page.submit() // => 服务端成功后 redeemed 为 true
   */
  async function submit(): Promise<void> {
    if (submitting.value || redeemed.value) {
      return
    }

    if (!number.value.trim()) {
      toast(t('card.exchange.inputRequired'))

      return
    }

    if (!agree.value) {
      toast(t('card.exchange.agreeRequired'))

      return
    }

    if (!requireIdentity('customer'))
      return

    const ticket = scope.ticket()
    submitting.value = true

    try {
      await withLoading(() => cardExchangeApi.exchange({ number: number.value.trim() }))

      if (!scope.current(ticket))
        return
      redeemed.value = true
      await alert(t('card.exchange.success'))
      if (scope.current(ticket))
        openMyCards()
    }
    catch (e) {
      if (scope.current(ticket))
        showError(e)
    }
    finally {
      if (scope.current(ticket))
        submitting.value = false
    }
  }

  return { number, agree, submitting, redeemed, openMyCards, init, toggleAgree, xieyi, submit }
}
