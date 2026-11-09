/**
 * ============================================================================
 * 【文件概述】菜单选品 / domain/catalog.rules.ts
 * 规则层：维护不依赖页面生命周期的纯业务规则。
 * 【方法与导出清单】
 * - emptySelection：创建未选择规格、加料和时段的初始值。
 * - additionKey：组合加料分组与条目标识，作为选择状态的唯一键。
 * - selectProperty：复制选择状态并更新指定规格项。
 * - toggleAddition：切换加料选中状态，遵循单选与多选组限制。
 * - selectTimeSlot：复制选择状态并更新已选日期与时段。
 * - defaultTimeSelection：为有数据的时段列表创建默认选择。
 * - isPropertySelected：判断某个规格选项是否已选中。
 * - isAdditionSelected：判断某个加料条目是否已选中。
 * - isSkuComplete：判断规格与要求的时段是否选择完整。
 * - isAdditionComplete：判断必选加料组是否满足要求。
 * - propertyChildIds：把已选规格组合成后端询价使用的标识串。
 * - buildSkuPayload：把当前规格选择转换为加购协议条目。
 * - buildAdditionPayload：把当前加料选择转换为加购协议条目。
 * - selectedTimeSlot：从时段列表定位当前选择，非法下标返回空值。
 * - skuPicture：选择当前规格图片，没有匹配项时使用后备图片。
 * - quotePrice：汇总基础价、规格价、时段价、加料与可售数量。
 * - miaoshaCountdown：根据当前时间计算秒杀开始与结束的剩余时间。
 * - computeBadges：汇总商品数量，生成商品和分类徽标映射。
 * - categoryShopScope：根据门店隔离配置生成分类查询的门店范围。
 * - MENU_INITIAL_GOODS：本文件对外声明。
 * - goodsListAction：根据库存、活动与起购数量选择商品列表按钮状态。
 * 【综合使用示例】
 * import { emptySelection } from '@/pages/ordering/menu/domain/catalog.rules'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { AdditionGroup, AdditionItem, AdditionPayloadItem, Goods, GoodsDetail, GoodsListAction, MiaoshaCountdown, PriceQuote, SkuPayloadItem, SkuPriceResult, SkuSelection, TimeScheduleDay } from '../models/goods.types'
/**
 * 商品目录上下文 - 领域模型与规则
 * 规格(SKU)选择、加料、时段定价、价格计算全部是纯函数，便于单测
 */
/** 点餐金额以分累加，避免加料价格的浮点误差。 */
function addMoney(...values: number[]) {
  return values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100
}

function msUntil(value: string | undefined, now: number) {
  const time = value ? Date.parse(value.replace(' ', 'T')) : Number.NaN

  return Number.isFinite(time) ? time - now : 0
}

/**
 * 创建未选择规格、加料和时段的初始值。 无参数。
 * @returns SkuSelection。
 * @example
 * import { emptySelection } from '@/pages/ordering/menu/domain/catalog.rules'
 * emptySelection() // => SkuSelection
 */
export function emptySelection(): SkuSelection {
  return { props: {}, additions: [], time: null }
}

/**
 * 组合加料分组与条目标识，作为选择状态的唯一键。
 * @param item {Pick<AdditionItem, 'id' | 'pid'>} 当前业务条目。
 * @returns string，加料分组与条目的组合键。
 * @example
 * import { additionKey } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const item: Parameters<typeof additionKey>[0]
 * additionKey(item) // => string，加料分组与条目的组合键
 */
export function additionKey(item: Pick<AdditionItem, 'id' | 'pid'>) {
  return `${item.pid}-${item.id}`
}

/**
 * 复制选择状态并更新指定规格项。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param propertyId {number} 规格组标识。
 * @param childId {number} 规格选项标识。
 * @returns SkuSelection。
 * @example
 * import { selectProperty } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const sel: Parameters<typeof selectProperty>[0]
 * declare const propertyId: Parameters<typeof selectProperty>[1]
 * declare const childId: Parameters<typeof selectProperty>[2]
 * selectProperty(sel, propertyId, childId) // => SkuSelection
 */
