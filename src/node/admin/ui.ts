/**
 * LDoc Admin UI - 完整功能版 (使用 Lucide 图标)
 */

export interface AdminUIOptions {
  docsPort?: number
}

const CSS = `
:root{--primary:#6366f1;--success:#10b981;--danger:#ef4444;--bg:#f9fafb;--card:#fff;--border:#e5e7eb;--text:#111827;--text2:#6b7280}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:14px}
.app{display:flex;min-height:100vh}
.sidebar{width:220px;background:#0f172a;color:#fff;position:fixed;height:100vh;display:flex;flex-direction:column}
.logo{padding:16px;font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,0.1)}
.nav{flex:1;padding:8px;overflow-y:auto}.nav-group{margin-bottom:16px}
.nav-title{padding:8px 12px;font-size:10px;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:600}
.nav-item{display:flex;align-items:center;gap:8px;padding:9px 12px;color:rgba(255,255,255,0.6);border-radius:6px;cursor:pointer;font-size:13px}
.nav-item:hover{background:rgba(255,255,255,0.1);color:#fff}.nav-item.active{background:var(--primary);color:#fff}
.nav-footer{padding:12px;border-top:1px solid rgba(255,255,255,0.1)}
.nav-footer a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:12px;display:flex;align-items:center;gap:6px}
.main{flex:1;margin-left:220px;padding:20px 24px}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.page-header h1{font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer}
.btn-primary{background:var(--primary);color:#fff}.btn-secondary{background:#fff;color:var(--text);border:1px solid var(--border)}
.btn-sm{padding:6px 10px;font-size:12px}.btn-icon{width:32px;height:32px;padding:0;justify-content:center}
.card{background:var(--card);border-radius:8px;border:1px solid var(--border);margin-bottom:16px}
.card-header{padding:12px 16px;border-bottom:1px solid var(--border);font-weight:500;font-size:13px;display:flex;align-items:center;gap:8px}
.card-header .actions{margin-left:auto;display:flex;gap:6px}.card-body{padding:16px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat{background:var(--card);border-radius:8px;padding:16px;border:1px solid var(--border)}
.stat-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}
.stat-icon.blue{background:#dbeafe;color:#2563eb}.stat-icon.green{background:#d1fae5;color:#059669}
.stat-icon.purple{background:#ede9fe;color:#7c3aed}.stat-icon.orange{background:#ffedd5;color:#ea580c}
.stat-value{font-size:24px;font-weight:700}.stat-label{font-size:12px;color:var(--text2);margin-top:2px}
.form-group{margin-bottom:14px}.form-label{display:block;font-size:12px;font-weight:500;margin-bottom:5px;color:var(--text2)}
.form-input{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:13px}
.form-input:focus{outline:none;border-color:var(--primary)}.form-hint{font-size:11px;color:#9ca3af;margin-top:3px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.checkbox{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}.checkbox input{width:16px;height:16px}
.table{width:100%;border-collapse:collapse;font-size:13px}.table th,.table td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--border)}
.table th{font-weight:500;color:var(--text2);font-size:11px;text-transform:uppercase;background:var(--bg)}
.list-item{display:flex;gap:8px;padding:10px;background:var(--bg);border-radius:6px;margin-bottom:6px;align-items:center}
.list-item input{flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px}
.nav-cfg{background:var(--card);border:1px solid var(--border);border-radius:8px;margin-bottom:10px}
.nav-cfg-head{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer}
.nav-cfg-head:hover{background:var(--bg)}.nav-cfg-head .inputs{flex:1;display:flex;gap:10px}
.nav-cfg-head input{padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px}
.nav-cfg-head input:first-child{width:120px}
.nav-cfg-body{border-top:1px solid var(--border);padding:14px;background:var(--bg);display:none}
.nav-cfg-body.open{display:block}.nav-cfg-body h4{font-size:12px;font-weight:500;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.sb-group{margin-bottom:12px;padding:10px;background:#fff;border:1px solid var(--border);border-radius:6px}
.sb-group-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.sb-group-head input{flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-weight:500}
.sb-item{display:flex;gap:8px;padding:8px 10px;background:#fff;border:1px solid var(--border);border-radius:6px;margin-bottom:5px;margin-left:16px;align-items:center}
.sb-item input{padding:6px 8px;border:1px solid var(--border);border-radius:4px;font-size:12px}
.sb-item input:first-of-type{width:120px}.sb-item input:last-of-type{flex:1}
.page{display:none}.page.active{display:block}
.badge{display:inline-flex;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:500}
.badge.blue{background:#dbeafe;color:#1d4ed8}.badge.green{background:#d1fae5;color:#047857}.badge.purple{background:#ede9fe;color:#6d28d9}
.code{background:#1e293b;color:#e2e8f0;padding:14px;border-radius:6px;font-family:monospace;font-size:12px;overflow-x:auto}
.toast{position:fixed;bottom:20px;right:20px;background:#1e293b;color:#fff;padding:10px 16px;border-radius:6px;font-size:13px;display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(10px);transition:all 0.3s}
.toast.show{opacity:1;transform:translateY(0)}.toast.success{background:var(--success)}.toast.error{background:var(--danger)}
.empty{text-align:center;padding:32px;color:var(--text2)}
@media(max-width:1200px){.stats{grid-template-columns:repeat(2,1fr)}.grid-2,.grid-3{grid-template-columns:1fr}}
@media(max-width:768px){.sidebar{display:none}.main{margin-left:0}}
`

