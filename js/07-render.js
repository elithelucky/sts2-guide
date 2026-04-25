// ═══════════════════════════════════════
// 렌더
// ═══════════════════════════════════════
function renderAppTabs(){
  const el=document.getElementById('appTabs');
  if(!el) return;
  el.innerHTML=`<button class="app-tab${currentTab==='live'?' on':''}" onclick="setAppTab('live')">${t('app.tabLabel')}<small>${t('app.subtitle')}</small></button><button class="app-tab${currentTab==='guide'?' on':''}" onclick="setAppTab('guide')">${t('guide.title')}<small>${t('guide.strategyAll')}</small></button>`;
}
function setAppTab(tab){
  currentTab=tab;
  const live=document.getElementById('liveTab');
  const guide=document.getElementById('guideTab');
  const picker=document.getElementById('pickerSection');
  if(live) live.style.display = tab==='live' ? 'block' : 'none';
  if(guide) guide.style.display = tab==='guide' ? 'block' : 'none';
  if(picker) picker.style.display = tab==='live' ? 'block' : 'none';
  renderAll();
}
function getGuideHeroCard(a){
  return (GUIDE_HERO_CARD[curChar]&&GUIDE_HERO_CARD[curChar][a.id]) || a.must[0] || a.rec[0] || '';
}
function renderGuideRepBadge(a){
  return '';
}

