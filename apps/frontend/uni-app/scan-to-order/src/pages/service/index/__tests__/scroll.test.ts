import { effectScope } from 'vue'
import { expect, it } from 'vitest'
import { useHorizontalScroll } from '../components/Gallery/use-gallery'

it('keeps component scroll state isolated and removes active drag listeners on disposal', () => {
  const firstScope = effectScope()
  const secondScope = effectScope()
  const first = firstScope.run(useHorizontalScroll)!
  const second = secondScope.run(useHorizontalScroll)!
  const state = first.getState(1)
  state.viewport = 100
  state.width = 500
  first.handleMouseDown(1, new MouseEvent('mousedown', { button: 0, clientX: 100 }))
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }))
  expect(state.left).toBe(50)
  expect(second.getState(1).left).toBe(0)
  firstScope.stop()
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10 }))
  expect(state.left).toBe(50)
  secondScope.stop()
})

it('disables each boundary and never wraps past the first or last image', () => {
  const scope = effectScope()
  const controls = scope.run(useHorizontalScroll)!
  const state = controls.getState(1)
  state.viewport = 100
  state.width = 500
  expect(controls.canScroll(1, -1)).toBe(false)
  controls.scrollBy(1, -1)
  expect(state.left).toBe(0)
  controls.scrollBy(1, 1)
  expect(state.left).toBe(70)
  state.left = 390
  controls.scrollBy(1, 1)
  expect(state.left).toBe(400)
  controls.scrollBy(1, 1)
  expect(state.left).toBe(400)
  expect(controls.canScroll(1, 1)).toBe(false)
  expect(controls.canScroll(1, -1)).toBe(true)
  state.left = 0
  expect(controls.canScroll(1, -1)).toBe(false)
  state.width = 80
  expect(controls.canScroll(1, 1)).toBe(false)
  expect(controls.canScroll(1, -1)).toBe(false)
  scope.stop()
})
