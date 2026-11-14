import { snapshot } from '@/pages-rider/delivery/task/mock'
import { createAccount } from './fixtures'

/** 验证骑手凭证并返回当前账号的开发演示数据。 */
export function read(authorization: string) {
  const data = snapshot(authorization)
  return createAccount(data.tasks.filter(task => task.riderId === data.riderId && task.status === 'done').length)
}
