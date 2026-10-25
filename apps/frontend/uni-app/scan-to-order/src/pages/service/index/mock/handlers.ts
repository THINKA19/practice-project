/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/service/index/mock/handlers.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】默认导出本文件的登记规则或局部能力。
 * 【综合使用示例】
 * import mock from '@/pages/service/index/mock/handlers'
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { createServiceGallery } from './data'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({ [`[GET]${endpoints.gallery}`]: withFailure(() => ok(createServiceGallery())) })
