/**
 * ============================================================================
 * 骑手端分包路由定义表 (Rider Subpackage Route Contracts)
 * ============================================================================
 *
 * 【模块说明】
 * 本文件专用于声明骑手端（pages-rider 分包）所有的页面静态路径常量。
 * 遵循业务模块化分组组织，作为全工程在骑手业务场景下路由调度的单一数据源（Single Source of Truth）。
 *
 * 【注意事项】
 * 1. 本文件仅提供常量路径定义与 TypeScript 类型收窄支持，不能替代 `pages.json` 中的页面注册配置。
 * 2. 新增、重命名或下线骑手端页面时，需同步维护 `pages.json` 中的 `subPackages` 配置段。
 * 3. 业务代码中严禁硬编码字符串路径，统一通过本常量表进行引用。
 *
 * 【使用示例】
 * ```typescript
 * import { RiderRoutes } from '@/pages-rider/routes'
 * import { go, redirect } from '@/utils/router'
 *
 * // 跳转到配送任务详情页
 * go(RiderRoutes.Delivery.taskDetail, { orderId: 'R10086' })
 *
 * // 登录失效重定向至登录页
 * redirect(RiderRoutes.Access.login)
 * ```
 * ============================================================================
 */

export const RiderRoutes = {
  /** 访问控制与认证模块 */
  Access: {
    /** 骑手登录授权页（手机号/验证码/账密登录） */
    login: '/pages-rider/access/auth/login',
  },

  /** 工作台模块 */
  Workspace: {
    /** 骑手工作台首页（接单状态切换、今日收益概览、待办提醒） */
    workspace: '/pages-rider/workspace/index/index',
  },

  /** 配送履约模块 */
  Delivery: {
    /** 配送任务大厅/列表页（待抢单、待取餐、配送中订单汇总） */
    tasks: '/pages-rider/delivery/task/index',
    /** 配送任务详情页（取送货路线导航、客户联系、送达拍照确认） */
    taskDetail: '/pages-rider/delivery/task/detail',
  },

  /** 个人中心与账号模块 */
  Account: {
    /** 骑手个人中心首页（个人信息概览、统计报表、入口集合） */
    account: '/pages-rider/account/index/index',
    /** 骑手实名与资料详情页（健康证、车辆信息、实名认证状态） */
    profile: '/pages-rider/account/profile/index',
    /** 系统通用设置页（接单语音播报、消息通知、关于与退出登录） */
    settings: '/pages-rider/account/settings/index',
  },
} as const
