/**
 * ============================================================================
 * 【文件概述】骑手资料的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - default：Alova MockWrapper；路径引用本模块 endpoints。
 * - reset：清空本模块模拟状态。
 * 【综合使用示例】
 * import entry from '@/pages-rider/account/profile/mock/entry.mock'
 * Object.keys(entry.data) // 测试中检查本模块登记路径
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { endpoints } from '../api/endpoints'
import { read, save } from './state'
import type { RiderProfileSaveDto } from '../api/profile.dto'

export { reset } from './state'
export default defineMock({
  [`[GET]${endpoints.profile}`]: ({ headers }) => ok(read(String(headers.Authorization || ''))),
  [`[POST]${endpoints.save}`]: ({ headers, data }) => {
    const body = data as RiderProfileSaveDto
    if (!body || !Number.isInteger(body.version) || typeof body.name !== 'string' || typeof body.phone !== 'string')
      throw new Error('资料参数不合法')
    return ok(save(String(headers.Authorization || ''), body.version, body.name, body.phone))
  },
})