function renderBuildSourceTag(a){
  return '';
}
function renderBuildSourceText(a){
  return '';
}
function renderBuildSourceLink(a){
  if(!a || !a.sourceUrl || !a.sourceName) return '';
  const sourceName=String(a.sourceName).replace(/\s*YouTube\s*$/i,'').trim();
  return `<a href="${a.sourceUrl}" target="_blank" rel="noopener noreferrer" class="build-source-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4"></path><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 19"></path><path d="M8 16l8-8"></path></svg><span>${tn(sourceName)}</span></a>`;
}
function renderBuildGuide(){
  const wrap=document.getElementById('guideList');
  const intro=document.getElementById('guideIntro');
  const coop=document.getElementById('coopSection');
  if(!wrap) return;
  const d=D();
  if(intro){
    intro.innerHTML='';
  }
  wrap.innerHTML=d.archs.map(a=>{
    const mustCount=a.must.length, recCount=a.rec.length;
    const sourceLink=renderBuildSourceLink(a);
    return `<div class="guide-card"><div class="guide-head"><div class="guide-head-main"><div class="guide-title-row"><div class="guide-title">${tn(a.name)}</div></div><div class="guide-desc" style="margin-top:6px;">${td(a.desc)}</div></div></div><div class="guide-meta" style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><span>${t('guide.summaryChip',{must:mustCount,syn:recCount})}</span>${sourceLink}</div><div class="guide-actions"><button class="guide-btn primary" onclick="openGuideBuildFull('${a.id}')">${t('guide.strategyAllNamed',{name:tn(a.name)})}</button></div></div>`
  }).join('');
if(coop){
    const coopGuides=getVisibleCoopGuides();
    const coopCards=coopGuides.length
      ? coopGuides.map(c=>{const mustCount=(c.must||[]).length; const recCount=(c.rec||[]).length; return `<div class="coop-card">${renderCoopTitleButtons(c)}<div class="coop-desc">${td(c.desc)}</div><div class="coop-meta">${td(c.meta)}</div><div class="coop-metrics">${t('guide.summaryChip',{must:mustCount,syn:recCount})}</div><div class="guide-actions" style="margin-top:12px"><button class="guide-btn primary" onclick="openCoopGuide('${c.id}')">${t('guide.detailCard')}</button></div></div>`}).join('')
      : `<div class="empty-hint">${t('guide.multiEmpty')}</div>`;
    coop.innerHTML=`<div class="guide-subsec"><div class="guide-subttl">${t('guide.multi')}</div>${coopCards}</div>`;
  }
}
function showGuideBuild(id){ const prev=buildId; buildId=id; showBuildList(); buildId=prev; }
function renderDetailSource(a){
  if(!a || !a.sourceUrl || !a.sourceName) return '';
  const name=String(a.sourceName).replace(/\s*YouTube\s*$/i,'').trim();
  return `<a href="${a.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#64748b;text-decoration:underline;text-underline-offset:2px;display:inline-flex;align-items:center;gap:6px;line-height:1.2;font-size:12px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;min-width:14px;min-height:14px;flex:0 0 14px;display:block;"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 4"></path><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L13 19"></path><path d="M8 16l8-8"></path></svg><span>${tn(name)} YouTube</span></a>`;
}
function openGuideBuildFull(id){
  const build=D().archs.find(x=>x.id===id); if(!build) return;
  detailStack=[];
  const body=document.getElementById('detailBody');
  const relics=buildRelicItems(build);
  const color=(build.color||CH[curChar].color||'#5cb0ff');
  const esc=(s='')=>String(s).replace(/'/g,'&#39;');
  const liveLinked=currentTab==='live';
  const deckNow=liveLinked ? (((typeof getDeckNames==='function' && getDeckNames()) || deck.slice())) : [];
  const mustMissing=(build.must||[]).filter(n=>!deckNow.includes(n));
  const recMissing=(build.rec||[]).filter(n=>!deckNow.includes(n));
  const remainTotal=mustMissing.length+recMissing.length;
  const cardTile=(name)=>{
    const owned=liveLinked && deckNow.includes(name);
    const cls=['mini-card', owned?'owned':''].filter(Boolean).join(' ');
    return `<button class="${cls}" onclick="showDetail('${esc(name)}')">${UNLOCK[name]?'<div class="lock-corner">🔒</div>':''}${owned?`<div class="mini-owned-check">${t('deck.inDeck')}</div>`:''}<img src="${imgSrcs(name)[0]}" onerror="if(!this.dataset.f1){this.dataset.f1='1';this.src='${imgSrcs(name)[1]}';return;} this.onerror=null;this.src='${imgSrcs(name)[2]||imgSrcs(name)[1]}';"><div class="mini-name">${tn(name)}</div></button>`;
  };
  let h='';
  h+=`<button class="detail-top-close" onclick="closeDetail()">✕</button>`;
  h+=`<div class="detail-name">${tn(build.name)}</div>`;
  h+=`<div class="detail-text" style="margin-top:8px">${td(build.desc||'')}</div>`;
  if(build.sourceName){ h+=`<div class="detail-source">${renderDetailSource(build)}</div>`; }
  h+=`<div class="detail-chip-row" style="margin-top:10px"><span class="badge good">${td(build.sub||build.descShort||'')}</span></div>`;
  if(remainTotal>0 && remainTotal<=2){
    h+=`<div class="guide-almost">${t('guide.remainClose',{n:remainTotal})}</div>`;
  }else if(remainTotal===0){
    h+=`<div class="guide-almost" style="border-color:rgba(34,211,238,.35);background:linear-gradient(135deg,rgba(7,25,29,.60),rgba(2,15,20,.34));color:#b8fff1">${t('guide.completeState')}</div>`;
  }
  h+=`<div class="detail-two-col">`;
  h+=`<div class="guide-group core" style="margin-top:0;"><div class="guide-group-title">${t('guide.coreCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('guide.coreDesc')}</div><div class="mini-grid">${build.must.map(n=>cardTile(n)).join('')}</div></div>`;
  h+=`<div class="guide-group key" style="margin-top:0;"><div class="guide-group-title">${t('guide.synergyCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('guide.synergyDesc2')}</div><div class="mini-grid">${build.rec.map(n=>cardTile(n)).join('')}</div></div>`;
  h+=`</div>`;
  h+=`<div class="guide-divider"></div>`;
  const secondarySections=[];
  if(relics.length){
    secondarySections.push(`<div class="guide-group compact-section" style="border-width:2px"><div class="guide-group-title">${t('relic.recommended')}</div><div class="relic-grid">`+relics.map(r=>`<button class="relic-tile" onclick="openRelicDetail('${esc(r.name)}','${esc(r.desc||'')}')"><img class="relic-tile-img" src="${relicImgSrc(r.name)}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\\'relic-tile-ph\\'>${t('relic.name')}</div>')"><div class="relic-tile-name">${tn(r.name)}</div></button>`).join('')+`</div></div>`);
  }
  secondarySections.push(`<div class="guide-group compact-section"><div class="guide-group-title">${t('guide.allCards')}</div><div class="mini-grid">${[...build.must,...build.rec.filter(n=>!build.must.includes(n))].map(n=>cardTile(n)).join('')}</div></div>`);
  h+=`<div class="detail-secondary-grid">${secondarySections.join('')}</div>`;
  h+=`<button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
  body.innerHTML=h;
  const modal=document.getElementById('detailModal');
  modal.dataset.mode='guide';
  modal.classList.add('open');
  updateBodyLock();
}
function renderChars(){
  document.getElementById('charRow').innerHTML=Object.entries(CHARS).map(([k,v])=>`<button class="char-btn${curChar===k?' on':''}" style="--cc:${v.color}" onclick="changeChar('${k}')"><img src="${profileImgSrc(k)}" onerror="this.onerror=null;this.style.display='none'"><span>${tn(v.name)}</span></button>`).join('');
  document.getElementById('hdrSub').textContent=currentTab==='live' ? t('app.subtitle') : t('guide.strategyAll');
  document.documentElement.style.setProperty('--cc',CHARS[curChar].color);
  attachCharRowDrag();
}
function renderBuilds(){
  const d=D();
  const detectedBid=detectBuild();
  const currentBid=buildId||detectedBid||null;
  const btns=d.archs.map(a=>{
    const st=getBuildCompletionState(a,0,0);
    const pct = st.pct>0 ? `<span class="build-pct level-${st.level}">${st.pct}%</span>` : '';
    return `<button class="build-btn${currentBid===a.id?' on':''}" style="--bc:${a.color}" onclick="selectBuild('${a.id}')"><span>${tn(a.name)}</span>${pct}</button>`;
  }).join('')+`<button class="build-btn${!buildId?' on':''}" style="--bc:var(--cc)" onclick="selectBuild('auto')">${t('guide.currentDeckBase')}</button>`;
  document.getElementById('buildBtns').innerHTML=btns;
  const info=document.getElementById('buildInfo');
  if(currentBid){
    const a=d.archs.find(x=>x.id===currentBid);
    const mh=countDeckMatches(a.must);
    const rh=countDeckMatches(a.rec);
    const completion=renderBuildCompletion(a,mh,rh);
    info.innerHTML=`<div class="build-meta"><span class="build-stat" onclick="showBuildList('all', true)">${t('guide.mustOf',{have:mh,total:a.must.length})}</span> · <span class="build-stat" onclick="showBuildList('all', true)">${t('guide.synOf',{have:rh,total:a.rec.length})}</span> ${completion}</div>`;
  } else {
    info.innerHTML='';
  }
}


function isUpgradedCardIdx(idx){
  if(!(upgradedIds instanceof Set)){
    try{ upgradedIds = new Set(upgradedIds||[]); }catch(e){ upgradedIds = new Set(); }
  }
  return upgradedIds.has(idx);
}
function renderDeckSummary(){const wrap=document.getElementById('deckSummary'); if(wrap) wrap.innerHTML='';}

let searchResultList=[];
let searchResultAction=[];

function ensureSearchInputFocus(){
  const input=document.getElementById('modalInput');
  if(!input) return;
  const doFocus=()=>{
    const modal=document.getElementById('searchModal');
    if(!modal || !modal.classList.contains('open')) return;
    if(document.activeElement===input) return;
    input.focus({preventScroll:true});
    try{input.setSelectionRange(input.value.length,input.value.length)}catch(e){}
  };
  doFocus();
  requestAnimationFrame(()=>{doFocus();requestAnimationFrame(doFocus)});
  [40,120,250,400].forEach(d=>setTimeout(doFocus,d));
}

function selectSearchResultByIndex(idx){
  const fn=searchResultAction[idx];
  if(fn) fn();
}

function renderRewardRow(){
  const count=getNeedCount();while(picks.length<count)picks.push('');while(picks.length>count)picks.pop();
  document.getElementById('modeReward').className='mode-tab'+(mode==='reward'?' on':'');
  document.getElementById('modeShop').className='mode-tab'+(mode==='shop'?' on':'');
  const row=document.getElementById('rewardRow');row.innerHTML='';
  const firstEmptyIdx = picks.findIndex(v=>!v);

  const makeSlot=(i)=>{const slot=document.createElement('div');slot.className='reward-slot'+(picks[i]?' filled':'');slot.onclick=()=>openSearch(i);
    if(picks[i]){const c=getCardMeta(picks[i]);const img=makeImg(picks[i],'rs');img.className='rs-img';slot.appendChild(img);slot.innerHTML+=`<div class="rs-name">${tn(picks[i])}</div>`;if(c)slot.innerHTML+=`<span class="rs-tier tier-${c.tier}">${c.tier}</span>`;const clr=document.createElement('button');clr.className='rs-clear';clr.innerHTML='✕';clr.onclick=e=>{e.stopPropagation();picks[i]='';renderAll()};slot.appendChild(clr)}
    else{slot.innerHTML=`${window.innerWidth>768 && i===firstEmptyIdx ? '<div class="slot-open-keycap">E</div>' : ''}<div class="rs-ph"><div class="ph-plus">+</div><div class="ph-label">${t('slot.card',{n:i+1})}</div></div>`}
    return slot;};

  if(mode==='shop'){
    row.className='shop-row';
    row.style.gridTemplateColumns='';
    row.innerHTML='';

    const classWrap=document.createElement('div');classWrap.className='shop-slot-group';
    classWrap.innerHTML=`<div class="shop-slot-label">${t('mode.shopCard')}</div>`;
    const classGrid=document.createElement('div');classGrid.className='reward-row reward-row-shop';classGrid.style.gridTemplateColumns=`repeat(${SHOP_CLASS_COUNT},1fr)`;
    for(let i=0;i<SHOP_CLASS_COUNT;i++) classGrid.appendChild(makeSlot(i));
    classWrap.appendChild(classGrid);row.appendChild(classWrap);

    const colorWrap=document.createElement('div');colorWrap.className='shop-slot-group colorless';
    colorWrap.innerHTML=`<div class="shop-slot-label">${t('mode.colorlessCard')}</div>`;
    const colorGrid=document.createElement('div');colorGrid.className='reward-row reward-row-colorless';colorGrid.style.gridTemplateColumns=`repeat(${SHOP_COLORLESS_COUNT},1fr)`;
    for(let i=SHOP_CLASS_COUNT;i<SHOP_SLOT_COUNT;i++) colorGrid.appendChild(makeSlot(i));
    colorWrap.appendChild(colorGrid);row.appendChild(colorWrap);
    return;
  }

  row.className='reward-row';
  row.style.gridTemplateColumns=`repeat(${count},1fr)`;
  for(let i=0;i<count;i++) row.appendChild(makeSlot(i));
}
function renderSearchGrid(){
  const wrap=document.getElementById('searchGridWrap');const q=document.getElementById('modalInput').value;const d=D();
  wrap.innerHTML='<div class="search-grid loading"></div>';
  const pool=deckAddMode?getCurrentCardPool().filter(c=>isSearchableCard(c,curChar)):getSearchPoolForSlot(activeSlot||0);
  let list;if(deckAddMode){list=pool.slice()}else{const ex=picks.filter((p,j)=>p&&j!==activeSlot);const pickable=pool.filter(c=>!BA().includes(c.n));list=pickable.filter(c=>!ex.includes(c.n))}
  list=list.map(c=>({card:c,rank:getSearchRank(c.n,q)})).filter(x=>isSearchableCard(x.card,curChar) && x.rank>-1).sort((a,b)=>b.rank-a.rank || a.card.n.length-b.card.n.length || a.card.n.localeCompare(b.card.n,'ko')).map(x=>x.card);
  searchResultList=list.slice();
  searchResultAction=[];
  if(!list.length){wrap.innerHTML=`<div class="search-empty">${t('common.noResult')}</div>`;return}
  let prog='';
  if(!deckAddMode){const need=getNeedCount();prog='<div class="slot-progress">'+Array.from({length:need},(_,i)=>`<span class="slot-dot ${i===activeSlot?'on':''} ${mode==='shop'&&isShopColorlessSlot(i)?'colorless':''}"></span>`).join('')+`<span class="slot-text">${getSlotLabel(activeSlot)} 선택</span></div>`; if(mode==='shop'){prog+=`<div class="slot-hint">${isShopColorlessSlot(activeSlot)?'이 슬롯은 중립 카드만 검색됩니다.':'이 슬롯은 현재 클래스 카드만 검색됩니다.'}</div>`;}}
  const grid=document.createElement('div');grid.className='search-grid';
  list.forEach((card,idx)=>{const el=document.createElement('div');el.className='sg-card';
    const choose=()=>{
      if(deckAddMode){pushDeckCard(card.n);closeSearch();renderAll();setTimeout(()=>{},50);return;}
      picks[activeSlot]=card.n;
      const need=getNeedCount();
      const next=Array.from({length:need},(_,i)=>i).find(i=>!picks[i]);
      if(next!==undefined){activeSlot=next; document.getElementById('modalTitle').textContent=t('search.slotLabel',{label:getSlotLabel(next)}); document.getElementById('modalInput').value=''; renderRewardRow(); renderSearchGrid(); ensureSearchInputFocus();}
      else { closeSearch(); renderAll('to-result'); }
    };
    searchResultAction[idx]=choose;
    el.onclick=choose;
    const img=makeImg(card.n,'sg');el.appendChild(img);
    const showKeycaps = (window.innerWidth>768) && q.trim().length>0;
    if(showKeycaps && idx<9) el.innerHTML+=`<span class="search-keycap">${idx+1}</span>`;
    el.innerHTML+=`<div class="sg-name">${tn(card.n)}</div><span class="sg-tier tier-${card.tier}">${card.tier}</span><span class="sg-info">${tn(card.t)}</span>${UNLOCK[card.n]?'<div class="lock-corner">🔒</div>':''}`;grid.appendChild(el)});
  wrap.innerHTML=prog;wrap.appendChild(grid)
}

function renderResult(scored,skipScore){
  const sec=document.getElementById('resultSection');
  const body=document.getElementById('resultBody');
  const desc=sec.querySelector('.pc-result-desc');
  const isPc=window.innerWidth>768;
  if(desc) desc.style.display = isPc ? '' : 'none';

  if(!scored){
    body.innerHTML = lastActionMessage ? `<div class="result-feedback result-feedback-${lastActionKind||'info'}"><div class="feedback-icon">✓</div><div class="feedback-text">${lastActionMessage}</div></div>` : '';
    if(isPc){
      sec.style.display='';
      sec.classList.add('open');
    }else{
      if(lastActionMessage){ sec.style.display=''; sec.classList.add('open'); }
      else { sec.style.display='none'; sec.classList.remove('open'); }
    }
    return;
  }
  sec.style.display='';
  sec.classList.add('open');
  clearLastAction();
  body.innerHTML='';

  const isShopMode = mode==='shop';
  const chosenCount = picks.filter(Boolean).length;
  if(isShopMode && chosenCount>1){
    body.innerHTML += `<div class="res-note" style="margin-bottom:10px">${t('mode.shopNote')}</div>`;
  }

  const top=scored[0];
  const skipBest=!top || top.score<=skipScore || top.warn;

  const active=getActiveBuild();
  const arch=active?D().archs.find(x=>x.id===active):null;
  let skipSummary=isShopMode ? t('skipSummary.shopNoBuy') : t('skipSummary.pickBetter');
  if(skipBest){
    if(top && top.reasons && top.reasons.length){
      skipSummary = top.reasons[0];
    }else if(top && top.warn){
      skipSummary = isShopMode ? t('skipSummary.shopNoBuy') : t('skipSummary.lowEfficiency');
    }else if(arch){
      skipSummary = t('skipSummary.noStronger',{name:tn(arch.name)+josa(arch.name)});
    }
  }

  const entries = [];
  if(skipBest){ entries.push({type:'skip', best:true}); }
  scored.forEach((it,i)=>{ entries.push({type:'card', item:it, best:!skipBest && i===0 && it.score>skipScore && (it.score-skipScore>=8 || !it.warn)}); });
  if(!skipBest){ entries.push({type:'skip', best:false}); }

  let cardHotkeyIndex = 1;
  entries.forEach((entry, idx)=>{
    const hotkey = window.innerWidth>768 ? (entry.type==='skip' ? '`' : (cardHotkeyIndex<=9 ? cardHotkeyIndex++ : null)) : null;

    if(entry.type==='card'){
      const it = entry.item;
      const best = !!entry.best;
      const div=document.createElement('div');
      div.className='res-item'+(best?' best':'')+(!best?' res-compact-choice':'');
      div.dataset.rank = String(idx+1);
      const head=document.createElement('div');
      head.className='res-clickarea';
      head.onclick=()=>showDetail(it.name);
      const imgEl=makeImg(it.name,'sg');
      imgEl.style.cssText='width:'+(best?'70px':'44px')+';border-radius:8px;flex-shrink:0;border:1px solid var(--bd2)';
      head.appendChild(imgEl);
      let info='<div style="flex:1;min-width:0">';
      info+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
      if(best) info+=`<span class="res-badge" style="background:#22c55e">${t('common.recommend')}</span>`;
      info+=`<span class="res-title">${tn(it.name)}</span>`;
      const tierStyle = (skipBest && it.tier==='S') ? ' style="opacity:.62;filter:saturate(.7) brightness(.92)"' : '';
      info+=`<span class="res-tier-pill tier-${it.tier}"${tierStyle}>${it.tier}</span>`;
      info+='</div>';
      const compactChips = Array.from(new Map((it.chips||[]).map(ch=>[ch[1],ch])).values());
      if(!compactChips.length){
        const txt=`${it.summary||''} ${(it.reasons||[]).join(' ')}`;
        if(/오프빌드/.test(txt)) compactChips.push(['bad','오프빌드']);
        else if(/빌드 시동/.test(txt)) compactChips.push(['mid','빌드 시동']);
        else if(/빌드 후보/.test(txt)) compactChips.push(['mid','빌드 후보']);
        else if(/범용/.test(txt)) compactChips.push(['mid','범용']);
        else if(/지금 강함|전투력|초반 안정성/.test(txt)) compactChips.push(['good','지금 강함']);
      }
      if(compactChips.length){ info+='<div class="res-state">'; compactChips.slice(0,2).forEach(ch=>{info+=`<span class="res-chip ${ch[0]}">${tn(ch[1])}</span>`}); info+='</div>'; }
      info+=`<div class="res-summary">${tn(it.summary)}</div>`;
      if(UNLOCK[it.name]) info+=`<div class="res-unlock-mini">${t('common.unlockNeeded')}</div>`;
      if(best && it.reasons?.length) info+=`<div class="res-note">${tn(it.reasons[0])}</div>`;
      info+='</div>';
      head.innerHTML+=info;
      div.appendChild(head);
      const hot = hotkey ? `<span class="res-action-keycap">${hotkey}</span>` : '';
      div.innerHTML+=`<button class="res-compact-btn${best?' is-recommended':''}" onclick="pickCard('${it.name}')">${hot}${isShopMode?t('action.buyThis'):t('action.pickThis')}</button>`;
      body.appendChild(div);
    }else{
      const sk=document.createElement('div');
      sk.className='res-item res-skip-compact'+(entry.best?' best skip-best':'');
      sk.dataset.rank = 'skip';
      const hot = hotkey ? `<span class="res-skip-keycap">${hotkey}</span>` : '';
      sk.innerHTML=`<div class="res-title-row">${entry.best?`<span class="res-badge" style="background:#22c55e;color:#fff">${t('common.recommend')}</span>`:''}<span class="res-title">${isShopMode?t('action.shopEnd'):t('action.skip')}</span></div><div class="res-summary">${skipSummary}</div><button class="res-compact-btn${entry.best?' is-recommended':''}" onclick="doSkip()">${hot}${isShopMode?t('action.buyEnd'):t('action.skipDo')}</button>`;
      body.appendChild(sk);
    }
  });
}

