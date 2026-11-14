/**
 * 商家入驻申请：表单 / 附件上传 / 提交
 *
 * mock 阶段本地校验后直接成功；
 * TODO 上线时：
 *  - 附件先走上传接口：POST /upload/file（返回 url 塞进 extJsonStr）
 *  - 提交替换为：POST /comment/add（type=1，extJsonStr 契约保持不变）
 */
import { reactive, ref } from 'vue'
import { isValidContact } from '@/pages-shop/utils/validate'
import { checkForm, required, when } from '@/utils/form'

export interface UploaderFile {
  url: string
  name?: string
  type?: 'image' | 'video'
  size?: number
  thumb?: string
}

export const UPLOAD_MAX_COUNT = 9

export function useJoinApply() {
  const form = reactive({
    name: '',
    mobile: '',
    content: '',
  })
  const picsList = ref<UploaderFile[]>([])

  /** 提交入驻申请 */
  async function bindSave() {
    // 校验：按顺序取第一条不通过的提示（见 @/utils/form）
    if (!checkForm([
      required(form.name, '请填写联系人姓名'),
      required(form.mobile, '请填写联系电话'),
      when(isValidContact(form.mobile), '请输入正确的联系电话'),
    ]))
      return

    // 申请说明为空时用默认值提交，但不改写用户填写的表单
    const content = form.content.trim() || '申请入驻'

    // 附加字段（值统一为字符串）
    const extJson: Record<string, string> = {
      姓名: form.name.trim(),
      联系电话: form.mobile.trim(),
      申请说明: content,
    }

    uni.showLoading({ title: '提交中' })
    try {
      // mock：直接回传原地址（接入真实上传接口后替换为 await upload(pic)，失败会走到下面的 catch）
      picsList.value.forEach((pic, i) => {
        extJson[`file${i}`] = pic.url
      })
      // TODO 上线时：await addJoinApply({ type: 1, extJsonStr: JSON.stringify(extJson) })
    }
    catch (error) {
      // 先关 loading 再提示：两者在微信端共用同一个 UI 通道，顺序反了会把提示一起关掉
      uni.hideLoading()
      uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
      console.error('商家入驻提交失败:', error)
      return
    }

    // mock：直接提交成功（接入真实接口后替换本段）
    uni.hideLoading()
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 1000)
  }

  /** wd-upload @change：e.fileList 即为全量列表 */
  function afterPicRead(e: any) {
    const files: UploaderFile[] = (e.fileList || []).map((f: any) => ({
      url: f.url || f.path || f.tempFilePath || '',
      name: f.name,
      type: f.type,
      size: f.size,
      thumb: f.thumb,
    }))
    picsList.value = files.slice(0, UPLOAD_MAX_COUNT)
  }

  /** wd-upload @remove：{ file: UploadFileItem } */
  function afterPicDel(e: any) {
    const file = e.file
    if (!file?.url)
      return
    const idx = picsList.value.findIndex(f => f.url === file.url)
    if (idx < 0)
      return
    const list = [...picsList.value]
    list.splice(idx, 1)
    picsList.value = list
  }

  return {
    form,
    picsList,
    bindSave,
    afterPicRead,
    afterPicDel,
  }
}
