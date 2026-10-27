# 排队取号

查询桌型、领取号码、展示当前用户排队记录。

页面：`/pages/queue/index/index`。公开入口：`index.ts`（queueApi）。

## 职责

- `index.vue`：页面配置、生命周期与装配。
- `components/`：有实际需要时存放本领域 UI。
- `composables/`：响应式状态、请求编排和生命周期。
- `models/`：有本地契约时存放类型、枚举、转换和纯规则；不保留旧 type.ts 转发入口。
- `api/`：有本领域接口时提供请求函数，路径只定义在 endpoints.ts，复用 Alova。
- `mock/`：有本领域接口时提供独立模拟入口与样本；由全局 Mock 清单登记，页面和运行时公共入口不导入 Mock。

共享已有业务能力时从所属模块 index.ts 引入，不为了目录齐全复制 API/模型或创建空目录。没有当前需求的 storage/domain/adapters 不创建。

## 数据与验证边界

id/typeId：桌型或记录标识；number：我的号；curNumber：当前叫号；minitus：每号预计分钟数（保留接口拼写）。等待时间规则位于 models/types.ts。Mock 按凭证隔离顾客记录，同一顾客只允许一个有效排队号，发号序列按桌型共享。

开发环境设置 VITE_USE_MOCK=true 并重启；生产构建强制关闭 Mock，关闭后请求真实后端。Mock 不是生产数据或真实支付/履约结果。请求错误复用 HTTP 提示，模型以 [接口说明](./docs/db.md) 为准。

页面内容使用可用全宽，不设置桌面最大宽度。页面关闭外层滚动；纵向内容由内部 z-paging 承载，背景覆盖导航栏与底部菜单之间的区域。

本页号码用于排队等桌，与订单取餐号不是同一种记录；当前没有领取排队号后自动创建订单或取餐号的流程。订单取餐进度由取餐页通过订单接口独立读取。

## 复盘状态（2026-10-24）

已复盘桌型查询、取号、重复领取限制、暂停取号、我的号码、取消、等待时间和请求失败重试。页面销毁后，未完成的取号或取消请求不会再提示成功或触发刷新。页面只在显示或手动刷新时同步状态，没有实时叫号订阅。

顾客页面使用 /queuing/types、/queuing/my、/queuing/get 和 /queuing/cancel；Mock 已覆盖领取与取消闭环。独立演示接口保留叫号、过号和入座测试能力，当前页面不提供这些店员操作。真实门店、取消接口与叫号契约仍需后端联调确认，不能据此标记生产履约完成。

进入取号演示与执行其操作同样要求有效顾客会话，不再允许游客模拟领取号码。

## 空状态与异常展示

取号类型与个人记录独立处理失败，保留成功获取的另一部分。个人记录无法获取时暂不允许领取新号，避免重复领取。空列表与失败使用不同文案，不提供重试按钮；重新进入页面刷新。

状态展示采用已安装 Wot UI 的 `wd-empty` 和 `wd-loading`，业务操作由页面提供。

空状态使用页面剩余高度，不创建 z-paging 滚动容器；有数据时才启用列表或详情滚动。

公共状态统一接入 `src/components/page-state/index.vue`，通过 status 区分 loading、empty 和 error；加载固定为上方三点动画、下方统一加载文案。

## 当前目录与职责边界

本模块位于 `src/pages/queue/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `queueApi`、`MyQueueRecord`、`MyQueueView`、`QueueAction`、`QueueSnapshot`、`QueueType`。
- 依赖领域：`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Queue`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useQueue<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 排队操作隔离

换号时释放旧账号的本地取号锁并重新读取记录。旧账号请求完成后不能提示成功、刷新新账号页面或清除新取号操作的锁；服务端仍负责重复取号判定。
