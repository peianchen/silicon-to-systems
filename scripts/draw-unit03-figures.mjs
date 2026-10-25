// Original, formula-driven figures for chapter 03. Run from the repository root.
import {writeFile} from 'node:fs/promises';
const C={ink:'#2e3d59',muted:'#536781',rule:'#c5cfdd',blue:'#4c6d96',orange:'#b56b28',blueFill:'#c4d5e7',orangeFill:'#edaa60',white:'#ffffff'};
const n=v=>Number(v.toFixed(3)),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const t=(x,y,s,size=22,col=C.ink,anchor='start')=>'<text x="'+n(x)+'" y="'+n(y)+'" font-size="'+size+'" fill="'+col+'" text-anchor="'+anchor+'">'+esc(s)+'</text>';
const l=(x,y,X,Y,col=C.rule,w=1.5,extra='')=>'<line x1="'+n(x)+'" y1="'+n(y)+'" x2="'+n(X)+'" y2="'+n(Y)+'" stroke="'+col+'" stroke-width="'+w+'" '+extra+'/>';
const d=points=>points.map(([x,y],i)=>(i?'L':'M')+n(x)+','+n(y)).join(' ');
const path=(id,points,col=C.blue,extra='')=>'<path id="'+id+'" d="'+d(points)+'" fill="none" stroke="'+col+'" stroke-width="2.6" '+extra+'/>';
const circ=(x,y,r=4,col=C.ink)=>'<circle cx="'+n(x)+'" cy="'+n(y)+'" r="'+r+'" fill="'+col+'"/>';
const sample=(count,fn)=>Array.from({length:count+1},(_,i)=>fn(i/count));
const arc=(x,y,r,a)=>sample(60,u=>[x+r*Math.cos(a*u),y-r*Math.sin(a*u)]);
const arrow=(id,col='blue')=>'marker-end="url(#'+id+'-'+col+')"';
function svg(id,height,title,desc,body){
 return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="'+height+'" viewBox="0 0 1200 '+height+'" role="img" aria-labelledby="'+id+'-title '+id+'-desc" data-figure-style="sts-flat-v1"><title id="'+id+'-title">'+esc(title)+'</title><desc id="'+id+'-desc">'+esc(desc)+'</desc><defs>'+
 ['ink','blue','orange'].map(k=>'<marker id="'+id+'-'+k+'" viewBox="0 0 12 12" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse"><path d="M1,1 L11,6 L1,11 Z" fill="'+C[k]+'"/></marker>').join('')+
 '</defs><style>text{font-family:"Noto Sans CJK TC","Noto Sans CJK SC","DejaVu Sans",sans-serif;font-variant-numeric:tabular-nums}line,path{stroke-linecap:round;stroke-linejoin:round}</style><rect width="1200" height="'+height+'" fill="'+C.white+'"/>'+t(40,44,title,25)+body+'</svg>\n';
}
const figs={};
// 3-1: two complex planes with identical metric.
{
 const id='u03-complex';
 let b=l(600,90,600,635);
 for(const [cx,a,im,key] of [[300,3,4,'positive'],[900,-3,-4,'negative']]){
  const cy=340,s=40,px=cx+a*s,py=cy-im*s,theta=Math.atan2(im,a);
  b+=t(cx,98,a>0?'① 第一象限':'② 第三象限',22,C.ink,'middle');
  b+=l(cx-200,cy,cx+200,cy,C.ink)+l(cx,cy-200,cx,cy+200,C.ink);
  for(const v of [-4,-2,2,4]){
   b+=l(cx+v*s,cy-5,cx+v*s,cy+5,C.ink)+t(cx+v*s,cy+28,v,20,C.muted,'middle');
   b+=l(cx-5,cy-v*s,cx+5,cy-v*s,C.ink)+t(cx-15,cy-v*s+7,v,20,C.muted,'end');
  }
  b+=t(cx+212,cy+8,'Re')+t(cx+12,cy-215,'Im')+t(cx-12,cy+27,'0',20,C.muted,'end');
  b+=l(px,cy,px,py,C.blue,1.5,'stroke-dasharray="7 6"')+l(cx,py,px,py,C.blue,1.5,'stroke-dasharray="7 6"');
  b+=path(id+'-'+key,[[cx,cy],[px,py]],C.blue,arrow(id))+circ(px,py);
  b+=path(id+'-angle-'+key,arc(cx,cy,64,theta),C.orange);
  b+=t(a>0?px+14:px-15,a>0?py-12:py+35,a>0?'3 + j4':'−3 − j4',22,C.blue,a>0?'start':'end');
  b+=t(cx+75,a>0?cy-35:cy+90,a>0?'53.13°':'−126.87°',22,C.orange);
  b+=t(cx,592,a>0?'z = 5∠53.13°':'z = 5∠−126.87°',22,C.blue,'middle');
  b+=t(cx,626,'|z| = 5；實、虛軸同尺度',20,C.muted,'middle');
 }
 figs['unit03-complex-plane.svg']=svg(id,660,'複數的長度與角度：象限不能省略','無因次複數座標，每單位40像素。左3+j4，右−3−j4，大小皆5，主值角分別53.13度與−126.87度。虛線是分量投影；兩軸同尺度。',b);
}
// 3-2: RMS vector and instantaneous voltage waveforms.
{
 const id='u03-wave',cx=240,cy=355,s=150,phase=Math.PI/6,tip=[cx+s*Math.cos(phase),cy-s*Math.sin(phase)];
 const X=u=>560+585*u/1.2,Y=v=>205+(1.6-v)*340/3.2;
 let b=l(500,82,500,655)+t(40,98,'① 有效值相量')+t(560,98,'② 1 kHz 時間波形');
 b+='<circle cx="'+cx+'" cy="'+cy+'" r="'+s+'" fill="none" stroke="'+C.rule+'" stroke-dasharray="7 6"/>';
 b+=l(60,cy,420,cy,C.ink)+l(cx,175,cx,535,C.ink);
 for(const v of [-1,1]) b+=t(cx+v*s,cy+28,v,20,C.muted,'middle')+t(cx-15,cy-v*s+7,v,20,C.muted,'end');
 b+=t(430,cy+8,'Re')+t(cx+12,165,'Im')+t(cx-12,cy+27,'0',20,C.muted,'end');
 b+=path(id+'-rms-vector',[[cx,cy],tip],C.blue,arrow(id))+path(id+'-angle',arc(cx,cy,60,phase),C.orange);
 b+=t(315,345,'30°',22,C.orange)+t(330,248,'1 V RMS',20,C.blue);
 b+=t(cx,579,'V = 1∠30° V RMS',22,C.blue,'middle')+t(cx,613,'固定相量：相位參考取 t = 0',20,C.muted,'middle')+t(cx,647,'左軸是 RMS；右軸是瞬時 V',20,C.muted,'middle');
 b+=l(560,126,602,126,C.blue,2.6)+t(615,133,'30° 實線',20,C.blue)+l(860,126,902,126,C.muted,2.6,'stroke-dasharray="8 6"')+t(915,133,'0° 參考虛線',20,C.muted);
 for(const v of [-1,0,1]) b+=l(X(0),Y(v),X(1.2),Y(v))+t(547,Y(v)+7,v,20,C.muted,'end');
 for(const u of [0,.3,.6,.9,1.2]) b+=l(X(u),205,X(u),545,C.rule,1.5,'stroke-dasharray="3 6"')+t(X(u),578,u.toFixed(1),20,C.muted,'middle');
 b+=l(560,205,560,545,C.ink)+l(560,545,1145,545,C.ink)+t(560,190,'v (V)',20)+t(1145,608,'t (ms)',20,C.ink,'end');
 b+=path(id+'-zero',sample(720,u=>[X(1.2*u),Y(Math.SQRT2*Math.cos(2*Math.PI*1.2*u))]),C.muted,'stroke-dasharray="8 6"');
 b+=path(id+'-plus30',sample(720,u=>[X(1.2*u),Y(Math.SQRT2*Math.cos(2*Math.PI*1.2*u+phase))]));
 for(const u of [11/12,1]) b+=l(X(u),180,X(u),Y(Math.SQRT2),C.orange,1.5,'stroke-dasharray="4 4"')+l(X(u),174,X(u),186,C.orange)+circ(X(u),Y(Math.SQRT2),4,C.orange);
 b+=l(X(11/12),180,X(1),180,C.orange)+t((X(11/12)+X(1))/2,161,'峰值提前 83.33 µs',20,C.orange,'middle');
 b+=t(560,608,'時域峰值 √2 V；RMS 值 1 V',20)+t(560,641,'v(t) = √2 cos(2π·1000t + 30°) V',20,C.blue)+t(560,675,'公式 t 使用秒；橫軸以 ms 表示。',20,C.muted);
 figs['unit03-phasor-wave.svg']=svg(id,710,'有效值相量與時間波形：不要混用峰值','左圖為固定RMS相量1∠30度，軸單位V RMS。右圖1kHz的零相位與30度正弦，瞬時峰值均為根號2 V。30度訊號在0.916667ms達峰，參考在1ms達峰，提前83.333us。由公式計算，非量測。',b);
}
// 3-3: instantaneous and complex power.
{
 const id='u03-power',X=u=>90+600*u,Y=p=>170+(30-p)*340/40,P=u=>20*(.5+Math.cos(4*Math.PI*u-Math.PI/3));
 let b=l(760,82,760,635)+t(90,98,'① 瞬時功率與週期平均')+t(90,133,'p(t) = 10 + 20 cos(4πt/T − 60°) W',20,C.blue)+t(800,98,'② 複功率三角形')+t(800,133,'電流落後電壓 60°',20,C.muted);
 for(const v of [-10,0,10,20,30]) b+=l(X(0),Y(v),X(1),Y(v),v===0?C.ink:C.rule)+t(75,Y(v)+7,v,20,C.muted,'end');
 for(const u of [0,.25,.5,.75,1]) b+=l(X(u),170,X(u),510,C.rule,1.5,'stroke-dasharray="3 6"')+t(X(u),544,u,20,C.muted,'middle');
 b+=l(90,170,90,510,C.ink)+l(90,510,690,510,C.ink)+t(90,157,'p (W)',20)+t(690,576,'t/T',20,C.ink,'end');
 for(const [i,a,z] of [[1,.25,5/12],[2,.75,11/12]]) b+='<path id="'+id+'-negative-'+i+'" d="'+d([[X(a),Y(0)],...sample(120,u=>{const q=a+(z-a)*u;return[X(q),Y(P(q))]}),[X(z),Y(0)]])+' Z" fill="'+C.orangeFill+'"/>';
 b+=l(X(0),Y(10),X(1),Y(10),C.muted,1.5,'stroke-dasharray="8 6"')+path(id+'-instantaneous',sample(720,u=>[X(u),Y(P(u))]));
 b+=l(400,153,435,153,C.muted,1.5,'stroke-dasharray="8 6"')+t(448,160,'平均 P = 10 W',20,C.muted);
 const ox=880,oy=485,bx=1020,ty=oy-14*10*Math.sqrt(3);
 b+=path(id+'-P',[[ox,oy],[bx,oy]])+path(id+'-Q',[[bx,oy],[bx,ty]],C.orange)+path(id+'-S',[[ox,oy],[bx,ty]]);
 b+=path(id+'-angle',arc(ox,oy,58,Math.PI/3),C.orange)+t(914,457,'60°',20,C.orange);
 b+=t(950,525,'P = 10 W',22,C.blue,'middle')+t(1042,335,'Q = 17.32',22,C.orange)+t(1042,365,'var',20,C.orange)+t(805,285,'|S| = 20 VA',22,C.blue);
 b+=t(90,602,'橘色區 p < 0：能量由負載返回來源。',20,C.muted)+t(90,634,'T 為電壓／電流週期；曲線非量測。',20,C.muted);
 b+=t(800,580,'P（W）、Q（var）、|S|（VA）',20)+t(800,612,'10 V RMS × 2 A RMS',20,C.muted)+t(800,644,'採被動符號慣例',20,C.muted);
 figs['unit03-power.svg']=svg(id,680,'瞬時功率可為負，平均有功功率仍為正','正弦10Vrms與2Arms，電流落後60度。瞬時功率−10至30W，平均10W，一個電壓週期內有兩個功率週期；陰影是能量返回區間。複功率P10W Q17.3205var |S|20VA。解析計算非量測。',b);
}
const rh=(x,y,w=100)=>'<rect x="'+x+'" y="'+(y-18)+'" width="'+w+'" height="36" fill="'+C.blueFill+'" stroke="'+C.ink+'" stroke-width="2.5"/>';
const rv=(x,y,h=72)=>'<rect x="'+(x-18)+'" y="'+y+'" width="36" height="'+h+'" fill="'+C.blueFill+'" stroke="'+C.ink+'" stroke-width="2.5"/>';
const cap=(x,y)=>l(x-25,y,x+25,y,C.ink,2.5)+l(x-25,y+26,x+25,y+26,C.ink,2.5);
const src=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="37" fill="'+C.white+'" stroke="'+C.ink+'" stroke-width="2.5"/>'+t(x,y-11,'+',22,C.ink,'middle')+t(x,y+24,'−',22,C.ink,'middle');
const gnd=(x,y)=>l(x,y,x,y+12,C.ink,2)+l(x-18,y+12,x+18,y+12,C.ink,2)+l(x-12,y+20,x+12,y+20,C.ink,2)+l(x-6,y+28,x+6,y+28,C.ink,2);
// 3-4: topology and metric impedance triangle.
{
 const id='u03-impedance',xo=750,yo=240,s=.17,xc=1/(2*Math.PI*1000*100e-9),xe=920,ye=yo+xc*s;
 let b=t(40,82,'理想正弦穩態；同頻率、RMS 慣例。左側電路非比例，右側兩軸等尺度。',20,C.muted)+l(600,112,600,650);
 b+=t(65,150,'① 串聯 RC，輸出取電容')+t(650,150,'② Z = R + Z_C');
 b+=l(125,230,220,230,C.ink,2.5)+rh(220,230,110)+l(330,230,465,230,C.ink,2.5)+l(125,230,125,328,C.ink,2.5)+src(125,365)+l(125,402,125,500,C.ink,2.5)+l(125,500,465,500,C.ink,2.5)+l(465,230,465,365,C.ink,2.5)+cap(465,365)+l(465,391,465,500,C.ink,2.5)+gnd(275,500);
 b+=t(275,194,'R = 1 kΩ',22,C.ink,'middle')+t(293,385,'C = 100 nF')+t(72,307,'V_s')+l(355,195,430,195,C.blue,2.6,arrow(id))+t(392,180,'I',22,C.blue,'middle');
 b+=t(512,257,'+',22,C.orange,'middle')+t(518,340,'V_C',22,C.orange,'middle')+t(512,506,'−',22,C.orange,'middle');
 b+=t(70,572,'V_s = 1∠0° V RMS')+t(70,611,'f = 1 kHz；V_out = V_C');
 b+=l(700,yo,1115,yo)+l(xo,570,xo,180)+t(1115,282,'Re Z（Ω）',20,C.muted,'end')+t(765,182,'Im Z（Ω）',20,C.muted)+t(734,268,'0',20,C.muted,'end')+l(744,410,756,410)+t(732,417,'−1000',20,C.muted,'end');
 b+=path(id+'-R',[[xo,yo],[xe,yo]],C.blue,arrow(id))+path(id+'-C',[[xe,yo],[xe,ye]],C.orange,arrow(id,'orange'))+path(id+'-Z',[[xo,yo],[xe,ye]],C.ink,arrow(id,'ink'));
 b+=path(id+'-angle',arc(xo,yo,38,-Math.atan(xc/1000)),C.orange)+t(835,212,'R = 1000 Ω',22,C.blue,'middle')+t(944,389,'−j1591.55 Ω',22,C.orange)+t(800,303,'−57.86°')+t(1130,560,'Z = 1000 − j1591.55 Ω',22,C.ink,'end')+t(900,609,'|Z| = 1879.64 Ω',22,C.ink,'middle');
 b+=t(40,695,'I = V_s/Z = 0.5320∠+57.86° mA RMS；電流超前電源電壓。',20)+t(40,735,'阻抗圖由計算值繪製；負虛部不代表負電阻或平均能量產生。',20,C.muted);
 figs['unit03-rc-impedance.svg']=svg(id,775,'先定義電路，再把阻抗放到複數平面','理想1Vrms 1kHz源驅動1kΩ與100nF串聯。電流流經R進入電容上端，輸出上正下負。阻抗實部1000虛部−1591.549，兩軸每Ω0.17px，合成角−57.858度。',b);
}
// 3-5: voltage polygon, evaluated without rounded inputs.
{
 const id='u03-voltage',x=2*Math.PI*1000*1000*100e-9,vr=[x*x/(1+x*x),x/(1+x*x)],ox=150,oy=495,s=500,A=[ox+s*vr[0],oy-s*vr[1]],B=[ox+s,oy];
 let b=t(40,82,'1 V RMS、1 kHz、1 kΩ、100 nF；所有電壓用同一個相位參考。',20,C.muted)+l(805,110,805,675);
 for(const v of [.25,.5,.75,1]) b+=l(ox+s*v,190,ox+s*v,oy)+t(ox+s*v,oy+32,v,20,C.muted,'middle');
 for(const v of [.25,.5]) b+=l(ox,oy-s*v,720,oy-s*v)+t(133,oy-s*v+7,v,20,C.muted,'end');
 b+=l(80,oy,745,oy,C.ink)+l(ox,580,ox,172,C.ink)+t(76,153,'Im V（V）',20,C.muted)+t(740,607,'Re V（V）',20,C.muted,'end')+t(133,oy+28,'0',20,C.muted,'end');
 b+=path(id+'-VR',[[ox,oy],A],C.blue,arrow(id))+path(id+'-VC',[A,B],C.orange,arrow(id,'orange'))+path(id+'-VS',[[ox,oy],B],C.ink,arrow(id,'ink'));
 b+=t(302,226,'(0.283043, +0.450477) V',20)+t(185,350,'V_R',22,C.blue)+t(496,355,'V_C',22,C.orange)+t(430,463,'V_s = 1∠0° V',22,C.ink,'middle')+t(650,566,'(1, 0) V',20,C.ink,'middle')+t(65,649,'實部與虛部的伏特刻度相同。',20,C.muted);
 b+=t(835,151,'同頻率、RMS 相量')+t(835,203,'|V_R| = 0.5320 V',22,C.blue)+t(835,240,'∠V_R = +57.86°',22,C.blue)+t(835,298,'|V_C| = 0.8467 V',22,C.orange)+t(835,335,'∠V_C = −32.14°',22,C.orange);
 b+=t(835,395,'V_R + V_C = V_s')+t(835,438,'實部：0.283043 + 0.716957',20)+t(835,470,'虛部：0.450477 − 0.450477',20)+t(835,510,'得到 1 + j0 V。',20);
 b+=t(835,584,'0.5320 + 0.8467 ≠ 1',20,C.orange)+t(835,624,'大小相加不是 KVL。',20,C.orange);
 b+=t(40,723,'橘色 V_C 從藍色 V_R 終點接出；向量平移不改變方向與大小。',20)+t(40,763,'圖形由複數分量計算，非實測；合向量的虛部為零。',20,C.muted);
 figs['unit03-voltage-sum.svg']=svg(id,800,'KVL 相加的是電壓相量，不是電壓大小','兩軸每V500像素。VR自原點到(0.283043,0.450477)，VC再接至(1,0)，相加為電源電壓。相量大小0.532018與0.846733不能直接相加。計算圖非實測。',b);
}
// 3-6: exact model curves; two specification points, not band masks.
{
 const id='u03-response',X=f=>120+1000*(Math.log10(f)-1)/4,Ydb=db=>180-db*5,Yph=ph=>550-ph*2.6;
 let b=t(40,82,'固定 R = 1 kΩ；理想無負載模型。曲線為標稱計算，不是實測或容差區間。',20,C.muted);
 const series=[[47,C.orange,'8 6'],[100,C.blue,''],[220,C.ink,'3 5']];
 for(const [i,[nf,col,dash]] of series.entries()){
  const xx=150+i*340;
  b+=l(xx,125,xx+52,125,col,2.6,dash?'stroke-dasharray="'+dash+'"':'')+t(xx+65,132,'C = '+nf+' nF',20,col);
 }
 for(const f of [10,100,1000,10000,100000]){
  b+=l(X(f),180,X(f),430)+l(X(f),550,X(f),784);
  b+=t(X(f),466,f>=1000?(f/1000)+'k':f,20,C.muted,'middle')+t(X(f),819,f>=1000?(f/1000)+'k':f,20,C.muted,'middle');
 }
 for(const db of [0,-10,-20,-30,-40,-50]) b+=l(120,Ydb(db),1120,Ydb(db))+t(103,Ydb(db)+7,db,20,C.muted,'end');
 for(const ph of [0,-30,-60,-90]) b+=l(120,Yph(ph),1120,Yph(ph))+t(103,Yph(ph)+7,ph,20,C.muted,'end');
 b+=l(120,180,120,430,C.ink)+l(120,430,1120,430,C.ink)+l(120,550,120,784,C.ink)+l(120,784,1120,784,C.ink);
 b+=t(120,165,'電壓增益（dB）',20)+t(120,533,'相位（°）',20)+t(1120,496,'f (Hz)，對數軸',20,C.ink,'end')+t(1120,852,'f (Hz)，對數軸',20,C.ink,'end');
 for(const [nf,col,dash] of series){
  const extra=dash?'stroke-dasharray="'+dash+'"':'';
  b+=path(id+'-db-'+nf,sample(400,u=>{const f=10**(1+4*u),x=2*Math.PI*f*1000*nf*1e-9;return[X(f),Ydb(-10*Math.log10(1+x*x))]}),col,extra);
  b+=path(id+'-phase-'+nf,sample(400,u=>{const f=10**(1+4*u),x=2*Math.PI*f*1000*nf*1e-9;return[X(f),Yph(-Math.atan(x)*180/Math.PI)]}),col,extra);
 }
 for(const [f,h] of [[1000,.8],[10000,.2]]){
  const xx=X(f),yy=Ydb(20*Math.log10(h));
  b+='<rect x="'+n(xx-5)+'" y="'+n(yy-5)+'" width="10" height="10" fill="'+C.white+'" stroke="'+C.ink+'" stroke-width="2"/>';
 }
 b+=t(160,330,'□ 1 kHz：≥ 0.80（−1.94 dB）',20);
 b+=t(160,372,'□ 10 kHz：≤ 0.20（−13.98 dB）',20);
 b+=t(40,900,'□ 為兩個規格點，不表示整個頻帶已驗收；不同 C 同時改變振幅與相位。',20,C.muted);
 figs['unit03-frequency-response.svg']=svg(id,935,'三顆候選電容：保留訊號與抑制干擾的取捨','R固定1kΩ，C47、100、220nF分別採橘長虛線、藍實線、深色短虛線。橫軸10至100000Hz對數軸，上圖20log10|H|下圖argH。H=1/(1+j2πfRC)。方形標記只定義1kHz增益至少0.8與10kHz至多0.2。解析標稱值非實測。',b);
}
// 3-7: source/load topology, optional probe as a separate branch.
{
 const id='u03-load';
 let b=t(40,82,'各電壓對下方參考回路定義；電路拓撲示意，不按實體尺寸。',20,C.muted);
 b+=t(60,136,'① 理想源、無額外負載');
 b+=l(140,200,390,200,C.ink,2.5)+rh(390,200,140)+l(530,200,775,200,C.ink,2.5)+l(140,200,140,248,C.ink,2.5)+src(140,285)+l(140,322,140,375,C.ink,2.5)+l(140,375,775,375,C.ink,2.5)+l(775,200,775,260,C.ink,2.5)+cap(775,260)+l(775,286,775,375,C.ink,2.5)+gnd(500,375);
 b+=circ(290,200)+t(290,176,'V_i = V_s',22,C.blue,'middle')+t(460,176,'R',22,C.ink,'middle')+t(87,248,'V_s')+t(810,242,'+',22,C.orange)+t(810,290,'V_o',22,C.orange)+t(810,378,'−',22,C.orange)+t(720,280,'C');
 b+=t(950,222,'R_s = 0')+t(950,264,'R_L → ∞')+t(950,306,'未接探棒');
 b+=t(60,433,'V_o/V_i = V_o/V_s = 1/(1 + jωRC)',20)+l(40,469,1160,469);
 b+=t(60,515,'② 加入源阻抗、接收端負載及可選的探棒支路');
 b+=l(130,580,230,580,C.ink,2.5)+rh(230,580,92)+l(322,580,495,580,C.ink,2.5)+rh(495,580,100)+l(595,580,1065,580,C.ink,2.5)+l(130,580,130,648,C.ink,2.5)+src(130,685)+l(130,722,130,790,C.ink,2.5)+l(130,790,1065,790,C.ink,2.5);
 b+=l(715,580,715,680,C.ink,2.5)+cap(715,680)+l(715,706,715,790,C.ink,2.5)+l(890,580,890,649,C.ink,2.5)+rv(890,649)+l(890,721,890,790,C.ink,2.5);
 b+=l(1065,580,1065,620,C.muted,2,'stroke-dasharray="7 5"')+'<rect x="999" y="620" width="132" height="150" fill="'+C.white+'" stroke="'+C.muted+'" stroke-dasharray="7 5"/>'+l(1065,770,1065,790,C.muted,2,'stroke-dasharray="7 5"');
 b+=t(1065,660,'探棒',22,C.muted,'middle')+t(1065,706,'R_p ∥ C_p',20,C.muted,'middle')+t(1065,747,'可選支路',20,C.muted,'middle');
 for(const xx of [400,715,890,1065]) b+=circ(xx,580);
 for(const xx of [715,890,1065]) b+=circ(xx,790);
 b+=t(276,556,'R_s',22,C.ink,'middle')+t(400,556,'V_i',22,C.blue,'middle')+t(545,556,'R',22,C.ink,'middle')+t(715,556,'V_o',22,C.orange,'middle')+t(78,644,'V_s')+t(662,697,'C')+t(925,695,'R_L')+t(754,616,'+',22,C.orange)+t(754,793,'−',22,C.orange)+gnd(400,790);
 b+=t(60,858,'未接探棒：Z_p = (1/R_L + jωC)⁻¹；接探棒後再加入其並聯導納。',20);
 b+=t(60,899,'V_o/V_i = Z_p/(R + Z_p)；V_o/V_s = Z_p/(R_s + R + Z_p)。',20);
 b+=t(40,960,'V_s 是源內部等效電壓；V_i 是實際輸入端。先定義增益分母，再比較數字。',20);
 b+=t(40,1002,'探棒的有限電阻與電容也會改變電路；高輸入電阻不代表高頻零負載。',20,C.muted);
 figs['unit03-source-load.svg']=svg(id,1040,'增益的分母在哪裡？分清源、輸入端與負載','上圖理想源直接串R，輸出對回路為C。下圖Vs先串Rs至Vi，再串R至Vo；Vo並聯C與RL，虛線示可選探棒Rp並Cp。電壓對同一回路定義；有Rs時Vo/Vi與Vo/Vs不同。',b);
}
for(const [name,body] of Object.entries(figs)) await writeFile(new URL('../assets/figures/'+name,import.meta.url),body);
console.log('Generated '+Object.keys(figs).length+' original sts-flat-v1 chapter 03 SVG figures.');
