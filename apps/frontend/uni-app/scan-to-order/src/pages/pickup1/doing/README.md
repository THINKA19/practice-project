# 进行中订单列表测试

取餐一通过列表演示入口打开 `/pages/pickup1/doing/index`。保留原卡片样式，调用 GET /demo/pickup/list；不改为读取正式顾客订单接口。

顶部只保留待取餐、制作中、无订单，默认待取餐；选中项为按钮，未选中项为文字。列表纵向滚动，制作中不显示取餐码和核销入口。待取餐携带 hxNumber 和 demo=1 进入模拟核销，仅开发 Mock 开启且顾客登录时可操作；生产环境不开放模拟核销。

Mock 层保留列表场景与核销联动测试。此列表属于取餐一测试功能，不作为正式取号、取餐业务入口。

模拟核销使用独立 backend，成功后本列表移除相应订单，不改变正式取餐 Mock 的核销状态。多订单和失败样本仅保留在接口测试中。

待取餐、制作中使用不同订单 ID 和固定履约状态，场景按钮只筛选，不改写订单。核销只完成指定的可取餐订单，不影响制作中订单；制作中订单在 Mock 接口与页面均禁止核销。已完成状态保留供核销详情查询，无订单场景始终为空。状态在开发进程重启后重置。

## 空状态与异常展示

无订单时显示演示空状态，可继续切换上方场景；空数组和空值均处理为空列表。加载失败不显示无订单，不提供重试按钮。

状态展示采用已安装 Wot UI 的 `wd-empty` 和 `wd-loading`，业务操作由页面提供。

空状态使用页面剩余高度，不创建 z-paging 滚动容器；有数据时才启用列表或详情滚动。

公共状态统一接入 `src/components/page-state/index.vue`，通过 status 区分 loading、empty 和 error；加载固定为上方三点动画、下方统一加载文案。

## 当前目录与职责边界

本模块位于 `src/pages/pickup1/doing`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `useOrderDoingList`。
- 依赖领域：`@/pages/pickup/shared`、`@/pages/routes`
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
- `composables/use-list.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `OrderDoing`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOrderDoing<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
