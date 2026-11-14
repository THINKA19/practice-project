/** 模拟运营配置与共享配送池样本。 */
import type { RiderOrder, RiderPoint, RiderServiceArea } from '../models/types'
import { RIDER_ORDER_STATUS } from '../models/enums'
import { riderDateKey } from '../domain/task.rules'
import { demoDispatchPolicy } from './policy'

interface DemoStation {
  area: RiderServiceArea
  center: RiderPoint
  shopId: string
  radiusKm: number
}

const stations: DemoStation[] = [
  { area: { countryCode: 'VN', cityId: 'hanoi', zoneId: 'cau-giay', label: '越南 / 河内 / 纸桥站', currency: 'VND', timeZone: 'Asia/Ho_Chi_Minh' }, center: { latitude: 21.032, longitude: 105.798 }, shopId: 'vn-hn-cg-01', radiusKm: 5 },
  { area: { countryCode: 'TH', cityId: 'bangkok', zoneId: 'phaya-thai', label: '泰国 / 曼谷 / 披耶泰站', currency: 'THB', timeZone: 'Asia/Bangkok' }, center: { latitude: 13.78, longitude: 100.54 }, shopId: 'th-bkk-pt-01', radiusKm: 5 },
  { area: { countryCode: 'VN', cityId: 'ho-chi-minh', zoneId: 'district-1', label: '越南 / 胡志明市 / 第一区站', currency: 'VND', timeZone: 'Asia/Ho_Chi_Minh' }, center: { latitude: 10.776, longitude: 106.701 }, shopId: 'vn-hcm-d1-01', radiusKm: 5 },
  { area: { countryCode: 'LA', cityId: 'vientiane', zoneId: 'chanthabouly', label: '老挝 / 万象 / 占塔布里站', currency: 'LAK', timeZone: 'Asia/Vientiane' }, center: { latitude: 17.97, longitude: 102.61 }, shopId: 'la-vte-cb-01', radiusKm: 5 },
  { area: { countryCode: 'ID', cityId: 'jakarta', zoneId: 'central', label: '印尼 / 雅加达 / 中央站', currency: 'IDR', timeZone: 'Asia/Jakarta' }, center: { latitude: -6.18, longitude: 106.83 }, shopId: 'id-jkt-ce-01', radiusKm: 5 },
]

/** 模拟后台给账号分配门店或站点配送池。 */
export function demoGrant(riderId: string) {
  const index = ['30001', '30002', '30004', '30005', '30006'].indexOf(riderId)
  if (riderId === '30003')
    return { ...stations[0], shopIds: [stations[0].shopId] }
  return index < 0 ? null : { ...stations[index], shopIds: undefined }
}

const destinations = [
  { area: '河畔片区', address: '河畔路 18 号，河畔公寓 2 栋 801 室', note: '从东门进入，2 栋大厅左侧乘电梯。' },
  { area: '中央商务区', address: '商务路 66 号，中央商务楼 B 座一楼前台', note: '从 B 座入口进入，交给前台。' },
  { area: '市集商圈', address: '市集街 9 号，市集东门自提区', note: '东门入口右侧的自提柜台。' },
  { area: '花园片区', address: '花园路 28 号，花园小区 5 栋 1203 室', note: '请走南门，进门后沿右侧步道前往 5 栋。' },
  { area: '社区中心片区', address: '社区路 12 号，社区中心北门', note: '在北门接待处交接。' },
  { area: '科技园片区', address: '创新大道 88 号，科技园 3 号楼大厅', note: '请从园区西门进入。' },
]
const meals = ['鸡肉饭 × 1、柠檬茶 × 1', '牛肉粉 × 2', '蔬菜卷 × 1、豆浆 × 1']