function getDeckActionHints(){
  const d=D();
  const activeBid=getActiveBuild();
  const active=activeBid?d.archs.find(x=>x.id===activeBid):null;
  const basicSet=new Set(BA());
  const starterList=(START_DECKS[curChar]||[]).slice();
  const stage=getRunStage();
  const counts=deck.reduce((m,n)=>{ const k=normalizeCardName(n); m[k]=(m[k]||0)+1; return m; },{});
  const tierScore=t=>({S:34,A:22,B:12,C:4,D:-8,'?':0}[t]||0);
  const countNonStarterCards=()=>{
    const pool=starterList.slice();
    let extra=0;
    deck.forEach(name=>{
      const idx=pool.indexOf(name);
      if(idx>=0) pool.splice(idx,1);
      else extra += 1;
    });
    return extra;
  };

  const extraCount=countNonStarterCards();
  let bestRemove={idx:-1,score:-1,name:null};
  let bestUpgrade={idx:-1,score:-1,name:null};

  deck.forEach((name,idx)=>{
    const c=(d.cards||[]).find(x=>x.n===name)||{};
    const inMust=!!(active && (active.must||[]).includes(name));
    const inRec=!!(active && (active.rec||[]).includes(name));
    const dupe=(counts[name]||0);

    // remove heuristic: starter/basic + low tier + off-build + duplicates
    let rs=0;
    if(basicSet.has(name)) rs+=38;
    if(curChar==='ironclad' && name==='강타') rs+=18;
    if(curChar==='silent' && name==='생존자') rs-=10;
    if(curChar==='silent' && name==='무력화') rs-=8;
    rs += ({D:28,C:16,B:4,A:-8,S:-18}[c.tier]||0);
    rs += ({'시작':20,'일반':0,'고급':-4,'레어':-10}[c.r]||0);
    if(active){
      if(inMust) rs-=90;
      else if(inRec) rs-=42;
      else rs+=18;
    }else{
      if((BUILD_POWER_BONUS[name]||0)>=34) rs-=20;
    }
    if(dupe>1) rs += Math.min(24, (dupe-1)*12);
    if(stage.stage==='early' && !basicSet.has(name)) rs-=12;
    if(deck.length>=18) rs+=8;
    if(deck.length>=24) rs+=10;

    if(rs>bestRemove.score){
      bestRemove={idx,score:rs,name};
    }

    // upgrade heuristic: on-build + power cards + good tiers
    if(isUpgradedCardIdx(idx)) return;
    let us=0;
    if(inMust) us+=92;
    else if(inRec) us+=56;
    us += (BUILD_POWER_BONUS[name]||0);
    us += Math.max(0,tierScore(c.tier));
    us += ({'레어':18,'고급':8,'일반':0,'시작':-24}[c.r]||0);
    if(dupe>1 && !basicSet.has(name)) us += Math.min(12,(dupe-1)*6);
    if(active && !inMust && !inRec) us -= 8;
    if(basicSet.has(name)) us -= 18;
    if(stage.stage==='early' && c.tier==='S') us += 12;
    if(stage.stage==='late' && inMust) us += 10;

    if(us>bestUpgrade.score){
      bestUpgrade={idx,score:us,name};
    }
  });

  const removeThreshold = deck.length>=22 ? 34 : deck.length>=16 ? 44 : 54;
  const upgradeThreshold = 58;

  // avoid showing same card for both. prioritize upgrade when overlap.
  let removeIdx = (extraCount>=1 && bestRemove.score>=removeThreshold) ? bestRemove.idx : -1;
  let upgradeIdx = bestUpgrade.score>=upgradeThreshold ? bestUpgrade.idx : -1;
  if(removeIdx===upgradeIdx && upgradeIdx!==-1){
    // keep upgrade if it is clearly meaningful, else keep remove
    if(bestUpgrade.score - bestRemove.score < 10) removeIdx=-1;
    else removeIdx=-1;
  }
  return {removeIdx, upgradeIdx};
}

