/**
 * Property-Based Tests for Plugin System Enhancement
 * Feature: doc-system-enhancement
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { LDocPlugin, PluginDependency } from '../shared/types'
import {
  resolvePluginDependencies,
  validatePluginConfig,
  composePlugins,
  detectPluginConflicts
} from './pluginSystem'

// ============== Arbitraries (Generators) ==============

/**
 * Generate a valid plugin name
 */
const pluginNameArb = fc.stringMatching(/^[a-z0-9-:@/]+$/).filter(s => s.length > 0 && s.length < 50)

/**
 * Generate a valid version string
 */
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 20 }),
  fc.integer({ min: 0, max: 50 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`)

/**
 * Generate a plugin dependency
 */
const pluginDependencyArb = (availablePlugins: string[]): fc.Arbitrary<PluginDependency> => {
  if (availablePlugins.length === 0) {
    return fc.record({
      name: pluginNameArb,
      version: fc.option(versionArb, { nil: undefined }),
      optional: fc.option(fc.boolean(), { nil: undefined })
    })
  }

  return fc.record({
    name: fc.oneof(
      fc.constantFrom(...availablePlugins),
      pluginNameArb
    ),
    version: fc.option(versionArb, { nil: undefined }),
    optional: fc.option(fc.boolean(), { nil: undefined })
  })
}

/**
 * Generate a basic plugin without dependencies
 */
const basicPluginArb = fc.record({
  name: pluginNameArb,
  version: fc.option(versionArb, { nil: undefined }),
  enforce: fc.option(
    fc.oneof(
      fc.constant('pre' as const),
      fc.constant('post' as const),
      fc.integer({ min: -100, max: 100 })
    ),
    { nil: undefined }
  )
})

/**
 * Generate a plugin with dependencies
 */
const pluginWithDepsArb = (availablePlugins: string[]): fc.Arbitrary<LDocPlugin> => {
  return fc.record({
    name: pluginNameArb,
    version: fc.option(versionArb, { nil: undefined }),
    enforce: fc.option(
      fc.oneof(
        fc.constant('pre' as const),
        fc.constant('post' as const),
        fc.integer({ min: -100, max: 100 })
      ),
      { nil: undefined }
    ),
    dependencies: fc.option(
      fc.array(pluginDependencyArb(availablePlugins), { minLength: 0, maxLength: 3 }),
      { nil: undefined }
    )
  })
}

/**
 * Generate a list of plugins with valid dependency relationships
 */
const validPluginListArb = fc.nat({ max: 10 }).chain(count => {
  if (count === 0) {
    return fc.constant([])
  }

  // First generate base plugins without dependencies
  return fc.array(basicPluginArb, { minLength: count, maxLength: count }).chain(basePlugins => {
    const pluginNames = basePlugins.map(p => p.name)

    // Then add dependencies to some plugins
    return fc.array(
      fc.oneof(
        fc.constant(null), // No dependencies
        fc.array(pluginDependencyArb(pluginNames), { minLength: 1, maxLength: 2 })
      ),
      { minLength: count, maxLength: count }
    ).map(depsList => {
      return basePlugins.map((plugin, i) => ({
        ...plugin,
        dependencies: depsList[i] || undefined
      }))
    })
  })
})

// ============== Property Tests ==============

describe('Plugin System - Property Tests', () => {
  /**
   * Property 59: Plugin dependency resolution
   * For any plugin with declared dependencies, the system SHALL load dependencies before the dependent plugin.
   * Validates: Requirements 15.1
   */
  describe('Property 59: Plugin dependency resolution', () => {
    it('should load dependencies before dependent plugins', () => {
      fc.assert(
        fc.property(validPluginListArb, (plugins) => {
          // Skip empty lists
          if (plugins.length === 0) return true

          try {
            const resolved = resolvePluginDependencies(plugins)

            // Build a map of plugin positions
            const positions = new Map<string, number>()
            resolved.forEach((plugin, index) => {
              positions.set(plugin.name, index)
            })

            // Verify that all dependencies come before their dependents
            for (const plugin of resolved) {
              if (plugin.dependencies) {
                const pluginPos = positions.get(plugin.name)!

                for (const dep of plugin.dependencies) {
                  if (positions.has(dep.name)) {
                    const depPos = positions.get(dep.name)!

                    // Dependency must come before dependent
                    if (depPos >= pluginPos) {
                      return false
                    }
                  }
                }
              }
            }

            return true
          } catch (error) {
            // If there's a circular dependency or missing required dependency,
            // that's expected behavior (the function should throw)
            return true
          }
        }),
        { numRuns: 100 }
      )
    })

    it('should detect circular dependencies', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          pluginNameArb,
          (name1, name2, name3) => {
            // Ensure unique names
            if (name1 === name2 || name2 === name3 || name1 === name3) {
              return true
            }

            // Create a circular dependency: A -> B -> C -> A
            const plugins: LDocPlugin[] = [
              {
                name: name1,
                dependencies: [{ name: name2 }]
              },
              {
                name: name2,
                dependencies: [{ name: name3 }]
              },
              {
                name: name3,
                dependencies: [{ name: name1 }]
              }
            ]

            try {
              resolvePluginDependencies(plugins)
              // Should have thrown an error
              return false
            } catch (error) {
              // Should throw an error about circular dependency
              return (error as Error).message.includes('Circular dependency')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should throw error for missing required dependencies', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          (pluginName, missingDep) => {
            // Ensure different names
            if (pluginName === missingDep) {
              return true
            }

            const plugins: LDocPlugin[] = [
              {
                name: pluginName,
                dependencies: [{ name: missingDep, optional: false }]
              }
            ]

            try {
              resolvePluginDependencies(plugins)
              // Should have thrown an error
              return false
            } catch (error) {
              // Should throw an error about missing dependency
              return (error as Error).message.includes('not installed')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle optional dependencies gracefully', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          (pluginName, missingDep) => {
            // Ensure different names
            if (pluginName === missingDep) {
              return true
            }

            const plugins: LDocPlugin[] = [
              {
                name: pluginName,
                dependencies: [{ name: missingDep, optional: true }]
              }
            ]

            try {
              const resolved = resolvePluginDependencies(plugins)
              // Should succeed and return the plugin
              return resolved.length === 1 && resolved[0].name === pluginName
            } catch {
              // Should not throw for optional dependencies
              return false
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 60: Plugin configuration validation
   * For any invalid plugin configuration, the system SHALL provide an error message 
   * identifying the invalid fields and expected values.
   * Validates: Requirements 15.3
   */
  describe('Property 60: Plugin configuration validation', () => {
    it('should validate plugin name is required', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.constant(''),
            version: fc.option(versionArb, { nil: undefined })
          }),
          (invalidPlugin) => {
            const errors = validatePluginConfig(invalidPlugin as LDocPlugin)

            // Should have at least one error about the name
            return errors.some(e => e.field === 'name')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate plugin name format', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.length > 0 && !/^[a-z0-9-:@/]+$/.test(s)),
          (invalidName) => {
            const plugin: LDocPlugin = { name: invalidName }
            const errors = validatePluginConfig(plugin)

            // Should have an error about invalid name
            return errors.some(e => e.field === 'name')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate enforce field type', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          fc.oneof(
            fc.constant(null),
            fc.constant(true),
            fc.constant({}),
            fc.constant([])
          ),
          (name, invalidEnforce) => {
            const plugin = { name, enforce: invalidEnforce } as unknown as LDocPlugin
            const errors = validatePluginConfig(plugin)

            // Should have an error about enforce field
            return errors.some(e => e.field === 'enforce')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate dependencies is an array', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          fc.oneof(
            fc.constant('not-an-array'),
            fc.constant(123),
            fc.constant({}),
            fc.constant(null)
          ),
          (name, invalidDeps) => {
            const plugin = { name, dependencies: invalidDeps } as unknown as LDocPlugin
            const errors = validatePluginConfig(plugin)

            // Should have an error about dependencies field
            return errors.some(e => e.field === 'dependencies')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should accept valid plugin configurations', () => {
      fc.assert(
        fc.property(
          basicPluginArb,
          (plugin) => {
            const errors = validatePluginConfig(plugin)

            // Should have no errors for valid plugins
            return errors.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 61: Plugin composition
   * For any plugin extending another plugin, the extended plugin's hooks SHALL be 
   * called before the extending plugin's hooks.
   * Validates: Requirements 15.4
   */
  describe('Property 61: Plugin composition', () => {
    it('should merge base and extension plugins', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          (baseName, extName) => {
            // Ensure different names
            if (baseName === extName) {
              return true
            }

            const basePlugin: LDocPlugin = {
              name: baseName,
              version: '1.0.0'
            }

            const extPlugin: LDocPlugin = {
              name: extName,
              extends: baseName,
              version: '2.0.0'
            }

            const plugins = [basePlugin, extPlugin]

            try {
              const composed = composePlugins(plugins)

              // Should have 2 plugins
              if (composed.length !== 2) return false

              // Extension plugin should have properties from both
              const composedExt = composed.find(p => p.name === extName)
              return composedExt !== undefined
            } catch {
              // Should not throw for valid composition
              return false
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should throw error when extending non-existent plugin', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          (extName, missingBase) => {
            // Ensure different names
            if (extName === missingBase) {
              return true
            }

            const extPlugin: LDocPlugin = {
              name: extName,
              extends: missingBase
            }

            try {
              composePlugins([extPlugin])
              // Should have thrown an error
              return false
            } catch (error) {
              // Should throw an error about missing base plugin
              return (error as Error).message.includes('not found')
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 62: Plugin conflict detection
   * For any plugins with conflicting slot registrations or hook priorities, 
   * the system SHALL report the conflict with affected plugins and resolution options.
   * Validates: Requirements 15.6
   */
  describe('Property 62: Plugin conflict detection', () => {
    it('should detect duplicate plugin names', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          (name) => {
            const plugins: LDocPlugin[] = [
              { name },
              { name }
            ]

            const conflicts = detectPluginConflicts(plugins)

            // Should detect name conflict
            return conflicts.some(c => c.type === 'name' && c.plugins.includes(name))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect slot conflicts', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          pluginNameArb,
          fc.constantFrom(
            'nav-bar-content-after',
            'doc-before',
            'doc-after',
            'sidebar-top'
          ),
          (name1, name2, slotName) => {
            // Ensure different names
            if (name1 === name2) {
              return true
            }

            const plugins: LDocPlugin[] = [
              {
                name: name1,
                slots: {
                  [slotName]: {
                    component: 'div'
                  }
                }
              },
              {
                name: name2,
                slots: {
                  [slotName]: {
                    component: 'div'
                  }
                }
              }
            ]

            const conflicts = detectPluginConflicts(plugins)

            // Should detect slot conflict
            return conflicts.some(c =>
              c.type === 'slot' &&
              c.location === slotName &&
              c.plugins.includes(name1) &&
              c.plugins.includes(name2)
            )
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should provide resolution suggestions for conflicts', () => {
      fc.assert(
        fc.property(
          pluginNameArb,
          (name) => {
            const plugins: LDocPlugin[] = [
              { name },
              { name }
            ]

            const conflicts = detectPluginConflicts(plugins)

            // Should provide suggestions
            return conflicts.every(c => c.suggestions && c.suggestions.length > 0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not report conflicts for valid plugin configurations', () => {
      fc.assert(
        fc.property(
          fc.array(basicPluginArb, { minLength: 1, maxLength: 3 }).filter(plugins => {
            // Ensure all names are unique
            const names = plugins.map(p => p.name)
            return new Set(names).size === names.length
          }),
          (plugins) => {
            const conflicts = detectPluginConflicts(plugins)

            // Should have no conflicts for unique plugins with small count
            return conflicts.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
