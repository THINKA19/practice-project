# 优惠券接口契约

依据 card、card7 和既有重构代码整理，未核实数据库或生产服务。

- GET /discounts/coupons：page、pageSize，返回可领券数组或 list/result 分页。
- GET /discounts/my：page、pageSize、status（0 或 1,2,3），返回当前顾客券。
- GET /discounts/detail：id 为模板 ID。
- POST /discounts/fetch：id、pwd（可选）。
- POST /discounts/exchange：number、pwd、extJsonStr。
- GET /discounts/statistics：当前顾客券统计。

模板 id 与用户券 id 不混用，用户券 pid 对应模板。moneyType=0 表示金额券，1 表示折扣；moneyHreshold 沿用接口原拼写。可用券显示日期部分，不能修改源数据。领取码 20001/20002 为不可领、20003 已领取、20004 过期、30001 积分不足；通过既有 HTTP 拒绝信息提取业务码，不修改公共请求。

开发端点 /__mock/account/coupons/*，按顾客隔离领取和兑换状态；写操作验证开发顾客凭证。口令 DEMO，兑换券号 DEMO2026、密码 DEMO。固定演示不涉及真实资金或积分扣除。

待后端确认：真实授权及租户过滤、分页、扣积分/余额原子性、库存限制、领取/兑换幂等、失效规则、适用商品范围及实际数据库表结构。
