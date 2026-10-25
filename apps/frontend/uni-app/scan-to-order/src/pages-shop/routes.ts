import { AUTH_ROUTES } from '@/pages/auth/session'
/**
 * ============================================================================
 * 商家端分包路由定义表 (Shop Subpackage Route Contracts)
 * ============================================================================
 *
 * 【模块说明】
 * 本文件专用于声明商家端（pages-shop 分包）所有的页面静态路径常量。
 * 遵循业务模块化分组组织，作为全工程在商家业务场景下路由调度的单一数据源（Single Source of Truth）。
 *
 * 【注意事项】
 * 1. 本文件仅提供常量路径定义与 TypeScript 类型收窄支持，不能替代 `pages.json` 中的页面注册配置。
 * 2. 新增、重命名或下线商家端页面时，需同步维护 `pages.json` 中的 `subPackages` 配置段。
 * 3. 业务代码中严禁硬编码字符串路径，统一通过本常量表进行引用。
 *
 * 【使用示例】
 * ```typescript
 * import { ShopRoutes } from '@/pages-shop/routes'
 * import { go, redirect } from '@/utils/router'
 *
 * // 跳转到商品编辑页
 * go(ShopRoutes.Business.goodsEdit, { id: 'SPU_1001' })
 *
 * // 商家登录失效重定向
 * redirect(ShopRoutes.Access.login)
 * ```
 * ============================================================================
 */

export const ShopRoutes = {
  /** 访问控制与入驻认证模块 */
  Access: {
    /** 商家登录授权页（账密登录、验证码登录） */
    login: AUTH_ROUTES.shop,
    /** 商家入驻引导与资质申请提交页 */
    onboarding: '/pages-shop/onboarding/index',
  },

  /** 经营工作台模块 */
  Workspace: {
    /** 商家经营工作台首页（今日营业额、待处理订单概览、快捷功能入口） */
    workspace: '/pages-shop/workspace/index/index',
  },

  /** 商品与营销业务模块 */
  Business: {
    /** 商品管理列表页（菜品/商品上下架、库存状态、分类管理） */
    goods: '/pages-shop/business/goods/index',
    /** 商品创建与编辑页（菜品基础信息、规格属性、图片上传、价格维护） */
    goodsEdit: '/pages-shop/business/goods/edit',
    /** 营销推广管理页（满减活动、优惠券发放、限时折扣配置） */
    marketing: '/pages-shop/business/marketing/index',
    /** 经营数据统计报表页（销售趋势图、客单价分析、爆款菜品榜单） */
    statistics: '/pages-shop/business/statistics/index',
  },

  /** 门店日常运营与履约模块 */
  Operations: {
    /** 门店订单管理中心（堂食/外卖订单接单、出餐进度追踪） */
    orders: '/pages-shop/operations/order/index',
    /** 订单详情页（菜品明细、支付信息、退款操作、顾客备注） */
    orderDetail: '/pages-shop/operations/order/detail',
    /** 堂食桌台/座位管理页（开台点单、清台状态、桌码生成与导出） */
    tables: '/pages-shop/operations/table/index',
    /** 配送调度管理页（呼叫骑手、自配送分配、外送轨迹查看） */
    delivery: '/pages-shop/operations/delivery/index',
  },

  /** 门店设置与系统管理模块 */
  Management: {
    /** 门店基础信息设置页（营业时间、自动接单开关、打印机配置） */
    settings: '/pages-shop/management/shop/index',
    /** 切换与选择管理门店页（多门店/连锁门店切换） */
    selectAdmin: '/pages-shop/management/shop/select',
    /** 员工与权限管理页（店员账号列表、角色分配、操作权限控制） */
    staff: '/pages-shop/management/staff/index',
    /** 商家财务与结算账号中心（收益提现、对账单明细、绑定银行卡） */
    account: '/pages-shop/management/account/index',
  },
} as const
