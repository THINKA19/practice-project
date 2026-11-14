import { toast } from '@/utils/project/interaction'
/** 表单规则集合；嵌套数组用于规格分组。@example const rules: FormRules = [] */
export type FormRules = (true | string | FormRules)[]
/** 必填校验。@param value 值 @param message 失败文案 @returns true 或文案 @example required('', '必填') // 必填 */
export function required(value: unknown, message: string) { return value !== null && value !== undefined && String(value).trim() !== '' ? true : message }
/** 条件校验。@param valid 校验结果 @param message 失败文案 @returns true 或文案 @example when(true, '错误') // true */
export function when(valid: boolean, message: string) { return valid ? true : message }
/** 执行自定义规则。@param check 规则 @param message 失败文案 @returns true 或文案 @example rule(() => true, '错误') // true */
export function rule(check: () => boolean, message: string) { return when(check(), message) }
/** 显示首个错误。@param rules 已评估规则 @returns 是否通过 @example checkForm([]) // true */
export function checkForm(rules: FormRules): boolean { for (const result of rules) { if (Array.isArray(result)) { if (!checkForm(result)) return false } else if (result !== true) { toast(result); return false } } return true }
