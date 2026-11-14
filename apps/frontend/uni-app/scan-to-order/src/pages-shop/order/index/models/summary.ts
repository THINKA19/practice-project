import { orderCategories } from '../../list/models/filters'
import type { OrderCategory } from '../../list/models/filters'

export const pendingStatuses = ['awaitingAcceptance', 'awaitingVerification', 'awaitingConfirmation', 'awaitingPayment'] as const

export interface OrderCenterSummary {
  category: OrderCategory
  status: typeof pendingStatuses[number]
  count: number
}

/** Validates the summary response for the requested shop. */
export function parseOrderCenterSummary(value: unknown, shopId: string): OrderCenterSummary[] {
  const response = value as { shopId?: unknown, items?: unknown } | null
  if (response?.shopId !== shopId || !Array.isArray(response.items))
    throw new Error('Invalid order center summary')

  const seen = new Set<OrderCategory>()
  return response.items.map((item: OrderCenterSummary) => {
    if (!item || !orderCategories.some(category => category.key === item.category)
      || !pendingStatuses.includes(item.status) || !Number.isSafeInteger(item.count)
      || item.count < 0 || seen.has(item.category)) {
      throw new Error('Invalid order center summary item')
    }

    seen.add(item.category)
    return { category: item.category, status: item.status, count: item.count }
  })
}
