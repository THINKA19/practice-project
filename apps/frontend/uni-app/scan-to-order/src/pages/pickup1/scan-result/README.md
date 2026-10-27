# 核销结果

查询核销码对应订单并提交核销。

页面：`/pages/pickup1/scan-result/index?hxNumber=MOCK-PICKUP-101`。公开入口：`index.ts`（scanApi、ScanOrderDetail）。

## 职责

- `index.vue`：页面配置、生命周期与装配。
- `components/`：有实际需要时存放本领域 UI。
- `composables/`：响应式状态、请求编排和生命周期。
- `models/`：有本地契约时存放类型、枚举、转换和纯规则；不保留旧 type.ts 转发入口。
- `api/`：有本领域接口时提供请求函数，路径只定义在 endpoints.ts，复用 Alova。
- `mock/`：有本领域接口时提供独立模拟入口与样本；由全局 Mock 清单登记，页面和运行时公共入口不导入 Mock。

共享已有业务能力时从所属模块 index.ts 引入，不为了目录齐全复制 API/模型或创建空目录。没有当前需求的 storage/domain/adapters 不创建。

## 数据与验证边界

hxNumber 必须为非空字符串。仅状态 1/2 可提交，提交锁阻止重复点击。Mock 与取餐列表共享核销状态；未知码和重复核销失败，成功后订单从进行中列表移除。Mock 按请求凭证隔离、刷新开发进程后重置。真实核销权限需后端校验。

开发环境设置 VITE_USE_MOCK=true 并重启；生产构建强制关闭 Mock，关闭后请求真实后端。Mock 不是生产数据或真实支付/履约结果。请求错误复用 HTTP 提示，模型以 [接口说明](./docs/db.md) 为准。

## 当前入口与行为

正式入口携带 hxNumber，要求门店身份；没有核销码不会加载样单。仅开发 Mock 开启时识别 demo=1，此模式要求顾客登录，调用独立的 GET /demo/pickup/verification/detail 与 POST /demo/pickup/verification/confirm，不调用正式核销接口。模拟核销成功后查询完成状态，返回演示列表后移除该订单，演示状态与正式取餐 Mock 分开。

核销前展示待确认信息，只有核销成功或查询到已完成状态才显示完成对勾。提交防重，失败可重试；切换核销码、账号或销毁页面后忽略旧响应。真实服务端必须校验员工所属门店、订单归属、已支付且可核销状态，并原子更新订单和记录核销人/时间；这些服务端行为尚未联调，前端身份检查不能代替授权。

演示核销完成后提供“返回订单列表”：优先返回已有列表并触发 onShow 刷新；直接打开核销链接时替换为列表页。制作中订单不可核销，完成当前订单不会清空其他制作中订单。

## 当前目录与职责边界

本模块位于 `src/pages/pickup1/scan-result`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/pickup1/scan`、`@/pages/routes`、`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/index.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-detail.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `ScanResult`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useScanResult<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 核销请求边界

核销提交锁同时绑定请求版本、会话版本和核销码；重新查询相同核销码后，旧请求结束也不能解除新请求的锁。前端准入不代替服务端的门店、订单与操作授权。
