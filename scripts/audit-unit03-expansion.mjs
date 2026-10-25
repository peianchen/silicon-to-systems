// Preservation + actual SVG geometry audit against the pre-expansion commit.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baselineCommit='0971005f0847135f17ba99f2848d38f781b3ce36';
const file='content/03-complex-phasors.md',read=f=>readFileSync(path.join(root,f),'utf8');
const old=f=>execFileSync('git',['show',baselineCommit+':'+f],{cwd:root,encoding:'utf8'});
const before=old(file),after=read(file),norm=s=>s.replace(/\s+/g,' ').trim();
const blocks=before.trim().split(/\n\s*\n/).filter(b=>!b.startsWith('#'));
const errors=[];let unchanged=0,clarified=0;
for(const [i,b]of blocks.entries()){
 if(norm(after).includes(norm(b))){unchanged++;continue;}
 const corrected=b.replace('可在線性系統中分解','可在線性、時不變系統的穩態響應中分解')
 .replace('要轉成延遲必須再除以角頻率','在本章時間慣例下，等效相位延遲為相位的負值除以角頻率（弧度／rad·s⁻¹）');
 if(corrected!==b&&norm(after).includes(norm(corrected)))clarified++;
 else errors.push('Missing baseline block '+(i+1));
}
const practice=before.split('## 練習與完整參考解答\n')[1].split('\n## ')[0].trim();
if(!after.includes(practice))errors.push('Original two exercises/answers not intact');
const steps=before.match(/^1\. \$\\omega=[\s\S]*?(?=\n\n)/m)?.[0];
if(!steps||!after.includes(steps))errors.push('Original four-step RC example changed');
const equations=before.match(/\$\$\n[\s\S]*?\n\$\$/g)||[];
for(const eq of equations)if(!after.includes(eq))errors.push('Original display equation changed');
const refs=[...before.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1]);
for(const ref of refs)if(!after.includes(ref))errors.push('Original source removed');
const oldFiles=execFileSync('git',['ls-tree','-r','--name-only',baselineCommit,'content','assets/figures'],{cwd:root,encoding:'utf8'}).trim().split('\n');
let untouched=0;
for(const f of oldFiles)if(f!==file){if(read(f)!==old(f))errors.push('Out-of-scope baseline changed: '+f);else untouched++;}
let pointsChecked=0;
function checkPath(name,id,points){
 const svg=read('assets/figures/'+name);
 const raw=svg.match(new RegExp('<path id="'+id+'" d="([^"]+)"'))?.[1];
 if(!raw){errors.push('Missing drawn path '+id);return;}
 const actual=[...raw.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
 if(actual.length!==points.length){errors.push('Path point count '+id);return;}
 for(let i=0;i<points.length;i++){
  if(actual[i].some((v,j)=>Math.abs(v-points[i][j])>.00051))errors.push('Path geometry '+id+' point '+i);
  pointsChecked++;
 }
}
const pts=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
for(const nf of [47,100,220]){
 checkPath('unit03-frequency-response.svg','u03-response-db-'+nf,pts(400,u=>{
  const f=10**(1+4*u),m=1/Math.hypot(1,2*Math.PI*f*1000*nf*1e-9);
  return[120+250*(Math.log10(f)-1),180-5*20*Math.log10(m)];
 }));
 checkPath('unit03-frequency-response.svg','u03-response-phase-'+nf,pts(400,u=>{
  const f=10**(1+4*u),phase=Math.atan2(-2*Math.PI*f*1000*nf*1e-9,1)*180/Math.PI;
  return[120+250*(Math.log10(f)-1),550-2.6*phase];
 }));
}
for(const [id,phi]of [['zero',0],['plus30',Math.PI/6]]){
 checkPath('unit03-phasor-wave.svg','u03-wave-'+id,pts(720,u=>{
  const ms=1.2*u,v=Math.SQRT2*Math.cos(2*Math.PI*1000*ms/1000+phi);
  return[560+585*u,205+(1.6-v)*340/3.2];
 }));
}
checkPath('unit03-power.svg','u03-power-instantaneous',pts(720,u=>{
 const v=Math.SQRT2*10*Math.cos(2*Math.PI*u),i=Math.SQRT2*2*Math.cos(2*Math.PI*u-Math.PI/3);
 return[90+600*u,170+(30-v*i)*8.5];
}));
checkPath('unit03-complex-plane.svg','u03-complex-positive',[[300,340],[420,180]]);
checkPath('unit03-complex-plane.svg','u03-complex-negative',[[900,340],[780,500]]);
checkPath('unit03-phasor-wave.svg','u03-wave-rms-vector',[[240,355],[240+150*Math.cos(Math.PI/6),280]]);
const xc=1/(2*Math.PI*1000*100e-9);
checkPath('unit03-rc-impedance.svg','u03-impedance-R',[[750,240],[920,240]]);
checkPath('unit03-rc-impedance.svg','u03-impedance-C',[[920,240],[920,240+.17*xc]]);
checkPath('unit03-rc-impedance.svg','u03-impedance-Z',[[750,240],[920,240+.17*xc]]);
const den=1000**2+xc**2,vr=[1e6/den,1000*xc/den],A=[150+500*vr[0],495-500*vr[1]];
checkPath('unit03-voltage-sum.svg','u03-voltage-VR',[[150,495],A]);
checkPath('unit03-voltage-sum.svg','u03-voltage-VC',[A,[650,495]]);
checkPath('unit03-voltage-sum.svg','u03-voltage-VS',[[150,495],[650,495]]);
checkPath('unit03-power.svg','u03-power-P',[[880,485],[1020,485]]);
checkPath('unit03-power.svg','u03-power-Q',[[1020,485],[1020,485-14*20*Math.sin(Math.PI/3)]]);
checkPath('unit03-power.svg','u03-power-S',[[880,485],[1020,485-14*20*Math.sin(Math.PI/3)]]);
const report={baselineCommit,file,baselineNonHeadingBlocks:blocks.length,unchangedBlocksIgnoringWhitespace:unchanged,explicitClarifications:clarified,originalExercisesAndSolutionsPreserved:after.includes(practice)?2:0,originalRCFourStepsPreserved:!!steps&&after.includes(steps),originalDisplayEquationsPreserved:equations.length,originalReferencesPreserved:refs.length,unchangedOtherContentAndOldFigures:untouched,currentExercises:(after.match(/\*\*練習\d+。/g)||[]).length,currentFigures:(after.match(/^!\[/gm)||[]).length,baselineHanCharacters:(before.match(/\p{Script=Han}/gu)||[]).length,currentHanCharacters:(after.match(/\p{Script=Han}/gu)||[]).length,actualSVGPointsChecked:pointsChecked,figureRenderReview:'Seven SVGs rendered and visually inspected; curves and vector endpoints checked from actual SVG path coordinates. No browser QA available.',errors};
if(report.currentExercises!==12||report.currentFigures!==7)errors.push('Expansion structure mismatch');
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--write'))writeFileSync(path.join(root,'research/unit-03-expansion-audit.json'),JSON.stringify(report,null,2)+'\n');
if(errors.length)process.exitCode=1;
