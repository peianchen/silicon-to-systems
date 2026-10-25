// Original SVG geometry for the chapter-01 lifecycle expansion, not source artwork.
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const {colors:C} = JSON.parse(await readFile(new URL('research/figure-style.json', root),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=22,color=C.ink,anchor='start',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
const box=(x,y,w,h,fill=C.layer,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${C.outline}" stroke-width="2" ${extra}/>`;
const line=(x,y,X,Y,color=C.ink,extra='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="2" ${extra}/>`;
const path=(d,color=C.blueLine,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" ${extra}/>`;
const arrow=(id,color='blue')=>`marker-end="url(#${id}-${color})"`;
const badge=(x,y,s)=>`<circle cx="${x}" cy="${y}" r="18" fill="${C.badge}"/>`+text(x,y+7,s,20,C.white,'middle','font-weight="700"');
function wrap(id,height,title,desc,body){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" data-figure-style="sts-flat-v1">
<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>
<defs>${[['blue',C.blueLine],['orange',C.accentLine]].map(([name,color])=>`<marker id="${id}-${name}" viewBox="0 0 10 10" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`).join('')}</defs>
<style>text{font-family:"Noto Sans CJK TC","Noto Sans CJK SC","DejaVu Sans",sans-serif;font-variant-numeric:tabular-nums}</style>
<rect width="1200" height="${height}" fill="${C.white}"/>${text(38,44,title,25)}${line(38,65,1162,65,C.rule)}${body}</svg>\n`;
}
const figures=[];
{
  const id='u01-architecture';
  let b=badge(56,108,'1')+text(87,116,'功能分割：虛線框內是候選 IC');
  b+=box(278,145,610,216,C.dielectric,'stroke-dasharray="9 7"');
  b+=text(582,173,'候選混合訊號 IC（非實際版圖）',20,C.muted,'middle');
  for(const [x,w,title,note,fill] of [[38,185,'感測元件','IC 外部',C.neutral],[305,165,'類比前端','AFE',C.silicon],[510,125,'ADC','轉換',C.layer],[675,185,'數位控制','介面／狀態',C.layer],[950,210,'MCU＋儲存','IC 外部',C.neutral]]){
    b+=box(x,202,w,85,fill)+text(x+w/2,235,title,22,C.ink,'middle')+text(x+w/2,268,note,20,C.muted,'middle');
  }
  for(const [x,X] of [[223,301],[470,505],[635,670],[860,945]]) b+=line(x,241,X,241,C.blueLine,arrow(id));
  b+=text(915,221,'結果',20,C.muted,'middle');
  b+=path('M1055 290 V323 H767 V290',C.blueLine,arrow(id))+text(1025,351,'控制命令',20,C.muted,'middle');
  b+=text(600,402,'共同約束：供電、參考、時脈、熱與測試；RF 選配，這裡省略。',20,C.muted,'middle');
  b+=line(38,432,1162,432,C.rule)+badge(56,473,'2')+text(87,481,'依序時間預算：同一組條件，各段採上限串接');
  const segments=[['ready',0,.8,'前端／參考就緒',C.silicon],['convert',.8,.5,'ADC 轉換',C.layer],['store',1.3,.2,'讀存',C.neutral],['remaining',1.5,.5,'未分配',C.accent]];
  for(const [key,start,duration,label,color] of segments){
    const x=100+500*start,w=500*duration;
    b+=box(x,525,w,65,color,`id="budget-${key}" data-start-ms="${start}" data-duration-ms="${duration}"`)+text(x+w/2,553,label,20,C.ink,'middle')+text(x+w/2,579,`${duration} ms`,20,C.ink,'middle');
  }
  b+=line(100,610,1100,610,C.ink);
  for(const value of [0,.8,1.3,1.5,2])b+=line(100+500*value,605,100+500*value,618,C.ink)+text(100+500*value,646,value,20,C.ink,'middle');
  b+=text(1140,646,'ms',20,C.ink,'middle');
  b+=path('M200 594 V681 H100',C.blueLine,'stroke-dasharray="5 5"')+text(100,713,'錯誤例：0.2 ms 啟動 ADC，就緒條件尚未保證。',22);
  b+=text(100,754,'0.8＋0.5＋0.2＝1.5 ms；2 ms 預算尚餘 0.5 ms。',22);
  b+=text(100,790,'自設上限排程，非實測；不證明耗電、精度或晶片已實現。',20,C.muted);
  figures.push(['unit01-architecture-contract.svg',wrap(id,820,'晶片邊界與介面：功能齊全，不代表整合正確',
    '候選IC整合AFE、ADC及數位控制介面；感測器、MCU與儲存留在外部。下方共同時間尺每毫秒500像素，0.8毫秒就緒、0.5毫秒轉換、0.2毫秒讀存合計1.5毫秒，2毫秒預算餘0.5毫秒。0.2毫秒啟動時尚不保證就緒。上限排程為自設，非實測。',b)]);
}
{
  const id='u01-design';
  let b=box(90,88,1020,82,C.dielectric)+text(600,120,'共同輸入：需求／介面、製程模型與規則、可用元件庫',22,C.ink,'middle')+text(600,151,'功能、電壓、時間、電源與測試條件必須相容',20,C.muted,'middle');
  b+=line(315,207,315,221,C.blueLine,arrow(id))+line(885,207,885,221,C.blueLine,arrow(id));
  b+=text(315,200,'類比／混合訊號路徑',20,C.ink,'middle')+text(885,200,'數位邏輯路徑',20,C.ink,'middle');
  const left=[['電路圖與性能模擬','工作點／增益／建立時間'],['元件配置與版圖','匹配／連接／幾何'],['寄生後性能與實體檢查','DRC／LVS／PEX 等']];
  const right=[['RTL 與功能驗證','狀態／控制／資料有效'],['合成網表與實體實作','佈局／時脈／繞線'],['時序與實體檢查','約束／寄生／規則／連接']];
  for(const [column,items] of [[90,left],[660,right]]){
    items.forEach(([a,bLabel],i)=>{
      const y=225+i*120;
      b+=box(column,y,450,80,i===2?C.neutral:C.layer)+badge(column+27,y+26,String(i+1))+text(column+245,y+32,a,22,C.ink,'middle')+text(column+245,y+63,bLabel,20,C.muted,'middle');
      if(i<2)b+=line(column+225,y+82,column+225,y+115,C.blueLine,arrow(id));
    });
  }
  b+=path('M90 505 H53 V265 H87',C.accentLine,'stroke-dasharray="8 6" '+arrow(id,'orange'));
  b+=path('M1110 505 H1147 V265 H1113',C.accentLine,'stroke-dasharray="8 6" '+arrow(id,'orange'));
  b+=text(28,400,'不符則回修',20,C.accentLine,'middle','transform="rotate(-90 28 400)"');
  b+=text(1175,400,'不符則回修',20,C.accentLine,'middle','transform="rotate(-90 1175 400)"');
  b+=path('M315 548 V592 H600 V630',C.blueLine,arrow(id))+path('M885 548 V592 H600',C.blueLine);
  b+=box(240,635,720,88,C.dielectric)+text(600,670,'混合訊號整合 → 約定簽核 → 受控資料交付',22,C.ink,'middle')+text(600,703,'同版設計、模型、約束與報告；不等於已製成晶片',20,C.muted,'middle');
  b+=line(90,754,1110,754,C.rule)+text(600,790,'DFT、封裝與系統介面：設計前期就共同規劃',22,C.ink,'middle');
  b+=line(125,825,175,825,C.blueLine,arrow(id))+text(190,833,'資料依賴',20,C.muted)+line(450,825,500,825,C.accentLine,'stroke-dasharray="8 6" '+arrow(id,'orange'))+text(515,833,'修訂回饋',20,C.muted)+text(800,833,'非單次、完整工具流程',20,C.muted);
  figures.push(['unit01-design-evidence.svg',wrap(id,860,'從設計表示到交付：每種檢查回答不同問題',
    '共同規格與PDK支援類比電路、版圖、寄生後性能，及數位RTL、合成、實體與時序路徑。兩路整合後按約定簽核並交付受控資料。橘色虛線為不符時回修；DFT、封裝與系統介面提早規劃。流程為典型教學整理，非完整工具操作或實物製程。',b)]);
}
for(const [name,svg] of figures)await writeFile(new URL(`assets/figures/${name}`,root),svg);
console.log(JSON.stringify({figures:figures.map(([name])=>name),root:fileURLToPath(root)}));
