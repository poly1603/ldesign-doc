import LDocExportButton from './LDocExportButton.vue'
import { usePluginUI } from '../../client/composables/usePluginContext'

type ExportOverlayApi = {
  open: (title: string) => void
  setPhase: (text: string) => void
  setProgress: (pct: number | null) => void
  setDetail: (text: string) => void
  log: (text: string) => void
  setCancelable: (cancelable: boolean, onCancel?: () => void) => void
  close: () => void
}

function createExportOverlay(): ExportOverlayApi {
  let overlay: HTMLDivElement | null = null
  let phaseEl: HTMLDivElement | null = null
  let titleEl: HTMLDivElement | null = null
  let detailEl: HTMLDivElement | null = null
  let barEl: HTMLDivElement | null = null
  let logsEl: HTMLDivElement | null = null
  let cancelBtn: HTMLButtonElement | null = null
  let cancelHandler: (() => void) | undefined

  const ensureStyle = () => {
    if (document.getElementById('ldoc-export-overlay-style')) return
    const style = document.createElement('style')
    style.id = 'ldoc-export-overlay-style'
    style.textContent = `
      .ldoc-export-overlay{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);backdrop-filter:blur(4px)}
      .ldoc-export-overlay__panel{width:min(560px,calc(100vw - 32px));max-height:min(70vh,720px);background:var(--ldoc-c-bg,#fff);border:1px solid var(--ldoc-c-divider,#e5e7eb);border-radius:14px;box-shadow:0 20px 70px rgba(0,0,0,.35);padding:16px;display:flex;flex-direction:column;gap:10px}
      .ldoc-export-overlay__title{font-size:15px;font-weight:700;color:var(--ldoc-c-text-1,#111827)}
      .ldoc-export-overlay__phase{font-size:13px;color:var(--ldoc-c-text-2,#6b7280)}
      .ldoc-export-overlay__progress{height:10px;border-radius:999px;background:var(--ldoc-c-bg-soft,#f3f4f6);overflow:hidden;border:1px solid var(--ldoc-c-divider,#e5e7eb)}
      .ldoc-export-overlay__bar{height:100%;width:0%;background:linear-gradient(90deg,var(--ldoc-c-brand,#3b82f6),var(--ldoc-c-brand-2,#60a5fa));transition:width .15s ease}
      .ldoc-export-overlay__bar--indeterminate{width:35%;animation:ldoc-export-indeterminate 1.2s ease-in-out infinite}
      @keyframes ldoc-export-indeterminate{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}
      .ldoc-export-overlay__detail{font-size:12px;color:var(--ldoc-c-text-3,#9ca3af)}
      .ldoc-export-overlay__logs{border:1px solid var(--ldoc-c-divider,#e5e7eb);background:var(--ldoc-c-bg-soft,#f9fafb);border-radius:10px;padding:10px;overflow:auto;flex:1;min-height:120px}
      .ldoc-export-overlay__log{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace;font-size:12px;line-height:1.5;color:var(--ldoc-c-text-2,#6b7280);white-space:pre-wrap;word-break:break-word}
      .ldoc-export-overlay__actions{display:flex;justify-content:flex-end;gap:10px}
      .ldoc-export-overlay__btn{height:34px;padding:0 12px;border-radius:10px;border:1px solid var(--ldoc-c-divider,#e5e7eb);background:transparent;color:var(--ldoc-c-text-2,#6b7280);cursor:pointer;font-size:13px}
      .ldoc-export-overlay__btn:disabled{opacity:.5;cursor:not-allowed}
    `.trim()
    document.head.appendChild(style)
  }

  const ensureDom = () => {
    if (overlay) return
    ensureStyle()
    overlay = document.createElement('div')
    overlay.className = 'ldoc-export-overlay'
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && cancelBtn && !cancelBtn.disabled) {
        cancelBtn.click()
      }
    })

    const panel = document.createElement('div')
    panel.className = 'ldoc-export-overlay__panel'

    titleEl = document.createElement('div')
    titleEl.className = 'ldoc-export-overlay__title'
    titleEl.textContent = '导出'

    phaseEl = document.createElement('div')
    phaseEl.className = 'ldoc-export-overlay__phase'
    phaseEl.textContent = ''

    const progress = document.createElement('div')
    progress.className = 'ldoc-export-overlay__progress'

    barEl = document.createElement('div')
    barEl.className = 'ldoc-export-overlay__bar ldoc-export-overlay__bar--indeterminate'
    progress.appendChild(barEl)

    detailEl = document.createElement('div')
    detailEl.className = 'ldoc-export-overlay__detail'
    detailEl.textContent = ''

    logsEl = document.createElement('div')
    logsEl.className = 'ldoc-export-overlay__logs'

    const actions = document.createElement('div')
    actions.className = 'ldoc-export-overlay__actions'

    cancelBtn = document.createElement('button')
    cancelBtn.className = 'ldoc-export-overlay__btn'
    cancelBtn.type = 'button'
    cancelBtn.textContent = '取消'
    cancelBtn.disabled = true
    cancelBtn.addEventListener('click', () => {
      if (cancelBtn?.disabled) return
      cancelHandler?.()
    })

    actions.appendChild(cancelBtn)
    panel.appendChild(titleEl)
    panel.appendChild(phaseEl)
    panel.appendChild(progress)
    panel.appendChild(detailEl)
    panel.appendChild(logsEl)
    panel.appendChild(actions)
    overlay.appendChild(panel)
  }

  const api: ExportOverlayApi = {
    open(title: string) {
      ensureDom()
      if (!overlay) return
      titleEl!.textContent = title
      phaseEl!.textContent = ''
      detailEl!.textContent = ''
      barEl!.classList.add('ldoc-export-overlay__bar--indeterminate')
      barEl!.style.width = '0%'
      if (logsEl) logsEl.innerHTML = ''
      document.body.appendChild(overlay)
    },
    setPhase(text: string) {
      if (phaseEl) phaseEl.textContent = text
    },
    setProgress(pct: number | null) {
      if (!barEl) return
      if (pct === null || Number.isNaN(pct)) {
        barEl.classList.add('ldoc-export-overlay__bar--indeterminate')
        barEl.style.width = '0%'
        return
      }
      barEl.classList.remove('ldoc-export-overlay__bar--indeterminate')
      const clamped = Math.max(0, Math.min(100, pct))
      barEl.style.width = `${clamped}%`
    },
    setDetail(text: string) {
      if (detailEl) detailEl.textContent = text
    },
    log(text: string) {
      if (!logsEl) return
      const line = document.createElement('div')
      line.className = 'ldoc-export-overlay__log'
      line.textContent = text
      logsEl.appendChild(line)
      logsEl.scrollTop = logsEl.scrollHeight
    },
    setCancelable(cancelable: boolean, onCancel?: () => void) {
      cancelHandler = onCancel
      if (cancelBtn) cancelBtn.disabled = !cancelable
    },
    close() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay)
      cancelHandler = undefined
      if (cancelBtn) cancelBtn.disabled = true
    }
  }
  return api
}

