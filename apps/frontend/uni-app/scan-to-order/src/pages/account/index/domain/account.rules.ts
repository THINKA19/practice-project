import type { CustomerProfileForm } from '../models/types'

/** 校验性别和生日草稿；空字符串表示通过，否则返回面向用户的错误说明。 */
export function profileError(form: CustomerProfileForm): string {
  if (!['unknown', 'male', 'female'].includes(form.gender))
    return '请选择有效性别'
  if (form.birthday) {
    const date = new Date(`${form.birthday}T00:00:00`)
    const today = new Date()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthday) || Number.isNaN(date.getTime()) || date.getFullYear() < 1900 || date > today
      || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` !== form.birthday) {
      return '请选择有效生日，不能晚于今天'
    }
  }
  return ''
}
