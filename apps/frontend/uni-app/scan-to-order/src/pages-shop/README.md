# pages-shop 业务模块

商家端按功能直接分目录。一个功能可包含入口、详情、编辑等多个页面。组件与私有 parts 不参与页面注册；纯能力模块不创建 index.vue。页面路径见 [routes.ts](routes.ts)，由 UniPages 扫描页面生成注册配置。

## 分层约定

- index.vue：页面配置和组件组装；状态、筛选、请求与业务动作由 composables 拥有。
- index.ts：已有跨模块调用的公共出口；内部不经自己的出口回引。
- api/：endpoints.ts、*.api.ts 和所需 *.dto.ts；仅请求，不混入转换、页面状态或业务流程。
- models/：types.ts、按需 enums.ts、mappers.ts；类型与业务模型不依赖 Vue/Pinia/请求运行时。
- domain/：纯业务规则；adapters/：跨领域协议适配；storage/：持久化，各层只在需要时建立。
- components/<Name>/index.vue：组件入口；私有 Hook 按组件名命名；复杂组件使用 parts/。
- mock/：保留既有 entry.mock.ts 发现入口和 mock/index.ts 开发数据公共出口；路径使用所属 api/endpoints.ts。

## 状态归属

共享会话归 auth/session；跨页领域状态归所属模块 composables；页面状态归该页组合函数；组件草稿、展开状态和 DOM 引用归组件实例。既有会话 API session.ts 保留名称，因为受保护的 Store 测试仍依赖该路径。协议 UI 以 auth/agreement/ui/index.ts 单独出口，避免仅使用协议版本的调用方加载组件。

## 模块导航

- [订单管理](order/list/README.md) · [入口](order/index/index.vue) · [列表](order/list/index.vue) · [详情](order/detail/index.vue)
- [数据统计](statistics/index/README.md) · [报表](statistics/index/index.vue)
- [商品管理](goods/index/README.md) · [列表](goods/index/index.vue)
- [桌台看板](table/index/README.md) · [桌台列表](table/index/index.vue)
- [骑手管理](delivery/index/README.md) · [页面源码](delivery/index/index.vue)
- [店铺设置](shop/index/README.md) · [设置页](shop/index/index.vue) · [选择门店与邀请](shop/index/select.vue)
- [商家工作台](shop/workspace/README.md) · [商家账号](staff/account/README.md)
- [商家登录](auth/login/README.md) · [门店权限](auth/permissions/README.md) · [入驻申请](auth/onboarding/README.md)

## 回归检查

在应用目录执行 pnpm test:run --maxWorkers=2、pnpm type-check、pnpm lint、pnpm build:h5 和 pnpm build:mp。模型别名随正式位置更新；公共 HTTP、Mock、Router、Store 基础和 OpenAPI 生成代码保持其既有保护边界。

## Composable 命名规则

领域模块统一使用 `composables/use-<duty>.ts`，文件名只描述职责，例如 `use-list.ts`、`use-detail.ts`、`use-actions.ts`。组合函数导出名携带领域与职责：`use<Domain><Duty>`，例如 `useHomePage`、`useAddressPage`。组件根目录就近的私有 Hook 维持按组件命名；组件中若设有 composables/，同样使用 use-<duty>.ts 与 use<Component><Duty>。普通请求对象和命令不改成伪 Hook。
