/**
 * ============================================================================
 * 【文件概述】配送任务的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - RiderOrderStatus：任务状态枚举；assigned 为待确认指派，pending 为未归属大厅任务。
 * - RiderOrder：配送任务快照；version 为正整数乐观锁，riderId 为空表示未归属，金额非负，时间为可解析的 ISO 字符串。
 * - RiderTaskSnapshot：当前骑手的完整任务投影；maxConcurrent 为正整数，任务 id 不得重复。
 * - RiderAction：配送动作命令；异常上报不改变配送状态，其他动作按状态机推进。
 * - ActResult：任务动作结果；ok=false 且无 error 表示取消、重复点击或会话失效，不向新账号提示。
 * - RiderStats：当前任务投影的今日统计；todayIncome 为 UTC+7 业务日配送费（元），不是已结算收入。
 * 【综合使用示例】
 * import type { RiderOrderStatus } from '@/pages-rider/delivery/task/models/types'
 * const status: RiderOrderStatus = 'assigned'
 * ============================================================================
 */
/**
 * 任务状态枚举；assigned 为待确认指派，pending 为未归属大厅任务。
 * @example const status: RiderOrderStatus = 'assigned'
 */
export type RiderOrderStatus = 'pending' | 'assigned' | 'accepted' | 'delivering' | 'done' | 'cancelled'

/**
 * 配送任务快照；version 为正整数乐观锁，riderId 为空表示未归属，金额非负，时间为可解析的 ISO 字符串。
 * @example const deliveryLabel = (order: RiderOrder) => order.shopName
 */
export interface RiderPoint {
  latitude: number
  longitude: number
}

export interface RiderServiceArea {
  countryCode: string
  cityId: string
  zoneId: string
  label: string
  currency: string
  timeZone: string
}

export interface RiderOrder {
  serviceArea?: RiderServiceArea
  pickupPoint?: RiderPoint
  deliveryPoint?: RiderPoint
  shopPhone?: string
  pickupCode?: string
  itemCount?: number
  assignmentExpiresAt?: string
  deliveryDistanceKm?: number
  deliverBy?: string
  pickedUpAt?: string
  deliveredAt?: string
  cancelledAt?: string
  id: string
  orderId: string
  shopId: string
  riderId: string
  version: number
  shopAddress: string
  pickupNote?: string
  exception: string
  status: RiderOrderStatus
  statusText: string
  /** 取餐门店 */
  shopName: string
  /** 门店距骑手距离 */
  distance: string
  /** 收货地址 */
  address: string
  deliveryArea?: string
  deliveryNote?: string
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
 * 当前骑手的完整任务投影；maxConcurrent 为正整数，任务 id 不得重复。
 * @example const online = (snapshot: RiderTaskSnapshot) => snapshot.online
 */
export interface RiderTaskSnapshot { serviceArea?: RiderServiceArea | null, tasks: RiderOrder[], online: boolean, maxConcurrent: number, riderId: string }
/**
 * 配送动作命令；异常上报不改变配送状态，其他动作按状态机推进。
 * @example const action: RiderAction = 'pickup'
 */
export type RiderAction = 'grab' | 'accept' | 'reject' | 'pickup' | 'finish' | 'release' | 'exception'
/**
 * 任务动作结果；ok=false 且无 error 表示取消、重复点击或会话失效，不向新账号提示。
 * @example const result: ActResult = { ok: false }
 */
export type ActResult = { ok: true } | { ok: false, error?: unknown }
/**
 * 当前任务投影的今日统计；todayIncome 为 UTC+7 业务日配送费（元），不是已结算收入。
 * @example const fee = (stats: RiderStats) => stats.todayIncome
 */
export interface RiderStats { todayDone: number, todayIncome: number, incomeByCurrency?: { currency: string, amount: number }[], activeCount: number }
