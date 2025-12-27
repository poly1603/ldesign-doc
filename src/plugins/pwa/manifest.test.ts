/**
 * Web App Manifest 生成属性测试
 * 
 * Feature: doc-system-enhancement
 * Property 18: Web manifest generation
 * Validates: Requirements 5.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  generateManifest,
  validateManifestConfig,
  generateDefaultIcons,
  serializeManifest,
  inferIconType
} from './manifest'
import type { ManifestConfig, ManifestIcon } from './index'
import type { SiteConfig } from '../../shared/types'

// ============== 自定义生成器 ==============

/**
 * 生成颜色值
 */
const colorArb = fc.constantFrom(
  '#3eaf7c',
  '#42b983',
  '#35495e',
  '#ffffff',
  '#000000',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  'red',
  'blue',
  'green'
)

/**
 * 生成图标配置
 */
const manifestIconArb: fc.Arbitrary<ManifestIcon> = fc.record({
  src: fc.oneof(
    fc.constant('/icon-192.png'),
    fc.constant('/icon-512.png'),
    fc.constant('/icons/app-icon.png'),
    fc.webPath()
  ),
  sizes: fc.constantFrom(
    '72x72',
    '96x96',
    '128x128',
    '144x144',
    '192x192',
    '256x256',
    '384x384',
    '512x512'
  ),
  type: fc.option(
    fc.constantFrom('image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'),
    { nil: undefined }
  ),
  purpose: fc.option(fc.constantFrom('any', 'maskable', 'monochrome'), { nil: undefined })
})

/**
 * 生成 Manifest 配置
 */
const manifestConfigArb: fc.Arbitrary<ManifestConfig> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  shortName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  themeColor: fc.option(colorArb, { nil: undefined }),
  backgroundColor: fc.option(colorArb, { nil: undefined }),
  display: fc.option(
    fc.constantFrom('fullscreen', 'standalone', 'minimal-ui', 'browser'),
    { nil: undefined }
  ),
  orientation: fc.option(fc.constantFrom('any', 'natural', 'landscape', 'portrait'), {
    nil: undefined
  }),
  icons: fc.option(fc.array(manifestIconArb, { minLength: 0, maxLength: 5 }), {
    nil: undefined
  }),
  startUrl: fc.option(fc.webPath(), { nil: undefined }),
  scope: fc.option(fc.webPath(), { nil: undefined })
})

/**
 * 生成站点配置
 */
const siteConfigArb: fc.Arbitrary<Partial<SiteConfig>> = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  base: fc.constantFrom('/', '/docs/', '/v2/'),
  lang: fc.constantFrom('en', 'zh-CN', 'ja', 'fr', 'de')
})

// ============== 属性测试 ==============