export function selectProperty(sel: SkuSelection, propertyId: number, childId: number): SkuSelection {
  return { ...sel, props: { ...sel.props, [propertyId]: childId } }
}

/**
 * 加料点击：已选则取消；单选组先清除同组其他项
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param group {AdditionGroup} 加料分组及其选择规则。
 * @param item {AdditionItem} 当前业务条目。
 * @returns SkuSelection。
 * @example
 * import { toggleAddition } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const sel: Parameters<typeof toggleAddition>[0]
 * declare const group: Parameters<typeof toggleAddition>[1]
 * declare const item: Parameters<typeof toggleAddition>[2]
 * toggleAddition(sel, group, item) // => SkuSelection
 */
export function toggleAddition(sel: SkuSelection, group: AdditionGroup, item: AdditionItem): SkuSelection {
  const key = additionKey(item)

  if (sel.additions.includes(key)) {
    return { ...sel, additions: sel.additions.filter(k => k !== key) }
  }

  let next = sel.additions

  if (group.type === 0) {
    const groupKeys = group.items.map(additionKey)

    next = next.filter(k => !groupKeys.includes(k))
  }

  return { ...sel, additions: [...next, key] }
}

/**
 * 复制选择状态并更新已选日期与时段。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param schedule {TimeScheduleDay[]} 服务端可售日期与时段列表。
 * @param dayIndex {number} 已选日期在列表中的下标，从零开始。
 * @param slotIndex {number} 已选时段在日期中的下标，从零开始。
 * @returns SkuSelection。
 * @example
 * import { selectTimeSlot } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const sel: Parameters<typeof selectTimeSlot>[0]
 * declare const schedule: Parameters<typeof selectTimeSlot>[1]
 * declare const dayIndex: Parameters<typeof selectTimeSlot>[2]
 * declare const slotIndex: Parameters<typeof selectTimeSlot>[3]
 * selectTimeSlot(sel, schedule, dayIndex, slotIndex) // => SkuSelection
 */
export function selectTimeSlot(sel: SkuSelection, schedule: TimeScheduleDay[], dayIndex: number, slotIndex: number): SkuSelection {
  const slot = schedule[dayIndex]?.items[slotIndex]

  if (!slot || slot.stores <= 0) {
    return sel
  }

  return { ...sel, time: [dayIndex, slotIndex] }
}

/**
 * 时段默认选中第一天第一个时段（与原逻辑一致）
 * @param schedule {TimeScheduleDay[] | null} 服务端可售日期与时段列表。
 * @returns [number, number] | null。
 * @example
 * import { defaultTimeSelection } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const schedule: Parameters<typeof defaultTimeSelection>[0]
 * defaultTimeSelection(schedule) // => [number, number] | null
 */
export function defaultTimeSelection(schedule: TimeScheduleDay[] | null): [number, number] | null {
  return schedule && schedule.length && schedule[0].items.length ? [0, 0] : null
}

/**
 * 判断某个规格选项是否已选中。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param propertyId {number} 规格组标识。
 * @param childId {number} 规格选项标识。
 * @returns boolean，指定规格是否选中。
 * @example
 * import { isPropertySelected } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const sel: Parameters<typeof isPropertySelected>[0]
 * declare const propertyId: Parameters<typeof isPropertySelected>[1]
 * declare const childId: Parameters<typeof isPropertySelected>[2]
 * isPropertySelected(sel, propertyId, childId) // => boolean，指定规格是否选中
 */
export function isPropertySelected(sel: SkuSelection, propertyId: number, childId: number) {
  return sel.props[propertyId] === childId
}

/**
 * 判断某个加料条目是否已选中。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param item {AdditionItem} 当前业务条目。
 * @returns boolean，指定加料是否选中。
 * @example
 * import { isAdditionSelected } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const sel: Parameters<typeof isAdditionSelected>[0]
 * declare const item: Parameters<typeof isAdditionSelected>[1]
 * isAdditionSelected(sel, item) // => boolean，指定加料是否选中
 */
