/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/account/booking/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/account/booking/mock/handlers'
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.info}`]: () => ok({ id: 'table-reservation' }),
  [`[POST]${endpoints.join}`]: withFailure(({ data }) => {
    if (!data || typeof data !== 'object' || !('yuyueId' in data) || !data.yuyueId || !('extJsonStr' in data) || typeof data.extJsonStr !== 'string')
      return fail('预约参数不完整')
    try {
      const fields: unknown = JSON.parse(data.extJsonStr)
      if (!fields || typeof fields !== 'object' || !('姓名' in fields) || !('联系电话' in fields) || !('到店时间' in fields))
        return fail('预约信息无效')
      return ok({ accepted: true })
    }
    catch { return fail('预约信息格式无效') }
  }, { write: true }),
})