export function generateAdminHTML(options: AdminUIOptions = {}): string {
  const { docsPort = 5173 } = options

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LDoc Admin</title>
<script src="https://cdn.jsdelivr.net/npm/lucide@0.263.1/dist/umd/lucide.min.js"><\/script>
<style>${CSS}</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<div class="logo"><i data-lucide="book-open"></i>LDoc Admin</div>
<nav class="nav">
<div class="nav-group"><div class="nav-title">概览</div>
<div class="nav-item active" onclick="go('dashboard')"><i data-lucide="layout-dashboard"></i>仪表盘</div></div>
<div class="nav-group"><div class="nav-title">配置</div>
<div class="nav-item" onclick="go('site')"><i data-lucide="settings"></i>站点配置</div>
<div class="nav-item" onclick="go('theme')"><i data-lucide="palette"></i>主题配置</div>
<div class="nav-item" onclick="go('markdown')"><i data-lucide="file-text"></i>Markdown</div>
<div class="nav-item" onclick="go('build')"><i data-lucide="hammer"></i>构建配置</div>
<div class="nav-item" onclick="go('vite')"><i data-lucide="zap"></i>Vite配置</div>
<div class="nav-item" onclick="go('deploy')"><i data-lucide="rocket"></i>部署配置</div></div>
<div class="nav-group"><div class="nav-title">内容</div>
<div class="nav-item" onclick="go('nav')"><i data-lucide="menu"></i>导航与侧边栏</div>
<div class="nav-item" onclick="go('docs')"><i data-lucide="files"></i>文档管理</div>
<div class="nav-item" onclick="go('plugins')"><i data-lucide="puzzle"></i>插件</div></div>
</nav>
<div class="nav-footer"><a href="http://localhost:${docsPort}" target="_blank"><i data-lucide="external-link"></i>预览站点</a></div>
</aside>
<main class="main">
${getPages(docsPort)}
</main>
</div>
<div id="toast" class="toast"><i data-lucide="check"></i><span></span></div>
<script>${getScript()}<\/script>
</body>
</html>`
}

function getPages(port: number): string {
  return `
<div id="p-dashboard" class="page active">
<div class="page-header"><h1><i data-lucide="layout-dashboard"></i>仪表盘</h1>
<div style="display:flex;gap:8px"><button class="btn btn-secondary" onclick="loadData()"><i data-lucide="refresh-cw"></i>刷新</button>
<a href="http://localhost:${port}" target="_blank" class="btn btn-primary"><i data-lucide="external-link"></i>预览站点</a></div></div>
<div class="stats">
<div class="stat"><div class="stat-icon blue"><i data-lucide="file-text"></i></div><div class="stat-value" id="s-pages">0</div><div class="stat-label">文档数量</div></div>
<div class="stat"><div class="stat-icon green"><i data-lucide="navigation"></i></div><div class="stat-value" id="s-nav">0</div><div class="stat-label">导航项</div></div>
<div class="stat"><div class="stat-icon purple"><i data-lucide="sidebar"></i></div><div class="stat-value" id="s-sidebar">0</div><div class="stat-label">侧边栏项</div></div>
<div class="stat"><div class="stat-icon orange"><i data-lucide="puzzle"></i></div><div class="stat-value" id="s-plugins">0</div><div class="stat-label">插件</div></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
<div class="card"><div class="card-header"><i data-lucide="clock"></i>最近更新</div><div class="card-body" style="padding:0"><table class="table"><thead><tr><th>标题</th><th>路径</th><th>时间</th></tr></thead><tbody id="recent"></tbody></table></div></div>
<div class="card"><div class="card-header"><i data-lucide="info"></i>站点信息</div><div class="card-body"><div style="margin-bottom:12px"><span style="color:var(--text2);font-size:12px">标题：</span><strong id="info-title">-</strong></div><div style="margin-bottom:12px"><span style="color:var(--text2);font-size:12px">描述：</span><span id="info-desc" style="font-size:13px">-</span></div><div style="margin-bottom:12px"><span style="color:var(--text2);font-size:12px">语言：</span><span id="info-lang" class="badge blue">-</span></div><div><span style="color:var(--text2);font-size:12px">基础路径：</span><code id="info-base">/</code></div></div></div>
</div>
<div class="card"><div class="card-header"><i data-lucide="code"></i>配置预览</div><div class="card-body"><pre id="cfg-json" class="code">加载中...</pre></div></div>
</div>

<div id="p-site" class="page">
<div class="page-header"><h1><i data-lucide="settings"></i>站点配置</h1><button class="btn btn-primary" onclick="save('站点')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="type"></i>基本信息</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">站点标题 *</label><input id="site-title" class="form-input" placeholder="我的文档"><div class="form-hint">显示在浏览器标签和导航栏</div></div>
<div class="form-group"><label class="form-label">站点描述</label><input id="site-desc" class="form-input" placeholder="一个使用 LDoc 构建的文档站点"><div class="form-hint">用于 SEO 和社交分享</div></div></div>
<div class="grid-3"><div class="form-group"><label class="form-label">语言</label><select id="site-lang" class="form-input"><option value="zh-CN">简体中文</option><option value="en-US">English</option><option value="ja">日本語</option></select></div>
<div class="form-group"><label class="form-label">基础路径</label><input id="site-base" class="form-input" placeholder="/"><div class="form-hint">部署到子路径时设置</div></div>
<div class="form-group"><label class="form-label">框架</label><select id="site-framework" class="form-input"><option value="vue">Vue 3</option><option value="react">React</option><option value="auto">自动检测</option></select></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="folder"></i>目录配置</div><div class="card-body">
<div class="grid-3"><div class="form-group"><label class="form-label">文档源目录</label><input id="site-srcDir" class="form-input" placeholder="docs"><div class="form-hint">Markdown 文件目录</div></div>
<div class="form-group"><label class="form-label">输出目录</label><input id="site-outDir" class="form-input" placeholder=".ldoc/dist"></div>
<div class="form-group"><label class="form-label">缓存目录</label><input id="site-cacheDir" class="form-input" placeholder=".ldoc/cache"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="globe"></i>Head 标签<div class="actions"><button class="btn btn-sm btn-secondary" onclick="addHead()"><i data-lucide="plus"></i>添加</button></div></div><div class="card-body"><div id="head-list"></div></div></div>
</div>

<div id="p-theme" class="page">
<div class="page-header"><h1><i data-lucide="palette"></i>主题配置</h1><button class="btn btn-primary" onclick="save('主题')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="image"></i>Logo 与标题</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">Logo 图片</label><input id="theme-logo" class="form-input" placeholder="/logo.svg"></div>
<div class="form-group"><label class="form-label">导航栏标题</label><input id="theme-siteTitle" class="form-input" placeholder="留空使用站点标题"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="share-2"></i>社交链接<div class="actions"><button class="btn btn-sm btn-secondary" onclick="addSocial()"><i data-lucide="plus"></i>添加</button></div></div><div class="card-body"><div id="social-list"></div></div></div>
<div class="card"><div class="card-header"><i data-lucide="panel-bottom"></i>页脚配置</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">页脚信息</label><input id="theme-footer-msg" class="form-input" placeholder="Released under the MIT License."></div>
<div class="form-group"><label class="form-label">版权信息</label><input id="theme-footer-copy" class="form-input" placeholder="Copyright © 2024"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="edit-3"></i>编辑链接</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">链接模板</label><input id="theme-editLink-pattern" class="form-input" placeholder="https://github.com/user/repo/edit/main/:path"><div class="form-hint">:path 会被替换为文件路径</div></div>
<div class="form-group"><label class="form-label">链接文字</label><input id="theme-editLink-text" class="form-input" placeholder="在 GitHub 上编辑此页"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="layout"></i>布局配置</div><div class="card-body">
<div class="grid-3"><div class="form-group"><label class="form-label">侧边栏宽度</label><input id="theme-sidebar-w" type="number" class="form-input" placeholder="260"></div>
<div class="form-group"><label class="form-label">大纲宽度</label><input id="theme-outline-w" type="number" class="form-input" placeholder="220"></div>
<div class="form-group"><label class="form-label">导航栏高度</label><input id="theme-nav-h" type="number" class="form-input" placeholder="64"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="search"></i>搜索配置</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">搜索提供者</label><select id="theme-search" class="form-input"><option value="local">本地搜索</option><option value="algolia">Algolia</option></select></div>
<div class="form-group"><label class="form-label">Algolia App ID</label><input id="theme-algolia-id" class="form-input" placeholder="仅 Algolia 需要"></div></div>
</div></div>
</div>

<div id="p-markdown" class="page">
<div class="page-header"><h1><i data-lucide="file-text"></i>Markdown 配置</h1><button class="btn btn-primary" onclick="save('Markdown')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="settings-2"></i>基础设置</div><div class="card-body">
<div class="grid-2"><label class="checkbox"><input type="checkbox" id="md-lineNumbers"> 显示代码行号</label>
<label class="checkbox"><input type="checkbox" id="md-preWrapper" checked> 代码块包装器</label></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="sun-moon"></i>代码高亮主题</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">亮色主题</label><select id="md-light" class="form-input"><option>github-light</option><option>vitesse-light</option><option>min-light</option></select></div>
<div class="form-group"><label class="form-label">暗色主题</label><select id="md-dark" class="form-input"><option>github-dark</option><option>vitesse-dark</option><option>dracula</option></select></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="alert-circle"></i>容器标签</div><div class="card-body">
<div class="grid-3"><div class="form-group"><label class="form-label">提示 (tip)</label><input id="md-tip" class="form-input" placeholder="提示"></div>
<div class="form-group"><label class="form-label">警告 (warning)</label><input id="md-warning" class="form-input" placeholder="警告"></div>
<div class="form-group"><label class="form-label">危险 (danger)</label><input id="md-danger" class="form-input" placeholder="危险"></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="link"></i>锚点配置</div><div class="card-body">
<div class="grid-3"><label class="checkbox"><input type="checkbox" id="md-anchor" checked> 显示永久链接</label>
<label class="checkbox"><input type="checkbox" id="md-anchor-before"> 链接在标题前</label>
<div class="form-group"><label class="form-label">链接符号</label><input id="md-anchor-sym" class="form-input" placeholder="#" style="width:60px"></div></div>
</div></div>
</div>

<div id="p-build" class="page">
<div class="page-header"><h1><i data-lucide="hammer"></i>构建配置</h1><button class="btn btn-primary" onclick="save('构建')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="folder-output"></i>输出配置</div><div class="card-body">
<div class="grid-3"><div class="form-group"><label class="form-label">输出目录</label><input id="build-outDir" class="form-input" placeholder=".ldoc/dist"></div>
<div class="form-group"><label class="form-label">资源目录</label><input id="build-assetsDir" class="form-input" placeholder="assets"></div>
<div class="form-group"><label class="form-label">Chunk警告</label><input id="build-chunk" type="number" class="form-input" placeholder="500"><div class="form-hint">KB</div></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="cpu"></i>编译选项</div><div class="card-body">
<div class="grid-2"><div class="form-group"><label class="form-label">代码压缩</label><select id="build-minify" class="form-input"><option value="esbuild">esbuild (推荐)</option><option value="terser">terser</option><option value="false">不压缩</option></select></div>
<div class="form-group"><label class="form-label">目标浏览器</label><input id="build-target" class="form-input" placeholder="es2020"></div></div>
<div class="grid-3" style="margin-top:12px"><label class="checkbox"><input type="checkbox" id="build-sourcemap"> Source Map</label>
<label class="checkbox"><input type="checkbox" id="build-ssr"> SSR 渲染</label>
<label class="checkbox"><input type="checkbox" id="build-mpa"> MPA 模式</label></div>
</div></div>
</div>

<div id="p-vite" class="page">
<div class="page-header"><h1><i data-lucide="zap"></i>Vite 配置</h1><button class="btn btn-primary" onclick="save('Vite')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="server"></i>开发服务器</div><div class="card-body">
<div class="grid-3"><div class="form-group"><label class="form-label">端口</label><input id="vite-port" type="number" class="form-input" placeholder="5173"></div>
<div class="form-group"><label class="form-label">主机</label><input id="vite-host" class="form-input" placeholder="localhost"></div>
<div class="form-group" style="padding-top:20px"><label class="checkbox"><input type="checkbox" id="vite-open"> 自动打开浏览器</label></div></div>
</div></div>
<div class="card"><div class="card-header"><i data-lucide="arrow-right-left"></i>路径别名<div class="actions"><button class="btn btn-sm btn-secondary" onclick="addAlias()"><i data-lucide="plus"></i>添加</button></div></div><div class="card-body"><div id="alias-list"></div></div></div>
<div class="card"><div class="card-header"><i data-lucide="hash"></i>全局常量<div class="actions"><button class="btn btn-sm btn-secondary" onclick="addDefine()"><i data-lucide="plus"></i>添加</button></div></div><div class="card-body"><div id="define-list"></div></div></div>
</div>

<div id="p-deploy" class="page">
<div class="page-header"><h1><i data-lucide="rocket"></i>部署配置</h1><button class="btn btn-primary" onclick="save('部署')"><i data-lucide="save"></i>保存</button></div>
<div class="card"><div class="card-header"><i data-lucide="cloud"></i>部署平台</div><div class="card-body">
<div class="form-group"><label class="form-label">选择平台</label><select id="deploy-platform" class="form-input" onchange="showDeploy()"><option value="">-- 请选择 --</option><option value="netlify">Netlify</option><option value="vercel">Vercel</option><option value="github-pages">GitHub Pages</option><option value="cloudflare">Cloudflare</option></select></div>
</div></div>
<div id="deploy-form"></div>
<div class="card"><div class="card-header"><i data-lucide="terminal"></i>快速操作</div><div class="card-body">
<div style="display:flex;gap:12px"><button class="btn btn-secondary" onclick="runBuild()"><i data-lucide="play"></i>构建项目</button>
<button class="btn btn-primary" onclick="runDeploy()"><i data-lucide="upload"></i>部署</button></div>
<pre id="deploy-log" class="code" style="margin-top:12px;min-height:80px;display:none"></pre>
</div></div>
</div>

<div id="p-nav" class="page">
<div class="page-header"><h1><i data-lucide="menu"></i>导航与侧边栏</h1><button class="btn btn-primary" onclick="addNav()"><i data-lucide="plus"></i>添加导航</button></div>
<div class="card" style="margin-bottom:16px"><div class="card-body" style="padding:12px 16px;display:flex;align-items:center;gap:8px"><i data-lucide="info" style="width:16px;height:16px;color:var(--text2)"></i><span style="font-size:13px;color:var(--text2)">每个导航项可配置从属的侧边栏，点击展开编辑</span></div></div>
<div id="nav-list"></div>
</div>

<div id="p-docs" class="page">
<div class="page-header"><h1><i data-lucide="files"></i>文档管理</h1><button class="btn btn-secondary" onclick="loadData()"><i data-lucide="refresh-cw"></i>刷新</button></div>
<div class="card"><div class="card-header"><i data-lucide="file-text"></i>所有文档 (<span id="docs-count">0</span>)</div>
<div class="card-body" style="padding:0"><table class="table"><thead><tr><th>标题</th><th>路径</th><th>更新时间</th></tr></thead><tbody id="docs-list"></tbody></table></div></div>
</div>

<div id="p-plugins" class="page">
<div class="page-header"><h1><i data-lucide="puzzle"></i>插件管理</h1></div>
<div class="card"><div class="card-header"><i data-lucide="check-circle"></i>已安装</div><div class="card-body"><div id="plugins-installed"></div></div></div>
<div class="card"><div class="card-header"><i data-lucide="download"></i>推荐插件</div><div class="card-body" style="padding:0"><table class="table"><thead><tr><th>插件</th><th>描述</th><th></th></tr></thead><tbody>
<tr><td><span class="badge blue">searchPlugin</span></td><td style="font-size:13px">本地全文搜索</td><td><button class="btn btn-sm btn-secondary">安装</button></td></tr>
<tr><td><span class="badge green">copyCodePlugin</span></td><td style="font-size:13px">代码复制按钮</td><td><button class="btn btn-sm btn-secondary">安装</button></td></tr>
<tr><td><span class="badge purple">progressPlugin</span></td><td style="font-size:13px">阅读进度条</td><td><button class="btn btn-sm btn-secondary">安装</button></td></tr>
<tr><td><span class="badge blue">imageViewerPlugin</span></td><td style="font-size:13px">图片预览</td><td><button class="btn btn-sm btn-secondary">安装</button></td></tr>
<tr><td><span class="badge green">readingTimePlugin</span></td><td style="font-size:13px">阅读时间</td><td><button class="btn btn-sm btn-secondary">安装</button></td></tr>
</tbody></table></div></div>
</div>
`
}

function getScript(): string {
  return `
var D={pages:[],nav:[],sidebar:{},site:{}};
var pIdx={dashboard:0,site:1,theme:2,markdown:3,build:4,vite:5,deploy:6,nav:7,docs:8,plugins:9};
function go(p){document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));document.querySelectorAll('.nav-item').forEach(e=>e.classList.remove('active'));document.getElementById('p-'+p).classList.add('active');document.querySelectorAll('.nav-item')[pIdx[p]].classList.add('active')}
function toast(m,t){var e=document.getElementById('toast');e.querySelector('span').textContent=m;e.className='toast show '+(t||'');setTimeout(()=>e.classList.remove('show'),3000)}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadData(){
fetch('/api/pages').then(r=>r.json()).then(d=>{D.pages=d.pages||[];document.getElementById('s-pages').textContent=D.pages.length;document.getElementById('docs-count').textContent=D.pages.length;renderDocs();renderRecent()}).catch(()=>{});
fetch('/api/nav').then(r=>r.json()).then(d=>{D.nav=d.nav||[];document.getElementById('s-nav').textContent=D.nav.length;renderNav()}).catch(()=>{});
fetch('/api/sidebar').then(r=>r.json()).then(d=>{D.sidebar=d.sidebar||{};var c=0;Object.values(D.sidebar).forEach(a=>{if(Array.isArray(a))a.forEach(g=>c+=(g.items?g.items.length:1))});document.getElementById('s-sidebar').textContent=c}).catch(()=>{});
fetch('/api/site').then(r=>r.json()).then(d=>{D.site=d;fillSite(d)}).catch(()=>{});
fetch('/api/plugins').then(r=>r.json()).then(d=>{document.getElementById('s-plugins').textContent=(d.plugins||[]).length;renderPlugins(d.plugins||[])}).catch(()=>{document.getElementById('s-plugins').textContent='0'});
}
function fillSite(d){document.getElementById('info-title').textContent=d.title||'-';document.getElementById('info-desc').textContent=d.description||'-';document.getElementById('info-lang').textContent=d.lang||'zh-CN';document.getElementById('info-base').textContent=d.base||'/';document.getElementById('cfg-json').textContent=JSON.stringify(d,null,2);document.getElementById('site-title').value=d.title||'';document.getElementById('site-desc').value=d.description||''}
function renderRecent(){var h='';D.pages.slice().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,5).forEach(p=>{h+='<tr><td>'+esc(p.title||'无标题')+'</td><td><code style="font-size:11px">'+esc(p.path)+'</code></td><td style="font-size:12px;color:var(--text2)">'+(p.updatedAt?new Date(p.updatedAt).toLocaleDateString():'—')+'</td></tr>'});document.getElementById('recent').innerHTML=h||'<tr><td colspan="3" style="text-align:center;color:var(--text2)">暂无</td></tr>'}
function renderDocs(){var h='';D.pages.forEach(p=>{h+='<tr><td><strong>'+esc(p.title||'无标题')+'</strong></td><td><code style="font-size:11px">'+esc(p.path)+'</code></td><td style="font-size:12px;color:var(--text2)">'+(p.updatedAt?new Date(p.updatedAt).toLocaleDateString():'—')+'</td></tr>'});document.getElementById('docs-list').innerHTML=h||'<tr><td colspan="3" style="text-align:center;color:var(--text2)">暂无</td></tr>'}
function renderNav(){var h='';D.nav.forEach((n,i)=>{var p=n.link||'/';var sb=D.sidebar[p]||[];h+='<div class="nav-cfg"><div class="nav-cfg-head" onclick="toggleNav('+i+')"><i data-lucide="grip-vertical" style="width:14px;height:14px;color:var(--text2)"></i><div class="inputs"><input value="'+esc(n.text)+'" placeholder="文本" onchange="updNav('+i+',\\'text\\',this.value)" onclick="event.stopPropagation()"><input value="'+esc(n.link)+'" placeholder="链接 如 /guide/" onchange="updNav('+i+',\\'link\\',this.value)" onclick="event.stopPropagation()"></div><button class="btn btn-icon btn-sm btn-secondary" onclick="event.stopPropagation();delNav('+i+')" title="删除"><i data-lucide="trash-2"></i></button></div><div class="nav-cfg-body" id="nb-'+i+'"><h4><i data-lucide="sidebar" style="width:14px;height:14px"></i>侧边栏 ('+esc(p)+')<button class="btn btn-sm btn-secondary" style="margin-left:auto" onclick="addSbG('+i+')"><i data-lucide="plus"></i>添加分组</button></h4><div id="sb-'+i+'">';sb.forEach((g,gi)=>{h+='<div class="sb-group"><div class="sb-group-head"><i data-lucide="grip-vertical" style="width:12px;height:12px;color:#9ca3af"></i><input value="'+esc(g.text)+'" onchange="updSbG(\\''+p+'\\','+gi+',this.value)"><button class="btn btn-sm btn-secondary" onclick="addSbI(\\''+p+'\\','+gi+')"><i data-lucide="plus"></i></button><button class="btn btn-sm btn-secondary" onclick="delSbG(\\''+p+'\\','+gi+')"><i data-lucide="trash-2"></i></button></div>';(g.items||[]).forEach((it,ii)=>{h+='<div class="sb-item"><i data-lucide="grip-vertical" style="width:10px;height:10px;color:#9ca3af"></i><input value="'+esc(it.text)+'" placeholder="标题" onchange="updSbI(\\''+p+'\\','+gi+','+ii+',\\'text\\',this.value)"><input value="'+esc(it.link)+'" placeholder="链接" onchange="updSbI(\\''+p+'\\','+gi+','+ii+',\\'link\\',this.value)"><button class="btn btn-icon btn-sm btn-secondary" onclick="delSbI(\\''+p+'\\','+gi+','+ii+')"><i data-lucide="x"></i></button></div>'});h+='</div>'});if(!sb.length)h+='<div style="color:var(--text2);font-size:12px">暂无侧边栏</div>';h+='</div></div></div>'});document.getElementById('nav-list').innerHTML=h||'<div class="empty"><i data-lucide="navigation" style="width:40px;height:40px"></i><p>暂无导航项</p></div>';lucide.createIcons()}
function toggleNav(i){document.getElementById('nb-'+i).classList.toggle('open')}
function addNav(){D.nav.push({text:'新导航',link:'/new/'});D.sidebar['/new/']=[];renderNav();toast('已添加')}
function updNav(i,k,v){var old=D.nav[i].link;D.nav[i][k]=v;if(k==='link'){D.sidebar[v]=D.sidebar[old]||[];delete D.sidebar[old]}renderNav()}
function delNav(i){var p=D.nav[i].link;delete D.sidebar[p];D.nav.splice(i,1);renderNav();toast('已删除')}
function addSbG(i){var p=D.nav[i]?.link||'/';if(!D.sidebar[p])D.sidebar[p]=[];D.sidebar[p].push({text:'新分组',items:[]});renderNav()}
function addSbI(p,gi){if(!D.sidebar[p][gi].items)D.sidebar[p][gi].items=[];D.sidebar[p][gi].items.push({text:'',link:''});renderNav()}
function updSbG(p,gi,v){if(D.sidebar[p]?.[gi])D.sidebar[p][gi].text=v}
function updSbI(p,gi,ii,k,v){if(D.sidebar[p]?.[gi]?.items?.[ii])D.sidebar[p][gi].items[ii][k]=v}
function delSbG(p,gi){D.sidebar[p]?.splice(gi,1);renderNav()}
function delSbI(p,gi,ii){D.sidebar[p]?.[gi]?.items?.splice(ii,1);renderNav()}
function renderPlugins(list){var h='';list.forEach(p=>{h+='<div class="list-item"><span class="badge blue">'+esc(p.name)+'</span></div>'});document.getElementById('plugins-installed').innerHTML=h||'<div class="empty"><i data-lucide="puzzle" style="width:32px;height:32px"></i><p>暂无</p></div>';lucide.createIcons()}
function addHead(){var e=document.getElementById('head-list');e.innerHTML+='<div class="list-item"><select class="form-input" style="width:80px"><option>meta</option><option>link</option><option>script</option></select><input class="form-input" placeholder="name/rel"><input class="form-input" placeholder="content/href"><button class="btn btn-icon btn-sm btn-secondary" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button></div>';lucide.createIcons()}
function addSocial(){var e=document.getElementById('social-list');e.innerHTML+='<div class="list-item"><select class="form-input" style="width:100px"><option>github</option><option>twitter</option><option>discord</option><option>youtube</option></select><input class="form-input" placeholder="链接"><button class="btn btn-icon btn-sm btn-secondary" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button></div>';lucide.createIcons()}
function addAlias(){var e=document.getElementById('alias-list');e.innerHTML+='<div class="list-item"><input class="form-input" placeholder="别名 @"><input class="form-input" placeholder="路径 ./src"><button class="btn btn-icon btn-sm btn-secondary" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button></div>';lucide.createIcons()}
function addDefine(){var e=document.getElementById('define-list');e.innerHTML+='<div class="list-item"><input class="form-input" placeholder="常量名"><input class="form-input" placeholder="值"><button class="btn btn-icon btn-sm btn-secondary" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button></div>';lucide.createIcons()}
function showDeploy(){var p=document.getElementById('deploy-platform').value,h='';if(p==='netlify')h='<div class="card"><div class="card-header"><i data-lucide="globe"></i>Netlify</div><div class="card-body"><div class="grid-2"><div class="form-group"><label class="form-label">站点 ID</label><input class="form-input" placeholder="可选"></div><div class="form-group"><label class="form-label">API Token</label><input type="password" class="form-input"></div></div><label class="checkbox" style="margin-top:8px"><input type="checkbox" checked> 部署到生产环境</label></div></div>';else if(p==='vercel')h='<div class="card"><div class="card-header"><i data-lucide="triangle"></i>Vercel</div><div class="card-body"><div class="grid-2"><div class="form-group"><label class="form-label">项目名称</label><input class="form-input"></div><div class="form-group"><label class="form-label">组织 ID</label><input class="form-input"></div></div></div></div>';else if(p==='github-pages')h='<div class="card"><div class="card-header"><i data-lucide="github"></i>GitHub Pages</div><div class="card-body"><div class="grid-2"><div class="form-group"><label class="form-label">仓库</label><input class="form-input" placeholder="user/repo"></div><div class="form-group"><label class="form-label">分支</label><input class="form-input" placeholder="gh-pages"></div></div><div class="form-group"><label class="form-label">自定义域名</label><input class="form-input" placeholder="docs.example.com"></div></div></div>';else if(p==='cloudflare')h='<div class="card"><div class="card-header"><i data-lucide="cloud"></i>Cloudflare</div><div class="card-body"><div class="grid-2"><div class="form-group"><label class="form-label">项目名称</label><input class="form-input"></div><div class="form-group"><label class="form-label">账户 ID</label><input class="form-input"></div></div></div></div>';document.getElementById('deploy-form').innerHTML=h;lucide.createIcons()}
function runBuild(){var l=document.getElementById('deploy-log');l.style.display='block';l.textContent='正在构建...\\n';toast('开始构建')}
function runDeploy(){var l=document.getElementById('deploy-log');l.style.display='block';l.textContent+='\\n正在部署...\\n';toast('开始部署')}
function save(n){toast(n+'配置已保存','success')}
window.onload=function(){loadData();lucide.createIcons()}
`
}
