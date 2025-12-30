/**
 * 插件系统增强
 * 提供依赖管理、配置验证、插件组合和冲突检测功能
 */

import type {
  LDocPlugin,
  PluginDependency,
  PluginConflict,
  PluginValidationError,
  PluginSlotName
} from '../shared/types'

/**
 * 插件依赖图节点
 */
interface DependencyNode {
  plugin: LDocPlugin
  dependencies: Set<string>
  dependents: Set<string>
}

/**
 * 解析插件依赖并按依赖顺序排序
 * 
 * @param plugins - 插件列表
 * @returns 按依赖顺序排序的插件列表
 * @throws 如果存在循环依赖或缺失依赖
 */
export function resolvePluginDependencies(plugins: LDocPlugin[]): LDocPlugin[] {
  // 构建依赖图
  const graph = new Map<string, DependencyNode>()

  // 初始化节点
  for (const plugin of plugins) {
    graph.set(plugin.name, {
      plugin,
      dependencies: new Set(),
      dependents: new Set()
    })
  }

  // 构建依赖关系
  for (const plugin of plugins) {
    const node = graph.get(plugin.name)!

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        // 检查依赖是否存在
        if (!graph.has(dep.name) && !dep.optional) {
          throw new Error(
            `Plugin "${plugin.name}" requires "${dep.name}" which is not installed. ` +
            `Install it with: npm install ${dep.name}`
          )
        }

        if (graph.has(dep.name)) {
          node.dependencies.add(dep.name)
          graph.get(dep.name)!.dependents.add(plugin.name)

          // 验证版本约束
          if (dep.version) {
            const depPlugin = graph.get(dep.name)!.plugin
            if (depPlugin.version && !satisfiesVersion(depPlugin.version, dep.version)) {
              throw new Error(
                `Plugin "${plugin.name}" requires "${dep.name}" version ${dep.version}, ` +
                `but version ${depPlugin.version} is installed`
              )
            }
          }
        }
      }
    }
  }

  // 检测循环依赖
  detectCircularDependencies(graph)

  // 拓扑排序
  return topologicalSort(graph)
}

/**
 * 检测循环依赖
 */
function detectCircularDependencies(graph: Map<string, DependencyNode>): void {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(name: string, path: string[]): void {
    visited.add(name)
    recursionStack.add(name)

    const node = graph.get(name)!
    for (const dep of node.dependencies) {
      if (!visited.has(dep)) {
        dfs(dep, [...path, name])
      } else if (recursionStack.has(dep)) {
        const cycle = [...path, name, dep].join(' -> ')
        throw new Error(`Circular dependency detected: ${cycle}`)
      }
    }

    recursionStack.delete(name)
  }

  for (const name of graph.keys()) {
    if (!visited.has(name)) {
      dfs(name, [])
    }
  }
}

/**
 * 拓扑排序 - 返回按依赖顺序排序的插件
 */
function topologicalSort(graph: Map<string, DependencyNode>): LDocPlugin[] {
  const result: LDocPlugin[] = []
  const inDegree = new Map<string, number>()

  // 计算入度
  for (const [name, node] of graph) {
    inDegree.set(name, node.dependencies.size)
  }

  // 找到所有入度为 0 的节点
  const queue: string[] = []
  for (const [name, degree] of inDegree) {
    if (degree === 0) {
      queue.push(name)
    }
  }

  // BFS 遍历
  while (queue.length > 0) {
    const name = queue.shift()!
    const node = graph.get(name)!
    result.push(node.plugin)

    // 减少依赖此节点的其他节点的入度
    for (const dependent of node.dependents) {
      const degree = inDegree.get(dependent)! - 1
      inDegree.set(dependent, degree)

      if (degree === 0) {
        queue.push(dependent)
      }
    }
  }

  // 如果还有节点未处理，说明存在循环依赖（理论上不会到这里，因为前面已经检测过）
  if (result.length !== graph.size) {
    throw new Error('Failed to resolve plugin dependencies')
  }

  return result
}

/**
 * 简单的版本比较（支持基本的 semver）
 */
