/**
 * Plugin System Enhancement Examples
 * 
 * This file demonstrates the new plugin system features:
 * - Plugin dependencies
 * - Plugin composition (inheritance)
 * - Configuration validation
 * - Conflict detection
 */

import type { LDocPlugin } from '../src/shared/types'

// ============== Example 1: Plugin Dependencies ==============

/**
 * Base analytics plugin that other plugins depend on
 */
export const analyticsBasePlugin: LDocPlugin = {
  name: 'ldoc:analytics-base',
  version: '1.0.0',

  configResolved(config) {
    console.log('Analytics base plugin initialized')
  }
}

/**
 * Google Analytics plugin that depends on the base analytics plugin
 */
export const googleAnalyticsPlugin: LDocPlugin = {
  name: 'ldoc:google-analytics',
  version: '1.0.0',

  // Declare dependency on base analytics plugin
  dependencies: [
    {
      name: 'ldoc:analytics-base',
      version: '^1.0.0' // Requires version 1.x.x
    }
  ],

  configResolved(config) {
    console.log('Google Analytics plugin initialized')
  }
}

/**
 * Plausible Analytics plugin with optional dependency
 */
export const plausibleAnalyticsPlugin: LDocPlugin = {
  name: 'ldoc:plausible-analytics',
  version: '1.0.0',

  dependencies: [
    {
      name: 'ldoc:analytics-base',
      version: '^1.0.0',
      optional: true // Won't fail if not present
    }
  ],

  configResolved(config) {
    console.log('Plausible Analytics plugin initialized')
  }
}

// ============== Example 2: Plugin Composition ==============

/**
 * Base theme plugin
 */
export const baseThemePlugin: LDocPlugin = {
  name: 'ldoc:theme-base',
  version: '1.0.0',

  slots: {
    'nav-bar-content-after': {
      component: 'BaseThemeNav',
      order: 10
    }
  },

  configResolved(config) {
    console.log('Base theme configured')
  }
}

/**
 * Extended theme plugin that inherits from base theme
 */
export const extendedThemePlugin: LDocPlugin = {
  name: 'ldoc:theme-extended',
  version: '1.0.0',

  // Extend the base theme
  extends: 'ldoc:theme-base',

  // Add additional slots
  slots: {
    'doc-before': {
      component: 'ExtendedThemeBanner',
      order: 5
    }
  },

  // This hook will be called AFTER the base theme's hook
  configResolved(config) {
    console.log('Extended theme configured')
  }
}

// ============== Example 3: Plugin with Version Constraints ==============

/**
 * Plugin that requires specific versions of dependencies
 */
export const strictVersionPlugin: LDocPlugin = {
  name: 'ldoc:strict-version',
  version: '2.0.0',

  dependencies: [
    {
      name: 'ldoc:analytics-base',
      version: '>=1.0.0 <2.0.0' // Requires 1.x.x
    },
    {
      name: 'ldoc:theme-base',
      version: '^1.0.0' // Compatible with 1.x.x
    }
  ]
}

// ============== Example 4: Plugin Priority ==============

/**
 * Plugin that runs early (pre)
 */
export const earlyPlugin: LDocPlugin = {
  name: 'ldoc:early',
  enforce: 'pre', // Runs before normal plugins

  configResolved(config) {
    console.log('Early plugin runs first')
  }
}

/**
 * Plugin that runs late (post)
 */
export const latePlugin: LDocPlugin = {
  name: 'ldoc:late',
  enforce: 'post', // Runs after normal plugins

  configResolved(config) {
    console.log('Late plugin runs last')
  }
}

/**
 * Plugin with numeric priority
 */
export const customPriorityPlugin: LDocPlugin = {
  name: 'ldoc:custom-priority',
  enforce: 50, // Runs at priority 50 (lower = earlier)

  configResolved(config) {
    console.log('Custom priority plugin')
  }
}

// ============== Example 5: Complete Plugin Configuration ==============

/**
 * A complete plugin with all features
 */
export const completePlugin: LDocPlugin = {
  name: 'ldoc:complete-example',
  version: '1.0.0',
  enforce: 100,

  dependencies: [
    {
      name: 'ldoc:analytics-base',
      version: '^1.0.0'
    }
  ],

  slots: {
    'doc-before': {
      component: 'MyComponent',
      order: 10
    }
  },

  globalComponents: [
    {
      name: 'MyGlobalComponent',
      component: 'div' // In real usage, this would be a Vue/React component
    }
  ],

  async configResolved(config) {
    console.log('Plugin configured')
  },

  async buildStart(config) {
    console.log('Build started')
  },

  async buildEnd(config) {
    console.log('Build completed')
  }
}

// ============== Usage Example ==============

/**
 * Example configuration using the new plugin system
 */
export const exampleConfig = {
  plugins: [
    // Base plugins
    analyticsBasePlugin,
    baseThemePlugin,

    // Plugins with dependencies (will be loaded after their dependencies)
    googleAnalyticsPlugin,
    plausibleAnalyticsPlugin,

    // Extended plugins (will inherit from base plugins)
    extendedThemePlugin,

    // Priority plugins
    earlyPlugin,
    customPriorityPlugin,
    latePlugin,

    // Complete plugin
    completePlugin
  ]
}

// The plugin system will:
// 1. Validate all plugin configurations
// 2. Resolve dependencies and sort plugins
// 3. Detect and warn about conflicts
// 4. Compose extended plugins with their base plugins
// 5. Execute plugins in the correct order

// Expected execution order:
// 1. earlyPlugin (enforce: 'pre')
// 2. analyticsBasePlugin (dependency of others)
// 3. baseThemePlugin (extended by extendedThemePlugin)
// 4. googleAnalyticsPlugin (depends on analyticsBasePlugin)
// 5. plausibleAnalyticsPlugin (depends on analyticsBasePlugin)
// 6. customPriorityPlugin (enforce: 50)
// 7. extendedThemePlugin (extends baseThemePlugin, enforce: 100)
// 8. completePlugin (enforce: 100)
// 9. latePlugin (enforce: 'post')
