import type { TableItem } from '../models'
import { authorize } from '@/pages-shop/auth/permissions/mock'
import { endpoints } from '../api/endpoints'

const centerTables = [
  { prefix: 'A', seats: 2, count: 18 },
  { prefix: 'B', seats: 4, count: 16 },
  { prefix: 'C', seats: 6, count: 12 },
  { prefix: 'D', seats: 8, count: 10 },
  { prefix: 'E', seats: 10, count: 12 },
  { prefix: 'F', seats: 12, count: 12 },
]

const branchTables = [
  { prefix: 'A', seats: 2, count: 16 },
  { prefix: 'B', seats: 4, count: 14 },
  { prefix: 'C', seats: 8, count: 8 },
  { prefix: 'D', seats: 12, count: 10 },
]

export function handle(endpoint: string, data: { shopId: string }, token: string): TableItem[] {
  if (endpoint !== endpoints.list)
    throw new Error('未知桌台接口')

  const { shopId } = data
  authorize(token, shopId, 'table.read')
  const sections = shopId === 'A' ? centerTables : branchTables
  const offset = shopId === 'A' ? 0 : 2

  return sections.flatMap(({ prefix, seats, count }) => Array.from({ length: count }, (_, index) => {
    const sort = index + 1
    const no = `${prefix}${String(sort).padStart(2, '0')}`
    const examples = [0, 1, seats, null, Math.ceil(seats / 2), seats - 1, 0]
    const occupiedSeats = examples[(index + offset) % examples.length]
    const seatPositions = occupiedSeats === null
      ? undefined
      : Array.from({ length: seats }, (_, seat) => ({
          code: String(seat + 1),
          occupied: (seat + index + offset) % seats < occupiedSeats,
        }))
    return { id: `${shopId}-${no}`, shopId, no, seats, sort, occupiedSeats, seatPositions }
  }))
}
