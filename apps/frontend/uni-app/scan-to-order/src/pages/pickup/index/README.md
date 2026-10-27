# 取餐进度

按订单纵向展示制作中、自提和配送信息、取餐号与二维码。商品明细、金额、配送信息和取餐码直接在订单卡片内展示，登录状态和请求沿用顾客业务接口。正式取餐不跳转到取餐一测试页。

页面：`/pages/pickup/index/index`。公开入口：`index.ts`（pickupApi、usePickupOrders 和订单模型）。

## 职责

- `index.vue`：页面配置、生命周期与装配。
- `components/`：有实际需要时存放本领域 UI。
- `composables/`：响应式状态、请求编排和生命周期。
- `models/`：有本地契约时存放类型、枚举、转换和纯规则；不保留旧 type.ts 转发入口。
- `api/`：有本领域接口时提供请求函数，路径只定义在 endpoints.ts，复用 Alova。
- `mock/`：有本领域接口时提供独立模拟入口与样本；由全局 Mock 清单登记，页面和运行时公共入口不导入 Mock。

共享已有业务能力时从所属模块 index.ts 引入，不为了目录齐全复制 API/模型或创建空目录。没有当前需求的 storage/domain/adapters 不创建。

## 数据与验证边界

orderList：订单列表；goodsMap、logisticsMap：按订单 ID 索引。id 为订单标识，hxNumber 为核销码，qudanhao 为取餐号，isNeedLogistics 为配送标记，amountReal 为实付。客户登录后查询，登出刷新清空状态；迟到响应和销毁页面不写回。

开发环境设置 VITE_USE_MOCK=true 并重启；生产构建强制关闭 Mock，关闭后请求真实后端。Mock 不是生产数据或真实支付/履约结果。请求错误复用 HTTP 提示，模型以 [接口说明](./docs/db.md) 为准。

页面内容使用可用全宽，不设置桌面最大宽度。页面关闭外层滚动；纵向内容由内部 z-paging 承载，背景覆盖导航栏与底部菜单之间的区域。所有订单共用一个内部 z-paging 纵向滚动，不使用轮播或按履约方式切换。

## 页面状态

未登录/非顾客身份显示登录入口；加载、请求失败和接口成功无订单分别展示。页面显示时刷新，不提供手动刷新进度按钮。顶部按取餐号、配送中筛选订单，选中项显示棕色按钮，未选中项显示棕色文字。订单 fulfillment 可为 preparing/ready/delivering，未提供则保持原自提/配送展示；制作中不展示核销码。

多订单、制作中、待取餐、空订单和失败场景保留在 Mock 接口与测试中，顾客页面不提供场景切换或模拟核销入口。

## 复盘状态（2026-10-24）

已复盘自提/配送筛选、制作中隐藏核销码、商品与配送信息、登录/失败/空状态及会话切换与页面销毁后的迟到响应隔离。刷新前重新检查登录凭证时间，过期会话显示登录入口。当前进度在页面显示时刷新，没有实时订阅或定时轮询；后端状态、核销授权和真实履约仍需联调，Mock 闭环不代表生产履约已完成。

## 空状态与异常展示

统一空状态区分全部无订单与当前自取/配送分类为空；请求失败不显示无订单或去点餐。仅未登录时提供登录操作，成功无订单保留去点餐，不提供重试按钮。

状态展示采用已安装 Wot UI 的 `wd-empty` 和 `wd-loading`，业务操作由页面提供。

公共状态统一接入 `src/components/page-state/index.vue`，通过 status 区分 loading、empty 和 error；加载固定为上方三点动画、下方统一加载文案。

## 当前目录与职责边界

本模块位于 `src/pages/pickup/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/pickup/shared`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Pickup`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `usePickup<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
