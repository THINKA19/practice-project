// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
/**
 * ============================================================================
 * 多币种高精度金额计算内核模块 (Kernel Money & Currency Service)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于点餐系统架构金字塔最底层的共享内核（Shared Kernel），严禁向上依赖任何
 * 上层模块（包括 infrastructure、services、composables 及 pages）。
 *
 * 核心特性：
 * 1. 多币种动态精度支持（Multi-Currency Decimal Specs）：
 *    消除传统电商仅支持 2 位小数“分”的局限，无缝支持零小数位货币（如越南盾 VND、
 *    老挝基普 LAK）、标准 2 位小数货币（如人民币 CNY、美元 USD、泰铢 THB）以及其他法币。
 * 2. 避免浮点数精度误差：
 *    所有核心加、减、乘运算均先将金额转化为其币种的“最小不可分割单位”（Minor Unit / 整数整数）
 *    后再做计算，彻底杜绝 JavaScript 原生计算产生的 0.1 + 0.2 = 0.30000000000000004 精度资损。
 * 3. 规范千分位格式化：
 *    提供符合国际标准与当地习惯的千分位展示与货币符号拼接能力。
 *
 * 【方法与导出清单】
 * - setGlobalCurrency(currency)       : 配置应用全局默认业务币种
 * - getGlobalCurrency()               : 获取当前生效的全局业务币种
 * - getCurrencyDecimals(currency)     : 获取指定币种定义的小数保留位数
 * - toMinorUnit(val, currency)        : 将浮点金额转换为当前币种的最小不可分割整数单位
 * - fromMinorUnit(minor, currency)    : 将最小整数单位还原为标准浮点金额数值
 * - toCent(yuan)                      : 【兼容别名】以 2 位小数标准将元转为分
 * - fromCent(cent)                    : 【兼容别名】以 2 位小数标准将分转为元
 * - addMoney(...values)               : 高精度累加多笔金额
 * - subMoney(a, b, currency)          : 高精度减法运算 (a - b)
 * - mulMoney(price, count, currency)  : 高精度乘法运算 (单价 × 数量)
 * - formatMoney(v, options)           : 将金额格式化为带千分位、标准小数位数的安全展示字符串
 *
 * 【综合使用示例】
 * ```typescript
 * import {
 *   addMoney,
 *   subMoney,
 *   mulMoney,
 *   formatMoney,
 *   toMinorUnit,
 *   setGlobalCurrency,
 * } from './money'
 *
 * // 场景 A：越南门店（VND 越南盾，0 位小数）
 * const vnPrice = 25000 // 25,000 盾
 * const vnTotal = mulMoney(vnPrice, 3, 'VND') // => 75000
 * const vnDisplay = formatMoney(vnTotal, { currency: 'VND', symbol: '₫' }) // => '75,000 ₫'
 *
 * // 场景 B：中国门店（CNY 人民币，2 位小数）
 * const totalCny = addMoney(19.9, 0.1) // => 20
 * const cnyDisplay = formatMoney(totalCny, { currency: 'CNY', symbol: '¥' }) // => '¥20.00'
 *
 * // 场景 C：提交到支付网关（获取最小货币单位）
 * const payAmountVn = toMinorUnit(75000, 'VND') // => 75000 (越南盾最小单位为 1 盾)
 * const payAmountCn = toMinorUnit(20.00, 'CNY') // => 2000  (人民币最小单位为 1 分)
 * ```
 * ============================================================================
 */

/**
 * 币种元数据配置表
 * decimals: 币种定义的小数位数（0 代表无辅币/最小单位即自身，2 代表辅币精确至百分之一）
 */
export const CURRENCY_SPECS = {
  /** 越南盾 (Indochina - 0 位小数) */
  VND: { decimals: 0, code: 'VND', symbol: '₫' },
  /** 人民币 (China - 2 位小数) */
  CNY: { decimals: 2, code: 'CNY', symbol: '¥' },
  /** 美元 (United States - 2 位小数) */
  USD: { decimals: 2, code: 'USD', symbol: '$' },
  /** 泰铢 (Thailand - 2 位小数) */
  THB: { decimals: 2, code: 'THB', symbol: '฿' },
  /** 老挝基普 (Laos - 0 位小数) */
  LAK: { decimals: 0, code: 'LAK', symbol: '₭' },
} as const

export type SupportedCurrency = keyof typeof CURRENCY_SPECS | string

/** 全局默认业务币种（默认为越南盾 VND） */
let activeGlobalCurrency: SupportedCurrency = 'VND'

/**
 * 设置全局生效的默认业务币种
 *
 * @param currency 标准 ISO 币种代码（如 'VND', 'CNY', 'USD'）
 *
 * @example
 * setGlobalCurrency('CNY')
 */
export function setGlobalCurrency(currency: SupportedCurrency): void {
  if (currency) {
    activeGlobalCurrency = currency
  }
}

