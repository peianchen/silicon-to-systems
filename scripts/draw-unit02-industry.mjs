// Original, inspectable vector diagrams. No external artwork is reused.
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const {colors:C}=JSON.parse(await readFile(new URL('research/figure-style.json',root),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=22,color=C.ink,anchor='start',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
const line=(x,y,X,Y,color=C.ink,extra='')=>`<line x1="${x}" y1="${y}" x2="${X}" y2="${Y}" stroke="${color}" stroke-width="2" ${extra}/>`;
const box=(x,y,w,h,fill=C.layer)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${C.outline}" stroke-width="2"/>`;
const dot=(x,y,r=4,fill=C.ink,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const badge=(x,y,n)=>dot(x,y,18,C.badge)+text(x,y+7,n,20,C.white,'middle','font-weight="700"');
const ground=(x,y)=>line(x,y,x,y+10)+line(x-18,y+10,x+18,y+10)+line(x-12,y+17,x+12,y+17)+line(x-6,y+24,x+6,y+24);
function wrap(id,height,title,desc,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" data-figure-style="sts-flat-v1">
<title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>
<style>text{font-family:"Noto Sans CJK TC","Noto Sans CJK SC","DejaVu Sans",sans-serif;font-variant-numeric:tabular-nums}</style>
<rect width="1200" height="${height}" fill="${C.white}"/>${text(38,44,title,25)}${line(38,65,1162,65,C.rule)}${body}</svg>\n`;}
const figures=[];
{
 const id='u02-acq-window';
 let b=badge(56,108,'1')+text(87,116,'有效追蹤期間：只取一個等效充電狀態');
 b+=dot(110,220,35,C.white,`stroke="${C.outline}" stroke-width="2"`)+text(110,228,'Vin',22,C.ink,'middle');
 b+=line(145,220,230,220)+box(230,195,180,50,C.silicon)+text(320,227,'R_eq',22,C.ink,'middle');
 b+=line(410,220,530,220)+dot(530,220)+line(530,220,610,220)+dot(610,220)+line(610,220,790,220)+dot(790,220);
 b+=text(570,183,'理想開關：追蹤時接通',20,C.muted,'middle');
 b+=line(790,220,1035,220)+text(1020,192,'保持節點 v_H',22,C.ink,'middle');
 b+=line(790,220,790,280)+line(750,280,830,280)+line(750,296,830,296)+line(790,296,790,330)+ground(790,330);
 b+=text(875,292,'C_H',22)+line(110,255,110,330)+ground(110,330);
 b+=text(320,280,'源與導通阻抗已含在 R_eq',20,C.muted,'middle');
 b+=text(600,390,'固定 R、C，輸入已到新值；忽略非線性與回擾。',20,C.muted,'middle');
 b+=line(38,415,1162,415,C.rule)+badge(56,455,'2')+text(87,463,'同一筆資料的事件順序（時間長度不按比例）');
 b+=box(140,510,560,70,C.layer)+box(700,510,420,70,C.accent);
 b+=text(420,540,'有效追蹤／充電',22,C.ink,'middle')+text(420,568,'t_acq',20,C.muted,'middle');
 b+=text(910,540,'保持／轉換',22,C.ink,'middle')+text(910,568,'不補回已結束的追蹤時間',20,C.ink,'middle');
 b+=line(140,495,140,600,C.blueLine,'stroke-dasharray="5 5"')+line(700,490,700,610,C.accentLine,'stroke-dasharray="5 5"');
 b+=text(140,630,'有效建立開始',20,C.muted)+text(700,630,'此刻前檢查 E ≤ 1 mV',20,C.accentLine,'middle');
 b+=line(38,660,1162,660,C.rule)+badge(56,704,'3')+text(87,712,'同一個 10 位元示範：只分配建立項');
 for(const [x,w,heading,value,fill] of [[70,310,'輸入跨度','2.048 V',C.neutral],[445,310,'量化間隔 q','2 mV',C.layer],[820,310,'建立項允許差','q／2 = 1 mV',C.alertTint]]){
  b+=box(x,745,w,88,fill)+text(x+w/2,780,heading,22,C.ink,'middle')+text(x+w/2,814,value,22,C.ink,'middle');
 }
 b+=text(600,873,'自設模型；不是完整 ADC 準確度、實測結果或實際版圖。',20,C.muted,'middle');
 figures.push(['unit02-acquisition-window.svg',wrap(id,900,'取樣建立：先定義窗口，再判斷誤差',
  '原創單極點模型。輸入經含導通阻抗的等效電阻和理想開關充電保持電容。追蹤結束前檢查建立差，後面的保持轉換不算入追蹤窗。10位元、2.048伏跨度給2毫伏間隔，本例單獨將1毫伏分配給建立項。事件時間不按比例，非實際完整ADC。',b)]);
}
{
 const id='u02-acq-corners';
 let b=text(70,112,'同一初始差 2048 mV；只比較建立項',22);
 b+=line(70,153,130,153,C.blueLine)+text(145,161,'名目：2.5 kΩ × 20 pF = 50 ns',20);
 b+=line(70,193,130,193,C.accentLine,'stroke-dasharray="8 6"')+text(145,201,'可同時發生的上界：3 kΩ × 22 pF = 66 ns',20);
 const X=t=>140+t/600*950,Y=e=>720-(Math.log10(e)+2)/6*430;
 b+=text(140,259,'建立差 E（mV，對數刻度）',20,C.muted);
 for(const e of [.01,.1,1,10,100,1000,10000]){
  b+=line(140,Y(e),1090,Y(e),e===1?C.ink:C.rule,e===1?'stroke-dasharray="3 5"':'');
  b+=text(120,Y(e)+7,String(e),20,C.muted,'end');
 }
 for(const t of [0,100,200,300,400,500,600])b+=line(X(t),290,X(t),720,C.rule)+text(X(t),754,String(t),20,C.muted,'middle');
 b+=line(140,290,140,720)+line(140,720,1090,720)+text(1100,788,'t（ns）',20,C.muted,'end');
 for(const [key,tau,color,dash] of [['nominal',50,C.blueLine,''],['slow',66,C.accentLine,'stroke-dasharray="8 6"']]){
  const points=Array.from({length:121},(_,i)=>{const t=i*5;return `${X(t).toFixed(3)},${Y(2048*Math.exp(-t/tau)).toFixed(3)}`;}).join(' ');
  b+=`<polyline id="curve-${key}" data-tau-ns="${tau}" fill="none" stroke="${color}" stroke-width="3" points="${points}" ${dash}/>`;
 }
 b+=text(160,Y(1)-12,'1 mV 門檻',20,C.ink);
 for(const [key,t,tau,color] of [['nominal-400',400,50,C.blueLine],['slow-400',400,66,C.accentLine],['slow-550',550,66,C.accentLine]]){
  const e=2048*Math.exp(-t/tau);
  b+=dot(X(t).toFixed(3),Y(e).toFixed(3),6,color,`id="point-${key}" data-time-ns="${t}" data-error-mv="${e}"`);
 }
 b+=line(X(400),Y(2048*Math.exp(-400/66))-8,825,454,C.accentLine)+text(835,454,'400 ns：4.7780 mV',20,C.accentLine);
 b+=line(X(400),Y(2048*Math.exp(-400/50))+8,690,628,C.blueLine)+text(680,650,'400 ns：0.6870 mV',20,C.blueLine,'end');
 b+=line(X(550),Y(2048*Math.exp(-550/66))-8,1070,510,C.accentLine)+text(1080,498,'550 ns：0.4923 mV',20,C.accentLine,'end');
 b+=text(140,815,'同一橘色曲線：400 ns 不通過，550 ns 在給定模型內通過。',22);
 b+=text(140,857,'每個縱軸格為十倍；虛線不是統計帶，曲線不是量測資料。',20,C.muted);
 figures.push(['unit02-acquisition-corners.svg',wrap(id,890,'名目通過之後：參數上界還能通過嗎？',
  '線性橫軸0至600奈秒，對數縱軸0.01至10000毫伏。兩曲線為2048exp負t除以tau，tau為50和66奈秒。1毫伏門檻下，400奈秒名目0.687027毫伏通過，最慢4.777956毫伏不通過；550奈秒最慢0.492277毫伏通過。全部為自設單極點模型，非實測或良率分布。',b)]);
}
for(const [name,svg] of figures)await writeFile(new URL(`assets/figures/${name}`,root),svg);
console.log(JSON.stringify({figures:figures.map(([name])=>name)}));
