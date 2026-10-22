/**
 * ============================================================================
 * 业务日期时间处理内核模块 (Kernel Date Service - Multi-Timezone Supported)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件属于整个点餐系统的底层共享内核（Shared Kernel）基础设施，统一接管所有
 * 日期、时间、倒计时与营业时段的计算与格式化逻辑。
 *
 * 核心特性：
 * 1. 门店时区对齐（Store Timezone Alignment）：
 *    在跨国多时区餐饮点餐场景下（如中国 UTC+8、越南 UTC+7、美国等），点餐与外送履约规则
 *    严格以【业务发生的实体门店所在时区】为准，杜绝因用户手机本地时区漂移导致的时差、
 *    营业状态误判或倒计时错乱问题。
 * 2. 纯逻辑与零依赖：
 *    底层基于 dayjs（含 utc、timezone、customParseFormat 插件）封装，不依赖 Vue 组件与 UI 状态，
 *    提供类型安全、无副作用的原子纯函数工具。
 *
 * 【方法列表清单】
 * - setGlobalTimezone(tz)             : 配置应用全局默认业务时区
 * - getGlobalTimezone()               : 获取当前生效的全局业务时区
 * - parseDate(str, tz)                : 按指定门店时区解析时间字符串为安全 Date 实例或 null
 * - msUntil(str, now, tz)             : 计算指定目标时间与基准时间的绝对毫秒差值
 * - formatDate(d, pattern, tz)        : 将时间转为指定门店时区的标准展示字符串
 * - hmToMinutes(hm)                   : 将 "HH:mm" 格式时间转换为当天自零点起的总分钟数
 *
 * 【综合使用示例】
 * ```typescript
 * import { parseDate, msUntil, formatDate, hmToMinutes } from '@/utils/shared/kernel/date'
 *
 * // 场景 A：门店位于越南（Asia/Ho_Chi_Minh，UTC+7）
 * const vnStoreTz = 'Asia/Ho_Chi_Minh'
 * const vnTimeStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm', vnStoreTz)
 * const vnRemainingMs = msUntil('2026-10-20 12:45:00', Date.now(), vnStoreTz)
 *
 * // 场景 B：门店位于中国（Asia/Shanghai，UTC+8）
 * const cnStoreTz = 'Asia/Shanghai'
 * const cnTimeStr = formatDate('2026-10-20T12:00:00Z', 'YYYY-MM-DD HH:mm', cnStoreTz)
 *
 * // 场景 C：商家营业时间区间快速比对（纯数字区间计算，不受跨时区影响）
 * const currentMinutes = hmToMinutes('09:30') // 570
 * const openMinutes = hmToMinutes('09:00')    // 540
 * const closeMinutes = hmToMinutes('22:00')   // 1320
 * const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
 * ```
 * ============================================================================
 */

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'

/**
 * ============================================================================
 * 插件机制说明：utc / timezone / customParseFormat 与 dayjs.extend
 * ============================================================================
 *
 * 【为什么要引入 utc 与 timezone 插件？】
 * 1. 跨国门店时区计算：原生 JavaScript Date 以及默认的 dayjs 只能读取运行环境（客户端手机）
 *    的本地时区。若中国游客在越南点餐（手机为 UTC+8，门店为 UTC+7），直接调用原生日期方法
 *    会导致提前或推后 1 小时判定营业状态。
 * 2. 显式时区转换：引入 utc 与 timezone 插件后，支持通过 dayjs.tz(str, tz) 强制将时间字符串
 *    或绝对时间戳对齐到指定实体门店的 IANA 时区（如 'Asia/Ho_Chi_Minh'、'Asia/Shanghai' 等）。
 *
 * 【为什么要引入 customParseFormat 插件？】
 * dayjs 核心库默认仅严格支持 ISO 8601 标准字符串。引入该插件后，针对服务端返回的
 * "YYYY-MM-DD HH:mm:ss" 等自定义无偏移字符串，可实现零歧义安全解析。
 *
 * 【为什么要调用 dayjs.extend()？】
 * dayjs 采用可插拔轻量设计，必须显式调用 extend 将插件扩展能力挂载至 dayjs 原型链。
 * ============================================================================
 */
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

/**
 * 默认基准时区：当前工程以越南业务为主（东七区 ICT）
 * 当未显式传入门店所属时区时，以此作为兜底基准
 */
export const DEFAULT_STORE_TIMEZONE = 'Asia/Ho_Chi_Minh'

let activeGlobalTimezone = DEFAULT_STORE_TIMEZONE

/**
 * 设置全局默认的业务门店时区
 * 适用于应用初始化时根据当前选中的门店信息统一配置
 *
 * @param tz IANA 标准时区字符串（如 'Asia/Ho_Chi_Minh'、'Asia/Shanghai'、'America/New_York'）
 *
 * @example
 * setGlobalTimezone('Asia/Shanghai')
 */
export function setGlobalTimezone(tz: string): void {
  if (tz) {
    activeGlobalTimezone = tz
  }
}

/**
 * 获取当前全局生效的业务门店时区
 *
 * @returns 当前配置的 IANA 时区标识
 *
 * @example
 * const currentTz = getGlobalTimezone() // => 'Asia/Ho_Chi_Minh'
 */
