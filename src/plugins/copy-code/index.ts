/**
 * 代码复制插件 - 为代码块添加复制按钮
 */

import { definePlugin } from '../../plugin/definePlugin'
import type { LDocPlugin } from '../../shared/types'

export interface CopyCodePluginOptions {
  /** 复制按钮文本 */
  buttonText?: string
  /** 复制成功文本 */
  successText?: string
  /** 成功显示时长（毫秒） */
  successDuration?: number
  /** 代码块选择器 */
  selector?: string
  /** 是否显示语言标签 */
  showLanguage?: boolean
  /** 排除的语言 */
  excludeLanguages?: string[]
}

/**
 * 代码复制插件
 */
export function copyCodePlugin(options: CopyCodePluginOptions = {}): LDocPlugin {
  const {
    buttonText = '复制',
    successText = '已复制!',
    successDuration = 2000,
    selector = 'div[class*="language-"] pre, pre[class*="language-"]',
    showLanguage = true,
    excludeLanguages = []
  } = options

  return definePlugin({
    name: 'ldoc:copy-code',

    onClientMounted() {
      // 初始化由 headScripts 处理
      // 这里可以添加额外的客户端逻辑
      if (typeof window !== 'undefined') {
        // 监听路由变化后重新初始化
        setTimeout(() => {
          const initFn = (window as any).initCopyButtons
          if (typeof initFn === 'function') {
            initFn()
          }
        }, 100)
      }
    },

    // 注入初始化脚本
    headScripts: [
      `
      function initCopyButtons() {
        const selector = '${selector}';
        const excludeLanguages = ${JSON.stringify(excludeLanguages)};
        const buttonText = '${buttonText}';
        const successText = '${successText}';
        const successDuration = ${successDuration};
        const showLanguage = ${showLanguage};

        document.querySelectorAll(selector).forEach((block) => {
          // 跳过已处理的
          if (block.querySelector('.ldoc-copy-button')) return;

          // 获取语言
          const parent = block.closest('[class*="language-"]') || block;
          const classNames = parent.className || '';
          const langMatch = classNames.match(/language-(\\w+)/);
          const lang = langMatch ? langMatch[1] : '';

          // 检查是否排除
          if (excludeLanguages.includes(lang)) return;

          // 创建包装器
          const wrapper = document.createElement('div');
          wrapper.className = 'ldoc-code-wrapper';
          
          // 创建头部
          const header = document.createElement('div');
          header.className = 'ldoc-code-header';

          // 语言标签
          if (showLanguage && lang) {
            const langLabel = document.createElement('span');
            langLabel.className = 'ldoc-code-lang';
            langLabel.textContent = lang;
            header.appendChild(langLabel);
          }

          // 复制按钮
          const button = document.createElement('button');
          button.className = 'ldoc-copy-button';
          button.textContent = buttonText;
          button.addEventListener('click', async () => {
            try {
              const code = block.textContent || '';
              await navigator.clipboard.writeText(code);
              
              button.textContent = successText;
              button.classList.add('copied');
              
              setTimeout(() => {
                button.textContent = buttonText;
                button.classList.remove('copied');
              }, successDuration);
            } catch (err) {
              console.error('复制失败:', err);
            }
          });
          header.appendChild(button);

          // 插入 DOM
          const parentEl = block.parentElement;
          if (parentEl) {
            parentEl.insertBefore(wrapper, block);
            wrapper.appendChild(header);
            wrapper.appendChild(block);
          }
        });
      }

      // 页面加载完成后初始化
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCopyButtons);
      } else {
        initCopyButtons();
      }

      // 监听路由变化（SPA）
      window.addEventListener('popstate', () => {
        setTimeout(initCopyButtons, 100);
      });
      `
    ],

    // 注入样式
    headStyles: [
      `
      .ldoc-code-wrapper {
        position: relative;
        margin: 16px 0;
      }
      .ldoc-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--ldoc-code-block-bg, #1e1e1e);
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .ldoc-code-lang {
        font-size: 12px;
        color: var(--ldoc-c-text-3, #6b7280);
        text-transform: uppercase;
        font-weight: 500;
      }
      .ldoc-copy-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border: none;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
        color: var(--ldoc-c-text-3, #9ca3af);
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ldoc-copy-button:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }
      .ldoc-copy-button.copied {
        background: var(--ldoc-c-green-1, #10b981);
        color: #fff;
      }
      .ldoc-code-wrapper pre {
        margin: 0 !important;
        border-radius: 0 0 8px 8px !important;
      }
      .ldoc-code-wrapper pre[class*="language-"] {
        margin-top: 0 !important;
      }
      `
    ]
  })
}

export default copyCodePlugin
