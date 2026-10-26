import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const baseline='27084884388107398321273fbc203fdc13365c36';
const root=fileURLToPath(new URL('../',import.meta.url));
const targetID='03-complex-phasors',target=`content/${targetID}.md`,chapter02='02-engineering-mathematics';
const additions=['unit03-parasitic-budget.svg','unit03-supply-impedance.svg'];
const read=file=>readFile(path.join(root,file));
const sha=data=>createHash('sha256').update(data).digest('hex');
function git(args){const r=spawnSync('git',args,{cwd:root,maxBuffer:64*1024*1024});assert.equal(r.status,0,String(r.stderr));return r.stdout;}
const original=file=>git(['show',`${baseline}:${file}`]);
const tracked=git(['ls-tree','-r','--name-only',baseline]).toString().trim().split('\n');
const docs=tracked.filter(f=>/^content\/\d{2}-[a-z0-9-]+\.md$/.test(f));
const oldFigures=tracked.filter(f=>/^assets\/figures\/.*\.svg$/.test(f));
const reviewedFigures=['unit01-system-map.svg','unit01-lifecycle.svg','unit01-front-back.svg'].map(f=>`assets/figures/${f}`);
assert.equal(docs.length,49);assert.equal(oldFigures.length,26);
assert.deepEqual((await readdir(path.join(root,'content'))).filter(f=>/^\d{2}-[a-z0-9-]+\.md$/.test(f)).sort(),docs.map(f=>path.basename(f)).sort());
assert.deepEqual((await readdir(path.join(root,'assets/figures'))).sort(),[...oldFigures.map(f=>path.basename(f)),...additions].sort());
const unchanged=[];
const frozen=['src/models.js','scripts/audit-industry-roadmap.mjs','scripts/audit-unit01-lifecycle-expansion.mjs','scripts/audit-unit02-industry-expansion.mjs','research/industry-roadmap-audit.json','research/unit-01-lifecycle-audit.json','research/unit-02-industry-audit.json'];
for(const file of [...docs.filter(f=>f!==target&&f!==`content/${chapter02}.md`),...oldFigures.filter(f=>!reviewedFigures.includes(f)),...frozen]){
 const current=await read(file);assert.ok(current.equals(original(file)),`Unexpected change: ${file}`);unchanged.push({file,sha256:sha(current)});
}
const oldCondition='一階最壞估計約 3%，精確最大比值';
const newCondition='一階最壞估計約 3%；若各最不利端點可同時發生，精確最大比值';
function correctCondition(text){assert.equal(text.split(oldCondition).length-1,1);return text.replace(oldCondition,newCondition);}
assert.equal((await read(`content/${chapter02}.md`)).toString(),correctCondition(original(`content/${chapter02}.md`).toString()));
const reviewedChanges=[{file:`content/${chapter02}.md`,change:'Exercise 10: compatible extreme endpoints explicitly required; numbers unchanged.'}];
for(const file of reviewedFigures){
 const old=original(file).toString();
 const expected=file.endsWith('/unit01-system-map.svg')?old.replace('.small{font-size:16px;','.small{font-size:18px;'):old.replaceAll('分圖a','分圖1').replaceAll('分圖b','分圖2');
 assert.notEqual(old,expected);assert.equal((await read(file)).toString(),expected,`Extra figure changes: ${file}`);
 reviewedChanges.push({file,change:file.includes('system-map')?'Only actual +/− font size 16→18.':'Only accessible panel labels a/b→1/2.'});
}
const before=original(target).toString(),after=(await read(target)).toString();
const blocks=before.trim().split(/\n\s*\n/),blockMap=[];let cursor=0,adjusted=0;
assert.equal(blocks.length,178);
for(const [i,block] of blocks.entries()){
 const expected=block.replace('我們仍用同一個 RC 電路，改看它對不同頻率的穩態反應。第02章算例的','我們仍以相同的 RC 拓撲，改看不同頻率的穩態反應。第02章算例 C 的').replace('表格與七張向量圖','表格、原七張向量圖及新增兩張圖解');
 const at=after.indexOf(expected,cursor);assert.ok(at>=cursor,`Original chapter 03 block ${i+1} missing/reordered: ${block.slice(0,100)}`);
 cursor=at+expected.length;const changed=expected!==block;adjusted+=Number(changed);
 blockMap.push({baselineBlock:i+1,mode:changed?'explicit-reference-or-figure-count-clarification':'verbatim',sha256:sha(block)});
}
assert.equal(adjusted,2);
const practice=md=>md.split('## 練習與完整參考解答\n')[1].split('\n## 常見誤解與工程連結')[0];
const exercises=md=>[...practice(md).matchAll(/\*\*練習(\d+)。[\s\S]*?(?=\*\*練習\d+。|$)/g)].map(m=>({n:Number(m[1]),text:m[0].trim()}));
const oldExercises=exercises(before),newExercises=exercises(after);
assert.equal(oldExercises.length,12);assert.deepEqual(newExercises.map(e=>e.n),Array.from({length:16},(_,i)=>i+1));assert.deepEqual(newExercises.slice(0,12),oldExercises);
for(const e of newExercises){assert.equal((e.text.match(/\*\*解答。\*\*/g)||[]).length,1);assert.ok(e.text.split('**解答。**')[1].trim().length>60);}
const refs=md=>md.split('## 參考資料與延伸閱讀\n')[1].split('\n').filter(line=>/^\d+\. /.test(line));
assert.equal(refs(before).length,8);assert.ok(refs(after).length>8);assert.deepEqual(refs(after).slice(0,8),refs(before));
assert.deepEqual(refs(after).map(line=>Number(line.match(/^\d+/)[0])),Array.from({length:refs(after).length},(_,i)=>i+1));
const images=md=>md.split('\n').filter(line=>/^!\[/.test(line));
assert.equal(images(before).length,7);assert.equal(images(after).length,9);assert.deepEqual(images(after).slice(0,7),images(before));
assert.deepEqual([...after.matchAll(/^圖 3-(\d+)　/gm)].map(m=>Number(m[1])),[1,2,3,4,5,6,7,8,9]);
// Check actual serialized geometry independently, not only data-* declarations.
const capacitorSVG=(await read('assets/figures/unit03-parasitic-budget.svg')).toString();
const supplySVG=(await read('assets/figures/unit03-supply-impedance.svg')).toString();
function element(svg,tag,id){
 const found=[...svg.matchAll(new RegExp(`<${tag}\\b[^>]*\\bid="${id}"[^>]*>`,'g'))];assert.equal(found.length,1,`Unique ${tag} ${id}`);
 return Object.fromEntries([...found[0][0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
}
let maxCoordinateError=0;
function coordinate(value,expected,label){const error=Math.abs(Number(value)-expected);assert.ok(Number.isFinite(error)&&error<=.0006,`${label}: ${value} versus ${expected}`);maxCoordinateError=Math.max(maxCoordinateError,error);}
const bars=[['design-c0',640,0,20],['built-c0',730,0,20],['built-parasitic',730,20,5],['probed-c0',820,0,20],['probed-parasitic',820,20,5],['probed-probe',820,25,10]];
for(const [id,y,start,value] of bars){const r=element(capacitorSVG,'rect',`budget-${id}`);coordinate(r.x,330+18.5*start,id+' x');coordinate(r.y,y,id+' y');coordinate(r.width,18.5*value,id+' width');coordinate(r.height,46,id+' height');assert.equal(Number(r['data-start-pf']),start);assert.equal(Number(r['data-capacitance-pf']),value);}
const capMax=Math.min(Math.sqrt(1/.95**2-1),Math.tan(Math.PI/10))/(2*Math.PI*1e6*2000)*1e12;
const capLine=element(capacitorSVG,'line','capacitance-limit');
for(const attr of ['x1','x2'])coordinate(capLine[attr],330+18.5*capMax,'cap limit '+attr);
coordinate(capLine.y1,617,'cap limit y1');coordinate(capLine.y2,880,'cap limit y2');assert.ok(Math.abs(Number(capLine['data-capacitance-pf'])-capMax)<1e-10);
let curvePoints=0,decisionPoints=0;
const plotX=f=>140+475*Math.log10(f/1e6),plotY=z=>1015-185*Math.log10(z/10);
for(const [key,L] of [['1nh',1e-9],['05nh',.5e-9]]){
 const curve=element(supplySVG,'polyline',`impedance-${key}`),points=curve.points.trim().split(/\s+/).map(p=>p.split(',').map(Number));
 assert.equal(points.length,201);assert.equal(Number(curve['data-resistance-ohm']),.02);assert.equal(Number(curve['data-inductance-h']),L);
 for(const [[x,y],i] of points.map((p,i)=>[p,i])){const f=1e6*10**(i/100),z=1000*Math.sqrt(.02**2+(2*Math.PI*f*L)**2);coordinate(x,plotX(f),key+' x '+i);coordinate(y,plotY(z),key+' y '+i);curvePoints++;}
 const mark=element(supplySVG,'circle',`impedance-${key}-10mhz`),z=1000*Math.sqrt(.02**2+(2*Math.PI*1e7*L)**2);
 coordinate(mark.cx,plotX(1e7),key+' marker x');coordinate(mark.cy,plotY(z),key+' marker y');assert.ok(Math.abs(Number(mark['data-impedance-mohm'])-z)<1e-10);decisionPoints++;
}
const impedanceLine=element(supplySVG,'line','impedance-limit');
coordinate(impedanceLine.x1,140,'Z limit x1');coordinate(impedanceLine.x2,1090,'Z limit x2');
for(const attr of ['y1','y2'])coordinate(impedanceLine[attr],plotY(50),'Z limit '+attr);
const figureGeometry={capacitanceRectangles:bars.length,capacitanceThreshold:true,impedanceCurvePoints:curvePoints,impedanceDecisionPoints:decisionPoints,impedanceThreshold:true,maxCoordinateError,tolerance:.0006};
const manifest=JSON.parse(await read('dist/book-manifest.json')),oldManifest=JSON.parse(original('dist/book-manifest.json'));
assert.deepEqual(manifest.documents.map(d=>[d.file,d.title]),oldManifest.documents.map(d=>[d.file,d.title]));assert.equal(manifest.generatedPages,53);
const article=html=>{const m=html.match(/<article class="prose">([\s\S]*?)<\/article>/);assert.ok(m);return m[1];};
const renderedPreservation=[];
function preserveRenderedThird(oldHTML,newHTML,label){
 const clarified=oldHTML.replace('我們仍用同一個 RC 電路，改看它對不同頻率的穩態反應。第02章算例的','我們仍以相同的 RC 拓撲，改看不同頻率的穩態反應。第02章算例 C 的').replace('表格與七張向量圖','表格、原七張向量圖及新增兩張圖解');
 // Ordered markup/text tokens also cover rendered equations, old table rows and answers.
 // Additional paragraphs, rows and references are allowed; old non-whitespace tokens are not dropped.
 const tokens=s=>(s.match(/<[^>]+>|[^<]+/g)||[]).filter(t=>t.trim());
 const old=tokens(clarified),now=tokens(newHTML);let at=0;
 for(const token of old){while(at<now.length&&now[at]!==token)at++;assert.ok(at<now.length,`${label}: missing old rendered token ${token.slice(0,150)}`);at++;}
 assert.ok(old.length>1000);renderedPreservation.push({render:label,oldMarkupAndTextTokensPreserved:old.length});
}
const ids=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const headings=html=>new Map([...html.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(m=>[m[2],m[3]]));
function preserveAnchors(a,b){for(const id of ids(a))assert.ok(ids(b).includes(id),`Missing old ID ${id}`);const old=headings(a),now=headings(b);assert.ok(old.size);for(const [id,title] of old)assert.equal(now.get(id),title,`Heading changed ${id}`);}
const pages=docs.map(f=>f.replace(/^content\//,'dist/chapters/').replace(/\.md$/,'.html'));
assert.deepEqual((await readdir(path.join(root,'dist/chapters'))).sort(),pages.map(f=>path.basename(f)).sort());
for(const file of pages){const a=article(original(file).toString()),b=article((await read(file)).toString());if(file.endsWith(`/${chapter02}.html`))assert.equal(b,correctCondition(a));else if(!file.endsWith(`/${targetID}.html`))assert.equal(b,a,`Other body changed ${file}`);preserveAnchors(a,b);}
preserveRenderedThird(article(original(`dist/chapters/${targetID}.html`).toString()),article((await read(`dist/chapters/${targetID}.html`)).toString()),'chapter-03');
const oldFull=article(original('dist/all.html').toString()),newFull=article((await read('dist/all.html')).toString());
const sections=html=>new Map([...html.matchAll(/<section class="book-section" id="([^"]+)">([\s\S]*?)<\/section>/g)].map(m=>[m[1],m[0]]));
const aSections=sections(oldFull),bSections=sections(newFull);assert.equal(bSections.size,49);assert.deepEqual([...bSections.keys()],[...aSections.keys()]);
for(const [id,section] of aSections){if(id===chapter02)assert.equal(bSections.get(id),correctCondition(section));else if(id!==targetID)assert.equal(bSections.get(id),section);}
preserveRenderedThird(aSections.get(targetID),bSections.get(targetID),'full-book-chapter-03');
preserveAnchors(oldFull,newFull);
const search=data=>JSON.parse(data.toString().replace(/^window\.BOOK_INDEX=/,'').replace(/;\s*$/,''));
const aSearch=search(original('dist/assets/search-index.js')),bSearch=search(await read('dist/assets/search-index.js'));
assert.equal(bSearch.length,49);assert.deepEqual(bSearch.map(d=>d.url),aSearch.map(d=>d.url));
for(let i=0;i<aSearch.length;i++){if(aSearch[i].url===`chapters/${chapter02}.html`)assert.deepEqual(bSearch[i],{...aSearch[i],text:correctCondition(aSearch[i].text)});else if(aSearch[i].url!==`chapters/${targetID}.html`)assert.deepEqual(bSearch[i],aSearch[i]);}
for(const heading of ['從幅相規格反推寄生電容預算','封裝供電不能只看直流電阻'])assert.ok(bSearch.find(d=>d.url===`chapters/${targetID}.html`).text.includes(heading),`Missing searchable case: ${heading}`);
const verification=JSON.parse(await read('research/verification.json')),oldVerification=JSON.parse(original('research/verification.json'));
assert.deepEqual(verification.errors,[]);assert.equal(oldVerification.numericalChecks,271);assert.equal(verification.numericalChecks,305);
let numberCursor=0;
for(const old of oldVerification.numericalResults){const at=verification.numericalResults.findIndex((n,i)=>i>=numberCursor&&n.name===old.name);assert.ok(at>=numberCursor,`Missing numeric ${old.name}`);assert.deepEqual(verification.numericalResults[at],old);numberCursor=at+1;}
const addedNumbers=verification.numericalResults.filter(n=>n.name.startsWith('03 industry '));assert.equal(addedNumbers.length,34);assert.ok(addedNumbers.every(n=>n.passed));
for(const id of ['01-engineering-map',chapter02,targetID]){const zip=spawnSync('unzip',['-p',path.join(root,'dist/engineering-textbook-html.zip'),`chapters/${id}.html`],{maxBuffer:12*1024*1024});assert.equal(zip.status,0);assert.ok(zip.stdout.equals(await read(`dist/chapters/${id}.html`)));}
const report={phase:'unit03-industry-expansion-and-prerequisite-review',baseline,originalBlocks:178,verbatimBlocks:176,adjustedBlocks:2,originalExercisesPreserved:12,addedExercises:4,originalReferencesPreserved:8,totalReferenceEntries:refs(after).length,originalChapterFiguresPreserved:7,addedChapterFigures:2,otherNumericDocumentsUnchanged:47,chapter02OnlyExplicitConditionClarification:true,oldSourceFiguresUnchanged:23,reviewedChanges,chapterURLsAndOldHeadingAnchorsPreserved:49,otherRenderedChapterBodiesUnchanged:47,chapter02RenderedOnlyConditionClarification:true,fullBookOrderPreserved:true,otherSearchEntriesUnchanged:47,oldNumericalResultsUnchanged:271,newNumericalChecks:34,numericalChecks:305,offlineReviewedChaptersMatch:true,hanCharacters:{before:(before.match(/\p{Script=Han}/gu)||[]).length,after:(after.match(/\p{Script=Han}/gu)||[]).length},browserQA:'Unavailable: no enabled browser on 2026-10-26. SVG rendering and internal review are separate from browser/experimental certification.',unchanged,blockMap,errors:[]};
report.renderedPreservation=renderedPreservation;report.figureGeometry=figureGeometry;
await writeFile(path.join(root,'research/unit-03-industry-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,unchanged:undefined,blockMap:undefined},null,2));
