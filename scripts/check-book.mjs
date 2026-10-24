import assert from 'node:assert/strict';
import {readFile,readdir,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {cases} from './numerical-cases.mjs';
import {Marked} from 'marked';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const draft=process.argv.includes('--draft');
const manifest=JSON.parse(await readFile(path.join(dist,'book-manifest.json'),'utf8'));
if(!draft){assert.equal(manifest.chapters,46);assert.equal(manifest.appendices,3);}
const errors=[],chapterReview=[],numbers=[];
const must=(test,message)=>{if(!test)errors.push(message);};
const markdownParser=new Marked();
const chapterFigures=new Map();
function markdownImages(md){
  const images=[];
  markdownParser.walkTokens(markdownParser.lexer(md),token=>{
    if(token.type==='image')images.push({href:token.href,alt:token.text});
  });
  return images;
}
for(const doc of manifest.documents){
  const md=await readFile(path.join(root,'content',doc.file),'utf8');
  const n=Number(doc.file.slice(0,2));
  const figures=markdownImages(md);
  chapterFigures.set(doc.file,figures);
  for(const figure of figures){
    must(figure.alt.replace(/<[^>]*>/g,'').trim().length>0,`${doc.file}:figure has empty alt text`);
    must(/^\.\.\/assets\/figures\/[a-z0-9][a-z0-9._-]*\.(svg|png)$/i.test(figure.href),`${doc.file}:unsupported figure URL ${figure.href}`);
  }
  if(n===1){
    must(new Set(figures.map(f=>f.href)).size>=8,`${doc.file}:fewer than eight distinct figures`);
    must((md.match(/\*\*練習 \d+：/g)||[]).length===8,`${doc.file}:expected eight complete exercises`);
    must((md.match(/\*\*解答。\*\*/g)||[]).length===8,`${doc.file}:expected eight solutions`);
    const captions=[...md.matchAll(/^圖 1-(\d+)　/gm)].map(m=>Number(m[1]));
    must(JSON.stringify(captions)===JSON.stringify([1,2,3,4,5,6,7,8]),`${doc.file}:figure captions not consecutive`);
    const readingOrder=['## 1. 先問產品','## 2. 先認物件','## 3. 跟著一筆','## 4. 跟著一顆','## 5. 走進晶圓廠','## 6. 回到工程決策','## 7. 回看整張地圖','## 練習與參考解答'].map(t=>md.indexOf(t));
    must(readingOrder.every((v,i)=>v>=0&&(i===0||v>readingOrder[i-1])),`${doc.file}:reading sequence missing or out of order`);
    const adcIntro=md.indexOf('3.2 先備小步驟'),adcPractice=md.indexOf('**練習 5：ADC');
    must(adcIntro>=0&&adcPractice>adcIntro,`${doc.file}:ADC prerequisites must precede practice`);
  }
  if(n===2){
    must(new Set(figures.map(f=>f.href)).size>=7,doc.file+':fewer than seven distinct figures');
    must((md.match(/\*\*練習 \d+。/g)||[]).length===12,doc.file+':expected twelve exercises');
    must((md.match(/\*\*解答。\*\*/g)||[]).length===12,doc.file+':expected twelve solutions');
    const captions=[...md.matchAll(/^圖 2-(\d+)　/gm)].map(m=>Number(m[1]));
    must(JSON.stringify(captions)===JSON.stringify([1,2,3,4,5,6,7]),doc.file+':figure captions not consecutive');
    const order=['## 1. 先把問題','## 2. 從變化率','## 3. 把守恆律','## 4. 增加節點','## 5. 儀器只有','## 6. 從理想值','## 練習與完整參考解答'].map(t=>md.indexOf(t));
    must(order.every((v,i)=>v>=0&&(i===0||v>order[i-1])),doc.file+':reading sequence missing or out of order');
  }
  if(n>=90)continue;
  const links=[...new Set([...md.matchAll(/\]\((https?:\/\/[^\s)]+)/g)].map(m=>m[1]))];
  must(doc.characters>=1000,`${doc.file}:正文不足1000中文字`);
  must((md.match(/^## /gm)||[]).length>=5,`${doc.file}:缺少完整教學段落`);
  must(/學習目標|學習成果/.test(md),`${doc.file}:缺少學習目標`);
  must(/先備/.test(md),`${doc.file}:缺少先備知識`);
  must(/例題|算例|案例/.test(md),`${doc.file}:缺少算例`);
  const practice=md.split(/^## /m).find(s=>/^[^\n]*(?:練習|習題)/.test(s))||'';
  const questions=(practice.match(/\*\*(?:練習|習題)\s*(?:[12一二])/g)||[]).length+(practice.match(/^[12]\. /gm)||[]).length;
  must(questions>=2,`${doc.file}:少於兩道練習`);
  must((md.match(/\*\*解答/g)||[]).length>=2,`${doc.file}:少於兩道解答`);
  must(links.length>=2,`${doc.file}:少於兩筆引用`);
  must(!/TODO|TBD|待補|施工中/.test(md),`${doc.file}:有未完成標記`);
  chapterReview.push({file:doc.file,hanCharacters:doc.characters,references:links.length});
}
async function walk(dir){let all=[];for(const d of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,d.name);all.push(...d.isDirectory()?await walk(p):[p]);}return all;}
const files=await walk(dist),htmlFiles=files.filter(f=>f.endsWith('.html'));
const pages=new Map();
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
let localLinks=0;
let imageReferences=0;
const external=new Set();
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  const stripped=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const ids=[...stripped.matchAll(/\bid="([^"]+)"/g)].map(m=>decode(m[1]));
  must(new Set(ids).size===ids.length,`${path.relative(dist,file)}:duplicate ids`);
  must(html.startsWith('<!doctype html>'),`${file}:doctype`);
  must(html.includes('lang="zh-Hant"'),`${file}:language`);
  must(!/katex-error/.test(stripped),`${file}:KaTeX error`);
  must(!stripped.includes('$$'),`${file}:unrendered block math`);
  must(!/chenwei810|Semiconductor_Manufacturing_Introduction|course-notes|images\//i.test(stripped),`${file}:legacy expression/asset in new output`);
  must(html.includes('assets/models.js'),`${file}:calculator dependency missing`);
  must(html.includes('aria-labelledby="searchLabel"'),`${file}:search dialog accessible name missing`);
  const images=[...stripped.matchAll(/<img\b[^>]*>/gi)].map(m=>{
    const attr=name=>decode(m[0].match(new RegExp(`\\b${name}=(["'])(.*?)\\1`,'i'))?.[2]||'');
    const src=attr('src');
    must(attr('alt').replace(/&nbsp;|&#160;/g,' ').trim().length>0,`${file}:image has empty alt text`);
    must(attr('loading')==='lazy'&&attr('decoding')==='async',`${file}:image loading/decoding attributes missing`);
    must(Number(attr('width'))>0&&Number(attr('height'))>0,`${file}:image dimensions missing`);
    must(/^(?:\.\.\/)?assets\/figures\/[a-z0-9][a-z0-9._-]*\.(svg|png)$/i.test(src),`${file}:unsupported rendered image URL ${src}`);
    imageReferences++;
    return src;
  });
  pages.set(file,{html,ids:new Set(ids),images});
}
const expectedFullImages=[];
for(const [file,figures] of chapterFigures){
  const expected=figures.map(f=>f.href);
  const rendered=pages.get(path.join(dist,'chapters',file.replace(/\.md$/,'.html')))?.images;
  must(JSON.stringify(rendered)===JSON.stringify(expected),`${file}:chapter figure URLs/count do not match source`);
  expectedFullImages.push(...expected.map(href=>href.replace(/^\.\.\//,'')));
}
must(JSON.stringify(pages.get(path.join(dist,'all.html'))?.images)===JSON.stringify(expectedFullImages),'Full book figure URLs/count do not match source');
const mergedImages=markdownImages(await readFile(path.join(dist,'book.md'),'utf8'));
must(JSON.stringify(mergedImages.map(f=>f.href))===JSON.stringify(expectedFullImages),'Merged Markdown figure URLs/count do not match source');
for(const figure of mergedImages){
  must(figure.alt.trim().length>0,'Merged Markdown figure has empty alt text');
  must(files.includes(path.resolve(dist,figure.href)),`Merged Markdown missing figure ${figure.href}`);
}
let sourceFigures=[];
try{sourceFigures=await walk(path.join(root,'assets','figures'));}
catch{errors.push('Source figure directory is missing');}
const figureStyle=JSON.parse(await readFile(path.join(root,'research','figure-style.json'),'utf8'));
const figureColors=new Set(Object.values(figureStyle.colors).map(color=>color.toLowerCase()));
const usedFigures=new Set(expectedFullImages);
for(const file of sourceFigures){
  const target=path.join(dist,path.relative(root,file));
  must(usedFigures.has(path.relative(root,file).split(path.sep).join('/')),`Unused source figure: ${path.relative(root,file)}`);
  try{must((await readFile(file)).equals(await readFile(target)),`Stale deployed figure: ${path.relative(root,file)}`);}
  catch{errors.push(`Missing deployed figure: ${path.relative(root,file)}`);}
  if(file.endsWith('.svg')){
    const svg=await readFile(file,'utf8');
    must(/<title\b[^>]*>[^<]+<\/title>/.test(svg)&&/<desc\b[^>]*>[^<]+<\/desc>/.test(svg),`${file}:SVG title or description missing`);
    must(!/<script\b|<foreignObject\b|\son\w+=|(?:href|src)=["']https?:/i.test(svg),`${file}:SVG contains active/external content`);
    must(svg.includes(`data-figure-style="${figureStyle.id}"`),`${file}:shared figure style identifier missing`);
    must(!/<(?:linearGradient|radialGradient|filter|image)\b/i.test(svg),`${file}:figure must use flat self-contained vector geometry`);
    for(const color of svg.match(/#[0-9a-f]{6}\b/gi)||[]){
      must(figureColors.has(color.toLowerCase()),`${file}:color outside shared palette ${color}`);
    }
  }
}
for(const [file,{html}] of pages){
  const resourceHTML=html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi,'');
  for(const m of resourceHTML.matchAll(/\b(href|src)="([^"]+)"/g)){
    const raw=decode(m[2]);
    if(/^https?:\/\//.test(raw)){external.add(raw);must(m[1]!=='src',`${file}:external runtime asset`);continue;}
    if(/^(mailto:|data:)/.test(raw))continue;
    must(!/^javascript:/i.test(raw),`${file}:unsafe URL`);
    const [pathname,hash]=raw.split('#');
    const target=pathname?path.resolve(path.dirname(file),decodeURIComponent(pathname.split('?')[0])):file;
    must(target===dist||target.startsWith(dist+path.sep),`${file}:escaped output path ${raw}`);
    try{await stat(target);}catch{errors.push(`${path.relative(dist,file)}:missing target ${raw}`);continue;}
    if(hash&&pages.has(target))must(pages.get(target).ids.has(decodeURIComponent(hash)),`${path.relative(dist,file)}:missing anchor ${raw}`);
    localLinks++;
  }
}
for(const file of files.filter(f=>f.endsWith('.css'))){
  const css=await readFile(file,'utf8');
  for(const m of css.matchAll(/url\((?:["']?)([^)'"\s]+)(?:["']?)\)/g)){
    if(m[1].startsWith('data:'))continue;
    const f=path.resolve(path.dirname(file),m[1]);
    try{await stat(f);}catch{errors.push(`Missing CSS resource ${m[1]}`);}
  }
}
for(const f of ['src/book.js','src/models.js','scripts/build-book.mjs']){
  const result=spawnSync(process.execPath,['--check',path.join(root,f)],{encoding:'utf8'});
  must(result.status===0,`${f}:JavaScript syntax ${result.stderr}`);
}
function near(name,actual,expected,tolerance=1e-6){
  const passed=Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance*Math.max(1e-15,Math.abs(expected));
  numbers.push({name,actual,expected,passed});must(passed,`Numerical check: ${name}: ${actual} != ${expected}`);
}
for(const [name,actual,expected] of cases)near(name,actual,expected,5e-5);
near('01 average current, uA',12000*.004+8*.996,55.968);
near('01 energy/day J',55.968e-6*3*86400,14.5069056);
near('01 lifetime hours',200/(55.968/1000),3573.471984,1e-6);
near('01 slower sampling uA',12000*.002+8*.998,31.984);
near('01 usable wafer area mm2',Math.PI*95**2,28352.87369865);
near('01 wafer-test good dies',240*.8,192);
near('01 expected delivered dies',240*.8*.95,182.4);
near('01 delivered cost',(2400+192*2)/182.4,15.2631578947);
near('01 Little law cycle days',1200/40,30);
near('01 Little law faster cycle days',1200/50,24);
near('01 exercise 6 improved delivered cost',2784/192,14.5);
near('01 exercise 7 larger WIP cycle days',1600/40,40);
near('40 deliverable dies',600*Math.exp(-.12)*.98*.99,516.29412462);
near('40 delivered cost',(5000+1.5*600*Math.exp(-.12))/(600*Math.exp(-.12)*.98*.99),11.23047526);
near('41 beam stiffness N/m',160e9*16e-6*(2e-6)**3/(4*(160e-6)**3),1.25);
near('41 displacement nm',25e-9/1.25*1e9,20);
near('41 thickness ratio',1.05**3,1.157625);
near('41 capacitor change fF',.8e-12*(2e-6/(2e-6-10e-9)-1)*1e15,4.020100503);
const velocity=6e-9/60/(300e-6*60e-6);
near('42 mean speed m/s',velocity,1/180);
near('42 Reynolds',1000*velocity*100e-6/.001,5/9);
near('42 residence seconds',.005/velocity,.9);
near('42 diffusion seconds',(30e-6)**2/(2*50e-12),9);
near('42 Peclet',velocity*60e-6/50e-12,20000/3);
near('43 Kd nM',.005/2e5*1e9,25);
near('43 theta',50/(50+25),2/3);
near('43 time 90%',Math.log(10)/(2e5*50e-9+.005),153.5056729);
near('43 wash fraction',Math.exp(-.005*600),.0497870684);
near('44 Debye nm',.304/Math.sqrt(.01),3.04);
near('44 current uA',.2e-3*5e-3*Math.exp(-6/3.04)*1e6,.1389440131);
near('44 input noise uV',12e-9/.3e-3*1e6,40);
near('45 Cottrell uA',96485*5e-7*.2*Math.sqrt(6e-10/Math.PI)*1e6,.133340012);
near('45 pore nS',Math.PI*(5e-9)**2/50e-9*1e9,Math.PI/2);
near('45 photon SNR',10000/Math.sqrt(12500),89.4427191);
near('46 detection threshold uA',1.645*.012,.01974);
near('46 LOD nM',2*1.645*.012/.4,.0987);
near('46 molecule count',2e-18*20e-6*6.02214076e23,24.08856304);
near('46 zero probability',Math.exp(-.2408856304),.78593151,1e-6);
near('46 at least one',1-Math.exp(-.5),.3934693403);
near('46 lambda for 95%',-Math.log(.05),2.995732274);
const ctx=vm.createContext({});vm.runInContext(await readFile(path.join(root,'src/models.js'),'utf8'),ctx);
near('interactive power default',ctx.BookModels.powerMilliwatts(.2,20,.8,100),.256);
near('interactive power alternative',ctx.BookModels.powerMilliwatts(.2,20,.7,120),.2352);
near('interactive zero switching',ctx.BookModels.powerMilliwatts(0,20,.8,100),0);
near('interactive defect yield',ctx.BookModels.poissonYield(.4,.3),.8869204367);
near('interactive no defects',ctx.BookModels.poissonYield(.4,0),1);
must(ctx.BookModels.powerMilliwatts(1.1,20,.8,100)===null,'activity >1 rejected');
must(ctx.BookModels.powerMilliwatts(.2,NaN,.8,100)===null,'NaN rejected');
must(ctx.BookModels.powerMilliwatts(.2,1e308,1e308,1e308)===null,'overflow rejected');
must(ctx.BookModels.poissonYield(-1,.3)===null,'negative area rejected');
const zipFile=path.join(dist,'engineering-textbook-html.zip');
const zipTest=spawnSync('unzip',['-t',zipFile],{encoding:'utf8'});
must(zipTest.status===0,'Offline ZIP integrity failed');
const zipList=spawnSync('unzip',['-Z1',zipFile],{encoding:'utf8'}).stdout.split('\n');
const offlineHome=spawnSync('unzip',['-p',zipFile,'index.html'],{encoding:'utf8'}).stdout;
must(!offlineHome.includes('href="engineering-textbook-html.zip"'),'Offline homepage links to missing nested ZIP');
for(const relative of files.map(f=>path.relative(dist,f)).filter(f=>!f.endsWith('.zip')))must(zipList.includes(relative),`Offline ZIP missing ${relative}`);
for(const file of sourceFigures){
  const relative=path.relative(root,file).split(path.sep).join('/');
  must(zipList.includes(relative),`Offline ZIP missing source figure ${relative}`);
  const archived=spawnSync('unzip',['-p',zipFile,relative],{maxBuffer:32*1024*1024});
  must(archived.status===0&&Buffer.isBuffer(archived.stdout)&&archived.stdout.equals(await readFile(file)),`Offline ZIP figure differs from source: ${relative}`);
}
for(const name of ['book.js','models.js'])must(await readFile(path.join(root,'src',name),'utf8')===await readFile(path.join(dist,'assets',name),'utf8'),`Stale deployed JS: ${name}`);
const indexContext=vm.createContext({window:{}});vm.runInContext(await readFile(path.join(dist,'assets','search-index.js'),'utf8'),indexContext);
must(indexContext.window.BOOK_INDEX.length===manifest.documents.length,'Search index missing chapters');
for(const item of indexContext.window.BOOK_INDEX)must(files.includes(path.join(dist,item.url)),`Search index broken ${item.url}`);
const report={offlineZipIntegrity:zipTest.status===0,searchIndexEntries:indexContext.window.BOOK_INDEX.length,mode:draft?'draft':'release',chapters:manifest.chapters,appendices:manifest.appendices,pages:htmlFiles.length,equations:manifest.equations,localLinksChecked:localLinks,imageReferencesChecked:imageReferences,sourceFigureFilesChecked:sourceFigures.length,externalReferenceURLs:external.size,numericalChecks:numbers.length,numericalResults:numbers,chapterStructure:chapterReview,errors,browserQA:'Unavailable: no enabled browsers in cua. Static structure, links, equation rendering and model unit tests only; no visual certification.'};
await writeFile(path.join(root,'research','verification.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,numericalResults:undefined,chapterStructure:undefined},null,2));
if(errors.length)process.exitCode=1;
