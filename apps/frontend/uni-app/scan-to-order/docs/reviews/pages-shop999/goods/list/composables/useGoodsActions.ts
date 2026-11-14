import type { ShopGoodsItem } from '../type'
import { SHOP_GOODS_EDIT_URL } from '@/pages-shop/routes'

/** 商品操作：跳编辑页 / 上下架 / 调库存 */
export function useGoodsActions() {
  /** 新增（不传 id）或编辑商品 */
  function goEdit(id?: number) {
    uni.navigateTo({ url: id ? `${SHOP_GOODS_EDIT_URL}?id=${id}` : SHOP_GOODS_EDIT_URL })
  }

  /**
   * 上下架
   * TODO 上线时替换为真实接口：POST /shop/goods/status
   */
  function toggleStatus(item: ShopGoodsItem, onDone?: (updated: ShopGoodsItem) => void) {
    const to = item.status === 1 ? 0 : 1
    uni.showModal({
      title: to === 0 ? '下架确认' : '上架确认',
      content: `确定将「${item.name}」${to === 0 ? '下架' : '上架'}吗？`,
      success: (r) => {
        if (r.confirm) {
          const updated = { ...item, status: to as 0 | 1 }
          onDone?.(updated)
          uni.showToast({ title: to === 0 ? '已下架' : '已上架', icon: 'success' })
        }
      },
    })
  }

  /**
   * 调整库存
   * TODO 上线时替换为真实接口：POST /shop/goods/stock
   */
  function adjustStock(item: ShopGoodsItem, onDone?: (updated: ShopGoodsItem) => void) {
    uni.showModal({
      title: `调整「${item.name}」库存`,
      editable: true,
      placeholderText: `当前：${item.stock}，请输入新库存`,
      success: (r) => {
        if (!r.confirm)
          return
        // 只接受纯数字：parseInt('12abc') 会得到 12，把用户明显输错的内容静默截断；
        // 另外输入框清空后直接点确定时也要给提示，否则点了确定毫无反应
        const raw = (r.content ?? '').trim()
        if (!/^\d+$/.test(raw)) {
          uni.showToast({ title: '请输入有效的库存数量', icon: 'none' })
          return
        }
        onDone?.({ ...item, stock: Number(raw) })
        uni.showToast({ title: '库存已更新', icon: 'success' })
      },
    })
  }

  return { goEdit, toggleStatus, adjustStock }
}
