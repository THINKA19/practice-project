# 结算页面：后端数据参考

核实日期：2026-10-09。来源：[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：引用订单、购物车、地址、资产、门店和支付数据。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

本页面不另建订单表模型；订单参数由 order 接口提交。OrderPayload 是请求容器，不是数据库表。isNeedLogistics、配送距离、余额抵扣与实付以现有流程协作，服务端试算结果才是下单依据。

## 本模块接口及参数

本领域拥有支付预下单、买单优惠、配送费与二维码接口，见 [payment.md](./payment.md)、[api/payment.api.ts](../api/payment.api.ts) 和 [api/endpoints.ts](../api/endpoints.ts)。结算的订单试算与创建继续使用账户订单领域公开接口，不复制订单 API。请求层返回 DTO，优惠和配送费由 models/payment.mappers.ts 转换。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### PayShop

结算页用到的门店扩展字段（apifm 门店详情，shop 上下文模型未声明）。

- `openWaimai?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `openZiqu?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `serviceDistance?`：`number | string`。配送范围（km）。
- `serviceAmountMin?`：`number`。起送金额。
- `number?`：`string`。达达门店编号。
- `expressType?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### OrderPayload

前端类型：`Record<string, string | number | boolean | undefined>`。下单参数（/order/create）

## 关联模块资料

- [pages/account/ad](../../../account/profile/address/docs/db.md)
- [pages/account/asset](../../../account/assets/asset/docs/db.md)
- [pages/account/benefits/card](../../../home/service/gift-card/docs/db.md)
- [pages/ordering/menu-cart](../../menu-cart/docs/db.md)
- [pages/account/profile/order](../../../account/profile/order/docs/db.md)
- [pages/ordering/payment](../../menu-pay/docs/payment.md)
- [pages/ordering/index](../../index/docs/db.md)
- [共享会话](../../../auth/session/docs/db.md)
- [门店配置](../../index/README.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。

## 本次履约与报价契约

- 本模块只处理当前门店的自取和配送；扫桌码堂食沿用 menu-cart 桌台流程，无门店通用码。
- 自取联系电话为选填扩展信息，不发送 pickPointId；后端不得沿用强制提货点或强制自取电话的校验。
- 配送试算与正式创建均发送完整收货资料；商品必须属于 shopIdZt。服务端必须重新校验营业能力、配送范围、起送金额、库存和金额。
- 有效试算必须明确返回非负 amountTotle、amountReal；配送还须明确返回 amountLogistics，0 表示真实零配送费，缺失不能当作 0。
- 开发 /order/create Mock 由账户订单模块持有，试算不持久化订单，正式创建通过 requestId 幂等并保存实际商品明细；固定配送费仅为演示。
- 本次没有数据库迁移，也未新增商家协商运费的订单状态；该能力需要正式后端契约后再接入。

## 本次地址及国际电话

自取联系电话仍通过 extJsonStr 中的“联系电话”传递，非空时为带区号的国际格式；配送 mobile 使用收货地址号码。订单 address 使用国家、地区和详细地址拼接的完整文本，不新增未确认的 addressId 或国家字段。真实服务是否接受国际号码、完整地址文本及无坐标地址仍待联调。当前前端距离是定位信息可用时的直线估算；未知值不得匹配为零公里，最终配送可达性、费用和订单授权由后端校验。

## 自动回填及报价展示

地址列表仍使用原有 list/v2，不新增资料手机号接口；会话和个人资料现有契约没有电话字段，自取回填来自默认地址或唯一地址的联系人，界面说明来源，不自动写回账号资料。结算不再发送 couponId。配送费仍取 /order/create calculate=true 的 amountLogistics，实付取 amountReal，缺地址不发起报价也不伪造免运费。实际服务端计费规则与国际电话支持仍需联调。
