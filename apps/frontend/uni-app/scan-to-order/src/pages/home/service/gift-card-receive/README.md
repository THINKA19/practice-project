# 礼品卡领取

本模块完整拥有领取请求、模型、页面流程和业务 Mock，不经 gift-card 代理这些职责。

## 文件职责

- `index.vue`：现有页面注册、生命周期和视图组装；页面地址不变。
- `components/`：接收页面状态、展示及发出交互，不直接调用客户端。
- `composables/use-page.ts`：useGiftReceivePage，负责身份校验、异步编排、状态和恢复。
- `api/endpoints.ts`、`api/receive.api.ts`：本模块端点与明确参数的请求；仅使用既有 `@/http/alova`，读取客户凭证，关闭缓存与公共 toast，不重试写操作。
- `models/`：本领域请求/响应契约；响应形状无需转换时直接共用接口类型，不增加同形 DTO 副本。需要校验的响应由 mappers.ts 处理，不在请求层写业务判断。
- `mock/entry.mock.ts`：唯一自动发现登记，引用本模块 endpoints。
- `index.ts`：`useGiftReceivePage`；API 与预览模型仅本领域使用。
- `__tests__/`：所属业务及边界回归；`docs/db.md`：已知契约和后端待确认项。

## 状态与业务规则

分享链接参数、预览、失败、提交中与完成状态归本页；领取无需第二份持久状态，依靠赠送凭证失效与卡包转移表达完成。

进入页面仅预览，预览有效后允许主动领取；失败只能重新预览，不自动重放写入。参数、账户变化和卸载后忽略迟到结果；完成提示后的导航也受同一请求代次保护。

## Mock 归属与依赖

`mock/entry.mock.ts` 拥有领取编排：通过 gift-card-send/mock 验证凭证，通过 gift-card/mock 转移资产，通过 gift-card-logs/mock 隔离旧流水并记录领取。拒绝自己的赠送、过期凭证、错误卡号、重复领取与缺失 calculate。无独立共享状态，因此不建空 state.ts 或重复 reset。

会话由 auth/session 唯一持有。卡模板和持卡模型归 gift-card，通过公开入口引用；本模块不复制资产或登录 Store。普通业务不导入 Mock，Mock 跨模块只使用对方 mock/index.ts，生产构建使用现有隔离机制。

## 验证与限制

在应用根目录运行 `pnpm exec vitest run src/pages/home/service/gift-card --maxWorkers=2`；完整链路测试在 gift-card-receive/__tests__/mock-flow.test.ts。合入门禁仍为 `pnpm type-check`、`pnpm lint`、`pnpm test:run`，构建检查使用 `pnpm build:h5`、`pnpm build:mp` 及 `pnpm check:mock-output dist/build/h5 dist/build/mp-weixin`。

Mock 数据仅存在当前进程，不能证明真实支付、事务、幂等、授权或微信双设备分享可用。真实契约及 SQL 资料缺失项见 [数据参考](./docs/db.md)。
