import type { HourDistPoint, PayMixItem, StatisticsOverview, TopGoodsItem, TrendPoint } from '../type'
import { computed, ref } from 'vue'
import { pendingData } from '@/mock/pending'

/** 时间筛选 */
export const PERIODS = ['今日', '本周', '本月', '自定义']

/** 支付方式配色（与 payMix 下标对应） */
export const PAY_COLORS = ['#07C160', '#1677FF', '#9C27B0', '#FFB300']

/**
 * 演示统计数据 —— 接口未接入，非 mock 构建下按空数据渲染（见 src/mock/pending.ts）
 *
 * 此前这 5 组假数据直接写在 composable 里，绕过 VITE_USE_MOCK 开关：
 * 生产构建会照常展示假的营业额（38,620.00）、假热销榜。
 * 真实接口：GET /shop/statistics?period=xxx（按时间段返回）
 */
const DEMO_OVERVIEW: StatisticsOverview = pendingData('GET /shop/statistics', {
  revenue: '38,620.00',
  orderCount: 486,
  customerCount: 1180,
  avgCustomerPrice: '32.73',
  refund: '628.00',
  newMembers: 28,
})

const DEMO_TREND: TrendPoint[] = pendingData('GET /shop/statistics', [
  { day: '8/21', value: 4280 },
  { day: '8/22', value: 5120 },
  { day: '8/23', value: 4860 },
  { day: '8/24', value: 6240 },
  { day: '8/25', value: 7380 },
  { day: '8/26', value: 5880 },
  { day: '8/27', value: 4860 },
])

const DEMO_TOP_GOODS: TopGoodsItem[] = pendingData('GET /shop/statistics', [
  { rank: 1, name: '香辣鸡腿堡', sold: 186, amount: 3348, pct: 86 },
  { rank: 2, name: '可乐(中)', sold: 410, amount: 3280, pct: 82 },
  { rank: 3, name: '薯条(大)', sold: 280, amount: 3360, pct: 78 },
  { rank: 4, name: '鸡翅(4块)', sold: 200, amount: 3200, pct: 64 },
  { rank: 5, name: '招牌牛肉面', sold: 156, amount: 4368, pct: 58 },
])

const DEMO_HOUR_DIST: HourDistPoint[] = pendingData('GET /shop/statistics', [
  { h: '10-12', v: 12 },
  { h: '12-14', v: 68 },
  { h: '14-16', v: 18 },
  { h: '16-18', v: 24 },
  { h: '18-20', v: 74 },
  { h: '20-22', v: 32 },
])

const DEMO_PAY_MIX: PayMixItem[] = pendingData('GET /shop/statistics', [
  { name: '微信支付', value: 82, amount: '31,668' },
  { name: '支付宝', value: 14, amount: '5,407' },
  { name: '会员卡', value: 3, amount: '1,158' },
  { name: '现金', value: 1, amount: '387' },
])

/** 数据统计：时间筛选 + 概览 / 趋势 / 热销 / 时段 / 支付方式 */
export function useStatistics() {
  const activePeriod = ref(2)

  const trend = ref<TrendPoint[]>([...DEMO_TREND])
  const topGoods = ref<TopGoodsItem[]>([...DEMO_TOP_GOODS])
  const hourDist = ref<HourDistPoint[]>([...DEMO_HOUR_DIST])
  const payMix = ref<PayMixItem[]>([...DEMO_PAY_MIX])
  const overview = ref<StatisticsOverview>({ ...DEMO_OVERVIEW })

  /** 趋势柱高（240rpx 满高）；空数据 / 全 0 时不做除法，避免出现 NaN 高度 */
  const maxValue = computed(() => Math.max(0, ...trend.value.map(t => t.value)))
  function barHeight(v: number) {
    return `${maxValue.value > 0 ? Math.round((v / maxValue.value) * 240) : 0}rpx`
  }

  /** 时段分布柱高（180rpx 满高），同样做除零保护 */
  const maxHour = computed(() => Math.max(0, ...hourDist.value.map(h => h.v)))
  function hourHeight(v: number) {
    return `${maxHour.value > 0 ? Math.round((v / maxHour.value) * 180) : 0}rpx`
  }

  /** 支付方式配色：下标越界时兜底，避免 style 里出现 undefined */
  function payColor(i: number) {
    return PAY_COLORS[i] ?? '#BDBDBD'
  }

  /** 刷新：上线后按 activePeriod 调接口重新拉取，当前重置为演示数据 */
  function refresh() {
    overview.value = { ...DEMO_OVERVIEW }
    trend.value = [...DEMO_TREND]
    topGoods.value = [...DEMO_TOP_GOODS]
    hourDist.value = [...DEMO_HOUR_DIST]
    payMix.value = [...DEMO_PAY_MIX]
    uni.showToast({ title: '已刷新', icon: 'success' })
  }

  function exportReport() {
    uni.showToast({ title: '报表导出（开发中）', icon: 'none' })
  }

  return {
    activePeriod,
    overview,
    trend,
    topGoods,
    hourDist,
    payMix,
    barHeight,
    hourHeight,
    payColor,
    refresh,
    exportReport,
  }
}
