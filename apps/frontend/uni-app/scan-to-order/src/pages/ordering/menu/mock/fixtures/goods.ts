/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/fixtures/goods.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - categories：本文件对外声明。
 * - goods：本文件对外声明。
 * - createGoodsDetail：本文件对外声明。
 * - additions：本文件对外声明。
 * - schedule：本文件对外声明。
 * - emptyGoods：本文件对外声明。
 * 【综合使用示例】
 * import { categories } from '@/pages/ordering/menu/mock/fixtures/goods'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { AdditionGroupDto, CategoryDto, GoodsDetailDto, GoodsDto, TimeScheduleDayDto } from '../../api/goods.dto'

import rice from '../assets/rice.jpg'
import chicken from '../assets/chicken.jpg'
import noodles from '../assets/noodles.jpg'
import tea from '../assets/tea.jpg'
import coffee from '../assets/coffee.jpg'
import fries from '../assets/fries.jpg'
import salad from '../assets/salad.jpg'
import { shops } from '@/pages/ordering/index/mock'

/**
 * categories：供本领域调用的数据声明。
 * @returns CategoryDto[]；不是独立请求的执行结果。
 * @example
 * import { categories } from '@/pages/ordering/menu/mock/fixtures/goods'
 * categories // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const categories: CategoryDto[] = [{ id: 1, name: '人气主食' }, { id: 2, name: '饮品' }, { id: 3, name: '休闲小食' }, { id: 4, name: '轻食沙拉' }, { id: 1001, name: '招牌米粉' }, { id: 1002, name: '鸡肉米粉' }, { id: 1003, name: '粉店饮品' }]
/**
 * goods：供本领域调用的数据声明。
 * @returns GoodsDto[]；不是独立请求的执行结果。
 * @example
 * import { goods } from '@/pages/ordering/menu/mock/fixtures/goods'
 * goods // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const goods: GoodsDto[] = [
  { id: 101, name: '招牌牛肉饭', pic: rice, minPrice: 28, originalPrice: 32, minBuyNumber: 1, stores: 50, categoryId: 1, shopId: 1, numberSells: 126, logisticsId: 1, tags: [{ label: '新品上市', tone: 'green', emphasis: 'primary' }, { label: '手工制作', tone: 'orange', emphasis: 'normal' }], characteristic: '热饭现做 · 招牌推荐' },
  { id: 102, name: '鲜柠茶', pic: tea, minPrice: 12, originalPrice: 15, minBuyNumber: 1, stores: 80, categoryId: 2, shopId: 1, propertyIds: '1', hasAddition: true, tags: [{ label: '新品上市', tone: 'green', emphasis: 'primary' }], characteristic: '清爽茶饮 · 可选杯型与加料' },
  { id: 103, name: '售罄套餐', pic: chicken, minPrice: 38, originalPrice: 0, minBuyNumber: 1, stores: 0, categoryId: 1, shopId: 1, characteristic: '今日已售罄' },
  { id: 104, name: '香煎鸡腿饭配时令蔬菜与溏心蛋', propertyIds: '2,3,4', pic: chicken, minPrice: 26, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 185, logisticsId: 1, tags: [{ label: '新品上市', tone: 'green', emphasis: 'primary' }, { label: '招牌推荐', tone: 'orange', emphasis: 'primary' }], characteristic: '现点现做 · 图片为品类示意' },
  { id: 105, name: '椰香咖喱鸡肉饭搭配土豆胡萝卜', propertyIds: '2,3,4', pic: rice, minPrice: 25, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 186, logisticsId: 1, tags: [{ label: '手工制作', emphasis: 'normal' }, { label: '季节限定', emphasis: 'normal' }], characteristic: '现点现做 · 图片为品类示意' },
  { id: 106, name: '日式照烧鸡肉饭配海苔芝麻时蔬', pic: chicken, minPrice: 26, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 187, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 107, name: '香菇鸡肉饭', pic: rice, minPrice: 24, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 188, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 108, name: '葱油拌面', pic: noodles, minPrice: 18, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 189, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 109, name: '招牌汤面', pic: noodles, minPrice: 22, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 190, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 110, name: '鸡丝拌面', pic: noodles, minPrice: 23, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 191, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 111, name: '番茄鸡蛋饭', pic: rice, minPrice: 20, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 192, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 112, name: '香煎鸡胸饭', pic: chicken, minPrice: 27, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 193, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 113, name: '时蔬炒饭', pic: rice, minPrice: 19, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 1, shopId: 1, numberSells: 194, logisticsId: 1, characteristic: '现点现做 · 图片为品类示意' },
  { id: 114, name: '茉莉绿茶', pic: tea, minPrice: 10, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 195, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 115, name: '蜜桃乌龙茶', pic: tea, minPrice: 14, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 196, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 116, name: '青柠绿茶', pic: tea, minPrice: 13, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 197, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 117, name: '蜂蜜柚子茶', pic: tea, minPrice: 15, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 198, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 118, name: '冰美式', pic: coffee, minPrice: 16, originalPrice: 19, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 199, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 119, name: '经典拿铁', pic: coffee, minPrice: 20, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 200, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 120, name: '燕麦拿铁', pic: coffee, minPrice: 22, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 201, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 121, name: '焦糖拿铁', pic: coffee, minPrice: 23, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 202, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 122, name: '冷萃咖啡', pic: coffee, minPrice: 18, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 203, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 123, name: '桂花乌龙茶', pic: tea, minPrice: 14, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 204, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 124, name: '柠檬红茶', pic: tea, minPrice: 12, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 2, shopId: 1, numberSells: 205, logisticsId: 1, characteristic: '现调饮品 · 图片为品类示意' },
  { id: 125, name: '经典薯条', pic: fries, minPrice: 12, originalPrice: 15, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 206, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 126, name: '海盐薯条', pic: fries, minPrice: 13, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 207, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 127, name: '香辣薯条', pic: fries, minPrice: 14, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 208, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 128, name: '芝士薯条', pic: fries, minPrice: 16, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 209, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 129, name: '双人薯条', pic: fries, minPrice: 20, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 210, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 130, name: '黑椒薯条', pic: fries, minPrice: 14, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 3, shopId: 1, numberSells: 211, logisticsId: 1, characteristic: '人气小食 · 图片为品类示意' },
  { id: 131, name: '田园蔬菜沙拉', pic: salad, minPrice: 22, originalPrice: 25, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 212, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
  { id: 132, name: '缤纷时蔬沙拉', pic: salad, minPrice: 24, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 213, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
  { id: 133, name: '轻食能量碗', pic: salad, minPrice: 28, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 214, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
  { id: 134, name: '低脂蔬菜碗', pic: salad, minPrice: 23, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 215, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
  { id: 135, name: '清爽午餐沙拉', pic: salad, minPrice: 26, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 216, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
  { id: 136, name: '双人蔬菜沙拉', pic: salad, minPrice: 38, originalPrice: 0, minBuyNumber: 1, stores: 60, categoryId: 4, shopId: 1, numberSells: 217, logisticsId: 1, characteristic: '清爽轻食 · 图片为品类示意' },
]
// 为全部已登记门店补齐四类演示菜单；独立商品 ID 保证详情及购物车按门店隔离。
const templateGoods = [...goods]
for (const shop of shops.filter(item => item.id !== 1 && item.id !== 100)) {
  const samplePrices = shop.countryCode === 'TH' ? [89, 45, 59, 79] : shop.countryCode === 'LA' ? [5.8, 2.5, 3.2, 4.5] : [4.8, 2.8, 3.5, 4.2]
  goods.push(...templateGoods.map((item, index) => {
    const price = Number((samplePrices[(item.categoryId ?? 1) - 1] + index % 3 * (shop.countryCode === 'TH' ? 5 : 0.2)).toFixed(2))
    return { ...item, id: shop.id * 1000 + item.id, shopId: shop.id, minPrice: price, originalPrice: item.originalPrice > item.minPrice ? Number((price + (shop.countryCode === 'TH' ? 10 : 0.5)).toFixed(2)) : 0 }
  }))
}

/** 莲香米粉中心店独立菜单，价格沿用现有门店货币单位，均为演示数据。 */
const noodleMenu = [
  { id: 100901, name: '招牌牛肉米粉', prices: [4.8, 5.8, 6.8], categoryId: 1001 },
  { id: 100902, name: '慢炖牛腩米粉', prices: [5.8, 7, 8.5], categoryId: 1001 },
  { id: 100903, name: '牛肉丸米粉', prices: [4.5, 5.5, 6.5], categoryId: 1001 },
  { id: 100904, name: '鲜香鸡丝米粉', prices: [4.2, 5, 6], categoryId: 1002 },
  { id: 100905, name: '招牌鸡腿米粉', prices: [5.2, 6.5, 7.8], categoryId: 1002 },
]
goods.push(...noodleMenu.map(item => ({
  id: item.id,
  name: item.name,
  pic: noodles,
  minPrice: item.prices[0],
  originalPrice: 0,
  categoryId: item.categoryId,
  shopId: 100,
  stores: 50,
  minBuyNumber: 1,
  propertyIds: '101,102,103',
  hasAddition: true,
  logisticsId: 1,
  characteristic: '现煮米粉 · 份量不同价 · 辣度与粉种同价',
})), { id: 100906, name: '越南冰咖啡', pic: coffee, minPrice: 2.5, originalPrice: 0, categoryId: 1003, shopId: 100, stores: 50, minBuyNumber: 1, logisticsId: 1 })

