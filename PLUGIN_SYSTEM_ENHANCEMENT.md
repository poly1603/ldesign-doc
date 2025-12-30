# Plugin System Enhancement

This document describes the enhanced plugin system features added to @ldesign/doc.

## Overview

The plugin system has been enhanced with the following features:

1. **Dependency Management** - Plugins can declare dependencies on other plugins
2. **Configuration Validation** - Automatic validation of plugin configurations with helpful error messages
3. **Plugin Composition** - Plugins can extend other plugins to inherit and enhance functionality
4. **Conflict Detection** - Automatic detection of plugin conflicts with resolution suggestions

## Features

### 1. Plugin Dependencies

Plugins can now declare dependencies on other plugins. The system will:
- Automatically load dependencies before dependent plugins
- Validate version constraints
- Support optional dependencies
- Detect circular dependencies

#### Example

```typescript
import type { LDocPlugin } from '@ldesign/doc'

const myPlugin: LDocPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  dependencies: [
    {
      name: 'base-plugin',
      version: '^1.0.0',  // Requires version 1.x.x
      optional: false      // Required dependency
    },
    {
      name: 'optional-plugin',
      version: '>=2.0.0',  // Requires version 2.0.0 or higher
      optional: true       // Optional dependency
    }
  ]
}
```

#### Version Constraints

The system supports standard semver version constraints:

- `^1.2.3` - Compatible with 1.x.x (>=1.2.3 <2.0.0)
- `~1.2.3` - Compatible with 1.2.x (>=1.2.3 <1.3.0)
- `>=1.0.0` - Greater than or equal to 1.0.0
- `>1.0.0` - Greater than 1.0.0
- `<=2.0.0` - Less than or equal to 2.0.0
- `<2.0.0` - Less than 2.0.0
- `1.0.0` - Exact version match

### 2. Configuration Validation

All plugin configurations are automatically validated. The system checks:

- Required fields (name)
- Field types (enforce, dependencies, version, etc.)
- Field formats (name must match pattern)
- Hook function types

#### Validation Errors

When validation fails, you'll receive detailed error messages:

```
Plugin configuration validation failed:
  - [my-plugin] name: Plugin name must contain only lowercase letters, numbers, hyphens, colons, @ and /
    Expected: valid plugin name format
    Actual: My-Plugin!
  - [my-plugin] enforce: enforce must be "pre", "post", or a number
    Expected: "pre" | "post" | number
    Actual: string
```

### 3. Plugin Composition

Plugins can extend other plugins to inherit and enhance their functionality.

#### Example

```typescript
// Base plugin
const basePlugin: LDocPlugin = {
  name: 'base-plugin',
  version: '1.0.0',
  
  slots: {
    'nav-bar-content-after': {
      component: 'BaseNav'
    }
  },
  
  configResolved(config) {
    console.log('Base plugin configured')
  }
}

// Extended plugin
const extendedPlugin: LDocPlugin = {
  name: 'extended-plugin',
  version: '1.0.0',
  
  extends: 'base-plugin',  // Inherit from base plugin
  
  slots: {
    'doc-before': {
      component: 'ExtendedBanner'
    }
  },
  
  configResolved(config) {
    console.log('Extended plugin configured')
  }
}
```

#### Composition Behavior

When a plugin extends another:

1. **Hooks are chained** - Base plugin hooks run first, then extended plugin hooks
2. **Slots are merged** - Both base and extended slots are available
3. **Components are merged** - Global components from both plugins are registered
4. **Directives are merged** - Global directives from both plugins are registered

### 4. Conflict Detection

The system automatically detects conflicts between plugins:

#### Types of Conflicts

1. **Name Conflicts** - Multiple plugins with the same name
2. **Slot Conflicts** - Multiple plugins using the same slot
3. **Hook Priority Conflicts** - Many plugins with the same priority

#### Example Warning

```
Plugin conflicts detected:

  SLOT conflict at "nav-bar-content-after":
    Plugins: plugin-a, plugin-b
    Suggestions:
      - Multiple plugins are trying to use slot "nav-bar-content-after"
      - This may cause UI conflicts or unexpected behavior
      - Consider using different slots or adjusting plugin order
      - You can use the "order" property in PluginSlotComponent to control rendering order
```

### 5. Plugin Priority

Control the execution order of plugins using the `enforce` field:

```typescript
const plugin: LDocPlugin = {
  name: 'my-plugin',
  
  // String values
  enforce: 'pre',   // Run before normal plugins
  enforce: 'post',  // Run after normal plugins
  
  // Numeric values (lower = earlier)
  enforce: -100,    // Run very early
  enforce: 0,       // Run early (default for built-in plugins)
  enforce: 100,     // Run normally (default for user plugins)
  enforce: 1000,    // Run late
}
```

## API Reference

### Plugin Interface Extensions

```typescript
interface LDocPlugin {
  // ... existing fields ...
  
  /** Plugin dependencies */
  dependencies?: PluginDependency[]
  
  /** Plugin version */
  version?: string
  
  /** Plugin to extend */
  extends?: string
}

interface PluginDependency {
  /** Dependency plugin name */
  name: string
  
  /** Version constraint (semver) */
  version?: string
  
  /** Whether dependency is optional */
  optional?: boolean
}
```

