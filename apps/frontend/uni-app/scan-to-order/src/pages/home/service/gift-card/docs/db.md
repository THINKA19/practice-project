# 礼品卡卡包数据参考

来源：当前卡包源码与既有接口；核对日期：2026-11-10。未取得后端源码、SQL DDL 或权威数据库字典。

## 本模块接口

- GET /card/list：公开模板列表，可选 status；默认网关，响应为空时归一为 []。
- GET /card/my：当前客户持卡；请求时读取客户 Authorization，关闭缓存，空结果归一为 []。
- POST /__mock/gift-card/action：仅开发 Mock；action=purchase/consume/refund，id 在购买时为模板编号，其他动作时为持卡编号。生产发送前拒绝。

本模块不再拥有兑换、流水、赠送和领取接口，分别参见相邻模块 docs/db.md。

## 资产模型

CardTemplate：id、name、amount，及可选 pic、price、shareContent。amount 表示权益数量；price 的生产单位待确认。shareContent 是既有展示字段，不代表数据库列。

MyCard：id 为持卡编号，cardId 为模板编号，amount 为可用数量，status 为后端状态。type=0 按次数、type=1 当前界面按元展示；完整单位契约待确认。可选 cardInfo 为模板摘要，dateEnd 为有效期（真实时区待确认），isActive/fromUid/fromUser 为激活与来源信息，shareId/shareToken 为赠送展示信息。持卡中的 shareToken 是接口返回的摘要，开发凭证 Map 的唯一所有者是 gift-card-send。

CardUserBrief：可选 nick 与 avatarUrl，不承载身份凭证。MyCardState 是前端派生 canShare/sharing/active/expired/empty，不是数据库枚举，不替代后端授权。

## 模拟资产操作

当前账户初始七张卡，模板和资产由本模块初始化；流水数据工厂在 gift-card-logs，赠送凭证在 gift-card-send。addCard 发卡，transferCard 校验原持有人并转移；领取编排再清理旧持有人流水并失效凭证。Mock 同步操作不证明真实事务原子性。

## 后端待确认

真实表名、主外键、SQL 类型、NULL/默认值、权限/租户过滤、软删除、状态编码、支付到账发卡、消费退款事务及幂等均待后端确认。接口类型不作为物理表结构；不生成推测性 SQL。

- [兑换契约](../../gift-card-exchange/docs/db.md)
- [流水契约](../../gift-card-logs/docs/db.md)
- [赠送契约](../../gift-card-send/docs/db.md)
- [领取契约](../../gift-card-receive/docs/db.md)
