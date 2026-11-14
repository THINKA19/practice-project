/** 创建不重叠的前台轮询。@param task 每次任务，active 随停止失效 @param delay 间隔毫秒 @returns 启停方法 @example createPoller(async () => {}, 5000).stop() // 停止 */
export function createPoller(task: (tick: { readonly active: boolean }) => Promise<void>, delay: number) {
  let epoch = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  function stop() { epoch++; clearTimeout(timer) }
  function start() { stop(); const started = epoch; const tick = { get active() { return epoch === started } }; const run = async () => { try { await task(tick) } finally { if (tick.active) timer = setTimeout(run, delay) } }; void run() }
  return { start, stop }
}
