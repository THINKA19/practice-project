# 商家入驻申请

保留联系人、电话、说明与最多九个附件的表单。入驻申请和上传使用 VITE_SHOP_ONBOARDING_URL、VITE_SHOP_ONBOARDING_UPLOAD_URL，未配置时明确拒绝提交。

逐个上传附件，任一失败就终止并保留表单，提交期间防重复操作。请求复用项目 HTTP；不通过不存在的 shared/media 或历史 comment/add 路径调用。

当前表单只收集申请，不代表自动审批或创建门店；真实后端契约需联调。

## 提交与生命周期

提交开始时固定联系人、电话、说明和附件路径，上传期间编辑草稿不改变当前申请。附件失败保留输入供重试；成功后在延时返回完成前保持提交锁。换号或销毁时清理草稿、当前页面的加载提示和返回定时器，停止后续附件及申请请求，忽略已发出请求的迟到结果。

## 当前目录与职责边界

本模块位于 `src/pages-shop/onboarding`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Onboarding`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOnboarding<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
