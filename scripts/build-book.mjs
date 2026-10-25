import { readFile, writeFile, readdir, mkdir, cp, rm, mkdtemp, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import katex from 'katex';
import {spawnSync} from 'node:child_process';
import {validateLearningPaths,lifecycleCards,chapterContext,roadmapBody,roadmapMarkdown} from '../src/learning-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = path.join(root, 'content');
const release = path.join(root, 'dist');
let out;
const title = 'Silicon to Systems：晶片設計、製造與系統';
const sections = [
  [1, 7, '數理與電路基礎', '把物理現象轉成可計算的模型'],
  [8, 13, '材料與半導體元件', '從能帶走到電晶體的工作條件'],
  [14, 21, '製程與積體化', '理解材料、結構與電路的製造約束'],
  [22, 25, '品質與製造工程', '以量測與統計建立可驗證的證據'],
  [26, 35, '電路與電子系統', '將元件組成類比、數位與混合訊號系統'],
  [36, 40, '實驗與整合專題', '用設計、量測與審查檢驗理解'],
  [41, 46, '微奈米與生醫感測', '連接力學、傳輸、界面與電子讀出'],
  [90, 99, '查詢與延伸閱讀', '符號、術語與可追溯的學術資料'],
];
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const plain = (s) => s.replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*#$`]/g, '').replace(/\s+/g, ' ').trim();
const json = (v) => JSON.stringify(v).replaceAll('<', '\\u003c');
function figureURL(href, full = false) {
  if (!/^\.\.\/assets\/figures\/[a-z0-9][a-z0-9._-]*\.(svg|png)$/i.test(href)) throw new Error(`Unsupported textbook figure URL: ${href}`);
  return full ? href.slice(3) : href;
}
const figureSizes = new Map();
for (const name of await readdir(path.join(root,'assets','figures'))) {
  if (!/\.(svg|png)$/i.test(name)) continue;
  const data = await readFile(path.join(root,'assets','figures',name));
  let width, height;
  if (name.endsWith('.png')) {
    if (data.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`Invalid PNG: ${name}`);
    width=data.readUInt32BE(16); height=data.readUInt32BE(20);
  } else {
    const box=data.toString().match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if (!box) throw new Error(`Figure requires zero-origin viewBox: ${name}`);
    width=Number(box[1]); height=Number(box[2]);
  }
  if (!(width>0 && height>0)) throw new Error(`Invalid figure dimensions: ${name}`);
  figureSizes.set(name,{width,height});
}
const names = (await readdir(content)).filter(n => /^\d{2}-[a-z0-9-]+\.md$/.test(n)).sort();
const docs = await Promise.all(names.map(async file => {
  const md = await readFile(path.join(content, file), 'utf8');
  const num = Number(file.slice(0, 2));
  const fullTitle = md.match(/^# (.+)$/m)?.[1];
  if (!fullTitle) throw new Error(`Missing title: ${file}`);
  const name = fullTitle.replace(/^第\s*\d+\s*章[\s　]*/, '');
  const group = sections.find(([a,b]) => num >= a && num <= b);
  if (!group) throw new Error(`No group: ${file}`);
  return { file, id: file.replace('.md',''), num, name, fullTitle, md, group: group[2], text: plain(md), count: (md.match(/\p{Script=Han}/gu) || []).length };
}));
const chapters = docs.filter(d => d.num < 90);
if (!process.argv.includes('--draft') && (chapters.length !== 46 || chapters.some((d,i) => d.num !== i+1))) throw new Error(`Expected consecutive chapters 01–46, got ${chapters.length}`);
validateLearningPaths(docs);
let equationCount = 0;
function render(doc, full = false) {
  const prefix = full ? `${doc.id}--` : '';
  const headings = [];
  const counts = new Map();
  const md = new Marked({ gfm: true });
  const formula = (text, displayMode) => {
    equationCount++;
    try { return katex.renderToString(text, {displayMode, throwOnError: true, trust: false, strict: 'ignore', output: 'htmlAndMathml'}); }
    catch(e) { throw new Error(`${doc.file}: ${text}\n${e.message}`); }
  };
  md.use({ extensions: [
    { name:'blockMath', level:'block', start:s=>s.indexOf('$$'), tokenizer(s){ const m=/^\$\$\s*\n([\s\S]*?)\n\$\$(?:\n|$)/.exec(s); if(m)return {type:'blockMath',raw:m[0],text:m[1]}; }, renderer:t=>`<div class="equation">${formula(t.text,true)}</div>\n` },
    { name:'inlineMath', level:'inline', start:s=>s.indexOf('$'), tokenizer(s){ const m=/^\$([^$\n]+?)\$(?!\$)/.exec(s); if(m)return {type:'inlineMath',raw:m[0],text:m[1]}; }, renderer:t=>formula(t.text,false) },
  ], renderer: {
    image({href,title,text}) {
      const alt=String(text).replace(/<[^>]*>/g,'').trim();
      if (!alt) throw new Error(`${doc.file}: figure requires descriptive alt text`);
      const url=figureURL(href,full);
      const size=figureSizes.get(path.basename(href));
      if (!size) throw new Error(`${doc.file}: missing figure ${href}`);
      return `<a class="figure-link" href="${esc(url)}"><img class="book-figure" src="${esc(url)}" alt="${esc(alt)}" width="${size.width}" height="${size.height}"${title?` title="${esc(title)}"`:''} loading="lazy" decoding="async"><span class="figure-hint">開啟原尺寸圖 ↗</span></a>`;
    },
    heading({tokens,depth}) {
      const text = this.parser.parseInline(tokens);
      const slug = plain(text).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
      const n = counts.get(slug)||0; counts.set(slug,n+1);
      const id = prefix+slug+(n?`-${n}`:'');
      if (depth === 2) headings.push({id,text:plain(text)});
      return `<h${depth} id="${esc(id)}">${text}</h${depth}>\n`;
    },
    link({href,title,tokens}) {
      let url = href;
      const [linkPath, linkHash] = href.split('#');
      if (linkPath.endsWith('.md')) {
        const target = docs.find(d => d.file === path.basename(linkPath));
        if (target) url = full ? `#${target.id}${linkHash ? '--'+linkHash : ''}` : `${target.id}.html${linkHash ? '#'+linkHash : ''}`;
      } else if (full && href.startsWith('#')) url = '#'+prefix+href.slice(1);
      if (/^javascript:/i.test(url)) throw new Error('Unsafe link');
      return `<a href="${esc(url)}"${title?` title="${esc(title)}"`:''}${/^https?:/.test(url)?' target="_blank" rel="noopener noreferrer"':''}>${this.parser.parseInline(tokens)}</a>`;
    },
    table(token){
      const head = token.header.map((c)=>`<th scope="col">${this.parser.parseInline(c.tokens)}</th>`).join('');
      const rows = token.rows.map(r=>`<tr>${r.map(c=>`<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
      return `<div class="table-wrap" tabindex="0" role="region" aria-label="資料表，可橫向捲動"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
  }});
  const html = md.parse(doc.md);
  return {html,headings};
}
const searchIndex = docs.map(d=>({title:d.fullTitle,group:d.group,url:`chapters/${d.id}.html`,text:d.text}));
function sidebar(active, base) {
  return `<button class="sidebar-close" id="menuClose" type="button">關閉目錄 ×</button><a class="brand" href="${base}index.html"><span class="brand-icon">Si</span><span>Silicon to Systems<small>晶片設計 · 製造 · 系統</small></span></a><nav aria-label="全書目錄"><a class="nav-overview" ${active==='home'?'aria-current="page"':''} href="${base}index.html">產業學習入口</a><a class="nav-overview" ${active==='roadmap'?'aria-current="page"':''} href="${base}roadmap.html">設計 → 製造 → 系統路線</a><a class="nav-overview" href="${base}roadmap.html#foundations">基礎、工具與延伸</a><a class="nav-overview" href="${base}index.html#curriculum">原章號完整目錄</a>${sections.map(([a,b,label])=>`<section class="nav-group"><h2>${label}</h2>${docs.filter(d=>d.num>=a&&d.num<=b).map(d=>`<a ${active===d.id?'aria-current="page"':''} href="${base}chapters/${d.id}.html"><span>${d.num<90?String(d.num).padStart(2,'0'):'附'}</span>${esc(d.name)}</a>`).join('')}</section>`).join('')}</nav>`;
}
function shell({active='',name=title,body='',toc='',base='',kind=''}) {
  return `<!doctype html><html lang="zh-Hant" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="以半導體產業為主線，從晶片設計、驗證與投片，連接製造、封裝測試與系統；數理及元件物理作為支援基礎的繁體中文教材。"><title>${esc(name)}｜工程教材</title><link rel="stylesheet" href="${base}assets/book.css"><link rel="stylesheet" href="${base}assets/katex/katex.min.css"><script>try{document.documentElement.dataset.theme=localStorage.getItem('engineering-theme')||'light'}catch(e){}</script></head><body class="${kind}" data-base="${base}"><a class="skip" href="#main">跳至正文</a><div class="reading-progress" id="progress"></div><aside class="sidebar" id="sidebar">${sidebar(active,base)}</aside><button class="nav-shade" id="navShade" aria-label="關閉目錄" hidden></button><header class="toolbar"><button class="menu-toggle" id="menuToggle" aria-controls="sidebar" aria-expanded="false">目錄</button><a class="toolbar-home" href="${base}index.html">半導體工程 <span>／</span> 學習版</a><div class="toolbar-actions"><button id="searchOpen" aria-label="搜尋全書">搜尋 <kbd>⌘ K</kbd></button><a href="${base}all.html">整本閱讀</a><button id="themeToggle" aria-label="切換深淺色">深／淺</button><button id="printPage">列印</button></div></header><main id="main" tabindex="-1">${body}<footer><span>Silicon to Systems · 2026 學習版</span><a href="${base}quality.html">檢查紀錄</a><a href="${base}chapters/92-bibliography.html">學術資料與編寫說明</a></footer></main>${toc}<dialog id="searchDialog" class="search-dialog" aria-labelledby="searchLabel"><form method="dialog"><button aria-label="關閉搜尋">關閉</button></form><label id="searchLabel" for="searchInput">搜尋章節、術語與全文</label><input id="searchInput" type="search" placeholder="例如：跨導、混疊、Debye、良率" autocomplete="off"><p id="searchCount" aria-live="polite"></p><div id="searchResults"></div></dialog><script defer src="${base}assets/search-index.js"></script><script defer src="${base}assets/models.js"></script><script defer src="${base}assets/book.js"></script></body></html>`;
}

// Render every equation before writing, then build in a unique staging directory.
const rendered = docs.map(doc => ({single:render(doc),full:render(doc,true)}));
out = await mkdtemp(path.join(root,'.book-build-'));
await mkdir(path.join(out,'chapters'),{recursive:true});
await mkdir(path.join(out,'assets','katex'),{recursive:true});
await cp(path.join(root,'src','book.css'),path.join(out,'assets','book.css'));
await cp(path.join(root,'src','book.js'),path.join(out,'assets','book.js'));
await cp(path.join(root,'src','models.js'),path.join(out,'assets','models.js'));
await cp(path.join(root,'assets','figures'),path.join(out,'assets','figures'),{recursive:true});
await writeFile(path.join(out,'assets','search-index.js'),`window.BOOK_INDEX=${json(searchIndex)};\n`);
await cp(path.join(root,'node_modules','katex','dist','katex.min.css'),path.join(out,'assets','katex','katex.min.css'));
await cp(path.join(root,'node_modules','katex','dist','fonts'),path.join(out,'assets','katex','fonts'),{recursive:true});
await cp(path.join(root,'node_modules','katex','LICENSE'),path.join(out,'assets','katex','LICENSE.txt'));

const fullParts=[];
for (const [i,doc] of docs.entries()) {
  const {html,headings}=rendered[i].single;
  const prev=docs[i-1],next=docs[i+1];
  const pager=`<nav class="pager" aria-label="依原章序翻頁">${prev?`<a href="${prev.id}.html"><small>原章序 · 上一章</small>${esc(prev.name)}</a>`:'<span></span>'}${next?`<a href="${next.id}.html"><small>原章序 · 下一章</small>${esc(next.name)} →</a>`:''}</nav>`;
  const tools=doc.num===40?calculatorMarkup():'';
  await writeFile(path.join(out,'chapters',`${doc.id}.html`),shell({active:doc.id,name:doc.fullTitle,base:'../',kind:'chapter-page',body:`<div class="eyebrow">${esc(doc.group)}<span>約 ${Math.max(3,Math.round(doc.count/320))} 分鐘正文</span></div>${chapterContext(doc.num)}<article class="prose">${html}</article>${tools}${pager}`,toc:`<aside class="page-toc" aria-label="本章段落"><strong>本章內容</strong>${headings.map(h=>`<a href="#${esc(h.id)}">${esc(h.text)}</a>`).join('')}</aside>`}));
  fullParts.push(`<section class="book-section" id="${doc.id}"><div class="eyebrow">${esc(doc.group)}</div>${rendered[i].full.html}</section>`);
}

const map=sections.filter(g=>g[0]<90).map(([a,b,label,desc],i)=>`<section class="curriculum-section"><div class="section-label"><span>${String(i+1).padStart(2,'0')}</span><h2>${label}</h2><p>${desc}</p></div><ol class="chapter-list">${chapters.filter(d=>d.num>=a&&d.num<=b).map(d=>`<li><a href="chapters/${d.id}.html"><span>${String(d.num).padStart(2,'0')}</span><strong>${esc(d.name)}</strong><em>閱讀 →</em></a></li>`).join('')}</ol></section>`).join('');
const count=chapters.reduce((a,d)=>a+d.count,0);
const home=`<section class="hero"><div class="eyebrow">SILICON TO SYSTEMS · SEMICONDUCTOR ENGINEERING</div><h1>從晶片設計，<br>走到製造與系統。</h1><p>以半導體產業為主線的工程教材<span>面向理工相關科系。從需求與架構出發，理解設計、製造、封裝測試與系統如何交接；數學、電路及元件物理，成為解決問題時可回查的基礎。</span></p><div class="hero-actions"><a class="primary" href="roadmap.html">展開產業學習路線 →</a><a href="chapters/01-engineering-map.html">從第 01 章開始</a><a class="offline-download" href="engineering-textbook-html.zip" download>下載離線 HTML</a></div><div class="book-facts"><span><strong>${chapters.length} 章＋3 附錄</strong>保留原章號與正文</span><span><strong>01–03 已圖解擴編</strong>其餘逐章深化</span><span><strong>${figureSizes.size} 張原創圖</strong>舊圖保留，逐章新增</span></div></section><section class="reading-note"><h2>先認識六個環節，再選閱讀入口</h2><p>每一環節都回答「收到什麼、交付什麼、怎麼驗證」。這是教學導覽，不是單向生產線；驗證、DFT、封裝和製造限制都須提早回饋設計。</p>${lifecycleCards()}<p class="coverage-note"><strong>目前進度：</strong>現有章節已提供元件、製程與系統入門；完整 IC 架構、RTL／類比設計實作、版圖與投片簽核仍需逐步補齊。<a href="roadmap.html#verification-tapeout">查看內容缺口與後續方向 →</a></p></section><section class="reading-note"><h2>怎麼學，才不會在章節間跳躍？</h2><p>新讀者先讀第 01 章建立全貌，再挑選任務；遇到陌生的模型，依各章先備回查基礎。先理解假設，再重做例題，最後在看解答前完成練習。第 40 章的整合審查留待相關模型學完後回訪，不當作第二課。</p><div class="routes"><a href="roadmap.html#foundations"><b>基礎與工具</b><span>數理、元件、量測與統計</span></a><a href="roadmap.html#extensions"><b>延伸專題</b><span>MEMS、微流體與生醫感測</span></a><a href="#curriculum"><b>原章號目錄</b><span>所有原連結與內容保留</span></a><a href="all.html"><b>整本閱讀</b><span>依原章序閱讀與列印</span></a></div><p>工程視角關注規格、取捨、異常與驗證；教學視角解釋原理、推導與先備。兩者都圍繞半導體相關問題，但不表示已有外部工程師／教授認證，也不取代正式課程及實驗訓練。</p></section><section id="curriculum"><div class="reading-note"><h2>依原章號查閱</h2><p>以下保留原學科分組；章號是查詢索引，不是製造工站順序，也不是新版產業路線的重新編號。</p></div>${map}</section><section class="reading-note"><h2>查詢與延伸</h2><p>${docs.filter(d=>d.num>=90).map(d=>`<a href="chapters/${d.id}.html">${esc(d.name)}</a>`).join('　／　')}</p><p>各章列出可追溯的大學課程、期刊或官方技術資料；完整書籍未取得全文時，列為延伸閱讀，不宣稱已逐頁驗證。</p></section>`;
const homeHTML = shell({active:'home',body:home,kind:'home-page'});
const offlineHome = homeHTML.replace(/<a class="offline-download"[^>]*>[^<]*<\/a>/,'<span>離線教材 · 已下載</span>');
await writeFile(path.join(out,'index.html'),offlineHome);
const fullToc=`<details class="full-toc"><summary>全書目錄（${chapters.length}章與附錄）</summary>${docs.map(d=>`<a href="#${d.id}">${esc(d.fullTitle)}</a>`).join('')}</details>`;
await writeFile(path.join(out,'all.html'),shell({name:'整本教材',kind:'full-book',body:`<header class="book-title"><div class="eyebrow">依原章序閱讀與列印</div><h1>${title}</h1><p>正文順序與章號保留；按產業環節選讀，請用<a href="roadmap.html">設計 → 製造 → 系統路線</a>。</p></header>${fullToc}<article class="prose">${fullParts.join('')}</article>`}));
await writeFile(path.join(out,'roadmap.html'),shell({active:'roadmap',name:'產業學習路線與內容邊界',kind:'home-page roadmap-page',body:roadmapBody(docs)}));
const qualityMD=await readFile(path.join(root,'research','quality-report.md'),'utf8');
await writeFile(path.join(out,'quality.html'),shell({name:'教材檢查紀錄',kind:'home-page',body:`<article class="prose">${new Marked().parse(qualityMD)}</article>`}));
await writeFile(path.join(out,'book.md'),docs.map(d=>d.md.replace(/(!\[(?:\\.|[^\]\\])*\]\()\.\.\/assets\/figures\//g,'$1assets/figures/')).join('\n\n---\n\n'));
const manifest={title,chapters:chapters.length,appendices:docs.length-chapters.length,hanCharacters:count,equations:equationCount/2,generatedPages:docs.length+4,documents:docs.map(d=>({file:d.file,title:d.fullTitle,characters:d.count,group:d.group}))};
await writeFile(path.join(out,'book-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const offline=spawnSync('zip',['-q','-r',path.join(out,'engineering-textbook-html.zip'),'index.html','all.html','roadmap.html','quality.html','chapters','assets','book.md','book-manifest.json'],{cwd:out,encoding:'utf8'});
if(offline.status!==0)throw new Error(`Offline archive failed: ${offline.stderr}`);
await writeFile(path.join(out,'index.html'),homeHTML);
// Only replace the generated dist after the complete staged book and ZIP exist.
if (release !== path.join(root,'dist')) throw new Error('Unexpected release directory');
await rm(release,{recursive:true,force:true});
await rename(out,release);
await writeFile(path.join(content,'learning-paths.md'),roadmapMarkdown(docs));
console.log(JSON.stringify({chapters:manifest.chapters,appendices:manifest.appendices,hanCharacters:count,equations:manifest.equations,pages:manifest.generatedPages}));

function calculatorMarkup(){return `<section class="model-lab" aria-labelledby="modelLab"><h2 id="modelLab">模型試算：把假設變成可調參數</h2><p>教學估算，不含漏電、缺陷群聚或產品規格。改變一個參數，觀察量級如何變化。</p><div class="model-grid"><form data-model="power"><h3>CMOS動態功耗</h3><label>活動因子 α<input name="alpha" type="number" min="0" max="1" step="0.01" value="0.2"></label><label>有效電容（pF）<input name="c" type="number" min="0" value="20"></label><label>電壓（V）<input name="v" type="number" min="0" step="0.1" value="0.8"></label><label>頻率（MHz）<input name="f" type="number" min="0" value="100"></label><output aria-live="polite"></output></form><form data-model="yield"><h3>Poisson隨機缺陷良率</h3><label>晶粒面積（cm²）<input name="area" type="number" min="0" step="0.1" value="0.4"></label><label>致命缺陷密度（cm⁻²）<input name="density" type="number" min="0" step="0.1" value="0.3"></label><output aria-live="polite"></output><p>假設均勻獨立缺陷；不含參數失效與測試誤判。</p></form></div></section>`;}
