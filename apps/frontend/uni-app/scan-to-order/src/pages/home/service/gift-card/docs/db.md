# 礼品卡：后端数据参考

核实日期：2026-10-09。来源：[api/card.ts](../api/card.ts)、[api/endpoints.ts](../api/endpoints.ts)、[models/card.ts](../models/card.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：卡模板、用户持卡记录、赠送与流水。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

MyCard.cardId 关联模板，MyCard.id 是用户卡标识。type=0 次卡按次数/杯数，type=1 储值卡按金额，不可统一解释 amount 单位。fetchShare calculate=true 只预览，false 才领取；openShare 返回分享 token 字符串。购买 nextAction.type=10。赠送/领取的并发、过期与撤回事务待确认。

## 本模块接口及参数

- `list(data: ApiParams = {})`：GET `/card/list`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `my()`：GET `/card/my`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `logs(data: ApiParams = {})`：POST `/card/logs`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `exchange(data: ApiParams)`：POST `/card/exchange`；main（默认） 网关，沿用客户端认证。

- `shareOpen(data: ApiParams)`：POST `/card/share/open`；main（默认） 网关，沿用客户端认证。

- `shareClose(data: ApiParams)`：POST `/card/share/close`；main（默认） 网关，沿用客户端认证。

- `shareFetch(data: ApiParams)`：POST `/card/share/fetch`；main（默认） 网关，沿用客户端认证。

- `openShare(id: number | string, remark = '')`：POST `/card/share/open`；main（默认） 网关，沿用客户端认证。开启赠送，返回分享 token（原 cardShareOpen，res.data 即 shareToken）

- `fetchShare(id: number | string, shareToken: string, calculate: boolean)`：POST `/card/share/fetch`；main（默认） 网关，沿用客户端认证。领取赠送：calculate=true 仅预览（赠送人、卡信息），false 正式领取

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### CardTemplate

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `pic?`：`string`。图片地址。
- `amount`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `price?`：`number`。价格；后端单位待核实。
- `shareContent?`：`string`。赠送留言（领取页展示）。

### CardUserBrief

赠送人/来源用户。

- `avatarUrl?`：`string`。头像地址。
- `nick?`：`string`。昵称。

### MyCard

- `id`：`number`。接口记录标识。
- `cardId`：`number`。卡模板标识。
- `cardInfo?`：`CardTemplate`。已声明的前端字段；完整业务含义待后端确认。
- `amount`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `status`：`number`。状态编码，完整枚举待后端确认。
- `dateEnd?`：`string`。结束/失效时间，时区和格式待确认。
- `shareId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `type?`：`number`。0 次卡（杯） 1 储值卡（元）。
- `isActive?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `fromUid?`：`number`。来自他人赠送。
- `fromUser?`：`CardUserBrief`。已声明的前端字段；完整业务含义待后端确认。
- `shareToken?`：`string`。赠送中的分享 token。

### CardLog

- `id`：`number`。接口记录标识。
- `amount`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `remark?`：`string`。备注。
- `dateAdd`：`string`。创建/记录时间，时区和格式待确认。
- `typeStr?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `balance?`：`number`。可用余额；后端金额单位待核实。

### MyCardState

前端类型：`'canShare' | 'sharing' | 'active'`。我的礼品卡展示状态（原 card/index.wxml 的分支）

### CardShareFetchResult

领取礼品卡预览（cardShareFetch calculate=true）。

- `user?`：`CardUserBrief`。已声明的前端字段；完整业务含义待后端确认。
- `cardUser?`：`MyCard`。已声明的前端字段；完整业务含义待后端确认。
- `cardInfo?`：`CardTemplate`。已声明的前端字段；完整业务含义待后端确认。

### CARD_BUY_NEXT_ACTION_TYPE

礼品卡购买的支付后续动作 type（apifm nextAction）

```ts
export const CARD_BUY_NEXT_ACTION_TYPE = 10
```

## 关联模块资料

- [pages/home/index](../../../../home/index/docs/db.md)
- [pages/ordering/payment](../../../../ordering/payment/docs/db.md)
- [pages/auth/session](../../../../../pages/auth/session/docs/db.md)
- [shared/settings](../../../../../asset/settings/docs/db.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。
