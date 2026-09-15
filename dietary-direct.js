(() => {
  const BADGE_CSS = `
    .gf-friendly-badge,.vegan-badge{
      display:inline-flex!important;align-items:center;justify-content:center;vertical-align:middle;
      margin-left:4px;padding:1px 5px 1.5px;border-radius:999px;
      font-family:'Work Sans',Segoe UI,Arial,sans-serif;font-size:.78em!important;
      line-height:1.05!important;font-weight:700!important;letter-spacing:.045em;white-space:nowrap;
    }
    .gf-friendly-badge{min-width:23px;border:1px solid rgba(87,105,74,.68);background:rgba(87,105,74,.10);color:#57694A!important}
    .vegan-badge{border:1px solid rgba(47,119,85,.72);background:rgba(47,119,85,.10);color:#2F7755!important}
    .gf-friendly-badge::before,.vegan-badge::before{
      content:'';display:inline-block;width:5px;height:8px;margin-right:3px;border-radius:80% 0 80% 0;
      background:currentColor;transform:rotate(-32deg);opacity:.9;
    }
    body[data-screen="Screen 3"] .bulk-two-column .bulk-items{
      display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:23.76px;
    }
    body[data-screen="Screen 3"] .bulk-two-column .bulk-items .item:nth-child(even){
      padding-left:11.88px!important;border-left:1px solid var(--line)!important;
    }
  `;

  function makeBadge(type){
    const vegan=type==='vegan';
    const el=document.createElement('span');
    el.className=vegan?'vegan-badge':'gf-friendly-badge';
    el.textContent=vegan?'VEGAN':'GF';
    el.title=vegan?'Vegan':'Gluten Friendly';
    el.setAttribute('aria-label',el.title);
    return el;
  }

  function transformTextNode(node){
    const text=node.nodeValue||'';
    if(!/(\(\s*GF\s*\)|\bVegan\b)/i.test(text))return;
    const parent=node.parentElement;
    if(!parent||parent.closest('.gf-friendly-badge,.vegan-badge,script,style,noscript,textarea'))return;
    const parts=text.split(/(\(\s*GF\s*\)|\bVegan\b)/ig);
    if(parts.length<2)return;
    const frag=document.createDocumentFragment();
    for(const part of parts){
      if(/^\(\s*GF\s*\)$/i.test(part))frag.appendChild(makeBadge('gf'));
      else if(/^Vegan$/i.test(part))frag.appendChild(makeBadge('vegan'));
      else if(part)frag.appendChild(document.createTextNode(part));
    }
    node.replaceWith(frag);
  }

  function applyBulkLayout(){
    if(!document.body||document.body.dataset.screen!=='Screen 3')return;
    const sections=[...document.querySelectorAll('#content .category')];
    const bulk=sections.find(section=>{
      const title=section.querySelector('.category-title');
      return title&&/bulk/i.test((title.textContent||'').trim());
    });
    if(!bulk||bulk.classList.contains('bulk-two-column'))return;
    const items=[...bulk.querySelectorAll(':scope > .item')];
    if(!items.length)return;
    const grid=document.createElement('div');
    grid.className='bulk-items';
    items.forEach(item=>grid.appendChild(item));
    bulk.appendChild(grid);
    bulk.classList.add('bulk-two-column');
  }

  function apply(){
    if(!document.head||!document.body)return;
    if(!document.getElementById('dietary-badge-direct-style')){
      const style=document.createElement('style');
      style.id='dietary-badge-direct-style';
      style.textContent=BADGE_CSS;
      document.head.appendChild(style);
    }
    applyBulkLayout();
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];let current;
    while((current=walker.nextNode()))nodes.push(current);
    nodes.forEach(transformTextNode);
  }

  function activate(){
    apply();
    if(document.body&&!document.body.dataset.dietaryBadgeDirectObserver){
      document.body.dataset.dietaryBadgeDirectObserver='1';
      let scheduled=false;
      const observer=new MutationObserver(()=>{
        if(scheduled)return;
        scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;apply();});
      });
      observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    }
    [250,750,1500,3000].forEach(ms=>setTimeout(apply,ms));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',activate,{once:true});
  else activate();
})();