function satisfiesVersion(actual: string, required: string): boolean {
  // 移除 v 前缀
  actual = actual.replace(/^v/, '')
  required = required.replace(/^v/, '')

  // 支持 ^, ~, >=, >, =, <, <= 等操作符
  if (required.startsWith('^')) {
    // ^1.2.3 表示 >=1.2.3 <2.0.0
    const ver = required.slice(1)
    const [major] = ver.split('.')
    return compareVersions(actual, ver) >= 0 &&
      compareVersions(actual, `${parseInt(major) + 1}.0.0`) < 0
  } else if (required.startsWith('~')) {
    // ~1.2.3 表示 >=1.2.3 <1.3.0
    const ver = required.slice(1)
    const [major, minor] = ver.split('.')
    return compareVersions(actual, ver) >= 0 &&
      compareVersions(actual, `${major}.${parseInt(minor) + 1}.0`) < 0
  } else if (required.startsWith('>=')) {
    return compareVersions(actual, required.slice(2)) >= 0
  } else if (required.startsWith('>')) {
    return compareVersions(actual, required.slice(1)) > 0
  } else if (required.startsWith('<=')) {
    return compareVersions(actual, required.slice(2)) <= 0
  } else if (required.startsWith('<')) {
    return compareVersions(actual, required.slice(1)) < 0
  } else {
    // 精确匹配
    return compareVersions(actual, required) === 0
  }
}

/**
 * 比较两个版本号
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0
    const bPart = bParts[i] || 0

    if (aPart < bPart) return -1
    if (aPart > bPart) return 1
  }

  return 0
}

/**
 * 验证插件配置
 * 
 * @param plugin - 插件对象
 * @returns 验证错误列表，如果为空则验证通过
 */
export function validatePluginConfig(plugin: LDocPlugin): PluginValidationError[] {
  const errors: PluginValidationError[] = []

  // 验证必需字段
  if (!plugin.name) {
    errors.push({
      pluginName: plugin.name || 'unknown',
      field: 'name',
      message: 'Plugin name is required',
      expected: 'string',
      actual: typeof plugin.name
    })
  }

  // 验证 name 格式
  if (plugin.name && !/^[a-z0-9-:@/]+$/.test(plugin.name)) {
    errors.push({
      pluginName: plugin.name,
      field: 'name',
      message: 'Plugin name must contain only lowercase letters, numbers, hyphens, colons, @ and /',
      expected: 'valid plugin name format',
      actual: plugin.name
    })
  }

  // 验证 enforce
  if (plugin.enforce !== undefined) {
    if (typeof plugin.enforce !== 'string' && typeof plugin.enforce !== 'number') {
      errors.push({
        pluginName: plugin.name,
        field: 'enforce',
        message: 'enforce must be "pre", "post", or a number',
        expected: '"pre" | "post" | number',
        actual: typeof plugin.enforce
      })
    } else if (typeof plugin.enforce === 'string' && !['pre', 'post'].includes(plugin.enforce)) {
      errors.push({
        pluginName: plugin.name,
        field: 'enforce',
        message: 'enforce string value must be "pre" or "post"',
        expected: '"pre" | "post"',
        actual: plugin.enforce
      })
    }
  }

  // 验证 dependencies
  if (plugin.dependencies !== undefined) {
    if (!Array.isArray(plugin.dependencies)) {
      errors.push({
        pluginName: plugin.name,
        field: 'dependencies',
        message: 'dependencies must be an array',
        expected: 'PluginDependency[]',
        actual: typeof plugin.dependencies
      })
    } else {
      plugin.dependencies.forEach((dep, index) => {
        if (!dep.name) {
          errors.push({
            pluginName: plugin.name,
            field: `dependencies[${index}].name`,
            message: 'Dependency name is required',
            expected: 'string',
            actual: typeof dep.name
          })
        }

        if (dep.version !== undefined && typeof dep.version !== 'string') {
          errors.push({
            pluginName: plugin.name,
            field: `dependencies[${index}].version`,
            message: 'Dependency version must be a string',
            expected: 'string',
            actual: typeof dep.version
          })
        }

        if (dep.optional !== undefined && typeof dep.optional !== 'boolean') {
          errors.push({
            pluginName: plugin.name,
            field: `dependencies[${index}].optional`,
            message: 'Dependency optional must be a boolean',
            expected: 'boolean',
            actual: typeof dep.optional
          })
        }
      })
    }
  }

  // 验证 version
  if (plugin.version !== undefined && typeof plugin.version !== 'string') {
    errors.push({
      pluginName: plugin.name,
      field: 'version',
      message: 'version must be a string',
      expected: 'string',
      actual: typeof plugin.version
    })
  }

  // 验证 extends
  if (plugin.extends !== undefined && typeof plugin.extends !== 'string') {
    errors.push({
      pluginName: plugin.name,
      field: 'extends',
      message: 'extends must be a string',
      expected: 'string',
      actual: typeof plugin.extends
    })
  }

  // 验证钩子函数类型
  const hookNames = [
    'config', 'configResolved', 'extendMarkdown', 'extendPageData',
    'extendSiteData', 'extendRoutes', 'buildStart', 'buildEnd',
    'generateBundle', 'onBeforePageRender', 'onAfterPageRender',
    'onClientInit', 'onClientMounted', 'onClientUpdated',
    'handleHotUpdate', 'onDestroy'
  ]

  for (const hookName of hookNames) {
    const hook = (plugin as unknown as Record<string, unknown>)[hookName]
    if (hook !== undefined && typeof hook !== 'function') {
      errors.push({
        pluginName: plugin.name,
        field: hookName,
        message: `${hookName} must be a function`,
        expected: 'function',
        actual: typeof hook
      })
    }
  }

  return errors
}

