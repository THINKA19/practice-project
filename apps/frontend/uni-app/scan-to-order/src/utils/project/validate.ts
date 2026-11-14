/** 解析非空数值。@param value 表单值 @returns 数字或 NaN @example parseFormNumber('') // NaN */
export function parseFormNumber(value: unknown) { return value === null || value === undefined || String(value).trim() === '' ? Number.NaN : Number(value) }
/** 校验非负金额。@param value 表单值 @returns 是否有效 @example isValidNumber(-1) // false */
export function isValidNumber(value: unknown) { const number = parseFormNumber(value); return Number.isFinite(number) && number >= 0 }
/** 校验库存。@param value 表单值 @returns 是否非负整数 @example isValidInteger(2) // true */
export function isValidInteger(value: unknown) { return isValidNumber(value) && Number.isSafeInteger(parseFormNumber(value)) }
/** 校验联系方式。@param value 联系号码 @returns 是否符合电话字符与长度要求 @example isValidContact('123') // false */
export function isValidContact(value: string) { return /^\+?[0-9 ()-]{6,20}$/.test(value) }
/** 校验时分。@param value HH:mm @returns 是否有效 @example isValidTimeHm('23:59') // true */
export function isValidTimeHm(value: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) }
