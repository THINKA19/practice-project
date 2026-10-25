# 入驻申请接口契约

真实路径与数据库待后端确认。POST VITE_SHOP_ONBOARDING_URL，请求 type=1、content、extJsonStr；扩展 JSON 包含姓名、联系电话及 fileN 附件 URL。

附件使用 VITE_SHOP_ONBOARDING_UPLOAD_URL，multipart 字段名 file；响应遵循项目 {code,data:{url}}，url 必须为 http(s) 地址。身份凭证由请求头提供，不写入 URL。

未配置服务时明确拒绝；上传全部成功后才提交表单。本功能只表示申请收集，不能声称审批、门店创建或权限开通已完成。
