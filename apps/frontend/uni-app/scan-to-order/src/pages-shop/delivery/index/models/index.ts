/**
 * 商家端骑手管理类型定义
 */

/** 骑手接单状态：online 接单中 / busy 配送中 / offline 已下线（展示映射见 @/constants/status） */
export type RiderStatus = 'online' | 'busy' | 'offline'

/** 骑手（商家视角：看负载与今日产出） */
export interface Rider {
  id: number
  name: string
  phone: string
  status: RiderStatus
  /** 当前配送中单数（负载） */
  load: number
  /** 今日已完成单数 */
  todayOrders: number
  /** 今日配送收入 */
  todayIncome: number
  /** 加入时间 */
  joinedAt: string
}

/** 骑手同时可承载的最大配送单数 */
export const RIDER_MAX_LOAD = 3

/** 配送单状态：waiting 待派送 / assigned 已派单 / delivering 配送中 / done 已送达 */
export type DispatchStatus = 'waiting' | 'assigned' | 'delivering' | 'done'

/** 配送单（商家出餐后进入待派送池） */
export interface DispatchOrder {
  id: string
  type: '外卖' | '自取'
  address: string
  customer: string
  phone: string
  amount: number
  /** 配送费（骑手收益） */
  deliveryFee: number
  expectTime: string
  status: DispatchStatus
  riderId?: number
  riderName?: string
  assignedAt?: string
}
/** 可派单骑手（配送接口返回） */
export interface AvailableRider { id: string, name: string, phone?: string, online: boolean, load: number, maxConcurrent: number }
/** 配送任务（配送接口返回） */
export interface DeliveryTask { id: string, orderId: string, version: number, status: string, statusText: string, riderId: string, riderName?: string, riderPhone?: string, address: string, exception: string }

/** 后端授权当前门店联系的固定配送联系人。 */
export interface DeliveryContact {
  id: string
  name: string
  phone: string
  avatarUrl?: string
  role?: string
}

export interface MerchantDeliverySnapshot {
  riders: AvailableRider[]
  tasks: DeliveryTask[]
  contacts?: DeliveryContact[]
}
