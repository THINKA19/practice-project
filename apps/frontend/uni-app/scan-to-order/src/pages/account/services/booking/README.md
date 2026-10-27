# 预约订座

从个人中心或取号页“预约订座”打开 /pages/account/services/booking/index?yuyueId=demo-booking。优先使用调用方提供的活动 ID，缺省时通过 bookingApi.info() 查询，不从已删除的 shared/settings 读取配置。

页面使用内部 z-paging 展示联系人、电话、到店时间和用餐人数。游客可查看表单，提交时检查顾客登录身份；未登录打开现有 /pages/auth/login。

api/endpoints.ts 定义 POST /yuyue/join；models/types.ts 拥有表单类型、人数选项与转换规则；composables/ 拥有表单和提交状态。日期弹层使用 root-portal 和独立层级。

mock/ 为独立模拟入口，校验参数后表示模拟接受报名，不代表真实占座。真实预约仍需有效活动 ID、登录服务及门店确认。

详见 [接口与字段](./docs/db.md)。

预约提交拒绝空白联系人、无效或已过期日期及非十分钟档；每次打开日期选择器更新下限。换账号清除联系人和选择时间，离开页面或换账号后忽略旧提交响应，缺失响应不显示成功。

## 当前目录与职责边界

本模块位于 `src/pages/account/services/booking`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

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
- `composables/use-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-form.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Booking`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useBooking<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