describe('PWA Plugin - Web App Manifest Generation', () => {
  /**
   * Property 18: Web manifest generation
   * For any PWA configuration with manifest settings, the build output SHALL include
   * a valid web app manifest with all configured properties.
   */
  it('Property 18: generates valid manifest for any configuration', () => {
    fc.assert(
      fc.property(manifestConfigArb, siteConfigArb, (manifestConfig, siteConfig) => {
        const manifest = generateManifest(manifestConfig, siteConfig as SiteConfig)

        // 验证必需字段
        expect(manifest.name).toBeTruthy()
        expect(manifest.start_url).toBeTruthy()

        // 验证名称使用配置或站点标题
        if (manifestConfig.name) {
          expect(manifest.name).toBe(manifestConfig.name)
        } else {
          expect(manifest.name).toBe(siteConfig.title)
        }

        // 验证短名称
        if (manifestConfig.shortName) {
          expect(manifest.short_name).toBe(manifestConfig.shortName)
        }

        // 验证描述
        if (manifestConfig.description) {
          expect(manifest.description).toBe(manifestConfig.description)
        } else if (siteConfig.description) {
          expect(manifest.description).toBe(siteConfig.description)
        }

        // 验证颜色
        if (manifestConfig.themeColor) {
          expect(manifest.theme_color).toBe(manifestConfig.themeColor)
        }
        if (manifestConfig.backgroundColor) {
          expect(manifest.background_color).toBe(manifestConfig.backgroundColor)
        }

        // 验证显示模式
        if (manifestConfig.display) {
          expect(manifest.display).toBe(manifestConfig.display)
        }

        // 验证方向
        if (manifestConfig.orientation) {
          expect(manifest.orientation).toBe(manifestConfig.orientation)
        }

        // 验证图标
        if (manifestConfig.icons && manifestConfig.icons.length > 0) {
          expect(manifest.icons).toBeDefined()
          expect(manifest.icons!.length).toBe(manifestConfig.icons.length)

          manifestConfig.icons.forEach((icon, index) => {
            const manifestIcon = manifest.icons![index]
            expect(manifestIcon.sizes).toBe(icon.sizes)
            expect(manifestIcon.purpose).toBe(icon.purpose || 'any')
          })
        }

        // 验证语言
        expect(manifest.lang).toBeTruthy()

        // 验证文本方向
        expect(manifest.dir).toBe('ltr')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：URL 规范化
   * Start URL and scope SHALL be properly normalized with the site base path.
   */
  it('normalizes URLs with site base path correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.constantFrom('/', '/docs/', '/v2/', '/app/'),
        fc.webPath(),
        fc.webPath(),
        (name, base, startUrl, scope) => {
          const config: ManifestConfig = {
            name,
            startUrl,
            scope
          }

          const siteConfig = {
            title: name,
            description: '',
            base,
            lang: 'en'
          } as SiteConfig

          const manifest = generateManifest(config, siteConfig)

          // 验证 URL 包含 base 路径
          if (base !== '/') {
            expect(manifest.start_url).toContain(base.replace(/\/$/, ''))
            if (scope) {
              expect(manifest.scope).toContain(base.replace(/\/$/, ''))
            }
          }

          // 验证 URL 格式正确（以 / 开头）
          expect(manifest.start_url).toMatch(/^\//)
          if (manifest.scope) {
            expect(manifest.scope).toMatch(/^\//)
          }

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：配置验证
   * Validation SHALL identify missing required fields and provide helpful warnings.
   */
  it('validates manifest configuration and provides helpful feedback', () => {
    fc.assert(
      fc.property(manifestConfigArb, (config) => {
        const validation = validateManifestConfig(config)

        // 如果没有名称，应该有错误
        if (!config.name) {
          expect(validation.valid).toBe(false)
          expect(validation.errors.length).toBeGreaterThan(0)
          expect(validation.errors.some((e) => e.includes('name'))).toBe(true)
        } else {
          // 有名称时应该通过验证（可能有警告）
          expect(validation.errors.length).toBe(0)
        }

        // 如果没有图标或图标为空，应该有警告
        if (!config.icons || config.icons.length === 0) {
          expect(validation.warnings.length).toBeGreaterThan(0)
          expect(validation.warnings.some((w) => w.includes('icon'))).toBe(true)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：默认图标生成
   * Default icons SHALL cover all recommended sizes for PWA support.
   */
  it('generates default icons with recommended sizes', () => {
    const defaultIcons = generateDefaultIcons()

    // 验证有默认图标
    expect(defaultIcons).toBeDefined()
    expect(defaultIcons.length).toBeGreaterThan(0)

    // 验证包含推荐尺寸
    const sizes = defaultIcons.map((icon) => icon.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')

    // 验证有 maskable 图标
    const hasMaskable = defaultIcons.some((icon) => icon.purpose === 'maskable')
    expect(hasMaskable).toBe(true)

    // 验证所有图标都有必需字段
    defaultIcons.forEach((icon) => {
      expect(icon.src).toBeTruthy()
      expect(icon.sizes).toBeTruthy()
      expect(icon.type).toBeTruthy()
      expect(icon.purpose).toBeTruthy()
    })
  })

  /**
   * 额外测试：Manifest 序列化
   * Serialized manifest SHALL be valid JSON.
   */
  it('serializes manifest to valid JSON', () => {
    fc.assert(
      fc.property(manifestConfigArb, siteConfigArb, (manifestConfig, siteConfig) => {
        const manifest = generateManifest(manifestConfig, siteConfig as SiteConfig)
        const serialized = serializeManifest(manifest)

        // 验证是有效的 JSON
        expect(() => JSON.parse(serialized)).not.toThrow()

        // 验证解析后的对象与原对象相同
        const parsed = JSON.parse(serialized)
        expect(parsed.name).toBe(manifest.name)
        expect(parsed.start_url).toBe(manifest.start_url)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 额外测试：图标类型推断
   * Icon type SHALL be correctly inferred from file extension.
   */
  it('infers icon type from file extension correctly', () => {
    const testCases = [
      { src: '/icon.png', expected: 'image/png' },
      { src: '/icon.jpg', expected: 'image/jpeg' },
      { src: '/icon.jpeg', expected: 'image/jpeg' },
      { src: '/icon.svg', expected: 'image/svg+xml' },
      { src: '/icon.webp', expected: 'image/webp' },
      { src: '/icon.ico', expected: 'image/x-icon' }
    ]

    testCases.forEach(({ src, expected }) => {
      const config: ManifestConfig = {
        name: 'Test App',
        icons: [{ src, sizes: '192x192' }]
      }

      const siteConfig = {
        title: 'Test',
        description: '',
        base: '/',
        lang: 'en'
      } as SiteConfig

      const manifest = generateManifest(config, siteConfig)
      expect(manifest.icons![0].type).toBe(expected)
    })
  })

  /**
   * 额外测试：推荐尺寸检查
   * Validation SHALL warn about missing recommended icon sizes.
   */
  it('warns about missing recommended icon sizes', () => {
    // 只有一个小图标
    const configWithSmallIcon: ManifestConfig = {
      name: 'Test App',
      icons: [{ src: '/icon-72.png', sizes: '72x72' }]
    }

    const validation = validateManifestConfig(configWithSmallIcon)
    expect(validation.warnings.length).toBeGreaterThan(0)
    expect(validation.warnings.some((w) => w.includes('192x192'))).toBe(true)
    expect(validation.warnings.some((w) => w.includes('512x512'))).toBe(true)

    // 有推荐尺寸
    const configWithRecommendedSizes: ManifestConfig = {
      name: 'Test App',
      icons: [
        { src: '/icon-192.png', sizes: '192x192' },
        { src: '/icon-512.png', sizes: '512x512' }
      ]
    }

    const validation2 = validateManifestConfig(configWithRecommendedSizes)
    const hasSizeWarning = validation2.warnings.some(
      (w) => w.includes('192x192') || w.includes('512x512')
    )
    expect(hasSizeWarning).toBe(false)
  })
})
