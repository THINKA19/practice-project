import { onScopeDispose, ref } from 'vue'

/**
 * 秒级倒计时（通用，无业务耦合）
 *
 * 设计要点：
 * - 只维护「当前时间」一个 ref，具体文案由调用方用 endTime 与 now 求差后格式化：
 *   整页 N 个倒计时项共用同一个 1 秒 tick，比每条数据各起一个定时器省得多
 * - 由调用方在页面 onShow / onHide 显式 start / stop：小程序切页不会卸载页面，
 *   页面进入后台还每秒触发渲染是纯浪费（这也是本 hook 不内置生命周期的原因）
 * - start 时会立刻对齐一次时间：从后台回到前台不能沿用进后台前的旧时间戳
 *
 * @param interval 刷新间隔（毫秒），默认 1000
 * @returns now 当前时间戳（响应式）/ start 启动 / stop 停止
 * @example
 * const { now, start, stop } = useCountdown()
 * onShow(start)
 * onHide(stop)
 * // 模板中：{{ remainText(item.endTime) }}，remainText 内部读 now.value，会随秒自动重算
 */
export function useCountdown(interval = 1000) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | null = null

  /** 启动倒计时：已在运行时重复调用无副作用 */
  function start() {
    if (timer)
      return
    now.value = Date.now()
    timer = setInterval(() => {
      now.value = Date.now()
    }, interval)
  }

  /** 停止倒计时：停止后 now 保留最后一次的时间，不会跳变 */
  function stop() {
    if (!timer)
      return
    clearInterval(timer)
    timer = null
  }

  // 卸载兜底：正常流程 onHide 已 stop，这里防漏（避免页面销毁后定时器仍在跑）
  onScopeDispose(stop)

  return { now, start, stop }
}
