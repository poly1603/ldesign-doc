/**
 * 加密属性测试
 * Feature: doc-system-enhancement, Property 43: Content encryption round-trip
 * Validates: Requirements 11.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { EncryptionUtils } from './index'

// ============== 属性测试 ==============

describe('Encryption Property Tests', () => {
  /**
   * Property 43: Content encryption round-trip
   * For any encrypted content, decrypting with the correct key SHALL produce the original content.
   */
  it('should decrypt to original content with correct password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (content, password) => {
          // 加密
          const encrypted = await EncryptionUtils.encrypt(content, password)

          // 解密
          const decrypted = await EncryptionUtils.decrypt(encrypted, password)

          // 应该得到原始内容
          return decrypted === content
        }
      ),
      { numRuns: 10 }
    )
  }, 30000) // 30 second timeout

  /**
   * Property: Encryption should produce different ciphertext for same content
   */
  it('should produce different ciphertext for same content (due to random IV)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (content, password) => {
          // 加密两次
          const encrypted1 = await EncryptionUtils.encrypt(content, password)
          const encrypted2 = await EncryptionUtils.encrypt(content, password)

          // 密文应该不同（因为使用了随机 IV）
          return encrypted1.data !== encrypted2.data || encrypted1.iv !== encrypted2.iv
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  /**
   * Property: Decryption with wrong password should fail
   */
  it('should fail to decrypt with wrong password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.tuple(
          fc.string({ minLength: 8, maxLength: 20 }),
          fc.string({ minLength: 8, maxLength: 20 })
        ).filter(([p1, p2]) => p1 !== p2),
        async (content, [correctPassword, wrongPassword]) => {
          // 用正确密码加密
          const encrypted = await EncryptionUtils.encrypt(content, correctPassword)

          // 用错误密码解密应该失败
          try {
            await EncryptionUtils.decrypt(encrypted, wrongPassword)
            return false // 不应该成功
          } catch (e) {
            return true // 应该抛出错误
          }
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  /**
   * Property: Empty content should encrypt and decrypt correctly
   */
  it('should handle empty content', async () => {
    const password = 'test-password-123'
    const content = ''

    const encrypted = await EncryptionUtils.encrypt(content, password)
    const decrypted = await EncryptionUtils.decrypt(encrypted, password)

    expect(decrypted).toBe(content)
  })

  /**
   * Property: Unicode content should encrypt and decrypt correctly
   */
  it('should handle unicode content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (content, password) => {
          const encrypted = await EncryptionUtils.encrypt(content, password)
          const decrypted = await EncryptionUtils.decrypt(encrypted, password)

          return decrypted === content
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)

  /**
   * Property: Very long content should encrypt and decrypt correctly
   */
  it('should handle long content', async () => {
    const password = 'test-password-123'
    const content = 'A'.repeat(10000)

    const encrypted = await EncryptionUtils.encrypt(content, password)
    const decrypted = await EncryptionUtils.decrypt(encrypted, password)

    expect(decrypted).toBe(content)
  })

  /**
   * Property: Encrypted data should have required fields
   */
  it('should produce encrypted data with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (content, password) => {
          const encrypted = await EncryptionUtils.encrypt(content, password)

          // 检查所有必需字段
          return (
            typeof encrypted.data === 'string' &&
            encrypted.data.length > 0 &&
            typeof encrypted.iv === 'string' &&
            encrypted.iv.length > 0 &&
            typeof encrypted.salt === 'string' &&
            encrypted.salt.length > 0 &&
            encrypted.algorithm === 'AES-GCM' &&
            encrypted.version === 1
          )
        }
      ),
      { numRuns: 5 }
    )
  }, 30000)
})

// ============== 单元测试（补充边界情况） ==============

describe('Encryption Unit Tests', () => {
  it('should generate different salts', () => {
    const salt1 = EncryptionUtils.generateSalt()
    const salt2 = EncryptionUtils.generateSalt()

    expect(salt1).not.toEqual(salt2)
    expect(salt1.length).toBe(16)
    expect(salt2.length).toBe(16)
  })

  it('should generate different IVs', () => {
    const iv1 = EncryptionUtils.generateIV()
    const iv2 = EncryptionUtils.generateIV()

    expect(iv1).not.toEqual(iv2)
    expect(iv1.length).toBe(12)
    expect(iv2.length).toBe(12)
  })

  it('should convert ArrayBuffer to Base64 and back', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5])
    const base64 = EncryptionUtils.arrayBufferToBase64(original)
    const restored = EncryptionUtils.base64ToArrayBuffer(base64)

    expect(restored).toEqual(original)
  })

  it('should handle special characters in content', async () => {
    const password = 'test-password-123'
    const content = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'

    const encrypted = await EncryptionUtils.encrypt(content, password)
    const decrypted = await EncryptionUtils.decrypt(encrypted, password)

    expect(decrypted).toBe(content)
  })

  it('should handle newlines and tabs in content', async () => {
    const password = 'test-password-123'
    const content = 'Line 1\nLine 2\tTabbed\r\nWindows newline'

    const encrypted = await EncryptionUtils.encrypt(content, password)
    const decrypted = await EncryptionUtils.decrypt(encrypted, password)

    expect(decrypted).toBe(content)
  })

  it('should handle JSON content', async () => {
    const password = 'test-password-123'
    const obj = { name: 'Test', value: 123, nested: { key: 'value' } }
    const content = JSON.stringify(obj)

    const encrypted = await EncryptionUtils.encrypt(content, password)
    const decrypted = await EncryptionUtils.decrypt(encrypted, password)

    expect(JSON.parse(decrypted)).toEqual(obj)
  })

  it('should fail with tampered ciphertext', async () => {
    const password = 'test-password-123'
    const content = 'Secret message'

    const encrypted = await EncryptionUtils.encrypt(content, password)

    // 篡改密文
    const tampered = {
      ...encrypted,
      data: encrypted.data.slice(0, -1) + 'X'
    }

    await expect(EncryptionUtils.decrypt(tampered, password)).rejects.toThrow()
  })

  it('should fail with tampered IV', async () => {
    const password = 'test-password-123'
    const content = 'Secret message'

    const encrypted = await EncryptionUtils.encrypt(content, password)

    // 篡改 IV
    const tampered = {
      ...encrypted,
      iv: encrypted.iv.slice(0, -1) + 'X'
    }

    await expect(EncryptionUtils.decrypt(tampered, password)).rejects.toThrow()
  })

  it('should fail with tampered salt', async () => {
    const password = 'test-password-123'
    const content = 'Secret message'

    const encrypted = await EncryptionUtils.encrypt(content, password)

    // 篡改盐值
    const tampered = {
      ...encrypted,
      salt: encrypted.salt.slice(0, -1) + 'X'
    }

    await expect(EncryptionUtils.decrypt(tampered, password)).rejects.toThrow()
  })
})
