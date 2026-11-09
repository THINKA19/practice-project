/**
 * ============================================================================
 * 【文件概述】结算与支付 / composables/use-dining-time.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - usePayDiningTime：本文件对外声明。
 * - DiningTimeVm：数据类型契约。
 * 【综合使用示例】
 * import { usePayDiningTime } from '@/pages/ordering/menu-pay/composables/use-dining-time'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/**
 * 结算页 - 预约取餐/送达时间 ViewModel（后台参数 create_order_select_time=1 时启用）
 * 来源：bee-master/pages/pay/index.js currentDate/minHour/minMinute/formatter/filter、
 *      diningTimeChange / diningTimeShow / diningTimeHide / diningTimeConfirm
 */
import { orderingSettings } from '@/pages/ordering/index'

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

/** 当前时间向上取整到 10 分钟 */
function nowCeil10(now = new Date()) {
  let h = now.getHours()

  let m = Math.ceil(now.getMinutes() / 10) * 10

  if (m >= 60) {
    m = 0

    h = Math.min(23, h + 1)
  }

  return { h, m }
}

/**
 * 创建 use-dining-time 对应的领域状态与交互能力。 无参数。
 * @returns 对象，包含 enabled、show、diningTime、pickerValue、minHour、maxHour、minMinute、formatter、filter、onChange、open、close、confirm。
 * @example
 * import { usePayDiningTime } from '@/pages/ordering/menu-pay/composables/use-dining-time'
 * usePayDiningTime() // => 对象，包含 enabled、show、diningTime、pickerValue、minHour、maxHour、minMinute、formatter、filter、onChange、open、close、confirm
 */
export function usePayDiningTime() {
  const enabled = computed(() => (orderingSettings.create_order_select_time ?? '') === '1')

  const show = ref(false)
  /** 已选时间 HH:mm，未选为空 */

  const diningTime = ref('')

  const start = nowCeil10()
  /** picker 当前值 */

  const pickerValue = ref(`${pad(start.h)}:${pad(start.m)}`)

  const minHour = ref(new Date().getHours())

  const maxHour = 22

  const minMinute = ref(new Date().getMinutes())

  function formatter(type: string, value: string | number) {
    if (type === 'hour') {
      return `${value}点`
    }

    if (type === 'minute') {
      return `${value}分`
    }

    return String(value)
  }

  /** 分钟只保留 10 的整数倍 */

  function filter(column: { type: string, values: number[] }) {
    if (column.type === 'minute') {
      return column.values.filter(v => v % 10 === 0)
    }

    return column.values
  }

  /** 滚动到当前小时，分钟下限为当前分钟；其他小时不限 */

  function onChange(value: string) {
    const hour = Number(String(value).split(':')[0])

    const now = new Date()

    minMinute.value = hour === now.getHours() ? now.getMinutes() : 0
  }

  function open() {
    // 每次打开刷新下限，避免页面停留过久后可选到已过去的时间

    const now = new Date()

    minHour.value = now.getHours()

    onChange(pickerValue.value)

    show.value = true
  }

  function close() {
    show.value = false
  }

  function confirm(value: string) {
    diningTime.value = value

    close()
  }

  return {
    enabled,
    show,
    diningTime,
    pickerValue,
    minHour,
    maxHour,
    minMinute,
    formatter,
    filter,
    onChange,
    open,
    close,
    confirm,
  }
}

/**
 * DiningTimeVm 数据契约；字段可选性及取值范围以声明为准。
 * 值约束：ReturnType<typeof usePayDiningTime>。
 * @example
 * import type { DiningTimeVm } from '@/pages/ordering/menu-pay/composables/use-dining-time'
 * declare const response: DiningTimeVm
 * const value: DiningTimeVm = response // => 保留 DiningTimeVm 的字段与取值约束
 */
export type DiningTimeVm = ReturnType<typeof usePayDiningTime>
