/**
 * 图片预览插件 - 点击图片放大查看
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'
import { defineComponent, h, ref, Teleport, Transition, onMounted, onUnmounted } from 'vue'

export interface ImageViewerPluginOptions {
  /** 是否启用缩放 */
  zoom?: boolean
  /** 最大缩放倍数 */
  maxZoom?: number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示图片信息 */
  showInfo?: boolean
  /** 背景透明度 */
  bgOpacity?: number
  /** 选择器，指定哪些图片可以预览 */
  selector?: string
  /** 排除选择器 */
  excludeSelector?: string
}

/**
 * 图片预览组件
 */
const ImageViewer = defineComponent({
  name: 'LDocImageViewer',
  setup() {
    const visible = ref(false)
    const currentSrc = ref('')
    const currentAlt = ref('')
    const scale = ref(1)
    const position = ref({ x: 0, y: 0 })

    let isDragging = false
    let startPos = { x: 0, y: 0 }
    let startOffset = { x: 0, y: 0 }

    const imageList = ref<{ src: string; alt: string }[]>([])
    const currentIndex = ref(0)

    const updateImageList = () => {
      const images = Array.from(document.querySelectorAll('.ldoc-content img:not(.no-preview)')) as HTMLImageElement[]
      imageList.value = images.map(img => ({
        src: img.src,
        alt: img.alt || ''
      }))
    }

    const open = (src: string, alt = '') => {
      updateImageList()
      const index = imageList.value.findIndex(img => img.src === src)
      if (index !== -1) {
        currentIndex.value = index
        currentSrc.value = src
        currentAlt.value = alt
      } else {
        // Fallback if image not found in list (e.g. dynamic content)
        currentSrc.value = src
        currentAlt.value = alt
        currentIndex.value = -1
      }
      scale.value = 1
      position.value = { x: 0, y: 0 }
      visible.value = true
      document.body.style.overflow = 'hidden'
    }

    const close = () => {
      visible.value = false
      document.body.style.overflow = ''
    }

    const prev = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        const img = imageList.value[currentIndex.value]
        currentSrc.value = img.src
        currentAlt.value = img.alt
        scale.value = 1
        position.value = { x: 0, y: 0 }
      }
    }

    const next = () => {
      if (currentIndex.value < imageList.value.length - 1 && currentIndex.value !== -1) {
        currentIndex.value++
        const img = imageList.value[currentIndex.value]
        currentSrc.value = img.src
        currentAlt.value = img.alt
        scale.value = 1
        position.value = { x: 0, y: 0 }
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      scale.value = Math.max(0.5, Math.min(5, scale.value + delta))
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (scale.value <= 1) return
      isDragging = true
      startPos = { x: e.clientX, y: e.clientY }
      startOffset = { ...position.value }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      position.value = {
        x: startOffset.x + (e.clientX - startPos.x),
        y: startOffset.y + (e.clientY - startPos.y)
      }
    }

    const handleMouseUp = () => {
      isDragging = false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible.value) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }

    onMounted(() => {
      // 暴露打开方法到全局
      (window as any).__ldocImageViewer = { open }
      document.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      delete (window as any).__ldocImageViewer
      document.removeEventListener('keydown', handleKeyDown)
    })

    return () => h(Teleport, { to: 'body' }, [
      h(Transition, { name: 'ldoc-image-viewer' }, () =>
        visible.value ? h('div', {
          class: 'ldoc-image-viewer',
          onClick: close,
          onWheel: handleWheel
        }, [
          h('div', {
            class: 'ldoc-image-viewer__backdrop',
            style: { opacity: 0.9 }
          }),
          h('img', {
            src: currentSrc.value,
            alt: currentAlt.value,
            class: 'ldoc-image-viewer__image',
            style: {
              transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
              cursor: scale.value > 1 ? 'grab' : 'zoom-out'
            },
            onClick: (e: Event) => e.stopPropagation(),
            onMousedown: handleMouseDown,
            onMousemove: handleMouseMove,
            onMouseup: handleMouseUp,
            onMouseleave: handleMouseUp
          }),
          // 关闭按钮
          h('button', {
            class: 'ldoc-image-viewer__close',
            onClick: close,
            title: '关闭 (Esc)'
          }, h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
            h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
            h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
          ])),
          // 上一张按钮
          imageList.value.length > 1 && h('button', {
            class: 'ldoc-image-viewer__prev',
            onClick: (e: Event) => { e.stopPropagation(); prev() },
            disabled: currentIndex.value <= 0,
            title: '上一张 (←)'
          }, h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
            h('polyline', { points: '15 18 9 12 15 6' })
          ])),
          // 下一张按钮
          imageList.value.length > 1 && h('button', {
            class: 'ldoc-image-viewer__next',
            onClick: (e: Event) => { e.stopPropagation(); next() },
            disabled: currentIndex.value >= imageList.value.length - 1,
            title: '下一张 (→)'
          }, h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
            h('polyline', { points: '9 18 15 12 9 6' })
          ])),
          // 底部信息栏
          h('div', {
            class: 'ldoc-image-viewer__footer',
            onClick: (e: Event) => e.stopPropagation()
          }, [
            // 图片描述
            currentAlt.value && h('div', {
              class: 'ldoc-image-viewer__caption'
            }, currentAlt.value),
            // 计数器
            imageList.value.length > 1 && h('div', {
              class: 'ldoc-image-viewer__count'
            }, `${currentIndex.value + 1} / ${imageList.value.length}`),
            // 控制工具栏
            h('div', {
              class: 'ldoc-image-viewer__toolbar'
            }, [
              h('button', { onClick: () => scale.value = Math.max(0.5, scale.value - 0.25), title: '缩小' }, '−'),
              h('span', `${Math.round(scale.value * 100)}%`),
              h('button', { onClick: () => scale.value = Math.min(5, scale.value + 0.25), title: '放大' }, '+'),
              h('button', { onClick: () => { scale.value = 1; position.value = { x: 0, y: 0 } }, title: '重置' }, '⟲')
            ])
          ])
        ]) : null
      )
    ])
  }
})

