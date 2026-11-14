/**
 * ============================================================================
 * 【文件概述】骑手资料的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderProfileStore：管理资料版本和保存请求；换号、乱序响应不会覆盖当前资料。
 * 【综合使用示例】
 * import { useRiderProfileStore } from '@/pages-rider/account/profile/composables/use-store'
 * const profile = useRiderProfileStore(); await profile.refresh() // 当前骑手资料
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { fetchRiderProfile, saveRiderProfile } from '../api/profile.api'
import { toRiderProfile } from '../models/mappers'
import { profileDraftError } from '../domain/profile.rules'
import type { RiderAccountProfile } from '../models/types'

/**
 * 管理资料版本和保存请求；换号、乱序响应不会覆盖当前资料。
 * 无参数；须在已安装 Pinia 的应用中调用。
 * @returns 当前 Pinia 实例中本领域的状态与操作。
 * @example const profile = useRiderProfileStore(); await profile.refresh() // 当前骑手资料
 */
export const useRiderProfileStore = defineStore('rider-account-profile', () => {
  const session = useSessionState()
  const profile = ref<RiderAccountProfile | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  let revision = 0
  let identityRevision = 0
  let saveRevision = 0
  const token = computed(() => session.identity === 'rider' && session.hasLogin ? session.sessionRevision : 0)
  watch(token, () => {
    revision++
    identityRevision++
    saveRevision++
    profile.value = null
    error.value = ''
    loading.value = false
    saving.value = false
  }, { flush: 'sync' })
  /**
   * 读取当前账号的最新资料。
   * 无参数。
   * @returns Promise<void>；失败信息记录在 error，不覆盖旧资料。
   * @example await store.refresh() // 更新当前资料或错误提示
   */
  async function refresh() {
    const sent = token.value
    const started = ++revision
    if (!sent)
      return
    loading.value = true
    try {
      const result = toRiderProfile(await fetchRiderProfile())
      if (sent === token.value && started === revision) {
        profile.value = result
        error.value = ''
      }
    }
    catch (reason) {
      if (sent === token.value && started === revision)
        error.value = reason instanceof Error ? reason.message : '资料加载失败'
    }
    finally {
      if (started === revision)
        loading.value = false
    }
  }
  /**
   * 校验草稿并以版本号提交保存，迟到响应不写入新账号。
   * @param name 骑手姓名。
   * @param phone 手机号。
   * @param version 正在编辑的资料版本。
   * @returns Promise<boolean>，保存且仍属于当前账号时 true；服务端错误向调用方抛出。
   * @example await store.save('骑手', '13900000000', 1) // 版本有效时保存
   */
  async function save(name: string, phone: string, version: number) {
    if (!token.value || saving.value)
      return false
    const issue = profileDraftError({ name, phone })
    if (issue)
      throw new Error(issue)
    const sent = token.value
    const identity = identityRevision
    const started = ++saveRevision
    saving.value = true
    try {
      const result = toRiderProfile(await saveRiderProfile({ version, name: name.trim(), phone: phone.trim() }))
      if (sent !== token.value || identity !== identityRevision)
        return false
      revision++
      profile.value = result
      loading.value = false
      error.value = ''
      return true
    }
    finally {
      if (started === saveRevision)
        saving.value = false
    }
  }
  return { profile, loading, saving, error, refresh, save }
})
