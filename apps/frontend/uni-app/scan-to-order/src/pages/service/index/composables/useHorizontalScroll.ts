import type { GroupScrollState, HorizontalScrollEvent } from '../models/scroll'
import { nextTick, onScopeDispose, reactive } from 'vue'
/** 每个服务页独立拥有滚动状态；触摸滚动由 scroll-view 接管。 */
export function useHorizontalScroll() {
  const states = reactive(new Map<number, GroupScrollState>())
  // #ifdef H5
  const elements = new Map<number, HTMLElement>()
  let stopDrag: (() => void) | undefined
  // #endif
  function getState(id: number): GroupScrollState {
    if (!states.has(id))
      states.set(id, { left: 0, width: 0, viewport: 0, dragging: false, dragMoved: false, startX: 0, startLeft: 0 })
    return states.get(id)!
  }
  function setRef(id: number, value: unknown) {
    // #ifdef H5
    const root = value && typeof value === 'object' && '$el' in value ? value.$el : value
    if (!(root instanceof HTMLElement)) {
      elements.delete(id)
      return
    }
    elements.set(id, root)
    void nextTick(() => {
      if (elements.get(id) !== root)
        return
      const viewport = root.querySelector<HTMLElement>('.uni-scroll-view') ?? root
      const state = getState(id)
      state.viewport = viewport.clientWidth
      state.width = Math.max(viewport.scrollWidth, ...Array.from(root.querySelectorAll<HTMLElement>('*'), child => child.scrollWidth))
    })
    // #endif
  }
  function onScroll(id: number) {
    return (event: HorizontalScrollEvent) => {
      const state = getState(id)
      state.left = event.detail.scrollLeft
      state.width = event.detail.scrollWidth
    }
  }
  function scrollBy(id: number, direction: 1 | -1) {
    if (!canScroll(id, direction))
      return
    const state = getState(id)
    const maximum = Math.max(0, state.width - state.viewport)
    state.left = Math.max(0, Math.min(state.left + direction * state.viewport * 0.7, maximum))
  }
  function canScroll(id: number, direction: 1 | -1) {
    const state = getState(id)
    const maximum = Math.max(0, state.width - state.viewport)
    return state.viewport > 0 && (direction === 1 ? state.left < maximum - 1 : state.left > 1)
  }
  function handleMouseDown(id: number, event: MouseEvent) {
    // #ifdef H5
    if (event.button !== 0)
      return
    stopDrag?.()
    const state = getState(id)
    state.dragging = true
    state.dragMoved = false
    state.startX = event.clientX
    state.startLeft = state.left
    const move = (next: MouseEvent) => {
      const delta = state.startX - next.clientX
      if (Math.abs(delta) < 3)
        return
      state.dragMoved = true
      state.left = Math.max(0, Math.min(state.startLeft + delta, state.width - state.viewport))
    }
    const up = () => {
      state.dragging = false
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      stopDrag = undefined
    }
    stopDrag = up
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    event.preventDefault()
    // #endif
  }
  onScopeDispose(() => {
    // #ifdef H5
    stopDrag?.()
    elements.clear()
    // #endif
    states.clear()
  })
  return { getState, setRef, onScroll, scrollBy, canScroll, handleMouseDown }
}
