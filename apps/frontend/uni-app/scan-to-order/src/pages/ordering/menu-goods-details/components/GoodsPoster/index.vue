<script setup lang="ts">
import { useOrderingCurrency } from '@/pages/ordering/index'

/**
 * ============================================================================
 * 【文件概述】商品详情 / components/GoodsPoster/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import GoodsPoster from '@/pages/ordering/menu-goods-details/components/GoodsPoster/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
/**
 * 商品分享海报（替代 bee-master 的 wxa-plugin-canvas poster 组件）
 * - canvas 2D 自绘：布局与原 drawSharePicDone 的 posterConfig 一致（750 宽）
 * - 生成图片后展示，可保存到相册（原 onPosterSuccess / savePosterPic）
 * - 当前端不支持 canvas 2D 节点时降级为仅展示小程序码
 * 说明：canvas / getImageInfo / saveImageToPhotosAlbum 属于 UI 渲染能力，shared/platform 暂未提供端口，
 *       在此组件内直接调用，ViewModel 不感知
 */
import type { PosterSource } from '../../composables/use-poster'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'
import { confirm, toast } from '@/utils/project/interaction'

const props = defineProps<{
  source: PosterSource | null
}>()

const emit = defineEmits<{
  close: []
  fail: [error: unknown]
}>()

const { formatPrice } = useOrderingCurrency()

interface Canvas2DImage {
  src: string
  onload: (() => void) | null
  onerror: ((e: unknown) => void) | null
}

interface Canvas2D {
  width: number
  height: number
  getContext: (type: '2d') => CanvasRenderingContext2D
  createImage: () => Canvas2DImage
}

const CANVAS_ID = 'goodsPosterCanvas'
const POSTER_WIDTH = 750

const { t } = useI18n()
const instance = getCurrentInstance()
const canvasHeight = ref(0)
const posterImg = ref('')
const drawing = ref(false)

watch(() => props.source, (s) => {
  posterImg.value = ''
  if (s) {
    draw(s)
  }
})

function getImageInfo(src: string): Promise<UniApp.GetImageInfoSuccessData> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({ src, success: resolve, fail: reject })
  })
}

function queryCanvas(): Promise<Canvas2D | null> {
  return new Promise((resolve) => {
    try {
      uni.createSelectorQuery()
        .in(instance?.proxy)
        .select(`#${CANVAS_ID}`)
        .fields({ node: true, size: true }, (res) => {
          const node = (res as { node?: Canvas2D } | null)?.node
          resolve(node && typeof node.getContext === 'function' ? node : null)
        })
        .exec()
    }
    catch {
      resolve(null)
    }
  })
}

function loadImage(canvas: Canvas2D, src: string): Promise<Canvas2DImage> {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = e => reject(e)
    img.src = src
  })
}

function strokeRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.stroke()
}

/** 按宽度折行，超出 lineNum 行末尾加省略号 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, lineNum: number): string[] {
  const lines: string[] = []
  let cur = ''
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxWidth) {
      lines.push(cur)
      cur = ch
      if (lines.length === lineNum) {
        break
      }
    }
    else {
      cur += ch
    }
  }
  if (lines.length < lineNum && cur) {
    lines.push(cur)
  }
  else if (lines.length === lineNum && lines.join('').length < text.length) {
    const last = lines[lineNum - 1]
    lines[lineNum - 1] = `${last.slice(0, Math.max(0, last.length - 1))}...`
  }
  return lines
}

function canvasToTempFile(canvas: Canvas2D, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width,
      height,
      destWidth: width,
      destHeight: height,
      fileType: 'png',
      success: res => resolve(res.tempFilePath),
      fail: reject,
    } as unknown as UniApp.CanvasToTempFilePathOptions, instance?.proxy)
  })
}

async function draw(s: PosterSource) {
  drawing.value = true
  try {
    const [picInfo, qrInfo] = await Promise.all([getImageInfo(s.pic), getImageInfo(s.qrcode)])
    const picHeight = (490 * picInfo.height) / picInfo.width
    const baseHeight = 74 + (picHeight + 120)
    const height = Math.ceil(picHeight + 660)
    canvasHeight.value = height
    await nextTick()
    const canvas = await queryCanvas()
    if (!canvas) {
      // 降级：不支持 canvas 2D 时仅展示小程序码
      posterImg.value = qrInfo.path
      return
    }
    canvas.width = POSTER_WIDTH
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, POSTER_WIDTH, height)
    // 边框
    ctx.lineWidth = 2
    ctx.strokeStyle = '#c2aa85'
    strokeRoundRect(ctx, 76, 74, 604, picHeight + 120, 8)
    // 商品图 + 小程序码
    const [goodsImg, qrImg] = await Promise.all([loadImage(canvas, picInfo.path), loadImage(canvas, qrInfo.path)])
    ctx.drawImage(goodsImg as unknown as CanvasImageSource, 133, 133, 490, picHeight)
    ctx.drawImage(qrImg as unknown as CanvasImageSource, 76, baseHeight + 199, 222, 222)
    // 文字
    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#333'
    ctx.font = '40px sans-serif'
    wrapText(ctx, s.name, 650, 2).forEach((line, i) => ctx.fillText(line, 375, baseHeight + 80 + i * 52))
    ctx.fillStyle = '#e64340'
    ctx.font = '50px sans-serif'
    ctx.fillText(formatPrice(s.price), 375, baseHeight + 180)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#999'
    ctx.font = '28px sans-serif'
    ctx.fillText(t('goodsDetail.longTapQrcode'), 352, baseHeight + 320)
    posterImg.value = await canvasToTempFile(canvas, POSTER_WIDTH, height)
  }
  catch (e) {
    emit('fail', e)
  }
  finally {
    drawing.value = false
  }
}

/** 保存到相册（原 savePosterPic） */
function save() {
  if (!posterImg.value) {
    return
  }
  uni.saveImageToPhotosAlbum({
    filePath: posterImg.value,
    success: () => {
      confirm({
        content: t('goodsDetail.qrcodeSaved'),
        showCancel: false,
        confirmText: t('common.gotIt'),
        confirmColor: '#333',
      })
    },
    fail: res => toast(res.errMsg),
    complete: () => emit('close'),
  })
}
</script>

<template>
  <view v-if="source">
    <!-- 离屏绘制画布 -->
    <canvas
      :id="CANVAS_ID"
      type="2d"
      class="poster-canvas"
      :style="{ width: `${POSTER_WIDTH}px`, height: `${canvasHeight}px` }"
    />
    <view v-if="posterImg" class="popup-mask" @tap="emit('close')" />
    <view v-if="posterImg" class="poster-box">
      <image mode="widthFix" class="poster-img" :src="posterImg" show-menu-by-longpress />
      <view class="btn-save" @tap="save">
        {{ t('goodsDetail.saveImage') }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.poster-canvas {
  position: fixed;
  top: 0;
  left: -9999px;
}

.popup-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background-color: rgb(0 0 0 / 60%);
}

.poster-box {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10000;
  width: 686rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 24rpx;
  transform: translate(-50%, -50%);
}

.poster-img {
  display: block;
  width: 100%;
}

.btn-save {
  height: 88rpx;
  margin: 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 88rpx;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #d4a574 0%, #c9935e 100%);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgb(212 165 116 / 40%);
}
</style>
