/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/entry.mock.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { notices } from './fixtures/notices'
import { ok } from '@/mock/response'
/** 仅由现有开发 Mock 加载器发现。 */
import goods from './handlers'

const content = defineMock({ [`[GET]${endpoints.notice}`]: () => ok(structuredClone(notices)) })

export default defineMock({ ...goods.data, ...content.data })
