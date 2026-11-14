/** 后台首页菜单项 */
export interface AdminMenuItem {
  /** 图标（unocss iconify class） */
  icon: string
  /** 菜单名 */
  label: string
  /** 跳转路径 */
  path: string
  /** 图标底色（渐变 class） */
  gradient: string
  /** 角标文案（如待接单数），无则不展示 */
  badge?: string
}

/** 店铺信息面板 */
export interface ShopDashboard {
  /** 店铺名 */
  shopName: string
  /** 营业状态文案，如「营业中 · 09:00 - 22:00」 */
  statusText: string
  /** 是否营业中（决定状态圆点颜色） */
  open: boolean
  /** 今日汇总 */
  today: {
    /** 今日订单数 */
    orders: number
    /** 今日流水（已格式化字符串） */
    revenue: string
  }
}
