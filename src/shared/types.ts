/** 
 * @ldesign/doc - 核心类型定义
 * 
 * 此文件从 src/types/ 目录重新导出所有类型，保持向后兼容。
 * 新代码建议直接 from "@ldesign/doc" 或 "@ldesign/doc/types" 导入类型。
 * 
 * @see src/types/index.ts 获取完整的类型定义
 */

// 从新的类型文件重新导出所有类型
export * from "../types"

// 为了向后兼容，保留 Vite 类型的导入
import type { Plugin as VitePlugin, UserConfig as ViteUserConfig } from "vite"
export type { VitePlugin, ViteUserConfig }
