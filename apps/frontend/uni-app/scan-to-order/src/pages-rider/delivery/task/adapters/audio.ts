/**
 * ============================================================================
 * 【文件概述】配送任务的平台音频适配层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - createRiderCuePlayer：适配 uni 音频播放与超时销毁，沿用用户指定音频资源。
 * 【综合使用示例】
 * import { createRiderCuePlayer } from '@/pages-rider/delivery/task/adapters/audio'
 * const player = createRiderCuePlayer(() => {}); player.stop() // 安全释放播放器
 * ============================================================================
 */
/**
 * 适配 uni 音频播放与超时销毁，沿用用户指定音频资源。
 * @param onFailure {() => void} 音频失败后的提示回调
 * @returns 带 play 和 stop 的播放器；播放失败调用 onFailure，stop 释放资源。
 * @example const player = createRiderCuePlayer(() => {}); player.stop() // 安全释放播放器
 */
export function createRiderCuePlayer(onFailure: () => void) {
  const cue = '/static/audio/notifications/incoming.wav'
  let audio: UniApp.InnerAudioContext | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  // #ifdef H5
  let context: AudioContext | undefined
  let buffer: Promise<AudioBuffer | undefined> | undefined
  let source: AudioBufferSourceNode | undefined
  let generation = 0

  function prepare() {
    if (typeof window === 'undefined' || !window.AudioContext)
      return
    try {
      const current = context ??= new window.AudioContext()
      void current.resume().catch(() => {})
      buffer ??= fetch(cue)
        .then((response) => {
          if (!response.ok)
            throw new Error('Unable to load rider alert')
          return response.arrayBuffer()
        })
        .then(data => current.decodeAudioData(data))
        .catch(() => {
          buffer = undefined
          return undefined
        })
    }
    catch {
      // The uni audio player remains available when Web Audio initialization fails.
    }
  }
  // #endif

  function stop() {
    // #ifdef H5
    generation++
    source?.stop()
    source = undefined
    // #endif
    clearTimeout(timeout)
    const previous = audio
    audio = undefined
    if (!previous)
      return
    try {
      previous.stop()
    }
    finally {
      previous.destroy()
    }
  }
  function play() {
    // #ifdef H5
    if (context?.state === 'running' && buffer) {
      const current = context
      const ticket = generation
      void buffer.then((decoded) => {
        if (ticket !== generation || source)
          return
        if (!decoded) {
          playUni()
          return
        }
        const node = current.createBufferSource()
        node.buffer = decoded
        node.connect(current.destination)
        node.onended = () => {
          if (source === node)
            source = undefined
          node.disconnect()
        }
        source = node
        node.start()
      }).catch(onFailure)
      return
    }
    // #endif
    playUni()
  }

  function playUni() {
    if (audio)
      return
    try {
      const current = uni.createInnerAudioContext()
      audio = current
      current.src = cue
      const fail = () => {
        if (audio !== current)
          return
        stop()
        onFailure()
      }
      current.onEnded(() => {
        if (audio === current)
          stop()
      })
      current.onError(fail)
      timeout = setTimeout(fail, 15000)
      current.play()
    }
    catch {
      stop()
      onFailure()
    }
  }
  return {
    play,
    stop,
    prepare() {
      // #ifdef H5
      prepare()
      // #endif
    },
    dispose() {
      stop()
      // #ifdef H5
      void context?.close().catch(() => {})
      context = undefined
      buffer = undefined
      // #endif
    },
  }
}
