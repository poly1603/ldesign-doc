/**
 * Version plugin client configuration
 * Registers global components for version management
 */

import type { PluginGlobalComponent } from '../../shared/types'
import VersionSelector from './VersionSelector.vue'
import DeprecationBanner from './DeprecationBanner.vue'

/**
 * Global components to register
 */
export const globalComponents: PluginGlobalComponent[] = [
  {
    name: 'LDocVersionSelector',
    component: VersionSelector
  },
  {
    name: 'LDocDeprecationBanner',
    component: DeprecationBanner
  }
]

export default { globalComponents }
