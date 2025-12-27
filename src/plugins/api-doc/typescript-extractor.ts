/**
 * TypeScript 解析器 - 使用 TypeScript Compiler API 提取类型信息
 */

import * as ts from 'typescript'
import { enrichWithJSDoc } from './jsdoc-parser'
import type { ApiExport, ApiModule, ApiParam, ApiReturn, ApiTypeParameter, ApiMember } from './index'

/**
 * TypeScript 提取器配置
 */
export interface TypeScriptExtractorOptions {
  /** 源文件路径列表 */
  files: string[]
  /** TypeScript 编译选项 */
  compilerOptions?: ts.CompilerOptions
}

/**
 * TypeScript 提取器
 */
export class TypeScriptExtractor {
  private program: ts.Program
  private checker: ts.TypeChecker
  private sourceFiles: ts.SourceFile[]

  constructor(options: TypeScriptExtractorOptions) {
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      esModuleInterop: true,
      skipLibCheck: true,
      ...options.compilerOptions
    }

    this.program = ts.createProgram(options.files, compilerOptions)
    this.checker = this.program.getTypeChecker()
    this.sourceFiles = this.program.getSourceFiles().filter(
      sf => !sf.isDeclarationFile && options.files.includes(sf.fileName)
    )
  }

  /**
   * 提取所有模块
   */
  extractModules(): ApiModule[] {
    const modules: ApiModule[] = []

    for (const sourceFile of this.sourceFiles) {
      const module = this.extractModule(sourceFile)
      if (module.exports.length > 0) {
        modules.push(module)
      }
    }

    return modules
  }

  /**
   * 提取单个模块
   */
  private extractModule(sourceFile: ts.SourceFile): ApiModule {
    const exports: ApiExport[] = []

    // 遍历源文件的所有语句
    ts.forEachChild(sourceFile, node => {
      // 检查是否是导出声明
      if (this.isExported(node)) {
        const exportItem = this.extractExport(node, sourceFile)
        if (exportItem) {
          exports.push(exportItem)
        }
      }
    })

    return {
      name: this.getModuleName(sourceFile),
      path: sourceFile.fileName,
      exports
    }
  }

  /**
   * 提取导出项
   */
  private extractExport(node: ts.Node, sourceFile: ts.SourceFile): ApiExport | null {
    // 函数声明
    if (ts.isFunctionDeclaration(node) && node.name) {
      return this.extractFunction(node, sourceFile)
    }

    // 类声明
    if (ts.isClassDeclaration(node) && node.name) {
      return this.extractClass(node, sourceFile)
    }

    // 接口声明
    if (ts.isInterfaceDeclaration(node)) {
      return this.extractInterface(node, sourceFile)
    }

    // 类型别名
    if (ts.isTypeAliasDeclaration(node)) {
      return this.extractTypeAlias(node, sourceFile)
    }

    // 枚举声明
    if (ts.isEnumDeclaration(node)) {
      return this.extractEnum(node, sourceFile)
    }

    // 变量声明
    if (ts.isVariableStatement(node)) {
      return this.extractVariable(node, sourceFile)
    }

    return null
  }

  /**
   * 提取函数
   */
  private extractFunction(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): ApiExport {
    const name = node.name!.getText()
    const signature = this.getSignature(node)
    const params = this.extractParameters(node.parameters)
    const returns = this.extractReturnType(node)
    const typeParameters = this.extractTypeParameters(node.typeParameters)

    const exportItem: ApiExport = {
      name,
      kind: 'function',
      signature,
      params,
      returns,
      typeParameters,
      source: this.getSourceLocation(node, sourceFile)
    }

    // 添加 JSDoc 信息
    enrichWithJSDoc(exportItem, node)

    return exportItem
  }

  /**
   * 提取类
   */
  private extractClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): ApiExport {
    const name = node.name!.getText()
    const signature = this.getSignature(node)
    const members = this.extractClassMembers(node)
    const typeParameters = this.extractTypeParameters(node.typeParameters)

    const exportItem: ApiExport = {
      name,
      kind: 'class',
      signature,
      members,
      typeParameters,
      source: this.getSourceLocation(node, sourceFile)
    }

    // 添加 JSDoc 信息
    enrichWithJSDoc(exportItem, node)

    return exportItem
  }

  /**
   * 提取接口
   */
  private extractInterface(node: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): ApiExport {
    const name = node.name.getText()
    const signature = this.getSignature(node)
    const members = this.extractInterfaceMembers(node)
    const typeParameters = this.extractTypeParameters(node.typeParameters)

    const exportItem: ApiExport = {
      name,
      kind: 'interface',
      signature,
      members,
      typeParameters,
      source: this.getSourceLocation(node, sourceFile)
    }

    // 添加 JSDoc 信息
    enrichWithJSDoc(exportItem, node)

    return exportItem
  }

  /**
   * 提取类型别名
   */
  private extractTypeAlias(node: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): ApiExport {
    const name = node.name.getText()
    const signature = this.getSignature(node)
    const typeParameters = this.extractTypeParameters(node.typeParameters)

    return {
      name,
      kind: 'type',
      signature,
      typeParameters,
      source: this.getSourceLocation(node, sourceFile)
    }
  }

  /**
   * 提取枚举
   */
  private extractEnum(node: ts.EnumDeclaration, sourceFile: ts.SourceFile): ApiExport {
    const name = node.name.getText()
    const signature = this.getSignature(node)

    return {
      name,
      kind: 'enum',
      signature,
      source: this.getSourceLocation(node, sourceFile)
    }
  }

  /**
   * 提取变量
   */
  private extractVariable(node: ts.VariableStatement, sourceFile: ts.SourceFile): ApiExport | null {
    const declaration = node.declarationList.declarations[0]
    if (!declaration || !declaration.name || !ts.isIdentifier(declaration.name)) {
      return null
    }

    const name = declaration.name.getText()
    const signature = this.getSignature(node)

    return {
      name,
      kind: 'const',
      signature,
      source: this.getSourceLocation(node, sourceFile)
    }
  }

  /**
   * 提取参数
   */
  private extractParameters(parameters: ts.NodeArray<ts.ParameterDeclaration>): ApiParam[] {
    return parameters.map(param => {
      const name = param.name.getText()
      const type = param.type ? param.type.getText() : 'any'
      const optional = !!param.questionToken
      const defaultValue = param.initializer ? param.initializer.getText() : undefined

      return {
        name,
        type,
        optional,
        default: defaultValue
      }
    })
  }

  /**
   * 提取返回类型
   */
  private extractReturnType(node: ts.FunctionDeclaration | ts.MethodDeclaration): ApiReturn | undefined {
    if (!node.type) {
      return undefined
    }

    return {
      type: node.type.getText()
    }
  }

  /**
   * 提取类型参数
   */
  private extractTypeParameters(
    typeParameters: ts.NodeArray<ts.TypeParameterDeclaration> | undefined
  ): ApiTypeParameter[] | undefined {
    if (!typeParameters || typeParameters.length === 0) {
      return undefined
    }

    return typeParameters.map(tp => {
      const name = tp.name.getText()
      const constraint = tp.constraint ? tp.constraint.getText() : undefined
      const defaultType = tp.default ? tp.default.getText() : undefined

      return {
        name,
        constraint,
        default: defaultType
      }
    })
  }

  /**
   * 提取类成员
   */
  private extractClassMembers(node: ts.ClassDeclaration): ApiMember[] {
    const members: ApiMember[] = []

    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && member.name) {
        members.push(this.extractProperty(member))
      } else if (ts.isMethodDeclaration(member) && member.name) {
        members.push(this.extractMethod(member))
      } else if (ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member)) {
        if (member.name) {
          members.push(this.extractAccessor(member))
        }
      }
    }

    return members
  }

  /**
   * 提取接口成员
   */
  private extractInterfaceMembers(node: ts.InterfaceDeclaration): ApiMember[] {
    const members: ApiMember[] = []

    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) {
        members.push(this.extractPropertySignature(member))
      } else if (ts.isMethodSignature(member) && member.name) {
        members.push(this.extractMethodSignature(member))
      }
    }

    return members
  }

  /**
   * 提取属性
   */
  private extractProperty(node: ts.PropertyDeclaration): ApiMember {
    const name = node.name.getText()
    const signature = node.type ? node.type.getText() : 'any'
    const optional = !!node.questionToken
    const readonly = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false

    return {
      name,
      kind: 'property',
      signature,
      optional,
      readonly
    }
  }

  /**
   * 提取方法
   */
  private extractMethod(node: ts.MethodDeclaration): ApiMember {
    const name = node.name.getText()
    const signature = this.getSignature(node)
    const params = this.extractParameters(node.parameters)
    const returns = this.extractReturnType(node)

    return {
      name,
      kind: 'method',
      signature,
      params,
      returns
    }
  }

  /**
   * 提取访问器
   */
  private extractAccessor(node: ts.AccessorDeclaration): ApiMember {
    const name = node.name.getText()
    const signature = this.getSignature(node)

    return {
      name,
      kind: 'accessor',
      signature
    }
  }

  /**
   * 提取属性签名
   */
  private extractPropertySignature(node: ts.PropertySignature): ApiMember {
    const name = node.name.getText()
    const signature = node.type ? node.type.getText() : 'any'
    const optional = !!node.questionToken
    const readonly = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword) || false

    return {
      name,
      kind: 'property',
      signature,
      optional,
      readonly
    }
  }

  /**
   * 提取方法签名
   */
  private extractMethodSignature(node: ts.MethodSignature): ApiMember {
    const name = node.name.getText()
    const signature = this.getSignature(node)
    const params = this.extractParameters(node.parameters)
    const returns = node.type ? { type: node.type.getText() } : undefined

    return {
      name,
      kind: 'method',
      signature,
      params,
      returns
    }
  }

  /**
   * 获取签名字符串
   */
  private getSignature(node: ts.Node): string {
    return node.getText()
  }

  /**
   * 获取源文件位置
   */
  private getSourceLocation(node: ts.Node, sourceFile: ts.SourceFile) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
    return {
      file: sourceFile.fileName,
      line: line + 1
    }
  }

  /**
   * 获取模块名称
   */
  private getModuleName(sourceFile: ts.SourceFile): string {
    const fileName = sourceFile.fileName
    const parts = fileName.split(/[/\\]/)
    const baseName = parts[parts.length - 1]
    return baseName.replace(/\.tsx?$/, '')
  }

  /**
   * 检查节点是否被导出
   */
  private isExported(node: ts.Node): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
  }
}

/**
 * 从 TypeScript 文件提取 API 文档
 */
export function extractTypeScriptApi(files: string[], compilerOptions?: ts.CompilerOptions): ApiModule[] {
  const extractor = new TypeScriptExtractor({ files, compilerOptions })
  return extractor.extractModules()
}