/**
 * 获取当前全局生效的业务币种代码
 *
 * @returns 当前生效的币种代码字符串
 *
 * @example
 * const curr = getGlobalCurrency() // => 'VND'
 */
export function getGlobalCurrency(): SupportedCurrency {
  return activeGlobalCurrency
}

/**
 * 查询指定币种的小数保留位数
 *
 * @param currency 目标币种代码，未传则取全局默认币种
 * @returns 小数位数（通常为 0 或 2）
 *
 * @example
 * getCurrencyDecimals('VND') // => 0
 * getCurrencyDecimals('CNY') // => 2
 */
export function getCurrencyDecimals(currency: SupportedCurrency = activeGlobalCurrency): number {
  const spec = CURRENCY_SPECS[currency as keyof typeof CURRENCY_SPECS]
  return spec ? spec.decimals : 2
}

/**
 * 获取币种最小单位缩放倍率
 * 例如：0 位小数倍率为 1；2 位小数倍率为 100；3 位小数倍率为 1000
 */
function getScaleFactor(currency: SupportedCurrency): number {
  return 10 ** getCurrencyDecimals(currency)
}

/** 十进制指数移动后舍入；中点远离零，结果必须是安全整数。 */
function roundDecimal(value: number, digits = 0): number {
  const [coefficient, exponent = '0'] = Math.abs(value).toString().split('e')
  const rounded = Math.round(Number(`${coefficient}e${Number(exponent) + digits}`))
  if (!Number.isSafeInteger(rounded))
    throw new RangeError('金额超出安全整数范围')
  return rounded === 0 ? 0 : Math.sign(value) * rounded
}

/** 将有限数拆成整数系数和十进制指数，用于称重乘法，避免直接浮点相乘。 */
function decimalParts(value: number): { coefficient: number, exponent: number } {
  const [mantissa, exponent = '0'] = value.toString().split('e')
  const decimals = mantissa.split('.')[1]?.length ?? 0
  return { coefficient: Number(mantissa.replace('.', '')), exponent: Number(exponent) - decimals }
}

/**
 * 将浮点金额转换为当前币种的最小不可分割整数单位 (Minor Unit)
 * 该运算能规避原生乘法浮点误差，专用于高精度加减乘与底层支付接口传参
 *
 * @param amount 待转换的原始金额（元/盾），支持数值或纯数字字符串
 * @param currency 目标币种代码（可选，默认取全局配置）
 * @returns 最小单位整数；无效值返回 0，中点远离零舍入，超出安全整数范围抛出 RangeError。
 *
 * @example
 * toMinorUnit(19.9, 'CNY')   // => 1990 (分)
 * toMinorUnit(25000, 'VND')  // => 25000 (盾)
 * toMinorUnit(null)          // => 0
 */
export function toMinorUnit(
  amount: number | string | null | undefined,
  currency: SupportedCurrency = activeGlobalCurrency,
): number {
  const n = Number(amount)
  if (!Number.isFinite(n)) {
    return 0
  }
  return roundDecimal(n, getCurrencyDecimals(currency))
}

/**
 * 将币种的最小整数单位 (Minor Unit) 还原为标准显示数值
 *
 * @param minor 最小单位整数（如分、单盾）
 * @param currency 目标币种代码（可选，默认取全局配置）
 * @returns 标准浮点数值
 *
 * @example
 * fromMinorUnit(1990, 'CNY')  // => 19.9
 * fromMinorUnit(25000, 'VND') // => 25000
 */
export function fromMinorUnit(
  minor: number,
  currency: SupportedCurrency = activeGlobalCurrency,
): number {
  if (!Number.isFinite(minor)) {
    return 0
  }
  const factor = getScaleFactor(currency)
  return roundDecimal(minor) / factor
}

/**
 * 【向后兼容别名】以 2 位小数标准将元转换为分
 *
 * @param yuan 金额（元）
 * @returns 对应的整数分
 */
export function toCent(yuan: number | string | null | undefined): number {
  return toMinorUnit(yuan, 'CNY')
}

/**
 * 【向后兼容别名】以 2 位小数标准将分还原为元
 *
 * @param cent 金额（分）
 * @returns 对应的浮点元
 */
export function fromCent(cent: number): number {
  return fromMinorUnit(cent, 'CNY')
}

/**
 * 多笔金额高精度累加
 * 将所有金额转为当前币种的最小不可分割单位求和后再转回，彻底消除 0.1 + 0.2 误差
 *
 * @param values 待累加的金额列表（支持数值、字符串、null 或 undefined）
 * @returns 累加后的标准金额数值
 *
 * @example
 * addMoney(0.1, 0.2)             // => 0.3
 * addMoney(10.5, '5.2', null, 2) // => 17.7
 */
