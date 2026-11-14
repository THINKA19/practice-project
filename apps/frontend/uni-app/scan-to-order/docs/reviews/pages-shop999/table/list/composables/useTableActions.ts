import type { TableItem } from '../type'
import { ref } from 'vue'
import { SHOP_ORDER_DETAIL_URL } from '@/pages-shop/routes'

/** 桌台操作：点桌台 / 桌码弹窗 / 开台 / 清洁 / 打印 */
export function useTableActions() {
  // ============ 桌码弹窗 ============
  const qrVisible = ref(false)
  const currentTable = ref<TableItem | null>(null)

  function showQrcode(t: TableItem) {
    currentTable.value = t
    qrVisible.value = true
  }

  /**
   * 释放桌台：清空关联订单与预订信息
   *
   * 不清空的话，「用餐中 → 清洁中 → 空闲 → 再次开台」会继承上一桌的
   * orderId / orderNo / people。模板按 `status === 'using' && orderId` 判断，
   * 于是新客人坐下后会看到上一单的订单号和用餐人数。
   */
  function releaseTable(t: TableItem) {
    t.orderId = undefined
    t.orderNo = undefined
    t.people = undefined
    t.reserveName = undefined
    t.reserveTime = undefined
    t.cleanTimer = undefined
  }

  // ============ 点桌台 ============
  function tapTable(t: TableItem) {
    if (t.status === 'using' && t.orderId) {
      uni.navigateTo({ url: `${SHOP_ORDER_DETAIL_URL}?id=${t.orderId}` })
    }
    else if (t.status === 'reserved') {
      uni.showModal({
        title: `桌台 ${t.no} 预订信息`,
        content: `预订人：${t.reserveName}\n时间：${t.reserveTime}\n桌台：${t.seats}人位`,
        confirmText: '到店入座',
        cancelText: '取消预订',
        success: (r) => {
          // 到店入座 → 桌台转为「用餐中」；取消预订 → 释放为「空闲」
          t.status = r.confirm ? 'using' : 'free'
          // 预订信息与可能残留的订单关联一并清掉，避免新客人继承旧订单
          releaseTable(t)
          uni.showToast({ title: r.confirm ? '已入座，桌台转为用餐中' : '预订已取消', icon: r.confirm ? 'success' : 'none' })
        },
      })
    }
    else if (t.status === 'cleaning') {
      uni.showModal({
        title: '清洁完成？',
        content: `确认桌台 ${t.no} 已清洁完成？`,
        success: (r) => {
          if (r.confirm) {
            t.status = 'free'
            releaseTable(t)
            uni.showToast({ title: '已置为空闲', icon: 'success' })
          }
        },
      })
    }
    else {
      // 空闲 → 查看二维码
      showQrcode(t)
    }
  }

  // ============ 开台 / 清洁 ============
  function markUsing(t: TableItem) {
    uni.showModal({
      title: '开台确认',
      content: `确认将 ${t.no}（${t.seats}人位）标记为「用餐中」？`,
      success: (r) => {
        if (r.confirm) {
          // 手动开台 = 线下开台，不应挂着上一单的订单关联
          releaseTable(t)
          t.status = 'using'
          qrVisible.value = false
          uni.showToast({ title: '开台成功', icon: 'success' })
        }
      },
    })
  }

  function markCleaning(t: TableItem) {
    // 置为清洁中意味着这一桌已结束，订单关联与清洁倒计时都要重置
    releaseTable(t)
    t.status = 'cleaning'
    qrVisible.value = false
    uni.showToast({ title: '已置为清洁中', icon: 'success' })
  }

  function printQrcode(t: TableItem) {
    uni.showToast({ title: `打印桌台${t.no}二维码（开发中）`, icon: 'none' })
  }

  // ============ 弹窗内操作 ============
  // 统一以 currentTable 为准并做空值兜底，模板里就不必再写 `as TableItem` 断言
  function printCurrentQrcode() {
    if (currentTable.value)
      printQrcode(currentTable.value)
  }

  function markCurrentUsing() {
    if (currentTable.value)
      markUsing(currentTable.value)
  }

  function markCurrentCleaning() {
    if (currentTable.value)
      markCleaning(currentTable.value)
  }

  return {
    qrVisible,
    currentTable,
    showQrcode,
    tapTable,
    markUsing,
    markCleaning,
    printQrcode,
    printCurrentQrcode,
    markCurrentUsing,
    markCurrentCleaning,
  }
}
