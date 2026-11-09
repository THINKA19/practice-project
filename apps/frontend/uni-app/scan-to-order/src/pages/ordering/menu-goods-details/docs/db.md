# 商品详情：后端数据参考

核实日期：2026-10-09。来源：本目录页面与 composables 的现有调用，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：引用商品领域的数据。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

本页面不独立拥有数据库表。商品、SKU 和拼团数据见 [菜单商品协议](../../menu/docs/goods.md)；砍价接口由本领域 api/kanjia.api.ts 拥有。视频与小程序码由本领域 api/media.api.ts 拥有；当前用户来自共享会话。海报与选中规格属于前端展示状态。

## 本模块接口及参数

路径由 [api/endpoints.ts](../api/endpoints.ts) 维护；砍价协议见 [api/kanjia.api.ts](../api/kanjia.api.ts)：set 查询活动，join 参加，detail 查询进度，help 助力，myHelp 查询当前用户助力记录。goodsId 为商品标识，kjid 为活动标识，joiner/joinerUser 为参与者标识，不与订单 ID 混用。

媒体协议见 [api/media.api.ts](../api/media.api.ts)：videoDetail(id) 读取可选 fdMp4；wxaQrcode(data) 提交 scene、page、is_hyaline、autoColor、expireHours 并返回分享码地址。页面复用现有请求客户端，不另建公共媒体层。接口路径与能力是当前前端声明，生产后端是否支持仍待确认。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

页面参数和展示状态见 [models/types.ts](../models/types.ts)；砍价原始类型见 [api/kanjia.dto.ts](../api/kanjia.dto.ts)，进度扩展类型归砍价组合函数。商品与规格模型继续复用 menu 公开契约。

## 关联模块资料

- [pages/ordering/menu-cart](../../menu-cart/docs/db.md)
- [pages/ordering/menu-goods](../../menu/docs/goods.md)
- [pages/ordering/index](../../index/docs/db.md)
- [商品媒体所有者](../../menu-goods-details/docs/db.md)
- [共享会话](../../../auth/session/docs/db.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。
