/**
 * 骑手端类型定义（骑手 App：工作台 / 接单 / 配送 / 收入）
 */

/** 骑手订单状态：pending 大厅待接 / accepted 已接单待取餐 / delivering 配送中 / done 已送达 */
export type RiderOrderStatus = 'pending' | 'accepted' | 'delivering' | 'done'

/** 骑手配送订单 */
export interface RiderOrder {
  id: string
  status: RiderOrderStatus
  statusText: string
  /** 取餐门店 */
  shopName: string
  /** 门店距骑手距离 */
  distance: string
  /** 收货地址 */
  address: string
  customer: string
  phone: string
  /** 商品摘要 */
  goodsSummary: string
  /** 订单金额（代收/参考） */
  amount: number
  /** 配送费（骑手收益） */
  deliveryFee: number
  /** 期望送达时间 */
  expectTime: string
  /** 下单时间 */
  createdAt: string
  /** 接单时间 */
  acceptAt?: string
  /** 送达时间 */
  settledAt?: string
}

/**
 * 骑手资料
 * 契约来自 api 层（骑手端登录接口的返回体），这里只做别名导出 ——
 * 字段只写一份，后端改字段时不会出现「接口类型改了、页面类型没改」的漂移
 */
export type { IRiderProfile as RiderProfile } from '@/api/types/rider'

/** 骑手今日统计 */
export interface RiderStats {
  /** 今日已完成单 */
  todayDone: number
  /** 今日配送收入 */
  todayIncome: number
  /** 进行中订单数 */
  activeCount: number
  /** 服务评分 */
  rating: number
}

/** 订单列表 Tab */
export interface RiderOrderTab {
  key: 'active' | 'done' | 'all'
  label: string
}

/** 我的页面设置项 */
export interface RiderSettingItem {
  name: string
  icon: string
  color: string
  action: () => void
}
