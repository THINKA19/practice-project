/**
 * ============================================================================
 * 【文件概述】pages/auth/session/store.ts 的类型、状态或边界职责。
 * 【方法与导出清单】useSessionStore。
 * 【综合使用示例】import { useSessionStore } from '@/pages/auth/session/store'
 * ============================================================================
 */
import type { SessionSnapshot } from './models/session'
import type { RestorableSession } from './restore'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { restoreSessionState } from './restore'
/** 内部会话状态，无参数。@returns 唯一快照、版本和登录锁。@example useSessionStore().snapshot // null 或快照 */
export const useSessionStore = defineStore('auth-session', () => {
  const snapshot = ref<SessionSnapshot | null>(null)

  const revision = ref(0)

  const authenticating = ref(false)

  const now = ref(Date.now())

  const restored = ref(false)

  return { snapshot, revision, authenticating, now, restored }
}, { persist: { paths: ['snapshot'], afterRestore: ({ store }) => {
  // 首次创建及显式 $hydrate 后都校验持久化数据，不依赖应用启动入口。
  store.restored = false
  // 持久化插件的上下文未保留此 Store 的具体状态类型。
  restoreSessionState(store as typeof store & RestorableSession)
} } })
