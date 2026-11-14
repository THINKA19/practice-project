import type { ShopOrderDetail } from '../type'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { SHOP_ORDER_STATUS, setShopOrderStatus } from '@/constants/status'
import { pendingData } from '@/mock/pending'
import { clonePlain } from '@/pages-shop/utils/clone'
import { formatHms } from '@/utils/date'

/**
 * 订单详情演示种子：状态文案由状态字典派生（与列表同一来源）
 * 接口未接入，非 mock 构建下按空数据渲染（见 src/mock/pending.ts）
 * TODO 上线时替换为真实接口：GET /shop/order/detail?id=
 */
const DEMO_ORDER_DETAIL_SEED: Omit<ShopOrderDetail, 'statusText'> = {
  orderNo: 'DD202608270001',
  status: 1,
  createTime: '2026-08-27 11:32:18',
  payTime: '2026-08-27 11:32:25',
  payMethod: '微信支付',
  type: '堂食',
  tableNo: 'A3桌',
  people: 2,
  customer: { name: '刘女士', phone: '139****6666' },
  goods: [
    { name: '香辣鸡腿堡', qty: 2, price: 18, total: 36, attr: '正常辣' },
    { name: '薯条(大)', qty: 1, price: 12, total: 12, attr: '加番茄酱' },
    { name: '可乐(中)', qty: 2, price: 8, total: 16, attr: '去冰' },
  ],
  remark: '不要辣，可乐分开装，谢谢~',
  subtotal: 64,
  discount: 0,
  packFee: 0,
  total: 64,
  address: '',
  timeline: [
    { t: '11:32:25', s: '用户下单并支付成功', done: true },
    { t: '—', s: '商家接单', done: false },
    { t: '—', s: '商家制作完成', done: false },
    { t: '—', s: '用户用餐完成', done: false },
  ],
}

const DEMO_ORDER_DETAIL: ShopOrderDetail = {
  ...DEMO_ORDER_DETAIL_SEED,
  statusText: SHOP_ORDER_STATUS[DEMO_ORDER_DETAIL_SEED.status].text,
}

/** 订单详情：数据加载 + 接单 / 完成出餐 / 联系顾客 / 打印小票 */
export function useOrderDetail() {
  const id = ref('')
  const detail = reactive<ShopOrderDetail>(pendingData('GET /shop/order/detail', clonePlain(DEMO_ORDER_DETAIL)))

  /** TODO 上线时：const res = await api.getOrderDetail(id.value); Object.assign(detail, res.data) */
  async function loadDetail() {}

  /** 打点时间线某一节点：接口返回的 timeline 长度可能变化，这里做长度兜底 */
  function markTimeline(index: number) {
    const node = detail.timeline[index]
    if (!node)
      return
    node.t = formatHms()
    node.done = true
  }

  function accept() {
    uni.showModal({
      title: '接单确认',
      content: '确认接单？',
      success: (r) => {
        if (!r.confirm)
          return
        // 先改状态再提示：避免出现"提示已接单但状态没变"的错位
        setShopOrderStatus(detail, 2)
        markTimeline(1)
        uni.showToast({ title: '已接单', icon: 'success' })
      },
    })
  }

  function finish() {
    setShopOrderStatus(detail, 4)
    markTimeline(2)
    uni.showToast({ title: '已完成出餐', icon: 'success' })
  }

  function callCustomer() {
    uni.showModal({
      title: '联系顾客',
      content: `即将拨打 ${detail.customer.phone}`,
      confirmText: '拨打',
      success: (r) => {
        if (r.confirm)
          uni.makePhoneCall({ phoneNumber: detail.customer.phone }).catch(() => {})
      },
    })
  }

  function printTicket() {
    uni.showToast({ title: '打印小票（开发中）', icon: 'none' })
  }

  onLoad((options: { id?: string }) => {
    id.value = options.id || '—'
    loadDetail()
  })

  return {
    id,
    detail,
    accept,
    finish,
    callCustomer,
    printTicket,
  }
}
