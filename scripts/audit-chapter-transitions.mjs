// Prose-addition audit, allowing only two explicit section-reference corrections.
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baselineCommit='76435758f15a4f7684a158fb998d1f22118f111d';
const gitShow=file=>execFileSync('git',['show',baselineCommit+':'+file],{cwd:root});
const split=s=>s.trim().split(/\n\s*\n/);
const headings=s=>s.match(/^#{1,3} .+$/gm)||[];
const section=(s,h)=>s.split('## '+h+'\n')[1]?.split('\n## ')[0].trim();
const errors=[];
const chapters=[];
for(const [file,practice,expectedAdditions] of [
  ['content/01-engineering-map.md','練習與參考解答',6],
  ['content/02-engineering-mathematics.md','練習與完整參考解答',14]
]){
  const before=gitShow(file).toString('utf8'),after=readFileSync(path.join(root,file),'utf8');
  const oldBlocks=split(before),newBlocks=split(after),preserved=new Set();
  let cursor=0,unchanged=0,referenceClarifications=0;
  for(const [index,block] of oldBlocks.entries()){
    let found=newBlocks.indexOf(block,cursor);
    if(found>=0)unchanged++;
    else if(file==='content/02-engineering-mathematics.md'){
      const clarified=block.startsWith('圖 2-2')
        ?block.replace('**不是**下一節','**不是**第 3.1 節')
        :block.startsWith('上一節指定固定電流')
          ?block.replace('上一節指定固定電流','算例 B 指定固定電流'):block;
      if(clarified!==block){found=newBlocks.indexOf(clarified,cursor);if(found>=0)referenceClarifications++;}
    }
    if(found<0){errors.push(file+': original block changed or reordered '+(index+1));continue;}
    preserved.add(found);cursor=found+1;
  }
  const added=newBlocks.filter((_,i)=>!preserved.has(i));
  if(added.length!==expectedAdditions)errors.push(file+': unexpected addition count');
  if(added.some(p=>p.startsWith('#')||p.includes('$')))errors.push(file+': additions should be prose bridges only');
  const headingsUnchanged=JSON.stringify(headings(before))===JSON.stringify(headings(after));
  const practiceUnchanged=section(before,practice)===section(after,practice);
  const referencesUnchanged=section(before,'參考資料與延伸閱讀')===section(after,'參考資料與延伸閱讀');
  for(const [label,pass] of Object.entries({headingsUnchanged,practiceUnchanged,referencesUnchanged})){
    if(!pass)errors.push(file+': '+label+' failed');
  }
  const figures=[...before.matchAll(/!\[[^\]]*\]\((\.\.\/assets\/figures\/[^)]+)\)/g)].map(m=>path.posix.normalize('content/'+m[1]));
  for(const figure of figures){
    if(!gitShow(figure).equals(readFileSync(path.join(root,figure))))errors.push('Figure changed: '+figure);
  }
  chapters.push({file,originalBlocks:oldBlocks.length,originalBlocksPreservedInOrder:preserved.size,unchangedBlocks:unchanged,referenceClarifications,addedBridgeParagraphs:added.length,headingsUnchanged,practiceUnchanged,referencesUnchanged,unchangedFigureFiles:figures.length,hanCharactersBefore:(before.match(/\p{Script=Han}/gu)||[]).length,hanCharactersAfter:(after.match(/\p{Script=Han}/gu)||[]).length});
}
const otherContentChanges=execFileSync('git',['diff','--name-only',baselineCommit,'--','content'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(f=>!chapters.some(c=>c.file===f));
if(otherContentChanges.length)errors.push(...otherContentChanges.map(f=>'Unrelated content changed: '+f));
console.log(JSON.stringify({baselineCommit,chapters,otherContentChanges,errors},null,2));
if(errors.length)process.exitCode=1;
