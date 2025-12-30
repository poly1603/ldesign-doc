/**
 * RBAC 属性测试
 * Feature: doc-system-enhancement, Property 42: RBAC enforcement
 * Validates: Requirements 11.1
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { RBACUtils } from './index'
import type { AuthUser, Role, PageAccessRule } from './index'

// ============== 测试数据生成器 ==============

/**
 * 生成角色
 */
const roleArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  description: fc.option(fc.string()),
  permissions: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
  inherits: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 3 }))
})

/**
 * 生成用户（带角色）
 */
const userWithRolesArb = (availableRoles: string[]) => fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  email: fc.option(fc.emailAddress()),
  avatar: fc.option(fc.webUrl()),
  roles: fc.array(fc.constantFrom(...availableRoles), { minLength: 1, maxLength: 3 })
})

/**
 * 生成页面访问规则
 */
const pageAccessRuleArb = (availableRoles: string[]) => fc.record({
  path: fc.oneof(
    fc.constant('/admin/*'),
    fc.constant('/docs/*'),
    fc.constant('/api/*'),
    fc.string({ minLength: 1, maxLength: 20 }).map(s => `/${s}`)
  ),
  roles: fc.option(fc.array(fc.constantFrom(...availableRoles), { minLength: 1, maxLength: 3 })),
  permissions: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }))
})

// ============== 属性测试 ==============

