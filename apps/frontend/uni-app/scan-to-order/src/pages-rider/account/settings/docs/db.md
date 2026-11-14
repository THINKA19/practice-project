# 接单规则与提醒设置数据契约

本文件说明前端契约与数据归属，不代表后端表结构已经实现。

## 接口

GET /operator/rider/rules

maxConcurrent: 正整数；assignmentTimeoutSeconds: 非负秒数；serviceShops、rules。规则只读，不将本地配置当作后端限制。

## 状态所有权

use-rules.ts 管理当前页读取状态；声音与震动由 delivery/task 的提醒模块拥有，页面不维护重复偏好。

## Mock 与持久化

fixtures.ts 提供演示规则，entry.mock.ts 通过本模块读取函数校验身份。指派超时仅展示规则，模拟后端尚未实现自动回收调度。

业务 Mock 为内存状态，重启开发页面后重置；共享会话由 session 管理。仅配送任务的提醒偏好通过既有 Pinia 持久化键保存，不在业务模块保存 token。真实数据库设计、调度任务和最终授权仍由后端实现。
