# 商家配送与指派接口参考

配送联系页面读取 `/operator/shop/delivery` 响应中的可选 `contacts`。每项包含 `id`、`name`、`phone`，以及可选的 `role` 和 `avatarUrl`。生产服务应按当前门店和账号权限返回授权可联系的人员或配送方。旧响应缺少该字段时显示空状态，页面不从可派单骑手列表推断通讯录。以下指派接口为既有模拟协议，配送联系页面仅调用读取接口。

核实日期：2026-10-11。来源：当前领域api/endpoints.ts、src/mock/modules/roles的手写处理器及回归测试。下列为本地模拟协议，不是已确认的生产接口或物理数据库结构。

RoleTask: id、orderId、shopId、riderId、status、version、assignedAt、settledAt、deliveryFee、exception。AvailableRider: id、online、load、maxConcurrent。

本领域模拟路径：

- /operator/shop/delivery
- /operator/shop/delivery/dispatch
- /operator/shop/delivery/withdraw

请求使用已认证角色token；商家业务请求同时携带shopId。写操作携带资源version，状态或版本冲突返回409，无门店或动作权限返回403，失效角色返回2000。模拟写入落盘失败会回滚并报错，不伪装成功。

生产待确认：账号认证与过期策略、商家和门店归属、岗位授权与可分配范围、数据库及事务、幂等键、实时事件协议、审计留存及目标平台能力。模拟权限和本地存储不构成生产安全边界。

> 路径说明（2026-10-18）：`/operator/*` 为前端约定的角色接口路径（原 `/__mock/*`），真实后端路径待确认；服务是否接通由能力开关 `VITE_ROLE_BACKEND_ENABLED` 控制。
