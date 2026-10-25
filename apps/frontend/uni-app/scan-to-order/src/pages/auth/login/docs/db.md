# 微信认证前端契约（真实后端待实现与联调）

POST /auth/wechat/start：{channel, agreementVersion} → {id,pollToken,expiresAt,authorizationUrl}。channel 为 mini/wechat-h5/web。H5 start 必须由后端生成随机 state、绑定当前浏览器并使用配置的微信应用、回调域名返回官方授权 URL。PC 使用网站应用扫码 URL，微信内 H5 使用公众号 OAuth URL。

GET /auth/wechat/status?ticket=&pollToken=：{status:pending|confirmed|expired|used}，仅在客户端展示登录码并轮询的适配方式使用。不得仅凭公开 ticket 查询或领取会话。

POST /auth/wechat/exchange：{code,state,channel,agreementVersion}（微信回调/小程序）或 {ticket,pollToken,channel,agreementVersion}（已确认扫码会话）→ IAuthLoginRes。服务端验证微信 code、state、来源绑定、一次性消费、有效期及协议记录后返回本站凭证；OpenID 不是前端可自行提交的登录凭证。

GET /user/info：候选 Bearer 凭证查询顾客资料，identity 必须为 customer。真实跨渠道身份匹配以服务端映射为准，不保证 UnionID 总可获取。

开发接口 /demo/auth/wechat/{start,status,confirm,exchange,profile} 只由全局 Mock 开关启用。固定模拟顾客 userId=10001；confirm 显式模拟手机确认，不调用微信，不是真实二维码确认。Mock 状态存在当前开发进程；生产代码不能把确认接口当作安全认证。

真实服务端还必须提供有效的 AppID/AppSecret、授权回调域名、state 与浏览器绑定、凭证刷新和退出失效、日志与重放防护、账号归属校验。当前顾客订单、支付和取号后端仍未联调，样本数据不因此变为真实交易。