export function isAdditionSelected(sel: SkuSelection, item: AdditionItem) {
  return sel.additions.includes(additionKey(item))
}

/**
 * 规格 + 时段是否已选全
 * @param detail {GoodsDetail} 当前商品或门店详情。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param schedule {TimeScheduleDay[] | null} 服务端可售日期与时段列表。
 * @returns boolean。
 * @example
 * import { isSkuComplete } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const detail: Parameters<typeof isSkuComplete>[0]
 * declare const sel: Parameters<typeof isSkuComplete>[1]
 * declare const schedule: Parameters<typeof isSkuComplete>[2]
 * isSkuComplete(detail, sel, schedule) // => boolean
 */
export function isSkuComplete(detail: GoodsDetail, sel: SkuSelection, schedule: TimeScheduleDay[] | null): boolean {
  const propsOk = (detail.properties || []).every(p => sel.props[p.id] !== undefined)

  const timeOk = !schedule || !!sel.time

  return propsOk && timeOk
}

/**
 * 必选加料是否已选
 * @param groups {AdditionGroup[] | null} 可选加料组；null 表示没有加料。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @returns boolean。
 * @example
 * import { isAdditionComplete } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const groups: Parameters<typeof isAdditionComplete>[0]
 * declare const sel: Parameters<typeof isAdditionComplete>[1]
 * isAdditionComplete(groups, sel) // => boolean
 */
export function isAdditionComplete(groups: AdditionGroup[] | null, sel: SkuSelection): boolean {
  if (!groups) {
    return true
  }

  return groups.filter(g => g.required).every(g => g.items.some(i => sel.additions.includes(additionKey(i))))
}

/**
 * 规格 id 串，如 "1:11,2:21,"（apifm 价格接口格式）
 * @param detail {GoodsDetail} 当前商品或门店详情。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @returns string。
 * @example
 * import { propertyChildIds } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const detail: Parameters<typeof propertyChildIds>[0]
 * declare const sel: Parameters<typeof propertyChildIds>[1]
 * propertyChildIds(detail, sel) // => string
 */
export function propertyChildIds(detail: GoodsDetail, sel: SkuSelection): string {
  return (detail.properties || [])
    .filter(p => sel.props[p.id] !== undefined)
    .map(p => `${p.id}:${sel.props[p.id]},`)
    .join('')
}

/**
 * 把当前规格选择转换为加购协议条目。
 * @param detail {GoodsDetail} 当前商品或门店详情。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param withName {默认 false} 是否附带展示名称。
 * @returns SkuPayloadItem[]。
 * @example
 * import { buildSkuPayload } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const detail: Parameters<typeof buildSkuPayload>[0]
 * declare const sel: Parameters<typeof buildSkuPayload>[1]
 * buildSkuPayload(detail, sel) // => SkuPayloadItem[]
 */
export function buildSkuPayload(detail: GoodsDetail, sel: SkuSelection, withName = false): SkuPayloadItem[] {
  return (detail.properties || [])
    .filter(p => sel.props[p.id] !== undefined)
    .map((p) => {
      const child = p.childsCurGoods.find(c => c.id === sel.props[p.id])

      const item: SkuPayloadItem = { optionId: p.id, optionValueId: sel.props[p.id] }

      if (withName) {
        item.optionName = p.name

        item.optionValueName = child?.name
      }

      return item
    })
}

/**
 * 把当前加料选择转换为加购协议条目。
 * @param groups {AdditionGroup[] | null} 可选加料组；null 表示没有加料。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param withName {默认 false} 是否附带展示名称。
 * @returns AdditionPayloadItem[]。
 * @example
 * import { buildAdditionPayload } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const groups: Parameters<typeof buildAdditionPayload>[0]
 * declare const sel: Parameters<typeof buildAdditionPayload>[1]
 * buildAdditionPayload(groups, sel) // => AdditionPayloadItem[]
 */
