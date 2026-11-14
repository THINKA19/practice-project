import type { ShopOrder } from '../type'
import { setShopOrderStatus } from '@/constants/status'
import { SHOP_ORDER_DETAIL_URL } from '@/pages-shop/routes'

/** 订单操作：接单 / 完成出餐 / 拒单 / 查看详情 */
export function useOrderActions(findOrder: (id: string) => ShopOrder | undefined) {
  function goDetail(id: string) {
    uni.navigateTo({ url: `${SHOP_ORDER_DETAIL_URL}?id=${id}` })
  }

  /** 接单：待接单 → 制作中 */
  function acceptOrder(id: string) {
    uni.showModal({
      title: '接单确认',
      content: '确认接收此订单？',
      success: (r) => {
        if (!r.confirm)
          return
        // 先改状态再提示，订单找不到时不能提示"已接单"
        const o = findOrder(id)
        if (!o) {
          uni.showToast({ title: '订单不存在或已刷新', icon: 'none' })
          return
        }
        setShopOrderStatus(o, 2)
        uni.showToast({ title: '已接单', icon: 'success' })
      },
    })
  }

  /** 完成出餐：制作中 → 已完成 */
  function finishOrder(id: string) {
    const o = findOrder(id)
    if (!o) {
      uni.showToast({ title: '订单不存在或已刷新', icon: 'none' })
      return
    }
    setShopOrderStatus(o, 4)
    uni.showToast({ title: '已完成出餐', icon: 'success' })
  }

  /** 拒单：待接单 → 已取消 */
  function cancelOrder(id: string) {
    uni.showModal({
      title: '取消订单',
      content: '确认取消该订单？此操作不可撤销',
      confirmColor: '#E68873',
      success: (r) => {
        if (!r.confirm)
          return
        const o = findOrder(id)
        if (!o) {
          uni.showToast({ title: '订单不存在或已刷新', icon: 'none' })
          return
        }
        setShopOrderStatus(o, 5)
        uni.showToast({ title: '已取消', icon: 'none' })
      },
    })
  }

  return { goDetail, acceptOrder, finishOrder, cancelOrder }
}
