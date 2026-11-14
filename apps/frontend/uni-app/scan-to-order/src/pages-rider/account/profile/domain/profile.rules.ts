/**
 * ============================================================================
 * 【文件概述】骑手资料的无框架依赖的纯业务规则层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - profileDraftError：校验姓名和手机号，返回首个错误文本。
 * 【综合使用示例】
 * import { profileDraftError } from '@/pages-rider/account/profile/domain/profile.rules'
 * profileDraftError({ name: '骑手', phone: '13900000000' }) // ''
 * ============================================================================
 */
import { t } from '@/locale'
import type { RiderProfileDraft } from '../models/types'
/**
 * 校验姓名和手机号，返回首个错误文本。
 * @param draft {RiderProfileDraft} 待校验的姓名与手机号
 * @returns string，校验通过返回空字符串，否则返回用户可读的提示。
 * @example profileDraftError({ name: '骑手', phone: '13900000000' }) // ''
 */
export function profileDraftError(draft: RiderProfileDraft): string {
  return draft.name.trim() && draft.name.trim().length <= 30 && /^1\d{10}$/.test(draft.phone.trim()) ? '' : t('rider.profile.invalid')
}
