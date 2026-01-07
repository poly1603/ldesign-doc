export interface ExportFormat {
  value: string
  label: string
}

/** 导出范围 */
export type ExportScope = 'current' | 'all'

/** 导出配置 */
export interface ExportConfig {
  format: string
  scope: ExportScope
}

export interface Props {
  buttonText?: string
  formats?: ExportFormat[]
  loading?: boolean
  position?: 'nav' | 'doc-bottom' | 'floating'
  /** 是否显示导出范围选项 */
  showScopeOption?: boolean
}
