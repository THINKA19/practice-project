import { expect, it, vi } from 'vitest'
import { formatOrderPrice, orderPresentation } from '../models/presentation'

vi.mock('@/pages/ordering/index', async () => import('@/pages/ordering/index/domain/currency.rules'))

it('订单自己的币种快照使越南金额保持万单位，不读当前选店、不换算金额', () => {
  const order = { extJsonStr: JSON.stringify({ 计价国家: 'VN', 门店名称: '实际门店', 门店照片: '/actual-shop.jpg' }) }
  expect(formatOrderPrice(order, 28, 'zh-Hans')).toBe('₫28万 越南盾')
  expect(formatOrderPrice(order, 28, 'vi')).toBe('₫28 vạn đồng')
  expect(orderPresentation(order).shopImage).toBe('/actual-shop.jpg')
  expect(formatOrderPrice({ ...order, countryCode: 'TH' }, 28, 'zh-Hans')).toBe('฿28 泰铢')
  expect(formatOrderPrice({ countryCode: 'CN' }, 28, 'zh-Hans')).toBe('¥28 人民币')
})

it('接口自身门店资料优先，缺失和损坏快照不伪造币种或照片', () => {
  expect(orderPresentation({ shopImage: '/server.jpg', extJsonStr: JSON.stringify({ 门店照片: '/snapshot.jpg' }) }).shopImage).toBe('/server.jpg')
  expect(orderPresentation({ extJsonStr: 'invalid json' })).toEqual({ countryCode: '', shopImage: '', shopNameZt: '' })
  expect(formatOrderPrice({}, 28, 'zh-Hans')).not.toContain('¥')
})
