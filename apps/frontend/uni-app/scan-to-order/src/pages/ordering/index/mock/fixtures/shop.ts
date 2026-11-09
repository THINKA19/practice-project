/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / mock/fixtures/shop.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - shops：本文件对外声明。
 * - emptyShops：本文件对外声明。
 * 【综合使用示例】
 * import { shops } from '@/pages/ordering/index/mock/fixtures/shop'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { ShopDto } from '../../api/shop.dto'

import centerMap from '../assets/center-map.png'
import parkMap from '../assets/park-map.png'
import centerCover from '@/mock/assets/images/home/banner/02.jpeg'
import parkCover from '@/mock/assets/images/home/banner/03.jpeg'
import { shopRegions } from './regions'
import { newUntil, openingDate, promotion } from './promotions'

const restaurantNames = ['青禾越式厨房', '西贡小馆', '莲香米粉', '河内家宴', '阿莲私房菜', '稻香食堂', '海风餐厅', '山茶小厨', '渔家鲜味', '暹罗食记', '香叶泰厨', '金柚餐馆', '清迈人家', '兰纳小院', '巷口饭堂', '海岛厨房', '椰林餐厅', '渔港食府', '湄公河小馆', '万象家厨', '香茅餐室', '古城饭店', '河畔食光', '南康小厨']
// 各门店独立配置活动名称，页面直接展示接口 title。
const activityTitles = [
  '越式米粉双人套餐优惠',
  '莲香牛肉粉双人套餐优惠',
  '河内烤肉双人套餐优惠',
  '家常小炒双人套餐优惠',
  '稻香煲仔饭双人套餐优惠',
  '海风海鲜双人套餐优惠',
  '山茶特色双人套餐优惠',
  '渔家鲜味双人套餐优惠',
  '西贡风味双人套餐优惠',
  '泰式酸辣汤双人套餐优惠',
  '香叶打抛饭双人套餐优惠',
  '金柚咖喱双人套餐优惠',
  '清迈烤鸡双人套餐优惠',
  '兰纳风味双人套餐优惠',
  '巷口盖饭双人套餐优惠',
  '海岛烤鱼双人套餐优惠',
  '椰香鸡饭双人套餐优惠',
  '渔港海鲜双人套餐优惠',
  '湄公河烤鱼双人套餐优惠',
  '万象糯米饭双人套餐优惠',
  '香茅烤鸡双人套餐优惠',
  '古城家常双人套餐优惠',
  '河畔风味双人套餐优惠',
  '南康特色双人套餐优惠',
]
const originalShops: ShopDto[] = [
  { id: 1, name: '福记饭店', countryCode: 'VN', cityCode: 'VN-SGN', districtCode: 'VN-SGN-1', address: 'Nhà hát Thành phố, 7 Công trường Lam Sơn, Phường Sài Gòn', coordinateType: 'wgs84', latitude: 10.7767, longitude: 106.7032194, distance: 0.8, linkPhone: '13800000000', pic: centerCover, mapPreview: centerMap, characteristic: '现点现做 · 堂食与外带', introduce: '温暖舒适的用餐空间，提供现做餐品和清爽饮品。图片与地址为演示数据。', openingHours: '00:00-23:59', status: 0, openWaimai: true, openZiqu: true, serviceDistance: 5, serviceAmountMin: 20 },
  { id: 2, name: '悦来小馆', address: '公园路 2 号', coordinateType: 'wgs84', latitude: 22.55, longitude: 114.06, distance: 2.1, pic: parkCover, mapPreview: parkMap, characteristic: '公园旁的休闲餐厅', introduce: '提供休闲轻食、茶饮和咖啡。图片与地址为演示数据。', linkPhone: '13800000000', openingHours: '09:00-22:00', status: 0, openWaimai: false, openZiqu: true },
]
// 全部为示例门店：2 家原有门店 + 8 个城市各 3 家，共 26 条。
/**
 * shops：供本领域调用的数据声明。
 * @returns ShopDto[]；不是独立请求的执行结果。
 * @example
 * import { shops } from '@/pages/ordering/index/mock/fixtures/shop'
 * shops // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const shops: ShopDto[] = [
  ...originalShops.map(shop => ({
    ...shop,
    ...(shop.id === 1 ? { openingState: 'new' as const, newUntil, promotions: [{ ...promotion('1-set', 'set'), title: '福记招牌双人套餐优惠' }] } : {}),
    pic: '/static/images/ordering/storefront.jpg',
    photos: shop.pic ? [shop.pic] : [],
    services: shop.openWaimai ? ['堂食', '到店自取', '外卖配送'] : ['堂食', '到店自取'],
    arrivalGuide: shop.id === 1 ? '地图演示点为胡志明市歌剧院，不是福记饭店的真实营业位置。' : '示例到店指引：门店位于示范路临街一层，请以实际门牌和门头为准。',
    parkingInfo: '示例停车说明：周边停车位置及收费请到店前电话确认。',
    notice: shop.id === 1 ? '本店为演示门店，地图使用胡志明市歌剧院真实坐标，仅用于地图功能演示。' : '本页照片、地址、服务和到店说明均为演示内容，不代表真实门店。',
    introduce: `${shop.introduce}\n\n门店介绍示例：以现点现做的家常餐食为主，适合日常用餐与朋友小聚。可在这里了解餐食特色、用餐环境和服务方式。\n\n到店前可先查看营业时间与门店位置；如需确认座位、多人用餐安排或餐食供应，请联系门店。以上文字仅用于展示详情页排版，实际介绍由商家维护。`,
  })),
  ...shopRegions.flatMap((country, countryIndex) => country.cities.slice(0, country.code === 'LA' ? 2 : 3).flatMap((city, cityIndex) =>
    ['中心店', '河畔店', '广场店'].map((suffix, index) => ({
      id: 100 + countryIndex * 100 + cityIndex * 10 + index,
      openingState: index === 0 ? 'new' as const : index === 2 ? 'upcoming' as const : undefined,
      businessState: index === 2 ? 'upcoming' as const : index === 1 && cityIndex === 1 ? 'suspended' as const : undefined,
      openingDate: index === 2 ? openingDate : undefined,
      newUntil: index === 0 ? newUntil : undefined,
      promotions: [{ ...promotion(`${100 + countryIndex * 100 + cityIndex * 10 + index}-activity`, index === 1 ? 'set' : index === 2 ? 'upcoming' : cityIndex === 0 ? 'expired' : cityIndex === 1 ? 'draft' : 'withdrawn'), title: activityTitles[(countryIndex === 0 ? 0 : countryIndex === 1 ? 9 : 18) + cityIndex * 3 + index] }],
      name: countryIndex === 0 && cityIndex === 0 && index < 2 ? `莲香米粉（${suffix}）` : restaurantNames[(countryIndex === 0 ? 0 : countryIndex === 1 ? 9 : 18) + cityIndex * 3 + index],
      countryCode: country.code,
      cityCode: city.code,
      districtCode: city.districts[index].code,
      distance: Number((0.6 + countryIndex * 2 + cityIndex * 0.8 + index * 0.3).toFixed(1)),
      address: `${country.name}·${city.name}·${city.districts[index].name} 示范路 ${index + 1} 号（示例地址）`,
      pic: '/static/images/ordering/storefront.jpg',
      mapPreview: index % 2 ? parkMap : centerMap,
      openingHours: index === 0 ? '08:00-22:00' : '09:00-21:30',
      linkPhone: country.code === 'VN' ? '+84 000 000 000' : country.code === 'TH' ? '+66 00 000 0000' : '+856 00 000 000',
      introduce: '跨地区示例门店，图片、地址与电话仅用于功能展示。',
      services: ['堂食', '到店自取', '外卖配送'],
      arrivalGuide: '示例说明：请按实际门牌寻找入口，到店前可联系门店确认。',
      notice: '本页内容为演示数据。该示例未配置坐标，可复制地址搜索；地图图片仅作位置示意。',
      status: 0,
      openWaimai: true,
      openZiqu: true,
      serviceDistance: 5,
    })))),
]
/**
 * emptyShops：供本领域调用的数据声明。
 * @returns ShopDto[]；不是独立请求的执行结果。
 * @example
 * import { emptyShops } from '@/pages/ordering/index/mock/fixtures/shop'
 * emptyShops // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const emptyShops: ShopDto[] = []
