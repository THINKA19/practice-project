# 个人中心

页面入口仅为 `index.vue`，UI 放在 `components/`，页面逻辑为 `composables/use-page.ts`，跳转为 `composables/use-navigation.ts`。

反馈使用 `../feedback/index.vue`。会员码和会员中心使用 `../users/` 下正式页面；未接入功能只显示未开放提示。导航复用公共 navigate 和 pages/routes.ts 路径。

优惠券、余额、积分明细入口已接入 `../assets/` 下的正式页面，其他未接入功能显示未开放提示。开发环境中，顾客领券、兑换和模拟充值后，返回本页重新请求同一顾客的演示状态；初始样本为 3 张券、128.50 元和 260 积分，后续可随模拟操作变化。游客不加载账户资产。

账户资料读取正式 pages/auth/session，资产未接接口时显示占位符，核销权限未接入时隐藏。文案使用语言包 account 资源，菜单右侧显示折角符号。

整页通过固定 z-paging 容器进行内部滚动，关闭页面级滚动、自动请求、下拉刷新和加载更多，保留既有内容和样式。

历史反馈提交逻辑保留在反馈目录。会员模块迁移及服务接入范围见 [会员中心](../users/member-center/README.md) 与 [会员码](../users/user-code/README.md)。

资产摘要：通过既有 HTTP 调用本模块开发 Mock，有效客户会话返回 3 张券、128.50 元、260 积分，页面不展示演示说明和版本页脚。生产接口未接通，关闭开发 Mock 时不发起演示接口请求。首次加载使用占位块；无数据使用横杠占位；同账户刷新失败保留已有数字，不展示错误文字或重试按钮；进入页面自动刷新。换账户、退出和销毁后丢弃过期响应。金额契约见 models/types.ts，演示金额单位为分。


余额使用棕色渐变卡片和白色文字，优惠券、积分使用白色卡片；无数据不显示错误/空态文案。开发 Mock 摘要使用既有客户归属解析，支持页面刷新后仅恢复开发凭证的演示场景；只返回固定公开样本，不模拟真实服务授权。未登录或非顾客身份不请求账户资产，显示横杠占位。关闭 Mock 或生产环境不请求预览接口。每次进入账户页经 HTTP 重新获取摘要，禁用响应缓存，加载及无数据样式保持不变。

本页导航在进行中的跳转结束前合并连续点击，避免重复压入页面；成功或失败后均解除锁定。账户页独立回归覆盖各入口、组件渲染、内部滚动配置、资产刷新合并及账户隔离。

首页与“我的”共用 CustomerProfile：未登录显示默认头像和“授权登录”，点击打开 auth/login 公开导出的 WechatAuthorizationPanel；登录后点击头像或昵称打开本模块 components/ProfileEditor/index.vue。资料编辑逻辑在同目录 use-editor.ts，接口与字段在 api/profile.ts 和 models/types.ts。保存下方为灰色退出按钮，退出复用 Session。

小程序登录不申请手机号，提交独立微信登录 code；后端按微信身份建立账号。H5 继续使用原有微信登录页。

资料接口契约：GET/POST /user/profile，资料编辑仅包含 { gender: 'unknown' | 'male' | 'female', birthday: 'YYYY-MM-DD' | '' }。unknown 表示尚未选择，界面性别仅展示男、女。POST 必须按字段更新，不变更账号昵称、头像或历史手机号；身份资料和头像由登录后的 GET /user/info 返回，首页与我的读取同一 Session。

个人资料不提供头像、昵称或手机号编辑，也不展示开发说明和重新加载按钮。生日整行点击立即打开底部三列滚轮，固定列高、增大字号，确定才回填，取消不修改，支持清空；自动限制月份天数、闰年及未来日期。性别和生日选填。退出登录立即清理本地会话，请求服务端作废当前凭证，不清语言偏好，不自动重新登录。

开发数据源使用 /demo/customer/profile，按顾客 ID 隔离资料。Mock 后端会话、身份资料及选填资料通过独立 Pinia 数据源持久化，避免前端恢复登录而后端会话因重启丢失；不接受未签发或已过期凭证。旧版本遗留的无效会话遇到明确 401 时清理并提示重新登录，网络错误不清登录。登录弹窗在不同数据源下均显示正式标题、协议和授权登录按钮。Mock 数据含本地样例头像，不伪称真实微信头像；生产图片来自账号接口，真实微信头像获取受平台能力限制。

附件上传由本模块 api/upload.ts 实现，models/types.ts 校验响应，通过 index.ts 的 uploadAttachment 导出给反馈与订单使用。复用既有 Alova upload 模式、secondary 网关及 Session 鉴权。开发 Mock 和资料 Mock 合并登记在 mock/entry.mock.ts；上传仅返回 example.invalid 示例地址，不保存真实文件。未验证真实上传服务和设备能力。

## 当前目录与职责边界

本模块位于 `src/pages/account/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `CustomerProfile`、`code128Modules`、`encodeCode128`、`uploadAttachment`。
- 依赖领域：`@/pages/auth/session`、`@/pages/auth/login`、`@/pages/routes`
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
- `composables/use-assets-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-assets.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-attachment-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-navigation.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-profile-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `components/ProfileEditor/use-profile-editor.ts`：组件实例私有的交互状态，不接管领域共享状态。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Account`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useAccount<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
