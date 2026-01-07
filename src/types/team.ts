/**
 * @ldesign/doc - 团队页面类型定义
 */

import type { SocialLink } from './theme'

/**
 * 团队成员信息
 */
export interface TeamMember {
  /** 头像 URL */
  avatar: string
  /** 姓名 */
  name: string
  /** 职位/角色 */
  title?: string
  /** 组织名称 */
  org?: string
  /** 组织链接 */
  orgLink?: string
  /** 个人描述 */
  desc?: string
  /** 赞助链接 */
  sponsor?: string
  /** 赞助按钮文本 */
  actionText?: string
  /** 社交链接 */
  links?: SocialLink[]
}

/**
 * VPTeamMembers 组件属性
 */
export interface TeamMembersProps {
  /** 成员列表 */
  members: TeamMember[]
  /** 显示尺寸 */
  size?: 'small' | 'medium'
}

/**
 * VPTeamPage 组件属性
 */
export interface TeamPageProps {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  lead?: string
}

/**
 * VPTeamPageSection 组件属性
 */
export interface TeamPageSectionProps {
  /** 分组标题 */
  title?: string
  /** 分组描述 */
  lead?: string
}
