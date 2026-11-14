import type { ShopOrder } from '../type'
import { ref } from 'vue'
import { SHOP_ORDER_STATUS, SHOP_ORDER_TABS } from '@/constants/status'
import { useTabFilter } from '@/hooks/useTabFilter'
import { pendingData } from '@/mock/pending'
import { clonePlain } from '@/pages-shop/utils/clone'

/**
 * 订单列表演示种子：只写状态码，文案由状态字典派生
 * （原先每条手写 statusText，改状态时漏改文案就会出现「状态是制作中、文案写着待接单」）
 * 接口未接入，非 mock 构建下按空数组渲染（见 src/mock/pending.ts）
 */
const DEMO_ORDER_SEEDS: Omit<ShopOrder, 'statusText'>[] = [
  {
    id: 'DD202608270001',
    tableNo: 'A3桌',
    type: '堂食',
    status: 1,
    time: '11:32',
    goods: [
      { name: '香辣鸡腿堡', qty: 2, price: 18 },
      { name: '薯条(大)', qty: 1, price: 12 },
      { name: '可乐(中)', qty: 2, price: 8 },
    ],
    amount: 64,
    remark: '不要辣，谢谢',
  },
  {
    id: 'DD202608270002',
    tableNo: '外卖',
    type: '外卖',
    status: 2,
    time: '11:40',
    goods: [{ name: '招牌牛肉面', qty: 1, price: 28 }],
    amount: 28,
    remark: '顾客：张先生 138****8888',
  },
  {
    id: 'DD202608270003',
    tableNo: 'B1桌',
    type: '堂食',
    status: 4,
    time: '10:58',
    goods: [
      { name: '儿童套餐A', qty: 1, price: 32 },
      { name: '橙汁', qty: 1, price: 10 },
    ],
    amount: 42,
    remark: '',
  },
]

/**
 * 订单列表演示数据
 * TODO 上线时替换为真实接口：GET /shop/order/list（分页 + 状态过滤 + 推送更新）
 */
const DEMO_ORDERS: ShopOrder[] = DEMO_ORDER_SEEDS.map(seed => ({
  ...seed,
  statusText: SHOP_ORDER_STATUS[seed.status].text,
}))

/** 订单列表：Tab 过滤 + 角标统计（过滤逻辑见 @/hooks/useTabFilter） */
export function useOrderList() {
  // 深拷贝：`[...DEMO_ORDERS]` 只复制了数组壳，元素仍是同一个对象，
  // 接单 / 拒单会就地改写模块级 DEMO_ORDERS，退出再进入状态无法复位
  const orders = ref<ShopOrder[]>(pendingData('GET /shop/order/list', clonePlain(DEMO_ORDERS)))

  const { activeIndex: activeTab, list, countByIndex: badge } = useTabFilter<ShopOrder, number>({
    source: orders,
    tabs: SHOP_ORDER_TABS,
    // 0 是「全部」哨兵值（订单状态里没有 0），命中判断只处理真实状态
    allKey: 0,
    match: (order, status) => order.status === status,
  })

  function findOrder(id: string) {
    return orders.value.find(x => x.id === id)
  }

  return { orders, activeTab, list, badge, findOrder }
}