/**
 * 图片预览插件
 */
export function imageViewerPlugin(options: ImageViewerPluginOptions = {}): LDocPlugin {
  const {
    selector = '.ldoc-content img',
    excludeSelector = '.no-preview, .ldoc-image-viewer img',
    zoom = true,
    maxZoom = 5,
    showClose = true,
    showInfo = true,
    bgOpacity = 0.9
  } = options

  return definePlugin({
    name: 'ldoc:image-viewer',

    slots: {
      'layout-bottom': {
        component: ImageViewer,
        props: { zoom, maxZoom, showClose, showInfo, bgOpacity },
        order: 0
      }
    },

    globalComponents: [
      { name: 'LDocImageViewer', component: ImageViewer }
    ],

    // 注入点击处理脚本
    headScripts: [
      `
      document.addEventListener('click', (e) => {
        const img = e.target;
        if (img.tagName !== 'IMG') return;
        if (!img.matches('${selector}')) return;
        if (img.matches('${excludeSelector}')) return;
        
        e.preventDefault();
        const viewer = window.__ldocImageViewer;
        if (viewer) {
          viewer.open(img.src, img.alt || '');
        }
      });
      `
    ],

    // 注入样式
    headStyles: [
      `
      .ldoc-content img:not(.no-preview) {
        cursor: zoom-in;
      }
      .ldoc-image-viewer {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ldoc-image-viewer__backdrop {
        position: absolute;
        inset: 0;
        background: #000;
      }
      .ldoc-image-viewer__image {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        transition: transform 0.15s ease;
        user-select: none;
      }
      .ldoc-image-viewer__close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .ldoc-image-viewer__close:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .ldoc-image-viewer__prev,
      .ldoc-image-viewer__next {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ldoc-image-viewer__prev:hover,
      .ldoc-image-viewer__next:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-50%) scale(1.1);
      }
      .ldoc-image-viewer__prev:disabled,
      .ldoc-image-viewer__next:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .ldoc-image-viewer__prev {
        left: 20px;
      }
      .ldoc-image-viewer__next {
        right: 20px;
      }
      .ldoc-image-viewer__footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: #fff;
      }
      .ldoc-image-viewer__caption {
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        max-width: 80%;
      }
      .ldoc-image-viewer__count {
        font-size: 14px;
        opacity: 0.8;
        font-variant-numeric: tabular-nums;
      }
      .ldoc-image-viewer__toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(4px);
      }
      .ldoc-image-viewer__toolbar button {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ldoc-image-viewer__toolbar button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .ldoc-image-viewer__toolbar span {
        color: #fff;
        font-size: 14px;
        min-width: 50px;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }
      .ldoc-image-viewer-enter-active,
      .ldoc-image-viewer-leave-active {
        transition: opacity 0.3s ease;
      }
      .ldoc-image-viewer-enter-from,
      .ldoc-image-viewer-leave-to {
        opacity: 0;
      }
      .ldoc-image-viewer-enter-active .ldoc-image-viewer__image,
      .ldoc-image-viewer-leave-active .ldoc-image-viewer__image {
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .ldoc-image-viewer-enter-from .ldoc-image-viewer__image,
      .ldoc-image-viewer-leave-to .ldoc-image-viewer__image {
        transform: scale(0.9);
      }
      `
    ]
  })
}

export default imageViewerPlugin
