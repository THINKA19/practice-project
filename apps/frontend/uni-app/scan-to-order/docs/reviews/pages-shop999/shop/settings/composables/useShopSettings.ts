import type { ShopSettingsForm } from '../type'
import type { FormRules } from '@/utils/form'
import { reactive } from 'vue'
import { SHOP_HOME_URL } from '@/pages-shop/routes'
import { clonePlain } from '@/pages-shop/utils/clone'
import { isValidContact, isValidNumber, isValidTimeHm, parseFormNumber } from '@/pages-shop/utils/validate'
import { checkForm, required, when } from '@/utils/form'
import { pendingData } from '@/mock/pending'

/**
 * 演示店铺配置 —— 接口未接入，非 mock 构建下字段归零（见 src/mock/pending.ts）
 * 真实接口：GET /shop/settings、POST /shop/settings/save
 */
const DEMO_SETTINGS: ShopSettingsForm = pendingData('GET /shop/settings', {
  shopName: '塔斯汀流浪猫主题餐厅（旗舰店）',
  shopLogo: '',
  shopPhoto: '',
  shopType: '快餐/小吃',
  contact: '400-888-6688',
  address: '上海市徐汇区宜山路889号2号楼1层',
  longitude: 121.436531,
  latitude: 31.188503,
  description: '以关爱流浪猫为主题的公益餐厅，每售出一份餐品，我们会捐赠1元用于流浪猫救助。欢迎各位爱心人士前来用餐~',
  businessStatus: true,
  businessHours: [
    { day: '周一至周四', open: '10:00', close: '21:00', on: true },
    { day: '周五至周六', open: '09:30', close: '22:00', on: true },
    { day: '周日', open: '10:30', close: '20:30', on: true },
  ],
  delivery: true,
  dineIn: true,
  takeAway: true,
  minOrderAmount: 20,
  deliveryFee: 3,
  freeDeliveryThreshold: 30,
  deliveryRadius: 3,
  notice: '本月特惠：下单满50赠送流浪猫公益徽章1枚~',
  autoReceive: true,
  autoPrint: false,
  soundNotify: true,
})

/** 店铺设置：表单状态 + 校验 + 保存 */
export function useShopSettings() {
  const form = reactive<ShopSettingsForm>(clonePlain(DEMO_SETTINGS))

  /**
   * 校验规则：按顺序取第一条不通过的提示（见 @/utils/form）
   * 规则只描述「什么算通过」，提示与 return 由 checkForm 统一处理
   */
  function rules(): FormRules {
    const threshold = parseFormNumber(form.freeDeliveryThreshold)
    const minOrder = parseFormNumber(form.minOrderAmount)

    return [
      required(form.shopName, '请输入店铺名称'),
      required(form.contact, '请输入联系电话'),
      when(isValidContact(form.contact), '请输入正确的联系电话'),
      required(form.address, '请填写店铺地址'),
      // 营业时段：开启的时段必须有合法的 HH:mm，否则存进去后前台无法解析营业状态
      form.businessHours
        .filter(h => h.on)
        .map(h => when(isValidTimeHm(h.open) && isValidTimeHm(h.close), `${h.day} 营业时间格式应为 09:00`)),
      // 开启配送时，配送参数必须是合法数字，避免把空值 / NaN 提交上去（未开启配送时整组跳过）
      form.delivery && [
        // 注意：清空输入框回传的是空串，Number('') === 0，所以统一走 parseFormNumber / isValidNumber
        when(isValidNumber(form.minOrderAmount), '请输入正确的起送金额'),
        when(isValidNumber(form.deliveryFee), '请输入正确的配送费'),
        when(isValidNumber(form.deliveryRadius, false), '请输入正确的配送范围'),
        // 免配送门槛此前完全没参与校验：留空会被 Number('') 悄悄变成 0，
        // 语义上就成了「永远免配送费」，配送费设置形同虚设
        when(isValidNumber(form.freeDeliveryThreshold), '请输入正确的免配送门槛'),
        when(!(threshold > 0 && threshold < minOrder), '免配送门槛不能低于起送金额'),
      ],
    ]
  }

  /** 返回上一页；直接进入本页（无页面栈）时兜底回商家首页 */
  function cancel() {
    uni.navigateBack({ fail: () => uni.redirectTo({ url: SHOP_HOME_URL }) })
  }

  function save() {
    if (!checkForm(rules()))
      return
    uni.showModal({
      title: '保存确认',
      content: '确认保存当前店铺设置？',
      success: (r) => {
        if (r.confirm)
          uni.showToast({ title: '保存成功', icon: 'success' })
      },
    })
  }

  return { form, cancel, save }
}
