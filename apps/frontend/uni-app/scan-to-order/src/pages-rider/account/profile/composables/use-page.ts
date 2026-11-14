/**
 * ============================================================================
 * 【文件概述】骑手资料的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderProfilePage：管理资料页草稿及保存反馈，不复制共享会话。
 * 【综合使用示例】
 * import { useRiderProfilePage } from '@/pages-rider/account/profile/composables/use-page'
 * const page = useRiderProfilePage() // 在资料页 setup 中绑定编辑状态
 * ============================================================================
 */
import { t } from '@/locale'
import { useSessionAccountScope } from '@/pages/auth/session'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useRiderLoginAuth } from '@/pages-rider/auth/login'
import { showError, toast } from '@/utils/project/interaction'
import { useRiderTaskRefresh } from '@/pages-rider/delivery/task'
import { profileDraftError } from '../domain/profile.rules'
import { useRiderProfileStore } from './use-store'

/**
 * 管理资料页草稿及保存反馈，不复制共享会话。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const page = useRiderProfilePage() // 在资料页 setup 中绑定编辑状态
 */
export function useRiderProfilePage() {
  useRiderTaskRefresh()
  const store = useRiderProfileStore()
  const scope = useSessionAccountScope(() => {})
  const { profile, loading, saving, error } = storeToRefs(store)
  const name = ref('')
  const phone = ref('')
  const version = ref(0)
  watch(profile, (value) => {
    name.value = value?.name || ''
    phone.value = value?.phone || ''
    version.value = value?.version || 0
  }, { immediate: true })
  const { ensureLogin } = useRiderLoginAuth()
  onShow(() => {
    if (ensureLogin())
      void store.refresh()
  })
  async function save() {
    const ticket = scope.ticket()
    const issue = profileDraftError({ name: name.value, phone: phone.value })
    if (issue) {
      toast(issue)
      return
    }
    try {
      if (await store.save(name.value.trim(), phone.value.trim(), version.value) && scope.current(ticket))
        toast(t('rider.profile.saved'), 'success')
    }
    catch (reason) {
      if (scope.current(ticket))
        showError(reason)
    }
  }
  return { profile, name, phone, loading, saving, error, save, refresh: store.refresh }
}
