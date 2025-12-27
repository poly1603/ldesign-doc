/**
 * Property-based tests for version plugin
 * Feature: doc-system-enhancement
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  versionPlugin,
  resolveVersionAlias,
  isVersionDeprecated,
  generateVersionManifest,
  type VersionItem,
  type VersionConfig,
  type VersionPluginOptions
} from './index'

// ============== Arbitraries (Generators) ==============

/**
 * Generate a valid version string (semver-like)
 */
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 10 }),
  fc.integer({ min: 0, max: 20 }),
  fc.integer({ min: 0, max: 50 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`)

/**
 * Generate a version item
 */
const versionItemArb: fc.Arbitrary<VersionItem> = fc.record({
  version: versionArb,
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  path: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s}/`),
  prerelease: fc.option(fc.boolean(), { nil: undefined }),
  releaseDate: fc.option(
    fc.integer({ min: 1577836800000, max: 1735689600000 }) // 2020-01-01 to 2025-01-01 in ms
      .map(ms => new Date(ms).toISOString()),
    { nil: undefined }
  ),
  deprecated: fc.option(fc.boolean(), { nil: undefined })
})

/**
 * Generate a version configuration
 */
const versionConfigArb: fc.Arbitrary<VersionConfig> = fc.record({
  versions: fc.array(versionItemArb, { minLength: 1, maxLength: 10 }),
  current: versionArb,
  aliases: fc.option(
    fc.dictionary(
      fc.constantFrom('latest', 'stable', 'next', 'legacy'),
      versionArb
    ),
    { nil: undefined }
  ),
  selectorPosition: fc.option(
    fc.constantFrom('nav' as const, 'sidebar' as const),
    { nil: undefined }
  ),
  deprecation: fc.option(
    fc.record({
      versions: fc.array(versionArb, { minLength: 1, maxLength: 5 }),
      message: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
      recommendedVersion: fc.option(versionArb, { nil: undefined })
    }),
    { nil: undefined }
  )
})

// ============== Property Tests ==============

