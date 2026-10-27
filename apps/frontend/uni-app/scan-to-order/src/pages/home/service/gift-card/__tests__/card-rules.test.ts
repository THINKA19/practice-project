import type { MyCard } from '@/pages/home/service/gift-card'
import { describe, expect, it } from 'vitest'
import { myCardState } from '@/pages/home/service/gift-card'

describe('marketing / card', () => {
  const base: MyCard = { id: 1, cardId: 1, amount: 10, status: 0 }

  it('derives my card state', () => {
    expect(myCardState(base)).toBe('canShare')

    expect(myCardState({ ...base, shareToken: 'x' })).toBe('sharing')

    expect(myCardState({ ...base, isActive: true })).toBe('active')

    expect(myCardState({ ...base, fromUid: 2 })).toBe('active')
  })
})
