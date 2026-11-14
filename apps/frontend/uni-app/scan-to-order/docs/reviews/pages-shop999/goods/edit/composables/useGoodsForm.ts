import type { GoodsEditForm } from '../type'
import type { FormRules } from '@/utils/form'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { pendingData } from '@/mock/pending'
import { SHOP_GOODS_LIST_URL } from '@/pages-shop/routes'
import { clonePlain } from '@/pages-shop/utils/clone'
import { isValidInteger, isValidNumber, parseFormNumber } from '@/pages-shop/utils/validate'
import { checkForm, required, rule, when } from '@/utils/form'

/** 分类下拉（0 = 请选择占位） */
export const CATEGORY_LIST = ['请选择', '主食', '小吃', '饮料', '套餐', '甜点']

/** 下拉选项：一次性算好，避免模板每次渲染都 map 出新数组 */
export const CATEGORY_OPTIONS = CATEGORY_LIST.map((label, value) => ({ label, value }))

/** 编辑模式的演示详情（对齐列表页「香辣鸡腿堡」；接口未接入，见 src/mock/pending.ts） */
const DEMO_GOODS_DETAIL = {
  name: '香辣鸡腿堡',
  category: 1,
  price: 18,
  originPrice: 22,
  stock: 98,
  sold: 328,
  description: '精选鸡腿肉，秘制香辣酱料，外酥里嫩，回味无穷。',
  attrs: [
    { k: '辣度', list: ['不辣', '微辣', '中辣', '特辣'], required: true },
    { k: '配料', list: ['加生菜', '加芝士', '不加酱料'], required: false },
  ],
  tags: ['招牌', '热销'],
  status: 1 as 0 | 1,
}

function emptyForm(): GoodsEditForm {
  return {
    cover: '',
    banners: [],
    name: '',
    category: 0,
    price: null,
    originPrice: null,
    stock: null,
    sold: 0,
    description: '',
    attrs: [],
    tags: [],
    status: 1,
  }
}

/**
 * 商品编辑表单
 * 新增 = 空表单；编辑 = 按 id 拉演示详情（接缝见 src/mock/pending.ts）
 * TODO 上线时：编辑模式替换为 GET /shop/goods/detail，提交替换为 POST /shop/goods/save
 */
export function useGoodsForm() {
  const isEdit = ref(false)
  const id = ref<number | null>(null)
  const form = reactive<GoodsEditForm>(emptyForm())

  onLoad((options: { id?: string }) => {
    if (!options.id)
      return
    isEdit.value = true
    id.value = Number.parseInt(options.id, 10)
    Object.assign(form, clonePlain(pendingData('GET /shop/goods/detail', DEMO_GOODS_DETAIL)), { cover: '', banners: [] })
  })

  /** 校验规则：按顺序取第一条不通过的提示（见 @/utils/form） */
  function rules(): FormRules {
    return [
      // 模板上「商品图片」标了必填，这里必须真的校验，否则能提交无图商品
      required(form.cover, '请上传商品主图'),
      required(form.name, '请输入商品名称'),
      when(form.category !== 0, '请选择分类'),
      // 空串必须先挡掉：`form.price ?? NaN` 对 '' 无效，Number('') 会得到 0，
      // 于是「没填售价」会以 0 元通过校验 —— 统一走 isValidNumber（内部是 parseFormNumber）
      when(isValidNumber(form.price), '请输入正确的售价'),
      when(isValidInteger(form.stock), '请输入正确的库存'),
      rule(() => {
        const price = parseFormNumber(form.price)
        const originPrice = parseFormNumber(form.originPrice)
        return !(Number.isFinite(originPrice) && originPrice > 0 && originPrice < price)
      }, '划线价不能低于售价'),
      // 规格属性：填了规格名就必须给出选项值，且不允许空白的名字 / 选项
      form.attrs.map(g => [
        required(g.k, '请填写规格名称'),
        when(g.list.length > 0 && g.list.every(v => v.trim()), `规格「${g.k}」需要至少一个有效选项值`),
      ]),
    ]
  }

  /** 取消编辑：正常返回上一页；直接进入本页（无页面栈）时兜底回商品列表 */
  function cancel() {
    uni.navigateBack({ fail: () => uni.redirectTo({ url: SHOP_GOODS_LIST_URL }) })
  }

  function submit() {
    if (!checkForm(rules()))
      return
    uni.showModal({
      title: isEdit.value ? '修改确认' : '新增确认',
      content: `确认${isEdit.value ? '修改' : '新增'}商品「${form.name}」吗？`,
      success: (r) => {
        if (!r.confirm)
          return
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => cancel(), 600)
      },
    })
  }

  return { isEdit, id, form, cancel, submit }
}
