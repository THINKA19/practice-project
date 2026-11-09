/**
 * ============================================================================
 * 【文件概述】购物车与桌台订单 / models/mappers.ts
 * 模型层：维护数据契约、展示转换和派生数据，不拥有页面状态。
 * 【方法与导出清单】
 * - toAddCartRequest：本文件对外声明。
 * - toCartInfo：本文件对外声明。
 * 【综合使用示例】
 * import { toAddCartRequest } from '@/pages/ordering/menu-cart/models/mappers'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { AddCartCommand, CartInfo } from './types'
import type { AddCartRequestDto, CartInfoDto } from '../api/cart.dto'
/**
 * 前端加购命令转换为表单协议字段。
 * @param cmd {AddCartCommand} 前端加购命令。
 * @returns AddCartRequestDto。
 * @example
 * import { toAddCartRequest } from '@/pages/ordering/menu-cart/models/mappers'
 * declare const cmd: Parameters<typeof toAddCartRequest>[0]
 * toAddCartRequest(cmd) // => AddCartRequestDto
 */
export function toAddCartRequest(cmd: AddCartCommand): AddCartRequestDto {
  return { ...cmd, sku: cmd.sku?.length ? JSON.stringify(cmd.sku) : '', addition: cmd.addition?.length ? JSON.stringify(cmd.addition) : '' }
}
/**
 * 保留未知扩展字段，隔离购物车商品引用。
 * @param dto {CartInfoDto | null} 服务端原始响应。
 * @returns CartInfo | null。
 * @example
 * import { toCartInfo } from '@/pages/ordering/menu-cart/models/mappers'
 * declare const dto: Parameters<typeof toCartInfo>[0]
 * toCartInfo(dto) // => CartInfo | null
 */
export function toCartInfo(dto: CartInfoDto | null): CartInfo | null {
  return dto ? { ...dto, items: dto.items.map(item => ({ ...item, sku: item.sku?.map(s => ({ ...s })), additions: item.additions?.map(a => ({ ...a })) })) } : null
}
