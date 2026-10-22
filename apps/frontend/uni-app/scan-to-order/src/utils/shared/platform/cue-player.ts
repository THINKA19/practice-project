/**
 * ============================================================================
 * 平台硬件提示音播放适配模块 (Platform Audio Cue Player)
 * ============================================================================
 *
 * 【文件概述】
 * 本文件处于共享平台能力适配层（Shared Platform），主要用于封装宿主环境（UniApp / 微信小程序 / App）
 * 的原生 InnerAudioContext 硬件播放能力。
 * 本模块并非 Vue 响应式 Composable，而是纯平台硬件驱动工厂函数。它统一负责音频硬件上下文的
 * 安全创建、实例防串扰、超时看门狗保护、原生事件深度解绑以及内存防泄漏销毁。
 *
 * 核心机制：
 * 1. 实例互斥与防串扰（Instance Isolation）：
 *    每次请求播放新音频时，自动终止并销毁上一轮未完成的硬件实例，保证同一播放器内永远只有一个音频在发声。
 * 2. 超时看门狗机制（Timeout Watchdog）：
 *    在弱网加载远程音频文件失败、或系统底层解码挂起时，定时看门狗强制超时熔断，主动释放硬件并触发 'Timeout' 回调。
 * 3. 内存安全自愈（Zero-Leakage Cleanup）：
 *    无论是正常结束、手动打断、加载报错还是看门狗超时，均严格解绑全部底层原生监听并调用 destroy()。
 *
 * 【方法与接口清单】
 * - CueFailure                       : 播放失败原因字面量联合类型 ('Failed' | 'Timeout' | 'Unsupported')
 * - CueHandlers                      : 播放过程生命周期回调契约 (onEnded, onFailed)
 * - CuePlayerOptions                 : 播放器构造配置项 (超时时间、音量控制、静音键遵循)
 * - CuePlayer                        : 播放器控制实例句柄 (play, stop, playing 属性)
 * - createCuePlayer(options)         : 工厂函数，生成具备看门狗与内存隔离的安全播放器实例
 *
 * 【综合使用示例】
 * ```typescript
 * import { createCuePlayer } from '@/utils/shared/platform/cue-player'
 *
 * // 1. 创建播放器实例（设置 5 秒加载看门狗与最大音量）
 * const payCuePlayer = createCuePlayer({ timeoutMs: 5000, volume: 1.0 })
 *
 * // 2. 播放音频并挂载状态回调
 * payCuePlayer.play('/static/audio/pay-success.mp3', {
 *   onEnded: () => {
 *     console.log('支付成功提示音播放完毕')
 *   },
 *   onFailed: (reason) => {
 *     console.warn('播放失败，原因:', reason) // 'Failed' | 'Timeout' | 'Unsupported'
 *   },
 * })
 *
 * // 3. 检查当前是否在发声
 * if (payCuePlayer.playing) {
 *   console.log('正在播放中...')
 * }
 *
 * // 4. 用户切换页面或组件销毁时安全停止
 * payCuePlayer.stop()
 * ```
 * ============================================================================
 */

/** 提示音播放失败的原因枚举分类 */
export type CueFailure = 'Failed' | 'Timeout' | 'Unsupported'

/** 播放事件生命周期回调处理器 */
export interface CueHandlers {
  /** 播放自然结束或执行完毕后的回调 */
  onEnded?: () => void
  /** 播放因硬件异常、网络失败或超时触发的回调 */
  onFailed?: (reason: CueFailure) => void
}

/** 播放器全局可选配置项 */
export interface CuePlayerOptions {
  /** 加载与播放的最长等待时间（毫秒），默认 15000ms */
  timeoutMs?: number
  /** 音频播放音量大小，范围 0 ~ 1，默认 1.0 */
  volume?: number
  /** 是否遵循系统静音开关，默认 false（即静音模式下点餐提示音依然允许发声，视各端策略而定） */
  obeyMuteSwitch?: boolean
}

