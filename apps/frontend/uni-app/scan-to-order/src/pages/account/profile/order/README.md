# 订单模块

聚合我的订单列表、详情、页面组件、页面流程、API、Mock、类型、规则和测试。售后页面通过本模块公开入口复用订单能力。

## 目录与入口

- `api/`：业务接口；路径集中在 endpoints.ts。
- `models/`：类型、枚举、数据转换与纯规则。
- `composables/`：页面响应式逻辑及业务流程。
- `index.ts`：仅向外导出实际使用的能力，其他模块不能导入内部文件。
- `index.vue`：我的订单列表，路由 `/pages/account/profile/order/index`。
- `detail.vue`：订单详情，路由 `/pages/account/profile/order/detail`。
- `components/`：订单卡片与空状态。
- `mock/`：本模块开发接口处理和按账户隔离的样本。
- `__tests__/`：页面、分类、规则、API 契约与 Mock 请求链测试。

原 `all-orders` 列表页已合并到本模块，不保留旧页面或兼容转发；个人中心通过 `ClientRoutes.Account.allOrders` 打开列表。

## 我的订单开发预览

页面入口为 `index.vue`。分类栏使用浅米色背景，列表使用浅桃色背景与白色卡片；标题栏保持白底、常规字重，分类默认黑色，选中沿用棕色主题。

开发环境 `VITE_USE_MOCK=true` 时，使用顾客演示账户登录后，`mock/entry.mock.ts` 通过现有公共请求链返回七条订单，覆盖四种履约分类及待付款、待取餐、配送中、待评价、完成和取消状态。商品使用开发照片 URL（正式环境需使用商品服务返回的图片及已配置域名），列表与详情共享商品数据。订单状态按账户隔离，开发服务重启后恢复初始样本。

页面统一使用正式取消、删除、余额支付与售后入口，不再根据 demo 标记切换支付或售后流程。当前 Mock 余额接口明确拒绝扣款；微信支付收银台尚未接入，不能视为真实支付闭环。历史 demoAction 仅保留开发测试兼容。联系演示商家不会拨打未确认的号码。

首次请求成功后才显示订单空态。未登录进入列表时只显示登录提示，不查询订单，也不自动跳转；点击“去登录”才引导微信登录，取消返回仍保留提示。登录按钮使用与收货地址入口一致的珊瑚色渐变。订单详情保留用于查看完整商品与订单凭证，列表不展示门店招牌大图。

无实际调用的历史桌台类型及导出已删除；当前模块不包含历史 `use-table-order-page.ts` 流程。

## 依赖与业务边界

`pages/account/asset`、订单列表局部余额支付、`pages/auth/session`。业务请求保持原有参数、认证、网关和空结果处理。页面临时状态由 composables 拥有，共享状态由唯一 store 拥有，服务端仍是业务事实来源。

orderId 与 orderGoodsId 分别标识订单和订单商品。现有结算页试算发送 calculate: 'true'，正式提交省略 calculate 字段，不能把试算响应当成创建成功。close、delete、pay、delivery、hx 含义不同。退款申请不等于退款已到账；取消订单是否回库存/退券、删除是否软删、支付及退款事务待确认。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

当前依赖边界、服务接入限制和验证方法见 [profile 迁移说明](../README.md)。本模块未做真实后端或真机验收。

图片由模块内 OrderImage 统一处理：加载中显示文字，缺失或失败显示暖色占位；URL 变化后重新加载。详情门店照片使用 orderInfo.shopImage（可选 URL，需后端确认此字段映射），Mock 提供网络照片样本；履约方式读取 orderType。列表店名仅展示，状态及商品区域进入订单详情，操作按钮独立执行。

## 当前目录与职责边界

本模块位于 `src/pages/account/profile/order`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`detail.vue`、`index.vue`
- 对外能力：经 `index.ts` 导出 `orderApi`、`uploadOrderFile`、`attachRefundGoods`、`canApplyRefund`、`canCallShop`、`canCancel`、`canConfirmReceive`、`canDeleteInList`、`canEvaluate`、`canPay`、`fullAddress`、`logisticsOf`、`orderIdFromPayNextAction`、`orderListStatusKey`、`Order`、`OrderDetail`、`OrderGoods`、`OrderGoodsCoupon`、`OrderLogistics`、`RefundableGoods`、`RefundApplyRecord`、`ReputationItem`、`ReputationLevel`。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`、`@/pages/account/assets/asset`、`@/pages/account/index`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-list-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-detail-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-pay.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Order`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOrder<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