export function buildAdditionPayload(groups: AdditionGroup[] | null, sel: SkuSelection, withName = false): AdditionPayloadItem[] {
  const result: AdditionPayloadItem[] = []
  ;
  (groups || []).forEach((g) => {
    g.items.forEach((i) => {
      if (sel.additions.includes(additionKey(i))) {
        result.push(withName ? { id: i.id, pid: i.pid, pname: g.name, name: i.name } : { id: i.id, pid: i.pid })
      }
    })
  })

  return result
}

/**
 * 从时段列表定位当前选择，非法下标返回空值。
 * @param schedule {TimeScheduleDay[] | null} 服务端可售日期与时段列表。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @returns 所选日期与时段对象；选择无效时为 null。
 * @example
 * import { selectedTimeSlot } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const schedule: Parameters<typeof selectedTimeSlot>[0]
 * declare const sel: Parameters<typeof selectedTimeSlot>[1]
 * selectedTimeSlot(schedule, sel) // => 所选日期与时段对象；选择无效时为 null
 */
export function selectedTimeSlot(schedule: TimeScheduleDay[] | null, sel: SkuSelection) {
  if (!schedule || !sel.time) {
    return null
  }

  const day = schedule[sel.time[0]]

  const slot = day?.items[sel.time[1]]

  return day && slot ? { day: day.day, slot } : null
}

/**
 * 规格切换后的展示图：匹配 subPics.optionValueId
 * @param detail {GoodsDetail} 当前商品或门店详情。
 * @param sel {SkuSelection} 当前规格、加料和时段选择。
 * @param fallback {string} 没有匹配内容时的后备值。
 * @returns string。
 * @example
 * import { skuPicture } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const detail: Parameters<typeof skuPicture>[0]
 * declare const sel: Parameters<typeof skuPicture>[1]
 * declare const fallback: Parameters<typeof skuPicture>[2]
 * skuPicture(detail, sel, fallback) // => string
 */
export function skuPicture(detail: GoodsDetail, sel: SkuSelection, fallback: string): string {
  const ids = Object.values(sel.props)

  const sub = (detail.subPics || []).find(p => p.optionValueId !== undefined && ids.includes(p.optionValueId))

  return sub?.pic || fallback
}

/**
 * 计算最终单价（原 calculateGoodsPrice）
 * 优先级：基础价 → SKU 价 → 时段价 → +加料价
 * @param params {{ detail: GoodsDetail sel: SkuSelection skuPrice?: SkuPriceResult | null schedule?: TimeScheduleDay[] | null additions?: AdditionGroup[] | null pingtuan?: boolean }} 商品详情、选择状态及各类报价输入。
 * @returns PriceQuote。
 * @example
 * import { quotePrice } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const params: Parameters<typeof quotePrice>[0]
 * quotePrice(params) // => PriceQuote
 */
export function quotePrice(params: {
  detail: GoodsDetail
  sel: SkuSelection
  skuPrice?: SkuPriceResult | null
  schedule?: TimeScheduleDay[] | null
  additions?: AdditionGroup[] | null
  pingtuan?: boolean
}): PriceQuote {
  const { detail, sel, skuPrice, schedule, additions, pingtuan } = params

  const b = detail.basicInfo

  let price = pingtuan ? Number(b.pingtuanPrice ?? b.minPrice) : b.minPrice

  let originalPrice = b.originalPrice

  let score = b.minScore || 0

  let maxBuy = b.stores

  if (skuPrice) {
    price = pingtuan ? Number(skuPrice.pingtuanPrice ?? skuPrice.price) : skuPrice.price

    originalPrice = skuPrice.originalPrice

    score = skuPrice.score

    maxBuy = skuPrice.stores
  }

  const time = selectedTimeSlot(schedule || null, sel)

  if (time) {
    price = time.slot.price

    maxBuy = time.slot.stores
  }

  ;
  (additions || []).forEach((g) => {
    g.items.forEach((i) => {
      if (sel.additions.includes(additionKey(i))) {
        price = addMoney(price, i.price)
      }
    })
  })

  return { price, originalPrice, score, maxBuy }
}

/* ========================= 列表规则 ========================= */

