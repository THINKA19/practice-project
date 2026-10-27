# 意见反馈

页面 `/pages/account/profile/feedback/index`，由“我的”菜单进入。页面只收集输入；`composables/submit.ts` 先上传附件，再调用 `api/feedback.ts` 的留言接口。`models/types.ts` 拥有表单和扩展字段契约。

姓名和内容必填，手机号选填，填写时校验格式。最多 6 个图片/视频文件；任一附件上传失败不继续提交。账户切换、离开页面、连续点击和延迟返回均在局部状态中处理。

POST `/comment/add` 使用 secondary 域名；请求包含 `type=1`、`content`、`extJsonStr`。扩展字段为姓名、联系电话和 `file0...file5` 上传 URL。响应由公共 Alova 判定成功，不使用本地定时器伪造提交结果。上传能力通过 [个人中心模块的附件上传入口](../../index/README.md) 公开入口调用。

`index.ts` 为公开契约入口；`mock/entry.mock.ts` 通过现有发现机制登记留言演示，上传 Mock 归个人中心模块的附件上传入口，页面明确标识 Mock。上传只返回演示地址，不存储文件或个人数据。数据契约与待确认项见 [docs/db.md](./docs/db.md)。

无真实后端或真机验证。

## 当前目录与职责边界

本模块位于 `src/pages/account/profile/feedback`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `buildFeedbackExt`、`FEEDBACK_COMMENT_TYPE`、`FeedbackForm`。
- 依赖领域：`@/pages/auth/session`、`@/pages/account/index/index`、`@/pages/routes`
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
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Feedback`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useFeedback<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
