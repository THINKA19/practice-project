/**
 * ============================================================================
 * 【文件概述】骑手分包业务路径唯一清单；共享登录地址由 session 提供。
 * 【方法与导出清单】
 * - RiderRoutes：登录、工作台、配送任务与账户页面路径。
 * 【综合使用示例】
 * import { RiderRoutes } from '@/pages-rider/routes'
 * import { navigate } from '@/utils/project/navigation'
 * navigate(RiderRoutes.Delivery.taskDetail, { id: 'TASK-1' }) // 打开本人任务详情
 * 页面注册由 UniPages 从源码生成，不手动编辑 src/pages.json。
 * ============================================================================
 */
import { AUTH_ROUTES } from '@/pages/auth/session'

export const RiderRoutes = {
  /** 访问控制与认证模块 */
  Access: {
    /** 骑手账号密码登录页 */
    login: AUTH_ROUTES.rider,
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
    /** 配送任务详情页（指派确认、取餐、送达与异常上报） */
    taskDetail: '/pages-rider/delivery/task/detail',
  },

  /** 个人中心与账号模块 */
  Account: {
    /** 骑手个人中心首页（个人信息概览、统计报表、入口集合） */
    account: '/pages-rider/account/index/index',
    /** 骑手资料页（姓名、手机号、服务门店与配送站） */
    profile: '/pages-rider/account/profile/index',
    /** 接单规则与前台语音、震动提醒设置 */
    settings: '/pages-rider/account/settings/index',
  },
} as const
