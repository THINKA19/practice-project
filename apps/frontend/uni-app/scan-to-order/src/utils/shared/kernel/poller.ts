/**
 * ============================================================================
 * 异步任务安全串行轮询器内核模块 (Kernel Poller Service)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件属于整个点餐系统的底层共享内核（Shared Kernel）基础设施，统一接管系统中的
 * 前台轮询与状态拉取逻辑。底层为纯 TypeScript 实现，零框架依赖、无副作用。
 *
 * 核心机制与架构优势：
 * 1. 同一轮次串行调度：
 *    采用“任务执行完毕后再触发下一次定时等待”的递归调度模型，彻底消除原生
 *    setInterval 造成的“网络卡顿并发请求堆叠”问题。重启只作废旧 tick，
 *    不取消已发出的请求；旧任务结束前可能与新轮次重叠。
 * 2. 纪元隔离与过期结果作废（Epoch Invalidation）：
 *    通过内部维护单调递增的 epoch 版本号与只读只算属性 `tick.active`，
 *    在用户快速切换页面、主动 stop 或重新 start 时，让已在网络链路中迟滞返回的
 *    旧异步请求结果自动作废，杜绝异步竞态与脏数据覆盖。
 * 3. 故障容错与自愈（Error Tolerance）：
 *    单次任务异常（如弱网抛出网络错误）仅记录警告并自动进入下一次轮询，避免
 *    全局轮询机制意外崩溃中断。
 *
 * 【方法与接口清单】
 * - PollTick                          : 轮询周期有效性凭证（通过 active 标识当前轮次是否仍生效）
 * - Poller                            : 轮询控制器接口（包含 start、stop 及 running 状态）
 * - createPoller(task, intervalMs)    : 核心工厂函数，构造具备竞态防护的安全串行轮询器
 *
 * 【综合使用示例】
 * ```typescript
 * import { createPoller } from '@/utils/shared/kernel/poller'
 * import { checkPayStatusApi } from '@/services/order'
 *
 * // 场景：订单支付结果轮询（间隔 3000ms）
 * const payPoller = createPoller(async (tick) => {
 *   const res = await checkPayStatusApi(orderId)
 *
 *   // 关键防护：网络请求返回后，检查当前轮次是否已被 stop（例如用户已返回上一页）
 *   if (!tick.active) return
 *
 *   if (res.data.isPaid) {
 *     payPoller.stop()
 *     // 跳转支付成功页
 *   }
 * }, 3000)
 *
 * // 启动轮询
 * payPoller.start()
 *
 * // 页面卸载或满足条件时安全销毁
 * payPoller.stop()
 * ```
 * ============================================================================
 */

/**
 * 轮询周期上下文接口
 * 供任务回调函数内部查询当前轮次是否仍然有效
 */
export interface PollTick {
  /**
   * 当前轮次是否有效
   * 若轮询已被 stop 或被重新 start，该值立即变为 false；任务内应当跳过状态更新
   */
  readonly active: boolean
}

/**
 * 轮询控制器接口
 */
export interface Poller {
  /** 启动（或重启）轮询：若此前已在运行，会自动清理旧调度并开启新纪元 */
  start: () => void
  /** 停止轮询：立即清空定时器，并将当前活跃的所有未决异步结果标记为无效 */
  stop: () => void
  /** 当前轮询器是否处于运行状态 */
  readonly running: boolean
}

/**
 * 创建一个具备竞态安全防护的串行轮询器
 *
 * @param task 轮询执行的异步或同步任务，接收一个携带当前有效性凭证的 tick 参数
 * @param intervalMs 两次任务之间的间隔休眠时长（毫秒）
 * @returns 轮询控制器实例 (Poller)
 *
 * @example
 * const poller = createPoller(async (tick) => {
 *   const data = await fetchQueueStatus()
 *   if (tick.active) {
 *     updateQueueUI(data)
 *   }
 * }, 2000)
 *
 * poller.start()
 */
export function createPoller(
  task: (tick: PollTick) => Promise<void> | void,
  intervalMs: number,
): Poller {
  let epoch = 0
  let running = false
  let timer: ReturnType<typeof setTimeout> | undefined

  /** 停止轮询并作废当前轮次 */
  function stop() {
    running = false
    epoch++
    if (timer) {
      clearTimeout(timer)
    }
    timer = undefined
  }

  /**
   * 执行单次任务并递归触发后续调度
   * @param started 该次递归链路启动时的纪元版本号
   */
  async function run(started: number) {
    const tick: PollTick = {
      get active() {
        return running && started === epoch
      },
    }

    try {
      await task(tick)
    }
    catch (error) {
      // 单次失败不终止轮询；任务应自行处理可展示的错误
      console.warn('[poller] task failed', error)
    }
    finally {
      // 只有在当前纪元仍有效时，才安排下一次等待与执行
      if (tick.active) {
        timer = setTimeout(() => void run(started), intervalMs)
      }
    }
  }

  return {
    get running() {
      return running
    },
    stop,
    start() {
      stop()
      running = true
      void run(epoch)
    },
  }
}
