# 商家门店权限

通过 session 只读状态获得商家身份和 token。服务端授予的 merchantId、shopId、成员角色和具体 permissions 决定操作权限。

VITE_SHOP_SHOPS_URL、VITE_SHOP_GRANT_URL、VITE_SHOP_INVITE_URL 分别配置门店列表、门店授权和邀请接口。未配置时明确拒绝请求，不使用顾客权限替代。没有选中门店或权限刷新失败时不放行。

换账号清空上下文；切店乱序只保留最后选择；capture/matches 用于丢弃旧门店请求结果。最近门店按用户 ID 存储；权限始终从后端重取。

## 当前目录与职责边界

本模块位于 `src/pages-shop/auth/permissions`。本模块提供复用能力，不为凑目录创建页面。

- 页面入口：无独立页面。
- 对外能力：经 `index.ts` 导出 `acceptStaffInvite`、`useMerchantPage`、`useMerchantShopStore`、`MerchantShop`、`ShopRequestContext`。
- 依赖领域：`@/pages/auth/session`、`@/pages-shop/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `storage/`：本领域的持久化读写、格式校验与恢复。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-invite-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-grants.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-shop-store.ts`：本领域跨页共享状态；通过公开命令修改。
- `storage/`：持久化机制；账号、门店和请求版本的隔离由所属业务流程负责。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Merchant`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useMerchant<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
