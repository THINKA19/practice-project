/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/account/booking/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/account/booking/mock/handlers'
 * ============================================================================
 */
import dayjs from 'dayjs'
import { defineMock } from '@alova/mock'
import { isBookingSlot } from '../domain/booking.rules'
import { endpoints } from '../api/endpoints'
import { shops } from '@/pages/ordering/index/mock'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

function availableSlots() {
  const now = dayjs()
  return Array.from({ length: 8 }, (_, offset) => {
    const date = now.add(offset, 'day').format('YYYY-MM-DD')
    return Array.from({ length: 7 }, (_, index) => `${date} ${10 + index * 2}:00`)
  }).flat().filter(time => isBookingSlot(time, now.valueOf()))
}

export default defineMock({
  [`[GET]${endpoints.info}`]: ({ query }) => {
    const shopId = Number(query.shopId)
    return Number.isSafeInteger(shopId) && shopId > 0 && shopId % 2 === 1
      ? ok({ id: `table-reservation-${shopId}`, shopName: shops.find(shop => shop.id === shopId)?.name || '', slots: availableSlots() })
      : fail('该门店未开放订座')
  },
  [`[POST]${endpoints.join}`]: withFailure(({ data }) => {
    if (!data || typeof data !== 'object' || !('yuyueId' in data) || !data.yuyueId || !('extJsonStr' in data) || typeof data.extJsonStr !== 'string')
      return fail('预约参数不完整')
    if (!('shopId' in data) || typeof data.shopId !== 'number' || !Number.isSafeInteger(data.shopId) || data.shopId <= 0 || data.shopId % 2 !== 1 || data.yuyueId !== `table-reservation-${data.shopId}`)
      return fail('预约活动与门店不匹配')
    try {
      const fields: unknown = JSON.parse(data.extJsonStr)
      if (!fields || typeof fields !== 'object' || !('姓名' in fields) || !('联系电话' in fields) || !('到店时间' in fields))
        return fail('预约信息无效')
      if (typeof fields.到店时间 !== 'string' || !availableSlots().includes(fields.到店时间))
        return fail('该时段不可预约')
      return ok({ accepted: true })
    }
    catch { return fail('预约信息格式无效') }
  }, { write: true }),
})
