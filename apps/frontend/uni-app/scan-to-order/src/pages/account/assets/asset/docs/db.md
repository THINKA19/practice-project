# 钱包接口契约

本次依据 card、card7 和既有重构代码整理；没有后端源码、SQL 或生产联调结果，不能将前端字段当作真实数据库结构。

- GET /user/amount：balance、freeze 为元，score 为积分；校验为有限非负数字，余额格式化两位小数。
- GET /user/recharge/send/rule：id、confine（充值元）、send（赠送元）、loop；优先匹配最高 confine，loop 按倍数赠送。
- POST /user/cashLog/v2：page、pageSize；数组或 result/list 分页，记录包含 id、amount、dateAdd，可含 typeStr、balance。
- POST /user/payLogs：page、pageSize、status=1；记录含 id、money、status、dateAdd，可含 payGateStr、dateUpdate。支持 total/totalRow/totalPage 分页信息。
- 无数据可返回 null；错误对象及缺失关键字段不能作为有效空列表。

开发端点集中于 api/endpoints.ts，使用 /__mock/account/wallet/*；演示金额同样为元，内存余额按分累计，充值请求以 requestId 去重。模拟确认后返回资产，并同步两种流水。原代码未提供真实充值支付接口，所以不存在已验证的生产入账链路。

待确认：正式身份凭证、响应信封及金额单位，分页返回形式、资金方向、充值订单和支付凭证、幂等键、异步支付结果确认及退款规则。真实表名、SQL 类型与事务边界均待后端提供。
