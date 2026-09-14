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

  function apply(){
    if(!document.head||!document.body)return;
    if(!document.getElementById('dietary-badge-direct-style')){
      const style=document.createElement('style');
      style.id='dietary-badge-direct-style';
      style.textContent=BADGE_CSS;
      document.head.appendChild(style);
    }
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