/**
 * 组合插件 - 支持插件继承和扩展
 * 
 * @param plugins - 插件列表
 * @returns 组合后的插件列表
 */
export function composePlugins(plugins: LDocPlugin[]): LDocPlugin[] {
  const pluginMap = new Map<string, LDocPlugin>()

  // 首先将所有插件加入 map
  for (const plugin of plugins) {
    pluginMap.set(plugin.name, plugin)
  }

  const composed: LDocPlugin[] = []

  for (const plugin of plugins) {
    if (plugin.extends) {
      const basePlugin = pluginMap.get(plugin.extends)

      if (!basePlugin) {
        throw new Error(
          `Plugin "${plugin.name}" extends "${plugin.extends}" which is not found`
        )
      }

      // 合并插件配置
      const composedPlugin = mergePlugins(basePlugin, plugin)
      composed.push(composedPlugin)
    } else {
      composed.push(plugin)
    }
  }

  return composed
}

/**
 * 合并两个插件（子插件继承父插件）
 */
function mergePlugins(base: LDocPlugin, extension: LDocPlugin): LDocPlugin {
  const merged: LDocPlugin = {
    ...base,
    ...extension,
    name: extension.name // 保持扩展插件的名称
  }

  // 合并钩子函数 - 先执行基础插件的钩子，再执行扩展插件的钩子
  const hookNames = [
    'config', 'configResolved', 'extendMarkdown', 'extendPageData',
    'extendSiteData', 'extendRoutes', 'buildStart', 'buildEnd',
    'generateBundle', 'onBeforePageRender', 'onAfterPageRender',
    'onClientInit', 'onClientMounted', 'onClientUpdated',
    'handleHotUpdate', 'onDestroy'
  ] as const

  for (const hookName of hookNames) {
    const baseHook = base[hookName]
    const extHook = extension[hookName]

    if (baseHook && extHook) {
      // 两个钩子都存在，创建组合钩子
      ; (merged as unknown as Record<string, unknown>)[hookName] = async function (...args: unknown[]) {
        await (baseHook as (...args: unknown[]) => unknown)(...args)
        await (extHook as (...args: unknown[]) => unknown)(...args)
      }
    }
  }

  // 合并 slots
  if (base.slots && extension.slots) {
    const baseSlots = typeof base.slots === 'function' ? base.slots({} as never) : base.slots
    const extSlots = typeof extension.slots === 'function' ? extension.slots({} as never) : extension.slots

    merged.slots = { ...baseSlots, ...extSlots }
  }

  // 合并 globalComponents
  if (base.globalComponents && extension.globalComponents) {
    merged.globalComponents = [...base.globalComponents, ...extension.globalComponents]
  }

  // 合并 globalDirectives
  if (base.globalDirectives && extension.globalDirectives) {
    merged.globalDirectives = [...base.globalDirectives, ...extension.globalDirectives]
  }

  return merged
}

