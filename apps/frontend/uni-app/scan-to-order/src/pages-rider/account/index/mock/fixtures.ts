/**
 * ============================================================================
 * 【文件概述】个人中心的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - createAccount：按任务快照生成演示账户概览，未提供评分时保留空值。
 * 【综合使用示例】
 * import { createAccount } from '@/pages-rider/account/index/mock/fixtures'
 * createAccount(2).completedCount // 2
 * ============================================================================
 */
import type { RiderAccountDto } from '../api/account.dto'
/**
 * 按任务快照生成演示账户概览，未提供评分时保留空值。
 * @param completedCount {number} 非负累计完成数量
 * @returns RiderAccountDto，保留输入单量、默认等级及未知评分。
 * @example createAccount(2).completedCount // 2
 */
export function createAccount(completedCount: number): RiderAccountDto {
  return { level: '配送员', rating: null, completedCount }
}
