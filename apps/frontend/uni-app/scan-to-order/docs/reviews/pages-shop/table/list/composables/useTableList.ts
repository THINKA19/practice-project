import type { TableItem } from '../type'
import { computed, ref } from 'vue'
import { useTabFilter } from '@/hooks/useTabFilter'
import { clonePlain } from '@/pages-shop/utils/clone'
import { pendingData } from '@/mock/pending'

/** 区域名单（mock：上线由接口拉取门店区域） */
export const AREAS = ['大厅A区', '大厅B区', '二楼包厢', '外摆区']

/**
 * 区域 Tab：key 空串 = 全部区域（区域名不会为空）
 * 文案直接复用区域名单，避免「Tab 文案」与「过滤用的区域名」各写一份
 */
export const AREA_TABS: { key: string, label: string }[] = [
  { key: '', label: '全部区域' },
  ...AREAS.map(area => ({ key: area, label: area })),
]

/**
 * 演示桌台数据 —— 接口未接入，非 mock 构建下按空数组渲染（见 src/mock/pending.ts）
 */
const DEMO_TABLES: TableItem[] = pendingData('GET /shop/table/list', [
  { id: '1', no: 'A1', area: '大厅A区', seats: 2, status: 'free' },
  { id: '2', no: 'A2', area: '大厅A区', seats: 4, status: 'using', orderId: '1', orderNo: 'DD202608270001', people: 3 },
  { id: '3', no: 'A3', area: '大厅A区', seats: 4, status: 'using', orderId: '2', orderNo: 'DD202608270003', people: 2 },
  { id: '4', no: 'A4', area: '大厅A区', seats: 6, status: 'reserved', reserveName: '王先生', reserveTime: '18:30' },
  { id: '5', no: 'A5', area: '大厅A区', seats: 4, status: 'cleaning', cleanTimer: '3分钟' },
  { id: '6', no: 'B1', area: '大厅B区', seats: 4, status: 'free' },
  { id: '7', no: 'B2', area: '大厅B区', seats: 4, status: 'using', orderId: '3', orderNo: 'DD202608270005', people: 4 },
  { id: '8', no: 'B3', area: '大厅B区', seats: 2, status: 'free' },
  { id: '9', no: 'V01', area: '二楼包厢', seats: 10, status: 'free' },
  { id: '10', no: 'V02', area: '二楼包厢', seats: 8, status: 'reserved', reserveName: '公司聚会', reserveTime: '19:00' },
  { id: '11', no: 'W1', area: '外摆区', seats: 4, status: 'free' },
  { id: '12', no: 'W2', area: '外摆区', seats: 4, status: 'free' },
])

/** 桌台列表：区域过滤 + 状态统计（区域过滤见 @/hooks/useTabFilter） */
export function useTableList() {
  // 深拷贝：`[...DEMO_TABLES]` 的元素仍是原对象，开台 / 清洁 / 释放桌台都是就地改写，
  // 会把模块级 DEMO_TABLES 一起改掉（例如 A2 桌被置为空闲后，重进页面也回不到用餐中）
  const tables = ref<TableItem[]>(clonePlain(DEMO_TABLES))

  const { activeIndex: activeArea, list: visibleTables } = useTabFilter<TableItem, string>({
    source: tables,
    tabs: AREA_TABS,
    allKey: '',
    match: (table, area) => table.area === area,
  })

  const stats = computed(() => ({
    all: tables.value.length,
    free: tables.value.filter(t => t.status === 'free').length,
    using: tables.value.filter(t => t.status === 'using').length,
    reserved: tables.value.filter(t => t.status === 'reserved').length,
  }))

  return { tables, activeArea, visibleTables, stats }
}
