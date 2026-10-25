// Execute the full browser script against a minimal DOM stub, not a real browser.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../src/book.js', import.meta.url), 'utf8');

function harness({narrow = true} = {}) {
  const location = new URL('https://example.test/roadmap.html');
  const selectors = new Map(), frames = [];
  let document;
  class Element {
    constructor(tag = 'div', attributes = {}) {
      this.tagName = tag.toUpperCase();
      this.attributes = new Map(Object.entries(attributes));
      this.listeners = new Map(); this.children = [];
      this.style = {}; this.dataset = {}; this.hidden = false;
      this.inert = false; this.value = '';
      const classes = new Set();
      this.classList = {
        contains: value => classes.has(value),
        toggle(value, force) {
          const next = force ?? !classes.has(value);
          next ? classes.add(value) : classes.delete(value);
          return next;
        },
      };
    }
    get href() { return new URL(this.getAttribute('href') || '', location).href; }
    get target() { return this.getAttribute('target') || ''; }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    hasAttribute(name) { return this.attributes.has(name); }
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(listener); this.listeners.set(type, listeners);
    }
    append(...children) { for (const child of children) { child.parentElement = this; this.children.push(child); } }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    closest(selector) {
      if (selector === 'a[href]') for (let node = this; node; node = node.parentElement) {
        if (node.tagName === 'A' && node.hasAttribute('href')) return node;
      }
      return null;
    }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    querySelectorAll(selector) { return selector === 'a,button' ? this.children.filter(child => /^(A|BUTTON)$/.test(child.tagName)) : []; }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
  }
  for (const selector of [
    '#main', '#sidebar', '#menuToggle', '#menuClose', '#navShade', '#themeToggle', '#printPage',
    '#searchDialog', '#searchInput', '#searchResults', '#searchCount', '#searchOpen', '#progress',
    '#foundations', '#材料與元件', '.toolbar', '.page-toc',
  ]) selectors.set(selector, new Element());
  const body = new Element('body');
  document = {
    body, documentElement: {scrollHeight: 2000, dataset: {}}, activeElement: null,
    querySelector: selector => selectors.get(selector) || null,
    querySelectorAll: () => [], getElementById: id => selectors.get(`#${id}`) || null,
    createElement: tag => new Element(tag), addEventListener() {},
  };
  const sandbox = {
    document, location, URL, matchMedia: () => ({matches: narrow, addEventListener() {}}),
    BOOK_INDEX: [], innerHeight: 800, scrollY: 0, addEventListener() {},
    requestAnimationFrame: callback => frames.push(callback), setTimeout: callback => frames.push(callback),
    clearTimeout() {}, localStorage: {getItem: () => null, setItem() {}}, print() {},
  };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, {filename: 'src/book.js'});
  const get = selector => selectors.get(selector);
  function fire(element, overrides = {}) {
    const event = {
      target: element, currentTarget: element, button: 0,
      ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, defaultPrevented: false,
      preventDefaultCalls: 0,
      preventDefault() { this.defaultPrevented = true; this.preventDefaultCalls++; }, ...overrides,
    };
    for (const listener of element.listeners.get('click') || []) listener.call(element, event);
    while (frames.length) frames.shift()();
    return event;
  }
  function open() { fire(get('#menuToggle')); assert.equal(body.classList.contains('menu-open'), true); }
  function clickLink(href, overrides = {}, attributes = {}) {
    const anchor = new Element('a', {href, ...attributes}), child = new Element('span');
    anchor.append(child); get('#sidebar').append(anchor);
    return fire(get('#sidebar'), {target: child, ...overrides});
  }
  return {document, body, get, open, clickLink};
}

function assertClosed(h) {
  assert.equal(h.body.classList.contains('menu-open'), false);
  assert.equal(h.get('#menuToggle').getAttribute('aria-expanded'), 'false');
  assert.equal(h.get('#navShade').hidden, true);
  assert.equal(h.get('#sidebar').inert, true);
  for (const selector of ['#main', '.toolbar', '.page-toc']) assert.equal(h.get(selector).inert, false, selector);
}
let cases = 0;
for (const id of ['foundations', '材料與元件']) {
  const h = harness(); h.open();
  assert.equal(h.get('#main').inert, true);
  const event = h.clickLink(`roadmap.html#${encodeURIComponent(id)}`);
  assertClosed(h);
  assert.equal(h.document.activeElement, h.get(`#${id}`));
  assert.equal(h.get(`#${id}`).getAttribute('tabindex'), '-1');
  assert.equal(event.defaultPrevented, false);
  assert.equal(event.preventDefaultCalls, 0); cases++;
}
for (const href of ['roadmap.html', 'roadmap.html#missing', 'roadmap.html#%E0%A4%A']) {
  const h = harness(); h.open();
  const event = h.clickLink(href); assertClosed(h);
  assert.equal(h.document.activeElement, h.get('#main'));
  assert.equal(event.preventDefaultCalls, 0); cases++;
}
for (const overrides of [{ctrlKey: true}, {metaKey: true}, {shiftKey: true}, {altKey: true}, {button: 1}, {defaultPrevented: true}]) {
  const h = harness(); h.open();
  const event = h.clickLink('roadmap.html#foundations', overrides);
  assert.equal(h.body.classList.contains('menu-open'), true);
  assert.equal(h.get('#main').inert, true);
  assert.equal(h.get('#navShade').hidden, false);
  assert.equal(event.preventDefaultCalls, 0); cases++;
}
for (const [href, attrs] of [['https://external.test', {}], ['roadmap.html', {target: '_blank'}], ['roadmap.html', {download: ''}]]) {
  const h = harness(); h.open();
  const event = h.clickLink(href, {}, attrs);
  assert.equal(h.body.classList.contains('menu-open'), true);
  assert.equal(event.preventDefaultCalls, 0); cases++;
}
{
  const h = harness(); h.open();
  const event = h.clickLink('chapters/01-engineering-map.html'); assertClosed(h);
  assert.equal(event.preventDefaultCalls, 0); cases++;
}
{
  const h = harness({narrow: false}); h.open(); h.clickLink('roadmap.html#foundations');
  assert.equal(h.body.classList.contains('menu-open'), true); cases++;
}
console.log(JSON.stringify({navigationStubCases: cases, errors: [], realBrowser: false}));
