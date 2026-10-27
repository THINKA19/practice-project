# 客服配置数据契约

前端参考资料，未获取后端数据库 DDL，不推断真实表名或关系。

GET `/service/config` 使用既有主网关，公开读取、关闭请求缓存。响应经 models/contact.ts 校验后使用。

- `business_time`：服务时间文本。
- `phone`：可选电话号码，校验后支持确认拨打、复制。
- `channels`：渠道数组。每项包含 id、kind、name、description、account、qr_image、link、contact_link、primary；enabled=false 可隐藏未开通渠道。
- `kind`：wechat / wechat_official / qq / qq_group / telegram / facebook / x / whatsapp / instagram / other。
- `link` 为主页或主要联系链接；`contact_link` 为可选的直接联系链接，Facebook 可提供已验证 Messenger 地址。均只接受 HTTP(S)。
- `primary` 为布尔标记，首个标记项默认展开；其余按数组顺序显示且默认收起。无标记则展开第一项。
- `qr_image`：HTTP(S) 或项目 /static/ 下的二维码图片；联系链接仅允许 HTTP(S)。
- `wechat_contact_enabled`：明确开启后才在微信小程序显示原生客服按钮，还依赖平台客服配置。
- `demo`：开发配置标记；演示二维码仅编码 `DEMO:CONTACT:<channel>` 文本或 example.invalid 保留域名 URL。

兼容旧字段 image/wechat/phone/business_time/qq_group，以及新增 flat 字段 wechat_official/wechat_official_qr/qq/qq_qr/qq_group_qr/telegram/telegram_qr/telegram_link。明确返回 channels 数组时优先使用数组，空数组不恢复历史渠道。

无配置的渠道不渲染空卡片。微信个人号、公众号及 QQ 群等正式二维码必须由服务方提供，不能将普通账号文本二维码当作平台添加或入群凭证。图片加载失败有重试及账号复制入口。

待后端确认：channels 字段支持情况、各渠道实际账号、官方二维码、链接有效期、图片域名、微信客服开关与服务时间。开发 Mock 不证明真实平台可添加、入群或可用。

交互：账号旁为紧凑复制按钮，二维码居中并通过点击图片预览。H5 打开公开链接，App 调用既有系统打开能力，小程序复制链接；不新增内部 webview 或修改公共路由。申请与运营流程见 [overseas-channels.md](./overseas-channels.md)。
