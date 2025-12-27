/**
 * JSDoc/TSDoc 解析器 - 从注释中提取文档信息
 */

import * as ts from 'typescript'

/**
 * JSDoc 标签信息
 */
export interface JSDocTag {
  /** 标签名称（如 'param', 'returns', 'example'） */
  name: string
  /** 标签文本内容 */
  text?: string
  /** 参数名（仅用于 @param） */
  paramName?: string
  /** 类型信息 */
  type?: string
}

/**
 * 解析后的 JSDoc 信息
 */
export interface ParsedJSDoc {
  /** 主要描述 */
  description?: string
  /** 所有标签 */
  tags: JSDocTag[]
  /** 参数文档（@param） */
  params: Map<string, { description?: string; type?: string }>
  /** 返回值文档（@returns） */
  returns?: { description?: string; type?: string }
  /** 示例代码（@example） */
  examples: string[]
  /** 其他标签映射 */
  otherTags: Map<string, string>
}

/**
 * JSDoc 解析器
 */
export class JSDocParser {
  /**
   * 从 TypeScript 节点解析 JSDoc
   */
  static parseJSDoc(node: ts.Node): ParsedJSDoc | null {
    const jsDocComments = (node as any).jsDoc as ts.JSDoc[] | undefined

    if (!jsDocComments || jsDocComments.length === 0) {
      return null
    }

    const result: ParsedJSDoc = {
      tags: [],
      params: new Map(),
      examples: [],
      otherTags: new Map()
    }

    for (const jsDoc of jsDocComments) {
      // 提取主要描述
      if (jsDoc.comment) {
        const commentText = this.getCommentText(jsDoc.comment)
        if (commentText) {
          result.description = (result.description || '') + commentText
        }
      }

      // 提取标签
      if (jsDoc.tags) {
        for (const tag of jsDoc.tags) {
          const parsedTag = this.parseTag(tag)
          if (parsedTag) {
            result.tags.push(parsedTag)
            this.categorizeTag(parsedTag, result)
          }
        }
      }
    }

    return result
  }

  /**
   * 解析单个 JSDoc 标签
   */
  private static parseTag(tag: ts.JSDocTag): JSDocTag | null {
    const tagName = tag.tagName.text
    const commentText = tag.comment ? this.getCommentText(tag.comment) : undefined

    const result: JSDocTag = {
      name: tagName,
      text: commentText
    }

    // 处理 @param 标签
    if (ts.isJSDocParameterTag(tag)) {
      result.paramName = tag.name?.getText()
      if (tag.typeExpression) {
        result.type = tag.typeExpression.type.getText()
      }
    }

    // 处理 @returns 标签
    if (ts.isJSDocReturnTag(tag)) {
      if (tag.typeExpression) {
        result.type = tag.typeExpression.type.getText()
      }
    }

    // 处理 @type 标签
    if (ts.isJSDocTypeTag(tag)) {
      if (tag.typeExpression) {
        result.type = tag.typeExpression.type.getText()
      }
    }

    return result
  }

  /**
   * 将标签分类到结果对象中
   */
  private static categorizeTag(tag: JSDocTag, result: ParsedJSDoc): void {
    switch (tag.name) {
      case 'param':
        if (tag.paramName) {
          result.params.set(tag.paramName, {
            description: tag.text,
            type: tag.type
          })
        }
        break

      case 'returns':
      case 'return':
        result.returns = {
          description: tag.text,
          type: tag.type
        }
        break

      case 'example':
        if (tag.text) {
          result.examples.push(tag.text)
        }
        break

      case 'deprecated':
      case 'see':
      case 'since':
      case 'internal':
      case 'beta':
      case 'alpha':
        if (tag.text) {
          result.otherTags.set(tag.name, tag.text)
        }
        break

      default:
        // 自定义标签
        if (tag.text) {
          result.otherTags.set(tag.name, tag.text)
        }
        break
    }
  }

  /**
   * 获取注释文本
   */
  private static getCommentText(comment: string | ts.NodeArray<ts.JSDocComment>): string {
    if (typeof comment === 'string') {
      return comment
    }

    return comment
      .map(c => {
        if (typeof c === 'string') {
          return c
        }
        return c.text || ''
      })
      .join('')
  }

  /**
   * 合并 JSDoc 信息到 API 导出项
   */
  static enrichWithJSDoc(exportItem: any, node: ts.Node): void {
    const jsDoc = this.parseJSDoc(node)

    if (!jsDoc) {
      return
    }

    // 添加描述
    if (jsDoc.description) {
      exportItem.description = jsDoc.description
    }

    // 添加参数文档
    if (exportItem.params && jsDoc.params.size > 0) {
      for (const param of exportItem.params) {
        const paramDoc = jsDoc.params.get(param.name)
        if (paramDoc) {
          if (paramDoc.description) {
            param.description = paramDoc.description
          }
          if (paramDoc.type && !param.type) {
            param.type = paramDoc.type
          }
        }
      }
    }

    // 添加返回值文档
    if (jsDoc.returns) {
      if (!exportItem.returns) {
        exportItem.returns = {}
      }
      if (jsDoc.returns.description) {
        exportItem.returns.description = jsDoc.returns.description
      }
      if (jsDoc.returns.type && !exportItem.returns.type) {
        exportItem.returns.type = jsDoc.returns.type
      }
    }

    // 添加示例
    if (jsDoc.examples.length > 0) {
      exportItem.examples = jsDoc.examples
    }

    // 添加其他标签
    if (jsDoc.otherTags.size > 0) {
      exportItem.tags = Object.fromEntries(jsDoc.otherTags)
    }
  }

  /**
   * 从源代码字符串解析 JSDoc（用于测试）
   */
  static parseFromSource(source: string): ParsedJSDoc | null {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      source,
      ts.ScriptTarget.Latest,
      true
    )

    let result: ParsedJSDoc | null = null

    ts.forEachChild(sourceFile, node => {
      const parsed = this.parseJSDoc(node)
      if (parsed) {
        result = parsed
      }
    })

    return result
  }
}

/**
 * 从 TypeScript 节点提取 JSDoc 信息
 */
export function extractJSDoc(node: ts.Node): ParsedJSDoc | null {
  return JSDocParser.parseJSDoc(node)
}

/**
 * 将 JSDoc 信息合并到 API 导出项
 */
export function enrichWithJSDoc(exportItem: any, node: ts.Node): void {
  JSDocParser.enrichWithJSDoc(exportItem, node)
}

