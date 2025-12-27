/**
 * 类型链接器 - 识别类型引用并生成到类型文档的链接
 */

import type { ApiExport, ApiModule } from './index'

/**
 * 类型链接选项
 */
export interface TypeLinkerOptions {
  /** 输出目录 */
  outDir: string
  /** 是否启用类型链接 */
  enabled?: boolean
}

/**
 * 类型引用信息
 */
export interface TypeReference {
  /** 类型名称 */
  name: string
  /** 链接 URL */
  link?: string
  /** 是否找到定义 */
  found: boolean
}

/**
 * 类型链接器
 */
export class TypeLinker {
  private typeMap: Map<string, string>
  private options: TypeLinkerOptions

  constructor(modules: ApiModule[], options: TypeLinkerOptions) {
    this.options = options
    this.typeMap = this.buildTypeMap(modules)
  }

  /**
   * 构建类型映射表
   */
  private buildTypeMap(modules: ApiModule[]): Map<string, string> {
    const map = new Map<string, string>()

    for (const module of modules) {
      for (const exportItem of module.exports) {
        // 只为类型相关的导出创建映射
        if (this.isTypeExport(exportItem)) {
          const link = this.generateLink(module, exportItem)
          map.set(exportItem.name, link)
        }
      }
    }

    return map
  }

  /**
   * 检查是否是类型导出
   */
  private isTypeExport(exportItem: ApiExport): boolean {
    return ['interface', 'type', 'class', 'enum'].includes(exportItem.kind)
  }

  /**
   * 生成类型链接
   */
  private generateLink(module: ApiModule, exportItem: ApiExport): string {
    const { outDir } = this.options
    return `/${outDir}/${module.name}#${exportItem.name}`
  }

  /**
   * 解析类型字符串中的类型引用
   */
  parseTypeReferences(typeString: string): TypeReference[] {
    if (!this.options.enabled) {
      return []
    }

    const references: TypeReference[] = []

    // 提取类型名称（简单实现）
    const typeNames = this.extractTypeNames(typeString)

    for (const typeName of typeNames) {
      const link = this.typeMap.get(typeName)
      references.push({
        name: typeName,
        link,
        found: !!link
      })
    }

    return references
  }

  /**
   * 从类型字符串中提取类型名称
   */
  private extractTypeNames(typeString: string): string[] {
    // 简单的类型名称提取
    // 匹配大写字母开头的标识符
    const regex = /\b[A-Z][a-zA-Z0-9]*\b/g
    const matches = typeString.match(regex)

    if (!matches) {
      return []
    }

    // 去重
    return Array.from(new Set(matches))
  }

  /**
   * 为类型字符串添加链接标记
   */
  linkifyType(typeString: string): string {
    if (!this.options.enabled) {
      return typeString
    }

    let result = typeString
    const references = this.parseTypeReferences(typeString)

    for (const ref of references) {
      if (ref.link) {
        // 替换类型名称为 Markdown 链接
        const linkMarkdown = `[${ref.name}](${ref.link})`
        result = result.replace(new RegExp(`\\b${ref.name}\\b`, 'g'), linkMarkdown)
      }
    }

    return result
  }

  /**
   * 为 API 导出项添加类型链接
   */
  enrichWithTypeLinks(exportItem: ApiExport): void {
    if (!this.options.enabled) {
      return
    }

    // 为参数类型添加链接
    if (exportItem.params) {
      for (const param of exportItem.params) {
        if (param.type) {
          const references = this.parseTypeReferences(param.type)
          if (references.some(r => r.found)) {
            param.type = this.linkifyType(param.type)
          }
        }
      }
    }

    // 为返回类型添加链接
    if (exportItem.returns && exportItem.returns.type) {
      const references = this.parseTypeReferences(exportItem.returns.type)
      if (references.some(r => r.found)) {
        exportItem.returns.type = this.linkifyType(exportItem.returns.type)
      }
    }

    // 为类型参数添加链接
    if (exportItem.typeParameters) {
      for (const typeParam of exportItem.typeParameters) {
        if (typeParam.constraint) {
          const references = this.parseTypeReferences(typeParam.constraint)
          if (references.some(r => r.found)) {
            typeParam.constraint = this.linkifyType(typeParam.constraint)
          }
        }
        if (typeParam.default) {
          const references = this.parseTypeReferences(typeParam.default)
          if (references.some(r => r.found)) {
            typeParam.default = this.linkifyType(typeParam.default)
          }
        }
      }
    }

    // 为成员类型添加链接
    if (exportItem.members) {
      for (const member of exportItem.members) {
        if (member.signature) {
          const references = this.parseTypeReferences(member.signature)
          if (references.some(r => r.found)) {
            member.signature = this.linkifyType(member.signature)
          }
        }
      }
    }
  }

  /**
   * 获取类型链接
   */
  getTypeLink(typeName: string): string | undefined {
    return this.typeMap.get(typeName)
  }

  /**
   * 检查类型是否有文档
   */
  hasTypeDocumentation(typeName: string): boolean {
    return this.typeMap.has(typeName)
  }
}

/**
 * 创建类型链接器
 */
export function createTypeLinker(modules: ApiModule[], options: TypeLinkerOptions): TypeLinker {
  return new TypeLinker(modules, options)
}

/**
 * 为模块添加类型链接
 */
export function enrichModulesWithTypeLinks(modules: ApiModule[], options: TypeLinkerOptions): void {
  const linker = createTypeLinker(modules, options)

  for (const module of modules) {
    for (const exportItem of module.exports) {
      linker.enrichWithTypeLinks(exportItem)
    }
  }
}

