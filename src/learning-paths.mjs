// Editorial navigation only. Chapter IDs, canonical order and body content stay stable.
export const industryStages = [
  {
    id: 'requirements', name: '需求與晶片架構', short: '先定義要交付什麼',
    input: '產品使用情境、工作負載、介面、功耗、成本與可靠度目標。',
    output: '可驗證的需求、功能分割與性能預算；先決定哪些功能由晶片、封裝、板級電路及韌體承擔。',
    evidence: '每項需求都能對應條件、量測方法及判定門檻，而不是只有功能名稱。',
    existing: '第 01 章提供需求與產業物件的入口；第 40 章是學過相關模型後再回訪的取捨審查，不是入門第二課。',
    chapters: [1, 40], prerequisites: [], sources: [0, 3],
    gap: '待補：IC 架構規格實例、功能與介面分割、時鐘／重置／電源規劃，以及製程、PDK 與 IP 選擇。',
    handoff: '將可量化的需求交給設計；製程、封裝與測試的可行性也要在此時回饋。',
  },
  {
    id: 'ic-design', name: '電路與邏輯設計', short: '把規格變成設計模型',
    input: '架構規格、製程模型、元件／IP 資料及電源與介面限制。',
    output: '類比／混合訊號電路設計或數位 RTL，以及對應的模擬模型與約束。兩種設計分支不共用一套完整流程。',
    evidence: '設計在指定工作條件下符合功能與性能預算；可測試性、可觀測性及封裝限制需提早規劃。',
    existing: '類比入口為 26 → 27，數位入口為 28 → 29；第 21 章作記憶體產品橋接，第 33 章按可測試性需求回查。第 27 章偏運放應用，並非運放內部 IC 設計。',
    chapters: [26, 27, 28, 29, 21, 33], prerequisites: [2, 3, 4, 5, 6, 12], sources: [0, 4, 5],
    gap: '待補：完整 RTL 模組與測試平台、標準元件庫、類比偏壓／差動級與尺寸設計、PVT 角落及失配分析。',
    handoff: '設計描述必須同時交付驗證意圖與約束，才能進入可追溯的實作與檢查。',
  },
  {
    id: 'verification-tapeout', name: '驗證、實體設計與投片', short: '從設計走到可製造的交付',
    input: 'RTL 或電路圖、驗證計畫、PDK、元件庫與設計約束。',
    output: '數位綜合與佈局繞線結果，或類比版圖；連同必要的驗證、簽核報告及受版本管理的投片資料。',
    evidence: '依產品及製程要求完成相應的功能、時序、DRC／LVS、寄生及電源完整性檢查。產生 GDS 檔不等於簽核通過。',
    existing: '目前只有第 29 章時序／CDC、第 33 章驗證與測試區別，以及第 07、20、34 章的互連與封裝背景；這些是相關基礎，尚非完整 RTL-to-GDS 或類比投片課程。',
    chapters: [29, 33, 7, 20, 34], prerequisites: [4, 12, 26, 28], sources: [1, 2],
    gap: '目前主要缺口：綜合、floorplan、placement、CTS、routing、類比匹配版圖、DRC／LVS／PEX、後模擬、簽核收斂與投片版本交付。這一段尚需系統性補寫。',
    handoff: '通過約定檢查的版圖與資料才交給製造；實作發現的時序、寄生或可製造性問題會回到設計修正。',
  },
  {
    id: 'manufacturing', name: '晶圓製造與品質', short: '讓結構與電性可重複實現',
    input: '受控的製造資料、基板、製程整合方案與各站規格。',
    output: '完成加工的晶圓，以及製程、量測、缺陷、追溯與良率資料。',
    evidence: '材料、幾何與電性均須對應規格；量測、統計、可靠度與變更管理貫穿各階段，不是製造完才補做。',
    existing: '第 14–20 章涵蓋基板與主要製程模組，第 22–25 章建立證據與控制，第 38 章練習良率異常診斷。章號不是晶圓的固定加工順序；清洗、微影與薄膜等會多次重複。',
    chapters: [14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 38], prerequisites: [2, 8, 9, 10, 12], sources: [3],
    gap: '待補：以同一產品串接模組的完整製程整合案例、設計規則回饋、實體失效分析與確認修正閉環。現有內容不是設備操作或製程配方。',
    handoff: '晶圓電測與缺陷資料支援晶粒選別、後續封裝與測試；異常也可能回饋製程或設計。',
  },
  {
    id: 'packaging-test', name: '封裝與測試', short: '把晶粒變成可用且可檢驗的元件',
    input: '晶圓／晶粒、測試需求、封裝介面與熱／電性預算；相關規劃在設計前期就開始。',
    output: '封裝元件、測試結果、分級與可靠度證據；晶圓電測和封裝後測試是不同的檢查位置。',
    evidence: '分清設計驗證、製造缺陷測試、性能量測與可靠度試驗；某一種覆蓋率不能取代其餘證據。',
    existing: '第 34 章介紹封裝、Chiplet、熱與寄生，第 33 章連接 DFT 與實物篩檢，第 25、36 章支援可靠度及量測。',
    chapters: [34, 33, 25, 36], prerequisites: [7, 22, 23, 28], sources: [3, 4, 5],
    gap: '待補：晶圓探測／ATE 測試計畫、封裝共同設計、測試程式與矽上除錯案例，以及良率、成本和測試時間的共同取捨。',
    handoff: '元件的介面、性能、熱與使用限制交給系統整合；測試與封裝觀察亦需回饋設計和製造。',
  },
  {
    id: 'systems', name: '系統整合與驗證', short: '回到真實工作負載檢驗需求',
    input: '晶片及封裝規格、板級電路、韌體、校正資料與原始產品需求。',
    output: '可重現的系統行為、量測紀錄與需求符合性證據，以及下一版的問題清單。',
    evidence: '在相同工作負載與測試條件下檢驗精度、效能、能耗、資料完整性及可靠度；模型預測與實測分開。',
    existing: '第 30–32、35 章連接轉換器、電源、韌體與前端；第 36–37 章以量測和感測資料專題整合，第 40 章回到方案審查。第 30 章偏轉換器規格與介面，31 偏電源級與熱，32 偏 MCU 周邊與韌體；不是 ADC/DAC、PMIC 或處理器內部的完整 IC 設計教材，也不代表已自行完成晶片製造。',
    chapters: [30, 31, 32, 35, 36, 37, 40], prerequisites: [2, 3, 4, 5, 6, 26, 27, 28], sources: [0, 3],
    gap: '待補：首次矽片 bring-up、板級 SI／PI 與熱的共同驗證、硬韌體問題定位，以及系統失效回溯至 IC／封裝／製程的案例。',
    handoff: '把可定位的系統問題與量測證據回送需求、架構、設計、製造及封裝；不是以「能開機」作為唯一終點。',
  },
];