/**
 * 秒杀倒计时（毫秒）
 * @param g {Goods} 商品快照。
 * @param now {默认 Date.now()} 本次计算使用的时间。
 * @returns 对象，包含 startIn、endIn。
 * @example
 * import { miaoshaCountdown } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const g: Parameters<typeof miaoshaCountdown>[0]
 * miaoshaCountdown(g) // => 对象，包含 startIn、endIn
 */
export function miaoshaCountdown(g: Goods, now = Date.now()) {
  if (!g.miaosha) {
    return null
  }

  return { startIn: msUntil(g.dateStart, now), endIn: msUntil(g.dateEnd, now) }
}

/**
 * 购物车数量 → 分类/商品徽章（原 processBadge），返回 id → 数量
 * @param items {Array<{ goodsId?: number, categoryId?: number, number: number }>} 待转换或汇总的商品条目。
 * @returns 对象，包含 byCategory、byGoods。
 * @example
 * import { computeBadges } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const items: Parameters<typeof computeBadges>[0]
 * computeBadges(items) // => 对象，包含 byCategory、byGoods
 */
export function computeBadges(items: Array<{ goodsId?: number, categoryId?: number, number: number }>) {
  const byCategory: Record<number, number> = {}

  const byGoods: Record<number, number> = {}

  items.forEach((i) => {
    if (i.categoryId) {
      byCategory[i.categoryId] = (byCategory[i.categoryId] || 0) + i.number
    }

    if (i.goodsId) {
      byGoods[i.goodsId] = (byGoods[i.goodsId] || 0) + i.number
    }
  })

  return { byCategory, byGoods }
}

/* ========================= 点餐页菜单规则 ========================= */

/**
 * 分类接口的门店过滤参数（原 index.js categories）
 * - 未开启门店商品隔离（shop_goods_split != '1'）：''
 * - 开启隔离：'0,{shopId}'（0 为总部公共商品）；无门店时 '0'
 * @param shopId {number | string | null | undefined} 门店标识。
 * @param goodsSplit {string | null | undefined} 门店商品隔离开关，1 表示启用。
 * @returns string。
 * @example
 * import { categoryShopScope } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const shopId: Parameters<typeof categoryShopScope>[0]
 * declare const goodsSplit: Parameters<typeof categoryShopScope>[1]
 * categoryShopScope(shopId, goodsSplit) // => string
 */
export function categoryShopScope(shopId: number | string | null | undefined, goodsSplit: string | null | undefined): string {
  if (goodsSplit !== '1') {
    return ''
  }

  return shopId ? `0,${shopId}` : '0'
}

/**
 * 首屏连续加载的商品数量阈值（原逻辑 50）
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { MENU_INITIAL_GOODS } from '@/pages/ordering/menu/domain/catalog.rules'
 * MENU_INITIAL_GOODS // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const MENU_INITIAL_GOODS = 50

/**
 * 根据库存、活动与起购数量选择商品列表按钮状态。
 * @param g {Goods} 商品快照。
 * @param countdown {MiaoshaCountdown | null} 当前秒杀倒计时，null 表示没有有效活动。
 * @returns GoodsListAction。
 * @example
 * import { goodsListAction } from '@/pages/ordering/menu/domain/catalog.rules'
 * declare const g: Parameters<typeof goodsListAction>[0]
 * declare const countdown: Parameters<typeof goodsListAction>[1]
 * goodsListAction(g, countdown) // => GoodsListAction
 */
export function goodsListAction(g: Goods, countdown: MiaoshaCountdown | null): GoodsListAction {
  if (g.stores < g.minBuyNumber) {
    return 'soldOut'
  }

  if (g.miaosha && countdown && countdown.startIn > 0) {
    return 'notStart'
  }

  if (g.miaosha && countdown && countdown.endIn <= 0) {
    return 'ended'
  }

  if (g.kanjia) {
    return 'kanjia'
  }

  if (g.pingtuan) {
    return 'pingtuan'
  }

  if (g.propertyIds || g.hasAddition || g.hasGoodsTimes) {
    return 'sku'
  }

  return 'add'
}
