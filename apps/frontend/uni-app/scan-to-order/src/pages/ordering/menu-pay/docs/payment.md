# 支付与计费：后端数据参考

核实日期：2026-10-09。来源：[api/endpoints.ts](../api/endpoints.ts)、[api/payment.api.ts](../api/payment.api.ts)、[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：支付预下单、支付后续动作、买单优惠及配送费档位。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

wxpay 可由调用方传入的已配置接口地址覆盖默认路径；每次支付请求通过共享会话公开能力读取当前顾客认证头，不保存第二份 payToken。nextAction 是 JSON 字符串：0 支付订单、4 优惠买单、10 礼品卡购买。支付宝返回二维码并不表示已支付。客户端成功不能替代后端到账确认。配送距离档位 distance 单位 km，按第一条覆盖实际距离的档位匹配。

## 本模块接口及参数

- `wxpay(data: ApiParams, url: string = endpoints.wxpay)`：POST `/pay/wx/wxapp`；main（默认） 网关，显式 token 存在时不重复自动注入。微信支付预下单；url 可由后台配置覆盖（wxpay_api_url）

- `alipayQrcode(data: ApiParams)`：POST `/pay/alipay/gate/qrcode`；main（默认） 网关，显式 token 存在时不重复自动注入。支付宝当面付预下单，返回 { qrcode: string(JSON) }

- `payBill(money: number, pwd = '')`：POST `/payBill/pay`；main（默认） 网关，沿用客户端认证。优惠买单（余额支付）

- `payBillDiscounts()`：GET `/payBill/discounts`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `peisongFeeList()`：GET `/fee/peisong/list`；main（默认） 网关，沿用客户端认证。配送费阶梯（原 WXAPI.peisonFeeList）
注：属于订单计费，order/shop 上下文暂无此接口，临时放在 payment，后续可迁移 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### PayChannel

前端类型：`'wx' | 'alipay'`。

### NextAction

前端类型：`| { type: 0, id: number | string } | { type: 4, uid: number | string, money: number } | { type: number, [k: string]: unknown }`。支付成功后的后续动作（apifm nextAction）
type 0 支付订单；4 优惠买单

### PayIntent

- `money`：`number`。金额或折扣值，具体单位依所属对象及后端契约。
- `remark`：`string`。备注。
- `nextAction?`：`NextAction`。已声明的前端字段；完整业务含义待后端确认。
- `extData?`：`Record<string, string | number>`。额外透传字段。

### WxPayData

- `timeStamp`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `nonceStr`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `package`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `signType`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `paySign`：`string`。已声明的前端字段；完整业务含义待后端确认。

### PayBillDiscount

- `id`：`number`。接口记录标识。
- `consume`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `discounts`：`number`。已声明的前端字段；完整业务含义待后端确认。

### PayPlan

待支付订单的支付计划（原 all-orders toPayTap 中的计算）
- 积分不足：不可支付
- remain<=0：余额足够，直接余额支付。

- `ok`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `reason?`：`'scoreNotEnough'`。已声明的前端字段；完整业务含义待后端确认。
- `orderMoney`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `balance`：`number`。可用余额；后端金额单位待核实。
- `remain`：`number`。仍需在线支付的金额。
- `needScore`：`number`。已声明的前端字段；完整业务含义待后端确认。

### YouhuiPayPlan

- `rule?`：`PayBillDiscount`。命中的满减规则。
- `needPayAmount`：`number`。优惠后应付。
- `wxpayAmount`：`number`。扣除余额后仍需在线支付（<=0 表示余额足够）。

### PeisongFee

配送费阶梯（apifm /fee/peisong/list）
distance 为该档位覆盖的最大距离（km）。

- `id`：`number`。接口记录标识。
- `distance`：`number`。已声明的前端字段；完整业务含义待后端确认。

## 关联模块资料

- [商品媒体所有者](../../menu-goods-details/docs/db.md)
- [门店配置](../../index/README.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。
