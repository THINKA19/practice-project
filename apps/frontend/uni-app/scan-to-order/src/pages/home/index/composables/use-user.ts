/**
 * ============================================================================
 * 首页用户展示
 * 【文件概述】读取共享会话模块的只读顾客视图，不新建用户状态。
 * 【方法与导出清单】useHomeUser：展示字段和已登录用户刷新。
 * 【综合使用示例】
 * import { useHomeUser } from '@/pages/home/index/composables/use-user'
 * const profile = useHomeUser()
 * await profile.refresh() // 已登录时通过 Session 刷新资料
 * ============================================================================
 */
import { computed } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { t } from '@/locale'

/**
 * 创建首页用户展示。无参数。
 * @returns 用户、昵称、头像、会员等级及刷新方法。
 * @example const profile = useHomeUser() // profile.nick 为响应式昵称
 */
export function useHomeUser() {
  const store = useSessionState()
  const hasLogin = computed(() => store.hasLogin && store.identity === 'customer')
  const user = computed(() => hasLogin.value ? store.userInfo : null)
  const nick = computed(() => user.value?.nickname || t('account.profile.wechatUser'))
  const avatar = computed(() => user.value?.avatar || '/static/images/default-avatar.png')
  const levelName = computed(() => user.value?.userLevel?.name || '')

  /**
   * 已登录时刷新资料，旧会话隔离由 Session 负责。无参数。
   * @returns Promise<void>，请求失败保留当前资料；提示由现有请求层负责。
   * @example await refresh() // 游客不发请求
   */
  async function refresh() {
    store.updateNowTime()
    if (!hasLogin.value)
      return
    await store.fetchUserInfo().catch(() => undefined)
  }

  return { user, hasLogin, nick, avatar, levelName, refresh }
}
