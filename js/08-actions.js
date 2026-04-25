// ═══════════════════════════════════════
// 액션
// ═══════════════════════════════════════
let buildPanelOpen=true;
function changeChar(k){curChar=k;buildId=null;deck=[...START_DECKS[k]];deckIds=deck.map(()=>__deckSeq++);upgradedIds = new Set();window.upgradedIds = upgradedIds;picks=freshPicks();hist=[];selectedDeckIdx=-1;historyOpen=false;buildPanelOpen=true;renderAll()}
function selectBuild(id){buildId=(id==='auto')?null:(buildId===id?null:id);renderAll()}
function setMode(m){mode=m;picks=freshPicks();renderAll()}
function openSearch(i){activeSlot=i;deckAddMode=false;document.getElementById('modalTitle').textContent=getSlotLabel(i)+' 선택';document.getElementById('modalInput').value='';document.getElementById('searchModal').classList.add('open');updateBodyLock();renderSearchGrid();ensureSearchInputFocus()}
function openDeckAdd(){deckAddMode=true;activeSlot=-1;document.getElementById('modalTitle').textContent='덱에 카드 추가';document.getElementById('modalInput').value='';document.getElementById('searchModal').classList.add('open');updateBodyLock();renderSearchGrid();ensureSearchInputFocus()}
function closeSearch(){document.getElementById('searchModal').classList.remove('open');activeSlot=-1;deckAddMode=false;updateBodyLock()}
function showDetail(name){
  const d=D();const c=getCardMeta(name);const body=document.getElementById('detailBody');const srcs=imgSrcs(name);
  const modal=document.getElementById('detailModal');
  if(modal.classList.contains('open')){
    detailStack.push({html:body.innerHTML,mode:modal.dataset.mode||''});
  }
  const tierC={S:'linear-gradient(120deg,#ff4fd8,#7cf7ff,#fff27a,#ff4fd8)',A:'linear-gradient(180deg,#ffe083,#f59e0b)',B:'linear-gradient(180deg,#d5dce8,#8d98a9)',C:'linear-gradient(180deg,#b98252,#7c4a24)',D:'linear-gradient(180deg,#5b6474,#3a4250)'};const tierL={S:'S — 최우선',A:'A — 좋음',B:'B — 상황따라',C:'C — 비추',D:'D — 소멸 대상'};
  const relA=d.archs.filter(a=>listHasCard(a.must,name)||listHasCard(a.rec,name));const relC=d.combos.filter(cb=>listHasCard(cb.cards,name));const inD=deckHasCard(name);
  const unlockCond=UNLOCK[name];
  const comboText=(cb)=>{
    const others=cb.cards.filter(x=>x!==name);
    const parts=others.map(p=>`<span class="combo-card-link" onclick="event.stopPropagation();showDetail('${p.replace(/'/g, '&#39;')}')">${tn(p)}</span>`);
    return parts.join(' · ');
  };
  let h=`<img class="detail-img" src="${srcs[0]}" onerror="this.onerror=null;this.src='${srcs[1]||srcs[0]}'">`;
  if(unlockCond)h+=`<div style="margin:-2px 0 10px;padding:10px 12px;border-radius:10px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);font-size:13px;color:#fbbf24;line-height:1.5;text-align:center">🔒 해금 조건: ${unlockCond}</div>`;
  h+=`<div class="detail-name">${tn(name)}</div><div class="detail-meta">`;
  if(c){h+=`<span class="detail-chip" style="background:${tierC[c.tier]};color:${c.tier==='A'?'#221305':'#fff'};border:1px solid rgba(255,255,255,.2)">${tn(tierL[c.tier]||c.tier)}</span><span class="detail-chip" style="background:var(--bd2);color:var(--sub)">${tn(c.t)}</span><span class="detail-chip" style="background:var(--bd2);color:var(--sub)">${t('common.costUnit',{c:c.c==='X'?'X':c.c})}</span><span class="detail-chip" style="background:var(--bd2);color:var(--sub)">${tn(c.r)}</span>`}
  h+=`</div>`;
  if(c&&c.tip)h+=`<div class="detail-section"><div class="detail-label">${t('detail.tip')}</div><div class="detail-text">${tn(c.tip)}</div></div>`;
  if(relA.length){h+=`<div class="detail-section"><div class="detail-label">${t('guide.relatedBuild')}</div><div style="display:flex;gap:6px;flex-wrap:wrap">`;relA.forEach(a=>{h+=`<span class="detail-chip" style="background:${a.color}22;color:${a.color};border:1px solid ${a.color}44">${tn(a.name)} ${listHasCard(a.must,name)?t('guide.must'):t('common.recommend')}</span>`});h+=`</div></div>`}
  if(relC.length){
    h+=`<div class="detail-section"><div class="detail-label">${t('guide.synergyCombo')}</div>`;
    relC.forEach(cb=>{
      const partner=cb.cards.find(x=>x!==name);const has=partner&&deck.includes(partner);
      h+=`<div class="detail-combo" style="${has?'border-color:#22c55e44;background:#0f1f0f':''}"><div class="detail-combo-name">${tn(cb.name)} ${has?`<span style="color:#22c55e;font-size:11px">${t('deck.ownedInline')}</span>`:''}</div><div class="detail-combo-why">${comboText(cb)} — ${td(cb.why)}</div></div>`
    });
    h+=`</div>`;
  }
  if(inD)h+=`<div style="text-align:center;padding:8px;font-size:13px;color:#22c55e;font-weight:700">${t('deck.ownedBadge')}</div>`;
  h=`<button class="detail-top-close" onclick="closeDetail()">✕</button>`+h+`<button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
  body.innerHTML=h;modal.classList.add('open');updateBodyLock()
}

function showBuildList(kind='all', liveLinked=false){
  const d=D();
  const detectedBid=detectBuild();
  const currentBid=buildId || detectedBid || null;
  const body=document.getElementById('detailBody');
  if(!currentBid){
    body.innerHTML=`<button class="detail-top-close" onclick="closeDetail()">✕</button><div class="detail-name">${t('detail.buildCardList')}</div><div class="detail-section"><div class="detail-text">${t('guide.pickBuildHint')}</div></div><button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
    document.getElementById('detailModal').classList.add('open');
    updateBodyLock();
    return;
  }
  const a=d.archs.find(x=>x.id===currentBid);
  const uniq=(arr)=>[...new Set(arr)];
  const all=uniq([...(a.must||[]),...(a.rec||[])]);
  const esc=(s)=>String(s).replace(/'/g,"&#39;");
  const deckNow=liveLinked ? (((typeof getDeckNames==='function' && getDeckNames()) || deck.slice())) : deck.slice();
  const cardTile=(name)=>{
    const owned=liveLinked && deckNow.includes(name);
    const cls=['mini-card', owned?'owned':''].filter(Boolean).join(' ');
    return `<button class="${cls}" onclick="showDetail('${esc(name)}')">${UNLOCK[name]?'<div class="lock-corner">🔒</div>':''}${owned?`<div class="mini-owned-check">${t('deck.inDeck')}</div>`:''}<img src="${imgSrcs(name)[0]}" onerror="if(!this.dataset.f1){this.dataset.f1='1';this.src='${imgSrcs(name)[1]}';return;} this.onerror=null;this.src='${imgSrcs(name)[2]||imgSrcs(name)[1]}';"><div class="mini-name">${tn(name)}</div></button>`;
  };
  const listTitle = kind==='must' ? t('detail.mustListTitle',{name:tn(a.name)}) : kind==='rec' ? t('detail.synListTitle',{name:tn(a.name)}) : t('detail.cardListTitle',{name:tn(a.name)});
  const descText = kind==='must'
    ? t('guide.coreDesc')
    : kind==='rec'
      ? t('guide.synergyDesc')
      : td(a.desc||'');
  const mh=(a.must||[]).filter(n=>deckNow.includes(n)).length;
  const rh=(a.rec||[]).filter(n=>deckNow.includes(n)).length;
  const summary=`<div class="detail-summary-compact" style="margin-top:12px"><span class="summary-pill"><strong>${t('guide.must')}</strong> ${mh}/${(a.must||[]).length}</span><span class="summary-pill"><strong>${t('guide.syn')}</strong> ${rh}/${(a.rec||[]).length}</span></div>`;
  let h='';
  h+=`<button class="detail-top-close" onclick="closeDetail()">✕</button>`;
  h+=`<div class="detail-name">${listTitle}</div>`;
  h+=`<div class="detail-text" style="margin-top:8px">${descText}</div>`;
  if(a.sourceName){ h+=`<div class="detail-source">${renderDetailSource(a)}</div>`; }
  h+=`<div class="detail-chip-row" style="margin-top:10px"><span class="badge good">${td(a.sub||a.descShort||a.meta||'')}</span></div>`;
  h+=summary;

  if(kind==='must'){
    h+=`<div class="guide-divider"></div>`;
    h+=`<div class="guide-group core compact-section"><div class="guide-group-title">${t('guide.coreCards')}</div><div class="ref-mini-desc">${t('guide.coreDesc')}</div><div class="mini-grid">${(a.must||[]).map(n=>cardTile(n)).join('')}</div></div>`;
  }else if(kind==='rec'){
    h+=`<div class="guide-divider"></div>`;
    h+=`<div class="guide-group key compact-section"><div class="guide-group-title">${t('guide.synergyCards')}</div><div class="ref-mini-desc">${t('guide.synergyDesc')}</div><div class="mini-grid">${(a.rec||[]).map(n=>cardTile(n)).join('')}</div></div>`;
  }else{
    h+=`<div class="detail-two-col">`;
    h+=`<div class="guide-group core" style="margin-top:0;"><div class="guide-group-title">${t('guide.coreCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('guide.coreDesc')}</div><div class="mini-grid">${(a.must||[]).map(n=>cardTile(n)).join('')}</div></div>`;
    h+=`<div class="guide-group key" style="margin-top:0;"><div class="guide-group-title">${t('guide.synergyCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('guide.synergyDesc')}</div><div class="mini-grid">${(a.rec||[]).map(n=>cardTile(n)).join('')}</div></div>`;
    h+=`</div>`;
    h+=`<div class="guide-divider"></div>`;
    h+=`<div class="detail-secondary-grid"><div class="guide-group compact-section"><div class="guide-group-title">${t('guide.allCards')}</div><div class="mini-grid">${all.map(n=>cardTile(n)).join('')}</div></div></div>`;
  }

  h+=`<button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
  body.innerHTML=h;
  const modal=document.getElementById('detailModal');
  modal.dataset.mode='guide';
  modal.classList.add('open');
  updateBodyLock();
}

function closeDetail(){
  const modal=document.getElementById('detailModal');
  const body=document.getElementById('detailBody');
  if(detailStack.length){
    const prev=detailStack.pop();
    body.innerHTML=prev.html;
    modal.dataset.mode=prev.mode||'';
    modal.classList.add('open');
    updateBodyLock();
    return;
  }
  modal.classList.remove('open');
  modal.dataset.mode='';
  updateBodyLock();
}
const SHOP_CLASS_COUNT=5;
const SHOP_COLORLESS_COUNT=2;
const SHOP_SLOT_COUNT=SHOP_CLASS_COUNT+SHOP_COLORLESS_COUNT;
function isShopColorlessSlot(idx){return idx>=SHOP_CLASS_COUNT}
function getNeedCount(){return mode==='shop'?SHOP_SLOT_COUNT:3}
function getSearchPoolForSlot(idx){
  const base=(ALL[curChar]&&ALL[curChar].cards?ALL[curChar].cards:[]).filter(c=>isSearchableCard(c,curChar));
  const colorless=(typeof COLORLESS_CARDS!=='undefined'?COLORLESS_CARDS:[]).filter(c=>isSearchableCard(c,'colorless'));
  if(mode==='shop' && isShopColorlessSlot(idx)) return colorless.slice();
  return mode==='shop' ? [...base] : [...base,...colorless];
}
function getSlotLabel(idx){
  if(mode!=='shop') return t('slot.card',{n:idx+1});
  if(isShopColorlessSlot(idx)) return t('slot.colorless',{n:idx-SHOP_CLASS_COUNT+1});
  return t('slot.shop',{n:idx+1});
}
function freshPicks(){return Array(getNeedCount()).fill('')}
function finalizeRewardCycle(actionName){const from=picks.filter(Boolean);if(actionName==='스킵') hist.push({p:'스킵',f:from});else hist.push({p:actionName,f:from});deckAddMode=false;activeSlot=-1;if(mode==='shop') mode='reward';picks=freshPicks();renderAll('to-picker')}
function finalizeShopCycle(actionName='상점 종료'){const from=picks.filter(Boolean);if(from.length) hist.push({p:actionName,f:from});deckAddMode=false;activeSlot=-1;picks=freshPicks();renderAll('to-picker')}
function buyShopCard(name){
  const from=picks.filter(Boolean);
  pushDeckCard(name);
  setLastAction(t('toast.addedToDeck',{name:tn(name)}), 'success');
  hist.push({p:`구매:${name}`,f:from});
  deckAddMode=false;
  activeSlot=-1;
  picks=freshPicks();
  renderAll('to-picker');
}
function pickCard(name){
  if(mode==='shop'){ buyShopCard(name); return; }
  pushDeckCard(name);
  setLastAction(t('toast.addedToDeck',{name:tn(name)}), 'success');
  finalizeRewardCycle(name);
}
function doSkip(){
  const from=picks.filter(Boolean);
  setLastAction(mode==='shop' ? t('toast.skipShop') : t('toast.skipReward'), 'info');
  if(mode==='shop'){
    if(from.length) hist.push({p:'상점 종료',f:from});
  }else{
    if(from.length) hist.push({p:'스킵',f:from});
  }
  deckAddMode=false;
  activeSlot=-1;
  picks=freshPicks();
  renderAll('to-picker');
}
function toggleBuildPanel(){}
function toggleHistory(){}
function toggleDeck(){}
function resetAll(){deck=[...START_DECKS[curChar]];deckIds=deck.map(()=>__deckSeq++);upgradedIds = new Set();window.upgradedIds = upgradedIds;hist=[];picks=freshPicks();deckOpen=true;buildId=null;selectedDeckIdx=-1;historyOpen=false;buildPanelOpen=true;renderAll()}

function isTypingTarget(el){
  if(!el) return false;
  if(el.isContentEditable) return true;
  const tag=(el.tagName||'').toUpperCase();
  return tag==='INPUT' || tag==='TEXTAREA' || tag==='SELECT';
}
function isSearchModalOpen(){
  return document.getElementById('searchModal').classList.contains('open');
}
function openPrimaryCardSearch(){
  if(currentTab!=='live') return;
  if(isSearchModalOpen()) return;
  const count=getNeedCount();
  let target=picks.findIndex(v=>!v);
  if(target<0) target=Math.max(0,count-1);
  openSearch(target);
}
function handleGlobalHotkeys(e){
  if(e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  if(e.repeat) return;
  const activeEl=document.activeElement;
  if(isTypingTarget(activeEl)) return;

  if(e.code==='Backquote'){
    if(isSearchModalOpen() || currentTab!=='live') return;
    const resultWrap=document.getElementById('resultSection');
    const resultVisible=!!resultWrap && (resultWrap.classList.contains('open') || resultWrap.style.display!== 'none');
    if(!resultVisible) return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
    const skipBtn = document.querySelector('#resultBody .res-skip-compact .res-compact-btn');
    if(skipBtn){
      skipBtn.click();
    }else{
      doSkip();
    }
    return false;
  }

  if(e.defaultPrevented) return;
  if(e.code==='KeyQ'){
    if(currentTab!=='live' || isSearchModalOpen()) return;
    e.preventDefault();
    setMode('reward');
    return;
  }
  if(e.code==='KeyW'){
    if(currentTab!=='live' || isSearchModalOpen()) return;
    e.preventDefault();
    setMode('shop');
    return;
  }
  if(e.code==='KeyE'){
    if(isSearchModalOpen()) return;
    e.preventDefault();
    openPrimaryCardSearch();
    return;
  }
  if(e.code==='KeyR'){
    if(isSearchModalOpen()) return;
    e.preventDefault();
    openDeckAdd();
    return;
  }
  if(e.code==='Escape'){
    if(isSearchModalOpen()){
      e.preventDefault();
      closeSearch();
      return;
    }
  }
}

document.addEventListener('keydown', handleGlobalHotkeys, true);

document.addEventListener('click', function(e){
  const btn = e.target.closest && e.target.closest('#resultBody [data-action="do-skip"], #resultBody .res-skip-compact .res-compact-btn');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  doSkip();
}, true);

document.addEventListener('pointerup', function(e){
  const btn = e.target.closest && e.target.closest('#resultBody [data-action="do-skip"], #resultBody .res-skip-compact .res-compact-btn');
  if(!btn) return;
  e.preventDefault();
  e.stopPropagation();
  doSkip();
}, true);

document.getElementById('searchModal').addEventListener('click',function(e){if(e.target===this)closeSearch()});
document.addEventListener('click',function(e){if(selectedDeckIdx===-1) return; if(e.target.closest('.dk-wrap.selected')||e.target.closest('.dk-add')) return; selectedDeckIdx=-1; renderDeck();});
(async function init(){await enrichCardsFromRepo();renderAll()})();




window.applyRecommendationUX=function(){};


document.addEventListener('keydown', function(e){
  if(e.isComposing) return;
  if(window.innerWidth<=768) return;
  const active=document.activeElement;
  if(active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable)) return;
  const idx='123456789'.indexOf(e.key);
  if(idx===-1) return;
  const visible=(el)=>{ if(!el) return false; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); return r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden'; };
  const actions=[...document.querySelectorAll('.res-item:not(.res-skip-compact)')]
    .filter(visible)
    .map(card => card.querySelector('.res-compact-btn:not(.shop-skip-btn), .res-select-btn'))
    .filter(visible);
  if(actions.length && idx<actions.length){
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation==='function') e.stopImmediatePropagation();
    actions[idx].click();
  }
}, true);



