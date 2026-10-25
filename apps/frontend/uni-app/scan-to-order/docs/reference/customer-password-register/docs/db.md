# 注册契约

POST /auth/register 是新增前端契约，参数 {username,password}，成功数据为空，业务错误由已有请求层处理。真实后端尚未确认与联调。

开发接口 POST /demo/auth/register 执行格式与唯一性校验，开发账号库与登录 Mock 共用，重复账号失败。confirmPassword 只用于本地一致性检查，不上传。注册成功只返回登录页，不提交会话。
