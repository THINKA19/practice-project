import { expect, it } from 'vitest'
import { amapNavigationUrl, appleNavigationUrl, baiduNavigationUrl, googleEmbedUrl, googleNavigationUrl, tencentNavigationUrl } from '../models/map-links'

it('google 导航无需 Key，按纬度经度传递海外坐标，不强制驾车方式', () => {
  const shop = { id: 1, name: 'Bangkok', latitude: 13.7563, longitude: 100.5018, countryCode: 'TH', coordinateType: 'wgs84' as const }
  const url = new URL(googleNavigationUrl(shop))
  expect(url.searchParams.get('destination')).toBe('13.7563,100.5018')
  expect(url.searchParams.has('travelmode')).toBe(false)
  const frame = new URL(googleEmbedUrl(shop))
  expect(frame.searchParams.get('q')).toBe('13.7563,100.5018')
  expect(frame.searchParams.get('output')).toBe('embed')
  expect(frame.searchParams.has('key')).toBe(false)
})

it('缺少或非法坐标不渲染地图，地址仍可生成 Google 路线', () => {
  const shop = { id: 2, name: '门店', latitude: 91, longitude: 100, address: 'Road & Mall' }
  expect(new URL(googleEmbedUrl(shop)).searchParams.get('q')).toBe('Road & Mall')
  expect(new URL(googleNavigationUrl(shop)).searchParams.get('destination')).toBe('Road & Mall')
  expect(googleNavigationUrl({ id: 3, name: '无位置门店' })).toBe('')
})

it('中国 GCJ02 转换为 WGS84 后构造 Google 目的地', () => {
  const url = new URL(googleNavigationUrl({ id: 1, name: '北京', latitude: 39.91793075, longitude: 116.40337249, coordinateType: 'gcj02', countryCode: 'CN' }))
  const point = url.searchParams.get('destination')!.split(',').map(Number)
  expect(point[0]).toBeCloseTo(39.916527, 6)
  expect(point[1]).toBeCloseTo(116.397128, 6)
})

it('apple 路线使用有效坐标，缺少坐标时编码完整地址，无位置不生成链接', () => {
  expect(new URL(appleNavigationUrl({ id: 1, name: '门店', latitude: 13.75, longitude: 100.5, countryCode: 'TH' })).searchParams.get('daddr')).toBe('13.75,100.5')
  expect(new URL(appleNavigationUrl({ id: 1, name: '门店', address: 'Road & Mall' })).searchParams.get('daddr')).toBe('Road & Mall')
  expect(appleNavigationUrl(null)).toBe('')
  expect(appleNavigationUrl({ id: 1, name: '门店' })).toBe('')
})

it('海外目的地高德经度在前，百度纬度在前且声明 WGS84，不施加中国偏移', () => {
  const shop = { id: 1, name: 'Bangkok & Mall', latitude: 13.75, longitude: 100.5, coordinateType: 'wgs84' as const, countryCode: 'TH' }
  expect(new URL(amapNavigationUrl(shop)).searchParams.get('to')).toBe('100.5,13.75,Bangkok & Mall')
  const baidu = new URL(baiduNavigationUrl(shop))
  expect(baidu.searchParams.get('destination')).toBe('latlng:13.75,100.5|name:Bangkok & Mall')
  expect(baidu.searchParams.get('coord_type')).toBe('wgs84')
})

it('中国坐标按服务商要求转换，无坐标地址编码完整，空目的地不生成链接', () => {
  const shop = { id: 1, name: '门店', latitude: 39.91793075, longitude: 116.40337249, coordinateType: 'gcj02' as const, countryCode: 'CN' }
  const to = new URL(amapNavigationUrl(shop)).searchParams.get('to')!.split(',').map(Number)
  expect(to[0]).toBeCloseTo(shop.longitude, 5)
  const destination = new URL(baiduNavigationUrl(shop)).searchParams.get('destination')!
  expect(destination).toContain('latlng:39.916')
  const address = { id: 1, name: '门店', address: 'Road & Mall #2' }
  expect(new URL(amapNavigationUrl(address)).searchParams.get('keyword')).toBe(address.address)
  expect(new URL(baiduNavigationUrl(address)).searchParams.get('destination')).toBe(address.address)
  expect(amapNavigationUrl(null)).toBe('')
  expect(baiduNavigationUrl({ id: 1, name: '门店' })).toBe('')
})

it('腾讯使用真实越南 WGS84 坐标，地址保底并正确编码', () => {
  const shop = { id: 1, name: '福记 & 演示', latitude: 10.7767, longitude: 106.7032194, coordinateType: 'wgs84' as const, countryCode: 'VN' }
  const url = new URL(tencentNavigationUrl(shop))
  expect(url.origin).toBe('https://apis.map.qq.com')
  expect(url.searchParams.get('tocoord')).toBe('10.7767,106.7032194')
  expect(url.searchParams.get('coord_type')).toBe('1')
  expect(url.searchParams.get('to')).toBe(shop.name)
  expect(url.searchParams.get('referer')).toBe('scan-to-order')
  const address = 'Nhà hát Thành phố & Lam Sơn'
  const fallback = new URL(tencentNavigationUrl({ id: 1, name: '门店', address }))
  expect(fallback.searchParams.get('to')).toBe(address)
  expect(fallback.searchParams.has('tocoord')).toBe(false)
  expect(tencentNavigationUrl(null)).toBe('')
  expect(tencentNavigationUrl({ id: 1, name: '门店', latitude: 91, longitude: 106 })).toBe('')
  const china = new URL(tencentNavigationUrl({ id: 1, name: '北京', latitude: 39.91793075, longitude: 116.40337249, coordinateType: 'gcj02', countryCode: 'CN' }))
  expect(Number(china.searchParams.get('tocoord')!.split(',')[0])).toBeCloseTo(39.916527, 6)
})
