import assert from 'node:assert/strict';
import {readFile, readdir, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {industryStages, supportPaths, workflowSources, validateLearningPaths, roadmapMarkdown} from '../src/learning-paths.mjs';

// This is a historical phase-one preservation audit, not a movable baseline.
const baseline = '96b41d18f89cf3e897e9bc7c5b24519d7ab3c8f2';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(path.join(root, file));
const hash = data => createHash('sha256').update(data).digest('hex');
function git(args) {
  const result = spawnSync('git', args, {cwd: root, maxBuffer: 64 * 1024 * 1024});
  assert.equal(result.status, 0, `git ${args[0]} failed: ${result.stderr}`);
  return result.stdout;
}
const original = file => git(['show', `${baseline}:${file}`]);
const tracked = git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n');
const sourceFiles = tracked.filter(file => /^content\/\d{2}-[a-z0-9-]+\.md$/.test(file));
const figures = tracked.filter(file => /^assets\/figures\/.*\.svg$/.test(file));
assert.equal(sourceFiles.length, 49);
assert.equal(figures.length, 22);
assert.deepEqual((await readdir(path.join(root, 'content'))).filter(file => /^\d{2}-[a-z0-9-]+\.md$/.test(file)).sort(), sourceFiles.map(file => file.slice(8)).sort());
assert.deepEqual((await readdir(path.join(root, 'assets/figures'))).sort(), figures.map(file => path.basename(file)).sort());
const preserved = [];
for (const file of [...sourceFiles, ...figures, 'dist/book.md', 'dist/assets/search-index.js', 'src/models.js']) {
  const current = await read(file);
  assert.ok(current.equals(original(file)), `Preservation failed: ${file}`);
  preserved.push({file, sha256: hash(current)});
}

const baselineManifest = JSON.parse(original('dist/book-manifest.json'));
const manifest = JSON.parse(await read('dist/book-manifest.json'));
assert.deepEqual(manifest.documents, baselineManifest.documents);
for (const field of ['chapters', 'appendices', 'hanCharacters', 'equations']) assert.equal(manifest[field], baselineManifest[field], field);
assert.equal(manifest.generatedPages, 53);
const article = html => {
  const match = html.match(/<article class="prose">([\s\S]*?)<\/article>/);
  assert.ok(match, 'Missing chapter or full-book prose');
  return match[1];
};
const ids = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const docs = manifest.documents.map(doc => ({...doc, num: Number(doc.file.slice(0, 2)), id: doc.file.slice(0, -3), fullTitle: doc.title, name: doc.title.replace(/^第\s*\d+\s*章[\s　]*/, '')}));
const chapterPages = docs.map(doc => `dist/chapters/${doc.id}.html`);
assert.deepEqual((await readdir(path.join(root, 'dist/chapters'))).sort(), chapterPages.map(file => path.basename(file)).sort());
for (const [index, file] of chapterPages.entries()) {
  const before = original(file).toString(), after = (await read(file)).toString();
  assert.equal(article(after), article(before), `Rendered body changed: ${file}`);
  assert.deepEqual(ids(article(after)), ids(article(before)), `Anchor changed: ${file}`);
  assert.ok(after.includes(`aria-current="page" href="../chapters/${docs[index].id}.html"`), `Active chapter lost: ${file}`);
  assert.ok(after.includes('aria-label="本章的產業與工具定位"'), `Chapter position missing: ${file}`);
  for (const oldID of ids(before)) assert.ok(ids(after).includes(oldID), `Old ID lost: ${file}#${oldID}`);
  if (index > 0) assert.ok(after.includes(`<a href="${docs[index-1].id}.html"><small>原章序 · 上一章</small>`), `Previous chapter changed: ${file}`);
  if (index + 1 < docs.length) assert.ok(after.includes(`<a href="${docs[index+1].id}.html"><small>原章序 · 下一章</small>`), `Next chapter changed: ${file}`);
}
assert.equal(article((await read('dist/all.html')).toString()), article(original('dist/all.html').toString()), 'Full-book body/order changed');

validateLearningPaths(docs);
assert.equal(industryStages.length, 6);
assert.equal(workflowSources.length, 6);
assert.throws(() => validateLearningPaths(docs.filter(doc => doc.num !== 12)), /Unknown learning-path chapter/);
assert.throws(() => validateLearningPaths([...docs, {num: 50, file: '50-unmapped.md'}]), /lacks a learning-path position/);
const roadmap = (await read('dist/roadmap.html')).toString();
const home = (await read('dist/index.html')).toString();
for (const stage of industryStages) {
  assert.equal((roadmap.match(new RegExp(`data-stage="${stage.id}"`, 'g')) || []).length, 1);
  assert.ok(home.includes(`href="roadmap.html#${stage.id}"`), `Homepage misses ${stage.id}`);
  for (const field of ['input', 'output', 'evidence', 'existing', 'gap', 'handoff']) assert.ok(stage[field]?.length > 10, `${stage.id} lacks ${field}`);
  assert.ok(stage.sources.length, `${stage.id} lacks source mapping`);
}
for (const route of supportPaths) assert.ok(roadmap.includes(`id="${route.id}"`));
assert.ok(roadmap.includes('尚非完整 RTL-to-GDS 或類比投片課程'));
assert.ok(roadmap.includes('不是唯一業界標準'));
assert.ok(roadmap.includes('不是封裝設計的起點') || roadmap.includes('在設計前期就開始'));
assert.equal((await read('content/learning-paths.md')).toString(), roadmapMarkdown(docs), 'GitHub guide differs from website data');
for (const file of ['dist/index.html', 'dist/all.html', 'dist/quality.html', 'dist/roadmap.html', ...chapterPages]) {
  const html = (await read(file)).toString();
  const prefix = file.includes('/chapters/') ? '../' : '';
  assert.ok(html.includes(`href="${prefix}roadmap.html"`), `No roadmap entry: ${file}`);
  assert.ok(html.includes(`href="${prefix}roadmap.html#foundations"`), `No foundation entry: ${file}`);
  assert.ok(html.includes(`href="${prefix}index.html#curriculum"`), `No original index: ${file}`);
}
const zip = spawnSync('unzip', ['-p', path.join(root, 'dist/engineering-textbook-html.zip'), 'roadmap.html'], {maxBuffer: 8 * 1024 * 1024});
assert.equal(zip.status, 0);
assert.ok(zip.stdout.equals(await read('dist/roadmap.html')), 'Offline roadmap differs');
const report = {
  phase: 'industry-navigation-only', baseline,
  numericSourceDocumentsUnchanged: sourceFiles.length, sourceFiguresUnchanged: figures.length,
  chapterURLsUnchanged: chapterPages.length, renderedChapterBodiesUnchanged: chapterPages.length,
  fullBookBodyAndOrderUnchanged: true, mergedMarkdownUnchanged: true, searchIndexUnchanged: true,
  manifestBodyCountsUnchanged: true, lifecycleStages: industryStages.length,
  supportRoutes: supportPaths.length, workflowSourceGroups: workflowSources.length,
  generatedGitHubGuideMatches: true, offlineRoadmapMatches: true,
  invalidRouteReferenceAndUnmappedChapterRejected: true,
  browserQA: 'Unavailable: cua returned apps=[], browsers=[] on 2026-10-25. No visual or interaction certification.',
  preserved, errors: [],
};
await writeFile(path.join(root, 'research/industry-roadmap-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({...report, preserved: undefined}, null, 2));
