/**
 * ============================================================================
 * 【文件概述】接单规则与提醒设置的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - default：Alova MockWrapper；路径引用本模块 endpoints。
 * 【综合使用示例】
 * import entry from '@/pages-rider/account/settings/mock/entry.mock'
 * Object.keys(entry.data) // 测试中检查本模块登记路径
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { endpoints } from '../api/endpoints'
import { read } from './index'

export default defineMock({ [`[GET]${endpoints.rules}`]: ({ headers }) => ok(read(String(headers.Authorization || ''))) })
