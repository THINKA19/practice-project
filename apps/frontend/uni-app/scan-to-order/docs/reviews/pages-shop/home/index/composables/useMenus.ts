import type { Ref } from 'vue'
import type { AdminMenuItem } from '../type'
import { computed } from 'vue'
import {
  SHOP_GOODS_LIST_URL,
  SHOP_MARKETING_LIST_URL,
  SHOP_ORDER_LIST_URL,
  SHOP_RIDER_LIST_URL,
  SHOP_SETTINGS_URL,
  SHOP_STATISTICS_URL,
  SHOP_TABLE_LIST_URL,
} from '@/pages-shop/routes'

/** 角标上限：超过 99 显示 99+，避免三位数把角标撑变形 */
const BADGE_MAX = 99

/**
 * 菜单配置（角标为动态值，由 useMenus 按待处理单数注入）
 *
 * 图标统一用 carbon 集合：项目只装了 @iconify-json/carbon，
 * 原先的 i-material-symbols-* 属于未安装的集合，会整片渲染为空白。
 */
const MENU_LIST: AdminMenuItem[] = [
  { icon: 'i-carbon-restaurant', label: '商品管理', path: SHOP_GOODS_LIST_URL, gradient: 'from-[#6ea8fe] to-[#4c7dd8]' },
  { icon: 'i-carbon-receipt', label: '订单管理', path: SHOP_ORDER_LIST_URL, gradient: 'from-[#ff9a76] to-[#f4735c]' },
  { icon: 'i-carbon-table-split', label: '桌台管理', path: SHOP_TABLE_LIST_URL, gradient: 'from-[#5ad0a6] to-[#3aa988]' },
  { icon: 'i-carbon-chart-bar', label: '数据统计', path: SHOP_STATISTICS_URL, gradient: 'from-[#b07aff] to-[#8f56e0]' },
  { icon: 'i-carbon-delivery', label: '骑手管理', path: SHOP_RIDER_LIST_URL, gradient: 'from-[#5ad0a6] to-[#2f9c74]' },
  { icon: 'i-carbon-bullhorn', label: '营销活动', path: SHOP_MARKETING_LIST_URL, gradient: 'from-[#f7b267] to-[#e8904f]' },
  { icon: 'i-carbon-store', label: '店铺设置', path: SHOP_SETTINGS_URL, gradient: 'from-[#7ac8f5] to-[#5aa6d5]' },
]

/**
 * 菜单渲染 + 跳转
 *
 * @param pendingCount 待处理订单数（与首页「待处理」同一个数据源），
 *                     仅「订单管理」项展示角标；为 0 时不展示
 */
export function useMenus(pendingCount: Ref<number>) {
  const menus = computed<AdminMenuItem[]>(() =>
    MENU_LIST.map((item) => {
      if (item.path !== SHOP_ORDER_LIST_URL || pendingCount.value <= 0)
        return item

      return {
        ...item,
        badge: pendingCount.value > BADGE_MAX ? `${BADGE_MAX}+` : String(pendingCount.value),
      }
    }),
  )

  function navigateMenu(item: AdminMenuItem) {
    uni.navigateTo({ url: item.path })
  }

  return { menus, navigateMenu }
}
