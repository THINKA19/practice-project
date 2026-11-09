/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / store.ts
 * 领域状态：维护跨页面共享快照及受控更新。
 * 【方法与导出清单】
 * - useCartStore：本文件对外声明。
 * 【综合使用示例】
 * import { useCartStore } from '@/pages/ordering/menu-cart/store'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { getSessionRevision } from '@/pages/auth/session'
import { toAddCartRequest, toCartInfo } from './models/mappers'
/**
 * 购物车上下文 - 聚合状态
 * 购物车以服务端为事实源，store 只缓存最近一次结果供多页共享
 */
import type { AddCartCommand, CartInfo, CartItem } from './models/types'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { cartApi } from './api/cart.api'
import { cartSelectionKey } from './domain/cart.rules'
import { useShopStore } from '@/pages/ordering/index'

/**
 * 获取共享购物车快照及受控更新命令；身份变化与过期读取不会恢复旧快照。
 * 无参数；必须在已安装 Pinia 的应用作用域使用。
 * @returns 唯一购物车 Store，包含只读派生总数、金额及刷新/增删改清空命令。
 * @example
 * import { useCartStore } from '@/pages/ordering/menu-cart/store'
 * const cart = useCartStore()
 * await cart.refresh() // => 更新当前会话快照，读取失败时为空
 */
export const useCartStore = defineStore('cart', () => {
  const info = ref<CartInfo | null>(null)
  const shop = useShopStore()

  let revision = 0
  let readVersion = 0

  /**
   * 清理本地缓存并使在途读取失效，不发送服务端清空请求；无参数。
   * @returns {void} 当前快照变为 null。
   * @example resetLocal() // => items 为空，服务端购物车保持原有状态
   */
  function resetLocal() {
    revision++
    readVersion++

    info.value = null
  }

  watch(getSessionRevision, resetLocal, { flush: 'sync' })
  watch(() => JSON.stringify([shop.current?.id, shop.scanDining?.id]), resetLocal, { flush: 'sync' })

  /** 按当前门店投影快照，汇总数量与金额；未选门店保留原协议供历史调用使用。@param next 原始快照。@returns 当前门店快照。@example scopedInfo(response) */
  function scopedInfo(next: Parameters<typeof toCartInfo>[0]) {
    const snapshot = toCartInfo(next)
    if (!snapshot || !shop.current)
      return snapshot
    const items = snapshot.items.filter(item => Number(item.shopId) === shop.current!.id)
    return {
      ...snapshot,
      items,
      number: items.reduce((sum, item) => sum + item.number, 0),
      price: items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.number, 0) / 100,
      score: items.reduce((sum, item) => sum + Number(item.score || 0) * item.number, 0),
    }
  }

  const totalNumber = computed(() => info.value?.number || 0)

  const totalPrice = computed(() => info.value?.price || 0)

  const items = computed(() => info.value?.items || [])

  /**
   * 读取当前会话购物车；只有最新的有效读取可以更新快照。
   * @param throwOnError 是否向结算调用方继续抛出读取错误，默认 false。
   * @returns Promise<CartInfo | null>，读取失败时清空当前有效快照。
   * @example await refresh() // => 当前会话的服务端快照或 null
   */
  async function refresh(throwOnError = false) {
    const started = revision
    const ticket = ++readVersion

    try {
      const next = await cartApi.info()

      if (started === revision && ticket === readVersion)
        info.value = scopedInfo(next)
    }
    catch (error) {
      if (started === revision && ticket === readVersion)
        info.value = null
      if (throwOnError && started === revision)
        throw error
    }

    return info.value
  }

  /**
   * 序列化规格与加料后加购，成功后读取服务端汇总。
   * @param cmd 商品、数量、规格、加料与可选时段。
   * @returns Promise<CartInfo | null>；加购失败抛错，会话已变更时不刷新新会话。
   * @example await add({ goodsId: 101, number: 1 }) // => 服务端允许时返回更新后的快照
   */
  async function add(cmd: AddCartCommand) {
    const started = revision
    readVersion++

    await cartApi.add(toAddCartRequest(cmd))

    return started === revision ? refresh() : null
  }

  /**
   * 更新指定条目数量，低于一件时删除；删除失败不清空已有快照。
   * @param key 服务端条目 key，不是 goodsId。
   * @param number 目标数量；小于 1 执行删除。
   * @returns Promise<CartInfo | null>；写入失败向调用方抛错。
   * @example await changeNumber('cart-item-key', 0) // => 服务端允许时删除该条目
   */

  async function changeNumber(key: string, number: number) {
    if (shop.current && !items.value.some(item => item.key === key))
      throw new Error('商品不属于当前门店购物车，请刷新后重试')
    const started = revision
    readVersion++

    if (number < 1) {
      const next = await cartApi.remove(key)

      if (started === revision) {
        readVersion++
        info.value = scopedInfo(next)
      }

      return info.value
    }

    await cartApi.modifyNumber(key, number)

    return started === revision ? refresh() : null
  }

  /**
   * 清空当前门店条目并使旧读取失效；无门店时沿用整车清空协议。无参数。
   * @returns Promise<void>；成功清理当前快照，部分删除失败时重新读取并抛错。
   * @example await clear() // => 服务端允许时 info 为 null
   */
  async function clear() {
    const started = revision
    readVersion++

    if (shop.current) {
      // 服务端购物车可包含多个门店，按条目删除本店，不能清空其他门店。
      const keys = items.value.map(item => item.key)
      try {
        for (const key of keys) {
          if (started !== revision)
            return
          await cartApi.remove(key)
        }
      }
      catch (error) {
        if (started === revision)
          await refresh()
        throw error
      }
    }
    else {
      await cartApi.empty()
    }

    if (started === revision) {
      readVersion++
      info.value = null
    }
  }

  /** 用已有增删接口替换指定条目；第二步失败时回滚新增数量。 */
  async function replaceItem(original: CartItem, cmd: AddCartCommand) {
    const started = revision
    const current = items.value.find(item => item.key === original.key)
    if (!current || current.number !== original.number || cartSelectionKey(current) !== cartSelectionKey(original))
      throw new Error('购物车已变化，请重新打开规格')
    if (cmd.goodsId !== current.goodsId)
      throw new Error('不能替换为其他商品')
    const targetIdentity = cartSelectionKey({ ...cmd, additions: cmd.addition })
    if (targetIdentity === cartSelectionKey(current))
      return changeNumber(current.key, cmd.number)
    const before = items.value.find(item => cartSelectionKey(item) === targetIdentity)
    readVersion++
    const added = await cartApi.add(toAddCartRequest(cmd))
    if (started !== revision)
      throw new Error('门店或登录状态已变化，请重新检查购物车')
    const target = added.items.find(item => cartSelectionKey(item) === targetIdentity)
    if (!target) {
      await refresh()
      throw new Error('购物车返回的规格不完整，请刷新后核对')
    }
    try {
      const next = await cartApi.remove(original.key)
      if (started === revision) {
        readVersion++
        info.value = scopedInfo(next)
      }
    }
    catch (error) {
      if (started === revision) {
        try {
          if (before)
            await cartApi.modifyNumber(target.key, before.number)
          else
            await cartApi.remove(target.key)
        }
        catch {
          throw new Error('规格更新未完成，请核对购物车数量后重试')
        }
        finally {
          if (started === revision)
            await refresh()
        }
      }
      throw error
    }
    if (started !== revision)
      throw new Error('门店或登录状态已变化，请重新检查购物车')
    return info.value
  }

  return { info, items, totalNumber, totalPrice, refresh, add, replaceItem, changeNumber, clear, resetLocal }
})
