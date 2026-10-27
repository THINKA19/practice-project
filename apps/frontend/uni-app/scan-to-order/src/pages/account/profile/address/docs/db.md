# 地址与行政区数据参考

核实日期：2026-10-09。来源：本目录 `api/address.ts`、`models/address.ts`、`composables/useAddressPage.ts` 和地址规则测试。当前仅核实前端契约，未获取数据库 DDL、后端源码或线上响应样本。本文不被代码导入。

## 表与关联

- 地址记录：实际表名待后端确认。接口以 `id` 标识地址，通过 `provinceId/cityId/districtId` 关联行政区标识。
- 行政区记录：实际表名待确认；`pid` 表示接口中的父级标识。
- 地址归属当前用户的授权与查询过滤由后端负责；物理外键和租户隔离机制待确认。

## 已知字段

以下为前端接口类型，不是 SQL 字段定义；可选表示前端允许缺省，不等于数据库允许 NULL。

- `Address.id: number`：地址标识。
- `linkMan: string`：收货联系人；`mobile: string`：联系电话。
- `address: string`：详细地址，不包含前端另外拼接的省市区名称。
- `provinceId/cityId/districtId?: string`：省、市、区标识；接口类型允许缺省。
- `provinceStr/cityStr/areaStr?: string`：用于展示的省、市、区名称。
- `latitude/longitude?: number`：定位坐标；后端坐标系和精度待确认。
- `isDefault?: boolean`：返回对象中的默认地址标记；设默认的请求实际传字符串 `'true'`，不要直接推断请求与响应同型。
- `Region.id/name: string`、`pid?: string`、`level?: number`：行政区标识、名称、父级与层级；层级编码范围待确认。
- `AddressDetail.info`：详情接口的地址对象。

## 接口与操作

全部使用 common 网关；行政区查询关闭自动认证，其余沿用请求客户端认证。

- `POST /user/shipping-address/list/v2`：可传查询参数，读取 `result`；空结果转为 `[]`。
- `GET /user/shipping-address/detail/v2`：参数 `id`，返回详情。
- `GET /user/shipping-address/default/v2`：获取默认地址；暂无数据时可为 `null`。
- `POST /user/shipping-address/add`：提交联系人、电话、详细地址、行政区及定位；返回地址。
- `POST /user/shipping-address/update`：编辑时带 `id`；设默认只传 `id` 和 `isDefault: 'true'`。是局部更新还是全量替换、其他默认地址是否自动取消，待后端确认。
- `POST /user/shipping-address/delete`：参数 `id`；软删除、历史订单引用是否保留，待后端确认。
- `GET /region/province`：读取省列表；`GET /region/child`：通过 `pid` 读取下级列表。

## 已有前端行为

页面保存校验联系人、所选国家的手机号、配送国家、手填省／城市／区县和详细地址，不再要求地图定位或中国行政区标识。编辑保留原默认标记，首次新增设为默认；显式设置默认调用既有更新接口。电话校验只检查所选区号和号码基本长度，不验证号码是否开通；这些前端限制不代表后端契约。

## 后端待确认

真实表名、SQL 类型、主键生成、字段默认值和 NULL 约束；用户权限；默认地址唯一性与事务；删除机制；坐标系；新增/更新的重复请求行为。确认后记录来源和日期，不凭接口路径猜测。

## 2026-10-26 地址表单调整

新增 phoneCountry（CN/VN/LA/TH/ID）、countryCode（VN/LA/TH/ID）、regionText（手填省市区）字段；mobile 提交国际格式，电话国家与配送国家独立。provinceId/cityId/districtId 以及 latitude/longitude 不再由页面要求填写；地图与微信国内地址导入入口移除。新字段和无坐标保存已在业务 Mock 验证，真实后端是否接收及存储这些字段尚未核实，需要联调，不代表生产支持已确认。

## 2026-10-26 国家地区联动

配送增加 MY（马来西亚），regionText 改为该国配置的地区选项；保存时校验国家和地区匹配。切换国家清空旧地区。区域配置当前仅包含部分省市，非全国完整配送范围。越南城市名称核对政府资料：https://en.baochinhphu.vn/names-and-administrative-centers-of-34-provinces-and-centrally-run-cities-specified-111250415094350491.htm 。真实后端字段接入仍待联调。

## 默认地址返回标记兼容

列表、详情与默认地址查询在业务接口边界将 true、1、字符串 true／1 规范化为默认，其他值（包括字符串 false）为非默认。设置默认仍沿用字符串 true 请求契约。该兼容不证明服务端默认唯一性，真实接口仍待联调。
