import type { Ref } from 'vue'
import { computed } from 'vue'
import { t } from '@/locale'
import type { AdminMenuItem } from '../../models/index'
import { ShopRoutes } from '@/pages-shop/routes'
import { navigate as go } from '@/utils/project/navigation'
import { MERCHANT_PAGE_PERMISSIONS, useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { toast } from '@/utils/project/interaction'

const SHOP_GOODS_LIST_URL = ShopRoutes.Business.goods
const SHOP_ORDER_LIST_URL = ShopRoutes.Operations.orders
const SHOP_RIDER_LIST_URL = ShopRoutes.Operations.delivery
const SHOP_SETTINGS_URL = ShopRoutes.Management.settings
const SHOP_STATISTICS_URL = ShopRoutes.Business.statistics
const SHOP_TABLE_LIST_URL = ShopRoutes.Operations.tables

/** 角标上限：超过 99 显示 99+，避免三位数把角标撑变形 */
const BADGE_MAX = 99

/** 菜单配置（订单角标由 useMenus 按待办数注入） */
const MENU_LIST: AdminMenuItem[] = [
  { icon: 'i-carbon-receipt', label: '订单管理', path: SHOP_ORDER_LIST_URL },
  { icon: 'i-carbon-table-split', label: '桌台看板', path: SHOP_TABLE_LIST_URL },
  { icon: 'i-carbon-delivery', label: '骑手管理', path: SHOP_RIDER_LIST_URL },
  { icon: 'i-carbon-chart-bar', label: '数据统计', path: SHOP_STATISTICS_URL },
  { icon: 'i-carbon-restaurant', label: '商品管理', path: SHOP_GOODS_LIST_URL },
  { icon: 'i-carbon-store', label: '店铺设置', path: SHOP_SETTINGS_URL },
]

/**
 * 菜单渲染 + 跳转
 *
 * @param pendingCount 待处理订单数（与首页「待处理」同一个数据源），
 *                     仅「订单管理」项展示角标；为 0 时不展示
 */
export function useMenus(pendingCount: Ref<number>) {
  const store = useMerchantShopStore()
  const required = MERCHANT_PAGE_PERMISSIONS
  const menus = computed<AdminMenuItem[]>(() =>
    MENU_LIST.filter(item => store.can(required[item.path])).map((item) => {
      if (item.path !== SHOP_ORDER_LIST_URL || pendingCount.value <= 0)
        return item.path === SHOP_TABLE_LIST_URL ? { ...item, label: t('shop.tableBoard.title') } : item

      return {
        ...item,
        badge: pendingCount.value > BADGE_MAX ? `${BADGE_MAX}+` : String(pendingCount.value),
      }
    }),
  )

  async function navigateMenu(item: AdminMenuItem) {
    if (!store.can(required[item.path]))
      return
    const result = await go(item.path)
    if (!result.ok)
      toast(`无法打开${item.label}，请重试`)
  }

  return { menus, navigateMenu }
}
