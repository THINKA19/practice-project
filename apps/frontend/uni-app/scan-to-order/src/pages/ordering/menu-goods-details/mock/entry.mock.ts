/**
 * ============================================================================
 * 【文件概述】商品详情 / mock/entry.mock.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - 默认模拟接口或内部声明。
 * 【综合使用示例】
 * // 本文件通过现有 Mock 自动发现或领域内部导入接入，不增加页面路由。
 * ============================================================================
 */
import { defineMock } from '@alova/mock'
import { endpoints } from '../api/endpoints'
import { fail, ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'

export default defineMock({
  [`[GET]${endpoints.videoDetail}`]: withFailure(() => ok({})),
  [`[POST]${endpoints.shareCode}`]: withFailure(() => fail('演示环境未配置微信商品分享码服务'), { write: true }),
  [`[GET]${endpoints.kanjiaSet}`]: withFailure(() => ok([])),
  [`[GET]${endpoints.kanjiaDetail}`]: withFailure(() => fail('砍价活动不存在', 404)),
  [`[GET]${endpoints.kanjiaMyHelp}`]: withFailure(() => ok(null)),
  [`[POST]${endpoints.kanjiaJoin}`]: withFailure(() => fail('演示环境未开放真实砍价'), { write: true }),
  [`[POST]${endpoints.kanjiaHelp}`]: withFailure(() => fail('演示环境未开放真实助力'), { write: true }),
})
