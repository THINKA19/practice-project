# 优惠券

index.vue 包含可领、已领、失效和券号兑换四个标签；components 展示券卡片与领取口令框，composables 拆分列表装配、领取和兑换，api 复用公共 Alova，models 校验返回值和映射业务错误码。

列表 15 条分页，不足一屏自动补页，底部仅作滚动提示，支持下拉刷新、触底追加、错误重试。切标签、切账户和销毁后忽略旧响应。领取支持口令券、重复提交保护、业务码提示；领取中显示反馈，成功立即变灰禁用，不重置已加载列表，重新进入由接口返回已领取状态。兑换保留原代码成功后不清空输入的行为；切换账户清空敏感输入。个人操作要求顾客身份。

去使用：通用券跳已存在的点餐页；范围券沿原代码跳选店页（peisongType=zq），不跳已删除的商品页面。分享使用正式优惠券路径和当前顾客会话中的 inviter_id，不直接读取旧存储键。

开发 Mock 的固定券池和个人券样本可供游客预览，写操作仍要求顾客登录；口令 DEMO，兑换券号 DEMO2026、密码 DEMO。开发样本不等于生产授权。正式接口尚未联调，详见 docs/db.md 与 ../README.md。

## 当前目录与职责边界

本模块位于 `src/pages/account/assets/coupons`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `couponApi`、`couponDateOnly`、`couponFetchErrorKey`、`couponUseTarget`、`CouponStatistics`。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`
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
- `composables/use-exchange.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-fetch.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Coupon`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useCoupon<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
