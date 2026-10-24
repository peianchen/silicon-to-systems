// Additive professional-edit audit against the published transition revision.
// Run from any working directory. Writes nothing; stdout is the auditable report.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baselineCommit='6248e79f3cf9d8d2e71d56194cb54b1b19a7553c';
const oldFile=f=>execFileSync('git',['show',baselineCommit+':'+f],{cwd:root});
const read=f=>readFileSync(path.join(root,f),'utf8');
const section=(s,h)=>s.split('## '+h+'\n')[1]?.split('\n## ')[0].trim();
const errors=[],chapters=[];
const check=(test,message)=>{if(!test)errors.push(message);};
for(const [file,practice,expectedFigures] of [
  ['content/01-engineering-map.md','練習與參考解答',8],
  ['content/02-engineering-mathematics.md','練習與完整參考解答',7]
]){
  const before=oldFile(file).toString('utf8'),after=read(file);
  const blocks=before.trim().split(/\n\s*\n/);
  let cursor=0,preserved=0;
  for(const [index,block]of blocks.entries()){
    const at=after.indexOf(block,cursor);
    check(at>=0,file+': removed, altered or reordered block '+(index+1));
    if(at>=0){preserved++;cursor=at+block.length;}
  }
  const practiceUnchanged=section(before,practice)===section(after,practice);
  check(practiceUnchanged,file+': formal exercise section changed');
  const refs=section(before,'參考資料與延伸閱讀');
  const oldReferencesPreserved=section(after,'參考資料與延伸閱讀')?.startsWith(refs);
  check(oldReferencesPreserved,file+': original references changed');
  const images=s=>[...s.matchAll(/!\[[^\]]*\]\((\.\.\/assets\/figures\/[^)]+)\)/g)].map(m=>path.posix.normalize('content/'+m[1]));
  const originalFigures=images(before),currentFigures=images(after);
  for(const f of originalFigures)check(oldFile(f).equals(readFileSync(path.join(root,f))),'Original figure changed: '+f);
  check(currentFigures.length===expectedFigures,file+': wrong figure count');
  chapters.push({file,originalBlocks:blocks.length,originalBlocksPreservedInOrder:preserved,practiceUnchanged,oldReferencesPreserved,originalFigureFilesUnchanged:originalFigures.length,currentFigures:currentFigures.length,hanCharactersBefore:(before.match(/\p{Script=Han}/gu)||[]).length,hanCharactersAfter:(after.match(/\p{Script=Han}/gu)||[]).length});
}
// Verify the actual shipped vector paths, not a separate unused data array.
const svg=read('assets/figures/unit02-settling-margin.svg');
let curveCoordinatesChecked=0;
for(const[id,tau]of[['nominal',1],['slow',1.155]]){
  const d=svg.match(new RegExp('<path id="'+id+'"[^>]* d="([^"]+)"'))?.[1];
  const pts=[...(d||'').matchAll(/[ML]([\d.]+) ([\d.]+)/g)];
  check(pts.length===161,id+': expected 161 curve points');
  for(const[i,p]of pts.entries()){
    const t=3+i/40,px=110+(t-3)*172.5,py=510-41.25*100*Math.exp(-t/tau);
    check(Math.abs(+p[1]-px)<=.00051&&Math.abs(+p[2]-py)<=.00051,id+': incorrect geometry at t='+t);
    curveCoordinatesChecked++;
  }
}
for(const t of[5,6]){
  const m=svg.match(new RegExp('<circle data-time-ms="'+t+'" cx="([^"]+)" cy="([^"]+)"'));
  check(!!m&&Math.abs(+m[1]-(110+(t-3)*172.5))<.001&&Math.abs(+m[2]-(510-4125*Math.exp(-t/1.155)))<.001,'Incorrect decision marker '+t);
}
check(svg.includes('y1="468.75"')&&svg.includes('y2="468.75"'),'Missing 1% threshold');
const otherContentChanges=execFileSync('git',['diff','--name-only',baselineCommit,'--','content'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(f=>!chapters.some(c=>c.file===f));
check(!otherContentChanges.length,'Unrelated content changed: '+otherContentChanges.join(', '));
console.log(JSON.stringify({baselineCommit,chapters,curveCoordinatesChecked,decisionMarkersChecked:2,otherContentChanges,errors},null,2));
assert.equal(errors.length,0,errors.join('\n'));
