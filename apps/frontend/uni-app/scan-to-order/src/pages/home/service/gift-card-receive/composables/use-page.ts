/**
 * ============================================================================
 * 【文件概述】
 * 礼品卡领取领域业务编排层；通过礼品卡和会话公开入口访问数据，隔离账号切换后的迟到响应。
 *
 * 【方法与导出清单】
 * useGiftReceivePage()：创建本页独立状态与业务操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useGiftReceivePage } from '@/pages/home/service/gift-card-receive'
 * // 在 Vue setup 中调用，作用域销毁时释放会话监听。
 * const page = useGiftReceivePage()
 * page.init({ id: '7', shareToken: 'example-token' }) // => 仅预览
 * page.submit() // => 预览成功后才允许主动领取
 * ```
 * ============================================================================
 */
import { computed, ref } from 'vue'
import { getIdentity, getToken, redirectToLogin, requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
import { giftReceivePath } from '../../routes'
import type { CardShareFetchResult } from '../models/types'
import { parseSharePreview } from '../models/mappers'
import { useI18n } from 'vue-i18n'
import { cardReceiveApi } from '../api/receive.api'
import { confirm, setTitle, withLoading } from '@/utils/project/interaction'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/**
 * 装配礼品卡领取的响应式状态与操作。
 * 无参数；须在 Vue setup 或响应式作用域内调用。
 * @returns 独立的响应式状态和操作方法；请求失败由页面状态或交互提示表达。
 * @example const page = useGiftReceivePage() // => 初始状态独立，尚未发起请求
 */
export function useGiftReceivePage() {
  const { t } = useI18n()

  const id = ref('')

  const shareToken = ref('')

  const preview = ref<CardShareFetchResult | null>(null)

  const submitting = ref(false)
  const completed = ref(false)
  const invalid = ref(false)
  const failed = ref(false)
  const failureMessage = ref('')
  const loginRequired = ref(false)
  let generation = 0
  const scope = useSessionAccountScope(() => {
    generation++
    failed.value = false
    failureMessage.value = ''
    loginRequired.value = false
    preview.value = null
    completed.value = false
    submitting.value = false
  })

  const user = computed(() => preview.value?.user)

  const cardUser = computed(() => preview.value?.cardUser)

  const cardInfo = computed(() => preview.value?.cardInfo)

  /** 登录后恢复同一份赠送，包括页面实例缺少完整路由的情况。 */
  function loginToReceive() {
    if (invalid.value || !id.value || !shareToken.value)
      return
    redirectToLogin({
      identity: 'customer',
      queryString: `?redirect=${encodeURIComponent(giftReceivePath(id.value, shareToken.value))}`,
    })
  }

  /**
   * 校验分享参数并预览；参数变化时作废旧响应。
   * @param query { id?: string, shareToken?: string }；正安全整数持卡编号与非空分享凭证。
   * @returns {void} 有效参数只发起预览，不执行领取。
   * @example
   * page.init({ id: '7', shareToken: 'example-token' }) // => 发起只读预览
   */
  function init(query: { id?: string, shareToken?: string } = {}) {
    setTitle(t('card.receive.title'))

    const nextId = query.id || ''
    const nextToken = query.shareToken || ''
    if (nextId !== id.value || nextToken !== shareToken.value) {
      generation++
      preview.value = null
      completed.value = false
      failed.value = false
      submitting.value = false
    }
    id.value = nextId
    shareToken.value = nextToken

    invalid.value = !/^\d+$/.test(id.value) || !Number.isSafeInteger(Number(id.value)) || Number(id.value) <= 0 || !shareToken.value.trim()
    if (!invalid.value && !completed.value)
      void cardShareFetch(true)
  }

  /**
   * 仅在有效且成功的预览后主动领取。
   * 无参数。
   * @returns {void} 提交期间及完成后不重复领取。
   * @example
   * page.submit() // => 未取得预览时不请求
   */
  function submit() {
    if (preview.value && !failed.value && !invalid.value && !completed.value)
      void cardShareFetch(false)
  }

  /** 打开领取后的卡包，供成功提示和手动返回入口共用。 */
  function goToWallet() {
    return navigate(ClientRoutes.Home.card, { tab: 'my' })
  }

  /**
   * 领取成功提示后进入我的卡包。
   * @param content string；面向用户的完成提示。
   * @param ticket number；发起操作时的会话版本。
   * @param request number；分享请求代次，防止旧弹窗触发导航。
   * @returns Promise<void>；仅会话与分享参数均未变化时导航。
   * @example
   * await notifyAndGoHome('领取成功', ticket, request) // => 当前操作有效才导航
   */
  async function notifyAndGoHome(content: string, ticket: number, request: number) {
    await confirm({ content, showCancel: false, confirmText: t('card.receive.gotIt') })

    if (scope.current(ticket) && request === generation)
      void goToWallet()
  }

  /**
   * 执行分享预览或领取，并保护会话和请求代次。
   * @param calculate boolean；true 只预览，false 实际领取。
   * @returns Promise<void>；失败进入可重新查询状态，不自动重放领取。
   * @example
   * await cardShareFetch(true) // => 仅更新预览
   */
  async function cardShareFetch(calculate: boolean): Promise<void> {
    if (invalid.value || submitting.value || completed.value) {
      return
    }

    const identity = getIdentity()
    loginRequired.value = !getToken() && (!identity || identity === 'customer')
    if (loginRequired.value) {
      loginToReceive()
      return
    }
    if (!requireIdentity('customer'))
      return

    if (!id.value || !shareToken.value)
      return
    const ticket = scope.ticket()
    const request = ++generation
    if (calculate)
      preview.value = null
    submitting.value = true
    failed.value = false
    failureMessage.value = ''

    try {
      const res = await withLoading(() => cardReceiveApi.fetchShare({ id: id.value, shareToken: shareToken.value, calculate }))

      if (!scope.current(ticket) || request !== generation)
        return
      if (calculate) {
        const result = parseSharePreview(res)
        if (result.cardUser.id !== Number(id.value))
          throw new Error('领取卡片与链接不一致')
        preview.value = result
      }
      else {
        completed.value = true

        await notifyAndGoHome(t('card.receive.success'), ticket, request)
      }
    }
    catch (error) {
      if (!scope.current(ticket) || request !== generation)
        return
      submitting.value = false

      preview.value = null
      // 公共客户端为业务错误附加状态码，领取页只展示服务端文案。
      failureMessage.value = error instanceof Error
        ? /^请求错误\[\d+\]：(.+)$/.exec(error.message)?.[1] || ''
        : ''
      failed.value = true
    }
    finally {
      if (scope.current(ticket) && request === generation)
        submitting.value = false
    }
  }

  /**
   * 重新查询分享状态，不重放领取写操作。
   * 无参数。
   * @returns Promise<void>；更新预览或错误状态。
   * @example
   * await page.retry() // => 请求 calculate=true
   */
  function retry(): Promise<void> {
    return cardShareFetch(true)
  }

  return { user, cardUser, cardInfo, submitting, completed, invalid, failed, failureMessage, loginRequired, loginToReceive, retry, init, submit, goToWallet }
}