function renderDeck(){
  const ba=BA(); const countEl=document.getElementById('deckCountNote'); if(countEl) countEl.innerHTML=t('deck.countWithNum',{n:deck.length}); const grid=document.getElementById('deckGrid');grid.style.display='grid';grid.innerHTML='';
  const d=D();const a=getActiveBuild()?d.archs.find(x=>x.id===getActiveBuild()):null;
  const hints=getDeckActionHints();
  deck.forEach((name,i)=>{const iM=a&&listHasCard(a.must,name);const iR=a&&listHasCard(a.rec,name);const upgradedNow=isUpgradedCardIdx(i);
    const wrap=document.createElement('div');wrap.className='dk-wrap'+(selectedDeckIdx===i?' selected':'');
    const el=document.createElement('div');const addedNow=(deckIds[i]===recentAddedDeckId);el.className='dk-card'+(iM?' must':iR?' rec':'')+(upgradedNow?' upgraded':'')+(addedNow?' card-added':'');
    el.onclick=(e)=>{e.stopPropagation();selectedDeckIdx=selectedDeckIdx===i?-1:i;renderDeck()};
    const img=makeImg(name,'dk',curChar);el.appendChild(img); if(addedNow){ const confettiSpec=[
      {l:'12%',t:'18%',dx:'-56px',dy:'-76px',bg:'#22c55e',delay:'0s'},
      {l:'24%',t:'10%',dx:'-22px',dy:'-92px',bg:'#fbbf24',delay:'.02s'},
      {l:'42%',t:'4%',dx:'-4px',dy:'-108px',bg:'#60a5fa',delay:'.04s'},
      {l:'58%',t:'4%',dx:'12px',dy:'-102px',bg:'#a78bfa',delay:'.01s'},
      {l:'74%',t:'12%',dx:'38px',dy:'-84px',bg:'#f472b6',delay:'.06s'},
      {l:'88%',t:'22%',dx:'62px',dy:'-58px',bg:'#f97316',delay:'.08s'},
      {l:'10%',t:'42%',dx:'-64px',dy:'-16px',bg:'#34d399',delay:'.03s'},
      {l:'20%',t:'60%',dx:'-48px',dy:'14px',bg:'#fde047',delay:'.05s'},
      {l:'50%',t:'58%',dx:'0px',dy:'28px',bg:'#38bdf8',delay:'.07s'},
      {l:'78%',t:'56%',dx:'48px',dy:'12px',bg:'#fb7185',delay:'.09s'},
      {l:'90%',t:'38%',dx:'70px',dy:'-8px',bg:'#c084fc',delay:'.11s'},
      {l:'50%',t:'20%',dx:'0px',dy:'-122px',bg:'#facc15',delay:'.03s'}
    ]; confettiSpec.forEach(spec=>{ const cf=document.createElement('span'); cf.className='confetti-bit'; cf.style.left=spec.l; cf.style.top=spec.t; cf.style.setProperty('--dx',spec.dx); cf.style.setProperty('--dy',spec.dy); cf.style.background=spec.bg; cf.style.animationDelay=spec.delay; el.appendChild(cf); }); }
    let actionBadge='';
    if(hints.removeIdx===i) actionBadge=`<div class="dk-action-label"><span class="dk-action-pill remove">${t('action.removeRec')}</span></div>`;
    else if(hints.upgradeIdx===i && !upgradedNow) actionBadge=`<div class="dk-action-label"><span class="dk-action-pill upgrade">${t('action.upgradeRec')}</span></div>`;

    el.innerHTML+=`<div class="dk-name">${actionBadge}<div class="dk-name-text">${tn(name)}${upgradedNow?'+' : ''}</div></div>`;
    if(iM)el.innerHTML+=`<span class="dk-tag" style="background:#ef4444">${t('guide.must')}</span>`;else if(iR)el.innerHTML+=`<span class="dk-tag" style="background:#22c55e">${t('common.recommend')}</span>`;
    const ov=document.createElement('div');ov.className='dk-overlay';ov.onclick=e=>e.stopPropagation();const btns=document.createElement('div');btns.className='dk-overlay-btns';
    const xb=document.createElement('button');xb.className='dk-ov-x';xb.textContent='✕';xb.onclick=e=>{e.preventDefault();e.stopPropagation();selectedDeckIdx=-1;renderDeck()};
    const ib=document.createElement('button');ib.className='dk-ov-btn dk-ov-info';ib.textContent=t('action.detail');ib.onclick=e=>{e.preventDefault();e.stopPropagation();selectedDeckIdx=-1;showDetail(name);renderDeck()};
    const rb=document.createElement('button');rb.className='dk-ov-btn dk-ov-del';rb.textContent=t('action.remove');rb.onclick=e=>{e.preventDefault();e.stopPropagation();removeDeckCardAt(i);selectedDeckIdx=-1;renderAll()};
    const ub=document.createElement('button');ub.className='dk-ov-btn dk-ov-up';ub.textContent=upgradedNow?t('action.unupgrade'):t('action.upgrade');ub.onclick=e=>{e.preventDefault();e.stopPropagation(); if(!(upgradedIds instanceof Set)){ upgradedIds = new Set(Array.isArray(upgradedIds) ? upgradedIds : []); } window.upgradedIds = upgradedIds; if(upgradedIds.has(i)){ upgradedIds.delete(i); } else { upgradedIds.add(i); } window.upgradedIds = upgradedIds; selectedDeckIdx=-1; renderDeck();};
    btns.appendChild(xb);btns.appendChild(ib);btns.appendChild(rb);btns.appendChild(ub);ov.appendChild(btns);el.appendChild(ov);wrap.appendChild(el);grid.appendChild(wrap)});
  const add=document.createElement('div');add.className='dk-add';add.innerHTML=`<div class="dk-add-keycap">R</div><span>+</span><small>${t('action.add')}</small>`;add.onclick=(e)=>{e.stopPropagation();openDeckAdd()};grid.appendChild(add)
}
function renderDirection(){
  const sec=document.getElementById('dirSection');const d=D();const ba=BA();const nonBasic=deck.filter(n=>!ba.includes(n));
  if(nonBasic.length<1){sec.style.display='none';return}sec.style.display='';
  const buildScores=detectBuildScores();
  const topSc=buildScores[0];
  const top=topSc?d.archs.find(a=>a.id===topSc.id):null;
  const runStage=getRunStage();
  const stageT = s => s==='early'?t('run.early'):(s==='mid'?t('run.mid'):t('run.late'));
  if(!top || topSc.score<24){document.getElementById('dirBody').innerHTML=`<div class="state-grid"><div class="state-box"><div class="state-k">${t('run.direction')}</div><div class="state-v">${t('run.exploring')}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('run.earlyHint')}</div></div><div class="state-box"><div class="state-k">${t('run.progress')}</div><div class="state-v">${stageT(runStage.stage)}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('run.extraSummary',{added:runStage.added,shops:runStage.shopRuns})}</div></div><div class="state-box"><div class="state-k">${t('mode.shopFirst')}</div><div class="state-v">${t('guide.strikeRemove')}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('deck.basicCards',{n:deck.filter(n=>ba.includes(n)).length})}</div></div></div>`;return}
  const basics=deck.filter(n=>ba.includes(n)).length;
  const phase = topSc.score<60 ? t('run.phaseSettling') : topSc.mh<top.must.length ? t('run.phaseBuffing') : t('run.phaseNearly');
  const nextNeed = top.must.filter(n=>!deckHasCard(n))[0] || top.rec.filter(n=>!deckHasCard(n))[0] || t('run.nextCompress');
  let shop=t('run.shopSynergy');
  if(topSc.mh===top.must.length && basics>=4) shop=t('run.shopTrimStrike');
  else if(basics>=6) shop=t('run.shopConsiderRemove');
  let h=`<div class="state-grid">
    <div class="state-box"><div class="state-k">${t('run.direction')}</div><div class="state-v">${tn(top.name)}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${phase}</div></div>
    <div class="state-box"><div class="state-k">${t('guide.nextGoal')}</div><div class="state-v">${nextNeed}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('guide.summaryScore',{mh:topSc.mh,mt:top.must.length,rh:topSc.rh,rt:top.rec.length})}</div></div>
    <div class="state-box"><div class="state-k">${t('run.progress')}</div><div class="state-v">${stageT(runStage.stage)}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('run.extraSummary',{added:runStage.added,shops:runStage.shopRuns})}</div></div>
    <div class="state-box"><div class="state-k">${t('mode.shopFirst')}</div><div class="state-v">${shop}</div><div style="font-size:12px;color:var(--dim);margin-top:4px">${t('deck.basicCards',{n:basics})}</div></div>
  </div>`;
  const relics=buildRelicItems(top);
  if(relics && relics.length){
    h+=`<div style="margin-top:8px"><button class="relic-link" onclick="openBuildRelics()">${t('relic.viewRecommended')}</button></div>`;
  }
  document.getElementById('dirBody').innerHTML=h
}
function renderHistory(){const sec=document.getElementById('histSection');if(!hist.length){sec.style.display='none';return}sec.style.display='';
  document.getElementById('histBody').innerHTML=hist.slice().reverse().map(h=>`<div class="hist-row"><span class="hist-pick ${h.p==='스킵'?'skip':'card'}">${h.p}</span><br><span class="hist-from">← ${h.f.join(', ')}</span></div>`).join('')}

