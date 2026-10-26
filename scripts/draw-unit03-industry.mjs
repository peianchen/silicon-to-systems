// Original diagrams; no external artwork. Fixed LTI node and limited supply-loop models.
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const {colors:C}=JSON.parse(await readFile(new URL('research/figure-style.json',root),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const num=n=>Number(n).toFixed(3);
const text=(x,y,s,size=22,color=C.ink,anchor='start',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
const line=(x,y,X,Y,color=C.ink,extra='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="2" ${extra}/>`;
const rect=(x,y,w,h,fill=C.layer,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.outline}" stroke-width="1.5" ${extra}/>`;
const dot=(x,y,r=4,fill=C.ink,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const badge=(x,y,n)=>dot(x,y,18,C.badge)+text(x,y+7,n,20,C.white,'middle','font-weight="700"');
const ground=(x,y)=>line(x,y,x,y+10)+line(x-18,y+10,x+18,y+10)+line(x-12,y+17,x+12,y+17)+line(x-6,y+24,x+6,y+24);
const arrow=(x,y,X,Y,color=C.ink)=>{
 const a=Math.atan2(Y-y,X-x),size=10;
 return line(x,y,X,Y,color)+`<path d="M ${X-size*Math.cos(a-.45)} ${Y-size*Math.sin(a-.45)} L ${X} ${Y} L ${X-size*Math.cos(a+.45)} ${Y-size*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="2"/>`;
};
function wrap(id,height,title,desc,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" data-figure-style="sts-flat-v1">
<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>
<style>text{font-family:"Noto Sans CJK TC","Noto Sans CJK SC","DejaVu Sans",sans-serif;font-variant-numeric:tabular-nums}</style>
<rect width="1200" height="${height}" fill="${C.white}"/>${text(38,44,title,25)}${line(38,65,1162,65,C.rule)}${body}</svg>\n`;}
const figures=[];
{
 const id='u03-parasitic-budget',f=1e6,R=2000;
 const gainLimit=Math.sqrt(1/.95**2-1)/(2*Math.PI*f*R)*1e12;
 const phaseLimit=Math.tan(18*Math.PI/180)/(2*Math.PI*f*R)*1e12;
 const limit=Math.min(gainLimit,phaseLimit),X=c=>330+18.5*c;
 let b=badge(56,108,'1')+text(87,116,'同一固定 LTI 節點：並聯電容必須算在一起');
 b+=dot(110,235,33,C.white,`stroke="${C.outline}" stroke-width="2"`);
 b+=`<path d="M 89 235 Q 99 213 110 235 T 131 235" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
 b+=text(155,242,'Vs')+line(110,202,110,170)+line(110,170,240,170);
 b+=rect(240,145,180,50,C.silicon)+text(330,177,'Rs = 2 kΩ',22,C.ink,'middle');
 b+=line(420,170,1090,170)+text(1090,137,'Vo',22,C.ink,'end');
 b+=line(110,268,110,350)+line(110,350,1000,350)+ground(110,350);
 b+=rect(940,145,214,225,'none','stroke-dasharray="7 5"');
 for(const [key,x,label,value] of [['c0',600,'C₀',20],['parasitic',800,'寄生',5],['probe',1000,'探棒',10]]){
  b+=`<g id="branch-${key}" data-capacitance-pf="${value}" data-top-node="Vo" data-bottom-node="ac-reference">`;
  b+=dot(x,170)+line(x,170,x,245)+line(x-30,245,x+30,245)+line(x-30,260,x+30,260)+line(x,260,x,350)+dot(x,350);
  b+=text(x+43,237,label)+text(x+43,273,`${value} pF`,20,C.muted)+'</g>';
 }
 b+=text(1047,397,'虛框：可移除探棒',20,C.muted,'middle');
 b+=text(600,435,'各電容同接 Vo 與交流共同參考；接上探棒會改變被測模型。',20,C.muted,'middle');
 b+=text(600,467,'下方由設計值逐項加入寄生與探棒；不是 SAR 開關取樣。',20,C.muted,'middle');
 b+=line(38,490,1162,490,C.rule)+badge(56,530,'2')+text(87,538,'同一比例的電容預算：已接近上限');
 b+=text(600,579,'1 MHz：|Vo/Vs| ≥ 0.95，落後角 ≤ 18°；兩項都要通過。',22,C.ink,'middle');
 for(const c of [0,10,20,30,40]){
  b+=line(X(c),625,X(c),880,C.rule,'shape-rendering="crispEdges"')+text(X(c),914,String(c),20,C.muted,'middle');
 }
 b+=line(X(0),880,X(40),880)+text(1085,946,'總電容（pF）',20,C.muted,'end');
 const stages=[
  ['design',640,20,'設計值：20 pF',[[20,C.layer,'c0']]],
  ['built',730,25,'含寄生：25 pF',[[20,C.layer,'c0'],[5,C.silicon,'parasitic']]],
  ['probed',820,35,'加探棒：35 pF',[[20,C.layer,'c0'],[5,C.silicon,'parasitic'],[10,C.accent,'probe']]],
 ];
 for(const [key,y,total,label,parts] of stages){
  const omegaRC=2*Math.PI*f*R*total*1e-12,gain=1/Math.hypot(1,omegaRC),phase=-Math.atan(omegaRC)*180/Math.PI;
  b+=`<g id="budget-${key}" data-total-pf="${total}" data-gain="${gain}" data-phase-deg="${phase}">`+text(70,y+30,label);
  let offset=0;
  for(const [value,fill,part] of parts){
   b+=rect(num(X(offset)),y,num(18.5*value),46,fill,`id="budget-${key}-${part}" data-start-pf="${offset}" data-capacitance-pf="${value}"`);
   b+=text(X(offset+value/2),y+31,String(value),22,C.ink,'middle');offset+=value;
  }
  b+=text(1140,y+31,total<=limit?'通過':'不通過',22,total<=limit?C.ink:C.accentLine,'end')+'</g>';
 }
 b+=line(num(X(limit)),617,num(X(limit)),880,C.ink,`id="capacitance-limit" data-capacitance-pf="${limit}" data-gain-limit-pf="${gainLimit}" data-phase-limit-pf="${phaseLimit}" stroke-dasharray="3 5"`);
 b+=text(X(limit),610,`上限 ${limit.toFixed(4)} pF`,20,C.ink,'middle');
 b+=text(600,982,`未接探棒已用 25 pF；到較嚴的相位上限只剩 ${(limit-25).toFixed(4)} pF。`,22,C.ink,'middle');
 b+=text(600,1024,'淺藍：C₀；深藍：寄生；橘色：探棒。長條共用零點及每 pF 長度。',20,C.muted,'middle');
 b+=text(600,1068,'自設固定參數模型；不是實測、完整電路或容差保證。',20,C.muted,'middle');
 figures.push(['unit03-parasitic-budget.svg',wrap(id,1100,'寄生與探棒：同一節點的電容預算',
  `理想源經2千歐電阻驅動Vo，20皮法設計電容、5皮法寄生、可移除的10皮法探棒都對同一交流參考並聯。固定線性時不變模型，不是SAR取樣。1MHz要求振幅比至少0.95且落後不超過18度，總電容上限${limit}皮法由相位限制決定。20、25、35皮法依次為通過、通過、不通過，對應幅相0.9698388及負14.1078度、0.9540282及負17.4406度、0.9153748及負23.7410度。共同比例長條顯示未接探棒時只餘${limit-25}皮法。自設公式模型，非實測。`,b)]);
}
{
 const id='u03-supply-impedance',R=.02;
 const X=fMHz=>140+475*Math.log10(fMHz),Y=zMilli=>1015-185*Math.log10(zMilli/10);
 const impedance=(fHz,L)=>Math.hypot(R,2*Math.PI*fHz*L)*1e3;
 let b=badge(56,108,'1')+text(87,116,'負載電流擾動：先定義路徑與壓降方向');
 b+=dot(110,245,33,C.white,`stroke="${C.outline}" stroke-width="2"`)+text(110,239,'+',22,C.ink,'middle')+text(110,264,'−',22,C.ink,'middle');
 b+=line(110,212,110,180)+line(110,180,250,180)+rect(250,157,150,46,C.neutral)+text(325,187,'R',22,C.ink,'middle');
 b+=text(325,148,'20 mΩ',20,C.muted,'middle')+line(400,180,470,180);
 b+=`<path d="M 470 180 Q 489 140 508 180 Q 527 140 546 180 Q 565 140 584 180 Q 603 140 622 180" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
 b+=text(546,137,'L_loop',22,C.ink,'middle')+line(622,180,900,180)+dot(900,180);
 b+=arrow(700,180,805,180,C.blueLine)+text(753,155,'I：源 → 負載',20,C.blueLine,'middle');
 b+=line(900,180,900,232)+dot(900,267,35,C.white,`stroke="${C.outline}" stroke-width="2"`)+arrow(900,245,900,288)+line(900,302,900,350);
 b+=line(900,350,110,350)+line(110,350,110,278)+ground(110,350);
 b+=text(165,249,'理想固定供電',20)+text(165,281,'交流擾動 δVs = 0',20,C.muted);
 b+=text(950,255,'負載電流')+text(950,285,'擾動 I')+text(950,329,'共同回流',20,C.muted);
 b+=text(510,247,'路徑壓降：Vdrop = ZI',22,C.ink,'middle')+text(510,281,'左端為＋，右端為−',20,C.muted,'middle');
 b+=text(900,409,'負載電壓擾動 δVload = −ZI',22,C.ink,'end')+text(70,409,'L_loop 包含去程與回程',20,C.muted);
 b+=line(38,438,1162,438,C.rule)+badge(56,476,'2')+text(87,484,'單頻規格給出阻抗門檻；高頻還要看迴路電感');
 b+=text(70,526,'I_rms = 0.1 A，V_ripple,rms ≤ 5 mV → |Z| ≤ 50 mΩ');
 b+=line(70,560,125,560,C.blueLine)+text(140,568,'L_loop = 1 nH',20);
 b+=line(570,560,625,560,C.accentLine,'stroke-dasharray="8 6"')+text(640,568,'L_loop = 0.5 nH',20);
 b+=text(140,610,'|Z|（mΩ；對數刻度）',20,C.muted);
 for(const f of [1,2,5,10,20,50,100])b+=line(num(X(f)),645,num(X(f)),1015,C.rule,'shape-rendering="crispEdges"')+text(X(f),1049,String(f),20,C.muted,'middle');
 for(const z of [10,20,50,100,200,500,1000]){
  b+=line(140,num(Y(z)),1090,num(Y(z)),z===50?C.ink:C.rule,z===50?'id="impedance-limit" data-impedance-mohm="50" stroke-dasharray="3 5"':'shape-rendering="crispEdges"');
  b+=text(120,Y(z)+7,String(z),20,C.muted,'end');
 }
 b+=line(140,645,140,1015)+line(140,1015,1090,1015)+text(1090,1085,'f（MHz；對數刻度）',20,C.muted,'end');
 for(const [key,L,color,dash] of [['1nh',1e-9,C.blueLine,''],['05nh',.5e-9,C.accentLine,'stroke-dasharray="8 6"']]){
  const points=Array.from({length:201},(_,i)=>{const fHz=1e6*10**(i/100);return `${num(X(fHz/1e6))},${num(Y(impedance(fHz,L)))}`;}).join(' ');
  b+=`<polyline id="impedance-${key}" data-resistance-ohm="${R}" data-inductance-h="${L}" data-samples="201" data-frequency-min-hz="1000000" data-frequency-max-hz="100000000" fill="none" stroke="${color}" stroke-width="3" points="${points}" ${dash}/>`;
  const z=impedance(1e7,L);
  b+=dot(num(X(10)),num(Y(z)),6,color,`id="impedance-${key}-10mhz" data-frequency-hz="10000000" data-impedance-mohm="${z}"`);
 }
 b+=text(160,Y(50)-13,'50 mΩ 門檻',20,C.ink);
 b+=line(num(X(10)-7),num(Y(impedance(1e7,1e-9))-7),600,750,C.blueLine)+text(420,735,'10 MHz：65.9382 mΩ',20,C.blueLine);
 b+=line(num(X(10)+7),num(Y(impedance(1e7,.5e-9))+7),720,975,C.accentLine)+text(730,983,'10 MHz：37.2419 mΩ',20,C.accentLine);
 b+=text(600,1125,'|Z| = √(R² + (2πfL_loop)²)；兩條曲線是自設公式計算。',22,C.ink,'middle');
 b+=text(600,1165,'未含去耦、VRM 動態與分布參數；不是完整 PDN、實測或多音峰值保證。',20,C.muted,'middle');
 figures.push(['unit03-supply-impedance.svg',wrap(id,1195,'供電路徑：電感會改變單頻漣波判斷',
  '理想供電的交流擾動為零，經20毫歐等效電阻與迴路電感連到負載電流擾動；L包含去程與回程，不只是單一導線。電流參考從源至負載，左正右負的路徑壓降等於ZI，負載電壓擾動為負ZI。下圖雙對數座標，頻率1至100MHz、阻抗10至1000毫歐；電感1及0.5奈亨各201點按sqrt(R²+(2πfL)²)計算。10MHz阻抗分別65.938166和37.241918毫歐；0.1安培有效值與5毫伏有效值漣波給50毫歐門檻。未含去耦、VRM動態或分布參數；不是完整PDN、實測或多音峰值保證。',b)]);
}
for(const [name,svg] of figures)await writeFile(new URL(`assets/figures/${name}`,root),svg);
console.log(JSON.stringify({figures:figures.map(([name])=>name)}));