/** 提示音控制器句柄接口 */
export interface CuePlayer {
  /**
   * 停止当前所有播放动作，并即刻加载并播放指定的音频地址
   * @param src 音频资源路径（支持本地静态绝对路径或合法的网络 URL）
   * @param handlers 播放成功/失败的回调监听集
   */
  play: (src: string, handlers?: CueHandlers) => void

  /**
   * 主动打断并停止播放，销毁硬件上下文；主动停止时保证不会触发任何 onEnded 或 onFailed 回调
   */
  stop: () => void

  /** 当前底层硬件是否正处于音频上下文存活发声状态 */
  readonly playing: boolean
}

/**
 * 创建一个具备看门狗与实例防串扰能力的平台级提示音播放器
 *
 * @param options 播放器配置项（超时毫秒、初始音量等）
 * @returns 具备生命周期防护的 CuePlayer 控制器实例
 *
 * @example
 * const player = createCuePlayer({ timeoutMs: 3000 })
 * player.play('/static/audio/beep.mp3')
 */
export function createCuePlayer(options: CuePlayerOptions = {}): CuePlayer {
  const timeoutMs = typeof options.timeoutMs === 'number' && options.timeoutMs > 0 ? options.timeoutMs : 15000
  const defaultVolume = typeof options.volume === 'number' ? Math.max(0, Math.min(1, options.volume)) : 1.0
  const obeyMuteSwitch = options.obeyMuteSwitch ?? false

  let ctx: UniApp.InnerAudioContext | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let endedListener: (() => void) | undefined
  let errorListener: ((error: unknown) => void) | undefined

  /**
   * 彻底清理定时器并解绑底层原生事件，最终销毁上下文
   */
  function release() {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }

    if (!ctx) {
      return
    }

    const previous = ctx
    ctx = undefined

    const ended = endedListener
    const failed = errorListener
    endedListener = undefined
    errorListener = undefined
    // 每一步独立清理，解绑或 stop 抛错也必须尝试 destroy。
    for (const cleanup of [
      () => ended && previous.offEnded?.(ended),
      () => failed && previous.offError?.(failed),
      () => previous.stop(),
      () => previous.destroy(),
    ]) {
      try {
        cleanup()
      }
      catch (e) {
        console.warn('[CuePlayer] Hardware context destroy warning:', e)
      }
    }
  }

  return {
    get playing() {
      return !!ctx
    },

    stop: release,

    play(src: string, handlers: CueHandlers = {}) {
      // 1. 打断上一段播放并完成实例回收
      release()

      if (!src || typeof src !== 'string') {
        handlers.onFailed?.('Failed')
        return
      }

      // 2. 检查宿主平台是否支持原生音频上下文
      if (typeof uni === 'undefined' || typeof uni.createInnerAudioContext !== 'function') {
        handlers.onFailed?.('Unsupported')
        return
      }

      try {
        const instance = uni.createInnerAudioContext()
        ctx = instance

        // 统一终结结算逻辑：确保本轮实例依然有效且不会多次执行
        const settle = (action?: () => void) => {
          if (ctx !== instance) {
            return
          }
          release()
          action?.()
        }

        // 挂载原生监听
        endedListener = () => {
          settle(handlers.onEnded)
        }

        errorListener = (err) => {
          console.warn('[CuePlayer] Native audio playback error:', err)
          settle(() => handlers.onFailed?.('Failed'))
        }
        instance.onEnded(endedListener)
        instance.onError(errorListener)

        // 配置硬件基础参数
        instance.obeyMuteSwitch = obeyMuteSwitch
        instance.volume = defaultVolume
        instance.src = src

        // 启动播放
        instance.play()

        // 挂载超时看门狗保护
        if (ctx === instance) {
          timer = setTimeout(() => {
            settle(() => handlers.onFailed?.('Timeout'))
          }, timeoutMs)
        }
      }
      catch (err) {
        console.error('[CuePlayer] Failed to initialize InnerAudioContext:', err)
        release()
        handlers.onFailed?.('Unsupported')
      }
    },
  }
}
