# Security Plugin

The security plugin provides comprehensive security features for @ldesign/doc including RBAC (Role-Based Access Control), content encryption, and XSS protection.

## Features

### 1. RBAC (Role-Based Access Control)

Control access to documentation pages based on user roles and permissions.

```typescript
import { securityPlugin } from '@ldesign/doc/plugins/security'

export default defineConfig({
  plugins: [
    securityPlugin({
      rbac: {
        roles: [
          {
            id: 'admin',
            name: 'Administrator',
            permissions: ['*']
          },
          {
            id: 'user',
            name: 'User',
            permissions: ['read']
          }
        ],
        pageRules: [
          {
            path: '/admin/*',
            roles: ['admin']
          },
          {
            path: '/docs/*',
            roles: ['admin', 'user']
          }
        ],
        onUnauthorized: (path, user) => {
          console.log(`Access denied to ${path} for user`, user)
        }
      }
    })
  ]
})
```

### 2. Content Encryption

Encrypt sensitive documentation content that requires a password to view.

```typescript
import { securityPlugin, EncryptionUtils } from '@ldesign/doc/plugins/security'

// Encrypt content
const encrypted = await EncryptionUtils.encrypt('Secret content', 'password123')

// Use in plugin
export default defineConfig({
  plugins: [
    securityPlugin({
      encryption: {
        enabled: true,
        algorithm: 'AES-GCM',
        passwordPrompt: 'Enter password to view this content',
        validatePassword: async (password) => {
          // Custom password validation
          return password.length >= 8
        }
      }
    })
  ]
})
```

### 3. XSS Protection

Sanitize user-generated content to prevent XSS attacks.

```typescript
import { securityPlugin, XSSUtils } from '@ldesign/doc/plugins/security'

// Sanitize HTML
const safe = XSSUtils.sanitizeHtml(userInput, {
  enabled: true,
  allowedTags: ['p', 'a', 'strong', 'em'],
  allowIframes: false
})

// Use in plugin
export default defineConfig({
  plugins: [
    securityPlugin({
      xss: {
        enabled: true,
        allowedTags: ['p', 'a', 'strong', 'em', 'code', 'pre'],
        allowedProtocols: ['http', 'https', 'mailto'],
        allowIframes: false
      }
    })
  ]
})
```

## Components

### LDocSecurityGuard

Automatically injected component that enforces access control rules.

### LDocEncryptedContent

Component for displaying encrypted content with password prompt.

```vue
<LDocEncryptedContent
  :encrypted="encryptedData"
  content-id="secret-doc-1"
/>
```

### LDocSafeHtml

Component for safely rendering HTML content with XSS protection.

```vue
<LDocSafeHtml
  :html="userGeneratedContent"
  :sanitize="true"
/>
```

## Utility Functions

### RBACUtils

```typescript
import { RBACUtils } from '@ldesign/doc/plugins/security'

// Check if user has role
RBACUtils.hasRole(user, 'admin')

// Check if user has any of the roles
RBACUtils.hasAnyRole(user, ['admin', 'moderator'])

// Check if user has all roles
RBACUtils.hasAllRoles(user, ['user', 'verified'])

// Get role permissions (including inherited)
RBACUtils.getRolePermissions('admin', roles)

// Check if user has permission
RBACUtils.hasPermission(user, 'write', roles)
```

### EncryptionUtils

```typescript
import { EncryptionUtils } from '@ldesign/doc/plugins/security'

// Encrypt content
const encrypted = await EncryptionUtils.encrypt(content, password)

// Decrypt content
const decrypted = await EncryptionUtils.decrypt(encrypted, password)

// Generate salt
const salt = EncryptionUtils.generateSalt()

// Generate IV
const iv = EncryptionUtils.generateIV()
```

### XSSUtils

```typescript
import { XSSUtils } from '@ldesign/doc/plugins/security'

// Escape HTML
const escaped = XSSUtils.escapeHtml('<script>alert("XSS")</script>')

// Sanitize HTML
const safe = XSSUtils.sanitizeHtml(html, options)

// Check if URL is safe
const isSafe = XSSUtils.isSafeUrl(url, ['http', 'https'])
```

## Audit Logging

Enable audit logging to track access and security events:

```typescript
export default defineConfig({
  plugins: [
    securityPlugin({
      audit: {
        enabled: true,
        logAccess: (user, path, allowed) => {
          console.log(`[${new Date().toISOString()}] ${user?.name || 'Anonymous'} ${allowed ? 'accessed' : 'denied'} ${path}`)
        },
        logDecryption: (user, contentId) => {
          console.log(`[${new Date().toISOString()}] ${user?.name || 'Anonymous'} decrypted ${contentId}`)
        }
      }
    })
  ]
})
```

## Testing

The security plugin includes comprehensive property-based tests:

- **RBAC Tests**: 14 tests validating role-based access control
- **Encryption Tests**: 16 tests validating encryption/decryption
- **XSS Protection Tests**: 26 tests validating XSS sanitization

Run tests:

```bash
npm test -- security --run
```

## License

MIT
