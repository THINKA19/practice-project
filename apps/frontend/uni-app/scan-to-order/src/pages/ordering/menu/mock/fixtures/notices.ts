/**
 * ============================================================================
 * 【文件概述】菜单选品 / mock/fixtures/notices.ts
 * 开发模拟层：提供业务样本或模拟接口，不作为生产数据源。
 * 【方法与导出清单】
 * - notices：本文件对外声明。
 * 【综合使用示例】
 * import { notices } from '@/pages/ordering/menu/mock/fixtures/notices'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import type { OrderingNotice } from '../../models/types'

/**
 * notices：供本领域调用的数据声明。
 * @returns OrderingNotice[]；不是独立请求的执行结果。
 * @example
 * import { notices } from '@/pages/ordering/menu/mock/fixtures/notices'
 * notices // => 访问当前声明；调用型状态入口需在应用作用域使用
 */
export const notices: OrderingNotice[] = [
  { id: 1, title: '欢迎光临，现点现做', content: '欢迎来到示范餐厅！\n\n请先确认门店和服务方式，再挑选喜欢的餐品。餐品现点现做，高峰时段请耐心等候。', publishedAt: '2026-10-28' },
  { id: 2, title: '取餐提醒：请留意订单状态', content: '下单后可在订单详情查看制作与取餐状态。\n\n到店自取请核对门店、取餐号及餐品，确认出餐后再前往取餐区。', publishedAt: '2026-10-28' },
  { id: 3, title: '温馨提示：按需点餐，避免浪费', content: '建议按用餐人数选择合适的餐品数量。\n\n如有过敏原、忌口或口味要求，请在下单前联系门店确认。', publishedAt: '2026-10-28' },
]
