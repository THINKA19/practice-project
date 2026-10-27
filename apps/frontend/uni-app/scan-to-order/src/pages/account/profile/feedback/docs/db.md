# 反馈接口与数据说明

前端契约参考，未获取数据库 DDL，不推断真实表名或字段类型。

- POST `/comment/add`，secondary 网关，当前顾客 Bearer 凭证。
- 请求为 `type=1`、`content`、`extJsonStr`；扩展字段包含姓名、联系电话及 `file0...file5` 上传地址。
- 姓名与内容必填，手机号选填；图片及视频合计最多 6 项。
- 附件通过既有 `/upload` 上传，任一失败则不发送反馈，保留表单；换账户后不得继续发送旧表单。
- `mock/entry.mock.ts` 登记留言，`account/index/mock/entry.mock.ts` 拥有上传演示，校验开发顾客凭证，不保存个人数据。上传返回 example.invalid 演示地址，无实际文件存储。
- 真实存储表、附件大小/格式、内容长度、幂等、数据保留期及服务端权限均待后端确认。
