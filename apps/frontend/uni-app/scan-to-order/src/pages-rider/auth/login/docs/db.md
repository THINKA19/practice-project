# 登录后端契约

真实接口尚未取得可核实文档。当前通过 VITE_RIDER_LOGIN_URL 配置 POST 凭证交换路径，请求 {username,password}，返回单 token 或双 token；结构见主包 session/docs/db.md。未配置不请求。

返回凭证后必须查询 VITE_RIDER_PROFILE_URL 取得服务端 identity=rider，校验通过才提交会话。完整门店授权和骑手资格归权限模块。

开发 Mock 只在 DEV 且 VITE_USE_MOCK=true 时启用，不代表真实账号认证、数据库或授权已经联调。
