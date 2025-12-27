/**
 * 搜索过滤器功能
 * 支持按分类、标签等条件过滤搜索结果
 */

import type { SearchDocument } from './index'

export interface FilterCriteria {
  [field: string]: string | string[] | undefined
}

/**
 * 应用过滤器到搜索结果
 * 根据过滤条件筛选文档
 */
export function applyFilters(
  documents: SearchDocument[],
  filters: FilterCriteria
): SearchDocument[] {
  if (!filters || Object.keys(filters).length === 0) {
    return documents
  }

  return documents.filter(doc => {
    // 检查每个过滤条件
    for (const [field, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue

      // 获取文档中的字段值
      const docValue = getFieldValue(doc, field)

      if (docValue === undefined || docValue === null) {
        return false
      }

      // 检查是否匹配
      if (!matchesFilter(docValue, value)) {
        return false
      }
    }

    return true
  })
}

/**
 * 从文档中获取字段值
 * 支持嵌套字段（如 'metadata.category'）
 */
function getFieldValue(doc: SearchDocument, field: string): unknown {
  // 处理直接字段
  if (field in doc) {
    return doc[field as keyof SearchDocument]
  }

  // 处理嵌套字段
  if (field.includes('.')) {
    const parts = field.split('.')
    let value: any = doc

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return undefined
      }
    }

    return value
  }

  // 检查 metadata
  if (doc.metadata && field in doc.metadata) {
    return doc.metadata[field]
  }

  return undefined
}

/**
 * 检查值是否匹配过滤条件
 */
function matchesFilter(docValue: unknown, filterValue: string | string[]): boolean {
  // 如果过滤值是数组，检查是否包含任一值
  if (Array.isArray(filterValue)) {
    if (filterValue.length === 0) return true

    if (Array.isArray(docValue)) {
      // 文档值也是数组，检查是否有交集
      return filterValue.some(fv => docValue.includes(fv))
    } else {
      // 文档值是单个值，检查是否在过滤数组中
      return filterValue.includes(String(docValue))
    }
  }

  // 过滤值是单个值
  if (Array.isArray(docValue)) {
    // 文档值是数组，检查是否包含过滤值
    return docValue.includes(filterValue)
  } else {
    // 都是单个值，直接比较
    return String(docValue) === String(filterValue)
  }
}

/**
 * 获取可用的过滤选项
 * 从文档集合中提取所有可能的过滤值
 */
export function getAvailableFilterOptions(
  documents: SearchDocument[],
  field: string
): string[] {
  const values = new Set<string>()

  for (const doc of documents) {
    const value = getFieldValue(doc, field)

    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          const strValue = String(v)
          // Only add non-empty values
          if (strValue.length > 0) {
            values.add(strValue)
          }
        })
      } else {
        const strValue = String(value)
        // Only add non-empty values
        if (strValue.length > 0) {
          values.add(strValue)
        }
      }
    }
  }

  return Array.from(values).sort()
}

/**
 * 构建过滤器统计信息
 * 返回每个过滤选项的文档数量
 */
export function getFilterStats(
  documents: SearchDocument[],
  field: string
): Record<string, number> {
  const stats: Record<string, number> = Object.create(null) // Use null prototype to avoid property name conflicts

  for (const doc of documents) {
    const value = getFieldValue(doc, field)

    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          const key = String(v)
          // Only count non-empty values
          if (key.length > 0) {
            stats[key] = (stats[key] || 0) + 1
          }
        })
      } else {
        const key = String(value)
        // Only count non-empty values
        if (key.length > 0) {
          stats[key] = (stats[key] || 0) + 1
        }
      }
    }
  }

  return stats
}

/**
 * 组合多个过滤器
 * 支持 AND 和 OR 逻辑
 */
export function combineFilters(
  documents: SearchDocument[],
  filters: FilterCriteria[],
  logic: 'AND' | 'OR' = 'AND'
): SearchDocument[] {
  if (filters.length === 0) return documents

  if (logic === 'AND') {
    // AND 逻辑：文档必须满足所有过滤器
    let result = documents
    for (const filter of filters) {
      result = applyFilters(result, filter)
    }
    return result
  } else {
    // OR 逻辑：文档满足任一过滤器即可
    const resultSet = new Set<SearchDocument>()
    for (const filter of filters) {
      const filtered = applyFilters(documents, filter)
      filtered.forEach(doc => resultSet.add(doc))
    }
    return Array.from(resultSet)
  }
}

/**
 * 创建过滤器构建器
 * 提供链式 API 构建复杂过滤条件
 */
export class FilterBuilder {
  private filters: FilterCriteria = {}

  /**
   * 添加过滤条件
   */
  add(field: string, value: string | string[]): FilterBuilder {
    this.filters[field] = value
    return this
  }

  /**
   * 移除过滤条件
   */
  remove(field: string): FilterBuilder {
    delete this.filters[field]
    return this
  }

  /**
   * 清空所有过滤条件
   */
  clear(): FilterBuilder {
    this.filters = {}
    return this
  }

  /**
   * 获取过滤条件
   */
  build(): FilterCriteria {
    return { ...this.filters }
  }

  /**
   * 应用过滤器
   */
  apply(documents: SearchDocument[]): SearchDocument[] {
    return applyFilters(documents, this.filters)
  }
}
