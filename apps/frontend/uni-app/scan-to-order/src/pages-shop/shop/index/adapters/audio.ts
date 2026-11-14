/** 创建门店前台音频播放器。@param options 超时时间 @returns 播放与释放能力 @example createCuePlayer({timeoutMs:15000}).stop() // 释放资源 */
export function createCuePlayer(options: { timeoutMs: number }) {
  let audio: UniApp.InnerAudioContext | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  // #ifdef H5
  let webAudio: HTMLAudioElement | undefined
  let webPlayback: symbol | undefined
  // #endif
  function stop() {
    clearTimeout(timer)
    // #ifdef H5
    if (webPlayback && webAudio) {
      webPlayback = undefined
      webAudio.onended = null
      webAudio.onerror = null
      webAudio.pause()
    }
    // #endif
    const previous = audio
    audio = undefined
    if (previous) {
      previous.stop()
      previous.destroy()
    }
  }
  function play(source: string, callbacks: { onEnded: () => void, onFailed: () => void }) {
    stop()
    // #ifdef H5
    if (!import.meta.env.VITEST && typeof Audio !== 'undefined') {
      // Reuse the element started by the preview gesture for subsequent alerts.
      const current = webAudio ??= new Audio()
      const playback = webPlayback = Symbol('merchant order audio')
      const finish = (callback: () => void) => {
        if (webPlayback !== playback)
          return
        stop()
        callback()
      }
      const fail = () => finish(callbacks.onFailed)
      current.src = source.startsWith('/static/') ? `${import.meta.env.BASE_URL}${source.slice(1)}` : source
      current.onended = () => finish(callbacks.onEnded)
      current.onerror = fail
      timer = setTimeout(fail, options.timeoutMs)
      void current.play().catch(fail)
      return
    }
    // #endif
    try {
      const current = uni.createInnerAudioContext()
      audio = current
      current.src = source
      const finish = (callback: () => void) => {
        if (audio !== current)
          return
        stop()
        callback()
      }
      const fail = () => finish(callbacks.onFailed)
      current.onEnded(() => finish(callbacks.onEnded))
      current.onError(fail)
      timer = setTimeout(fail, options.timeoutMs)
      current.play()
    }
    catch {
      stop()
      callbacks.onFailed()
    }
  }
  return {
    play,
    stop,
    get playing() {
      // #ifdef H5
      if (webPlayback)
        return true
      // #endif
      return !!audio
    },
  }
}
