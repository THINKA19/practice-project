/**
 * 商家后台（pages-shop）页面路径常量
 *
 * 统一从这里取路径，禁止在页面里硬编码 —— 目录迁移时只改这一个文件。
 * 注意：路由与文件路径一一对应（definePage 按文件路径注册），
 * 页面内部跳转必须使用本文件常量，不得再写 /pages/admin/** 旧路径。
 *
 * 分层（避免多真相源）：
 *   - 本文件只登记 **本域（pages-shop）自己的页面**
 *   - 跨域共享路径（顾客端 tab 页 / 订单详情等）统一在 @/constants/routes 定义一次，
 *     本域需要时直接 import，不要在这里再写一份（此前 HOME_PAGE 就与
 *     pages/me/routes.ts 的 CLIENT_HOME_URL 重复，且后者值是错的）
 *   - 路径一致性由 src/constants/__tests__/routes.test.ts 兜底
 */

/** 商家后台登录页 */
export const SHOP_LOGIN_URL = '/pages-shop/auth/login/index'

/** 商家后台首页 */
export const SHOP_HOME_URL = '/pages-shop/home/index/index'

/** 商品管理 */
export const SHOP_GOODS_LIST_URL = '/pages-shop/goods/list/index'
export const SHOP_GOODS_EDIT_URL = '/pages-shop/goods/edit/index'

/** 订单管理 */
export const SHOP_ORDER_LIST_URL = '/pages-shop/order/list/index'
export const SHOP_ORDER_DETAIL_URL = '/pages-shop/order/detail/index'

/** 桌台管理 */
export const SHOP_TABLE_LIST_URL = '/pages-shop/table/list/index'

/** 营销活动 */
export const SHOP_MARKETING_LIST_URL = '/pages-shop/marketing/list/index'

/** 骑手管理（派单 / 骑手状态） */
export const SHOP_RIDER_LIST_URL = '/pages-shop/rider/list/index'

/** 数据统计 */
export const SHOP_STATISTICS_URL = '/pages-shop/statistics/index'

/** 店铺设置 */
export const SHOP_SETTINGS_URL = '/pages-shop/shop/settings/index'

/** 商家入驻申请 */
export const SHOP_JOIN_APPLY_URL = '/pages-shop/shop/join-apply/index'