export const supportPaths = [
  { id: 'mathematics-circuits', name: '數理、電路與訊號工具', chapters: [2, 3, 4, 5, 6, 7], description: '02 的量綱與建模支援後續推導；03、04、05 分別處理頻域、網路與暫態，再接 06 取樣與 07 互連。依任務補齊，不能把「可回查」當成不需要先備。' },
  { id: 'device-foundations', name: '材料與元件基礎', chapters: [8, 9, 10, 11, 12, 13], description: 'CMOS 主線先理解 08–10，再讀 12；11 是 BJT／類比支線，13 分開看先進邏輯與功率元件，不把兩者當成同一條微縮路線。' },
  { id: 'evidence-tools', name: '量測、統計與可靠度工具', chapters: [22, 23, 24, 25, 36], description: '22 → 23 提供資料層級與統計判讀；24、25 延伸到控制和可靠度，36 支援實驗紀錄。這些能力跨越設計、製造、測試及系統。' },
  { id: 'study-tools', name: '學習計畫與查詢工具', chapters: [39, 90, 91, 92], description: '39 保留原科系與兩學期路徑供選讀；附錄查單位、術語及來源。本頁產業導覽與原學科路徑並存，沒有重新編號。' },
  { id: 'extensions', name: '延伸應用：MEMS 與生醫感測', chapters: [41, 42, 43, 44, 45, 46], description: '結構、流體、表面、BioFET、讀出與感測驗證是專題支線，不是每位讀者都要先修的 IC 主流程，也不等同臨床驗證。' },
];

