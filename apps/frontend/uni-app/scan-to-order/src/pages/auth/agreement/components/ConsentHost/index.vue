<script setup lang="ts">
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ensurePrivacyConsent, finishPrivacyConsent, useAgreementPrivacyConsent } from '../../composables/use-privacy-consent'
import { AGREEMENT_PAGES } from '../../routes'
import { identityForPath } from '@/pages/auth/session'
import ConsentDialog from '../ConsentDialog/index.vue'

defineOptions({ name: 'PrivacyConsentPopup' })

const { t } = useI18n()
const descriptionKeys = ['summary', 'scope', 'account', 'optional', 'usage', 'orders', 'accuracy', 'permissions', 'necessary', 'storage', 'retention', 'security', 'device', 'sharing', 'rights', 'requests', 'updates', 'choice']
const paragraphs = computed(() => descriptionKeys.map(key => t(`auth.privacyConsent.${key}`)))
const { requested } = useAgreementPrivacyConsent()
const active = ref(false)
const visible = computed(() => active.value && requested.value)
const policyPages: string[] = [AGREEMENT_PAGES.privacy, AGREEMENT_PAGES.user]
function syncVisibility() {
  const pages = getCurrentPages()
  const path = pages[pages.length - 1]?.route || ''
  active.value = identityForPath(path) === 'customer' && !policyPages.includes(`/${path.replace(/^\//, '')}`)
  if (active.value)
    void ensurePrivacyConsent(true)
}
// 小程序首次 onShow 可能早于全局根组件的子组件挂载，挂载时补齐首次展示。
onMounted(syncVisibility)
onShow(syncVisibility)
onHide(() => {
  active.value = false
})
onUnload(() => {
  active.value = false
})
function readPolicy() {
  uni.navigateTo({ url: AGREEMENT_PAGES.privacy })
}
</script>

<template>
  <ConsentDialog
    :visible="visible"
    :title="t('auth.privacyConsent.title')"
    :paragraphs="paragraphs"
    :read-label="t('auth.privacyConsent.read')"
    :accept-label="t('auth.privacyConsent.accept')"
    :reject-label="t('auth.privacyConsent.reject')"
    @read="readPolicy"
    @accept="finishPrivacyConsent(true)"
    @reject="finishPrivacyConsent(false)"
  />
</template>
