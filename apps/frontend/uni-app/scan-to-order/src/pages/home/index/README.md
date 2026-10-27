# 首页横幅

首页入口、横幅展示、语言切换和分享。

## 目录与入口

- `api/`：业务接口；路径集中在 endpoints.ts。
- `models/`：类型、枚举、数据转换与纯规则。
- `composables/`：页面响应式逻辑及业务流程。
- `components/`：本模块专属 UI。
- `index.ts`：仅向外导出实际使用的能力，其他模块不能导入内部文件。

页面路由保持：`/pages/home/index/index`。

## 依赖与业务边界

遵循项目 AGENTS.md、docs/ai/脚手架保护与参考代码使用规范.md 及 .agents/skills/uniapp-business-development/SKILL.md。

保留 useHomePage 外观层和四个子 composable。通过 pages/auth/session 的公开只读状态和命令获取用户及会话，复用 http/alova，不引入 hooks/shared、utils/shared 或已删除的 shared/infrastructure 模块。首页直接渲染 components/language-switcher/index.vue，语言菜单、状态和图标均由该组件负责，不另建选择器。

轮播通过现有 Alova 调用 GET /banner/list?type=shouye，使用 ignoreAuth 元数据。开发环境 VITE_USE_MOCK=true 时，由全局清单登记的本模块 mock/banner/handlers.ts 返回 src/mock/assets/images/home/banner 下的 01.jpeg、02.jpeg、03.jpeg；图片不设置跳转目标。其他类型返回空数组。生产环境或关闭 Mock 后走真实服务，真实接口仍待联调；失败或空数据不展示轮播。目前仅处理应用内链接，外链提示暂不支持。

分享使用当前首页 TEA WORK 品牌文字；仅有效登录用户附带 userId 邀请参数，未接入旧配置中心及分享图片。

## 本次测试入口

- user/member-center/index.vue：会员中心。
- user/coupons/index.vue：优惠券。
- service/favorites/index.vue：收藏。
- 礼品卡：已接入 `ClientRoutes.Home.card` 对应的正式 `home/service/gift-card/index`，不再使用首页测试占位页。
- service/group-buying/index.vue：团购。
- service/welfare/index.vue：福利。

其余测试路径相对 pages/home，显示测试标题及进入成功文字。会员中心和礼品卡已使用所属业务的正式页面；页面由 UniPages 自动注册，路径统一由 pages/routes.ts 维护。

门店选择通过 ClientRoutes.Ordering.shopSelect 进入 /pages/ordering/shop/select 测试页，并传 peisongType=zq 或 kd，分别显示到店自取、外卖配送。测试页不请求门店数据；缺失或非法参数显示入口提示。关于仍指向尚未实现的 /pages/me/setting/about/index，跳转失败时显示通用的本地化导航失败提示。index11 仅参考入口语义，已排除页面扫描，不参与首页运行。

首页原静态服务图片已缺失，改用现有 Carbon 图标；语言图标复用已有语言组件资源。

banner/list 以 type 区分首页 shouye、点餐 diancang、礼品卡 card。picUrl 为图片，linkUrl 为跳转目标。横幅的发布审核、过期与点击统计不在当前前端契约中。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

## 导航与反馈

`composables/use-navigation.ts` 负责首页业务目标和失败提示，通过 `utils/project/navigation.ts` 执行跳转，使用 `utils/project/feedback.ts` 展示文字。轮播复用这两个公共入口，保留自身的外链限制。选店参数仍为 `peisongType`，不修改业务协议。

## 模块 Mock

mock/entry.mock.ts 仅供公共发现器收集；banner/handlers.ts 使用 api/endpoints.ts 定义的路径，banner/data.ts 维护首页轮播样本。公共发现器按约定自动收集入口，不再保留首页 handler 或数据副本。公共适配器、开关、响应信封和故障工具仍在 src/mock。页面和 API 不直接导入 mock，生产开关及未命中回退策略不变。

首页用户卡与“我的”共用账户模块公开的 CustomerProfile。两边使用相同的顾客资料、黄色等级徽章和绿色微信登录按钮：游客显示欢迎文案和默认头像，登录后显示当前顾客已保存的昵称与头像，等级缺失显示“游客”。退出、失效或非顾客身份均不显示缓存用户资料。会员入口已指向 /pages/account/users/member-center/index；未登录点击登录按钮、会员或优惠券入口先进入现有客户登录页。真实微信资料授权与等级升级仍由既有认证服务及后端规则负责，不在首页伪造。

## 当前目录与职责边界

本模块位于 `src/pages/home/index`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `bannerApi`、`Banner`。
- 依赖领域：`@/pages/account/index`、`@/pages/routes`、`@/pages/auth/session`
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
- `composables/use-banners.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-navigation.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-share.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-user.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Home`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useHome<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 分享身份边界

首页邀请参数只读取当前有效顾客身份的编号。游客、过期会话、商家和骑手身份均不携带 inviter_id，不把其他端账号编号用作顾客邀请来源。
