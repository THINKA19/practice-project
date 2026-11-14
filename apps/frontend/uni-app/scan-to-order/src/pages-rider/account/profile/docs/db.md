# 骑手资料数据契约

本文件说明前端契约与数据归属，不代表后端表结构已经实现。

## 接口

GET /operator/rider/profile；POST /operator/rider/profile/save

id、version、name、phone、joinedAt、serviceShops、station。保存体仅 version/name/phone，版本冲突拒绝覆盖。姓名非空最多 30 字；手机号 11 位。

## 状态所有权

useRiderProfileStore 维护版本化资料和保存锁。页面草稿在 use-page.ts；共享 session 资料只读，不写入第二份登录身份。

## Mock 与持久化

state.ts 按模拟账号维护资料，读取返回深拷贝，保存校验版本；entry.mock.ts 登记 reset。演示站点只能复制号码。

业务 Mock 为内存状态，重启开发页面后重置；共享会话由 session 管理。仅配送任务的提醒偏好通过既有 Pinia 持久化键保存，不在业务模块保存 token。真实数据库设计、调度任务和最终授权仍由后端实现。
