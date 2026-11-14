import type { DeliveryTask } from '../models/index'
import { orders } from '@/pages-shop/order/list/mock'
import { endpoints } from '../api/endpoints'

const records = new Map<string, DeliveryTask[]>()
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value))
/** 配送派单模拟。@param endpoint 路径 @param data 参数 @param token 凭证 @returns 任务或确认 @example handle(endpoints.list, {shopId:'A'}, token) // 配送快照 */
export function handle(endpoint: string, data: Record<string, unknown>, token: string): unknown {
  const id = String(data.shopId)
  const permission = endpoint === endpoints.list ? 'delivery.read' : 'delivery.dispatch'
  const readyOrders = orders(token, id, permission).filter(order => order.type === '外卖' && order.status === 3)
  if (!records.has(id))
    records.set(id, [])
  const tasks = records.get(id)!
  for (const order of readyOrders) {
    if (!tasks.some(t => t.orderId === order.id))
      tasks.push({ id: `task-${order.id}`, orderId: order.id, version: 1, status: 'pending', statusText: '待派单', riderId: '', address: order.address, exception: '' })
  }
  const riders = [{ id: `${id}-R1`, name: '测试骑手', online: true, load: tasks.filter(t => t.riderId && t.status !== 'done').length, maxConcurrent: 3 }]
  if (endpoint === endpoints.list) {
    const contacts = [
      { id: `${id}-rider`, name: '陈小林', role: '合作骑手', phone: '+12025550101' },
      { id: `${id}-backup`, name: '林晓宇', role: '备用骑手', phone: '+12025550102' },
      { id: `${id}-station`, name: '配送站值班台', role: '配送协调', phone: '+12025550103' },
    ]
    return copy({ tasks, riders, contacts })
  }
  const task = tasks.find(t => t.id === data.id)
  if (!task || task.version !== data.version)
    throw new Error('配送任务已更新，请刷新')
  if (endpoint === endpoints.dispatch) {
    const rider = riders.find(r => r.id === data.riderId)
    if (task.status !== 'pending' || !rider || rider.load >= rider.maxConcurrent)
      throw new Error('任务状态或骑手负载不允许派单')
    task.riderId = rider.id
    task.status = 'assigned'
    task.statusText = '等待骑手接单'
  }
  else if (endpoint === endpoints.withdraw && task.status === 'assigned') {
    task.riderId = ''
    task.status = 'pending'
    task.statusText = '待派单'
  }
  else {
    throw new Error('当前任务不允许撤回')
  }
  task.version++
  return copy(task)
}
/** 清空派单。无参数。@returns void @example reset() // 清空 */
export function reset() {
  records.clear()
}
