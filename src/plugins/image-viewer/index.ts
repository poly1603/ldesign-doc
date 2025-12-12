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

    const open = (src: string, alt = '') => {
      currentSrc.value = src
      currentAlt.value = alt
      scale.value = 1
      position.value = { x: 0, y: 0 }
      visible.value = true
      document.body.style.overflow = 'hidden'
    }

    const close = () => {
      visible.value = false
      document.body.style.overflow = ''
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
      if (e.key === 'Escape' && visible.value) {
        close()
      }
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
          h('button', {
            class: 'ldoc-image-viewer__close',
            onClick: close
          }, '×'),
          currentAlt.value && h('div', {
            class: 'ldoc-image-viewer__info'
          }, currentAlt.value),
          h('div', {
            class: 'ldoc-image-viewer__controls'
          }, [
            h('button', { onClick: (e: Event) => { e.stopPropagation(); scale.value = Math.max(0.5, scale.value - 0.25) } }, '−'),
            h('span', {}, `${Math.round(scale.value * 100)}%`),
            h('button', { onClick: (e: Event) => { e.stopPropagation(); scale.value = Math.min(5, scale.value + 0.25) } }, '+'),
            h('button', { onClick: (e: Event) => { e.stopPropagation(); scale.value = 1; position.value = { x: 0, y: 0 } } }, '⟲')
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
      .ldoc-image-viewer__info {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 14px;
        border-radius: 4px;
        max-width: 80%;
        text-align: center;
      }
      .ldoc-image-viewer__controls {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 8px;
      }
      .ldoc-image-viewer__controls button {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .ldoc-image-viewer__controls button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .ldoc-image-viewer__controls span {
        color: #fff;
        font-size: 14px;
        min-width: 60px;
        text-align: center;
      }
      .ldoc-image-viewer-enter-active,
      .ldoc-image-viewer-leave-active {
        transition: opacity 0.2s ease;
      }
      .ldoc-image-viewer-enter-from,
      .ldoc-image-viewer-leave-to {
        opacity: 0;
      }
      `
    ]
  })
}

export default imageViewerPlugin
