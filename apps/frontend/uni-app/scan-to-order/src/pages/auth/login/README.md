# 微信登录

页面 /pages/auth/login/index：微信登录或 PC 扫码入口，不包含顾客账号密码。协议默认关闭。无真实微信权限时，开发 Mock 使用二维码状态与手动模拟手机确认，最终提交同一个顾客会话并回到原页面。

目录：models/ 类型；api/ 后端接口；storage/ 浏览器 OAuth 临时状态；domain/ 跳转规则；composables/ 请求、轮询与生命周期；components/ 演示二维码；mock/ 独立样本状态机。

状态：pending → confirmed → used，或 expired。Mock 码 120 秒过期、凭证兑换只能成功一次；轮询每 1.5 秒，隐藏或销毁页面停止，过期及网络失败可重新发起。登录会话由同分类下 session 模块校验和持久化。

生产不启用模拟确认。H5 授权 URL 只接受 https://open.weixin.qq.com；回调必须与本浏览器发起的有效 state 及协议版本匹配。AppSecret 永不进入前端。开发模拟的随机字符串不作为生产安全实现。
