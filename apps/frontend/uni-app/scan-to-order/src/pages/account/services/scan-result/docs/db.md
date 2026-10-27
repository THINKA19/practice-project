# 扫码核销接口与字段

## 接口所有权

底层订单核销能力归 src/pages/pickup1/scan-result，通过其 index.ts 的 scanApi 公开入口复用；真实路径清单以该模块 api/endpoints.ts 为准。本模块 api/verification.ts 负责调用与响应转换，不复制端点或再注册同路径 Mock。

- GET /order/orderDetail：query 为 hxNumber，返回 orderInfo、goods 等订单信息。
- POST /order/hxV2：body 为 hxNumber；公共客户端确认业务成功后返回 data。null 为合法空成功结果，undefined 为缺失结果，禁止展示成功。
- 请求复用现有公共 Alova、会话认证，不创建另一套请求或身份状态。

## 页面模型

models/verification.ts 仅保留 status（整数订单状态）、preparing（制作中）、amountReal（非负实付金额）、goods（id、goodsName、number）。响应及 URL 参数属于真实边界，在 api/models 转换校验。

状态 1/2 且非制作中允许提交；3/4 展示已完成；其他状态禁止提交。页面状态、加载失败和提交锁归 composable，服务端状态为事实来源。

## 权限与并发

前端仅检查门店身份，无法证明门店归属、角色及具体核销权限；后端仍须核验。切换身份立即清除详情并使旧请求失效，页面销毁后不写回。相机扫码完成后不执行二维码 URL。

## Mock 与待确认项

复用订单模块已登记的 Mock，不另建本模块 Mock。Mock 的状态变化、失败、重复核销只能证明前端开发链路，不能证明真实权限与资金行为。

真实后端、跨门店权限、二维码格式、同码并发幂等和数据库结构未验证；不得据前端字段推断表结构。H5 使用手动输入，小程序/App 相机需真机验证。
