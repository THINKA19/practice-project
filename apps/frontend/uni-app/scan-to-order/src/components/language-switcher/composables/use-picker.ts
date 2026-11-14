import { computed, ref } from 'vue'
import type { SupportedLocale } from '@/locale'
import { currentLocale, setLocale } from '@/locale'

// 国际化语言图标
import auIcon from '../img/au.svg'
import enIcon from '../img/gb.svg'
import idIcon from '../img/id.svg'
import jaIcon from '../img/jp.svg'
import koIcon from '../img/kr.svg'
import loIcon from '../img/la.svg'
import myIcon from '../img/mm.svg'
import filIcon from '../img/ph.svg'
import siIcon from '../img/lk.svg'
import thIcon from '../img/th.svg'
import viIcon from '../img/vn.svg'
import zhHansIcon from '../img/cn.svg'

/**
 * 支持的多语言配置列表
 * 包含语言标识码、展示名称及对应国旗/图标
 */
const languages: { code: SupportedLocale, label: string, country: string, icon: string }[] = [
  { code: 'zh-Hans', label: '简体中文', country: 'CN', icon: zhHansIcon },
  { code: 'en', label: 'English', country: 'GB', icon: enIcon },
  { code: 'vi', label: 'Tiếng Việt', country: 'VN', icon: viIcon },
  { code: 'th', label: 'ภาษาไทย', country: 'TH', icon: thIcon },
  { code: 'lo', label: 'ພາສາລາວ', country: 'LA', icon: loIcon },
  { code: 'id', label: 'Bahasa Indonesia', country: 'ID', icon: idIcon },
  { code: 'si', label: 'සිංහල', country: 'LK', icon: siIcon },
  { code: 'en-AU', label: 'English', country: 'AU', icon: auIcon },
  { code: 'ja', label: '日本語', country: 'JP', icon: jaIcon },
  { code: 'ko', label: '한국어', country: 'KR', icon: koIcon },
  { code: 'my', label: 'မြန်မာဘာသာ', country: 'MM', icon: myIcon },
  { code: 'fil', label: 'Filipino', country: 'PH', icon: filIcon },
]

/**
 * 语言切换与选择器状态管理 Composable
 *
 * 提供语言选择面板的开关状态、当前生效语言信息以及切换语言的操作方法。
 */
export function useLanguageSwitcherPicker() {
  /** 控制语言选择弹窗/底部的显隐状态 */
  const showLangSheet = ref(false)

  /** 带选中状态标记（active）的完整语言列表，供选项列表高亮渲染 */
  const langOptions = computed(() =>
    languages.map(item => ({
      ...item,
      active: item.code === currentLocale.value,
    })),
  )

  /** 当前生效的语言对象；若匹配失败则降级回退至首选语言 */
  /** 首选语言：languages[0] */
  const selectedLanguage = computed(
    () => languages.find(item => item.code === currentLocale.value) || languages[0],
  )

  /** 打开语言选择弹窗 */
  function openLanguagePicker() {
    showLangSheet.value = true
  }

  /**
   * 切换应用语言并关闭选择弹窗
   * @param code 目标语言标识，例如 id。
   */
  function selectLang(code: string) {
    if (!languages.some(item => item.code === code))
      return
    setLocale(code)
    showLangSheet.value = false
  }

  return {
    selectedLanguage,
    openLanguagePicker,
    showLangSheet,
    langOptions,
    selectLang,
  }
}
