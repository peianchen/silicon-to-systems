import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
// Historical baselines are immutable. This audit only exempts chapter 02.
const baseline='ced34ec5a6da48d7191e23e370c89bc26153bb11';
const root=fileURLToPath(new URL('../',import.meta.url));
const targetID='02-engineering-mathematics',target=`content/${targetID}.md`;
const additions=['unit02-acquisition-window.svg','unit02-acquisition-corners.svg'];
const read=file=>readFile(path.join(root,file));
const sha=data=>createHash('sha256').update(data).digest('hex');
function git(args){const r=spawnSync('git',args,{cwd:root,maxBuffer:64*1024*1024});assert.equal(r.status,0,String(r.stderr));return r.stdout;}
const original=file=>git(['show',`${baseline}:${file}`]);
const tracked=git(['ls-tree','-r','--name-only',baseline]).toString().trim().split('\n');
const docs=tracked.filter(f=>/^content\/\d{2}-[a-z0-9-]+\.md$/.test(f));
const oldFigures=tracked.filter(f=>/^assets\/figures\/.*\.svg$/.test(f));
assert.equal(docs.length,49);assert.equal(oldFigures.length,24);
assert.deepEqual((await readdir(path.join(root,'content'))).filter(f=>/^\d{2}-[a-z0-9-]+\.md$/.test(f)).sort(),docs.map(f=>path.basename(f)).sort());
assert.deepEqual((await readdir(path.join(root,'assets/figures'))).sort(),[...oldFigures.map(f=>path.basename(f)),...additions].sort());
const unchanged=[];
for(const file of [...docs.filter(f=>f!==target),...oldFigures,'src/models.js','scripts/audit-industry-roadmap.mjs','scripts/audit-unit01-lifecycle-expansion.mjs','research/industry-roadmap-audit.json','research/unit-01-lifecycle-audit.json']){
 const current=await read(file);assert.ok(current.equals(original(file)),`Unrelated content changed: ${file}`);unchanged.push({file,sha256:sha(current)});
}
const before=original(target).toString(),after=(await read(target)).toString();
const blocks=before.trim().split(/\n\s*\n/),blockMap=[];let cursor=0;
assert.equal(blocks.length,204);
for(const [i,block] of blocks.entries()){
 const index=after.indexOf(block,cursor);assert.ok(index>=cursor,`Original block ${i+1} missing/reordered: ${block.slice(0,100)}`);
 cursor=index+block.length;blockMap.push({baselineBlock:i+1,mode:'verbatim',sha256:sha(block)});
}
const practice=md=>md.split('## 練習與完整參考解答\n')[1].split('\n## 單元回顧與下一步')[0];
const exercises=md=>[...practice(md).matchAll(/\*\*練習 (\d+)。[\s\S]*?(?=\*\*練習 \d+。|$)/g)].map(m=>({n:Number(m[1]),text:m[0].trim()}));
const oldExercises=exercises(before),newExercises=exercises(after);
assert.equal(oldExercises.length,12);assert.deepEqual(newExercises.map(e=>e.n),Array.from({length:16},(_,i)=>i+1));
assert.deepEqual(newExercises.slice(0,12),oldExercises);
for(const exercise of newExercises){assert.equal((exercise.text.match(/\*\*解答。\*\*/g)||[]).length,1);assert.ok(exercise.text.split('**解答。**')[1].trim().length>30);}
const references=md=>md.split('## 參考資料與延伸閱讀\n')[1].split('\n').filter(line=>/^\d+\. /.test(line));
assert.equal(references(before).length,10);assert.equal(references(after).length,16);assert.deepEqual(references(after).slice(0,10),references(before));
assert.deepEqual(references(after).map(line=>Number(line.match(/^\d+/)[0])),Array.from({length:16},(_,i)=>i+1));
const images=md=>md.split('\n').filter(line=>/^!\[/.test(line));
assert.equal(images(before).length,7);assert.equal(images(after).length,9);
assert.deepEqual(images(after).filter(line=>!additions.some(name=>line.includes(name))),images(before));
assert.deepEqual([...after.matchAll(/^圖 2-(\d+[A-Z]?)　/gm)].map(m=>m[1]),['1','2','3','3A','4','5','6','7','8']);

const manifest=JSON.parse(await read('dist/book-manifest.json')),oldManifest=JSON.parse(original('dist/book-manifest.json'));
assert.deepEqual(manifest.documents.map(d=>[d.file,d.title]),oldManifest.documents.map(d=>[d.file,d.title]));assert.equal(manifest.generatedPages,53);
const article=html=>{const m=html.match(/<article class="prose">([\s\S]*?)<\/article>/);assert.ok(m);return m[1];};
const ids=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const headings=html=>new Map([...html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(m=>[m[2],m[3]]));
function preserveAnchors(a,b){
 for(const id of ids(a))assert.ok(ids(b).includes(id),`Missing old ID ${id}`);
 const old=headings(a),current=headings(b);assert.ok(old.size);
 for(const [id,title] of old)assert.equal(current.get(id),title,`Heading target changed ${id}`);
}
const chapterPages=docs.map(f=>f.replace(/^content\//,'dist/chapters/').replace(/\.md$/,'.html'));
assert.deepEqual((await readdir(path.join(root,'dist/chapters'))).sort(),chapterPages.map(f=>path.basename(f)).sort());
for(const file of chapterPages){const a=article(original(file).toString()),b=article((await read(file)).toString());if(file!==`dist/chapters/${targetID}.html`)assert.equal(b,a,`Other chapter body changed: ${file}`);preserveAnchors(a,b);}
const oldFull=article(original('dist/all.html').toString()),newFull=article((await read('dist/all.html')).toString());
const sections=html=>new Map([...html.matchAll(/<section class="book-section" id="([^"]+)">([\s\S]*?)<\/section>/g)].map(m=>[m[1],m[0]]));
const aSections=sections(oldFull),bSections=sections(newFull);
assert.equal(bSections.size,49);assert.deepEqual([...bSections.keys()],[...aSections.keys()]);
for(const [id,section] of aSections)if(id!==targetID)assert.equal(bSections.get(id),section,`Full-book section changed: ${id}`);
preserveAnchors(oldFull,newFull);
const search=data=>JSON.parse(data.toString().replace(/^window\.BOOK_INDEX=/,'').replace(/;\s*$/,''));
const aSearch=search(original('dist/assets/search-index.js')),bSearch=search(await read('dist/assets/search-index.js'));
assert.equal(bSearch.length,49);assert.deepEqual(bSearch.map(d=>d.url),aSearch.map(d=>d.url));
for(let i=0;i<aSearch.length;i++)if(aSearch[i].url!==`chapters/${targetID}.html`)assert.deepEqual(bSearch[i],aSearch[i]);
assert.ok(bSearch.find(d=>d.url===`chapters/${targetID}.html`).text.includes('取樣窗、參數界限與驗證紀錄'));

const svg=(await read('assets/figures/unit02-acquisition-corners.svg')).toString();
const attr=(tag,name)=>tag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
const near=(a,b,what)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=.0006,`${what}: ${a} != ${b}`);
// Separate formula using natural logarithms; compare actual serialized geometry.
const x=t=>140+950*t/600,y=e=>720-430*(Math.log(e)/Math.log(10)+2)/6;
let curvePoints=0;
for(const [id,tau] of [['nominal',50],['slow',66]]){
 const tag=[...svg.matchAll(/<polyline\b[^>]*\/>/g)].map(m=>m[0]).find(s=>attr(s,'id')===`curve-${id}`);assert.ok(tag);
 assert.equal(Number(attr(tag,'data-tau-ns')),tau);
 const points=attr(tag,'points').split(' ').map(pair=>pair.split(',').map(Number));assert.equal(points.length,121);
 points.forEach(([X,Y],i)=>{const t=i*5,E=2048*Math.exp(-t/tau);near(X,x(t),`${id} x`);near(Y,y(E),`${id} y`);curvePoints++;});
}
for(const [id,t,tau] of [['nominal-400',400,50],['slow-400',400,66],['slow-550',550,66]]){
 const tag=[...svg.matchAll(/<circle\b[^>]*\/>/g)].map(m=>m[0]).find(s=>attr(s,'id')===`point-${id}`);assert.ok(tag);
 const E=2048*Math.exp(-t/tau);near(Number(attr(tag,'cx')),x(t),id+' x');near(Number(attr(tag,'cy')),y(E),id+' y');
 assert.equal(Number(attr(tag,'data-time-ns')),t);near(Number(attr(tag,'data-error-mv')),E,id+' data');
}
const threshold=[...svg.matchAll(/<line\b[^>]*\/>/g)].map(m=>m[0]).find(s=>attr(s,'stroke-dasharray')==='3 5');assert.ok(threshold);
near(Number(attr(threshold,'y1')),y(1),'threshold y1');near(Number(attr(threshold,'y2')),y(1),'threshold y2');
assert.ok(svg.includes('對數刻度')&&svg.includes('虛線不是統計帶'));
const verification=JSON.parse(await read('research/verification.json')),oldVerification=JSON.parse(original('research/verification.json'));
assert.deepEqual(verification.errors,[]);assert.equal(oldVerification.numericalChecks,253);assert.equal(verification.numericalChecks,271);
let numericCursor=0;
for(const old of oldVerification.numericalResults){const index=verification.numericalResults.findIndex((n,i)=>i>=numericCursor&&n.name===old.name);assert.ok(index>=numericCursor,`Missing old numeric ${old.name}`);assert.deepEqual(verification.numericalResults[index],old);numericCursor=index+1;}
const newNumbers=verification.numericalResults.filter(n=>n.name.startsWith('02 industry '));assert.equal(newNumbers.length,18);assert.ok(newNumbers.every(n=>n.passed));
const zip=spawnSync('unzip',['-p',path.join(root,'dist/engineering-textbook-html.zip'),`chapters/${targetID}.html`],{maxBuffer:8*1024*1024});
assert.equal(zip.status,0);assert.ok(zip.stdout.equals(await read(`dist/chapters/${targetID}.html`)));
const report={phase:'unit02-industry-expansion',baseline,originalBlocks:204,verbatimBlocks:204,adjustedBlocks:0,
 originalExercisesPreserved:12,addedExercises:4,originalReferencesPreserved:10,totalReferenceEntries:16,
 originalChapterFiguresPreserved:7,addedChapterFigures:2,otherNumericDocumentsUnchanged:48,allOldSourceFiguresUnchanged:24,
 chapterURLsAndHeadingAnchorsPreserved:49,otherRenderedChapterBodiesUnchanged:48,fullBookOrderAndOtherBodiesPreserved:true,otherSearchEntriesUnchanged:48,
 curvePointsChecked:curvePoints,decisionMarkersChecked:3,logarithmicThresholdChecked:true,oldNumericalResultsUnchanged:253,newNumericalChecks:18,numericalChecks:271,offlineChapterMatches:true,
 hanCharacters:{before:(before.match(/\p{Script=Han}/gu)||[]).length,after:(after.match(/\p{Script=Han}/gu)||[]).length},
 browserQA:'Unavailable: no enabled browser on 2026-10-26. New SVGs rendered and visually inspected separately, not browser certification.',unchanged,blockMap,errors:[]};
await writeFile(path.join(root,'research/unit-02-industry-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,unchanged:undefined,blockMap:undefined},null,2));
