# 订单售后

退款申请表单、凭证上传、历史记录和退货物流。

## 目录与入口

- `composables/`：页面响应式逻辑及业务流程。
- `components/`：本模块专属 UI。
- `index.ts`：仅向外导出实际使用的能力，其他模块不能导入内部文件。

页面路由：`/pages/account/profile/order-refund-apply/index`。

## 依赖与业务边界

`pages/account/profile/order`、正式客服页面。业务请求保持原有参数、认证、网关和空结果处理。页面临时状态由 composables 拥有，共享状态由唯一 store 拥有，服务端仍是业务事实来源。

orderId/orderGoodsId 区分整单与商品级申请；后端是否允许整单操作以接口为准。数量/金额的前端约束仅用于交互，最终可退金额须后端计算。附件上传成功不代表退款申请成功；物流提交不代表退款到账。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

当前依赖边界、服务接入限制和验证方法见 [profile 迁移说明](../README.md)。本模块未做真实后端或真机验收。

## 当前目录与职责边界

本模块位于 `src/pages/account/profile/order-refund-apply`。页面入口仅接入页面配置、组件及组合函数；页面路径已随目录改名，订单入口通过 `ClientRoutes.Account.refundApply` 跳转并携带订单编号。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/account/profile/order`、`@/pages/routes`、`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-detail.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-form.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `OrderRefundApply`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOrderRefundApply<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 提交与资料隔离

售后提交固定订单、商品、数量、金额、类型、原因和附件快照，上传期间的编辑不改变当前申请。订单及售后历史一并读取成功后才更新列表，历史请求失败不按“没有记录”处理；旧请求和旧错误弹窗不能操作新会话。换号时清除凭证图片、寄回物流和表单草稿。

## 页面与开发流程

从我的订单进入，携带 id；无编号显示返回订单入口的提示，加载失败保留重试。页面标题及表单、详情、物流文案维护在 locale 的 refund 节点（三语）。提交后可从订单的查看售后进入历史记录并撤销。开发 Mock 只模拟待审核申请及撤销，按账户、订单与商品隔离，不执行真实退款或自动审批，未审核申请不支持填写寄回物流。