/**
 * createGoodsDetail：供本领域调用的数据声明。
 * @param id {默认 101} 目标业务记录标识。
 * @returns GoodsDetailDto | null。
 * @example
 * import { createGoodsDetail } from '@/pages/ordering/menu/mock/fixtures/goods'
 * createGoodsDetail() // => GoodsDetailDto | null
 */
export function createGoodsDetail(id = 101): GoodsDetailDto | null {
  const item = goods.find(g => g.id === id)

  const noodle = noodleMenu.find(product => product.id === id)
  if (item && noodle) {
    return { basicInfo: { ...item }, pics: [{ pic: item.pic }], content: '<p>莲香现煮米粉，份量分别定价；粉种、辣度同价，加料另计。图片为米粉品类示意。</p>', properties: [
      { id: 101, name: '份量', childsCurGoods: [
        { id: 1011, name: '小份', price: noodle.prices[0] },
        { id: 1012, name: '中份', price: noodle.prices[1] },
        { id: 1013, name: '大份', price: noodle.prices[2] },
      ] },
      { id: 102, name: '辣度（同价）', childsCurGoods: [{ id: 1021, name: '不辣' }, { id: 1022, name: '微辣' }, { id: 1023, name: '中辣' }] },
      { id: 103, name: '粉种（同价）', childsCurGoods: [{ id: 1031, name: '细米粉' }, { id: 1032, name: '宽米粉' }] },
    ] }
  }
  return item
    ? { basicInfo: { ...item }, pics: [{ pic: item.pic }], content: '<p>现点现做，图片为演示品类示意图，实际出品以门店为准。</p>', properties: item.propertyIds === '1'
        ? [{ id: 1, name: '杯型', childsCurGoods: [{ id: 11, name: '标准杯' }, { id: 12, name: '大杯' }] }]
        : item.propertyIds
          ? [
              { id: 2, name: '份量', childsCurGoods: [{ id: 21, name: '小份' }, { id: 22, name: '大份' }] },
              { id: 3, name: '辣度', childsCurGoods: [{ id: 31, name: '不辣' }, { id: 32, name: '微辣' }, { id: 33, name: '中辣' }] },
              { id: 4, name: '米饭', childsCurGoods: [{ id: 41, name: '正常饭量' }, { id: 42, name: '少饭' }] },
            ]
          : [] }
    : null
}
/**
 * additions：供本领域调用的数据声明。
 * @returns AdditionGroupDto[]；不是独立请求的执行结果。
 * @example
 * import { additions } from '@/pages/ordering/menu/mock/fixtures/goods'
 * additions // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const additions: AdditionGroupDto[] = [{ id: 1, name: '加料', type: 1, required: false, items: [{ id: 1, pid: 1, name: '珍珠', price: 2 }] }]
/**
 * schedule：供本领域调用的数据声明。
 * @returns TimeScheduleDayDto[]；不是独立请求的执行结果。
 * @example
 * import { schedule } from '@/pages/ordering/menu/mock/fixtures/goods'
 * schedule // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const schedule: TimeScheduleDayDto[] = []
/**
 * emptyGoods：供本领域调用的命名能力集合。
 * @returns 声明所示的配置、能力或数据值；不是独立请求的执行结果。
 * @example
 * import { emptyGoods } from '@/pages/ordering/menu/mock/fixtures/goods'
 * emptyGoods.result // => 读取对应命名能力或配置
 */