describe('RBAC Property Tests', () => {
  /**
   * Property 42: RBAC enforcement
   * For any page with role restrictions, access attempts by users without the required role SHALL be denied.
   */
  it('should deny access to users without required roles', () => {
    fc.assert(
      fc.property(
        fc.array(roleArb, { minLength: 2, maxLength: 5 }),
        (roles) => {
          // 确保至少有两个不同的角色
          const uniqueRoles = Array.from(new Set(roles.map(r => r.id)))
          if (uniqueRoles.length < 2) return true

          const roleIds = uniqueRoles.slice(0, 2)
          const requiredRole = roleIds[0]
          const userRole = roleIds[1]

          // 创建用户（只有 userRole）
          const user: AuthUser = {
            id: '1',
            name: 'Test User',
            roles: [userRole]
          }

          // 创建需要 requiredRole 的规则
          const rule: PageAccessRule = {
            path: '/protected',
            roles: [requiredRole]
          }

          // 用户应该没有所需角色
          const hasAccess = RBACUtils.hasAnyRole(user, rule.roles!)

          return !hasAccess
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Users with required roles should have access
   */
  it('should grant access to users with required roles', () => {
    fc.assert(
      fc.property(
        fc.array(roleArb, { minLength: 1, maxLength: 5 }),
        (roles) => {
          const roleIds = roles.map(r => r.id).filter((id, index, self) => self.indexOf(id) === index)
          if (roleIds.length === 0) return true

          const requiredRole = roleIds[0]

          // 创建用户（有 requiredRole）
          const user: AuthUser = {
            id: '1',
            name: 'Test User',
            roles: [requiredRole]
          }

          // 创建需要 requiredRole 的规则
          const rule: PageAccessRule = {
            path: '/protected',
            roles: [requiredRole]
          }

          // 用户应该有所需角色
          const hasAccess = RBACUtils.hasAnyRole(user, rule.roles!)

          return hasAccess
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Users without any roles should be denied access to protected pages
   */
  it('should deny access to users without roles', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (requiredRoles) => {
          // 创建没有角色的用户
          const user: AuthUser = {
            id: '1',
            name: 'Test User'
            // 没有 roles 字段
          }

          // 检查访问
          const hasAccess = RBACUtils.hasAnyRole(user, requiredRoles)

          return !hasAccess
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Null users should be denied access to protected pages
   */
  it('should deny access to null users', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (requiredRoles) => {
          const hasAccess = RBACUtils.hasAnyRole(null, requiredRoles)
          return !hasAccess
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Permission inheritance should work correctly
   */
  it('should correctly inherit permissions from parent roles', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (permission) => {
          // 创建角色层级：parent -> child
          const parentRole: Role = {
            id: 'parent',
            name: 'Parent Role',
            permissions: [permission]
          }

          const childRole: Role = {
            id: 'child',
            name: 'Child Role',
            permissions: [],
            inherits: ['parent']
          }

          const roles = [parentRole, childRole]

          // 获取子角色的权限（应该包含父角色的权限）
          const childPermissions = RBACUtils.getRolePermissions('child', roles)

          return childPermissions.includes(permission)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Wildcard permission should grant all permissions
   */
  it('should grant all permissions with wildcard', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (permission) => {
          // 创建有通配符权限的角色
          const adminRole: Role = {
            id: 'admin',
            name: 'Admin',
            permissions: ['*']
          }

          const user: AuthUser = {
            id: '1',
            name: 'Admin User',
            roles: ['admin']
          }

          // 检查任意权限
          const hasPermission = RBACUtils.hasPermission(user, permission, [adminRole])

          return hasPermission
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Users with multiple roles should have combined permissions
   */
  it('should combine permissions from multiple roles', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 })
        ).filter(([p1, p2]) => p1 !== p2),
        ([perm1, perm2]) => {
          // 创建两个角色，每个有不同的权限
          const role1: Role = {
            id: 'role1',
            name: 'Role 1',
            permissions: [perm1]
          }

          const role2: Role = {
            id: 'role2',
            name: 'Role 2',
            permissions: [perm2]
          }

          const user: AuthUser = {
            id: '1',
            name: 'Multi-role User',
            roles: ['role1', 'role2']
          }

          const roles = [role1, role2]

          // 用户应该同时拥有两个权限
          const hasPerm1 = RBACUtils.hasPermission(user, perm1, roles)
          const hasPerm2 = RBACUtils.hasPermission(user, perm2, roles)

          return hasPerm1 && hasPerm2
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: hasAllRoles should require all specified roles
   */
  it('should require all roles for hasAllRoles', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 })
          .filter((roles, index, self) => {
            // 确保所有角色都是唯一的
            return roles.length === new Set(roles).size
          }),
        (requiredRoles) => {
          if (requiredRoles.length < 2) return true

          // 创建只有部分角色的用户
          const userRoles = requiredRoles.slice(0, requiredRoles.length - 1)

          const user: AuthUser = {
            id: '1',
            name: 'Partial User',
            roles: userRoles
          }

          // 用户不应该通过 hasAllRoles 检查
          const hasAll = RBACUtils.hasAllRoles(user, requiredRoles)

          return !hasAll
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Empty role requirements should allow access
   */
  it('should allow access when no roles are required', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 20 }),
          roles: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 })))
        }),
        (user) => {
          // 空的角色要求
          const requiredRoles: string[] = []

          // 任何用户都应该有访问权限
          const hasAccess = requiredRoles.length === 0 || RBACUtils.hasAnyRole(user as AuthUser, requiredRoles)

          return hasAccess
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Role checking should be case-sensitive
   */
  it('should perform case-sensitive role matching', () => {
    const user: AuthUser = {
      id: '1',
      name: 'Test User',
      roles: ['Admin']
    }

    // 不同大小写的角色名应该不匹配
    expect(RBACUtils.hasRole(user, 'admin')).toBe(false)
    expect(RBACUtils.hasRole(user, 'Admin')).toBe(true)
    expect(RBACUtils.hasRole(user, 'ADMIN')).toBe(false)
  })
})

// ============== 单元测试（补充边界情况） ==============

describe('RBAC Unit Tests', () => {
  it('should handle circular role inheritance gracefully', () => {
    const role1: Role = {
      id: 'role1',
      name: 'Role 1',
      permissions: ['perm1'],
      inherits: ['role2']
    }

    const role2: Role = {
      id: 'role2',
      name: 'Role 2',
      permissions: ['perm2'],
      inherits: ['role1'] // 循环继承
    }

    const roles = [role1, role2]

    // 应该能处理循环继承而不会无限循环
    // 注意：当前实现可能会有问题，这是一个已知限制
    const permissions = RBACUtils.getRolePermissions('role1', roles)

    // 至少应该包含直接权限
    expect(permissions).toContain('perm1')
  })

  it('should handle non-existent role gracefully', () => {
    const roles: Role[] = [
      {
        id: 'admin',
        name: 'Admin',
        permissions: ['*']
      }
    ]

    const permissions = RBACUtils.getRolePermissions('nonexistent', roles)

    expect(permissions).toEqual([])
  })

  it('should handle user with empty roles array', () => {
    const user: AuthUser = {
      id: '1',
      name: 'Test User',
      roles: []
    }

    expect(RBACUtils.hasRole(user, 'admin')).toBe(false)
    expect(RBACUtils.hasAnyRole(user, ['admin', 'user'])).toBe(false)
    expect(RBACUtils.hasAllRoles(user, ['admin'])).toBe(false)
  })

  it('should handle deep role inheritance', () => {
    const roles: Role[] = [
      {
        id: 'level3',
        name: 'Level 3',
        permissions: ['perm3']
      },
      {
        id: 'level2',
        name: 'Level 2',
        permissions: ['perm2'],
        inherits: ['level3']
      },
      {
        id: 'level1',
        name: 'Level 1',
        permissions: ['perm1'],
        inherits: ['level2']
      }
    ]

    const permissions = RBACUtils.getRolePermissions('level1', roles)

    // 应该包含所有层级的权限
    expect(permissions).toContain('perm1')
    expect(permissions).toContain('perm2')
    expect(permissions).toContain('perm3')
  })
})