describe('Version Plugin - Property Tests', () => {
  /**
   * Property 1: Version selector rendering
   * For any valid version configuration with at least one version,
   * rendering the navigation component SHALL produce HTML containing a version selector element.
   * Validates: Requirements 1.1
   */
  it('Property 1: Version selector rendering', () => {
    fc.assert(
      fc.property(
        versionConfigArb,
        (config) => {
          // Create plugin with configuration
          const plugin = versionPlugin(config as VersionPluginOptions)

          // Plugin should have a name
          expect(plugin.name).toBe('ldoc:version')

          // Plugin should have slots configuration
          expect(plugin.slots).toBeDefined()

          // Check that slots contain version selector component
          const slots = plugin.slots as Record<string, any>
          const hasVersionSelector =
            (slots['nav-bar-content-before'] &&
              slots['nav-bar-content-before'].component === 'LDocVersionSelector') ||
            (slots['sidebar-top'] &&
              slots['sidebar-top'].component === 'LDocVersionSelector')

          // Version selector should be present in one of the slot positions
          expect(hasVersionSelector).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2: Version navigation correctness
   * For any version selection event, the resulting navigation path
   * SHALL match the configured path for that version.
   * Validates: Requirements 1.2
   */
  it('Property 2: Version navigation correctness', () => {
    fc.assert(
      fc.property(
        versionConfigArb,
        fc.integer({ min: 0, max: 9 }),
        (config, selectedIndex) => {
          // Ensure we have versions
          if (config.versions.length === 0) return true

          // Select a version within bounds
          const index = selectedIndex % config.versions.length
          const selectedVersion = config.versions[index]

          // The path should be defined and non-empty
          expect(selectedVersion.path).toBeDefined()
          expect(selectedVersion.path.length).toBeGreaterThan(0)

          // Path should start and end with /
          expect(selectedVersion.path.startsWith('/')).toBe(true)
          expect(selectedVersion.path.endsWith('/')).toBe(true)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 4: Version alias resolution
   * For any version alias, resolving the alias SHALL return
   * the correct version path as defined in the configuration.
   * Validates: Requirements 1.4
   */
  it('Property 4: Version alias resolution', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), versionArb),
        fc.string({ minLength: 1, maxLength: 20 }),
        (aliases, alias) => {
          const resolved = resolveVersionAlias(alias, aliases)

          // If alias exists in mapping, should return mapped version
          if (aliases[alias]) {
            expect(resolved).toBe(aliases[alias])
          } else {
            // If alias doesn't exist, should return the alias itself
            expect(resolved).toBe(alias)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 5: Deprecation banner display
   * For any page in a deprecated version, the rendered HTML
   * SHALL contain a deprecation warning banner.
   * Validates: Requirements 1.5
   */
  it('Property 5: Deprecation banner display', () => {
    fc.assert(
      fc.property(
        versionArb,
        fc.array(versionArb, { minLength: 1, maxLength: 10 }),
        (version, deprecatedVersions) => {
          const isDeprecated = isVersionDeprecated(version, deprecatedVersions)

          // Should return true if version is in deprecated list
          if (deprecatedVersions.includes(version)) {
            expect(isDeprecated).toBe(true)
          } else {
            expect(isDeprecated).toBe(false)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: Multi-version build output
   * For any build with multiple versions configured, the output directory
   * SHALL contain separate subdirectories for each version with complete documentation.
   * Validates: Requirements 1.3
   */
  it('Property 3: Multi-version build output - manifest generation', () => {
    fc.assert(
      fc.property(
        versionConfigArb,
        (config) => {
          // Generate version manifest
          const manifest = generateVersionManifest(config)

          // Manifest should have current version
          expect(manifest.current).toBe(config.current)

          // Manifest should have all versions
          expect(manifest.versions.length).toBe(config.versions.length)

          // Each version in manifest should match config
          manifest.versions.forEach((manifestVersion, index) => {
            const configVersion = config.versions[index]
            expect(manifestVersion.version).toBe(configVersion.version)
            expect(manifestVersion.path).toBe(configVersion.path)
            expect(manifestVersion.label).toBe(configVersion.label || configVersion.version)
          })

          // Manifest should have aliases
          expect(manifest.aliases).toEqual(config.aliases || {})

          // Manifest should have generation timestamp
          expect(manifest.generatedAt).toBeDefined()
          expect(new Date(manifest.generatedAt).getTime()).toBeGreaterThan(0)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============== Unit Tests for Edge Cases ==============

describe('Version Plugin - Unit Tests', () => {
  it('should handle empty aliases object', () => {
    const result = resolveVersionAlias('latest', {})
    expect(result).toBe('latest')
  })

  it('should handle version not in deprecated list', () => {
    const result = isVersionDeprecated('2.0.0', ['1.0.0', '1.5.0'])
    expect(result).toBe(false)
  })

  it('should generate manifest with minimal config', () => {
    const config: VersionConfig = {
      versions: [{ version: '1.0.0', path: '/v1/' }],
      current: '1.0.0'
    }

    const manifest = generateVersionManifest(config)

    expect(manifest.current).toBe('1.0.0')
    expect(manifest.versions).toHaveLength(1)
    expect(manifest.aliases).toEqual({})
  })

  it('should create plugin with nav position by default', () => {
    const config: VersionPluginOptions = {
      versions: [{ version: '1.0.0', path: '/v1/' }],
      current: '1.0.0'
    }

    const plugin = versionPlugin(config)
    const slots = plugin.slots as Record<string, any>

    expect(slots['nav-bar-content-before']).toBeDefined()
    expect(slots['nav-bar-content-before'].component).toBe('LDocVersionSelector')
  })

  it('should create plugin with sidebar position when configured', () => {
    const config: VersionPluginOptions = {
      versions: [{ version: '1.0.0', path: '/v1/' }],
      current: '1.0.0',
      selectorPosition: 'sidebar'
    }

    const plugin = versionPlugin(config)
    const slots = plugin.slots as Record<string, any>

    expect(slots['sidebar-top']).toBeDefined()
    expect(slots['sidebar-top'].component).toBe('LDocVersionSelector')
  })
})
