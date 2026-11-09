/**
 * ============================================================================
 * 【文件概述】顾客门店收藏状态：服务端为事实源，跨页面共享，换会话立即清空。
 * 【方法与导出清单】useShopFavorites：读取收藏、幂等修改及错误恢复。
 * 【综合使用示例】import { useShopFavorites } from './favorites'; await useShopFavorites().load()
 * ============================================================================
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { requireIdentity, useSessionState } from '@/pages/auth/session'
import { shopApi } from './api/shop.api'

function parseIds(value: unknown): number[] {
  if (!Array.isArray(value) || value.some(id => !Number.isSafeInteger(id) || id <= 0))
    throw new Error('收藏数据格式错误')
  return [...new Set(value)]
}

/**
 * 获取顾客收藏状态；无参数，不在本地持久化私人收藏。
 * @returns 共享 ID 数组、加载/保存状态及 load、toggle 命令。
 * @example useShopFavorites().toggle(1) // => 服务端确认后更新所有页面
 */
export const useShopFavorites = defineStore('ordering-shop-favorites', () => {
  const session = useSessionState()
  const ids = ref<number[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const ready = ref(false)
  const error = ref('')
  let version = 0
  watch(() => session.sessionRevision, () => {
    version++
    ids.value = []
    ready.value = false
    loading.value = false
    saving.value = false
    error.value = ''
  }, { flush: 'sync' })

  /** 读取当前账号收藏。无参数。@returns Promise<void>，失败保留重试提示。@example await load() // => ready 或 error */
  async function load() {
    if (!session.hasLogin || session.identity !== 'customer' || loading.value || ready.value)
      return
    const ticket = version
    loading.value = true
    error.value = ''
    try {
      const next = parseIds(await shopApi.favorites())
      if (ticket === version) {
        ids.value = next
        ready.value = true
      }
    }
    catch {
      if (ticket === version)
        error.value = '收藏加载失败，点击重试'
    }
    finally {
      if (ticket === version)
        loading.value = false
    }
  }

  /** 设置某门店收藏。@param id 门店 ID。@returns Promise<void>，登录门禁、失败及换账号不误写。@example await toggle(1) // => 服务端确认后切换 */
  async function toggle(id: number) {
    if (!requireIdentity('customer') || saving.value)
      return
    const ticket = version
    await load()
    if (ticket !== version || !ready.value || saving.value)
      return
    saving.value = true
    try {
      const next = parseIds(await shopApi.setFavorite(id, !ids.value.includes(id)))
      if (ticket === version)
        ids.value = next
    }
    catch {
      if (ticket === version)
        uni.showToast({ title: '收藏操作失败，请重试', icon: 'none' })
    }
    finally {
      if (ticket === version)
        saving.value = false
    }
  }
  return { ids, loading, saving, ready, error, load, toggle }
})
