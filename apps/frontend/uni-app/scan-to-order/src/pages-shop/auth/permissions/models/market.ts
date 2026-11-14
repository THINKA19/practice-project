import type { MerchantShop } from './types'

const markets = {
  VN: { currency: 'VND', utcOffset: 7 },
  TH: { currency: 'THB', utcOffset: 7 },
  LA: { currency: 'LAK', utcOffset: 7 },
  CN: { currency: 'CNY', utcOffset: 8 },
}
/** Resolve the current shop currency, preferring the explicit settlement currency. */
export function merchantCurrency(shop?: MerchantShop | null) {
  return shop?.currencyCode || (shop?.countryCode ? markets[shop.countryCode].currency : undefined)
}

/** Read the shop-local calendar date and hour for order filters and reporting. */
export function merchantClock(shop?: MerchantShop | null) {
  const offset = shop?.countryCode ? markets[shop.countryCode].utcOffset : undefined
  return (date: Date) => {
    const minutes = offset === undefined ? -date.getTimezoneOffset() : offset * 60
    const local = new Date(date.getTime() + minutes * 60_000)
    return { day: local.toISOString().slice(0, 10), hour: local.getUTCHours() }
  }
}
