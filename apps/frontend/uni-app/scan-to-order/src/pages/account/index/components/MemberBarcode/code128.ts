/**
 * Code128 条形码编码（纯函数，替代 bee-master 的 wxbarcode canvas 绘制）
 * 输出交替的“黑/白”模块宽度序列，由视图用 flex 渲染，无需 canvas
 * - 纯数字且偶数位：Code C
 * - 纯数字奇数位：Code C + 末位切换 Code B
 * - 其它 ASCII(32~127)：Code B
 */
const PATTERNS = [
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
]

const START_B = 104
const START_C = 105
const CODE_B = 100
const STOP = 106

/** 文本 → Code128 码值序列（含起始符、校验位、终止符） */
export function encodeCode128(text: string): number[] {
  const chars = Array.from(text).filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 127)
  if (!chars.length) {
    return []
  }
  const codes: number[] = []
  const allDigits = chars.every(c => c >= '0' && c <= '9')
  if (allDigits && chars.length >= 2) {
    codes.push(START_C)
    const evenLen = chars.length - (chars.length % 2)
    for (let i = 0; i < evenLen; i += 2) {
      codes.push(Number(chars[i] + chars[i + 1]))
    }
    if (evenLen < chars.length) {
      codes.push(CODE_B, chars[chars.length - 1].charCodeAt(0) - 32)
    }
  }
  else {
    codes.push(START_B)
    chars.forEach(c => codes.push(c.charCodeAt(0) - 32))
  }
  const checksum = codes.reduce((sum, code, i) => sum + (i === 0 ? code : code * i), 0) % 103
  codes.push(checksum, STOP)
  return codes
}

/** 码值序列 → 模块宽度（偶数下标为黑条，奇数下标为空白） */
export function code128Modules(text: string): number[] {
  return encodeCode128(text).flatMap(code => Array.from(PATTERNS[code]).map(Number))
}
