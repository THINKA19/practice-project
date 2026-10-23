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

保留 usePage 外观层和四个子 composable。复用现有 store/user、store/token 和 http/alova，不引入 hooks/shared、utils/shared 或已删除的 shared/infrastructure 模块。首页直接渲染 components/locale/index.vue，语言菜单、状态和图标均由该组件负责，不另建选择器。

轮播通过现有 Alova 调用 GET /banner/list?type=shouye，使用 ignoreAuth 元数据。开发环境 VITE_USE_MOCK=true 时，由全局清单登记的本模块 mock/banner/handlers.ts 返回 static/images/home/banner 下的 01.jpeg、02.jpeg、03.jpeg；图片不设置跳转目标。其他类型返回空数组。生产环境或关闭 Mock 后走真实服务，真实接口仍待联调；失败或空数据不展示轮播。目前仅处理应用内链接，外链提示暂不支持。

分享使用当前首页 TEA WORK 品牌文字；仅有效登录用户附带 userId 邀请参数，未接入旧配置中心及分享图片。

## 本次测试入口

- user/member-center/index.vue：会员中心。
- user/coupons/index.vue：优惠券。
- service/favorites/index.vue：收藏。
- service/card/index.vue：会员卡／礼品卡。
- service/group-buying/index.vue：团购。
- service/welfare/index.vue：福利。

以上路径相对 pages/home，均只显示测试标题及进入成功文字，无接口和后续业务。路由由 UniPages 自动注册，统一引用 pages/routes.ts 中的 Home 常量。

门店选择通过 ClientRoutes.Ordering.shopSelect 进入 /pages/ordering/shop/select 测试页，并传 peisongType=zq 或 kd，分别显示到店自取、外卖配送。测试页不请求门店数据；缺失或非法参数显示入口提示。关于仍指向尚未实现的 /pages/me/setting/about/index，跳转失败时显示通用的本地化导航失败提示。index11 仅参考入口语义，已排除页面扫描，不参与首页运行。

首页原静态服务图片已缺失，改用现有 Carbon 图标；语言图标复用已有语言组件资源。

banner/list 以 type 区分首页 shouye、点餐 diancang、礼品卡 card。picUrl 为图片，linkUrl 为跳转目标。横幅的发布审核、过期与点击统计不在当前前端契约中。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

## 导航与反馈

`composables/useNavigation.ts` 负责首页业务目标和失败提示，通过 `utils/project/navigation.ts` 执行跳转，使用 `utils/project/feedback.ts` 展示文字。轮播复用这两个公共入口，保留自身的外链限制。选店参数仍为 `peisongType`，不修改业务协议。

## 模块 Mock

mock/index.ts 仅供全局 Mock 装配导入；banner/handlers.ts 使用 api/endpoints.ts 定义的路径，banner/data.ts 维护首页轮播样本。全局 src/mock/modules/index.ts 只登记一次，不再保留首页 handler 或数据副本。公共适配器、开关、响应信封和故障工具仍在 src/mock。页面和 API 不直接导入 mock，生产开关及未命中回退策略不变。
