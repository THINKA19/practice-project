/**
 * ============================================================================
 * 首页用户展示
 * 【文件概述】复用脚手架用户及登录 Store，不新建会话。
 * 【方法与导出清单】useUser：展示字段和已登录用户刷新。
 * 【综合使用示例】
 * import { useUser } from '@/pages/home/index/composables/useUser'
 * const profile = useUser()
 * await profile.refresh() // 已登录时刷新现有 Store
 * ============================================================================
 */
import { computed } from 'vue'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

/**
 * 创建首页用户展示。无参数。
 * @returns 用户、昵称、头像、会员等级及刷新方法。
 * @example const profile = useUser() // profile.nick 为响应式昵称
 */
export function useUser() {
  const store = useUserStore()
  const token = useTokenStore()
  const user = computed(() => store.userInfo)
  const nick = computed(() => user.value.nickname || user.value.username || '')
  const avatar = computed(() => user.value.avatar || '/static/images/default-avatar.png')
  const levelName = computed(() => typeof user.value.userLevel?.name === 'string' ? user.value.userLevel.name : '')

  /**
   * 已登录时刷新资料，旧会话隔离由现有 Store 负责。无参数。
   * @returns Promise<void>，请求失败保留当前资料；提示由现有请求层负责。
   * @example await refresh() // 游客不发请求
   */
  async function refresh() {
    if (!token.updateNowTime().hasLogin)
      return
    await store.fetchUserInfo().catch(() => undefined)
  }

  return { user, nick, avatar, levelName, refresh }
}