export const globalComponents = [
  { name: 'LDocExportButton', component: LDocExportButton }
]

// Add export functionality
if (typeof window !== 'undefined') {
  window.addEventListener('ldoc:export', function (e: any) {
    const { format } = e.detail;

    const ui = usePluginUI()

    const overlay = createExportOverlay()

    const btn = document.querySelector('.ldoc-export-button__btn') as HTMLButtonElement | null;
    const originalHtml = btn ? btn.innerHTML : '';

    const setLoading = (loading: boolean) => {
      if (!btn) return;
      btn.disabled = loading;
      btn.innerHTML = loading
        ? '<div class="ldoc-export-button__spinner"></div><span>导出中...</span>'
        : originalHtml;
    };

    const downloadBlob = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const exportUrl = () => {
      const path = window.location.pathname + window.location.search + window.location.hash;
      const url = `/__ldoc/export?format=${encodeURIComponent(format)}&path=${encodeURIComponent(path)}`;
      return url;
    };

    (async () => {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
      try {
        setLoading(true);
        overlay.open(`导出 ${String(format).toUpperCase()}`)
        overlay.setPhase('正在生成中...')
        overlay.setProgress(null)
        overlay.setCancelable(!!controller, () => {
          controller?.abort()
          overlay.log('已取消')
          overlay.close()
          setLoading(false)
        })
        overlay.log(`请求: ${exportUrl()}`)

        const res = await fetch(exportUrl(), { method: 'GET', signal: controller?.signal as any });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Export failed: ${res.status} ${res.statusText}${text ? `\n${text}` : ''}`);
        }
        if (contentType.includes('application/json')) {
          const text = await res.text().catch(() => '')
          throw new Error(`Export returned JSON error payload\n${text}`)
        }

        overlay.setPhase('正在导出中...')

        const ext = format === 'pdf' ? 'pdf' : format === 'html' ? 'html' : format;
        const filename = `ldoc-export-${Date.now()}.${ext}`;

        const total = Number(res.headers.get('content-length') || '0')
        const supportsStream = !!(res.body && typeof (res.body as any).getReader === 'function')
        let blob: Blob

        if (supportsStream) {
          const reader = (res.body as any).getReader()
          const chunks: BlobPart[] = []
          let received = 0
          overlay.setProgress(total > 0 ? 0 : null)

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) {
              chunks.push(value as unknown as BlobPart)
              received += value.byteLength
              if (total > 0) {
                overlay.setProgress((received / total) * 100)
                overlay.setDetail(`${Math.round(received / 1024)} KB / ${Math.round(total / 1024)} KB`)
              } else {
                overlay.setDetail(`${Math.round(received / 1024)} KB`)
              }
            }
          }
          blob = new Blob(chunks, { type: contentType || 'application/octet-stream' })
        } else {
          overlay.setProgress(null)
          blob = await res.blob();
        }

        // Basic sanity check
        if (!blob || blob.size === 0) {
          throw new Error('Export returned empty file');
        }

        overlay.setProgress(100)
        overlay.setDetail(`${Math.round(blob.size / 1024)} KB`)
        overlay.log(`完成: ${filename}`)

        downloadBlob(blob, filename);
        setTimeout(() => overlay.close(), 450)
      } catch (err) {
        console.error('[ldoc:export] export error:', err);
        const message = err instanceof Error ? err.message : String(err)
        overlay.log(message || '导出失败')
        ui.showToast(message || '导出失败', { type: 'error', duration: 5000 })
        overlay.setPhase('导出失败')
        overlay.setProgress(100)
      } finally {
        setLoading(false);
        overlay.setCancelable(false)
      }
    })();
  });
}

export default { globalComponents }
