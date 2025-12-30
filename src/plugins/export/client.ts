import LDocExportButton from './LDocExportButton.vue'
import type { ExportFormat, Props } from './types'

export const globalComponents = [
  { name: 'LDocExportButton', component: LDocExportButton }
]

// Add export functionality
if (typeof window !== 'undefined') {
  window.addEventListener('ldoc:export', function (e: any) {
    const { format } = e.detail;

    if (format === 'pdf') {
      const btn = document.querySelector('.ldoc-export-button__btn') as HTMLButtonElement;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="ldoc-export-button__spinner"></div><span>导出中...</span>';
      }

      setTimeout(function () {
        window.print();
      }, 100);

      setTimeout(function () {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<svg class="ldoc-export-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>导出文档</span>';
        }
      }, 2000);
    }
  });
}

export default { globalComponents }