export function getGlobalTimezone(): string {
  return activeGlobalTimezone
}

/**
 * 解析日期时间字符串，返回对应绝对物理时间的 Date 实例或 null
 * 若入参字符串未携带时区偏移（例如 "2026-10-20 18:30:00"），则严格按照实体门店所在时区解释
 *
 * @param str 待解析的日期字符串（如 "2026-10-20 18:30:00"、"2026-10-20T11:30:00Z"）
 * @param tz 业务实体门店所在时区（可选，默认取当前全局时区）
 * @returns 成功返回标准 Date 对象；解析失败或入参为空时返回 null
 *
 * @example
 * // 越南门店的时间 18:30:00（UTC+7），转出的 Date 实例在物理时间上等同于北京时间的 19:30:00
 * parseDate('2026-10-20 18:30:00', 'Asia/Ho_Chi_Minh') // => Date 实例
 * parseDate(null) // => null
 */
export function parseDate(
  str: string | null | undefined,
  tz: string = activeGlobalTimezone,
): Date | null {
  if (!str) {
    return null
  }
  // 若字符串已带 ISO 8601 时区偏移（如以 Z 结尾或包含 +07:00），直接精准解析
  const value = str.trim()
  const isIsoWithOffset = /[T ]\d{2}:\d{2}.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)
  try {
    const d = isIsoWithOffset ? dayjs(value) : dayjs.tz(value, tz)
    return d.isValid() ? d.toDate() : null
  }
  catch {
    return null
  }
}

/**
 * 计算目标时间距离当前时间（或指定基准时间）的绝对毫秒数差值
 * 用于多国门店场景下的订单支付倒计时、取餐叫号超时判定
 *
 * @param str 目标截止时间字符串（如 "2026-10-20 20:00:00"）
 * @param now 可选基准时间戳（绝对时间戳，毫秒），默认为 Date.now()
 * @param tz 目标时间所属的门店时区（可选，默认取当前全局时区）
 * @returns 剩余毫秒数；若目标时间早于基准时间则返回负数；入参无效返回 0
 *
 * @example
 * // 用户手机无论在中国、美国还是越南，根据越南门店截止时间计算出的剩余倒计时完全一致
 * msUntil('2026-10-20 20:00:00', Date.now(), 'Asia/Ho_Chi_Minh') // => 1800000
 * msUntil(null) // => 0
 */
export function msUntil(
  str: string | null | undefined,
  now = Date.now(),
  tz: string = activeGlobalTimezone,
): number {
  const target = parseDate(str, tz)
  return target && Number.isFinite(now) ? target.getTime() - now : 0
}

/**
 * 将时间对象格式化为指定业务实体门店时区的展示字符串
 * 无论客户端设备处于哪个时区，展示的均是该门店当地的实际钟表时间
 *
 * @param d 待格式化的时间对象（支持 Date 实例、毫秒时间戳或合法时间字符串）
 * @param pattern 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @param tz 目标门店所在时区（可选，默认取当前全局时区）
 * @returns 转换到目标门店时区后的时间文本；入参为空或非法日期时返回空字符串 ''
 *
 * @example
 * const utcTimestamp = 1792470000000 // 某绝对时间
 * // 展示为越南河内门店时间 (UTC+7)
 * formatDate(utcTimestamp, 'YYYY-MM-DD HH:mm', 'Asia/Ho_Chi_Minh') // => '2026-10-20 12:30'
 * // 展示为中国上海门店时间 (UTC+8)
 * formatDate(utcTimestamp, 'YYYY-MM-DD HH:mm', 'Asia/Shanghai')    // => '2026-10-20 13:30'
 */
export function formatDate(
  d: Date | string | number | null | undefined,
  pattern = 'YYYY-MM-DD HH:mm:ss',
  tz: string = activeGlobalTimezone,
): string {
  if (d === null || d === undefined || d === '') {
    return ''
  }
  const inst = dayjs(d)
  if (!inst.isValid()) {
    return ''
  }
  try {
    return inst.tz(tz).format(pattern)
  }
  catch {
    return ''
  }
}

/**
 * 将 "HH:mm" 格式时间转换为当天自 00:00 起的总分钟数
 * 专用于门店营业时间段（如 "08:30" ~ "22:00"）的数字区间比对
 * 注意：比对前当前时间也需先转换为该门店当地时区的 "HH:mm"
 *
 * @param hm 时间字符串（格式要求为 "HH:mm"，如 "08:30"、"22:15"）
 * @returns 转换后的当天分钟数值（范围 0 ~ 1439）；格式异常时返回 NaN
 *
 * @example
 * hmToMinutes('00:00') // => 0
 * hmToMinutes('08:30') // => 510 (8 * 60 + 30)
 * hmToMinutes('23:59') // => 1439
 * hmToMinutes('invalid') // => NaN
 */
export function hmToMinutes(hm: string): number {
  if (!hm) {
    return Number.NaN
  }
  const parts = hm.trim().split(':')
  if (parts.length < 2) {
    return Number.NaN
  }
  const [h, m] = parts.map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return Number.NaN
  }
  return h * 60 + m
}
