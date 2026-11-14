/**
 * ============================================================================
 * 【文件概述】骑手工作台的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - createWorkspace：创建工作台演示公告和参考目标，不承诺收入。
 * 【综合使用示例】
 * import { createWorkspace } from '@/pages-rider/workspace/index/mock/fixtures'
 * createWorkspace().incomeTarget // 120
 * ============================================================================
 */
import type { RiderWorkspaceDto } from '../api/workspace.dto'
/**
 * 创建工作台演示公告和参考目标，不承诺收入。
 * 无参数。
 * @returns RiderWorkspaceDto，公告和 120 元参考目标。
 * @example createWorkspace().incomeTarget // 120
 */
export function createWorkspace(): RiderWorkspaceDto {
  return { announcement: '', incomeTarget: 120 }
}
