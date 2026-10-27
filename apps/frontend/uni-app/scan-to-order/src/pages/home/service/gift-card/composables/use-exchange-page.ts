import { ref } from 'vue'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
/**
 * 兑换礼品卡 ViewModel
 * 来源：bee-master/pages/card/exchange.js  onLoad、_agree、xieyi、submit
 */
import { useI18n } from 'vue-i18n'
import { cardApi } from './use-requests'
import { alert, setTitle, showError, toast, withLoading } from '@/utils/project/interaction'

import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/** 礼品卡使用协议（CMS 单页 key） */
const AGREEMENT_KEY = 'lipinkaxieyi'

/** 维护兑换码与协议确认状态；提交期间禁止重复兑换，返回动作绑定当前会话。 */
export function useCardExchangePage() {
  const { t } = useI18n()

  const number = ref('')

  const agree = ref(false)

  const submitting = ref(false)
  const scope = useSessionAccountScope(() => {
    number.value = ''
    agree.value = false
    submitting.value = false
  })

  function init() {
    setTitle(t('card.exchange.title'))
  }

  function toggleAgree() {
    agree.value = !agree.value
  }

  function xieyi() {
    void navigate(ClientRoutes.Account.about, { key: AGREEMENT_KEY })
  }

  async function submit(): Promise<void> {
    if (submitting.value) {
      return
    }

    if (!number.value) {
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
      await withLoading(() => cardApi.exchange({ number: number.value }))

      if (!scope.current(ticket))
        return
      await alert(t('card.exchange.success'))
      // 返回礼品卡首页后切到“我的礼品卡”并刷新

      if (scope.current(ticket))
        uni.redirectTo({ url: `${ClientRoutes.Home.card}?tab=my` })
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

  return { number, agree, init, toggleAgree, xieyi, submit }
}
