/**
 * ============================================================================
 * 【文件概述】骑手工作台的领域模型层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - incomeProgress：计算并限制配送费参考进度；无目标时返回零。
 * 【综合使用示例】
 * import { incomeProgress } from '@/pages-rider/workspace/index/models/presentation'
 * incomeProgress(60, 120) // 50
 * ============================================================================
 */
/**
 * 计算并限制配送费参考进度；无目标时返回零。
 * @param income {number} 当前配送费，单位元
 * @param target {number | null} 参考目标，单位元；null 表示未配置
 * @returns number，范围 0～100 的百分比，目标为空或无效时为 0。
 * @example incomeProgress(60, 120) // 50
 */
export function incomeProgress(income: number, target: number | null): number {
  if (!Number.isFinite(income) || target === null || !Number.isFinite(target) || target <= 0)
    return 0
  return Math.min(100, Math.max(0, Math.round(income / target * 100)))
}
