# 骑手资格与权限数据契约

本文件说明前端契约与数据归属，不代表后端表结构已经实现。

## 接口

GET /operator/rider/permissions

riderId: 当前会话 userId 的字符串形式；qualified: boolean；permissions: string[]。实际业务后端仍须检查身份、门店、任务归属和版本。

## 状态所有权

useRiderPermissionsStore 存在本模块 composables/use-store.ts。每个任务写动作先刷新权限，再核对当前账号、资格和具体 permission；权限失败按拒绝处理。

## Mock 与持久化

fixtures.ts 创建账号专属的演示权限；entry.mock.ts 从模拟会话识别 riderId。模拟权限不代表真实账号获得生产授权。

业务 Mock 为内存状态，重启开发页面后重置；共享会话由 session 管理。仅配送任务的提醒偏好通过既有 Pinia 持久化键保存，不在业务模块保存 token。真实数据库设计、调度任务和最终授权仍由后端实现。
