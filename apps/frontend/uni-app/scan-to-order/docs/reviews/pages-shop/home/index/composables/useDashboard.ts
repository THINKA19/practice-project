import type { ShopDashboard } from '../type'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { guardMerchantAccess } from '@/utils/auth/guards'

/**
 * 店铺信息面板
 * TODO 上线时替换为真实接口：GET /shop/dashboard
 */
async function fetchShopDashboard(): Promise<ShopDashboard> {
  await new Promise(r => setTimeout(r, 100))
  return {
    shopName: '蜂鸟私厨（高新店）',
    statusText: '营业中 · 09:00 - 22:00',
    open: true,
    today: {
      orders: 56,
      revenue: '2,386.50',
    },
  }
}

/**
 * 待处理订单数（待接单）
 *
 * 首页顶部「待处理」与「订单管理」角标共用这一个数字 ——
 * 角标原本写死为常量 '3'，营业状态一变就会和真实待接单数对不上。
 * TODO 上线时替换为真实接口：GET /shop/order/pending/count
 */
async function fetchPendingOrderCount(): Promise<number> {
  await new Promise(r => setTimeout(r, 100))
  return 3
}

/** 首页店铺信息：营业状态展示 + 未登录/非商家角色的路由守卫 */
export function useDashboard() {
  const shopInfo = ref<ShopDashboard>({
    shopName: '',
    statusText: '',
    open: false,
    today: { orders: 0, revenue: '0.00' },
  })

  /** 待处理订单数：对外供「订单管理」角标复用，避免两处各要一次接口 */
  const pendingCount = ref(0)

  const statusDotClass = computed(() =>
    shopInfo.value.open ? 'bg-green-500' : 'bg-gray-400',
  )

  async function loadDashboard() {
    // 两个数字来自不同接口，并行拉取，避免串行等待
    const [info, pending] = await Promise.all([
      fetchShopDashboard(),
      fetchPendingOrderCount(),
    ])
    shopInfo.value = info
    pendingCount.value = pending
  }

  onShow(() => {
    // 被守卫拦下时不再白跑一次数据请求
    if (!guardMerchantAccess())
      return
    loadDashboard()
  })

  return {
    shopInfo,
    pendingCount,
    statusDotClass,
  }
}