/**
 * 检测插件冲突
 * 
 * @param plugins - 插件列表
 * @returns 冲突列表
 */
export function detectPluginConflicts(plugins: LDocPlugin[]): PluginConflict[] {
  const conflicts: PluginConflict[] = []

  // 检测名称冲突
  const nameMap = new Map<string, string[]>()
  for (const plugin of plugins) {
    if (!nameMap.has(plugin.name)) {
      nameMap.set(plugin.name, [])
    }
    nameMap.get(plugin.name)!.push(plugin.name)
  }

  for (const [name, instances] of nameMap) {
    if (instances.length > 1) {
      conflicts.push({
        plugins: instances,
        type: 'name',
        location: name,
        suggestions: [
          'Remove duplicate plugin registrations',
          'Ensure each plugin is only registered once',
          'Check if the plugin is included in both user config and theme config'
        ]
      })
    }
  }

  // 检测 slot 冲突
  const slotMap = new Map<PluginSlotName, string[]>()

  for (const plugin of plugins) {
    if (plugin.slots) {
      const slots = typeof plugin.slots === 'function' ? plugin.slots({} as never) : plugin.slots

      for (const slotName of Object.keys(slots) as PluginSlotName[]) {
        if (!slotMap.has(slotName)) {
          slotMap.set(slotName, [])
        }
        slotMap.get(slotName)!.push(plugin.name)
      }
    }
  }

  for (const [slotName, pluginNames] of slotMap) {
    if (pluginNames.length > 1) {
      conflicts.push({
        plugins: pluginNames,
        type: 'slot',
        location: slotName,
        suggestions: [
          `Multiple plugins are trying to use slot "${slotName}"`,
          'This may cause UI conflicts or unexpected behavior',
          'Consider using different slots or adjusting plugin order',
          'You can use the "order" property in PluginSlotComponent to control rendering order'
        ]
      })
    }
  }

  // 检测钩子优先级冲突（如果多个插件使用相同的 enforce 值）
  const enforceMap = new Map<string | number, string[]>()

  for (const plugin of plugins) {
    if (plugin.enforce !== undefined) {
      const key = String(plugin.enforce)
      if (!enforceMap.has(key)) {
        enforceMap.set(key, [])
      }
      enforceMap.get(key)!.push(plugin.name)
    }
  }

  for (const [enforce, pluginNames] of enforceMap) {
    if (pluginNames.length > 3) { // 只在有很多插件使用相同优先级时警告
      conflicts.push({
        plugins: pluginNames,
        type: 'hook',
        location: `enforce: ${enforce}`,
        suggestions: [
          `Many plugins (${pluginNames.length}) are using the same enforce value: ${enforce}`,
          'This may cause unpredictable execution order',
          'Consider using different enforce values or numeric priorities for fine-grained control'
        ]
      })
    }
  }

  return conflicts
}

/**
 * 格式化验证错误为可读的错误消息
 */
export function formatValidationErrors(errors: PluginValidationError[]): string {
  if (errors.length === 0) {
    return ''
  }

  const lines = ['Plugin configuration validation failed:']

  for (const error of errors) {
    lines.push(`  - [${error.pluginName}] ${error.field}: ${error.message}`)
    if (error.expected && error.actual) {
      lines.push(`    Expected: ${error.expected}`)
      lines.push(`    Actual: ${error.actual}`)
    }
  }

  return lines.join('\n')
}

/**
 * 格式化冲突信息为可读的警告消息
 */
export function formatConflicts(conflicts: PluginConflict[]): string {
  if (conflicts.length === 0) {
    return ''
  }

  const lines = ['Plugin conflicts detected:']

  for (const conflict of conflicts) {
    lines.push(`\n  ${conflict.type.toUpperCase()} conflict at "${conflict.location}":`)
    lines.push(`    Plugins: ${conflict.plugins.join(', ')}`)
    lines.push(`    Suggestions:`)
    for (const suggestion of conflict.suggestions) {
      lines.push(`      - ${suggestion}`)
    }
  }

  return lines.join('\n')
}
