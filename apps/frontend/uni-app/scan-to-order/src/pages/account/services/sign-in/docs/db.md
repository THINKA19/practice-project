# 签到接口与字段

POST /score/sign：提交签到，公共客户端接收 code=0/200；POST /score/sign/logs：返回 data.result 日志数组，无记录为空。

日志：id、dateAdd（YYYY-MM-DD 日期前缀）、continuous（可选）。由唯一顾客会话提供认证。前端按本地日期展示，后端时区和业务日边界待确认。

开发 Mock 通过 mock/entry.mock.ts 自动发现，按顾客凭证隔离、同日幂等。真实积分发放、补签、10000 的确切含义、物理表结构与授权均未验证。