function getSkipScore(){
  const activeBid=getActiveBuild();const d=D();const a=activeBid?d.archs.find(x=>x.id===activeBid):null;
  const early=isAct1Like();
  if(early) return totalCards=deck.length, totalCards>=16?18:6;
  if(!a) return deck.length>=16?16:8;
  const md=countDeckMatches(a.must);
  const rd=countDeckMatches(a.rec);
  if(md===0&&rd===0) return deck.length>=16?16:8;
  if(md<a.must.length) return deck.length>=17?18:10;
  return deck.length>=16?20:14;
}

function detectRewardContext(){
  const filled=picks.filter(Boolean);
  const filledCards=filled.map(n=>D().cards.find(x=>x.n===n)).filter(Boolean);
  const allRare = mode==='reward' && filledCards.length===3 && filledCards.every(c=>c.r==='레어');
  return {
    isBossReward: allRare,
    rewardCount: filledCards.length
  };
}
function getBuildCommitLevel(build){
  if(!build) return 0;
  const mustCount=countDeckMatches(build.must||[]);
  const recCount=countDeckMatches(build.rec||[]);
  return mustCount*2 + recCount;
}


function syncTabVisibility(){
  const live=document.getElementById('liveTab');
  const guide=document.getElementById('guideTab');
  const picker=document.getElementById('pickerSection');
  if(live) live.style.display = currentTab==='live' ? 'block' : 'none';
  if(guide) guide.style.display = currentTab==='guide' ? 'block' : 'none';
  if(picker) picker.style.display = currentTab==='live' ? 'block' : 'none';
}
function renderAll(scrollMode='none'){
  renderAppTabs();
  renderChars();
  renderBuilds();
  renderDeckSummary();
  renderRewardRow();
  renderDeck();
  renderHistory();
  renderBuildGuide();
  syncTabVisibility();
  const filled=picks.filter(Boolean);
  if(filled.length){const scored=filled.map(n=>({name:n,...scoreCard(n)})).sort((a,b)=>b.score-a.score);renderResult(scored,getSkipScore())}else{renderResult(null)}
  if(recentAddedDeckId!=null){ setTimeout(()=>{ recentAddedDeckId=null; const g=document.getElementById('deckGrid'); if(g) renderDeck(); }, 1200); }
  const need=getNeedCount();
  if(currentTab==='live' && scrollMode==='to-result' && filled.length===need) scrollToRecommendations();
  if(currentTab==='live' && scrollMode==='to-picker'){
    if(window.innerWidth<=768) scrollToBuildButtons();
    else scrollToPickerTop();
  }
}


function scrollToRecommendations(){
  return;
}
function scrollToPickerTop(){
  return;
}
function scrollToBuildButtons(){
  return;
}

