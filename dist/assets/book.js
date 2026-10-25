(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const base = document.body.dataset.base || '';
  const menu = $('#menuToggle'), sidebar = $('#sidebar'), shade = $('#navShade');
  const narrow = matchMedia('(max-width: 1050px)');
  const backdropContent = [$('#main'),$('.toolbar'),$('.page-toc')].filter(Boolean);
  const searchDocs = (window.BOOK_INDEX||[]).map(d=>({...d,normalized:`${d.title} ${d.text}`.toLocaleLowerCase(),lowerText:d.text.toLocaleLowerCase()}));
  if(location.protocol==='file:') document.querySelectorAll('.offline-download').forEach(a=>a.remove());
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-expanded', String(open));
    shade.hidden = !open;
    sidebar.inert = narrow.matches && !open;
    backdropContent.forEach(el=>{el.inert = narrow.matches && open;});
    if (open) $('#menuClose').focus();
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  const closeMenu=()=>{setMenu(false);menu.focus();};
  shade.addEventListener('click',closeMenu);
  $('#menuClose').addEventListener('click',closeMenu);
  sidebar.addEventListener('click', e => {
    if (!narrow.matches || !document.body.classList.contains('menu-open') || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest('a[href]');
    if (!link || !sidebar.contains(link) || link.target === '_blank' || link.hasAttribute('download')) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin) return;
    setMenu(false);
    if (destination.pathname === location.pathname && destination.search === location.search) {
      let target = $('#main');
      try { target = document.getElementById(decodeURIComponent(destination.hash.slice(1))) || target; } catch {}
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    }
    // Preserve native link navigation, including the hash scroll and browser history.
  });
  narrow.addEventListener('change', () => setMenu(false));
  setMenu(false);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {setMenu(false);menu.focus();}
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {e.preventDefault();openSearch();}
    if (e.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const links = [...sidebar.querySelectorAll('a,button')];
      if(e.shiftKey && document.activeElement===links[0]) {e.preventDefault();links.at(-1).focus();}
      else if(!e.shiftKey && document.activeElement===links.at(-1)) {e.preventDefault();links[0].focus();}
    }
  });
  $('#themeToggle').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('engineering-theme', theme); } catch {}
  });
  $('#printPage').addEventListener('click', () => window.print());
  const dialog = $('#searchDialog'), input = $('#searchInput'), results = $('#searchResults');
  function renderSearch() {
    const q = input.value.trim().toLocaleLowerCase();
    const matches = searchDocs.filter(d => d.normalized.includes(q));
    results.replaceChildren();
    $('#searchCount').textContent = q ? `找到 ${matches.length} 個章節或附錄` : '輸入關鍵字可搜尋全書內容';
    for (const doc of matches) {
      const a = document.createElement('a'); a.href = base+doc.url;
      const small = document.createElement('small'); small.textContent = doc.group;
      const strong = document.createElement('strong'); strong.textContent = doc.title;
      a.append(small,strong);
      if(q) {const at=doc.lowerText.indexOf(q);const p=document.createElement('p');p.textContent=doc.text.slice(Math.max(0,at-24),Math.max(0,at)+95);a.append(p);}
      results.append(a);
    }
  }
  function openSearch(){setMenu(false);$('#searchOpen').focus();input.value='';renderSearch();if(!dialog.open)dialog.showModal();input.focus();}
  dialog.addEventListener('close',()=>$('#searchOpen').focus());
  $('#searchOpen').addEventListener('click',openSearch);
  let searchTimer;
  input.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(renderSearch,100);});
  let pending=false;
  function progress(){const h=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=`${h>0?Math.min(100,100*scrollY/h):0}%`;pending=false;}
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(progress);}},{passive:true});
  addEventListener('resize',progress);progress();
  document.querySelectorAll('[data-model]').forEach(form=>{
    form.addEventListener('submit',e=>e.preventDefault());
    const update=()=>{
      const values=Object.fromEntries([...form.querySelectorAll('input')].map(n=>[n.name,n.value.trim()===''?NaN:Number(n.value)]));
      const valid=Object.values(values).every(v=>Number.isFinite(v)&&v>=0);
      let result='請輸入有效且不小於零的數值。';
      if(valid && form.dataset.model==='power') {
        const power=BookModels.powerMilliwatts(values.alpha,values.c,values.v,values.f);
        result=power===null?'請確認活動因子介於0和1之間，且數值未超過可計算範圍。':`動態功耗 ${power.toPrecision(5)} mW；未計漏電與短路功耗。`;
      }
      if(valid && form.dataset.model==='yield') result=`隨機缺陷良率 ${(100*BookModels.poissonYield(values.area,values.density)).toFixed(3)} %。`;
      form.querySelector('output').textContent=result;
    };
    form.addEventListener('input',update);update();
  });
})();
