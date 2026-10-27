# CMS 单页

以 key 加载关于我们等单页内容。

## 目录与入口

- `api/`：业务接口；路径集中在 endpoints.ts。
- `models/`：类型、枚举、数据转换与纯规则。
- `composables/`：页面响应式逻辑及业务流程。
- `index.ts`：仅向外导出实际使用的能力，其他模块不能导入内部文件。

页面路由：`/pages/account/profile/about/index`。

## 依赖与业务边界

仅依赖基础工具或本模块代码。业务请求保持原有参数、认证、网关和空结果处理。页面临时状态由 composables 拥有，共享状态由唯一 store 拥有，服务端仍是业务事实来源。

cms/page/info/v2 通过 key 查找，返回 info.title/content；key 不是数据库表名。暂无页面时允许 null，页面标题按已返回的标题更新。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

当前依赖边界、服务接入限制和验证方法见 [profile 迁移说明](../README.md)。本模块未做真实后端或真机验收。

页面采用暖色内容卡片和绿色客服按钮。`mock/entry.mock.ts` 提供 about 开发介绍，其余 key 返回空内容，不伪造协议。CMS 可选 title/content/contact 在 API 边界校验，联系方式存在时才显示复制按钮。

## 当前目录与职责边界

本模块位于 `src/pages/account/profile/about`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `About`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useAbout<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
