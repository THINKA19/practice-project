# 礼品卡卡包

本模块拥有礼品卡模板、当前客户持卡、卡包展示、购买收银台接入和开发资产操作。兑换、赠送、领取、流水各自完整归相邻 gift-card-* 领域；本模块不再集中代理其接口、模型或 Mock。

## 文件与公开入口

- `index.vue`：卡包页面。`exchange.vue`、`logs.vue` 保留既有旧地址跳转。
- `api/endpoints.ts`、`api/card.api.ts`：目录、持卡及开发资产操作；复用现有 Alova，不改公共客户端。
- `models/types.ts`：CardTemplate、MyCard、CardUserBrief、MyCardState；`models/enums.ts`：购买后续动作常量。
- `composables/use-requests.ts`：卡包空列表归一化；`composables/use-page.ts`：卡包页面状态、支付面板与导航。
- `domain/card.rules.ts`：持卡展示规则；`components/`：卡包视图。
- `mock/fixtures/cards.ts`：模板样本；`mock/state.ts`：账户持卡、编号、发卡及转移操作；`mock/handlers.ts`：卡包接口处理；`mock/entry.mock.ts`：唯一登记及本模块 reset。
- `mock/index.ts`：仅向其他 Mock 暴露 cards、owner、addCard、transferCard，不导出 Map、Set 或接口规则。
- `index.ts`：cardApi、myCardState 和实际跨模块使用的 CardTemplate、CardUserBrief、MyCard 类型。

## 状态归属与依赖

页面状态属于每次 useCardPage 实例，会话属于 auth/session。持卡事实由服务端决定；Mock 持卡仅在本模块维护。流水样本与记录归 gift-card-logs，凭证及有效期归 gift-card-send，兑换使用记录归 gift-card-exchange；领取负责跨领域操作顺序，不复制这些状态。各 entry 只重置自身状态，公共 resetAllMocks 汇总。

卡包查询公开入口不依赖子页。卡包页面通过 gift-card-send 公开 API 撤回赠送，通过各端路由常量导航。Mock 仅依赖各模块的专用出口，出口不加载请求登记；不建立中央业务状态。

## 业务与验证边界

MyCard.id 为持卡编号，cardId 为模板编号；type=0 次卡、type=1 储值卡。购买沿用 PaymentPanel 与 nextAction.type=10。消费和退款按钮仅为开发模拟，不创建订单或真实支付。

首页进入卡包，卡包分别进入兑换、赠送与详情；好友由分享链接进入领取页。四个正式页面地址及现有兼容跳转不变。

在应用根目录运行 `pnpm exec vitest run src/pages/home/service/gift-card --maxWorkers=2` 覆盖整个礼品卡目录前缀；执行类型、lint、全量测试及 H5/微信生产构建。Mock 通过不代表后端授权、支付到账、事务与真机分享通过。详见 [数据参考](./docs/db.md) 和 [链路验收](./docs/events.md)。
