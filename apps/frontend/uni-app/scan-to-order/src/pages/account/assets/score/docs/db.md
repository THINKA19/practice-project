# 积分明细接口契约

POST /score/logs，参数 page、pageSize；沿用原代码接口，未完成真实服务联调。

记录包含 id、score、dateAdd，可含 typeStr、remark。score 保留正负方向；响应接受数组或 result/list 分页及 total/totalRow/totalPage，null 为无数据，格式错误不得伪装空数据。

开发端点 /__mock/account/score/logs 经本模块 mock/entry.mock.ts 登记，仅提供公开演示样本。积分余额、来源编码、冲正、过期规则和实际数据库表结构待后端确认；流水不作为积分资产汇总。