export function addMoney(...values: Array<number | string | null | undefined>): number {
  const currency = activeGlobalCurrency
  const totalMinor = values.reduce<number>((sum, v) => sum + toMinorUnit(v, currency), 0)
  return fromMinorUnit(totalMinor, currency)
}

/**
 * 两个金额的高精度减法 (a - b)
 *
 * @param a 被减数
 * @param b 减数
 * @param currency 目标币种（可选，默认取全局配置）
 * @returns 相减后的差值结果
 *
 * @example
 * subMoney(1.5, 1.2, 'CNY') // => 0.3
 * subMoney(10000, 3000, 'VND') // => 7000
 */
export function subMoney(
  a: number | string | null | undefined,
  b: number | string | null | undefined,
  currency: SupportedCurrency = activeGlobalCurrency,
): number {
  const minorA = toMinorUnit(a, currency)
  const minorB = toMinorUnit(b, currency)
  return fromMinorUnit(minorA - minorB, currency)
}

/**
 * 金额高精度乘法 (单价 × 数量)
 * 专用于计算商品小计；单价先按币种舍入，乘以数量后再次舍入，中点远离零。
 *
 * @param price 商品单价（支持数值或合法字符串）
 * @param count 购买数量 / 重量倍数
 * @param currency 目标币种（可选，默认取全局配置）
 * @returns 乘积结果金额
 *
 * @example
 * mulMoney(19.9, 3, 'CNY')    // => 59.7
 * mulMoney(25000, 2, 'VND')   // => 50000
 */
export function mulMoney(
  price: number | string | null | undefined,
  count: number,
  currency: SupportedCurrency = activeGlobalCurrency,
): number {
  if (!Number.isFinite(count) || count === 0) {
    return 0
  }
  const priceMinor = toMinorUnit(price, currency)
  const quantity = decimalParts(count)
  const product = priceMinor * quantity.coefficient
  if (!Number.isSafeInteger(product))
    throw new RangeError('金额乘法超出安全整数范围')
  return fromMinorUnit(roundDecimal(product, quantity.exponent), currency)
}

/** 格式化金额展示配置选项 */
export interface FormatMoneyOptions {
  /** 目标币种代码（未指定时根据全局设定） */
  currency?: SupportedCurrency
  /** 显式指定小数保留位数（未指定时自动根据币种标准，如 VND 为 0，CNY 为 2） */
  digits?: number
  /** 是否添加千分位逗号分隔符，默认 true */
  useGrouping?: boolean
  /** 附加的货币符号前缀/后缀（如 '¥', '$', '₫'），不传则不添加 */
  symbol?: string
  /** 货币符号摆放位置，默认为前缀 'prefix'（越南盾习惯可设为 'suffix'） */
  symbolPosition?: 'prefix' | 'suffix'
}

/**
 * 标准化格式化金额展示
 * 支持自动匹配多国货币小数位、千分位自动分割及货币符号精准挂载
 *
 * @param v 原始金额（元/盾）
 * @param optionsOrDigits 格式化参数对象，或直接传入数字表示保留小数位数
 * @returns 规范化的金额显示文本
 *
 * @example
 * formatMoney(25000, { currency: 'VND' }) // => '25,000'
 * formatMoney(25000, { currency: 'VND', symbol: '₫', symbolPosition: 'suffix' }) // => '25,000 ₫'
 * formatMoney(1234.56, { currency: 'CNY', symbol: '¥' }) // => '¥1,234.56'
 * formatMoney(1234.56, 2) // => '1,234.56' (兼容纯数字参数)
 */
export function formatMoney(
  v: number | string | null | undefined,
  optionsOrDigits?: number | FormatMoneyOptions,
): string {
  const n = Number(v)
  const isInvalid = !Number.isFinite(n)
  const validNum = isInvalid ? 0 : n

  // 统一参数形态
  let opts: FormatMoneyOptions = {}
  if (typeof optionsOrDigits === 'number') {
    opts = { digits: optionsOrDigits }
  }
  else if (typeof optionsOrDigits === 'object' && optionsOrDigits !== null) {
    opts = optionsOrDigits
  }

  const currency = opts.currency || activeGlobalCurrency
  const digits = typeof opts.digits === 'number' ? opts.digits : getCurrencyDecimals(currency)
  const useGrouping = opts.useGrouping !== false

  // 转换为定点小数并切分整数与小数部分
  const fixedStr = validNum.toFixed(digits)
  const [intPart, decPart] = fixedStr.split('.')

  // 格式化千分位
  const groupedInt = useGrouping ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : intPart
  const coreDisplay = digits > 0 && decPart !== undefined ? `${groupedInt}.${decPart}` : groupedInt

  if (!opts.symbol) {
    return coreDisplay
  }

  return opts.symbolPosition === 'suffix'
    ? `${coreDisplay} ${opts.symbol}`
    : `${opts.symbol}${coreDisplay}`
}
