/**
 * ============================================================================
 * 【文件概述】配送任务的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderTaskRefresh：随页面显示串行刷新任务；隐藏或销毁后停止轮询和音频。
 * 【综合使用示例】
 * import { useRiderTaskRefresh } from '@/pages-rider/delivery/task/composables/use-refresh'
 * useRiderTaskRefresh() // 在骑手页面 setup 中注册生命周期
 * ============================================================================
 */
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { onScopeDispose } from 'vue'
import { useRiderLoginAuth } from '@/pages-rider/auth/login'
import { useRiderTaskStore } from './use-store'
import { useRiderTaskReminders } from './use-reminders'

/**
 * 随页面显示串行刷新任务；隐藏或销毁后停止轮询和音频。
 * 无参数。
 * @returns {void} 注册串行轮询及前台音频生命周期。
 * @example useRiderTaskRefresh() // 在骑手页面 setup 中注册生命周期
 */
export function useRiderTaskRefresh() {
  const store = useRiderTaskStore()
  const reminders = useRiderTaskReminders()
  const { ensureLogin } = useRiderLoginAuth()
  let generation = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  function stop() {
    generation++
    clearTimeout(timer)
    reminders.pause()
  }
  async function tick(current: number) {
    if (current !== generation || !ensureLogin())
      return
    const updated = await store.refresh()
    if (current !== generation)
      return
    if (updated) {
      reminders.resume()
      reminders.inspect()
    }
    timer = setTimeout(() => void tick(current), 5000)
  }
  onShow(() => {
    stop()
    if (!ensureLogin())
      return
    reminders.resume()
    void tick(generation)
  })
  onHide(stop)
  onUnload(stop)
  onScopeDispose(stop)
}
