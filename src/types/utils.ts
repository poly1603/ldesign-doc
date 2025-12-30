/**
 * @ldesign/doc - 工具类型定义
 * 
 * 提供常用的 TypeScript 工具类型
 */

/**
 * 深度可选类型
 * 将对象的所有属性（包括嵌套属性）转换为可选
 * 
 * @example
 * ```ts
 * interface Config {
 *   theme: {
 *     color: string
 *     font: string
 *   }
 * }
 * 
 * type PartialConfig = DeepPartial<Config>
 * // { theme?: { color?: string; font?: string } }
 * ```
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T

/**
 * 可等待类型
 * 表示值可以是同步或异步的
 * 
 * @example
 * ```ts
 * async function process(input: Awaitable<string>): Promise<string> {
 *   return await input
 * }
 * ```
 */
export type Awaitable<T> = T | Promise<T>

/**
 * 可能是 Ref 类型
 * 用于接受原始值或 Vue Ref 包装的值
 * 
 * @example
 * ```ts
 * function useValue(input: MaybeRef<string>) {
 *   const value = isRef(input) ? input.value : input
 * }
 * ```
 */
export type MaybeRef<T> = T | { value: T }

/**
 * 可能是 Readonly 类型
 */
export type MaybeReadonly<T> = T | Readonly<T>

/**
 * 获取数组元素类型
 * 
 * @example
 * ```ts
 * type Item = ArrayElement<string[]> // string
 * ```
 */
export type ArrayElement<T> = T extends readonly (infer E)[] ? E : never

/**
 * 获取 Promise 解析类型
 * 
 * @example
 * ```ts
 * type Result = PromiseType<Promise<string>> // string
 * ```
 */
export type PromiseType<T> = T extends Promise<infer R> ? R : T

/**
 * 获取函数返回类型（支持异步）
 */
export type AsyncReturnType<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : ReturnType<T>

/**
 * 必需的键
 * 将指定的键设为必需
 * 
 * @example
 * ```ts
 * interface Config {
 *   name?: string
 *   value?: number
 * }
 * type RequiredName = RequiredKeys<Config, 'name'>
 * // { name: string; value?: number }
 * ```
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * 可选的键
 * 将指定的键设为可选
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 排除 undefined
 */
export type NonUndefined<T> = T extends undefined ? never : T

/**
 * 字符串字面量联合类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
