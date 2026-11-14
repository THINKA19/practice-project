const meta = (text: string, color = '#237a50') => ({ text, color, bg: `${color}18`, className: '' })
export const SHOP_RIDER_STATUS = { online: meta('接单中'), busy: meta('配送中'), offline: meta('已下线') }
export const SHOP_DISPATCH_STATUS = { waiting: meta('待派送'), assigned: meta('已派单'), delivering: meta('配送中'), done: meta('已送达') }
export const SHOP_RIDER_TABS: { key: 'all' | 'online' | 'busy' | 'offline', label: string }[] = [{ key: 'all', label: '全部' }, { key: 'online', label: '接单中' }, { key: 'busy', label: '配送中' }, { key: 'offline', label: '已下线' }]