### Validation Functions

```typescript
import {
  validatePluginConfig,
  formatValidationErrors
} from '@ldesign/doc/plugin/pluginSystem'

// Validate a plugin
const errors = validatePluginConfig(plugin)

if (errors.length > 0) {
  console.error(formatValidationErrors(errors))
}
```

### Dependency Resolution

```typescript
import {
  resolvePluginDependencies
} from '@ldesign/doc/plugin/pluginSystem'

// Resolve and sort plugins by dependencies
const sortedPlugins = resolvePluginDependencies(plugins)
```

### Conflict Detection

```typescript
import {
  detectPluginConflicts,
  formatConflicts
} from '@ldesign/doc/plugin/pluginSystem'

// Detect conflicts
const conflicts = detectPluginConflicts(plugins)

if (conflicts.length > 0) {
  console.warn(formatConflicts(conflicts))
}
```

### Plugin Composition

```typescript
import {
  composePlugins
} from '@ldesign/doc/plugin/pluginSystem'

// Compose plugins (handle extends)
const composedPlugins = composePlugins(plugins)
```

## Best Practices

### 1. Declare Dependencies

Always declare dependencies explicitly:

```typescript
const myPlugin: LDocPlugin = {
  name: 'my-plugin',
  dependencies: [
    { name: 'required-plugin' },
    { name: 'optional-plugin', optional: true }
  ]
}
```

### 2. Use Semantic Versioning

Follow semantic versioning for your plugins:

```typescript
const myPlugin: LDocPlugin = {
  name: 'my-plugin',
  version: '1.0.0',  // MAJOR.MINOR.PATCH
  
  dependencies: [
    { name: 'base-plugin', version: '^1.0.0' }  // Compatible versions
  ]
}
```

### 3. Set Appropriate Priorities

Use priorities to control execution order:

```typescript
// Early initialization
const initPlugin: LDocPlugin = {
  name: 'init-plugin',
  enforce: 'pre'
}

// Normal operation
const featurePlugin: LDocPlugin = {
  name: 'feature-plugin',
  enforce: 100  // or omit for default
}

// Cleanup or finalization
const cleanupPlugin: LDocPlugin = {
  name: 'cleanup-plugin',
  enforce: 'post'
}
```

### 4. Handle Conflicts Gracefully

When using slots, consider using the `order` property:

```typescript
const myPlugin: LDocPlugin = {
  name: 'my-plugin',
  slots: {
    'nav-bar-content-after': {
      component: 'MyComponent',
      order: 10  // Lower numbers render first
    }
  }
}
```

### 5. Validate Before Publishing

Always validate your plugin configuration:

```typescript
import { validatePluginConfig } from '@ldesign/doc/plugin/pluginSystem'

const errors = validatePluginConfig(myPlugin)

if (errors.length > 0) {
  throw new Error('Invalid plugin configuration')
}
```

## Migration Guide

### From Old Plugin System

The new plugin system is fully backward compatible. Existing plugins will continue to work without changes.

To take advantage of new features:

1. **Add version field**:
   ```typescript
   const myPlugin: LDocPlugin = {
     name: 'my-plugin',
     version: '1.0.0'  // Add this
   }
   ```

2. **Declare dependencies**:
   ```typescript
   const myPlugin: LDocPlugin = {
     name: 'my-plugin',
     dependencies: [
       { name: 'base-plugin', version: '^1.0.0' }
     ]
   }
   ```

3. **Use composition instead of duplication**:
   ```typescript
   // Before: Duplicate code
   const pluginA: LDocPlugin = { /* ... */ }
   const pluginB: LDocPlugin = { /* duplicate code */ }
   
   // After: Use composition
   const basePlugin: LDocPlugin = { /* shared code */ }
   const pluginB: LDocPlugin = {
     extends: 'base-plugin',
     /* only unique code */
   }
   ```

## Troubleshooting

### Circular Dependency Error

```
Error: Circular dependency detected: plugin-a -> plugin-b -> plugin-c -> plugin-a
```

**Solution**: Review your plugin dependencies and remove the circular reference.

### Missing Dependency Error

```
Error: Plugin "my-plugin" requires "base-plugin" which is not installed.
Install it with: npm install base-plugin
```

**Solution**: Install the missing dependency or mark it as optional.

### Version Mismatch Error

```
Error: Plugin "my-plugin" requires "base-plugin" version ^2.0.0, but version 1.0.0 is installed
```

**Solution**: Update the dependency to a compatible version.

### Validation Error

```
Plugin configuration validation failed:
  - [my-plugin] name: Plugin name is required
```

**Solution**: Fix the configuration according to the error message.

## Examples

See [examples/plugin-system-example.ts](./examples/plugin-system-example.ts) for complete examples.

## Testing

The plugin system includes comprehensive property-based tests using fast-check:

- **Property 59**: Plugin dependency resolution
- **Property 60**: Plugin configuration validation
- **Property 61**: Plugin composition
- **Property 62**: Plugin conflict detection

Run tests with:

```bash
npm test -- pluginSystem.test.ts
```

## Related

- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Examples](./examples/)
