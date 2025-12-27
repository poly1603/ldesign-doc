/**
 * 导航结构生成器 - 根据模块层级生成侧边栏导航
 */

import type { ApiModule, ApiGroup } from './index'
import type { SidebarItem } from '../../shared/types'

/**
 * 导航生成选项
 */
export interface NavigationOptions {
  /** 分组配置 */
  groups?: ApiGroup[]
  /** 输出目录 */
  outDir: string
  /** 是否按字母排序 */
  sortAlphabetically?: boolean
}

/**
 * 导航生成器
 */
export class NavigationGenerator {
  private options: NavigationOptions

  constructor(options: NavigationOptions) {
    this.options = options
  }

  /**
   * 从模块列表生成导航结构
   */
  generateNavigation(modules: ApiModule[]): SidebarItem[] {
    if (this.options.groups && this.options.groups.length > 0) {
      return this.generateGroupedNavigation(modules)
    }

    return this.generateFlatNavigation(modules)
  }

  /**
   * 生成分组导航
   */
  private generateGroupedNavigation(modules: ApiModule[]): SidebarItem[] {
    const groups = this.options.groups!
    const navigation: SidebarItem[] = []

    for (const group of groups) {
      const groupModules = this.filterModulesByPattern(modules, group.pattern)

      if (groupModules.length === 0) {
        continue
      }

      const groupItem: SidebarItem = {
        text: group.title,
        collapsed: false,
        items: this.generateModuleItems(groupModules)
      }

      if (group.description) {
        groupItem.description = group.description
      }

      navigation.push(groupItem)
    }

    // 添加未分组的模块
    const ungroupedModules = this.getUngroupedModules(modules)
    if (ungroupedModules.length > 0) {
      navigation.push({
        text: 'Other',
        collapsed: true,
        items: this.generateModuleItems(ungroupedModules)
      })
    }

    return navigation
  }

  /**
   * 生成扁平导航
   */
  private generateFlatNavigation(modules: ApiModule[]): SidebarItem[] {
    return this.generateModuleItems(modules)
  }

  /**
   * 生成模块导航项
   */
  private generateModuleItems(modules: ApiModule[]): SidebarItem[] {
    const items: SidebarItem[] = []

    // 按模块层级组织
    const hierarchy = this.buildModuleHierarchy(modules)

    for (const [name, data] of hierarchy) {
      if (data.module) {
        // 有实际模块
        const item: SidebarItem = {
          text: name,
          link: this.getModuleLink(data.module)
        }

        // 如果有子模块，添加子项
        if (data.children.size > 0) {
          item.items = this.generateModuleItems(
            Array.from(data.children.values())
              .map(d => d.module)
              .filter((m): m is ApiModule => m !== null)
          )
        }

        items.push(item)
      } else if (data.children.size > 0) {
        // 只有子模块，创建分组
        items.push({
          text: name,
          collapsed: false,
          items: this.generateModuleItems(
            Array.from(data.children.values())
              .map(d => d.module)
              .filter((m): m is ApiModule => m !== null)
          )
        })
      }
    }

    // 排序
    if (this.options.sortAlphabetically) {
      items.sort((a, b) => a.text.localeCompare(b.text))
    }

    return items
  }

  /**
   * 构建模块层级结构
   */
  private buildModuleHierarchy(modules: ApiModule[]): Map<string, ModuleHierarchyNode> {
    const hierarchy = new Map<string, ModuleHierarchyNode>()

    for (const module of modules) {
      const parts = module.name.split('/')
      let current = hierarchy

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (!current.has(part)) {
          current.set(part, {
            module: i === parts.length - 1 ? module : null,
            children: new Map()
          })
        }

        const node = current.get(part)!
        if (i === parts.length - 1) {
          node.module = module
        }
        current = node.children
      }
    }

    return hierarchy
  }

  /**
   * 获取模块链接
   */
  private getModuleLink(module: ApiModule): string {
    const { outDir } = this.options
    return `/${outDir}/${module.name}`
  }

  /**
   * 根据模式过滤模块
   */
  private filterModulesByPattern(modules: ApiModule[], pattern: string): ApiModule[] {
    // 简单的 glob 匹配
    const regex = this.patternToRegex(pattern)
    return modules.filter(m => regex.test(m.path))
  }

  /**
   * 获取未分组的模块
   */
  private getUngroupedModules(modules: ApiModule[]): ApiModule[] {
    if (!this.options.groups || this.options.groups.length === 0) {
      return []
    }

    const groupedPaths = new Set<string>()

    for (const group of this.options.groups) {
      const groupModules = this.filterModulesByPattern(modules, group.pattern)
      for (const module of groupModules) {
        groupedPaths.add(module.path)
      }
    }

    return modules.filter(m => !groupedPaths.has(m.path))
  }

  /**
   * 将 glob 模式转换为正则表达式
   */
  private patternToRegex(pattern: string): RegExp {
    // 简单的 glob 转换
    let regex = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')

    return new RegExp(`^${regex}$`)
  }
}

/**
 * 模块层级节点
 */
interface ModuleHierarchyNode {
  module: ApiModule | null
  children: Map<string, ModuleHierarchyNode>
}

/**
 * 生成导航结构
 */
export function generateNavigation(modules: ApiModule[], options: NavigationOptions): SidebarItem[] {
  const generator = new NavigationGenerator(options)
  return generator.generateNavigation(modules)
}

