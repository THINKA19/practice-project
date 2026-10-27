# 扫码核销

页面：/pages/account/services/scan-result/index，支持 hxNumber 参数。入口为个人中心常用功能中的“扫码核销”。

## 文件职责

- index.vue：页面声明、生命周期装配与展示。
- composables/use-detail.ts：扫码、查询、确认、登录引导及异步状态。
- api/verification.ts：调用订单模块公开 scanApi，并转换接口响应。
- models/types.ts：页面模型、参数归一化、响应校验与状态规则。
- index.ts：明确本页面没有对外公开能力，不导出内部文件。
- __tests__/：规则、接口边界与页面流程测试。
- docs/db.md：接口所有权、字段、权限和 Mock 边界。

## 使用与边界

需要门店账号；先查询订单、核对商品，再确认核销。H5 手动输入，小程序/App 使用相机扫码；不会执行二维码 URL。切换身份和销毁后忽略旧响应，失败不显示成功。

底层订单接口和 Mock 复用 pickup1/scan-result 的公开能力，不维护第二份端点和 Mock。前端身份检查不替代服务端门店授权；真实服务与相机行为尚未验证。详见 [接口与字段](./docs/db.md)。

已登录顾客点击扫码、查询或确认时提示门店身份要求，保留当前会话，不自动跳转到门店登录；游客操作仍引导门店登录。

## 当前目录与职责边界

本模块位于 `src/pages/account/services/scan-result`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/pickup1/scan`、`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `adapters/`：外部系统或其他领域公共协议的适配；普通 DTO 转换不放在这里。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-detail.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `OrderVerification`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useOrderVerification<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
