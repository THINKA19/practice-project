# 骑手工作台数据契约

本文件说明前端契约与数据归属，不代表后端表结构已经实现。

## 接口

GET /operator/rider/workspace

announcement: string；incomeTarget: 正数 | null。null 隐藏参考进度，不能视为保底收入。

## 状态所有权

use-overview.ts 只维护工作台配置。任务快照、上下线和动作来自 delivery/task；姓名来自 account/profile。下拉刷新同时读取任务与配置。

## Mock 与持久化

fixtures.ts 提供演示公告和 120 元参考目标，entry.mock.ts 校验骑手会话。

业务 Mock 为内存状态，重启开发页面后重置；共享会话由 session 管理。仅配送任务的提醒偏好通过既有 Pinia 持久化键保存，不在业务模块保存 token。真实数据库设计、调度任务和最终授权仍由后端实现。
