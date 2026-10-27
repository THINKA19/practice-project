# 联系客服

页面 `/pages/account/profile/contact/index`，由个人中心、关于我们及售后入口访问。页面仅装配视图，业务逻辑在 composables/use-config.ts。

- `api/endpoints.ts` 与 `api/contact.ts`：GET /service/config，复用公共 Alova。
- `models/types.ts`：多渠道配置与旧字段兼容，校验二维码地址和联系链接。
- `mock/entry.mock.ts`：通过既有发现规则登记微信、公众号、QQ、QQ群、Telegram、Facebook、X、WhatsApp、Instagram 九种演示配置；对应静态二维码在 src/static/images/contact-demo/，只编码演示文本或保留域名示例链接。
- `index.ts`：公开类型入口，不暴露页面内部状态。
- `docs/db.md`：接口字段、旧字段兼容与后端待确认项。
- `__tests__/`：配置边界、生命周期、复制/预览/拨号与真实 Mock 请求链路。

支持按后台配置添加其他渠道。二维码可点击预览，账号及 HTTP(S) 联系链接可复制，H5/App 可打开真实公开链接，演示链接不执行跳转；缺失配置不显示空按钮。电话在各端均可确认拨打。微信原生客服仅在 MP-WEIXIN 且后台明确启用时展示。加载失败、空配置、图片失败均有独立状态；刷新失败保留已有有效配置。

Mock 的账号和二维码已明确标识演示，不能添加真实客服。正式账号、官方二维码、后台字段与微信原生客服配置需联调和真机验证。

验证：`pnpm test:run src/pages/account/profile/contact`，`pnpm exec eslint src/pages/account/profile/contact`，`pnpm build:h5`，`pnpm build:mp`。

页面按配置顺序显示渠道，推荐客服默认展开，其他渠道收起；复制按钮紧凑，二维码居中，点击图片放大，删除独立查看二维码按钮。Facebook 区分主页与 Messenger 联系入口，X/Instagram 按主页展示。

海外申请、账号配置、上线验证及运营建议见 [docs/overseas-channels.md](./docs/overseas-channels.md)。本次没有创建外部账号或发布社交内容。

## 当前目录与职责边界

本模块位于 `src/pages/account/profile/contact`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `ContactChannel`、`ContactKind`、`ServiceConfig`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
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
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-config.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Contact`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useContact<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
