import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// Fixed pre-expansion baseline. Do not move it to make preservation tests pass.
const baseline='209baae7acfdc7b6403b5e3bd421f6b999511dbd';
const root=fileURLToPath(new URL('../',import.meta.url));
const target='content/01-engineering-map.md';
const addedFigures=['unit01-architecture-contract.svg','unit01-design-evidence.svg'];
const read=file=>readFile(path.join(root,file));
const hash=data=>createHash('sha256').update(data).digest('hex');
function git(args){
  const r=spawnSync('git',args,{cwd:root,maxBuffer:64*1024*1024});
  assert.equal(r.status,0,`git ${args[0]}: ${r.stderr}`); return r.stdout;
}
const original=file=>git(['show',`${baseline}:${file}`]);
const tracked=git(['ls-tree','-r','--name-only',baseline]).toString().trim().split('\n');
const documents=tracked.filter(f=>/^content\/\d{2}-[a-z0-9-]+\.md$/.test(f));
const oldFigures=tracked.filter(f=>/^assets\/figures\/.*\.svg$/.test(f));
assert.equal(documents.length,49); assert.equal(oldFigures.length,22);
assert.deepEqual((await readdir(path.join(root,'content'))).filter(f=>/^\d{2}-[a-z0-9-]+\.md$/.test(f)).sort(),documents.map(f=>path.basename(f)).sort());
assert.deepEqual((await readdir(path.join(root,'assets/figures'))).sort(),[...oldFigures.map(f=>path.basename(f)),...addedFigures].sort());
const unchanged=[];
for(const file of [...documents.filter(f=>f!==target),...oldFigures,'src/models.js','research/industry-roadmap-audit.json']){
  const current=await read(file); assert.ok(current.equals(original(file)),`Unrelated content changed: ${file}`);
  unchanged.push({file,sha256:hash(current)});
}
const before=original(target).toString(),after=(await read(target)).toString();
const exceptions=new Map([[
  '接著用八題練習檢查能否把需求、物件、流程及模型連起來。遇到不確定的地方，回到相應小節看假設與圖說，不必靠背誦縮寫猜答案。',
  '接著用十二題練習檢查能否把需求、物件、流程及模型連起來。前八題保留需求與製造判讀，新增四題檢查架構介面、設計交付及矽後證據。遇到不確定的地方，回到相應小節看假設與圖說，不必靠背誦縮寫猜答案。'
]]);
let cursor=0,verbatimBlocks=0,adjustedBlocks=0;
const blockMap=[];
for(const [i,block] of before.trim().split(/\n\s*\n/).entries()){
  const expected=exceptions.get(block)||block,at=after.indexOf(expected,cursor);
  assert.ok(at>=cursor,`Baseline block ${i+1} missing or reordered: ${block.slice(0,100)}`);
  cursor=at+expected.length;
  if(exceptions.has(block))adjustedBlocks++;else verbatimBlocks++;
  blockMap.push({baselineBlock:i+1,mode:exceptions.has(block)?'exercise-count-transition':'verbatim',sha256:hash(block)});
}
assert.equal(adjustedBlocks,exceptions.size,'Exception unused or hidden');
const practice=md=>md.split('## 練習與參考解答\n')[1].split('\n## 單元回顧與下一步')[0];
const exercises=md=>new Map([...practice(md).matchAll(/\*\*練習 (\d+)：[\s\S]*?(?=\*\*練習 \d+：|$)/g)].map(m=>[Number(m[1]),m[0].trim()]));
const oldExercises=exercises(before),newExercises=exercises(after);
assert.equal(oldExercises.size,8); assert.equal(newExercises.size,12);
assert.deepEqual([...newExercises.keys()],[1,2,3,4,5,6,7,8,9,10,11,12]);
for(const [n,exercise] of oldExercises)assert.equal(newExercises.get(n),exercise,`Original exercise ${n} changed`);
for(const [n,exercise] of newExercises){
  assert.equal((exercise.match(/\*\*解答。\*\*/g)||[]).length,1,`Exercise ${n} lacks one answer`);
  assert.ok(exercise.split('**解答。**')[1].trim().length>60,`Exercise ${n} answer too short`);
}
const references=md=>md.split('## 參考資料與延伸閱讀\n')[1].split('\n').filter(line=>/^\d+\. /.test(line));
assert.equal(references(before).length,18); assert.equal(references(after).length,25);
assert.deepEqual(references(after).slice(0,18),references(before));
assert.deepEqual(references(after).map(line=>Number(line.match(/^\d+/)[0])),Array.from({length:25},(_,i)=>i+1));
const imageLines=md=>md.split('\n').filter(line=>/^!\[/.test(line));
assert.equal(imageLines(before).length,8); assert.equal(imageLines(after).length,10);
assert.deepEqual(imageLines(after).filter(line=>!addedFigures.some(name=>line.includes(name))),imageLines(before));
const captions=md=>[...md.matchAll(/^圖 1-(\d+[A-Z]?)　/gm)].map(m=>m[1]);
assert.deepEqual(captions(after),['1','2','2A','3','3A','4','5','6','7','8']);

const manifest=JSON.parse(await read('dist/book-manifest.json'));
const oldManifest=JSON.parse(original('dist/book-manifest.json'));
assert.deepEqual(manifest.documents.map(d=>[d.file,d.title]),oldManifest.documents.map(d=>[d.file,d.title]));
assert.equal(manifest.generatedPages,53);
const article=html=>{const m=html.match(/<article class="prose">([\s\S]*?)<\/article>/);assert.ok(m);return m[1];};
const ids=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const headings=html=>new Map([...html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(m=>[m[2],m[3]]));
function preserveHeadings(beforeHTML,afterHTML){
  const old=headings(beforeHTML),current=headings(afterHTML);assert.ok(old.size>0,'No baseline headings');
  for(const [id,title] of old)assert.equal(current.get(id),title,`Old heading target changed: ${id}`);
}
const chapterPages=documents.map(file=>file.replace(/^content\//,'dist/chapters/').replace(/\.md$/,'.html'));
assert.deepEqual((await readdir(path.join(root,'dist/chapters'))).sort(),chapterPages.map(f=>path.basename(f)).sort());
for(const file of chapterPages){
  const a=original(file).toString(),b=(await read(file)).toString();
  if(!file.endsWith('/01-engineering-map.html'))assert.equal(article(b),article(a),`Other chapter body changed: ${file}`);
  for(const id of ids(a))assert.ok(ids(b).includes(id),`Old chapter anchor lost: ${file}#${id}`);
  preserveHeadings(article(a),article(b));
}
const oldFull=article(original('dist/all.html').toString()),newFull=article((await read('dist/all.html')).toString());
const sections=html=>[...html.matchAll(/<section class="book-section" id="([^"]+)">([\s\S]*?)<\/section>/g)];
assert.equal(sections(newFull).length,49);
assert.deepEqual(sections(newFull).map(m=>m[1]),sections(oldFull).map(m=>m[1]));
for(let i=1;i<49;i++)assert.equal(sections(newFull)[i][0],sections(oldFull)[i][0],`Full-book section ${i+1} changed`);
for(const id of ids(oldFull))assert.ok(ids(newFull).includes(id),`Old full-book anchor lost: ${id}`);
preserveHeadings(oldFull,newFull);
const search=bytes=>JSON.parse(bytes.toString().replace(/^window\.BOOK_INDEX=/,'').replace(/;\s*$/,''));
const oldIndex=search(original('dist/assets/search-index.js')),newIndex=search(await read('dist/assets/search-index.js'));
assert.equal(newIndex.length,49); assert.deepEqual(newIndex.slice(1),oldIndex.slice(1));
assert.deepEqual(newIndex.map(d=>d.url),oldIndex.map(d=>d.url));
assert.ok(newIndex[0].text.includes('時間分配與有效資料'));

// Verify actual generated bar geometry, not only metadata or generator constants.
const svg=(await read('assets/figures/unit01-architecture-contract.svg')).toString();
const budgetChecks=[];
for(const [key,start,duration] of [['ready',0,.8],['convert',.8,.5],['store',1.3,.2],['remaining',1.5,.5]]){
  const rect=[...svg.matchAll(/<rect\b[^>]*\/>/g)].map(m=>m[0]).find(s=>s.includes(`id="budget-${key}"`));
  assert.ok(rect,`Missing ${key}`);
  const attr=name=>Number(rect.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1]);
  const near=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-9,`${key}: ${actual} != ${expected}`);
  near(attr('x'),100+start*500);near(attr('width'),duration*500);near(attr('y'),525);near(attr('height'),65);
  near(attr('data-start-ms'),start);near(attr('data-duration-ms'),duration);
  budgetChecks.push({key,startMs:start,durationMs:duration,x:attr('x'),width:attr('width')});
}
const verification=JSON.parse(await read('research/verification.json'));
assert.deepEqual(verification.errors,[]);assert.equal(verification.numericalChecks,253);
const newNumerics=verification.numericalResults.filter(n=>/^01 (sequential|unallocated|exercise (9|10))/.test(n.name));
assert.equal(newNumerics.length,7);assert.ok(newNumerics.every(n=>n.passed));
const zip=spawnSync('unzip',['-p',path.join(root,'dist/engineering-textbook-html.zip'),'chapters/01-engineering-map.html'],{maxBuffer:8*1024*1024});
assert.equal(zip.status,0);assert.ok(zip.stdout.equals(await read('dist/chapters/01-engineering-map.html')));
const report={phase:'unit01-lifecycle-expansion',baseline,
  originalBlocks:verbatimBlocks+adjustedBlocks,verbatimBlocks,adjustedBlocks,
  originalExercisesPreserved:8,addedExercises:4,originalReferencesPreserved:18,totalReferenceEntries:25,
  originalChapterFiguresPreserved:8,addedChapterFigures:2,otherNumericDocumentsUnchanged:48,
  allOldSourceFiguresUnchanged:22,chapterURLsAndOldAnchorsPreserved:49,otherRenderedChapterBodiesUnchanged:48,
  fullBookOrderAndOtherBodiesPreserved:true,otherSearchEntriesUnchanged:48,offlineChapterMatches:true,
  numericalChecks:verification.numericalChecks,newNumericalChecks:newNumerics.length,budgetChecks,
  hanCharacters:{before:(before.match(/\p{Script=Han}/gu)||[]).length,after:(after.match(/\p{Script=Han}/gu)||[]).length},
  browserQA:'Unavailable: cua returned apps=[], browsers=[] on 2026-10-25. New SVGs rendered and visually inspected separately; no browser certification.',
  unchanged,blockMap,errors:[]};
await writeFile(path.join(root,'research/unit-01-lifecycle-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,unchanged:undefined,blockMap:undefined},null,2));
