/**
 * ============================================================================
 * 客户端主包与核心业务路由定义表 (Client Subpackage Route Contracts)
 * ============================================================================
 *
 * 【模块说明】
 * 本文件专用于声明点餐系统客户端（C端用户端）所有页面的静态路径常量。
 * 遵循业务模块化分组规范组织，作为全工程在客户端业务场景下路由调度的单一数据源（Single Source of Truth）。
 *
 * 【注意事项】
 * 1. 本文件仅提供常量路径定义与 TypeScript 类型收窄支持，不能替代 `pages.json` 中的页面注册配置。
 * 2. 新增、重命名或下线页面时，需同步核对并维护 `pages.json` 中的 `pages` 与 `subPackages` 配置。
 * 3. 业务代码中严禁硬编码字符串路径，统一通过本常量表引用。
 *
 * 【使用示例】
 * ```typescript
 * import { ClientRoutes } from '@/pages/routes'
 * import { go, redirect } from '@/utils/router'
 *
 * // 1. 普通商品详情跳转（携带参数）
 * go(ClientRoutes.Ordering.goodsDetails, { id: 'G1001' })
 *
 * // 2. 切换至底部核心导航页
 * go(ClientRoutes.Home.home)
 *
 * // 3. 提交订单后重定向至收银台
 * redirect(ClientRoutes.Ordering.pay, { orderId: 'O20261020001' })
 * ```
 * ============================================================================
 */
export const ClientRoutes = {
  /** 首页与公告模块 */
  Home: {
    /** 客户端主页（轮播图、热销推荐、点餐入口、营销活动位） */
    home: '/pages/home/index/index',
    /** 首页用户入口：最简测试页。 */
    memberCenter: '/pages/home/user/member-center/index',
    coupons: '/pages/home/user/coupons/index',
    /** 首页服务入口：最简测试页。 */
    favorites: '/pages/home/service/favorites/index',
    card: '/pages/home/service/card/index',
    groupBuying: '/pages/home/service/group-buying/index',
    welfare: '/pages/home/service/welfare/index',
    /** 关于页面的保留目标，尚未实现。 */
    about: '/pages/me/setting/about/index',
    /** 官方公告与资讯详情页（系统公告、门店节假日通知等） */
    noticeDetail: '/pages/home/notice/detail',
  },

  /** 点餐、选店与结算业务模块 */
  Ordering: {
    /** 点餐选品主页（商品瀑布流/分类侧边栏、加购联动交互） */
    order: '/pages/ordering/index/index',
    /** 统一在线支付/收银台页面（支持微信支付、余额抵扣等） */
    pay: '/pages/ordering/pay/index',
    /** 选店跳转测试页，接收 peisongType=zq/kd。 */
    shopSelect: '/pages/ordering/shop/select',
    /** 门店详情与资质介绍页（门店地址导航、营业时间、设施信息） */
    shopDetail: '/pages/ordering/shop/detail',
    /** 优惠买单/到店直接快捷买单页（快速输入消费金额并核销优惠） */
    youhuiPay: '/pages/ordering/youhui-pay/index',
    /** 购物车明细弹框/独立结算清单页（商品数量调整、清空、总价计算） */
    cart: '/pages/ordering/cart/index',
    /** 订单确认与提交结算页（就餐方式选择、备注说明、优惠券勾选） */
    cartOrder: '/pages/ordering/cart/order',
    /** 单品详情页（商品大图预览、多规格/加料选择、营养成分说明） */
    goodsDetails: '/pages/ordering/goods-details/index',
    /** 商品专题/分类扩展检索列表页 */
    goodsList: '/pages/ordering/goods/list',
  },

  /** 排队取号与预约等位模块 */
  Queue: {
    /** 现场排队取号首页（当前等待桌数展示、取号状态管理） */
    queue: '/pages/queue/index/index',
    /** 预订订座页面（预约到店就餐时间、人数及包厢需求） */
    booking: '/pages/queue/booking/index',
  },

  /** 取餐履约与叫号进度模块 */
  Pickup: {
    /** 正在制作/待取餐状态进度监控首页（出餐进度条、取餐码展示） */
    orderDoing: '/pages/pickup/index/index',
    /** 履约订单详情追踪页（全链路订单节点流转记录） */
    orderDetails: '/pages/pickup/order-details/index',
    /** 线下扫码核销/扫码出餐结果反馈页 */
    orderScanResult: '/pages/pickup/order-details/scan-result',
  },

  /** 个人中心、资产与权益模块 */
  Account: {
    /** 个人中心首页（会员头像昵称、资产概览、各功能卡片聚合） */
    my: '/pages/account/index/index',
    /** 全部历史订单列表页（全部、待付款、已完成、退款中分类检索） */
    allOrders: '/pages/account/orders/all-orders/index',
    /** 用户意见反馈与问题提交页 */
    feedback: '/pages/account/index/feedback',
    /** 会员动态会员码/核销码展示页（用于线下收银台扫码积分） */
    userCode: '/pages/account/index/user-code',
    /** 广告宣传与运营推广活动落地页 */
    ad: '/pages/account/ad/index',
    /** 会员中心首页（会员等级进阶、权益特权介绍、专属折扣） */
    memberCenter: '/pages/account/benefits/member-center/index',
    /** 订单售后与退款申请页（选择退款原因、上传凭据） */
    refundApply: '/pages/account/orders/refund-apply/index',
    /** 关于品牌与系统信息页（版本更新说明、品牌故事、用户协议） */
    about: '/pages/account/services/about/index',
    /** 我的优惠券与卡券包列表页（可用、已使用、已过期分类） */
    coupons: '/pages/account/benefits/coupons/index',
    /** 账户钱包与资产管理首页（储值余额、累计积分总览） */
    asset: '/pages/account/asset/index',
    /** 储值与充值明细流水记录页 */
    rechargeLog: '/pages/account/asset/recharge-log',
    /** 提现与资金收支流水记录页 */
    cashLog: '/pages/account/asset/cash-log',
    /** 每日签到领积分/福利互动页 */
    sign: '/pages/account/benefits/sign/index',
    /** 积分收支明细流水日志页 */
    scoreLogs: '/pages/account/benefits/score/logs',
    /** 实体礼品卡/电子储值卡卡包列表页 */
    card: '/pages/account/benefits/card/index',
    /** 卡券消费与划扣明细流水日志页 */
    cardLogs: '/pages/account/benefits/card/logs',
    /** 礼品卡兑换/卡密激活输入页 */
    cardExchange: '/pages/account/benefits/card/exchange',
    /** 礼品卡转赠与赠送发起页 */
    cardSend: '/pages/account/benefits/card/send',
    /** 接收好友礼品卡转赠的领取落地页 */
    cardReceive: '/pages/account/benefits/card/receive',
  },

  /** 客服与售后服务模块 */
  Service: {
    /** 帮助中心与在线客服接待首页 */
    index: '/pages/service/index/index',
  },
} as const
