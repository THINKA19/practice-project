# 门店经营地区目录

正式来源：`shopApi.regions()`，前端不再内置经营地区目录。原目录移至 `../mock/fixtures/regions.ts`，下方地名资料仅作为 Mock 样本来源，不代表业务已开放。

位置页的地区名称由门店详情的可选 `countryName`、`cityName`、`districtName` 提供，缺省时不显示额外地区行，保留原详细地址。这些字段是否由真实后端提供也需联调确认；位置页不通过开放目录推断地址。

## 地区接口契约

新增约定：`GET /shop/subshop/regions`，复用公共 HTTP 的现有响应信封，业务数据为数组。此路径和结构是前端接入契约，真实后端是否实现需联调确认；本次实现前端与业务 Mock，不包含运营后台。

```json
[
  {
    "code": "VN",
    "name": "越南",
    "cities": [
      {
        "code": "VN-SGN",
        "name": "胡志明市",
        "districts": [{ "code": "VN-SGN-1", "name": "第一郡" }]
      }
    ]
  }
]
```

后端只返回允许在门店筛选器展示的开放节点，并按运营顺序排序；关闭上级时排除其下级。编码是稳定业务标识，必须与门店列表查询使用相同编码；名称可以按请求语言返回。编码在整棵树中唯一，国家须有 `cities` 数组，城市须有 `districts` 数组，数组允许为空。整个返回 `[]` 表示暂无开放地区。

每次打开选择器重新读取，不持久化目录。前端校验结构，失败显示重试且禁止确认，不回退静态地区；空目录显示暂无开放地区。重新获取后，上级已关闭则清理其选择，下级已关闭则清理下级并重新查询。取消只放弃草稿；“不限”仅代表全部已开放门店。

真实门店列表接口必须在无地区筛选时也只返回允许展示的门店，并拒绝关闭或越级组合的筛选编码；不能依赖前端隐藏。后台地区开放状态独立于门店营业时间。当前 Mock 地区树只展示样本中已有门店的区域；它不能证明后端运营开关或权限已经实现。

## 筛选含义

第二级是城市/目的地，第三级是该目的地的经营区域，包含当地地名、街区、海滩和明确标注的地标周边。河内市在第二级，还剑、巴亭等在第三级；不把其他城市放进河内下级。

目录用于门店位置筛选，不是完整的政府行政区划或配送边界。尤其越南行政区划调整后，原有郡名只能按惯用地名理解，不能据此推断现行行政隶属。中文地名为展示译名，可保留拉丁名称消除歧义。目的地周边条目也不意味着地标可营业或可进入。

保留原有国家/城市及首批区域筛选键；移除无门店引用的 `*-AREA-*` 占位键。每个城市显式维护不同的区域列表，禁止统一生成“中心商圈、北部片区”等名称，也不为满足滚动演示而补齐数量。当前 30 个城市/目的地都有列表；真实后端仍需下发正式目录与门店归属，代码不是国家行政编码。

## 本次新增地区的参考来源

越南：

