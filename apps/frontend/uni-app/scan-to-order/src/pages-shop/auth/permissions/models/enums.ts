import { ShopRoutes } from '@/pages-shop/routes'

/** 商家页面所需权限；未登记的页面只要求已选门店。 */
export const MERCHANT_PAGE_PERMISSIONS: Readonly<Record<string, string>> = {
  [ShopRoutes.Operations.orders]: 'order.read',
  [ShopRoutes.Operations.orderList]: 'order.read',
  [ShopRoutes.Operations.orderDetail]: 'order.read',
  [ShopRoutes.Operations.tables]: 'table.read',
  [ShopRoutes.Business.goods]: 'goods.edit',
  [ShopRoutes.Operations.delivery]: 'delivery.read',
  [ShopRoutes.Business.statistics]: 'statistics.read',
  [ShopRoutes.Management.settings]: 'shop.settings.manage',
}
