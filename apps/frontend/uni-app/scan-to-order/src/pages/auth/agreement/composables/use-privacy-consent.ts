/** 顾客隐私选择及底部弹窗调度；与账号登录独立，商家和骑手会话不受影响。 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PRIVACY_VERSION } from '../models/enums'

interface ConsentRecord {
  version: string
  choice: 'accepted' | 'rejected'
  explicit: true
}

const usePrivacyStore = defineStore('customer-privacy-consent', () => {
  const record = ref<unknown>(null)
  const enabled = ref(false)
  const revision = ref(0)
  const requested = ref(false)
  const choice = computed(() => {
    const value = record.value as Partial<ConsentRecord> | null
    // 旧版拒绝记录可能来自卸载；仅沿用明确拒绝及有效同意。
    return value && value.version === PRIVACY_VERSION && (value.choice === 'accepted' || (value.choice === 'rejected' && value.explicit === true))
      ? value.choice
      : 'unknown'
  })
  return { record, enabled, revision, choice, requested }
}, { persist: { paths: ['record'] } })

let pending: Promise<boolean> | undefined
let resolvePending: ((accepted: boolean) => void) | undefined

/** 应用启动时启用；在页面和会话读取前执行，未知状态默认不开放顾客资料。 */
export function enablePrivacyConsent() {
  const store = usePrivacyStore()
  if (!store.enabled) {
    store.enabled = true
    store.revision++
  }
}

/** 返回当前隐私选择是否允许读取顾客资料；尚未启用弹窗治理时保留既有启动兼容行为。 */
export function canUseCustomerData(): boolean {
  const store = usePrivacyStore()
  return !store.enabled || store.choice === 'accepted'
}

/** 提供隐私选择版本，供会话和业务请求识别已经失效的响应。 */
export function getPrivacyRevision(): number {
  return usePrivacyStore().revision
}

/** 记录明确的同意或拒绝并推进版本；相同选择不重复使业务请求失效。 */
export function setPrivacyChoice(accepted: boolean) {
  const store = usePrivacyStore()
  if (store.choice === (accepted ? 'accepted' : 'rejected'))
    return
  store.record = { version: PRIVACY_VERSION, choice: accepted ? 'accepted' : 'rejected', explicit: true }
  store.revision++
}

/** 仅明确点击按钮才记录；刷新、隐藏和卸载不写入用户选择。 */
export function finishPrivacyConsent(accepted: boolean) {
  setPrivacyChoice(accepted)
  settlePrivacyConsent(accepted)
}

function settlePrivacyConsent(accepted: boolean) {
  usePrivacyStore().requested = false
  const resolve = resolvePending
  pending = undefined
  resolvePending = undefined
  resolve?.(accepted)
}

/** 结束等待但不伪造用户选择，下次进入仍可提示。 */
export function cancelPrivacyConsent() {
  settlePrivacyConsent(false)
}

/** 提供隐私确认弹窗的只读请求状态；展示状态来自唯一协议 Store，不创建第二份选择记录。 */
export function useAgreementPrivacyConsent() {
  const store = usePrivacyStore()
  return { requested: computed(() => store.requested) }
}

/** automatic 只提示首次/版本变化；用户主动使用功能时允许重新确认。 */
export function ensurePrivacyConsent(automatic = false): Promise<boolean> {
  const store = usePrivacyStore()
  if (canUseCustomerData())
    return Promise.resolve(true)
  if (pending)
    return pending
  if (automatic && store.choice === 'rejected')
    return Promise.resolve(false)

  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const path = `/${(page?.route || '').replace(/^\//, '')}`
  // 阅读全文不被自动弹窗遮挡。
  if (automatic && ['/pages/auth/agreement/privacy', '/pages/auth/agreement/user'].includes(path))
    return Promise.resolve(false)

  pending = new Promise<boolean>((resolve) => {
    resolvePending = resolve
  })
  store.requested = true
  return pending
}
