# 商家门店上下文与配置接口参考

核实日期：2026-10-11。来源：当前领域api/endpoints.ts、src/mock/modules/roles的手写处理器及回归测试。下列为本地模拟协议，不是已确认的生产接口或物理数据库结构。

MerchantShop: id、merchantId、name、roleTemplate、permissions、grantVersion、soundNotify。设置: shopId、version、form。

本领域模拟路径：

- /operator/shop/shops
- /operator/shop/grant
- /operator/shop/events
- /operator/shop/settings
- /operator/shop/settings/save

请求使用已认证角色token；商家业务请求同时携带shopId。写操作携带资源version，状态或版本冲突返回409，无门店或动作权限返回403，失效角色返回2000。模拟写入落盘失败会回滚并报错，不伪装成功。

生产待确认：账号认证与过期策略、商家和门店归属、岗位授权与可分配范围、数据库及事务、幂等键、实时事件协议、审计留存及目标平台能力。模拟权限和本地存储不构成生产安全边界。

> 路径说明（2026-10-18）：`/operator/*` 为前端约定的角色接口路径（原 `/__mock/*`），真实后端路径待确认；服务是否接通由能力开关 `VITE_ROLE_BACKEND_ENABLED` 控制。
