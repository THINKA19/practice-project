import { expect, it } from 'vitest'
import { createFoo } from '../data'

it('returns independent sample objects', () => {
  const first = createFoo()
  first.name = 'changed'
  expect(createFoo().name).toBe('Mock 示例')
})