function createOrder(station: DemoStation, index: number, now: number): RiderOrder {
  const { area, center, shopId } = station
  const fee = ({ VND: 24000, THB: 35, LAK: 18000, IDR: 16000 }[area.currency] ?? 0) * (1 + (index % 3) * 0.2)
  const stop = index % destinations.length
  return {
    id: `DL-${shopId}-${index}`,
    orderId: `ORDER-${shopId}-${index}`,
    serviceArea: area,
    pickupPoint: { ...center, latitude: center.latitude + 0.006 },
    deliveryPoint: { ...center, longitude: center.longitude + (stop + 1) * 0.004 },
    shopId,
    riderId: '',
    version: 1,
    status: 'pending',
    statusText: RIDER_ORDER_STATUS.pending.text,
    shopName: '禾味厨房',
    shopAddress: `${area.label} · 中央商业街 26 号，商业中心 A 座一层`,
    pickupNote: '从东门进入，直走到禾味厨房右侧的取餐柜。',
    exception: '',
    distance: '',
    address: destinations[stop].address,
    deliveryArea: destinations[stop].area,
    deliveryNote: destinations[stop].note,
    customer: '演示顾客',
    phone: '',
    goodsSummary: meals[index % meals.length],
    itemCount: 2,
    pickupCode: `#0${stop + 1}`,
    amount: Math.round(fee * 4),
    deliveryFee: Math.round(fee),
    expectTime: '',
    deliverBy: new Date(now + (25 + stop * 5) * 60_000).toISOString(),
    createdAt: new Date(now).toISOString(),
  }
}

/** 共享大厅任务和本人指派在上线后开放。 */
export function createTasks(station: DemoStation, riderId: string): RiderOrder[] {
  const now = Date.now()
  return [
    ...destinations.map((_, index) => createOrder(station, index, now)),
    {
      ...createOrder(station, destinations.length, now),
      id: `DL-assigned-${riderId}`,
      orderId: `ORDER-${station.shopId}-assigned-${riderId}`,
      status: 'assigned',
      statusText: RIDER_ORDER_STATUS.assigned.text,
      riderId,
      assignmentExpiresAt: new Date(now + demoDispatchPolicy.assignmentTimeoutSeconds * 1000).toISOString(),
    },
  ]
}

/** 演示站点均为 UTC+7。按站点业务日生成今日、近七日和上月记录。 */
export function createHistory(station: DemoStation, riderId: string): RiderOrder[] {
  const now = Date.now()
  const today = riderDateKey(now, station.area.timeZone)
  const start = Date.parse(`${today}T00:00:00+07:00`)
  const day = 86_400_000
  const dayOfMonth = Number(today.slice(-2))
  const offsets = [
    ...Array.from({ length: 5 }, () => 0),
    ...[1, 2, 3, 4, 5, 6].flatMap(days => [days, days]),
    ...[10, 18].map(days => Math.max(1, Math.min(days, dayOfMonth - 1))),
    ...[0, 3, 8, 14, 21].map(days => dayOfMonth + days),
  ]
  return offsets.map((daysAgo, index) => {
    const date = start - daysAgo * day
    const end = Math.min(now, date + (9 + index % 8) * 3_600_000)
    const cancelled = index % 4 === 3
    const status = cancelled ? 'cancelled' : 'done'
    const endedAt = new Date(end).toISOString()
    const order = createOrder(station, index, end - 35 * 60_000)
    return {
      ...order,
      id: `DL-history-${riderId}-${index}`,
      orderId: `ORDER-${station.shopId}-history-${riderId}-${index + 1}`,
      riderId,
      status,
      statusText: RIDER_ORDER_STATUS[status].text,
      deliverBy: undefined,
      acceptAt: new Date(end - 30 * 60_000).toISOString(),
      pickedUpAt: cancelled ? undefined : new Date(end - 20 * 60_000).toISOString(),
      cancelledAt: cancelled ? endedAt : undefined,
      deliveredAt: cancelled ? undefined : endedAt,
      settledAt: cancelled ? undefined : endedAt,
      deliveryFee: cancelled ? 0 : order.deliveryFee,
      exception: cancelled ? '顾客取消订单' : '',
    }
  })
}
