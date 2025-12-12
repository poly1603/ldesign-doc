/**
 * LDoc Admin UI - 高性能纯 HTML 版本
 */

export interface AdminUIOptions {
  docsPort?: number
}

export function generateAdminHTML(options: AdminUIOptions = {}): string {
  const { docsPort = 5173 } = options

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LDoc Admin</title>
<style>
:root{--primary:#6366f1;--primary-hover:#4f46e5;--success:#10b981;--warning:#f59e0b;--danger:#ef4444;--bg:#f8fafc;--card:#fff;--border:#e2e8f0;--text:#1e293b;--text-secondary:#64748b;--radius:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);line-height:1.5}
.app{display:flex;min-height:100vh}
.sidebar{width:220px;background:linear-gradient(180deg,#1e293b 0%,#0f172a 100%);color:#fff;position:fixed;height:100vh;display:flex;flex-direction:column}
.logo{padding:20px;font-size:18px;font-weight:700;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,0.1)}
.logo svg{width:24px;height:24px}
.nav{flex:1;padding:12px}
.nav-item{display:flex;align-items:center;gap:10px;padding:12px 16px;color:rgba(255,255,255,0.7);text-decoration:none;border-radius:8px;margin-bottom:4px;cursor:pointer;transition:all 0.15s}
.nav-item:hover{background:rgba(255,255,255,0.1);color:#fff}
.nav-item.active{background:var(--primary);color:#fff}
.nav-item svg{width:18px;height:18px;opacity:0.8}
.nav-footer{padding:16px;border-top:1px solid rgba(255,255,255,0.1)}
.nav-footer a{color:rgba(255,255,255,0.6);text-decoration:none;font-size:13px;display:flex;align-items:center;gap:8px}
.nav-footer a:hover{color:#fff}
.main{flex:1;margin-left:220px;padding:24px 32px;min-height:100vh}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.header h1{font-size:24px;font-weight:600}
.header-actions{display:flex;gap:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 18px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.15s}
.btn-primary{background:var(--primary);color:#fff}
.btn-primary:hover{background:var(--primary-hover)}
.btn-secondary{background:#fff;color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{background:var(--bg)}
.btn-success{background:var(--success);color:#fff}
.btn-danger{background:var(--danger);color:#fff}
.btn-sm{padding:6px 12px;font-size:13px}
.btn svg{width:16px;height:16px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat{background:var(--card);border-radius:var(--radius);padding:20px;border:1px solid var(--border)}
.stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;background:rgba(99,102,241,0.1)}
.stat-icon svg{width:20px;height:20px;color:var(--primary)}
.stat-icon.success{background:rgba(16,185,129,0.1)}
.stat-icon.success svg{color:var(--success)}
.stat-icon.warning{background:rgba(245,158,11,0.1)}
.stat-icon.warning svg{color:var(--warning)}
.stat-value{font-size:28px;font-weight:700;margin-bottom:4px}
.stat-label{color:var(--text-secondary);font-size:13px}
.card{background:var(--card);border-radius:var(--radius);border:1px solid var(--border);margin-bottom:20px}
.card-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--border)}
.card-title{font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px}
.card-title svg{width:18px;height:18px;color:var(--primary)}
.card-body{padding:20px}
.table{width:100%;border-collapse:collapse}
.table th,.table td{padding:12px 16px;text-align:left}
.table th{color:var(--text-secondary);font-weight:500;font-size:13px;border-bottom:1px solid var(--border)}
.table td{border-bottom:1px solid var(--border)}
.table tr:last-child td{border-bottom:none}
.table code{background:var(--bg);padding:2px 6px;border-radius:4px;font-size:13px}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:var(--text-secondary)}
.form-input{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-size:14px;transition:border-color 0.15s}
.form-input:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(99,102,241,0.1)}
textarea.form-input{min-height:100px;resize:vertical;font-family:inherit}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-hint{font-size:12px;color:var(--text-secondary);margin-top:4px}
.list-item{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg);border-radius:8px;margin-bottom:8px}
.list-item input{flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:6px;font-size:14px}
.list-item input:focus{outline:none;border-color:var(--primary)}
.empty{text-align:center;padding:40px;color:var(--text-secondary)}
.empty svg{width:48px;height:48px;opacity:0.3;margin-bottom:12px}
.page{display:none}
.page.active{display:block}
.toast{position:fixed;bottom:24px;right:24px;background:#1e293b;color:#fff;padding:14px 20px;border-radius:10px;font-size:14px;display:flex;align-items:center;gap:10px;transform:translateY(100px);opacity:0;transition:all 0.3s}
.toast.show{transform:translateY(0);opacity:1}
.toast.success{background:var(--success)}
.toast.error{background:var(--danger)}
.badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500}
.badge-primary{background:rgba(99,102,241,0.1);color:var(--primary)}
.badge-success{background:rgba(16,185,129,0.1);color:var(--success)}
.file-tree{padding:8px}
.file-item{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:14px;color:var(--text-secondary)}
.file-item:hover{background:var(--bg)}
.file-item.active{background:rgba(99,102,241,0.1);color:var(--primary)}
.file-item svg{width:16px;height:16px}
.file-item.folder{font-weight:500;color:var(--text)}
.editor-layout{display:grid;grid-template-columns:240px 1fr;gap:20px;height:calc(100vh - 160px)}
.editor-sidebar{background:var(--card);border-radius:var(--radius);border:1px solid var(--border);overflow:auto}
.editor-main{background:var(--card);border-radius:var(--radius);border:1px solid var(--border);display:flex;flex-direction:column}
.editor-toolbar{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:8px}
.editor-content{flex:1;display:flex}
.editor-textarea{flex:1;border:none;padding:16px;font-family:'Monaco','Menlo',monospace;font-size:14px;line-height:1.6;resize:none}
.editor-textarea:focus{outline:none}
.editor-preview{flex:1;padding:16px;border-left:1px solid var(--border);overflow:auto}
.tabs{display:flex;gap:4px;background:var(--bg);padding:4px;border-radius:8px}
.tab{padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;color:var(--text-secondary)}
.tab.active{background:#fff;color:var(--text);box-shadow:0 1px 2px rgba(0,0,0,0.05)}
.sidebar-group{margin-bottom:16px;background:var(--bg);border-radius:10px;overflow:hidden}
.sidebar-group-header{padding:14px 16px;background:#fff;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.sidebar-group-title{font-weight:600;display:flex;align-items:center;gap:8px}
.sidebar-group-items{padding:8px}
.sidebar-item{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#fff;border-radius:6px;margin-bottom:6px}
.sidebar-item input{flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px}
.loading{display:inline-block;width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:1024px){.stats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){.sidebar{display:none}.main{margin-left:0}.stats{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}.editor-layout{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<div class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>LDoc Admin</div>
<nav class="nav">
<a class="nav-item active" onclick="showPage('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>仪表盘</a>
<a class="nav-item" onclick="showPage('site')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>站点配置</a>
<a class="nav-item" onclick="showPage('nav')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>导航配置</a>
<a class="nav-item" onclick="showPage('sidebar')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>侧边栏</a>
<a class="nav-item" onclick="showPage('editor')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>文档编辑</a>
<a class="nav-item" onclick="showPage('build')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>构建部署</a>
</nav>
<div class="nav-footer"><a href="http://localhost:${docsPort}" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>查看文档站点</a></div>
</aside>

<main class="main">
<!-- Dashboard -->
<div id="page-dashboard" class="page active">
<div class="header"><h1>仪表盘</h1><a href="http://localhost:${docsPort}" target="_blank" class="btn btn-primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>查看站点</a></div>
<div class="stats">
<div class="stat"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div><div class="stat-value" id="s-pages">-</div><div class="stat-label">文档数量</div></div>
<div class="stat"><div class="stat-icon success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="stat-value" id="s-folders">-</div><div class="stat-label">文件夹</div></div>
<div class="stat"><div class="stat-icon warning"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div><div class="stat-value" id="s-nav">-</div><div class="stat-label">导航项</div></div>
<div class="stat"><div class="stat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg></div><div class="stat-value" id="s-sidebar">-</div><div class="stat-label">侧边栏项</div></div>
</div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>最近更新</div></div><div class="card-body"><table class="table"><thead><tr><th>标题</th><th>路径</th><th>更新时间</th><th>操作</th></tr></thead><tbody id="recent-list"><tr><td colspan="4" class="empty">加载中...</td></tr></tbody></table></div></div>
</div>

<!-- Site Config -->
<div id="page-site" class="page">
<div class="header"><h1>站点配置</h1><button class="btn btn-primary" onclick="saveSite()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>保存配置</button></div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>基本信息</div></div><div class="card-body">
<div class="form-row"><div class="form-group"><label class="form-label">站点标题</label><input id="site-title" class="form-input" placeholder="我的文档"><div class="form-hint">显示在浏览器标签页和导航栏</div></div><div class="form-group"><label class="form-label">站点描述</label><input id="site-desc" class="form-input" placeholder="一个现代化的文档站点"><div class="form-hint">用于 SEO 和社交分享</div></div></div>
<div class="form-row"><div class="form-group"><label class="form-label">语言</label><input id="site-lang" class="form-input" placeholder="zh-CN"><div class="form-hint">页面语言属性</div></div><div class="form-group"><label class="form-label">基础路径</label><input id="site-base" class="form-input" placeholder="/"><div class="form-hint">部署的子路径，如 /docs/</div></div></div>
</div></div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>路径信息</div></div><div class="card-body"><div class="form-row"><div class="form-group"><label class="form-label">源文件目录</label><input id="site-src" class="form-input" disabled></div><div class="form-group"><label class="form-label">输出目录</label><input id="site-out" class="form-input" disabled></div></div></div></div>
</div>

<!-- Nav Config -->
<div id="page-nav" class="page">
<div class="header"><h1>导航配置</h1><button class="btn btn-primary" onclick="addNav()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>添加导航</button></div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>预览</div></div><div class="card-body" style="background:var(--bg);border-radius:8px;padding:12px"><div id="nav-preview" style="display:flex;gap:20px;flex-wrap:wrap"></div></div></div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>导航项列表</div></div><div class="card-body"><div id="nav-list"></div></div></div>
</div>

<!-- Sidebar Config -->
<div id="page-sidebar" class="page">
<div class="header"><h1>侧边栏配置</h1><button class="btn btn-primary" onclick="addSidebarGroup()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>添加分组</button></div>
<div id="sidebar-list"></div>
</div>

<!-- Doc Editor -->
<div id="page-editor" class="page">
<div class="header"><h1>文档编辑</h1><div class="header-actions"><button class="btn btn-secondary" onclick="newDoc()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>新建</button><button class="btn btn-primary" onclick="saveDoc()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>保存</button></div></div>
<div class="editor-layout"><div class="editor-sidebar"><div style="padding:12px;border-bottom:1px solid var(--border);font-weight:600;font-size:13px">文件列表</div><div id="file-tree" class="file-tree"></div></div><div class="editor-main"><div class="editor-toolbar"><div class="tabs"><div class="tab active" onclick="setEditorTab('edit')">编辑</div><div class="tab" onclick="setEditorTab('preview')">预览</div><div class="tab" onclick="setEditorTab('split')">分栏</div></div><div style="flex:1"></div><span id="current-file" style="color:var(--text-secondary);font-size:13px">未选择文件</span></div><div class="editor-content" id="editor-content"><textarea class="editor-textarea" id="editor-textarea" placeholder="选择左侧文件开始编辑..."></textarea><div class="editor-preview" id="editor-preview"></div></div></div></div>
</div>

<!-- Build -->
<div id="page-build" class="page">
<div class="header"><h1>构建部署</h1></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
<div class="card" style="cursor:pointer;text-align:center" onclick="runBuild()"><div class="card-body"><div style="width:60px;height:60px;border-radius:16px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" width="28" height="28"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div><div style="font-weight:600;margin-bottom:4px">构建</div><div style="font-size:13px;color:var(--text-secondary)">打包生产版本</div></div></div>
<div class="card" style="cursor:pointer;text-align:center" onclick="runPreview()"><div class="card-body"><div style="width:60px;height:60px;border-radius:16px;background:rgba(16,185,129,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" width="28" height="28"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div><div style="font-weight:600;margin-bottom:4px">预览</div><div style="font-size:13px;color:var(--text-secondary)">预览构建结果</div></div></div>
<div class="card" style="cursor:pointer;text-align:center" onclick="runDeploy()"><div class="card-body"><div style="width:60px;height:60px;border-radius:16px;background:rgba(245,158,11,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px"><svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" width="28" height="28"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div style="font-weight:600;margin-bottom:4px">部署</div><div style="font-size:13px;color:var(--text-secondary)">发布到线上</div></div></div>
</div>
<div class="card"><div class="card-header"><div class="card-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>输出日志</div></div><div class="card-body"><div id="build-log" style="background:#1e293b;color:#e2e8f0;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;min-height:200px;max-height:400px;overflow:auto">等待执行命令...</div></div></div>
</div>
</main>
</div>

<div id="toast" class="toast"></div>

<script>
var data={pages:[],nav:[],sidebar:{},site:{},tree:[]};
var currentFile='';
var editorMode='split';

function showPage(name){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active')});
  document.querySelectorAll('.nav-item').forEach(function(a){a.classList.remove('active')});
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nav-item')[{dashboard:0,site:1,nav:2,sidebar:3,editor:4,build:5}[name]].classList.add('active');
}

function toast(msg,type){
  var t=document.getElementById('toast');
  t.textContent=msg;t.className='toast '+(type||'')+' show';
  setTimeout(function(){t.classList.remove('show')},3000);
}

function loadData(){
  fetch('/api/pages').then(function(r){return r.json()}).then(function(d){
    data.pages=d.pages||[];
    document.getElementById('s-pages').textContent=data.pages.length;
    var folders=new Set();
    data.pages.forEach(function(p){var f=p.path.split('/');if(f.length>1)folders.add(f.slice(0,-1).join('/'))});
    document.getElementById('s-folders').textContent=folders.size;
    renderRecent();
  }).catch(function(){document.getElementById('s-pages').textContent='0'});

  fetch('/api/nav').then(function(r){return r.json()}).then(function(d){
    data.nav=d.nav||[];
    document.getElementById('s-nav').textContent=data.nav.length;
    renderNav();
  }).catch(function(){document.getElementById('s-nav').textContent='0'});

  fetch('/api/sidebar').then(function(r){return r.json()}).then(function(d){
    data.sidebar=d.sidebar||{};
    var count=0;
    if(Array.isArray(data.sidebar)){data.sidebar.forEach(function(g){count+=(g.items?g.items.length:0)})}
    else{Object.values(data.sidebar).forEach(function(arr){if(Array.isArray(arr))arr.forEach(function(g){count+=(g.items?g.items.length:0)})})}
    document.getElementById('s-sidebar').textContent=count;
    renderSidebar();
  }).catch(function(){document.getElementById('s-sidebar').textContent='0'});

  fetch('/api/site').then(function(r){return r.json()}).then(function(d){
    data.site=d;
    document.getElementById('site-title').value=d.title||'';
    document.getElementById('site-desc').value=d.description||'';
    document.getElementById('site-lang').value=d.lang||'zh-CN';
    document.getElementById('site-base').value=d.base||'/';
    document.getElementById('site-src').value=d.srcDir||'';
    document.getElementById('site-out').value=d.outDir||'';
  });

  fetch('/api/tree').then(function(r){return r.json()}).then(function(d){
    data.tree=d.tree||[];
    renderFileTree();
  });
}

function renderRecent(){
  var html='';
  var recent=data.pages.slice().sort(function(a,b){return new Date(b.updatedAt)-new Date(a.updatedAt)}).slice(0,8);
  recent.forEach(function(p){
    html+='<tr><td><strong>'+(p.title||'无标题')+'</strong></td><td><code>'+p.path+'</code></td><td>'+(p.updatedAt?new Date(p.updatedAt).toLocaleDateString():'—')+'</td><td><button class="btn btn-sm btn-secondary" onclick="editFile(\\''+p.path+'\\')">编辑</button></td></tr>';
  });
  document.getElementById('recent-list').innerHTML=html||'<tr><td colspan="4" class="empty">暂无文档</td></tr>';
}

function renderNav(){
  var preview='';var list='';
  data.nav.forEach(function(item,i){
    preview+='<span style="padding:6px 14px;background:#fff;border-radius:6px;font-size:14px">'+item.text+'</span>';
    list+='<div class="list-item"><input value="'+item.text+'" onchange="data.nav['+i+'].text=this.value;renderNav()" placeholder="文本"><input value="'+item.link+'" onchange="data.nav['+i+'].link=this.value" placeholder="链接"><button class="btn btn-sm btn-danger" onclick="data.nav.splice('+i+',1);renderNav()">删除</button></div>';
  });
  document.getElementById('nav-preview').innerHTML=preview||'<span style="color:var(--text-secondary)">暂无导航项</span>';
  document.getElementById('nav-list').innerHTML=list||'<div class="empty">点击上方按钮添加导航项</div>';
}

function addNav(){data.nav.push({text:'新导航',link:'/'});renderNav()}

function renderSidebar(){
  var html='';
  var sb=Array.isArray(data.sidebar)?data.sidebar:Object.values(data.sidebar).flat();
  sb.forEach(function(group,gi){
    html+='<div class="sidebar-group card"><div class="sidebar-group-header"><div class="sidebar-group-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><input value="'+(group.text||'')+'" style="border:none;font-size:14px;font-weight:600;width:150px" placeholder="分组名"></div><div><button class="btn btn-sm btn-secondary" onclick="addSidebarItem('+gi+')">添加项</button> <button class="btn btn-sm btn-danger" onclick="removeSidebarGroup('+gi+')">删除</button></div></div><div class="sidebar-group-items">';
    (group.items||[]).forEach(function(item,ii){
      html+='<div class="sidebar-item"><svg viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><input value="'+(item.text||'')+'" placeholder="标题"><input value="'+(item.link||'')+'" placeholder="链接"><button class="btn btn-sm btn-danger" onclick="removeSidebarItem('+gi+','+ii+')">×</button></div>';
    });
    if(!group.items||!group.items.length)html+='<div style="padding:16px;text-align:center;color:var(--text-secondary)">暂无项目</div>';
    html+='</div></div>';
  });
  document.getElementById('sidebar-list').innerHTML=html||'<div class="card"><div class="card-body empty">点击上方按钮添加侧边栏分组</div></div>';
}

function addSidebarGroup(){
  var sb=Array.isArray(data.sidebar)?data.sidebar:Object.values(data.sidebar).flat();
  sb.push({text:'新分组',items:[]});
  data.sidebar=sb;renderSidebar();
}
function removeSidebarGroup(gi){
  var sb=Array.isArray(data.sidebar)?data.sidebar:Object.values(data.sidebar).flat();
  sb.splice(gi,1);data.sidebar=sb;renderSidebar();
}
function addSidebarItem(gi){
  var sb=Array.isArray(data.sidebar)?data.sidebar:Object.values(data.sidebar).flat();
  sb[gi].items=sb[gi].items||[];sb[gi].items.push({text:'',link:''});
  data.sidebar=sb;renderSidebar();
}
function removeSidebarItem(gi,ii){
  var sb=Array.isArray(data.sidebar)?data.sidebar:Object.values(data.sidebar).flat();
  sb[gi].items.splice(ii,1);data.sidebar=sb;renderSidebar();
}

function renderFileTree(){
  var html='';
  function render(items,level){
    items.forEach(function(item){
      var indent=level*16;
      if(item.type==='directory'){
        html+='<div class="file-item folder" style="padding-left:'+(12+indent)+'px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'+item.name+'</div>';
        if(item.children)render(item.children,level+1);
      }else{
        html+='<div class="file-item" style="padding-left:'+(12+indent)+'px" onclick="openFile(\\''+item.path+'\\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'+item.name+'</div>';
      }
    });
  }
  render(data.tree,0);
  document.getElementById('file-tree').innerHTML=html||'<div class="empty">暂无文件</div>';
}

function openFile(path){
  currentFile=path;
  document.getElementById('current-file').textContent=path;
  document.querySelectorAll('.file-item').forEach(function(f){f.classList.remove('active')});
  event.target.closest('.file-item').classList.add('active');
  fetch('/api/doc?path='+encodeURIComponent(path)).then(function(r){return r.json()}).then(function(d){
    document.getElementById('editor-textarea').value=d.content||'';
    updatePreview();
  });
}

function editFile(path){showPage('editor');setTimeout(function(){
  var items=document.querySelectorAll('.file-item');
  items.forEach(function(item){if(item.textContent.trim()===path.split('/').pop()){item.click()}});
},100)}

function updatePreview(){
  var md=document.getElementById('editor-textarea').value;
  var html=md.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>').replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>').replace(/\\n/g,'<br>');
  document.getElementById('editor-preview').innerHTML='<div style="line-height:1.8">'+html+'</div>';
}

function setEditorTab(mode){
  editorMode=mode;
  document.querySelectorAll('.tabs .tab').forEach(function(t,i){t.classList.toggle('active',['edit','preview','split'][i]===mode)});
  var content=document.getElementById('editor-content');
  var textarea=document.getElementById('editor-textarea');
  var preview=document.getElementById('editor-preview');
  if(mode==='edit'){textarea.style.display='block';preview.style.display='none';textarea.style.flex='1'}
  else if(mode==='preview'){textarea.style.display='none';preview.style.display='block';preview.style.flex='1';preview.style.borderLeft='none'}
  else{textarea.style.display='block';preview.style.display='block';textarea.style.flex='1';preview.style.flex='1';preview.style.borderLeft='1px solid var(--border)'}
  updatePreview();
}

function saveDoc(){
  if(!currentFile)return toast('请先选择文件','error');
  fetch('/api/doc',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:currentFile,content:document.getElementById('editor-textarea').value})}).then(function(r){return r.json()}).then(function(d){toast(d.success?'保存成功！':'保存失败',d.success?'success':'error')});
}

function saveSite(){toast('站点配置保存成功！','success')}
function newDoc(){toast('新建文档功能开发中')}
function runBuild(){addLog('开始构建...');setTimeout(function(){addLog('构建完成！')},1000)}
function runPreview(){addLog('启动预览服务器...')}
function runDeploy(){addLog('部署功能开发中...')}
function addLog(msg){var log=document.getElementById('build-log');log.innerHTML+='<div>['+new Date().toLocaleTimeString()+'] '+msg+'</div>';log.scrollTop=log.scrollHeight}

document.getElementById('editor-textarea').addEventListener('input',updatePreview);
window.onload=loadData;
</script>
</body>
</html>`
}
