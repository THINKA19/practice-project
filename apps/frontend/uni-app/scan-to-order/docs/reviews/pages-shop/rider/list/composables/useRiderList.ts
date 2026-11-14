import type { Rider, RiderStatus } from '../type'
import { computed, ref } from 'vue'
import { SHOP_RIDER_TABS } from '@/constants/status'
import { useTabFilter } from '@/hooks/useTabFilter'
import { pendingData } from '@/mock/pending'
import { clonePlain } from '@/pages-shop/utils/clone'
import { RIDER_MAX_LOAD } from '../type'

/**
 * 演示骑手数据 —— 接口未接入，非 mock 构建下按空数组渲染（见 src/mock/pending.ts）
 * TODO 上线时替换为真实接口：GET /shop/rider/list（按状态分页 + 实时负载推送）
 */
const DEMO_RIDERS: Rider[] = [
  { id: 1, name: '张骑手', phone: '13800001111', status: 'online', load: 0, todayOrders: 18, todayIncome: 216, joinedAt: '2026-03-12' },
  { id: 2, name: '李骑手', phone: '13800002222', status: 'busy', load: 2, todayOrders: 12, todayIncome: 144, joinedAt: '2026-05-08' },
  { id: 3, name: '王骑手', phone: '13800003333', status: 'offline', load: 0, todayOrders: 0, todayIncome: 0, joinedAt: '2026-06-21' },
  { id: 4, name: '赵骑手', phone: '13800004444', status: 'online', load: 1, todayOrders: 9, todayIncome: 108, joinedAt: '2026-07-30' },
]

/** 骑手列表：筛选 + 统计 + 增删改（状态筛选见 @/hooks/useTabFilter） */
export function useRiderList() {
  // 深拷贝：上下线 / 派单会就地改写 load、todayOrders、todayIncome，
  // 浅拷贝会让模块级 DEMO_RIDERS 被改脏，统计数字重进页面后还会持续累加
  const riders = ref<Rider[]>(pendingData('GET /shop/rider/list', clonePlain(DEMO_RIDERS)))

  const { activeKey: activeTab, list, countByKey: badge } = useTabFilter<Rider, 'all' | RiderStatus>({
    source: riders,
    tabs: SHOP_RIDER_TABS,
    allKey: 'all',
    match: (rider, status) => rider.status === status,
  })

  /** 概览统计 */
  const stats = computed(() => ({
    online: riders.value.filter(r => r.status !== 'offline').length,
    busy: riders.value.filter(r => r.status === 'busy').length,
    todayOrders: riders.value.reduce((s, r) => s + r.todayOrders, 0),
    todayIncome: riders.value.reduce((s, r) => s + r.todayIncome, 0),
  }))

  function findRider(id: number) {
    return riders.value.find(r => r.id === id)
  }

  /**
   * 上下线切换：接单中 ⇄ 已下线
   * 「配送中」由派单驱动（见 useRiderDispatch），不在这里手动切换；
   * 有在途单时禁止下线，避免出现"已下线却还在配送"的矛盾状态。
   */
  function toggleStatus(rider: Rider) {
    if (rider.status !== 'offline' && rider.load > 0) {
      uni.showToast({ title: `还有 ${rider.load} 单配送中，暂不能下线`, icon: 'none' })
      return
    }
    rider.status = rider.status === 'offline' ? 'online' : 'offline'
  }

  function callRider(rider: Rider) {
    uni.makePhoneCall({ phoneNumber: rider.phone })
  }

  /** 新增骑手（mock：弹输入确认后本地追加） */
  function addRider() {
    uni.showModal({
      title: '新增骑手',
      editable: true,
      placeholderText: '请输入骑手姓名',
      success: (res) => {
        if (!res.confirm || !res.content?.trim())
          return
        riders.value.push({
          id: Date.now(),
          name: res.content.trim(),
          phone: '13800000000',
          status: 'offline',
          load: 0,
          todayOrders: 0,
          todayIncome: 0,
          joinedAt: '2026-09-14',
        })
        uni.showToast({ title: '已添加（mock）', icon: 'none' })
      },
    })
  }

  function removeRider(rider: Rider) {
    if (rider.load > 0) {
      uni.showToast({ title: '配送中，暂不能移除', icon: 'none' })
      return
    }
    uni.showModal({
      title: '提示',
      content: `确认移除骑手「${rider.name}」吗？`,
      success: (res) => {
        if (!res.confirm)
          return
        riders.value = riders.value.filter(r => r.id !== rider.id)
        uni.showToast({ title: '已移除', icon: 'success' })
      },
    })
  }

  /** 骑手是否可承接新单（返回不可派单原因，可派单返回 null） */
  function rejectReason(rider: Rider): string | null {
    if (rider.status === 'offline')
      return '骑手已下线'
    if (rider.load >= RIDER_MAX_LOAD)
      return `已达同时配送上限（${RIDER_MAX_LOAD} 单）`
    return null
  }

  return {
    riders,
    activeTab,
    list,
    badge,
    stats,
    findRider,
    toggleStatus,
    callRider,
    addRider,
    removeRider,
    rejectReason,
  }
}