export const workflowSources = [
  { title: 'University of Bristol · Introduction to Design Verification', url: 'https://uobdv.github.io/Design-Verification/Lectures/Current/1_Introduction_to_DV_ALL-SLIDES_narrated_v7-plain.pdf', scope: '查閱 PDF 第 3、5、7–8、30–35 頁：需求、設計表示、驗證與製造測試的區別，以及平行回饋；不採用歷史成本或工期作通則。' },
  { title: 'OpenROAD · Flow Scripts Tutorial', url: 'https://openroad-flow-scripts.readthedocs.io/en/latest/tutorials/FlowTutorial.html', scope: '查閱設計輸入、時序約束、RTL-to-GDS、輸出與 Timing 章節：數位實作及報告判讀。範例產生 GDS 仍有負 slack，不能視為簽核完成；此流程不涵蓋全部產品驗證或類比設計。' },
  { title: 'Virginia Tech · Parasitic Extraction and Post-Layout Simulation', url: 'https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/pex.html', scope: '查閱寄生萃取與後模擬段落，並核對同校類比設計總覽及 LVS：性能不足時回修版圖再模擬。只引用公開流程概念，不移植 PDK 規則或專用模型。' },
  { title: 'STMicroelectronics · The Semiconductor Value Chain', url: 'https://www.st.com/content/st_com/en/about/manufacturing-at-st/semiconductor-value-chain.html', scope: '查閱製造與 Solution creation 段落：晶圓電測、封裝後測試，以及軟體／參考板的系統支援。ST 的 IDM 分工不代表所有公司；製造前後段也不等於晶圓內的 FEOL／BEOL。' },
  { title: 'Siemens · Tessent RTL Pro', url: 'https://static.sw.cdn.siemens.com/siemens-disw-assets/public/3rHm3xBoSaKSeJzgIedAte/en-US/Siemens-SW-Tessent-RTL-Pro-85605-FINAL.pdf', scope: '查閱 PDF 第 1–3 頁：DFT 可在 RTL 階段分析及插入，需提早評估面積與時序影響。這是數位工具資料，不表示所有 DFT 都要在 RTL 插入，也不代替類比測試。' },
  { title: 'Siemens · Next Generation IC Packaging, Part 1', url: 'https://static.sw.cdn.siemens.com/siemens-disw-assets/public/5s0l7Xkc2wqROYOYdxWyQ/en-US/82672_Siemens%20SW%20Next%20Generation%20IC%20Packaging%20Part%201%20WP%2082672%20C1.pdf', scope: '查閱 PDF 第 1、3–6、8 頁：封裝前期共同規劃 I/O、互連、供電、熱與可測試性。來源聚焦先進整合，其工具與交付格式不是所有產品的唯一標準。' },
];

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const chapter = (docs, number) => {
  const doc = docs.find(item => item.num === number);
  if (!doc) throw new Error(`Unknown learning-path chapter ${number}`);
  return doc;
};
const chapterLinks = (docs, numbers, base = '') => numbers.map(number => {
  const doc = chapter(docs, number);
  return `<a href="${base}chapters/${doc.id}.html">${number < 90 ? String(number).padStart(2, '0') + ' · ' : ''}${esc(doc.name)}</a>`;
}).join('');

export function validateLearningPaths(docs) {
  const routes = [...industryStages, ...supportPaths];
  if (new Set(routes.map(route => route.id)).size !== routes.length) throw new Error('Duplicate route IDs');
  for (const route of routes) {
    if (new Set(route.chapters).size !== route.chapters.length) throw new Error(`Repeated chapter in ${route.id}`);
    for (const number of [...route.chapters, ...(route.prerequisites || [])]) chapter(docs, number);
    for (const index of route.sources || []) if (!workflowSources[index]) throw new Error(`Unknown source in ${route.id}`);
  }
  for (const doc of docs) {
    if (!routes.some(route => route.chapters.includes(doc.num))) throw new Error(`Chapter lacks a learning-path position: ${doc.file}`);
  }
}

