import { expect, it } from 'vitest'
import { createPickupState } from '../state'

it('isolates customers and restores orders on reset', () => {
  const state = createPickupState()
  const code = state.list('a').orderList[0].hxNumber
  expect(state.verify('a', code)).toBe(true)
  expect(state.status('b', code)).toBe(1)
  state.reset()
  expect(state.status('a', code)).toBe(1)
})
