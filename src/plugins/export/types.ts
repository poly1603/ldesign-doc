export interface ExportFormat {
  value: string
  label: string
}

export interface Props {
  buttonText?: string
  formats?: ExportFormat[]
  loading?: boolean
  position?: 'nav' | 'doc-bottom' | 'floating'
}