export const emptyGoods = { result: [], totalRow: 0, totalPage: 0 }

/** 演示接口共用规格校验和单价；以商品详情中的规格组与选项为准。 */
export function quoteMockSku(goodsId: number, propertyChildIds = ''): number | null {
  const detail = createGoodsDetail(goodsId)
  if (!detail)
    return null
  if (typeof propertyChildIds !== 'string')
    return null
  const raw = propertyChildIds.replace(/^,/, '').replace(/,$/, '')
  if (raw && !/^\d+:\d+(?:,\d+:\d+)*$/.test(raw))
    return null
  const selected = raw ? raw.split(',').map(pair => pair.split(':').map(Number)) : []
  const groups = detail.properties ?? []
  if (selected.length !== groups.length || new Set(selected.map(pair => pair[0])).size !== selected.length)
    return null
  if (selected.some(([groupId, choiceId]) => !groups.find(group => group.id === groupId)?.childsCurGoods.some(choice => choice.id === choiceId)))
    return null
  if (detail.basicInfo.shopId === 100) {
    const size = selected.find(([groupId]) => groupId === 101)?.[1]
    const choice = groups.find(group => group.id === 101)?.childsCurGoods.find(choice => choice.id === size)
    return typeof choice?.price === 'number' ? choice.price : detail.basicInfo.minPrice
  }
  const extra = selected.some(([groupId, choiceId]) => (groupId === 1 && choiceId === 12) || (groupId === 2 && choiceId === 22)) ? 3 : 0
  return detail.basicInfo.minPrice + extra
}

/** 菜单与购物车共用商品级加料，防止跨商品加料。 */
export function goodsAdditions(goodsId: number): AdditionGroupDto[] {
  const item = goods.find(item => item.id === goodsId)
  if (!item?.hasAddition)
    return []
  return item.shopId === 100
    ? [{ id: 100, name: '米粉加料', type: 1, required: false, items: [
        { id: 1001, pid: 100, name: '鸡蛋', price: 0.5 },
        { id: 1002, pid: 100, name: '牛肉', price: 1.5 },
      ] }]
    : additions
}
