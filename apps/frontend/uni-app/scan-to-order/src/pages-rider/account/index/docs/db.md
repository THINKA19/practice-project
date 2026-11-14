# 个人中心数据契约

本文件说明前端契约与数据归属，不代表后端表结构已经实现。

## 接口

GET /operator/rider/account

level: string；rating: number | null（0～5，未知显示 —）；completedCount: 非负整数。

## 状态所有权

use-overview.ts 拥有页面级概览、loading、error 和请求序号；页面关闭及换号清空。资料来自 account/profile，今日统计来自 delivery/task。

## Mock 与持久化

entry.mock.ts 经任务模块 mock/index.ts 读取完成量，由本模块 fixtures.ts 生成概览，不复制任务状态。

业务 Mock 为内存状态，重启开发页面后重置；共享会话由 session 管理。仅配送任务的提醒偏好通过既有 Pinia 持久化键保存，不在业务模块保存 token。真实数据库设计、调度任务和最终授权仍由后端实现。
