# 商家入驻申请

保留联系人、电话、说明与最多九个附件的表单。入驻申请和上传使用 VITE_SHOP_ONBOARDING_URL、VITE_SHOP_ONBOARDING_UPLOAD_URL，未配置时明确拒绝提交。

逐个上传附件，任一失败就终止并保留表单，提交期间防重复操作。请求复用项目 HTTP；不通过不存在的 shared/media 或历史 comment/add 路径调用。

当前表单只收集申请，不代表自动审批或创建门店；真实后端契约需联调。
