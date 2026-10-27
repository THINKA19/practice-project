# 优惠买单

页面 /pages/account/services/bill-pay/index。保留原金额输入、优惠列表与确认弹层；composables 管理 UI，models/types.ts 按分校验与试算，api/bill.ts 负责请求。

输入必须大于零，最多两位小数；拒绝 NaN、Infinity、科学计数法与负值。选择可用优惠金额最大的规则，不排序修改原列表，优惠不会使实付为负。确认后金额快照不随输入改变；提交锁与请求幂等键防重复，换号与销毁忽略旧响应。

目前只有开发 Mock 模拟买单，界面明确标注，不扣钱包、不调用微信支付。正式环境禁用买单提交。原代码的固定余额、任意成功弹窗和失效资产跳转已移除。

真实门店选择、优惠查询、服务端试算、余额扣款、微信支付凭证、回调与订单查询契约待后端提供。不能把演示完成作为真实支付完成。详见 docs/db.md。

优惠卡片每行两张，卡片内按优惠金额、优惠说明、使用门槛上下排列。点击查看门槛与适用情况；输入消费金额后自动匹配最大单条满减，显示还差金额或已自动使用。点击卡片不会修改实际消费金额，也不叠加优惠。

## 当前目录与职责边界

本模块位于 `src/pages/account/services/bill-pay`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
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
- `composables/index.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-payment.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-discounts.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `BillPay`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useBillPay<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 账号与确认单隔离

消费金额、优惠报价、说明和请求号属于当前会话。换号时全部清理，旧支付响应不能恢复确认单或解除新提交的锁。同一会话结果不明时仍保留原金额和幂等键供核对重试。
