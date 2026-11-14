export type TableOccupancy = 'occupied' | 'vacant' | 'unknown'

export interface TableSeat {
  code: string
  occupied: boolean
}

export interface TableItem {
  id: string
  shopId?: string
  no: string
  seats?: number | null
  occupiedSeats?: number | null
  seatPositions?: TableSeat[]
  sort?: number
  enabled?: boolean
  occupancy?: TableOccupancy | null
}

export interface TableCard {
  id: string
  no: string
  seats: number | null
  occupiedSeats: number | null
  remainingSeats: number | null
  seatPositions: TableSeat[]
  occupancy: TableOccupancy
  full: boolean
}

export interface TableGroup {
  id: string
  seats: number | null
  tables: TableCard[]
}

function validSeatPositions(positions: TableSeat[] | undefined, seats: number | null): TableSeat[] {
  if (!Array.isArray(positions) || !positions.length || (seats !== null && positions.length !== seats))
    return []

  if (positions.some(seat => !seat || typeof seat.code !== 'string' || !seat.code.trim() || typeof seat.occupied !== 'boolean'))
    return []

  const codes = new Set(positions.map(seat => seat.code.trim()))
  return codes.size === positions.length ? positions : []
}

export function groupTables(tables: TableItem[], shopId: string): TableGroup[] {
  const groups = new Map<number | null, TableGroup>()
  const sortedTables = [...tables].sort((a, b) => (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER))
  for (const table of sortedTables) {
    if (table.enabled === false || (table.shopId != null && table.shopId !== shopId))
      continue

    const seats = table.seats != null && Number.isSafeInteger(table.seats) && table.seats > 0 ? table.seats : null
    const positions = validSeatPositions(table.seatPositions, seats)
    const positionCount = positions.length ? positions.filter(seat => seat.occupied).length : null
    const count = table.occupiedSeats ?? positionCount
    const occupiedSeats = count != null && Number.isSafeInteger(count) && count >= 0 && (seats === null || count <= seats)
      ? count
      : null
    const occupancy = occupiedSeats === null
      ? table.occupancy === 'occupied' || table.occupancy === 'vacant' ? table.occupancy : 'unknown'
      : occupiedSeats > 0 ? 'occupied' : 'vacant'
    const remainingSeats = seats !== null && occupiedSeats !== null ? seats - occupiedSeats : null
    const group = groups.get(seats) ?? { id: seats === null ? 'unknown' : `seats:${seats}`, seats, tables: [] }
    group.tables.push({
      id: table.id,
      no: table.no,
      seats,
      occupiedSeats,
      remainingSeats,
      seatPositions: positionCount === occupiedSeats ? positions : [],
      occupancy,
      full: remainingSeats === 0,
    })
    groups.set(seats, group)
  }

  return [...groups.values()].sort((a, b) => (a.seats ?? Infinity) - (b.seats ?? Infinity))
}
