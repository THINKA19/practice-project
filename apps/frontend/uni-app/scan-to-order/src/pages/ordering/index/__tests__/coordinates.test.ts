import { expect, it } from 'vitest'
import { convertShopPoint } from '../models/coordinates'

it('北京参考点转换为 GCJ02，逆转换恢复 WGS84', () => {
  const point = { latitude: 39.916527, longitude: 116.397128 }
  const gcj = convertShopPoint(point, 'wgs84', 'gcj02')
  expect(gcj.latitude).toBeCloseTo(39.91793075, 6)
  expect(gcj.longitude).toBeCloseTo(116.40337249, 6)
  const restored = convertShopPoint(gcj, 'gcj02', 'wgs84')
  expect(restored.latitude).toBeCloseTo(point.latitude, 6)
  expect(restored.longitude).toBeCloseTo(point.longitude, 6)
})

it('境外门店与同坐标系保持原位置，不修改源坐标', () => {
  const point = { latitude: 13.7563, longitude: 100.5018 }
  expect(convertShopPoint(point, 'wgs84', 'wgs84')).toEqual(point)
  expect(convertShopPoint(point, 'wgs84', 'gcj02', 'TH')).toEqual(point)
  const outside = { latitude: 51.5074, longitude: -0.1278 }
  expect(convertShopPoint(outside, 'wgs84', 'gcj02')).toEqual(outside)
  expect(point).toEqual({ latitude: 13.7563, longitude: 100.5018 })
})