export function lifecycleCards() {
  return `<ol class="lifecycle-cards" aria-label="六個產業學習環節">${industryStages.map((stage, i) => `<li><a href="roadmap.html#${stage.id}"><span class="stage-number">${String(i + 1).padStart(2, '0')}</span><strong>${esc(stage.name)}</strong><span>${esc(stage.short)}</span></a></li>`).join('')}</ol>`;
}

export function chapterContext(number) {
  const routes = [...industryStages, ...supportPaths].filter(route => route.chapters.includes(number));
  return `<nav class="chapter-context" aria-label="本章的產業與工具定位"><span>本章可用於</span>${routes.map(route => `<a href="../roadmap.html#${route.id}">${esc(route.name)}</a>`).join('')}<small>以下保留原章正文；路線相關不代表已涵蓋該環節全部能力。</small></nav>`;
}

export function roadmapBody(docs) {
  const stages = industryStages.map((stage, i) => {
    const references = stage.sources.map(index => {
      const source = workflowSources[index];
      return `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`;
    }).join('；');
    const prerequisites = stage.prerequisites.length
      ? `<h3>先備回查</h3><p>以下按所選分支補齊，並閱讀各章章首先備；不是要求一次把所有分支學完。</p><div class="route-chapters prerequisite-links">${chapterLinks(docs, stage.prerequisites)}</div>`
      : '<p class="stage-prerequisite">入門從第 01 章開始；第 40 章留待掌握各項模型後回訪。</p>';
    const next = industryStages[i + 1];
    return `<section class="roadmap-stage" id="${stage.id}" data-stage="${stage.id}">
      <header><span class="stage-number">${String(i + 1).padStart(2, '0')}</span><h2>${esc(stage.name)}</h2><p>${esc(stage.short)}</p></header>
      <div class="stage-content">
        <dl class="handoff-grid"><div><dt>收到什麼</dt><dd>${esc(stage.input)}</dd></div><div><dt>交付什麼</dt><dd>${esc(stage.output)}</dd></div><div><dt>怎麼判斷</dt><dd>${esc(stage.evidence)}</dd></div></dl>
        <p class="stage-sources">流程依據（交付欄位為編者綜整）：${references}。</p>
        <h3>現有相關章節</h3><p>${esc(stage.existing)}</p><div class="route-chapters">${chapterLinks(docs, stage.chapters)}</div>
        ${prerequisites}<p class="coverage-note"><strong>內容邊界</strong> ${esc(stage.gap)}</p>
        <p class="stage-handoff"><strong>如何接下去</strong> ${esc(stage.handoff)}</p>
        ${next ? `<a class="next-stage" href="#${next.id}">看下一個產業環節：${esc(next.name)} →</a>` : '<a class="next-stage" href="#requirements">帶著驗證結果回到需求與架構 ↑</a>'}
      </div></section>`;
  }).join('');
  const support = supportPaths.map(route => `<section class="support-route" id="${route.id}"><h3>${esc(route.name)}</h3><p>${esc(route.description)}</p><div class="route-chapters">${chapterLinks(docs, route.chapters)}</div></section>`).join('');
  const sources = workflowSources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><p>${esc(source.scope)}</p></li>`).join('');
  return `<header class="roadmap-header"><div class="eyebrow">SILICON TO SYSTEMS · LEARNING ROADMAP</div><h1>先看產業全程，<br>再按問題補齊基礎。</h1><p>這是現有 46 章的學習定位與擴編藍圖，不是已補齊的流片實作課程。章號、正文與既有圖片保留；設計到投片的缺口在各環節直接標明。</p><div class="hero-actions"><a class="primary" href="chapters/01-engineering-map.html">新讀者：先讀第 01 章 →</a><a href="#foundations">回查基礎與工具</a><a href="index.html#curriculum">依原章號查閱</a></div></header>${lifecycleCards()}<aside class="feedback-note" aria-label="路線使用限制"><h2>學習順序不等於單向生產線</h2><p>六個環節是本教材的教學整理，不是唯一業界標準。驗證、DFT、封裝、可靠度與製造限制須提早介入；設計、製造和系統之間會反覆回饋。數位 RTL 流程與類比／混合訊號設計也必須分開學。產業流程依據見<a href="#workflow-sources">本頁參考資料</a>。</p><p>先閱讀第 01 章認清物件與交付，再選一個工程問題；遇到不熟悉的模型，回查相應先備。以下章節是主題入口，不是每個清單都能直接跳讀的線性課表。</p></aside>${stages}<section id="foundations" class="roadmap-support"><h2>支援主線的基礎、工具與延伸</h2><p>數理深度與跨域內容不刪除；改成清楚說明「在哪個問題會用到」。既有學科章序和<a href="chapters/39-curriculum-study-plan.html">兩學期學習計畫</a>仍可使用。</p>${support}</section><section id="workflow-sources" class="roadmap-support"><h2>產業流程的查證依據</h2><p>以下資料支持流程與界面說明，不表示現有章節已教授來源中的全部技能，也不代表來源單位背書。導覽與工程交付欄位由本教材獨立編排；未重用外部圖稿。</p><ol class="workflow-sources">${sources}</ol></section>`;
}

export function roadmapMarkdown(docs) {
  const links = numbers => numbers.map(number => { const doc = chapter(docs, number); return `[${doc.fullTitle}](${doc.file})`; }).join('、');
  const routes = [...industryStages, ...supportPaths];
  return `# 產業學習路線：從晶片設計到製造與系統\n\n<!-- 由 src/learning-paths.mjs 產生；請修改來源後執行 npm run build。 -->\n\n本頁是現有內容定位與擴編藍圖，不宣稱完整流片課程已補齊。所有原章號、正文及圖片保留。[原章序目錄](README.md)・[專案首頁](../README.md)\n\n新讀者先讀第 01 章，再依問題補齊先備。六個環節是教學整理，不是單向流程或唯一業界標準；驗證、DFT、封裝與製造限制需提早介入，數位與類比設計分支不能混為一談。\n\n${industryStages.map((stage, i) => `## ${i + 1}. ${stage.name}\n\n- 收到什麼：${stage.input}\n- 交付什麼：${stage.output}\n- 怎麼判斷：${stage.evidence}\n\n${stage.existing}\n\n現有相關章節：${links(stage.chapters)}。\n\n${stage.prerequisites.length ? `先備回查（依分支選用，仍須閱讀各章先備）：${links(stage.prerequisites)}。` : '第 01 章作入口；第 40 章留待相關模型學完再回訪。'}\n\n**內容邊界：** ${stage.gap}\n\n**如何接下去：** ${stage.handoff}\n`).join('\n')}\n## 基礎、工具與延伸\n\n${supportPaths.map(route => `### ${route.name}\n\n${route.description}\n\n${links(route.chapters)}。\n`).join('\n')}\n## 原章節保留與新定位對照\n\n這是閱讀定位，不是章節完成度認證；同一章可以服務多個環節。\n\n| 原章節（編號與網址不變） | 產業環節／支援定位 | 本階段正文與圖稿 |\n|---|---|---|\n${docs.map(doc => `| [${doc.fullTitle}](${doc.file}) | ${routes.filter(route => route.chapters.includes(doc.num)).map(route => route.name).join('／')} | 原樣保留 |`).join('\n')}\n\n## 流程參考與查閱範圍\n\n${workflowSources.map(source => `- [${source.title}](${source.url})：${source.scope}`).join('\n')}\n\n詳細查閱範圍及限制見[來源研究紀錄](../research/industry-learning-sources.md)。來源不代表對教材背書；未重用其圖稿。\n`;
}
