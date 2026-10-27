import { computed, ref } from 'vue'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'
/**
 * 领取礼品卡 ViewModel（好友分享进入）
 * 来源：bee-master/pages/card/receive.js  onLoad、submit、cardShareFetch
 * calculate=true 预览赠送人与卡信息；false 正式领取。失败（卡不存在/已领取）提示后回首页
 */
import type { CardShareFetchResult } from '../../gift-card'
import { useI18n } from 'vue-i18n'
import { cardApi } from '../../gift-card'
import { confirm, setTitle, withLoading } from '@/utils/project/interaction'
import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'

/** 管理分享卡预览与领取；calculate=true 仅查询，正式领取成功后再提示并返回。 */
export function useGiftReceivePage() {
  const { t } = useI18n()

  const id = ref('')

  const shareToken = ref('')

  const preview = ref<CardShareFetchResult | null>(null)

  const submitting = ref(false)
  const scope = useSessionAccountScope(() => {
    preview.value = null
    submitting.value = false
  })

  const user = computed(() => preview.value?.user)

  const cardUser = computed(() => preview.value?.cardUser)

  const cardInfo = computed(() => preview.value?.cardInfo)

  function init(query: { id?: string, shareToken?: string } = {}) {
    setTitle(t('card.receive.title'))

    id.value = query.id || ''

    shareToken.value = query.shareToken || ''

    cardShareFetch(true)
  }

  function submit() {
    cardShareFetch(false)
  }

  async function notifyAndGoHome(content: string, ticket: number) {
    await confirm({ content, showCancel: false, confirmText: t('card.receive.gotIt') })

    if (scope.current(ticket))
      void navigate(ClientRoutes.Home.card, { tab: 'my' })
  }

  async function cardShareFetch(calculate: boolean): Promise<void> {
    if (submitting.value) {
      return
    }

    if (!requireIdentity('customer'))
      return

    if (!id.value || !shareToken.value)
      return
    const ticket = scope.ticket()
    submitting.value = true

    try {
      const res = await withLoading(() => cardApi.fetchShare(id.value, shareToken.value, calculate))

      if (!scope.current(ticket))
        return
      if (calculate) {
        preview.value = res
      }
      else {
        submitting.value = false

        await notifyAndGoHome(t('card.receive.success'), ticket)
      }
    }
    catch (e) {
      if (!scope.current(ticket))
        return
      submitting.value = false

      await notifyAndGoHome(t('card.receive.unavailable'), ticket)
    }
    finally {
      if (scope.current(ticket))
        submitting.value = false
    }
  }

  return { user, cardUser, cardInfo, init, submit }
}
