# 取餐一：独立测试页

底部入口 `/pages/pickup1/index/index` 使用独立演示订单 201，与正式取餐顾客订单无关，不读取 /order/list，不通过订单 ID 切换正式订单。

保留原有状态卡、商品卡、门店和配送信息样式。通过 GET /demo/pickup/detail 切换自提、配送、待付款、已完成场景；待付款打开原 OrderPaymentPopup，确认后请求 POST /demo/pickup/pay，成功才更新状态。失败保留待付款状态，可重试，不产生真实扣款。

本页提供进行中订单列表测试入口。场景及模拟操作只出现在测试页面，正式取号、取餐页面不依赖这些入口。详情测试接口及模型仍由本模块维护。

## Demo 基础版本复查（2026-10-24）

复查范围为详情的到店自取、配送中、待付款、已完成，列表的待取餐、制作中、无订单，以及核销确认与完成流程。提交支付或核销期间不再因页面刷新丢弃成功结果；页面销毁后不再发起新的列表请求。演示支付和核销仍以 Mock 响应为准，不代表真实交易或生产后端验收完成。

## 空状态与异常展示

无订单或加载失败时隐藏所有订单卡片，避免订单信息空壳。缺少下单时间显示暂未提供，可选关闭时间缺失时隐藏。门店信息请求失败不遮挡已获取的订单；不提供重试按钮。

状态展示采用已安装 Wot UI 的 `wd-empty` 和 `wd-loading`，业务操作由页面提供。

空状态使用页面剩余高度，不创建 z-paging 滚动容器；有数据时才启用列表或详情滚动。

公共状态统一接入 `src/components/page-state/index.vue`，通过 status 区分 loading、empty 和 error；加载固定为上方三点动画、下方统一加载文案。

## 当前目录与职责边界

本模块位于 `src/pages/pickup1/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `orderDetailApi`、`GoodsItem`、`LogisticsItem`、`OrderDetailData`、`OrderInfo`、`ShopSubItem`。
- 依赖领域：`@/pages/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/index.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-data.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `OrderDetail`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOrderDetail<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
