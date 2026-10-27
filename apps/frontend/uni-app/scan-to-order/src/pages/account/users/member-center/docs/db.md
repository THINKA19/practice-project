# 会员等级后端参考

本次仅依据旧前端源码迁移，未访问生产接口，未获取数据库结构。

旧源码使用 POST /user/level/list、common 网关，返回 result 数组。当前正式 HTTP 没有该网关契约，因此生产等级读取保持未开放。开发使用 GET /__mock/account/membership/levels，返回 UserLevel 数组；样本 rebate 按“折”展示，upgradeAmount 按元展示，仅供界面演示。

资产复用 [钱包模块](../../../assets/asset/docs/db.md)。当前等级读取 session.userInfo.userLevel.name。累计消费兼容 totleConsumed / totalConsumed，缺失显示横杠。

待后端确认：等级服务 URL、认证和网关、分页格式、金额和折扣单位、排序、升级规则；动态会员码的接口、有效期、刷新及核销协议。前端不推算真实等级，不生成可用于核销的凭证。
