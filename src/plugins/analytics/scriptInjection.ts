/**
 * 分析脚本注入模块
 * 
 * 负责生成和注入各种分析平台的脚本
 */

import type {
  GoogleAnalyticsConfig,
  PlausibleConfig,
  UmamiConfig,
  CustomAnalyticsConfig
} from './index'

/**
 * 生成 Google Analytics 脚本
 * 
 * @param config Google Analytics 配置
 * @returns 脚本 HTML 字符串
 */
export function generateGoogleAnalyticsScript(config: GoogleAnalyticsConfig): string {
  const customDimensions = config.customDimensions
    ? Object.entries(config.customDimensions)
      .map(([key, value]) => `'${key}': '${value}'`)
      .join(', ')
    : ''

  const configOptions = [
    config.enhancedMeasurement ? "'enhanced_measurement': true" : '',
    customDimensions
  ].filter(Boolean).join(', ')

  return `
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${config.measurementId}'${configOptions ? `, { ${configOptions} }` : ''});
  
  // 页面浏览追踪
  if (typeof window !== 'undefined') {
    window.addEventListener('ldoc:route-change', (e) => {
      gtag('config', '${config.measurementId}', {
        'page_path': e.detail.path
      });
    });
  }
</script>
`.trim()
}

/**
 * 生成 Plausible 脚本
 * 
 * @param config Plausible 配置
 * @returns 脚本 HTML 字符串
 */
export function generatePlausibleScript(config: PlausibleConfig): string {
  const apiHost = config.apiHost || 'https://plausible.io'
  const scriptSrc = `${apiHost}/js/script${config.trackOutboundLinks ? '.outbound-links' : ''}.js`

  return `
<!-- Plausible Analytics -->
<script defer data-domain="${config.domain}" src="${scriptSrc}"></script>
<script>
  // 页面浏览追踪
  if (typeof window !== 'undefined') {
    window.addEventListener('ldoc:route-change', (e) => {
      if (window.plausible) {
        window.plausible('pageview', { props: { path: e.detail.path } });
      }
    });
  }
</script>
`.trim()
}

/**
 * 生成 Umami 脚本
 * 
 * @param config Umami 配置
 * @returns 脚本 HTML 字符串
 */
export function generateUmamiScript(config: UmamiConfig): string {
  const dataDomainAttr = config.dataDomain ? ` data-domains="${config.dataDomain}"` : ''

  return `
<!-- Umami Analytics -->
<script async src="${config.src}" data-website-id="${config.websiteId}"${dataDomainAttr}></script>
<script>
  // 页面浏览追踪
  if (typeof window !== 'undefined') {
    window.addEventListener('ldoc:route-change', (e) => {
      if (window.umami) {
        window.umami.track({ url: e.detail.path });
      }
    });
  }
</script>
`.trim()
}

/**
 * 生成自定义分析脚本
 * 
 * @param config 自定义分析配置
 * @returns 脚本 HTML 字符串
 */
export function generateCustomScript(config: CustomAnalyticsConfig): string {
  let script = config.script || ''

  // 如果提供了追踪函数，添加路由变化监听
  if (config.trackPageView) {
    script += `
<script>
  // 页面浏览追踪
  if (typeof window !== 'undefined') {
    const trackPageView = ${config.trackPageView.toString()};
    window.addEventListener('ldoc:route-change', (e) => {
      trackPageView(e.detail.path);
    });
  }
</script>
`
  }

  return script.trim()
}

/**
 * 注入分析脚本到 HTML
 * 
 * @param html 原始 HTML
 * @param scripts 要注入的脚本数组
 * @returns 注入后的 HTML
 */
export function injectScripts(html: string, scripts: string[]): string {
  if (scripts.length === 0) {
    return html
  }

  const scriptTags = scripts.join('\n')

  // 尝试在 </head> 前注入
  if (html.includes('</head>')) {
    return html.replace('</head>', `${scriptTags}\n</head>`)
  }

  // 如果没有 </head>，在 <body> 后注入
  if (html.includes('<body>')) {
    return html.replace('<body>', `<body>\n${scriptTags}`)
  }

  // 如果都没有，直接添加到开头
  return scriptTags + '\n' + html
}

/**
 * 清理脚本标签（用于测试）
 * 
 * @param script 脚本字符串
 * @returns 清理后的脚本
 */
export function cleanScript(script: string): string {
  return script
    .replace(/<!--.*?-->/gs, '') // 移除注释
    .replace(/\s+/g, ' ') // 压缩空白
    .trim()
}

/**
 * 提取脚本中的配置值（用于测试）
 * 
 * @param script 脚本字符串
 * @param key 配置键
 * @returns 配置值
 */
export function extractScriptConfig(script: string, key: string): string | null {
  const regex = new RegExp(`${key}['"\\s]*[:=]['"\\s]*['"]([^'"]+)['"]`)
  const match = script.match(regex)
  return match ? match[1] : null
}