- 海防（三泊河、涂山、吉婆）：[越南旅游局海防夜游介绍](https://2025.vietnam.travel/hai-phong-cac-mo-hinh-du-lich-dem-co-hieu-ung-tich-cuc-thu-hut-duoc-dong-dao-nhan-dan-va-du-khach/)。
- 芹苴（宁桥、丐让）：[越南旅游局丐让市场介绍](https://nongthon.vietnamtourism.gov.vn/cai-rang-floating-market-an-ecotourism-highlight-in-the-waterways-of-can-tho/?lang=en)；平水：[芹苴旅游](https://vietnam.travel/places-to-go/mekong-delta/can-tho/)。
- 顺化（皇城、东巴、天姥寺）：[越南旅游局顺化文化行程](https://vietnam.travel/things-to-do/hue-itinerary/)。
- 芽庄（陈富、坝市场、婆那加塔）：[越南旅游局当地生活介绍](https://vietnam.travel/things-to-do/experience-nha-trang-like-a-local/)；龙山寺：[芽庄介绍](https://vietnam.travel/places-to-go/south-central-coast-central-highlands/nha-trang/)。
- 大叻（春香湖、市场、泉林湖）：[越南旅游局大叻介绍](https://beta.vietnam.travel/places-to-go/central-vietnam/dalat)。
- 头顿（前滩、后滩、灯塔）：[西澳越南商务委员会旅游指南](https://wavbc.org.au/wp-content/uploads/2025/08/2025-HCMC-Coastal-Region-Southern-Vietnam-WAVBC-Tourist-Information-Guidebook-1.pdf)。
- 富国岛（阳东、咸宁、长滩）：[越南旅游局富国岛介绍](https://vietnam.travel/things-to-do/a-day-in-phu-quoc/)；安泰：[越南旅游局海滨行程](https://image.vietnam.travel/things-to-do/family-beach-itinerary)。

泰国（泰国国家旅游局）：

- 芭提雅：[中天海滩](https://thai.tourismthailand.org/Attraction/หาดจอมเทียน)、[帕塔纳克山及芭提雅海滩](https://www.tourismthailand.org/Attraction/phra-tamnak-mountain-viewpoint)。
- 大城：[历史城寺庙及周边](https://www.tourismthailand.org/Articles/slow-lane-in-ayutthaya)。
- 清莱：[钟楼、夜市、Chet Yot 路](https://www.tourismthailand.org/Articles/https-www-tourismthailand-org-articles-wheretofindthebestrestaurantsinchiangrai)。
- 甲米：[奥南、莱利](https://www.tourismthailand.org/Attraction/ko-poda)、[诺帕拉特塔拉](https://www.tourismthailand.org/Trip-Planner/Suggestion-Detail/krabi-trang-4-days)。
- 华欣：[海滩与筷子山](https://www.tourismthailand.org/Attraction/hat-hua-hin)、[夜市](https://api-tourismproduct.tourismthailand.org/uploads/2025/11/ebook/RR_MAP_for_Printing_2510/file/1003975f-91bb-40a5-bdfa-3545b2d0c679.pdf?test=1)。
- 苏梅岛：[查汶、拉迈、波普、塔林甘](https://www.tourismthailand.org/Destinations/Provinces/Ko-Samui/360)。
- 合艾：[金荣与山迪素市场](https://www.tourismthailand.org/Attraction/kim-yong-market)、[合艾市立公园](https://www.tourismthailand.org/Destinations/Provinces/Hat-Yai/362)。

老挝：

- 巴色：[老挝南部旅游目的地管理规划（瓦銮寺、道亨市场）](https://laos-dmn.com/wp-content/uploads/2021/05/Southern-Laos-DMP-2020-2025_Eng_2019_Final.pdf)、[巴色当地游览介绍（色东河）](https://thailande-et-asie.com/en/que-faire-a-pakse-avant-de-partir-explorer-la-boucle-des-bolovens)。
- 沙湾拿吉：[老挝旅游部门老城、教堂、英杭塔介绍](https://www.tourismlaos.org/central-provinces/savannakhet-province/)。
- 万荣：[老挝旅游部门南松河、坦江、孟松村介绍](https://www.tourismlaos.org/central-provinces/vientiane-province/)。
- 他曲：[老挝旅游部门老城、西科达崩塔、坦南恩洞介绍](https://www.tourismlaos.org/central-provinces/khammouane-province/)。
- 丰沙湾：[老挝旅游部门石缸遗址、普肯山介绍](https://www.tourismlaos.org/northern-provinces/xiangkhouang-province/)。
- 乌多姆赛：[琅勃拉邦旅游部门普塔佛塔、手工艺中心介绍](https://tourismluangprabang.org/recommended-trips/other-provinces/oudomxay/)、[博物馆介绍](https://www.laosbynomadays.com/guide/destination/muangxai)。
- 会晒：[老挝旅游部门宗考玛尼拉寺、卡诺古堡、河港介绍](https://www.tourismlaos.org/northern-provinces/bokeo/)。
- 琅南塔：[老挝旅游部门夜市、南迪村、普姆普克佛塔介绍](https://www.tourismlaos.org/northern-provinces/luang-namtha-province/)。
