/**
 * pages-shop 公用的表单校验片段
 */

/**
 * 联系电话校验：手机号 / 带区号座机 / 400·800 服务热线
 * 允许输入空格、短横线（如 400-888-6688），校验前统一去掉。
 */
export function isValidContact(input: string) {
  const digits = input.replace(/[\s-]/g, '')
  return /^1[3-9]\d{9}$/.test(digits) // 手机号
    || /^0\d{2,3}\d{7,8}$/.test(digits) // 带区号座机
    || /^[48]00\d{7}$/.test(digits) // 400 / 800 服务热线
}

/**
 * 表单数值解析
 *
 * 输入框（wd-input）被清空后回传的是**空串**，而 `Number('') === 0` ——
 * 直接转数字会把「没填」静默当成「填了 0」（售价 0 元、库存 0、配送费 0）。
 * 注意 `input ?? Number.NaN` 拦不住空串，因为 `''` 不是 nullish。
 *
 * @returns 合法数字；空值 / 空白串 / 非数字一律返回 NaN，交由 Number.isFinite 判断
 */
export function parseFormNumber(input: unknown): number {
  if (input === null || input === undefined)
    return Number.NaN
  const raw = String(input).trim()
  if (!raw)
    return Number.NaN
  return Number(raw)
}

/** 数值校验：默认要求 >= 0；allowZero = false 时要求 > 0 */
export function isValidNumber(input: unknown, allowZero = true): boolean {
  const n = parseFormNumber(input)
  return Number.isFinite(n) && (allowZero ? n >= 0 : n > 0)
}

/** 整数校验（库存、份数等）：默认要求 >= 0；allowZero = false 时要求 > 0 */
export function isValidInteger(input: unknown, allowZero = true): boolean {
  const n = parseFormNumber(input)
  return Number.isInteger(n) && (allowZero ? n >= 0 : n > 0)
}

/** 24 小时制时间校验，要求 HH:mm（如 09:00、21:30） */
export function isValidTimeHm(input: string): boolean {
  const matched = /^(\d{1,2}):(\d{2})$/.exec(input.trim())
  if (!matched)
    return false
  // 越界取值会得到 NaN，比较结果为 false，同样落到「格式不合法」
  const hour = Number(matched[1])
  const minute = Number(matched[2])
  return hour <= 23 && minute <= 59
}
