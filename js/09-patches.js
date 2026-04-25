(function(){
  function visible(el){
    if(!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function applyBestOnlyRecommendation(){
    const items=[...document.querySelectorAll('.res-item')].filter(visible);
    items.forEach((it,idx)=>{
      const btn=it.querySelector('.res-compact-btn, .res-select-btn');
      if(btn) btn.classList.remove('is-recommended');
      if(idx===0 && btn) btn.classList.add('is-recommended');
    });
    const bestItem=document.querySelector('.res-item.best');
    const skipBlock=[...document.querySelectorAll('.res-item, .skip-card, .skip-box, .res-skip, .recommend-skip, .skip-section, .res-skip-card')]
      .find(el => visible(el) && /스킵하기|스킵/.test(el.textContent||''));
    
  }

  function setLoadingState(){
    const modal=document.getElementById('searchModal');
    const results=document.getElementById('searchResults') || document.querySelector('.search-results');
    if(!modal || !results) return;
    const input=document.getElementById('modalInput');
    const q=(input && input.value || '').trim();
    if(results.children.length===0){
      const profiles=['Ironclad','Silent','Defect','Necrobinder','Regent'];
      const pick=profiles[Math.floor(Math.random()*profiles.length)];
      results.innerHTML = '<div class="res-loading-wrap"><span class="res-loading-avatar"><img src="https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/profile_'+pick+'.webp" alt=""></span><span>'+t('common.loading')+'</span></div>';
    }
  }

  const mo=new MutationObserver(()=>{ applyBestOnlyRecommendation(); });
  mo.observe(document.documentElement, {childList:true, subtree:true});
  document.addEventListener('click', ()=>setTimeout(applyBestOnlyRecommendation, 0), true);
  window.addEventListener('load', ()=>setTimeout(applyBestOnlyRecommendation, 200));
  window.addEventListener('resize', applyBestOnlyRecommendation);

  // When search modal opens, briefly show loading state if empty
  document.addEventListener('click', function(e){
    const t=e.target;
    if(!t) return;
    const txt=(t.textContent||'').trim();
    if(/카드 [1-5]|Card [1-5]|추가|Add/.test(txt)){
      setTimeout(setLoadingState, 0);
    }
  }, true);
})();


(function(){
  function visible(el){
    if(!el) return false;
    const r=el.getBoundingClientRect();
    const cs=getComputedStyle(el);
    return r.width>0 && r.height>0 && cs.display!=='none' && cs.visibility!=='hidden';
  }
  function fixRecommendedButtons(){
    const allBtns=[...document.querySelectorAll('.res-card .res-compact-btn, .res-card .res-select-btn')].filter(visible);
    allBtns.forEach(btn=>btn.classList.remove('is-recommended'));
    if(allBtns[0]) allBtns[0].classList.add('is-recommended');
  }
  const mo2=new MutationObserver(()=>fixRecommendedButtons());
  mo2.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',()=>setTimeout(fixRecommendedButtons,0),true);
  window.addEventListener('load',()=>setTimeout(fixRecommendedButtons,200));
})();




/* ===== contextual onboarding v31 ===== */
(function(){
  const INTRO_KEY = 'hailot_intro_tabs_v31';
  const GUIDE_TAB_KEY = 'hailot_hint_guide_tab_v31';
  const GUIDE_DETAIL_KEY = 'hailot_hint_guide_detail_v31';
  const LIVE_PICKER_KEY = 'hailot_hint_live_picker_v31';
  const SEARCH_INPUT_KEY = 'hailot_hint_search_input_v31';
  const SEARCH_RESULT_KEY = 'hailot_hint_search_result_v31';

  const isPCOnboard = () => window.matchMedia('(min-width: 1180px)').matches;
  const withHotkeys = (base, hotkeys) => isPCOnboard() ? `${base} ${hotkeys}` : base;

  const introSteps = [
    { target: '.app-tab:nth-child(1)', textKey: 'onboard.introTab1' },
    { target: '.app-tab:nth-child(2)', textKey: 'onboard.introTab2' }
  ];
  let introIdx = 0;
  let mode = null; // 'intro' or 'hint'
  let currentHint = null;

  function $(id){ return document.getElementById(id); }
  function q(sel){ return document.querySelector(sel); }

  function positionOverlay(target){
    if(!target) return;
    const rect = target.getBoundingClientRect();
    const pad = 10;
    const top = Math.max(0, rect.top - pad);
    const left = Math.max(0, rect.left - pad);
    const width = Math.max(0, rect.width + pad*2);
    const height = Math.max(0, rect.height + pad*2);

    const spot = $('hxSpot');
    const bubble = $('hxBubble');
    const dimTop = $('hxDimTop');
    const dimLeft = $('hxDimLeft');
    const dimRight = $('hxDimRight');
    const dimBottom = $('hxDimBottom');

    if(!(spot && bubble && dimTop && dimLeft && dimRight && dimBottom)) return;

    // spotlight
    spot.style.top = top + 'px';
    spot.style.left = left + 'px';
    spot.style.width = width + 'px';
    spot.style.height = height + 'px';

    // dark outside only
    dimTop.style.top = '0px';
    dimTop.style.left = '0px';
    dimTop.style.width = '100vw';
    dimTop.style.height = top + 'px';

    dimBottom.style.top = (top + height) + 'px';
    dimBottom.style.left = '0px';
    dimBottom.style.width = '100vw';
    dimBottom.style.height = Math.max(0, window.innerHeight - (top + height)) + 'px';

    dimLeft.style.top = top + 'px';
    dimLeft.style.left = '0px';
    dimLeft.style.width = left + 'px';
    dimLeft.style.height = height + 'px';

    dimRight.style.top = top + 'px';
    dimRight.style.left = (left + width) + 'px';
    dimRight.style.width = Math.max(0, window.innerWidth - (left + width)) + 'px';
    dimRight.style.height = height + 'px';

    // bubble directly below spotlight
    const bw = 280;
    const bh = 150;
    let bTop = top + height + 12;
    let bLeft = left + (width / 2) - (bw / 2);
    bubble.classList.remove('above');

    if(bTop + bh > window.innerHeight - 12){
      bTop = Math.max(12, top - bh - 12);
      bubble.classList.add('above');
    }

    bLeft = Math.max(12, Math.min(bLeft, window.innerWidth - bw - 12));
    bubble.style.top = bTop + 'px';
    bubble.style.left = bLeft + 'px';

    const arrowLeft = Math.max(24, Math.min((left + width/2) - bLeft - 7, bw - 28));
    bubble.style.setProperty('--arrow-left', arrowLeft + 'px');
  }

  function openOverlay(){
    const overlay = $('hxOverlay');
    overlay.classList.add('show');
    overlay.classList.remove('ready');
  }
  function markOverlayReady(){
    const overlay = $('hxOverlay');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('ready');
      });
    });
  }
  function closeOverlay(){
    const overlay = $('hxOverlay');
    overlay.classList.remove('ready');
    overlay.classList.remove('show');
    mode = null;
    currentHint = null;
  }

  function renderIntro(){
    mode = 'intro';
    const step = introSteps[introIdx];
    const target = q(step.target);
    if(!target) return;
    $('hxStep').textContent = t('onboard.step',{cur:introIdx+1,total:introSteps.length});
    $('hxText').textContent = step.textKey ? t(step.textKey) : (step.text || '');
    $('hxSkip').style.display = 'inline-block';
    $('hxPrev').style.display = introIdx === 0 ? 'none' : 'inline-block';
    $('hxNext').textContent = introIdx === introSteps.length - 1 ? t('onboard.done') : t('onboard.next');
    openOverlay();
    positionOverlay(target);
    markOverlayReady();
  }

  function startIntro(){
    introIdx = 0;
    renderIntro();
  }

  function showHint(key, targetSelector, text){
    try{
      if(localStorage.getItem(key)) return;
    }catch(e){}
    const target = q(targetSelector);
    if(!target) return;

    mode = 'hint';
    currentHint = { key, targetSelector, text };
    $('hxStep').textContent = t('onboard.helpLabel');
    $('hxText').textContent = text;
    $('hxSkip').style.display = 'none';
    $('hxPrev').style.display = 'none';
    $('hxNext').textContent = t('onboard.confirm');
    openOverlay();
    positionOverlay(target);
    markOverlayReady();
  }

  function finishCurrent(){
    if(mode === 'intro'){
      if(introIdx < introSteps.length - 1){
        introIdx += 1;
        renderIntro();
      }else{
        try{ localStorage.setItem(INTRO_KEY, '1'); }catch(e){}
        closeOverlay();
      }
      return;
    }
    if(mode === 'hint' && currentHint){
      if(currentHint.key === SEARCH_INPUT_KEY){
        try{ localStorage.setItem(SEARCH_INPUT_KEY, '1'); }catch(e){}
        const input = $('modalInput');
        if(input && !input.value){
          input.value = t('hint.searchExample');
          if(typeof renderSearchGrid === 'function') renderSearchGrid();
        }
        if(q('#searchGridWrap .sg-card')){
          showHint(SEARCH_RESULT_KEY, '#searchGridWrap .sg-card', isPCOnboard() ? t('hint.searchResultPC') : t('hint.searchResultMobile'));
        } else {
          try{ localStorage.setItem(SEARCH_RESULT_KEY, '1'); }catch(e){}
          closeOverlay();
        }
        return;
      }
      try{ localStorage.setItem(currentHint.key, '1'); }catch(e){}
      closeOverlay();
    }
  }

  function prevIntro(){
    if(mode !== 'intro') return;
    if(introIdx > 0){
      introIdx -= 1;
      renderIntro();
    }
  }

  // watch modal open for guide detail
  const detailObserver = new MutationObserver(() => {
    const modal = $('detailModal');
    if(!modal || !modal.classList.contains('open')) return;
    if(currentTab !== 'guide') return;
    const target = q('.detail-box .guide-group.core, .detail-box .guide-group.key, .detail-box .mini-grid, .detail-box');
    if(target){
      showHint(GUIDE_DETAIL_KEY, '.detail-box .guide-group.core, .detail-box .guide-group.key, .detail-box .mini-grid, .detail-box', t('hint.guideDetail'));
    }
  });

  // patch setAppTab for per-tab hints
  const originalSetAppTab = typeof setAppTab === 'function' ? setAppTab : null;
  if(originalSetAppTab){
    window.setAppTab = function(tab){
      originalSetAppTab(tab);
      setTimeout(() => {
        if(tab === 'live'){
          showHint(LIVE_PICKER_KEY, '#pickerSection', isPCOnboard() ? t('hint.livePickerPC') : t('hint.livePickerMobile'));
        }
      }, 120);
    };
  }

  // patch openDeckAdd: modal opens normally, onboarding starts when search input is focused
  const originalOpenDeckAdd = typeof openDeckAdd === 'function' ? openDeckAdd : null;
  if(originalOpenDeckAdd){
    window.openDeckAdd = function(){
      originalOpenDeckAdd();
    };
  }


  // search onboarding starts on input focus/click, not immediately on modal open
  const searchInput = $('modalInput');
  if(searchInput){
    const triggerSearchInputHint = function(){
      try{
        if(localStorage.getItem(SEARCH_INPUT_KEY)) return;
      }catch(e){}
      if(!$('searchModal') || !$('searchModal').classList.contains('open')) return;
      if(mode === 'hint' && currentHint && (currentHint.key === SEARCH_INPUT_KEY || currentHint.key === SEARCH_RESULT_KEY)) return;

      if(!searchInput.value){
        searchInput.value = t('hint.searchExample');
        if(typeof renderSearchGrid === 'function') renderSearchGrid();
      }
      showHint(SEARCH_INPUT_KEY, '#modalInput', t('hint.searchInput'));
    };

    searchInput.addEventListener('focus', triggerSearchInputHint);
    searchInput.addEventListener('click', triggerSearchInputHint);
  }

  // patch renderSearchGrid: result hint is shown only after search-input onboarding step is confirmed
  const originalRenderSearchGrid = typeof renderSearchGrid === 'function' ? renderSearchGrid : null;
  if(originalRenderSearchGrid){
    window.renderSearchGrid = function(){
      const result = originalRenderSearchGrid.apply(this, arguments);
      return result;
    };
  }

  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'hxNext') finishCurrent();
    if(e.target && e.target.id === 'hxPrev') prevIntro();
    if(e.target && e.target.id === 'hxSkip'){
      try{ localStorage.setItem(INTRO_KEY, '1'); }catch(e){}
      closeOverlay();
    }
  });

  window.addEventListener('resize', () => {
    if(mode === 'intro'){
      const step = introSteps[introIdx];
      const target = q(step.target);
      if(target) positionOverlay(target);
    }else if(mode === 'hint' && currentHint){
      const target = q(currentHint.targetSelector);
      if(target) positionOverlay(target);
    }
  });

  // keep detail observer active
  document.addEventListener('DOMContentLoaded', function(){
    const dm = $('detailModal');
    if(dm) detailObserver.observe(dm, { attributes:true, attributeFilter:['class'] });

    setTimeout(function(){
      try{
        if(!localStorage.getItem(INTRO_KEY)) startIntro();
      }catch(e){
        startIntro();
      }
    }, 400);
  });
})();
/* === script === */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (e.isComposing) return;

  const detailModal = document.getElementById('detailModal');
  if (detailModal && detailModal.classList.contains('open')) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeDetail === 'function') closeDetail();
    else {
      detailModal.classList.remove('open');
      if (typeof updateBodyLock === 'function') updateBodyLock();
      else document.body.classList.remove('modal-lock');
    }
    return;
  }

  const searchModal = document.getElementById('searchModal');
  if (searchModal && searchModal.classList.contains('open')) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeSearch === 'function') closeSearch();
    else {
      searchModal.classList.remove('open');
      if (typeof updateBodyLock === 'function') updateBodyLock();
      else document.body.classList.remove('modal-lock');
    }
    return;
  }

  if (selectedDeckIdx !== -1) {
    e.preventDefault();
    e.stopPropagation();
    selectedDeckIdx = -1;
    if (typeof renderDeck === 'function') renderDeck();
  }
}, true);
/* === script === */
(function(){
  function ensureUpgradeSet(){
    if(window.upgradedIds instanceof Set) return window.upgradedIds;
    if(Array.isArray(window.upgradedIds)){
      window.upgradedIds = new Set(window.upgradedIds);
      return window.upgradedIds;
    }
    try{
      window.upgradedIds = new Set(window.upgradedIds || []);
    }catch(e){
      window.upgradedIds = new Set();
    }
    return window.upgradedIds;
  }

  window.ensureUpgradeSet = ensureUpgradeSet;

  const originalRenderDeck = window.renderDeck;
  if(typeof originalRenderDeck === 'function'){
    window.renderDeck = function(){
      ensureUpgradeSet();
      const out = originalRenderDeck.apply(this, arguments);
      const cards = document.querySelectorAll('#deckGrid .dk-card');
      cards.forEach((card, idx) => {
        const nameEl = card.querySelector('.dk-name-text');
        if(!nameEl) return;
        const setRef = ensureUpgradeSet();
        const isUp = setRef.has(idx);
        card.classList.toggle('upgraded', isUp);
        const base = (nameEl.textContent || '').replace(/\+$/,'');
        nameEl.textContent = isUp ? (base + '+') : base;
      });
      return out;
    };
  }
})();
/* === script === */
(function(){
  function applyPcLayout(){
    const liveTab=document.getElementById('liveTab');
    if(!liveTab || document.querySelector('.pc-live-shell')) return;
    const buildPanel=document.getElementById('buildPanel');
    const pickerSection=document.getElementById('pickerSection');
    const resultSection=document.getElementById('resultSection');
    const deckCountRow=document.querySelector('.deck-count-row');
    const deckGrid=document.getElementById('deckGrid');
    const deckDivider=document.querySelector('#liveTab .deck-divider');
    if(!buildPanel || !pickerSection || !resultSection || !deckCountRow || !deckGrid) return;

    const shell=document.createElement('div');
    shell.className='pc-live-shell';

    const left=document.createElement('section');
    left.className='pc-col pc-col-left';
    const leftPane=document.createElement('div');
    leftPane.className='pc-pane pc-input-pane';
    const leftTitle=document.createElement('div');
    leftTitle.className='pc-pane-title';
    leftTitle.textContent=t('search.title');
    const descEl = resultSection.querySelector('.pc-result-desc');
    if(descEl) descEl.textContent=t('mode.hint');
    leftPane.appendChild(leftTitle);
    leftPane.appendChild(buildPanel);
    leftPane.appendChild(pickerSection);
    left.appendChild(leftPane);

    const center=document.createElement('section');
    center.className='pc-col pc-col-center';
    const centerPane=document.createElement('div');
    centerPane.className='pc-pane pc-result-pane';
    const centerTitle=document.createElement('div');
    centerTitle.className='pc-pane-title';
    centerTitle.textContent=t('panel.resultTitle');
    centerPane.appendChild(centerTitle);
    centerPane.appendChild(resultSection);
    center.appendChild(centerPane);

    const right=document.createElement('section');
    right.className='pc-col pc-col-right';
    const rightPane=document.createElement('div');
    rightPane.className='pc-pane pc-deck-pane';
    const rightTitle=document.createElement('div');
    rightTitle.className='pc-pane-title';
    rightTitle.textContent=t('panel.deckTitle');
    rightPane.appendChild(rightTitle);
    deckCountRow.id='deckCountRow';
    rightPane.appendChild(deckCountRow);
    rightPane.appendChild(deckGrid);
    right.appendChild(rightPane);

    shell.appendChild(left);
    shell.appendChild(center);
    shell.appendChild(right);

    if(deckDivider) deckDivider.remove();
    liveTab.appendChild(shell);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', applyPcLayout);
  }else{
    applyPcLayout();
  }
})();
/* === script === */
function showOnboarding(el){
  el.style.opacity = 0;
  requestAnimationFrame(()=>{
    el.classList.add('show');
  });
}
/* === script === */
function showOnboarding(el){
  el.style.visibility='hidden';
  el.style.opacity='0';

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      el.classList.add('show');
    });
  });
}
/* === script === */
/* === SHOP FLOW + SEARCH RESULT CLEANUP OVERRIDES === */

// 카드 검색 결과: profile/type 아이콘 제거
window.renderSearchGrid = function(){
  const wrap=document.getElementById('searchGridWrap');const q=document.getElementById('modalInput').value;const d=D();
  wrap.innerHTML='<div class="search-grid loading"></div>';
  const pool=deckAddMode?getCurrentCardPool().filter(c=>isSearchableCard(c,curChar)):getSearchPoolForSlot(activeSlot||0);
  let list;if(deckAddMode){list=pool.slice()}else{const ex=picks.filter((p,j)=>p&&j!==activeSlot);const pickable=pool.filter(c=>!BA().includes(c.n));list=pickable.filter(c=>!ex.includes(c.n))}
  list=list.map(c=>({card:c,rank:getSearchRank(c.n,q)})).filter(x=>isSearchableCard(x.card,curChar) && x.rank>-1).sort((a,b)=>b.rank-a.rank || a.card.n.length-b.card.n.length || a.card.n.localeCompare(b.card.n,'ko')).map(x=>x.card);
  searchResultList=list.slice();
  searchResultAction=[];
  if(!list.length){wrap.innerHTML=`<div class="search-empty">${t('common.noResult')}</div>`;return}
  let prog='';
  if(!deckAddMode){
    const need=getNeedCount();
    prog='<div class="slot-progress">'+Array.from({length:need},(_,i)=>`<span class="slot-dot ${i===activeSlot?'on':''} ${mode==='shop'&&isShopColorlessSlot(i)?'colorless':''}"></span>`).join('')+`<span class="slot-text">${getSlotLabel(activeSlot)} ${t('slot.selecting')}</span></div>`;
    if(mode==='shop'){
      prog+=`<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.colorlessOnly'):t('search.classOnly')}</div>`;
    }
  }
  const grid=document.createElement('div');grid.className='search-grid';
  list.forEach((card,idx)=>{
    const el=document.createElement('div');el.className='sg-card';
    const choose=()=>{
      if(deckAddMode){
        pushDeckCard(card.n);closeSearch();renderAll();
        setTimeout(()=>{},50);
        return;
      }
      picks[activeSlot]=card.n;
      const need=getNeedCount();
      const next=Array.from({length:need},(_,i)=>i).find(i=>!picks[i]);
      if(next!==undefined){
        activeSlot=next;
        document.getElementById('modalTitle').textContent=t('search.slotLabel',{label:getSlotLabel(next)});
        document.getElementById('modalInput').value='';
        renderRewardRow(); renderSearchGrid(); ensureSearchInputFocus();
      } else {
        closeSearch(); renderAll('to-result');
      }
    };
    searchResultAction[idx]=choose;
    el.onclick=choose;
    const img=makeImg(card.n,'sg');el.appendChild(img);
    const showKeycaps=(window.innerWidth>768) && q.trim().length>0;
    if(showKeycaps && idx<9) el.innerHTML+=`<span class="search-keycap">${idx+1}</span>`;
    el.innerHTML+=`<div class="sg-name">${tn(card.n)}</div><span class="sg-tier tier-${card.tier}">${card.tier}</span>${UNLOCK[card.n]?'<div class="lock-corner">🔒</div>':''}`;
    grid.appendChild(el)
  });
  wrap.innerHTML=prog;wrap.appendChild(grid)
};

function shopRemoveCard(name){
  const idx = picks.findIndex(v => v===name);
  if(idx>=0) picks[idx]='';
}
function remainingShopCards(){
  return picks.filter(Boolean);
}
window.buyShopCard = function(name){
  const from = picks.filter(Boolean);
  pushDeckCard(name);
  hist.push({p:`구매:${name}`,f:from});
  shopRemoveCard(name);
  deckAddMode=false; activeSlot=-1;
  const remain = remainingShopCards();
  if(remain.length){
    setLastAction(t('toast.addedToDeck',{name:tn(name)}), 'success');
    renderAll('to-result');
  }else{
    setLastAction(t('toast.shopComplete',{name:tn(name)}), 'success');
    finalizeShopCycle(t('action.buyEnd'));
  }
};

window.shopSkipCard = function(name){
  shopRemoveCard(name);
  deckAddMode=false; activeSlot=-1;
  const remain = remainingShopCards();
  if(remain.length){
    clearLastAction();
    renderAll('to-result');
  }else{
    setLastAction(t('toast.shopAllBought'), 'info');
    finalizeShopCycle(t('action.buyEnd'));
  }
};

window.pickCard = function(name){
  if(mode==='shop'){ buyShopCard(name); return; }
  pushDeckCard(name);
  setLastAction(t('toast.addedToDeck',{name:tn(name)}), 'success');
  finalizeRewardCycle(name);
};

window.doSkip = function(){
  const from=picks.filter(Boolean);
  if(mode==='shop'){
    setLastAction(t('toast.shopEnded'), 'info');
    if(from.length) hist.push({p:'구매 종료',f:from});
    deckAddMode=false;
    activeSlot=-1;
    picks=freshPicks();
    renderAll('to-picker');
    return;
  }
  setLastAction(t('toast.skipReward'), 'info');
  if(from.length) hist.push({p:'스킵',f:from});
  deckAddMode=false;
  activeSlot=-1;
  picks=freshPicks();
  renderAll('to-picker');
};

// 상점 결과 UI 재정의
window.renderResult = function(scored,skipScore){
  const sec=document.getElementById('resultSection');
  const body=document.getElementById('resultBody');
  const desc=sec.querySelector('.pc-result-desc');
  const isPc=window.innerWidth>768;
  if(desc) desc.style.display = isPc ? '' : 'none';

  if(!scored){
    body.innerHTML = lastActionMessage ? `<div class="result-feedback result-feedback-${lastActionKind||'info'}"><div class="feedback-icon">✓</div><div class="feedback-text">${lastActionMessage}</div></div>` : '';
    if(isPc){
      sec.style.display=''; sec.classList.add('open');
    }else{
      if(lastActionMessage){ sec.style.display=''; sec.classList.add('open'); }
      else { sec.style.display='none'; sec.classList.remove('open'); }
    }
    return;
  }
  sec.style.display=''; sec.classList.add('open');
  clearLastAction();
  body.innerHTML='';

  const isShopMode = mode==='shop';
  const top=scored[0];
  const skipBest=!top || top.score<=skipScore || top.warn;

  if(isShopMode){
    body.innerHTML += `<div class="res-note" style="margin-bottom:10px">${t('mode.shopEndHint')} <span class="res-skip-keycap">\`</span>${t('mode.shopEndPush')}</div>`;
  }

  let cardHotkeyIndex = 1;
  scored.forEach((it,i)=>{
    const best = !skipBest && i===0 && it.score>skipScore && (it.score-skipScore>=8 || !it.warn);
    const div=document.createElement('div');
    div.className='res-item'+(best?' best':'')+(!best?' res-compact-choice':'');
    div.dataset.rank = String(i+1);
    const hotkey = window.innerWidth>768 ? (cardHotkeyIndex<=9 ? cardHotkeyIndex++ : null) : null;
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
    if(compactChips.length){
      info+='<div class="res-state">';
      compactChips.slice(0,2).forEach(ch=>{info+=`<span class="res-chip ${ch[0]}">${tn(ch[1])}</span>`});
      info+='</div>';
    }
    info+=`<div class="res-summary">${tn(it.summary)}</div>`;
    if(UNLOCK[it.name]) info+=`<div class="res-unlock-mini">${t('common.unlockNeeded')}</div>`;
    if(best && it.reasons?.length) info+=`<div class="res-note">${tn(it.reasons[0])}</div>`;
    info+='</div>';
    head.innerHTML+=info;
    div.appendChild(head);

    const hot = hotkey ? `<span class="res-action-keycap">${hotkey}</span>` : '';
    if(isShopMode){
      div.innerHTML += `<div class="shop-card-actions"><button class="res-compact-btn${best?' is-recommended':''}" onclick="buyShopCard('${it.name}')">${hot}${t('action.buyThis')}</button><button class="res-compact-btn shop-skip-btn" onclick="shopSkipCard('${it.name}')">${t('action.skipThis')}</button></div>`;
    }else{
      div.innerHTML += `<button class="res-compact-btn${best?' is-recommended':''}" onclick="pickCard('${it.name}')">${hot}${t('action.pickThis')}</button>`;
    }
    body.appendChild(div);
  });

  // bottom skip / end action
  const action=document.createElement('div');
  action.className='res-item res-skip-compact'+(skipBest?' best skip-best is-top-recommend':'');
  action.dataset.rank='skip';
  const skipSummary = isShopMode
    ? (skipBest ? t('skipSummary.shopEndBetter') : t('skipSummary.shopEndHint'))
    : (skipBest ? t('skipSummary.skipBetter') : t('skipSummary.pickBetter'));
  action.innerHTML=`<div class="res-title-row">${skipBest?`<span class="res-badge" style="background:#22c55e;color:#fff">${t('common.recommend')}</span>`:''}<span class="res-title">${isShopMode?t('action.shopEnd'):t('action.skip')}</span></div><div class="res-summary">${skipSummary}</div><button type="button" data-action="do-skip" class="res-compact-btn${skipBest?' is-recommended':''}" onclick="doSkip()"><span class="res-skip-keycap">\`</span>${isShopMode?t('action.buyEnd'):t('action.skipDo')}</button>`;
  body.appendChild(action);
};
/* === script === */
(function(){
  const blockedSearchTerms = new Set(['profile','icon','portrait','avatar']);
  function normalizeText(v){
    return (v || '').toString().trim().toLowerCase();
  }
  function isBlockedCardEntry(card){
    if(!card) return false;
    const fields = [
      card.name, card.title, card.id, card.key, card.slug, card.image, card.img, card.type
    ].map(normalizeText);

    const joined = fields.join(' ');
    if (joined.includes('profile')) return true;

    const exact = fields.some(v => blockedSearchTerms.has(v));
    if (exact) return true;

    // image-only/profile-like dummy entries
    if ((normalizeText(card.name) === 'profile') || (normalizeText(card.title) === 'profile')) return true;

    return false;
  }

  const originalRenderSearchGrid = window.renderSearchGrid;
  if (typeof originalRenderSearchGrid === 'function') {
    window.renderSearchGrid = function(){
      // try to filter the source array commonly used by the page
      const candidateKeys = ['allCards','searchCards','cards','cardDb','CARD_DB'];
      candidateKeys.forEach((k) => {
        if (Array.isArray(window[k])) {
          window[k] = window[k].filter(c => !isBlockedCardEntry(c));
        }
      });

      const result = originalRenderSearchGrid.apply(this, arguments);

      // DOM-level cleanup fallback
      const grid = document.querySelector('#searchGridWrap, .search-grid, #searchGrid');
      if (grid) {
        [...grid.querySelectorAll('.sg-card, .search-card, .card')].forEach(el => {
          const label = (el.textContent || '').trim().toLowerCase();
          const img = (el.querySelector('img')?.getAttribute('src') || '').toLowerCase();
          if (label === 'profile' || label.includes(' profile') || img.includes('profile')) {
            el.remove();
          }
        });
      }
      return result;
    };
  }
})();
/* === script === */
(function(){
  function moveBestShopExitToTop(){
    const body = document.getElementById('resultBody');
    if(!body) return;
    const skipBest = body.querySelector('.res-skip-compact.skip-best');
    if(!skipBest) return;
    body.prepend(skipBest);
  }

  // initial + after render tick
  const run = () => requestAnimationFrame(() => requestAnimationFrame(moveBestShopExitToTop));
  run();

  const bodyEl = document.getElementById('resultBody');
  if(bodyEl){
    const mo = new MutationObserver(run);
    mo.observe(bodyEl, {childList:true, subtree:false});
  }

  // also expose for any render function to call if needed
  window.moveBestShopExitToTop = moveBestShopExitToTop;
})();
/* === script === */
(function(){
  // Hard-kill any remaining auto-scroll behavior that fights user scrolling.
  window.scrollToRecommendations = function(){};
  window.scrollToPickerTop = function(){};
  window.scrollToBuildButtons = function(){};
  window.applyBestOnlyRecommendation = function(){
    const visible = (el)=>{
      if(!el) return false;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    const items=[...document.querySelectorAll('.res-item')].filter(visible);
    items.forEach((it,idx)=>{
      const btn=it.querySelector('.res-compact-btn, .res-select-btn');
      if(btn) btn.classList.remove('is-recommended');
      if(idx===0 && btn) btn.classList.add('is-recommended');
    });
  };

  document.addEventListener('click', function(e){
    const target = e.target.closest && e.target.closest('.res-item, .res-compact-btn, .res-select-btn, .reward-slot, .sg-card, .dk-card, .dk-add');
    if(!target) return;
    setTimeout(function(){
      document.body.classList.remove('modal-lock');
      document.body.style.top='';
    }, 0);
  }, true);
})();
/* === script === */
(function(){
  const state = {
    isAutoScrolling:false,
    autoScrollUntil:0,
    userLockUntil:0,
    suppressUntil:0,
    lastRunAt:{},
    pendingReason:null,
    pendingMeta:null,
    pendingForce:false,
    pendingExpiresAt:0
  };

  function now(){ return Date.now(); }
  function isMobile(){ return window.innerWidth <= 768; }
  function visible(el){
    if(!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function clearPending(){
    state.pendingReason = null;
    state.pendingMeta = null;
    state.pendingForce = false;
    state.pendingExpiresAt = 0;
  }
  function markUserInteracted(){
    const t = now();
    if(t < state.autoScrollUntil) return;
    state.userLockUntil = t + 1600;
    clearPending();
  }
  ['wheel','touchstart','touchmove','pointerdown','mousedown'].forEach(type=>{
    window.addEventListener(type, markUserInteracted, {passive:true, capture:true});
  });
  window.addEventListener('scroll', function(){
    if(now() < state.autoScrollUntil) return;
    state.userLockUntil = now() + 1200;
  }, {passive:true, capture:true});

  function allowReason(reason, opts){
    const t = now();
    const last = state.lastRunAt[reason] || 0;
    const force = !!(opts && opts.force);
    if(t < state.suppressUntil) return false;
    if(state.isAutoScrolling) return false;
    if(!force && t < state.userLockUntil) return false;
    if(t - last < 700) return false;
    return true;
  }

  function mobileTopTarget(){
    const result = document.getElementById('resultSection') || document.getElementById('resultBody');
    const picker = document.getElementById('pickerSection') || document.getElementById('liveTab');
    if(visible(result)) return result;
    return picker || result;
  }

  function pcTopTarget(){
    return document.getElementById('pickerSection') || document.getElementById('liveTab') || document.getElementById('resultSection');
  }

  function targetForReason(reason, meta){
    const mobile = isMobile();
    if(reason === 'to-result'){
      return mobile ? mobileTopTarget() : (document.getElementById('resultSection') || document.getElementById('resultBody'));
    }
    if(reason === 'to-picker'){
      return mobile ? mobileTopTarget() : pcTopTarget();
    }
    if(reason === 'to-top'){
      return mobile ? mobileTopTarget() : pcTopTarget();
    }
    return null;
  }

  function runAutoScroll(reason, meta, opts){
    const target = targetForReason(reason, meta);
    if(!visible(target) || !allowReason(reason, opts)) return false;

    state.isAutoScrolling = true;
    state.lastRunAt[reason] = now();
    state.autoScrollUntil = now() + 900;

    try{
      target.scrollIntoView({behavior:'smooth', block:'start', inline:'nearest'});
    }catch(_e){
      target.scrollIntoView(true);
    }

    window.clearTimeout(state._autoScrollTimer);
    state._autoScrollTimer = window.setTimeout(function(){
      state.isAutoScrolling = false;
      state.autoScrollUntil = 0;
    }, 900);
    return true;
  }

  function queueAutoScroll(reason, meta, force){
    state.pendingReason = reason;
    state.pendingMeta = meta || null;
    state.pendingForce = !!force;
    state.pendingExpiresAt = now() + 1200;
  }

  function flushPendingAutoScroll(scrollMode){
    if(now() < state.suppressUntil) return;

    let reason = null;
    let meta = null;
    let force = false;

    if(state.pendingReason && now() < state.pendingExpiresAt){
      reason = state.pendingReason;
      meta = state.pendingMeta;
      force = state.pendingForce;
    }else if(scrollMode && scrollMode !== 'none'){
      reason = scrollMode;
    }

    if(!reason) return;

    clearPending();

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        runAutoScroll(reason, meta, {force:force});
      });
    });
  }

  window.scrollToRecommendations = function(){ runAutoScroll('to-result'); };
  window.scrollToPickerTop = function(){ runAutoScroll('to-picker'); };
  window.scrollToBuildButtons = function(){ runAutoScroll('to-picker'); };

  if(typeof window.renderAll === 'function'){
    const _renderAll = window.renderAll;
    window.renderAll = function(scrollMode='none'){
      const result = _renderAll.call(this, scrollMode);
      flushPendingAutoScroll(scrollMode);
      return result;
    };
  }

  if(typeof window.pushDeckCard === 'function'){
    const _pushDeckCard = window.pushDeckCard;
    window.pushDeckCard = function(){
      try{
        const modalOpen = typeof window.isSearchModalOpen === 'function' ? window.isSearchModalOpen() : false;
        if(modalOpen && window.deckAddMode){
          queueAutoScroll('to-top', {source:'deck-add-complete'}, true);
        }
      }catch(_e){}
      return _pushDeckCard.apply(this, arguments);
    };
  }

  if(typeof window.openDeckAdd === 'function'){
    const _openDeckAdd = window.openDeckAdd;
    window.openDeckAdd = function(){
      clearPending();
      state.suppressUntil = now() + 800;
      return _openDeckAdd.apply(this, arguments);
    };
  }

  ['pickCard','doSkip','buyShopCard','shopSkipCard'].forEach(function(fnName){
    if(typeof window[fnName] !== 'function') return;
    const original = window[fnName];
    window[fnName] = function(){
      queueAutoScroll('to-top', {source:fnName}, true);
      return original.apply(this, arguments);
    };
  });

  window.__autoScrollState = state;
  window.__queueAutoScroll = queueAutoScroll;
})();
/* === script === */
(function(){
  const state = window.__autoScrollState || (window.__autoScrollState = {});
  function now(){ return Date.now(); }
  function isMobile(){ return window.innerWidth <= 768; }
  function visible(el){
    if(!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  }
  function pickerTopTarget(){
    return document.getElementById('pickerSection')
      || document.getElementById('liveTab')
      || document.querySelector('.app-tabs')
      || document.body;
  }
  function resultTopTarget(){
    return document.getElementById('resultSection') || document.getElementById('resultBody') || pickerTopTarget();
  }

  // Prevent legacy deckGrid auto-scroll after deck-add card selection.
  state.ignoreDeckGridScrollUntil = 0;
  const nativeScrollIntoView = Element.prototype.scrollIntoView;
  if(!Element.prototype.__hailotPatchedScrollIntoView){
    Element.prototype.__hailotPatchedScrollIntoView = true;
    Element.prototype.scrollIntoView = function(){
      try{
        if(this && this.id === 'deckGrid' && now() < (window.__autoScrollState?.ignoreDeckGridScrollUntil || 0)){
          return;
        }
      }catch(_e){}
      return nativeScrollIntoView.apply(this, arguments);
    };
  }

  // Patch queue helper so deck add completion and buy/skip/finish always go to picker top.
  const originalQueue = window.__queueAutoScroll;
  if(typeof originalQueue === 'function'){
    window.__queueAutoScroll = function(reason, meta, force){
      if(reason === 'to-top' || reason === 'to-picker'){
        reason = 'to-picker-top';
      }
      return originalQueue(reason, meta, force);
    };
  }

  // Replace run behavior via exported helpers.
  window.scrollToPickerTop = function(){
    const target = pickerTopTarget();
    if(!visible(target)) return;
    try{ target.scrollIntoView({behavior:'smooth', block:'start', inline:'nearest'}); }
    catch(_e){ target.scrollIntoView(true); }
  };
  window.scrollToRecommendations = function(){
    const target = resultTopTarget();
    if(!visible(target)) return;
    try{ target.scrollIntoView({behavior:'smooth', block:'start', inline:'nearest'}); }
    catch(_e){ target.scrollIntoView(true); }
  };
  window.scrollToBuildButtons = window.scrollToPickerTop;

  // Re-wrap renderAll so policy is explicit.
  if(typeof window.renderAll === 'function' && !window.__hailotRenderAllV11Patched){
    window.__hailotRenderAllV11Patched = true;
    const _renderAll = window.renderAll;
    window.renderAll = function(scrollMode='none'){
      const result = _renderAll.call(this, scrollMode);
      const pending = window.__autoScrollState || {};
      const pr = pending.pendingReason;
      const force = pending.pendingForce;
      const expires = pending.pendingExpiresAt || 0;
      const validPending = pr && now() < expires;
      const reason = validPending ? pr : scrollMode;
      if(reason === 'to-picker-top' || reason === 'to-picker' || reason === 'to-top'){
        pending.pendingReason = null;
        pending.pendingMeta = null;
        pending.pendingForce = false;
        pending.pendingExpiresAt = 0;
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollToPickerTop()));
      }else if(reason === 'to-result'){
        pending.pendingReason = null;
        pending.pendingMeta = null;
        pending.pendingForce = false;
        pending.pendingExpiresAt = 0;
        requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollToRecommendations()));
      }
      return result;
    };
  }

  // Deck add: clicking + only opens modal; only after actual card chosen do we scroll to top.
  if(typeof window.pushDeckCard === 'function' && !window.__hailotPushDeckCardV11Patched){
    window.__hailotPushDeckCardV11Patched = true;
    const _pushDeckCard = window.pushDeckCard;
    window.pushDeckCard = function(){
      const beforeLen = Array.isArray(window.deck) ? window.deck.length : null;
      const modalOpen = typeof window.isSearchModalOpen === 'function' ? window.isSearchModalOpen() : false;
      const wasDeckAdd = !!window.deckAddMode;
      const ret = _pushDeckCard.apply(this, arguments);
      const afterLen = Array.isArray(window.deck) ? window.deck.length : null;
      if(wasDeckAdd && modalOpen && beforeLen != null && afterLen != null && afterLen > beforeLen){
        state.ignoreDeckGridScrollUntil = now() + 1500;
        if(typeof window.__queueAutoScroll === 'function'){
          window.__queueAutoScroll('to-picker-top', {source:'deck-add-complete'}, true);
        }
      }
      return ret;
    };
  }

  // Reward/shop actions: after completion always move to picker top, not deck end.
  ['pickCard','doSkip','buyShopCard','shopSkipCard'].forEach(function(fnName){
    const fn = window[fnName];
    if(typeof fn !== 'function' || fn.__hailotV11Patched) return;
    const wrapped = function(){
      if(typeof window.__queueAutoScroll === 'function'){
        window.__queueAutoScroll('to-picker-top', {source:fnName}, true);
      }
      return fn.apply(this, arguments);
    };
    wrapped.__hailotV11Patched = true;
    window[fnName] = wrapped;
  });
})();
/* === script === */
(function(){
  if(window.__hailotFinalV12Patched) return;
  window.__hailotFinalV12Patched = true;

  function topTarget(){
    return document.getElementById('pickerSection')
      || document.getElementById('liveTab')
      || document.querySelector('.app-tabs')
      || document.body;
  }
  function scrollToTopTarget(){
    const el = topTarget();
    if(!el) return;
    const y = Math.max(0, window.pageYOffset + el.getBoundingClientRect().top - 8);
    try{
      window.scrollTo({ top:y, behavior:'smooth' });
    }catch(_e){
      window.scrollTo(0, y);
    }
  }
  function scheduleTopScroll(){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        scrollToTopTarget();
      });
    });
  }

  // Kill all legacy queued auto-scroll behavior. We will control policy explicitly per action.
  window.__queueAutoScroll = function(){};
  window.scrollToRecommendations = function(){};
  window.scrollToBuildButtons = function(){};
  window.scrollToPickerTop = function(){};

  if(typeof window.renderAll === 'function' && !window.__hailotRenderAllV12Patched){
    window.__hailotRenderAllV12Patched = true;
    const _renderAll = window.renderAll;
    window.renderAll = function(scrollMode){
      return _renderAll.call(this, 'none');
    };
  }

  if(typeof window.pickCard === 'function' && !window.pickCard.__hailotV12Patched){
    const _pickCard = window.pickCard;
    const wrapped = function(){
      const ret = _pickCard.apply(this, arguments);
      scheduleTopScroll(); // 보상 선택 후 바로 다음 선택 준비
      return ret;
    };
    wrapped.__hailotV12Patched = true;
    window.pickCard = wrapped;
  }

  if(typeof window.doSkip === 'function' && !window.doSkip.__hailotV12Patched){
    const _doSkip = window.doSkip;
    const wrapped = function(){
      const ret = _doSkip.apply(this, arguments);
      scheduleTopScroll(); // 보상 스킵, 상점 구매 종료 후 상단 이동
      return ret;
    };
    wrapped.__hailotV12Patched = true;
    window.doSkip = wrapped;
  }

  // 상점 카드 구매는 스크롤을 건드리지 않음
  if(typeof window.buyShopCard === 'function' && !window.buyShopCard.__hailotV12Patched){
    const _buyShopCard = window.buyShopCard;
    const wrapped = function(){
      return _buyShopCard.apply(this, arguments);
    };
    wrapped.__hailotV12Patched = true;
    window.buyShopCard = wrapped;
  }

  // +추가 클릭 시에는 스크롤하지 않고, 실제 덱 반영 완료 후에만 상단 이동
  if(typeof window.pushDeckCard === 'function' && !window.pushDeckCard.__hailotV12Patched){
    const _pushDeckCard = window.pushDeckCard;
    const wrapped = function(){
      const beforeLen = Array.isArray(window.deck) ? window.deck.length : null;
      const wasDeckAdd = !!window.deckAddMode;
      const ret = _pushDeckCard.apply(this, arguments);
      const afterLen = Array.isArray(window.deck) ? window.deck.length : null;
      if(wasDeckAdd && beforeLen != null && afterLen != null && afterLen > beforeLen){
        scheduleTopScroll();
      }
      return ret;
    };
    wrapped.__hailotV12Patched = true;
    window.pushDeckCard = wrapped;
  }

  // 혹시 남아있는 deckGrid.scrollIntoView가 마지막 카드 쪽으로 끌어당기면 차단
  if(!Element.prototype.__hailotPatchedScrollIntoViewV12){
    const native = Element.prototype.scrollIntoView;
    Element.prototype.__hailotPatchedScrollIntoViewV12 = true;
    Element.prototype.scrollIntoView = function(){
      try{
        if(this && this.id === 'deckGrid'){
          return;
        }
      }catch(_e){}
      return native.apply(this, arguments);
    };
  }
})();
/* === script === */
(function(){
  if(window.__hailotForceTopV13) return;
  window.__hailotForceTopV13 = true;

  function isMobile(){ return window.innerWidth <= 768; }
  function forceTop(){
    try{ window.scrollTo({top:0, behavior:'auto'}); }
    catch(_e){ window.scrollTo(0,0); }
    try{ document.documentElement.scrollTop = 0; }catch(_e){}
    try{ document.body.scrollTop = 0; }catch(_e){}
  }
  function forceTopBurst(){
    [0, 16, 40, 80, 140, 220, 320, 450, 650, 900].forEach(function(delay){
      setTimeout(function(){
        forceTop();
        try{ requestAnimationFrame(forceTop); }catch(_e){}
      }, delay);
    });
  }

  // Completely disable helper auto-scroll hooks; explicit actions only.
  window.__queueAutoScroll = function(){};
  window.scrollToRecommendations = function(){};
  window.scrollToBuildButtons = function(){};
  window.scrollToPickerTop = function(){};

  if(typeof window.renderAll === 'function' && !window.__hailotRenderAllV13){
    window.__hailotRenderAllV13 = true;
    const _renderAll = window.renderAll;
    window.renderAll = function(){
      return _renderAll.call(this, 'none');
    };
  }

  // Reward card pick: ALWAYS go to page top after the pick has actually rendered.
  if(typeof window.pickCard === 'function' && !window.pickCard.__hailotV13){
    const _pickCard = window.pickCard;
    window.pickCard = function(){
      const ret = _pickCard.apply(this, arguments);
      forceTopBurst();
      return ret;
    };
    window.pickCard.__hailotV13 = true;
  }

  // Skip / shop finish: ALWAYS go to page top.
  if(typeof window.doSkip === 'function' && !window.doSkip.__hailotV13){
    const _doSkip = window.doSkip;
    window.doSkip = function(){
      const ret = _doSkip.apply(this, arguments);
      forceTopBurst();
      return ret;
    };
    window.doSkip.__hailotV13 = true;
  }

  // Shop buy: NEVER scroll.
  if(typeof window.buyShopCard === 'function' && !window.buyShopCard.__hailotV13){
    const _buyShopCard = window.buyShopCard;
    window.buyShopCard = function(){
      return _buyShopCard.apply(this, arguments);
    };
    window.buyShopCard.__hailotV13 = true;
  }

  // Deck add: clicking + does nothing. Only after real deck insertion, go to page top.
  if(typeof window.pushDeckCard === 'function' && !window.pushDeckCard.__hailotV13){
    const _pushDeckCard = window.pushDeckCard;
    window.pushDeckCard = function(){
      const beforeLen = Array.isArray(window.deck) ? window.deck.length : null;
      const wasDeckAdd = !!window.deckAddMode;
      const ret = _pushDeckCard.apply(this, arguments);
      const afterLen = Array.isArray(window.deck) ? window.deck.length : null;
      if(wasDeckAdd && beforeLen != null && afterLen != null && afterLen > beforeLen){
        forceTopBurst();
      }
      return ret;
    };
    window.pushDeckCard.__hailotV13 = true;
  }

  // Block any remaining legacy attempts to drag viewport to the deck area.
  if(!Element.prototype.__hailotPatchedScrollIntoViewV13){
    const native = Element.prototype.scrollIntoView;
    Element.prototype.__hailotPatchedScrollIntoViewV13 = true;
    Element.prototype.scrollIntoView = function(){
      try{
        const id = this && this.id;
        if(id === 'deckGrid' || id === 'deckCountRow') return;
        if(this && this.closest && this.closest('#deckGrid')) return;
      }catch(_e){}
      return native.apply(this, arguments);
    };
  }
})();
/* === script === */
/* === FINAL SEARCH HOTFIX: repo-filename based card parsing === */
(function(){
  const REPO_FILES = ["FTL_Defect.webp", "HelloWorld_Colorless.webp", "Null_Defect.webp", "profile_Defect.webp", "profile_Ironclad.webp", "profile_Necrobinder.webp", "profile_Regent.webp", "profile_Silent.webp", "가로막기_Colorless.webp", "가마솥.webp", "가속이탈_Defect.webp", "갈가리찢기_Ironclad.webp", "갈취_Ironclad.webp", "감마세례_Regent.webp", "감염_Colorless.webp", "감정칩.webp", "강령의극의_Necrobinder.webp", "강령회_Necrobinder.webp", "강철의섬광_Colorless.webp", "강철의폭풍_Silent.webp", "강타_Ironclad.webp", "강탈_Necrobinder.webp", "강행돌파_Defect.webp", "거대한바위_Colorless.webp", "거상_Ironclad.webp", "걷어내기_Defect.webp", "검날개선_Regent.webp", "검무_Silent.webp", "검성_Regent.webp", "검술안내서.webp", "게임용말.webp", "격노_Ironclad.webp", "격돌_Colorless.webp", "격려_Necrobinder.webp", "경계엿보기_Necrobinder.webp", "경계태세_Necrobinder.webp", "계몽_Colorless.webp", "계산된도박_Silent.webp", "고깃덩어리.webp", "고동치는도끼_Colorless.webp", "고동치는잔여물.webp", "고리형강인함_Colorless.webp", "고정시키기_Colorless.webp", "고철을보물로_Defect.webp", "곡예_Silent.webp", "공격성_Ironclad.webp", "공구함.webp", "공명하는트라이앵글.webp", "공생바이러스.webp", "공중제비_Silent.webp", "공진_Regent.webp", "공허_Colorless.webp", "공허의부름_Necrobinder.webp", "공허의형상_Regent.webp", "광란_Ironclad.webp", "광란의포식_Colorless.webp", "광선휩쓸기_Defect.webp", "광자베기_Regent.webp", "광채_Regent.webp", "괜찮은전략_Silent.webp", "구렁이의형상_Silent.webp", "구르기_Silent.webp", "구속된성물함.webp", "구슬주머니.webp", "군주의시선_Regent.webp", "군주의칼날_Colorless.webp", "굴뚝_Defect.webp", "굴러가는바위_Colorless.webp", "굴절_Defect.webp", "궁극의수비_Colorless.webp", "궁극의타격_Colorless.webp", "권역_Necrobinder.webp", "권위행사_Regent.webp", "궤도_Regent.webp", "귀를찢는비명_Silent.webp", "규칙준수_Colorless.webp", "그렇게하라_Regent.webp", "그렘린뿔.webp", "그림자걸음_Silent.webp", "그림자방패_Defect.webp", "그림자소모_Defect.webp", "그림자은신_Silent.webp", "그을음_Colorless.webp", "극적인입장_Colorless.webp", "긁어내기_Defect.webp", "금강저.webp", "금지된마도서_Colorless.webp", "금지된마도서_Necrobinder.webp", "기계학습_Defect.webp", "기량_Colorless.webp", "기력흡수_Necrobinder.webp", "기묘하게매끄러운돌.webp", "기쁨의선물_Regent.webp", "기사회생_Ironclad.webp", "길잃은위습.webp", "길잡이별_Regent.webp", "꼬챙이_Silent.webp", "꽃가루핵.webp", "꽃샘추위_Defect.webp", "끌어내리기_Necrobinder.webp", "나는무적이다_Regent.webp", "나선관통_Defect.webp", "나선형다트.webp", "나태_Colorless.webp", "낙인_Ironclad.webp", "난도질_Ironclad.webp", "난동_Defect.webp", "난사_Colorless.webp", "난타_Ironclad.webp", "날개부적.webp", "날세우기_Regent.webp", "날카로운이빨.webp", "낡은동전.webp", "내세_Necrobinder.webp", "냉각재_Defect.webp", "냉정함_Defect.webp", "너만믿는다_Colorless.webp", "넘기기_Necrobinder.webp", "네주제를알라_Regent.webp", "녹아내리는주먹_Ironclad.webp", "녹아내린알.webp", "뇌우_Defect.webp", "눈할퀴기_Defect.webp", "능숙_Colorless.webp", "니오우의격분_Colorless.webp", "닌자두루마리.webp", "다리걸기_Silent.webp", "다섯반지의책.webp", "다시시작_Defect.webp", "다중시전_Defect.webp", "단검분사_Silent.webp", "단검투척_Silent.webp", "단결_Colorless.webp", "단도_Colorless.webp", "달모양페스츄리.webp", "달의세례_Regent.webp", "닻.webp", "대공포_Defect.webp", "대단원의막_Silent.webp", "대령하라_Regent.webp", "대혼란_Colorless.webp", "대화재_Ironclad.webp", "덜그럭대기_Necrobinder.webp", "덤벼라_Ironclad.webp", "덮쳐_Necrobinder.webp", "덮치기_Silent.webp", "데이터디스크.webp", "도마뱀꼬리.webp", "도망칠수없다_Necrobinder.webp", "도박용칩.webp", "도발_Ironclad.webp", "도약_Defect.webp", "도탄_Silent.webp", "독바르기_Silent.webp", "독백_Regent.webp", "독재_Regent.webp", "독찌르기_Silent.webp", "돌갑옷_Ironclad.webp", "돌검.webp", "돌격_Regent.webp", "돌리의거울.webp", "돌진_Silent.webp", "동기화_Defect.webp", "동력전지.webp", "동전기_Defect.webp", "되돌리기_Colorless.webp", "두들겨패기_Colorless.webp", "두려움_Necrobinder.webp", "뒤틀린깔때기.webp", "드림캐처.webp", "들춰내기_Silent.webp", "등반가의골칫거리_Colorless.webp", "딸기.webp", "땅고르기_Necrobinder.webp", "때가되었다_Necrobinder.webp", "때려눕히기_Colorless.webp", "때묻은러그.webp", "떨림_Ironclad.webp", "똘똘뭉치기_Colorless.webp", "랜턴.webp", "랜턴열쇠_Colorless.webp", "레이저포인터_Defect.webp", "로열티_Regent.webp", "로켓펀치_Defect.webp", "룬축전기.webp", "리갈라이트.webp", "리의와플.webp", "리의와플마이너.webp", "마름쇠_Colorless.webp", "마무리_Silent.webp", "막아라_Regent.webp", "만물절단_Colorless.webp", "망각_Necrobinder.webp", "망고.webp", "망고마이너.webp", "망치질시간_Regent.webp", "망토걸쇠.webp", "망토와단검_Silent.webp", "매달기_Necrobinder.webp", "매료됨_Colorless.webp", "매장_Necrobinder.webp", "맹독_Silent.webp", "멈추지않는팽이.webp", "메멘토모리_Silent.webp", "메아리의형상_Defect.webp", "메아리참격_Silent.webp", "메트로놈.webp", "멤버십카드.webp", "모독_Necrobinder.webp", "모드적용_Defect.webp", "목보호대.webp", "목조르기_Silent.webp", "목패.webp", "몸부림_Colorless.webp", "몸통박치기_Ironclad.webp", "몽둥이질_Ironclad.webp", "무감각_Ironclad.webp", "무기고_Regent.webp", "무덤지기_Necrobinder.webp", "무덤폭발_Necrobinder.webp", "무력화_Silent.webp", "무례함의차.webp", "무자비_Ironclad.webp", "무적_Ironclad.webp", "무지개_Defect.webp", "무지개반지.webp", "무한의검날_Silent.webp", "물렀거라_Regent.webp", "미니리젠트.webp", "미니어처대포.webp", "미니어처텐트.webp", "미라의손.webp", "미래예지_Colorless.webp", "밀집타격_Defect.webp", "바람의딸.webp", "바리케이드_Ironclad.webp", "박멸_Colorless.webp", "박살_Colorless.webp", "박살_Ironclad.webp", "박치기_Ironclad.webp", "반복_Defect.webp", "반사_Regent.webp", "반사신경_Silent.webp", "반짝이는립스틱.webp", "반항_Necrobinder.webp", "발견_Colorless.webp", "발광_Colorless.webp", "발놀림_Silent.webp", "발병_Silent.webp", "발화_Ironclad.webp", "방울의저주_Colorless.webp", "방출_Regent.webp", "방해_Colorless.webp", "배.webp", "배달원.webp", "배신_Silent.webp", "배터리충전_Defect.webp", "백년퍼즐.webp", "백색소음_Defect.webp", "밴시의외침_Necrobinder.webp", "뱀물기_Silent.webp", "뱀의반지.webp", "버둥씨.webp", "버퍼_Defect.webp", "번개구체_Defect.webp", "범접불가_Silent.webp", "벨트버클.webp", "벼락_Defect.webp", "변형_Necrobinder.webp", "별똥별_Regent.webp", "별무리_Regent.webp", "별의망토_Regent.webp", "별의아이_Regent.webp", "별의파동_Regent.webp", "별자리판.webp", "병법서.webp", "보루_Regent.webp", "보물지도_Colorless.webp", "봉인된왕좌_Colorless.webp", "봉인된왕좌_Regent.webp", "부름_Necrobinder.webp", "부메랑칼날_Ironclad.webp", "부상_Colorless.webp", "부서진핵.webp", "부식_Necrobinder.webp", "부식성파도_Silent.webp", "부양_Colorless.webp", "부팅과정_Defect.webp", "부패_Colorless.webp", "분노_Ironclad.webp", "분리_Necrobinder.webp", "분석_Necrobinder.webp", "분해_Colorless.webp", "불가피한충돌_Regent.webp", "불굴_Ironclad.webp", "불릿타임_Silent.webp", "불멸의인장.webp", "불바다_Ironclad.webp", "불사_Necrobinder.webp", "불시착_Regent.webp", "불운_Colorless.webp", "불의심장_Ironclad.webp", "불의의일격_Silent.webp", "불쾌_Silent.webp", "불타는나뭇가지.webp", "불타는조약_Ironclad.webp", "불타는혈액.webp", "붉은가면.webp", "붉은해골.webp", "블랙홀_Regent.webp", "비관적인맥박_Necrobinder.webp", "비룡의반지.webp", "비명을지르는병.webp", "비밀기술_Colorless.webp", "비밀병기_Colorless.webp", "비밀상자_Regent.webp", "비상단추_Colorless.webp", "비애_Necrobinder.webp", "비열함_Silent.webp", "비참함_Necrobinder.webp", "비책_Silent.webp", "비취검.webp", "비트루비우스적하수인.webp", "빅뱅_Regent.webp", "빙봉.webp", "빙하_Defect.webp", "빚_Colorless.webp", "빛거두기_Regent.webp", "빛나는타격_Regent.webp", "빛의흐름_Regent.webp", "빵.webp", "뼈다귀차.webp", "뼈플루트.webp", "뼛조각_Necrobinder.webp", "사냥_Silent.webp", "사냥돌_Colorless.webp", "사슬낫.webp", "사신의낫_Necrobinder.webp", "사신의형상_Necrobinder.webp", "사전타격_Ironclad.webp", "사중시전_Colorless.webp", "사중시전_Defect.webp", "사혈_Ironclad.webp", "산산조각_Defect.webp", "살점재주_Necrobinder.webp", "살해_Silent.webp", "삽.webp", "상아패.webp", "상인의양탄자마이너.webp", "상처_Colorless.webp", "생명삼키기_Necrobinder.webp", "생산_Colorless.webp", "생존자_Silent.webp", "샹들리에.webp", "섀급습_Colorless.webp", "섀도니스알_Colorless.webp", "서류폭풍_Necrobinder.webp", "서브루틴_Defect.webp", "서투름_Colorless.webp", "석재달력.webp", "석화된두꺼비.webp", "석회화_Necrobinder.webp", "선장의타륜.webp", "선제타격_Silent.webp", "선조의망치_Regent.webp", "설계의대가_Silent.webp", "섬뜩한램프.webp", "성급함_Colorless.webp", "성대한도박_Regent.webp", "소리굽쇠.webp", "소뿔모양걸이.webp", "소생_Necrobinder.webp", "소용돌이_Ironclad.webp", "손기술_Silent.webp", "쇄도_Ironclad.webp", "쇠락_Necrobinder.webp", "쇠약의손길_Necrobinder.webp", "쇠퇴_Colorless.webp", "수렴_Regent.webp", "수리검.webp", "수면부족_Colorless.webp", "수비_Defect.webp", "수비_Ironclad.webp", "수비_Necrobinder.webp", "수비_Regent.webp", "수비_Silent.webp", "수은모래시계.webp", "수의_Necrobinder.webp", "수치_Colorless.webp", "수확_Necrobinder.webp", "순수_Colorless.webp", "순회_Defect.webp", "숨겨진단검_Silent.webp", "숨겨진보석_Colorless.webp", "숫돌.webp", "스네코의눈마이너.webp", "스네코의해골.webp", "스택_Colorless.webp", "스펙트럼이동_Regent.webp", "스피너_Defect.webp", "스피드스터_Silent.webp", "시선유도_Necrobinder.webp", "식권.webp", "신기루_Silent.webp", "신비로운라이터.webp", "신성_Colorless.webp", "신성한빛.webp", "신성한운명.webp", "신호증폭_Defect.webp", "싸움준비_Ironclad.webp", "쌍절곤.webp", "쑤시기_Necrobinder.webp", "아귀저금통.webp", "아드레날린_Silent.webp", "아이스크림.webp", "아지랑이_Silent.webp", "아카베코.webp", "악랄함_Ironclad.webp", "악마의눈_Ironclad.webp", "악마의방패_Ironclad.webp", "악마의혓바닥.webp", "악마의형상_Ironclad.webp", "악몽_Silent.webp", "악의_Ironclad.webp", "안식_Colorless.webp", "암살_Silent.webp", "압도_Colorless.webp", "압축_Defect.webp", "야성_Defect.webp", "어두운피.webp", "어둠_Defect.webp", "어둠의족쇄_Colorless.webp", "어둠의포옹_Ironclad.webp", "어려운결정_Regent.webp", "어리석음_Colorless.webp", "어지러움_Colorless.webp", "어퍼컷_Ironclad.webp", "얼어붙은알.webp", "얼음창_Defect.webp", "엄선된치즈.webp", "에너자이저_Defect.webp", "에너지폭주_Defect.webp", "엔트로피_Colorless.webp", "역병타격_Necrobinder.webp", "역사강의서.webp", "연금_Colorless.webp", "연료_Colorless.webp", "연마_Silent.webp", "연명_Necrobinder.webp", "연쇄_Ironclad.webp", "연장_Colorless.webp", "염원_Colorless.webp", "염주.webp", "영원의갑옷_Colorless.webp", "영원의깃털.webp", "영원한얼음.webp", "영체화_Colorless.webp", "영혼_Colorless.webp", "영혼폭풍_Necrobinder.webp", "예비_Silent.webp", "예언_Regent.webp", "예측_Silent.webp", "오래가는사탕.webp", "오리하르콘.webp", "오리하르콘마이너.webp", "오버클럭_Defect.webp", "오한_Defect.webp", "완갑.webp", "완벽한타격_Ironclad.webp", "완수_Silent.webp", "왕실도장.webp", "왕실의독.webp", "왕의발차기_Regent.webp", "왕의주먹_Regent.webp", "요지부동_Ironclad.webp", "용과.webp", "용광로_Regent.webp", "용기의투석구.webp", "용암램프.webp", "우박폭풍_Defect.webp", "우정_Necrobinder.webp", "우주먼지_Regent.webp", "우주적무관심_Regent.webp", "운명공유_Necrobinder.webp", "울퉁불퉁한망치.webp", "원시의힘_Ironclad.webp", "원투펀치_Ironclad.webp", "웡고스고객감사배지.webp", "웡고스비밀티켓.webp", "위대한재련_Regent.webp", "위습_Necrobinder.webp", "위압적인투구.webp", "위풍당당_Colorless.webp", "유독가스_Silent.webp", "유독성_Colorless.webp", "유독성알.webp", "유령씨앗.webp", "유령의형상_Colorless.webp", "유령의형상_Silent.webp", "유리공예_Defect.webp", "유서깊은차세트.webp", "유서깊은차세트마이너.webp", "유성우_Colorless.webp", "유성우_Regent.webp", "유성타격_Defect.webp", "유인_Colorless.webp", "유전알고리즘_Defect.webp", "유황.webp", "융합_Defect.webp", "은하먼지.webp", "의심_Colorless.webp", "이도류_Colorless.webp", "이중시전_Defect.webp", "이중타격_Ironclad.webp", "인지편향_Colorless.webp", "인지편향_Defect.webp", "일곱개의별_Regent.webp", "일제사격_Defect.webp", "임계초과_Defect.webp", "임명_Colorless.webp", "입자벽_Regent.webp", "잉걸불차.webp", "잉크칼날_Silent.webp", "잊힌영혼.webp", "잊힌의식_Ironclad.webp", "자가형성점토.webp", "자동화_Colorless.webp", "자수정가지.webp", "작업도구_Silent.webp", "작은우편함.webp", "잔상_Silent.webp", "잔해_Colorless.webp", "장례용가면.webp", "장막관통자_Necrobinder.webp", "장송가_Necrobinder.webp", "장식용부채.webp", "장화.webp", "재난_Colorless.webp", "재성형_Regent.webp", "재앙_Colorless.webp", "재주넘기_Silent.webp", "잭팟_Colorless.webp", "잿불_Ironclad.webp", "잿빛타격_Ironclad.webp", "잿빛혼령_Necrobinder.webp", "저글링_Ironclad.webp", "저편의울음소리_Ironclad.webp", "적응형타격_Defect.webp", "전경기.webp", "전략가_Silent.webp", "전략의천재_Colorless.webp", "전문성_Silent.webp", "전장의생존자_Regent.webp", "전투의북소리_Ironclad.webp", "전투의성과_Regent.webp", "전투장비_Ironclad.webp", "전투최면_Ironclad.webp", "절대적인힘_Ironclad.webp", "점액투성이_Colorless.webp", "점화_Defect.webp", "정렬_Regent.webp", "정면돌파_Ironclad.webp", "정밀_Silent.webp", "정밀사격_Silent.webp", "정밀한베기_Silent.webp", "정복자_Regent.webp", "정신공격_Colorless.webp", "정신오염_Colorless.webp", "정신폭주_Necrobinder.webp", "정화_Necrobinder.webp", "제물_Ironclad.webp", "제압_Colorless.webp", "제압_Ironclad.webp", "제압_Silent.webp", "조각모음_Defect.webp", "조각타격_Necrobinder.webp", "조약의끝_Ironclad.webp", "종말의날_Necrobinder.webp", "종이게구리.webp", "종이핰.webp", "죄책감_Colorless.webp", "주먹다짐_Colorless.webp", "주입된핵.webp", "주판.webp", "주황색반죽.webp", "죽어가는별_Regent.webp", "죽음의무도_Necrobinder.webp", "죽음의문턱_Necrobinder.webp", "죽음의행진_Necrobinder.webp", "죽음인도자_Necrobinder.webp", "준비된가방.webp", "준비시간_Colorless.webp", "준항성_Regent.webp", "중성자방패_Regent.webp", "중절모.webp", "쥐어뜯기_Colorless.webp", "쥐어짜기_Necrobinder.webp", "증강_Defect.webp", "지면파쇄_Regent.webp", "지연_Necrobinder.webp", "지옥검_Ironclad.webp", "지옥검무_Ironclad.webp", "지옥불_Ironclad.webp", "진정한끈기_Ironclad.webp", "진정한오른팔_Necrobinder.webp", "질긴붕대.webp", "집단공격_Colorless.webp", "집중포화_Colorless.webp", "짓누르기_Colorless.webp", "짓밟기_Ironclad.webp", "징벌_Necrobinder.webp", "짜증나는퍼즐상자.webp", "짹짹이.webp", "쪼기_Colorless.webp", "찢기_Defect.webp", "차오르는독_Silent.webp", "착수_Colorless.webp", "착암기.webp", "찬란한불꽃_Colorless.webp", "찰랑이는대야.webp", "참호_Colorless.webp", "창백한푸른점_Regent.webp", "창세_Regent.webp", "창의적인인공지능_Defect.webp", "창조의기둥_Regent.webp", "책갈피.webp", "책략_Colorless.webp", "책수리용칼.webp", "척결_Necrobinder.webp", "천둥_Ironclad.webp", "천상의권능_Regent.webp", "천원돌파_Regent.webp", "철의파동_Ironclad.webp", "청동비늘.webp", "쳐내기_Regent.webp", "쳐내기용방패.webp", "초승달창_Regent.webp", "초조함_Colorless.webp", "초질량_Regent.webp", "초토화_Regent.webp", "촉진제_Silent.webp", "촛대.webp", "추앙_Regent.webp", "추적_Silent.webp", "추진타격_Defect.webp", "추출_Necrobinder.webp", "축전기_Defect.webp", "축제용폭죽.webp", "출몰_Necrobinder.webp", "출진물감.webp", "충격파_Colorless.webp", "측면공격_Silent.webp", "치사성_Necrobinder.webp", "카론의유골.webp", "카운트다운_Necrobinder.webp", "칼날부채_Silent.webp", "칼날함정_Silent.webp", "칼질_Silent.webp", "커다란모자.webp", "커다란버섯.webp", "컴파일드라이버_Defect.webp", "케미컬X.webp", "케틀벨.webp", "타격_Defect.webp", "타격_Ironclad.webp", "타격_Necrobinder.webp", "타격_Regent.webp", "타격_Silent.webp", "타격용인형.webp", "타격용인형마이너.webp", "타락_Colorless.webp", "타락_Ironclad.webp", "탄성플라스크_Silent.webp", "탈바꿈_Colorless.webp", "탈출구_Silent.webp", "탐색타격_Colorless.webp", "탐욕_Colorless.webp", "탐욕의손_Colorless.webp", "태그팀_Colorless.webp", "태양계모형.webp", "태양의타격_Regent.webp", "탱커_Ironclad.webp", "터보_Defect.webp", "텅스텐막대.webp", "테라포밍_Regent.webp", "테슬라코일_Defect.webp", "튕겨내기_Silent.webp", "튼튼한조임쇠.webp", "틀어막기_Defect.webp", "팅샤.webp", "파괴_Ironclad.webp", "파괴광선_Defect.webp", "파손된투구.webp", "파수꾼_Colorless.webp", "파수꾼_Necrobinder.webp", "파열_Ironclad.webp", "파종_Necrobinder.webp", "파지직_Defect.webp", "파충류장식.webp", "판금케이블.webp", "팔방미인_Colorless.webp", "패권_Regent.webp", "팬터그래프.webp", "펀치대거.webp", "펜듈럼.webp", "펜촉.webp", "편지칼.webp", "평형_Colorless.webp", "포격_Regent.webp", "포석_Colorless.webp", "포션벨트.webp", "포식_Ironclad.webp", "포식자_Silent.webp", "포악함_Ironclad.webp", "포자잠식_Colorless.webp", "포집_Defect.webp", "폭주_Silent.webp", "폭탄_Colorless.webp", "폭풍_Defect.webp", "폼멜타격_Ironclad.webp", "표창.webp", "풀무.webp", "풀어놓기_Necrobinder.webp", "프레넬렌즈.webp", "프레췌_Silent.webp", "피가담긴병.webp", "피가담긴병마이너.webp", "피뢰침_Defect.webp", "피의벽_Ironclad.webp", "필사의일격_Regent.webp", "필사적인도주_Colorless.webp", "필연적인결과_Regent.webp", "핏빛망토_Ironclad.webp", "하나를위한모두_Defect.webp", "하사_Regent.webp", "하수인타격_Colorless.webp", "하수인투하_Colorless.webp", "하수인희생_Colorless.webp", "하얀별.webp", "하얀짐승석상.webp", "하이파이브_Necrobinder.webp", "할퀴기_Colorless.webp", "합성_Defect.webp", "핫픽스_Defect.webp", "해골군단_Necrobinder.webp", "해방된성물함.webp", "해체_Ironclad.webp", "핸드드릴.webp", "행복한꽃.webp", "행복한꽃마이너.webp", "행운의물교기.webp", "향기로운버섯.webp", "향수_Colorless.webp", "향지.webp", "허상_Necrobinder.webp", "혈류_Ironclad.webp", "협력_Colorless.webp", "협박_Ironclad.webp", "혜성_Regent.webp", "호각불기_Colorless.webp", "호위_Necrobinder.webp", "혼돈_Defect.webp", "혼령포획_Necrobinder.webp", "홀로그램_Defect.webp", "화력증폭_Ironclad.webp", "화상_Colorless.webp", "화염장벽_Ironclad.webp", "환영검_Silent.webp", "황금도끼_Colorless.webp", "회수_Necrobinder.webp", "후벼파기_Defect.webp", "후회_Colorless.webp", "훑어보기_Colorless.webp", "휘갈김_Colorless.webp", "흉내내기_Colorless.webp", "흐릿함_Silent.webp", "흘려보내기_Ironclad.webp", "희망의등불_Colorless.webp", "희미한빛_Regent.webp", "희생_Necrobinder.webp"];
  const CDN = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';
  const CLASS_SUFFIX = {
    ironclad:'_Ironclad',
    silent:'_Silent',
    defect:'_Defect',
    necro:'_Necrobinder',
    regent:'_Regent'
  };
  const CLASS_ORDER = ['ironclad','silent','defect','necro','regent'];
  const CLASS_LABEL = {ironclad:'아이언클래드', silent:'사일런트', defect:'디펙트', necro:'네크로바인더', regent:'리젠트'};
  const CLASS_PROFILE = {
    ironclad: CDN + 'profile_Ironclad.webp',
    silent: CDN + 'profile_Silent.webp',
    defect: CDN + 'profile_Defect.webp',
    necro: CDN + 'profile_Necrobinder.webp',
    regent: CDN + 'profile_Regent.webp'
  };
  const norm = s => String(s||'').replace(/\s+/g,'').trim().toLowerCase();

  function collectMeta(){
    const m = new Map();
    try{
      if(typeof ALL==='object'){
        Object.values(ALL).forEach(group => {
          (group.cards||[]).forEach(card => { if(card && card.n) m.set(norm(card.n), card); });
        });
      }
      if(Array.isArray(COLORLESS_CARDS)) COLORLESS_CARDS.forEach(card => { if(card && card.n) m.set(norm(card.n), card); });
    }catch(e){}
    return m;
  }
  let META_MAP = collectMeta();

  function buildRepoPools(){
    META_MAP = collectMeta();
    const pools = { ironclad:[], silent:[], defect:[], necro:[], regent:[], colorless:[] };
    const byName = { ironclad:new Set(), silent:new Set(), defect:new Set(), necro:new Set(), regent:new Set(), colorless:new Set() };
    REPO_FILES.forEach(file => {
      if(!/\.webp$/i.test(file)) return;
      if(/^profile_/i.test(file)) return;
      let kind = null, rawName = null;
      if(file.endsWith('_Colorless.webp')){ kind='colorless'; rawName=file.slice(0,-('_Colorless.webp'.length)); }
      else {
        for(const [k,suf] of Object.entries(CLASS_SUFFIX)){
          const tail = suf + '.webp';
          if(file.endsWith(tail)){ kind=k; rawName=file.slice(0,-tail.length); break; }
        }
      }
      if(!kind || !rawName) return;
      const isEn = (typeof I18N !== 'undefined' && I18N.lang === 'en');
      if(isEn && (rawName === '랜턴열쇠' || rawName === '보물지도')) return;
      const key = norm(rawName);
      if(byName[kind].has(key)) return;
      byName[kind].add(key);
      const meta = META_MAP.get(key) || {};
      pools[kind].push({
        n: meta.n || rawName,
        tier: meta.tier || 'C',
        t: meta.t || '',
        g: meta.g || '',
        filename: file,
        __kind: kind,
        __norm: key
      });
    });
    return pools;
  }
  let REPO_POOLS = buildRepoPools(); window.REPO_POOLS = REPO_POOLS;

  function getAllClassCards(){
    return CLASS_ORDER.flatMap(k => REPO_POOLS[k] || []);
  }
  function getAllCardsForSearch(){
    return [...getAllClassCards(), ...(REPO_POOLS.colorless||[])];
  }
  function getScopedPool(scope){
    const current = (typeof curChar!=='undefined' && curChar) ? curChar : 'ironclad';
    if(scope==='current') return (REPO_POOLS[current]||[]).slice();
    if(scope==='colorless') return (REPO_POOLS.colorless||[]).slice();
    if(scope==='other') return CLASS_ORDER.filter(k=>k!==current).flatMap(k=>REPO_POOLS[k]||[]);
    return getAllCardsForSearch();
  }
  function getActiveBasePool(){
    const isShop = (typeof mode!=='undefined' && mode==='shop');
    if(!window.searchScope) window.searchScope = 'current';
    if(!deckAddMode && isShop && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(activeSlot)){
      window.searchScope = 'colorless';
      return (REPO_POOLS.colorless||[]).slice();
    }
    return getScopedPool(window.searchScope);
  }
  function matchInitials(name,q){
    if(!q) return true;
    name=String(name||'');
    q=String(q||'');
    return getSearchRank(name, q) > -1;
  }
  function uniqueByNorm(list){
    const seen=new Set(); const out=[];
    list.forEach(card=>{ const k=card.__norm||norm(card.n); if(seen.has(k)) return; seen.add(k); out.push(card); });
    return out;
  }
  function makeSearchImgFromFile(card){
    const img=document.createElement('img');
    img.src = CDN + card.filename;
    img.className='img-loading';
    img.onload=()=>img.classList.remove('img-loading');
    img.onerror=()=>{
      img.onerror=null;
      img.replaceWith(Object.assign(document.createElement('div'),{className:'sg-ph',textContent:card.n}));
    };
    return img;
  }
  function getScopeConfig(){
    const current = (typeof curChar!=='undefined' && curChar) ? curChar : 'ironclad';
    return [
      {key:'all', label: t('scope.all'), icon:'' , hotkey:'ALT+1'},
      {key:'current', label:tn(CLASS_LABEL[current])||t('scope.currentClass'), icon:CLASS_PROFILE[current], hotkey:'ALT+2'},
      {key:'colorless', label: t('scope.colorless'), icon:'', hotkey:'ALT+3'},
      {key:'other', label: t('scope.other'), icon:'', hotkey:'ALT+4'}
    ];
  }
  window.renderSearchScopeTabs = function(){
    const top = document.querySelector('#searchModal .modal-top');
    if(!top) return;
    let box = document.getElementById('searchScopeTabs');
    if(!box){
      box=document.createElement('div');
      box.id='searchScopeTabs';
      box.className='search-scope-tabs';
      top.appendChild(box);
    }
    const isShop = (typeof mode!=='undefined' && mode==='shop');
    const forceColorless = !deckAddMode && isShop && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(activeSlot);
    if(!window.searchScope) window.searchScope='current';
    if(forceColorless) window.searchScope='colorless';
    const cfg = getScopeConfig();
    box.innerHTML='';
    cfg.forEach(item=>{
      const btn=document.createElement('button');
      btn.className='search-scope-chip'+(window.searchScope===item.key?' on':'');
      btn.type='button';
      btn.disabled = forceColorless && item.key!=='colorless';
      btn.style.opacity = btn.disabled ? '.55' : '1';
      btn.onclick=()=>{ if(btn.disabled) return; window.searchScope=item.key; window.renderSearchGrid(); };
      if(item.icon){ const img=document.createElement('img'); img.src=item.icon; img.onerror=()=>img.remove(); btn.appendChild(img); }
      const span=document.createElement('span'); span.textContent=item.label; btn.appendChild(span);
      const keycap=document.createElement('span'); keycap.className='search-scope-keycap'; keycap.textContent=item.hotkey; btn.appendChild(keycap);
      box.appendChild(btn);
    });
  };

  window.renderSearchGrid = function(){
    const wrap=document.getElementById('searchGridWrap');
    const input=document.getElementById('modalInput');
    if(!wrap || !input) return;
    window.renderSearchScopeTabs();
    const q = input.value || '';
    let pool = getActiveBasePool();
    pool = uniqueByNorm(pool);
    if(!deckAddMode){
      const ex = Array.isArray(picks) ? picks.filter((p,j)=>p && j!==activeSlot) : [];
      pool = pool.filter(c => !ex.includes(c.n));
    }
    let list = pool
      .map(c => ({ card:c, rank:getSearchRank(c.n, q) }))
      .filter(x => x.rank > -1)
      .sort((a,b)=> (b.rank - a.rank) || (a.card.n.length - b.card.n.length) || a.card.n.localeCompare(b.card.n,'ko'))
      .map(x => x.card);
    searchResultList = list.slice();
    window.searchResultList = searchResultList;
    searchResultAction = [];
    if(!list.length){ wrap.innerHTML=`<div class="search-empty">${t('common.noResult')}</div>`; return; }
    let prog='';
    if(!deckAddMode && typeof getNeedCount==='function'){
      const need=getNeedCount();
      prog='<div class="slot-progress">'+Array.from({length:need},(_,i)=>`<span class="slot-dot ${i===activeSlot?'on':''} ${(typeof mode!=='undefined'&&mode==='shop'&&typeof isShopColorlessSlot==='function'&&isShopColorlessSlot(i))?'colorless':''}"></span>`).join('')+`<span class="slot-text">${typeof getSlotLabel==='function'?getSlotLabel(activeSlot):t('search.title')}</span></div>`;
      if(typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function'){
        prog += `<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.colorlessOnly'):t('search.shopClassOnly')}</div>`;
      }
    }
    const grid=document.createElement('div'); grid.className='search-grid';
    list.forEach((card,idx)=>{
      const el=document.createElement('div'); el.className='sg-card';
      const choose=()=>{
        if(deckAddMode){
          if(typeof pushDeckCard==='function') pushDeckCard(card.n); else if(Array.isArray(deck)) deck.push(card.n);
          if(typeof closeSearch==='function') closeSearch();
          if(typeof renderAll==='function') renderAll();
          return;
        }
        if(Array.isArray(picks)) picks[activeSlot]=card.n;
        const need=(typeof getNeedCount==='function')?getNeedCount():0;
        const next=Array.from({length:need},(_,i)=>i).find(i=>!picks[i]);
        if(next!==undefined){
          activeSlot=next;
          document.getElementById('modalTitle').textContent=t('search.slotLabel',{label:(typeof getSlotLabel==='function'?getSlotLabel(next):t('search.fallbackLabel'))});
          input.value='';
          if(typeof renderRewardRow==='function') renderRewardRow();
          window.renderSearchGrid();
          if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus();
        } else {
          if(typeof closeSearch==='function') closeSearch();
          if(typeof renderAll==='function') renderAll('to-result');
        }
      };
      searchResultAction[idx]=choose;
      el.onclick=choose;
      el.appendChild(makeSearchImgFromFile(card));
      if(window.innerWidth>768 && q.trim().length>0 && idx<9){ const kc=document.createElement('span'); kc.className='search-keycap'; kc.textContent=String(idx+1); el.appendChild(kc); }
      el.insertAdjacentHTML('beforeend', `<div class="sg-name">${tn(card.n)}</div><span class="sg-tier tier-${card.tier||'C'}">${card.tier||'C'}</span>`);
      grid.appendChild(el);
    });
    wrap.innerHTML=prog; wrap.appendChild(grid);
  };

  function resetScopeForContext(){
    const isShop = (typeof mode!=='undefined' && mode==='shop');
    if(deckAddMode){ window.searchScope='all'; return; }
    if(isShop && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(activeSlot)){ window.searchScope='colorless'; return; }
    window.searchScope='current';
  }
  const _openSearch = window.openSearch || (typeof openSearch==='function'?openSearch:null);
  window.openSearch = function(i){ activeSlot=i; deckAddMode=false; resetScopeForContext(); document.getElementById('modalTitle').textContent=t('search.slotLabel',{label:(typeof getSlotLabel==='function'?getSlotLabel(i):t('search.fallbackLabel'))}); document.getElementById('modalInput').value=''; document.getElementById('searchModal').classList.add('open'); if(typeof updateBodyLock==='function') updateBodyLock(); window.renderSearchGrid(); if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus(); };
  const _openDeckAdd = window.openDeckAdd || (typeof openDeckAdd==='function'?openDeckAdd:null);
  window.openDeckAdd = function(){ deckAddMode=true; activeSlot=-1; window.searchScope='all'; document.getElementById('modalTitle').textContent=t('search.addToDeck'); document.getElementById('modalInput').value=''; document.getElementById('searchModal').classList.add('open'); if(typeof updateBodyLock==='function') updateBodyLock(); window.renderSearchGrid(); if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus(); };

})();
/* === script: reward-shop-colorless-filter-fix === */
(function(){
  const BLOCKED_COLORLESS_IN_REWARD_SHOP = new Set([
    '감염','공허','그을음','나태','부상','분해','쇠퇴','어지러움','정신오염','화상','유독성','유인','잔해','점액투성이','필사적인도주',
    '규칙준수','등반가의골칫거리','몸부림','방울의저주','부패','불운','빚','상처','서투름','수면부족','수치','어리석음','의심','죄책감','탐욕','후회','포자잠식','매료됨'
  ]);
  function getFilteredScopedPool(scope){
    const current = (typeof curChar!=='undefined' && curChar) ? curChar : 'ironclad';
    const allClass = (typeof getAllClassCards==='function') ? getAllClassCards() : [];
    const allColorless = (REPO_POOLS && REPO_POOLS.colorless) ? REPO_POOLS.colorless.slice() : [];
    const inRewardOrShop = !deckAddMode && (typeof mode!=='undefined') && (mode==='reward' || mode==='shop');
    const allowedColorless = inRewardOrShop ? allColorless.filter(c => !BLOCKED_COLORLESS_IN_REWARD_SHOP.has(c.n)) : allColorless;
    if(scope==='current') return (REPO_POOLS && REPO_POOLS[current] ? REPO_POOLS[current].slice() : []);
    if(scope==='colorless') return allowedColorless.slice();
    if(scope==='other') return (typeof CLASS_ORDER!=='undefined' ? CLASS_ORDER.filter(k=>k!==current).flatMap(k=>(REPO_POOLS&&REPO_POOLS[k])?REPO_POOLS[k]:[]) : []);
    return [...allClass, ...allowedColorless];
  }
  getScopedPool = getFilteredScopedPool;
  getActiveBasePool = function(){
    const isShop = (typeof mode!=='undefined' && mode==='shop');
    if(!window.searchScope) window.searchScope = 'current';
    if(!deckAddMode && isShop && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(activeSlot)){
      window.searchScope = 'colorless';
      return getFilteredScopedPool('colorless');
    }
    return getFilteredScopedPool(window.searchScope);
  };
  const _resetScopeForContext = (typeof resetScopeForContext==='function') ? resetScopeForContext : null;
  resetScopeForContext = function(){
    const isShop = (typeof mode!=='undefined' && mode==='shop');
    if(deckAddMode){ window.searchScope='all'; return; }
    if(isShop && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(activeSlot)){ window.searchScope='colorless'; return; }
    window.searchScope='current';
  };
  const _renderSearchGrid = window.renderSearchGrid;
  window.renderSearchGrid = function(){
    if(typeof _renderSearchGrid==='function') return _renderSearchGrid();
  };
})();
/* === script === */
(function(){
  const CDN = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';
  const PURCHASABLE_COLORLESS = new Set([
    '강철의섬광','극적인입장','난사','만물절단','고동치는도끼','궁극의타격','정신공격','주먹다짐','탐색타격',
    '능숙','미래예지','비상단추','생산','성급함','순수','어둠의족쇄','연장','초조함','팔방미인','궁극의수비','발견','착수','재난','충격파','평형','폭탄',
    '위풍당당','고정시키기','기량','자동화','준비시간','책략',
    '사냥돌','집중포화','황금도끼','쥐어뜯기','탐욕의손','잭팟',
    '비밀기술','비밀병기','전략의천재','포석','숨겨진보석','연금','임명','휘갈김','두들겨패기',
    '엔트로피','향수','대혼란','굴러가는바위','영원의갑옷','재앙'
  ].map(v=>String(v).replace(/\s+/g,'')));

  function isPurchasableColorlessCard(card){
    if(!card) return false;
    const key = String(card.n||'').replace(/\s+/g,'');
    return PURCHASABLE_COLORLESS.has(key);
  }
  function shouldIncludeInCurrentContext(card){
    if(typeof deckAddMode !== 'undefined' && deckAddMode) return true;
    const inRewardOrShop = (typeof mode !== 'undefined') && (mode === 'reward' || mode === 'shop');
    if(!inRewardOrShop) return true;
    if(!card) return false;
    const kind = String(card.__kind || '').toLowerCase();
    const owner = String(card.owner || card.__owner || '').toLowerCase();
    const filename = String(card.filename || '');
    const isClassCard = ['ironclad','silent','defect','necro','necrobinder','regent'].includes(kind) || ['ironclad','silent','defect','necro','necrobinder','regent'].includes(owner) || /_(Ironclad|Silent|Defect|Necrobinder|Regent)\.webp$/i.test(filename);
    if(isClassCard) return true;
    return isPurchasableColorlessCard(card);
  }
  function makeImg(card){
    const img=document.createElement('img');
    img.src = CDN + (card.filename || encodeURIComponent(String(card.n||'').replace(/\s+/g,'')) + '.webp');
    img.className='img-loading';
    img.onload=()=>img.classList.remove('img-loading');
    img.onerror=()=>{ img.onerror=null; img.replaceWith(Object.assign(document.createElement('div'),{className:'sg-ph',textContent:card.n||''})); };
    return img;
  }
  function matchInitials(name,q){
    if(!q) return true;
    return getSearchRank(String(name||''), String(q||'')) > -1;
  }

  const oldRender = window.renderSearchGrid;
  const oldOpenDeckAdd = window.openDeckAdd;
  const oldOpenSearch = window.openSearch;
  const oldRenderTabs = window.renderSearchScopeTabs;

  function rebuildFromFiltered(list){
    const wrap=document.getElementById('searchGridWrap');
    const input=document.getElementById('modalInput');
    if(!wrap || !input) return;
    if(typeof oldRenderTabs === 'function') oldRenderTabs();
    window.searchResultList = list.slice();
    if(typeof searchResultList !== 'undefined') searchResultList = list.slice();
    window.searchResultAction = [];
    if(typeof searchResultAction !== 'undefined') searchResultAction = [];

    let prog='';
    if(typeof deckAddMode !== 'undefined' && !deckAddMode && typeof getNeedCount==='function'){
      const need=getNeedCount();
      prog='<div class="slot-progress">'+Array.from({length:need},(_,i)=>`<span class="slot-dot ${i===activeSlot?'on':''} ${(typeof mode!=='undefined'&&mode==='shop'&&typeof isShopColorlessSlot==='function'&&isShopColorlessSlot(i))?'colorless':''}"></span>`).join('')+`<span class="slot-text">${typeof getSlotLabel==='function'?getSlotLabel(activeSlot):t('search.title')}</span></div>`;
      if(typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function'){
        prog += `<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.shopColorlessOnly'):t('search.shopClassOnly')}</div>`;
      }
    }

    if(!list.length){ wrap.innerHTML = prog + `<div class="search-empty">${t('common.noResult')}</div>`; return; }
    const grid=document.createElement('div'); grid.className='search-grid';
    list.forEach((card,idx)=>{
      const el=document.createElement('div'); el.className='sg-card';
      const choose=()=>{
        if(deckAddMode){
          if(typeof pushDeckCard==='function') pushDeckCard(card.n); else if(Array.isArray(deck)) deck.push(card.n);
          if(typeof closeSearch==='function') closeSearch();
          if(typeof renderAll==='function') renderAll();
          return;
        }
        if(Array.isArray(picks)) picks[activeSlot]=card.n;
        const need=(typeof getNeedCount==='function')?getNeedCount():0;
        const next=Array.from({length:need},(_,i)=>i).find(i=>!picks[i]);
        if(next!==undefined){
          activeSlot=next;
          document.getElementById('modalTitle').textContent=t('search.slotLabel',{label:(typeof getSlotLabel==='function'?getSlotLabel(next):t('search.fallbackLabel'))});
          input.value='';
          if(typeof renderRewardRow==='function') renderRewardRow();
          window.renderSearchGrid();
          if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus();
        } else {
          if(typeof closeSearch==='function') closeSearch();
          if(typeof renderAll==='function') renderAll('to-result');
        }
      };
      if(typeof searchResultAction !== 'undefined') searchResultAction[idx]=choose;
      window.searchResultAction[idx]=choose;
      el.onclick=choose;
      el.appendChild(makeImg(card));
      if(window.innerWidth>768 && String(input.value||'').trim().length>0 && idx<9){ const kc=document.createElement('span'); kc.className='search-keycap'; kc.textContent=String(idx+1); el.appendChild(kc); }
      el.insertAdjacentHTML('beforeend', `<div class="sg-name">${tn(card.n)}</div><span class="sg-tier tier-${card.tier||'C'}">${card.tier||'C'}</span>`);
      grid.appendChild(el);
    });
    wrap.innerHTML=prog; wrap.appendChild(grid);
  }

  window.renderSearchGrid = function(){
    if(typeof oldRender === 'function') oldRender();
    const list = Array.isArray(window.searchResultList) ? window.searchResultList.slice() : [];
    const input=document.getElementById('modalInput');
    let filtered = list.filter(shouldIncludeInCurrentContext);
    if(input){
      const q=input.value||'';
      filtered = filtered
        .map(c=>({card:c, rank:getSearchRank(c.n, q)}))
        .filter(x=>x.rank > -1)
        .sort((a,b)=> (b.rank - a.rank) || (a.card.n.length - b.card.n.length) || a.card.n.localeCompare(b.card.n,'ko'))
        .map(x=>x.card);
    }
    rebuildFromFiltered(filtered);
  };

  window.openDeckAdd = function(){
    if(typeof oldOpenDeckAdd === 'function') oldOpenDeckAdd();
    window.searchScope='all';
    const t=document.getElementById('modalTitle'); if(t) t.textContent=t('search.addToDeck');
    window.renderSearchGrid();
    if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus();
  };

  window.openSearch = function(i){
    if(typeof oldOpenSearch === 'function') oldOpenSearch(i);
    window.renderSearchGrid();
    if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus();
  };
})();
/* === script: initial-hotkey-focus-fix === */
(function(){
  function shouldStealFocus(){
    const ae = document.activeElement;
    if(!ae) return true;
    const tag = (ae.tagName||'').toUpperCase();
    if(tag==='INPUT' || tag==='TEXTAREA' || tag==='SELECT') return false;
    if(ae.isContentEditable) return false;
    return true;
  }
  function ensureHotkeyFocus(){
    try{ window.focus(); }catch(e){}
    if(!shouldStealFocus()) return;
    try{
      if(!document.body.hasAttribute('tabindex')) document.body.setAttribute('tabindex','-1');
      document.body.focus({preventScroll:true});
    }catch(e){}
    try{
      const live = document.getElementById('liveTab');
      if(live){
        if(!live.hasAttribute('tabindex')) live.setAttribute('tabindex','-1');
        live.focus({preventScroll:true});
      }
    }catch(e){}
  }
  window.addEventListener('load', function(){
    ensureHotkeyFocus();
    setTimeout(ensureHotkeyFocus, 30);
    setTimeout(ensureHotkeyFocus, 180);
    setTimeout(ensureHotkeyFocus, 500);
  });
  window.addEventListener('pageshow', function(){
    ensureHotkeyFocus();
    setTimeout(ensureHotkeyFocus, 50);
  });
})();
/* === script: search-logic-hotfix-20260411 === */
(function(){
  const SPACELESS = s => String(s||'').replace(/\s+/g,'').trim();
  const LOWER = s => SPACELESS(s).toLowerCase();

  function decomposeCompat(s){
    const map = {'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
    return Array.from(String(s||'')).map(ch => map[ch] || ch).join('');
  }
  function getInitialsLoose(name){
    return decomposeCompat(Array.from(String(name||'')).map(ch => {
      const code = ch.charCodeAt(0) - 44032;
      if(code < 0 || code > 11171) return ch.toLowerCase();
      return 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[Math.floor(code/588)] || ch;
    }).join('')).replace(/\s/g,'');
  }
  function matchesLoose(name, q){
    const qq = LOWER(q);
    if(!qq) return true;
    const nn = LOWER(name);
    if(nn.includes(qq)) return true;

    const dq = decomposeCompat(qq);
    if(decomposeCompat(nn).includes(dq)) return true;

    const initials = getInitialsLoose(name);
    if(initials.includes(dq)) return true;

    return false;
  }

  // earlier search logic override
  window.getSearchRank = getSearchRank = function(name, q){
    const qq = LOWER(q);
    if(!qq) return 0;

    // English mode: match against English translated name only (no Korean consonant matching)
    if(window.I18N && window.I18N.lang === 'en' && typeof tn === 'function'){
      var en = tn(name);
      var target = LOWER(en || name);
      var enIdx = target.indexOf(qq);
      if(enIdx === 0) return 1000 - qq.length;
      if(enIdx > 0) return 700 - enIdx;
      return -1;
    }

    const nn = LOWER(name);
    const idx = nn.indexOf(qq);
    if(idx === 0) return 1000 - qq.length;
    if(idx > 0) return 700 - idx;

    const dq = decomposeCompat(qq);
    const dn = decomposeCompat(nn);
    const dIdx = dn.indexOf(dq);
    if(dIdx === 0) return 980 - dq.length;
    if(dIdx > 0) return 680 - dIdx;

    const initials = getInitialsLoose(name);
    const iIdx = initials.indexOf(dq);
    if(iIdx === 0) return 950 - dq.length;
    if(iIdx > 0) return 650 - iIdx;

    return -1;
  };
  window.matchSearch = matchSearch = function(name, q){ return window.getSearchRank(name, q) > -1; };

  // final rebuilt search override
  if(typeof window.renderSearchGrid === 'function'){
    const oldRenderSearchGrid = window.renderSearchGrid;
    window.renderSearchGrid = function(){
      try{
        const input = document.getElementById('modalInput');
        const wrap = document.getElementById('searchGridWrap');
        if(!input || !wrap) return oldRenderSearchGrid.apply(this, arguments);

        const q = input.value || '';

        // Always rebuild from the full list for the current context first.
        // This avoids query-on-query narrowing where long 초성 like ㅂㄱㄱㅊ / ㅌㅅㄹㅋㅇ
        // can disappear because an earlier filtered list gets reused.
        input.value = '';
        const result = oldRenderSearchGrid.apply(this, arguments);

        const fullList = Array.isArray(window.searchResultList) ? window.searchResultList.slice() : [];
        const fullActions = Array.isArray(window.searchResultAction) ? window.searchResultAction.slice() : [];
        input.value = q;

        if(!q){
          return result;
        }

        const ranked = fullList
          .map((card, idx) => ({ card, idx, rank: window.getSearchRank(card && card.n, q) }))
          .filter(x => x.rank > -1)
          .sort((a,b) => (b.rank - a.rank) || (String(a.card.n||'').length - String(b.card.n||'').length) || String(a.card.n||'').localeCompare(String(b.card.n||''), 'ko'));

        const filtered = ranked.map(x => x.card);
        const filteredActions = ranked.map(x => fullActions[x.idx]);

        window.searchResultList = filtered.slice();
        if(typeof searchResultList !== 'undefined') searchResultList = filtered.slice();
        window.searchResultAction = filteredActions.slice();
        if(typeof searchResultAction !== 'undefined') searchResultAction = filteredActions.slice();

        const prog = wrap.querySelector('.slot-progress') ? wrap.querySelector('.slot-progress').outerHTML + (wrap.querySelector('.slot-hint') ? wrap.querySelector('.slot-hint').outerHTML : '') : '';
        wrap.innerHTML = prog;

        if(!filtered.length){
          wrap.innerHTML = prog + `<div class="search-empty">${t('common.noResult')}</div>`;
          return result;
        }

        const grid = document.createElement('div');
        grid.className = 'search-grid';
        filtered.forEach((card, idx) => {
          const el = document.createElement('div');
          el.className = 'sg-card';

          const choose = filteredActions[idx];
          if(typeof choose === 'function') el.onclick = choose;

          const img = document.createElement('img');
          img.src = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/' + (card.filename || (encodeURIComponent(SPACELESS(card.n)) + '.webp'));
          img.className = 'img-loading';
          img.onload = () => img.classList.remove('img-loading');
          img.onerror = () => {
            img.onerror = null;
            img.replaceWith(Object.assign(document.createElement('div'), {className:'sg-ph', textContent:card.n || ''}));
          };
          el.appendChild(img);

          if(window.innerWidth > 768 && String(q).trim().length > 0 && idx < 9){
            const kc = document.createElement('span');
            kc.className = 'search-keycap';
            kc.textContent = String(idx + 1);
            el.appendChild(kc);
          }

          el.insertAdjacentHTML('beforeend', `<div class="sg-name">${tn(card.n)}</div><span class="sg-tier tier-${card.tier||'C'}">${card.tier||'C'}</span>`);
          grid.appendChild(el);
        });
        wrap.appendChild(grid);
        return result;
      }catch(e){
        return oldRenderSearchGrid.apply(this, arguments);
      }
    };
  }

  // recommendation guard: 때가 되었다 should not be pushed without doom package
  if(typeof scoreCard === 'function'){
    const oldScoreCard = scoreCard;
    const norm = s => SPACELESS(s);
    const doomSetupCards = ['역병 타격','비관적인 맥박','도망칠 수 없다','종말의 날','카운트다운','죽음 인도자','망각','사신의 형상'];
    const doomCard = '때가 되었다';
    window.scoreCard = scoreCard = function(name){
      const out = oldScoreCard.apply(this, arguments);
      try{
        if((typeof curChar !== 'undefined' && curChar === 'necro') && norm(name) === norm(doomCard)){
          const doomPieces = Array.isArray(deck) ? deck.filter(x => doomSetupCards.some(d => norm(d) === norm(x))) : [];
          const hasDoomSetup = doomPieces.length > 0;
          if(!hasDoomSetup){
            const next = Object.assign({}, out);
            next.score = Math.min(next.score || 0, -8);
            next.warn = true;
            next.summary = '종말 파츠가 없으면 효율이 낮습니다';
            next.reasons = [...(next.reasons || []), '직접 종말을 쌓는 카드가 아직 없습니다'];
            next.chips = [...(next.chips || []), ['bad','선행 파츠 부족']];
            return next;
          }
        }
      }catch(e){}
      return out;
    };
  }
})();
/* === script: search-ui-restore-and-pick-guard === */
(function(){
  const oldRender = window.renderSearchGrid;
  const oldOpenSearch = window.openSearch;
  const oldOpenDeckAdd = window.openDeckAdd;
  let pickBusy = false;

  function buildProgressHtml(){
    if(typeof deckAddMode !== 'undefined' && deckAddMode) return '';
    if(typeof getNeedCount !== 'function') return '';
    const need = getNeedCount();
    if(!need) return '';
    let prog = '<div class="slot-progress">' + Array.from({length:need}, (_,i)=>{
      const colorless = (typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(i)) ? ' colorless' : '';
      const on = i===activeSlot ? ' on' : '';
      return `<span class="slot-dot${on}${colorless}"></span>`;
    }).join('') + `<span class="slot-text">${(typeof getSlotLabel==='function' ? getSlotLabel(activeSlot) : t('search.title')).replace(/"/g,'&quot;')} ${t('slot.selecting')}</span></div>`;
    if(typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function'){
      prog += `<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.shopColorlessOnly'):t('search.classOnly')}</div>`;
    }
    return prog;
  }

  function ensureChrome(){
    if(typeof window.renderSearchScopeTabs === 'function') window.renderSearchScopeTabs();
    const wrap = document.getElementById('searchGridWrap');
    if(!wrap) return;
    if(typeof deckAddMode !== 'undefined' && !deckAddMode && !wrap.querySelector('.slot-progress')){
      const first = wrap.firstChild;
      const holder = document.createElement('div');
      holder.innerHTML = buildProgressHtml();
      while(holder.firstChild){ wrap.insertBefore(holder.firstChild, first); }
    }
  }

  function guarded(fn){
    if(typeof fn !== 'function') return fn;
    if(fn.__pickGuardWrapped) return fn;
    const wrapped = function(){
      if(pickBusy) return;
      pickBusy = true;
      try { return fn.apply(this, arguments); }
      finally { setTimeout(()=>{ pickBusy = false; }, 0); }
    };
    wrapped.__pickGuardWrapped = true;
    return wrapped;
  }

  function wrapPickActions(){
    if(Array.isArray(window.searchResultAction)){
      window.searchResultAction = window.searchResultAction.map(guarded);
      if(typeof searchResultAction !== 'undefined') searchResultAction = window.searchResultAction;
    }
    document.querySelectorAll('#searchGridWrap .sg-card').forEach((el, idx)=>{
      const fn = Array.isArray(window.searchResultAction) ? window.searchResultAction[idx] : null;
      if(fn) el.onclick = fn;
    });
  }

  window.renderSearchGrid = function(){
    if(typeof oldRender === 'function') oldRender.apply(this, arguments);
    ensureChrome();
    wrapPickActions();
  };

  window.openSearch = function(){
    if(typeof oldOpenSearch === 'function') oldOpenSearch.apply(this, arguments);
    ensureChrome();
    wrapPickActions();
  };

  window.openDeckAdd = function(){
    if(typeof oldOpenDeckAdd === 'function') oldOpenDeckAdd.apply(this, arguments);
    ensureChrome();
    wrapPickActions();
  };
})();
/* === script: search-flow-stable-v4-20260414 === */
(function(){
  const modalId='searchModal', titleId='modalTitle', inputId='modalInput', wrapId='searchGridWrap';
  const CDN='https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';
  const CLASS_LABELS={ironclad:'아이언클래드',silent:'사일런트',defect:'디펙트',necro:'네크로바인더',regent:'리젠트'};
  const CLASS_ICONS={ironclad:CDN+'profile_Ironclad.webp',silent:CDN+'profile_Silent.webp',defect:CDN+'profile_Defect.webp',necro:CDN+'profile_Necrobinder.webp',regent:CDN+'profile_Regent.webp'};
  const OWNER_SUFFIX={necro:'Necrobinder',regent:'Regent',ironclad:'Ironclad',silent:'Silent',defect:'Defect'};
  function norm(v){return String(v||'').replace(/\s+/g,'').replace(/[!'?.,:+\-]/g,'').trim().toLowerCase();}
  const STATUS_CURSE_NORMS=new Set(['감염','공허','그을음','나태','부상','상처','쇠퇴','수면부족','어지러움','의심','점액투성이','죄책감','후회','화상','부패','빚','불운','수치','재난','재앙','초조함','향수','정신오염','탐욕'].map(norm));
  function getCurChar(){return (typeof curChar!=='undefined' && curChar) ? curChar : 'ironclad';}
  function getClassOrder(){return (typeof CLASS_ORDER!=='undefined' && Array.isArray(CLASS_ORDER) && CLASS_ORDER.length) ? CLASS_ORDER.slice() : ['ironclad','silent','defect','necro','regent'];}
  function ownerOf(card){return String(card && (card.__owner || card.owner || card.__kind || '') || '').toLowerCase();}
  function fileOf(card){return String(card && (card.filename || '') || '');}
  function displayName(card){return String(card && (card.n || card.name || '') || '');}
  function rarityOf(card){return String(card && (card.r || card.rarity || '') || '');}
  function typeOf(card){return String(card && (card.t || card.type || '') || '');}
  function cloneCard(card){return Object.assign({}, card, {__displayName:displayName(card), __ownerResolved:ownerOf(card), __fileResolved:fileOf(card)});}
  function sourceLabel(card){const owner=ownerOf(card); return owner==='colorless' ? t('scope.colorless') : (tn(CLASS_LABELS[owner]) || '');}
  function isStatusOrCurse(card){
    try{ if(typeof window.isStatusOrCurseCard==='function' && window.isStatusOrCurseCard(card)) return true; }catch(e){}
    const n=norm(displayName(card)), f=norm(fileOf(card));
    return rarityOf(card)==='상태' || rarityOf(card)==='저주' || typeOf(card)==='상태' || typeOf(card)==='저주' || STATUS_CURSE_NORMS.has(n) || (f.endsWith('_colorless.webp') && STATUS_CURSE_NORMS.has(norm(f.replace('_colorless.webp',''))));
  }
  function isPurchasableColorless(card){
    if(ownerOf(card)!=='colorless') return false;
    if(isStatusOrCurse(card)) return false;
    if(typeof isPurchasableColorlessCard==='function') return !!isPurchasableColorlessCard(card);
    return true;
  }
  function buildPool(scope){
    const current=getCurChar();
    const order=getClassOrder();
    if(typeof REPO_POOLS!=='undefined' && REPO_POOLS){
      if(scope==='current') return (REPO_POOLS[current]||[]).map(cloneCard);
      if(scope==='colorless') return (REPO_POOLS.colorless||[]).map(cloneCard);
      if(scope==='other') return order.filter(k=>k!==current).flatMap(k=>(REPO_POOLS[k]||[]).map(cloneCard));
      return order.flatMap(k=>(REPO_POOLS[k]||[]).map(cloneCard)).concat((REPO_POOLS.colorless||[]).map(cloneCard));
    }
    const fromAll=(key)=>((typeof ALL!=='undefined' && ALL && ALL[key] && Array.isArray(ALL[key].cards)) ? ALL[key].cards : []).map(c=>cloneCard(Object.assign({__owner:key}, c)));
    const colorless=((typeof COLORLESS_CARDS!=='undefined' && Array.isArray(COLORLESS_CARDS)) ? COLORLESS_CARDS : []).map(c=>cloneCard(Object.assign({__owner:'colorless'}, c)));
    if(scope==='current') return fromAll(current);
    if(scope==='colorless') return colorless;
    if(scope==='other') return order.filter(k=>k!==current).flatMap(fromAll);
    return order.flatMap(fromAll).concat(colorless);
  }
  function dedupeByName(cards, scope){
    const current=getCurChar();
    const best=new Map();
    function score(card){
      const owner=ownerOf(card);
      let s=fileOf(card)?20:0;
      if(scope==='current' && owner===current) s+=50;
      if(scope==='colorless' && owner==='colorless') s+=50;
      if(scope==='other' && owner!==current && owner!=='colorless') s+=50;
      if(scope==='all') s += owner===current ? 40 : owner==='colorless' ? 30 : 20;
      if(rarityOf(card)==='시작') s-=5;
      return s;
    }
    for(const card of cards){
      const key=norm(displayName(card));
      const prev=best.get(key);
      if(!prev || score(card)>score(prev)) best.set(key, card);
    }
    return Array.from(best.values());
  }
  const SearchFlow={
    state:{flow:'reward',slotIndex:-1,scope:'current'},
    isDeckAdd(){ return this.state.flow==='deckAdd'; },
    isShop(){ return !this.isDeckAdd() && typeof mode!=='undefined' && mode==='shop'; },
    isColorlessOnlySlot(slotIndex=this.state.slotIndex){ return this.isShop() && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(slotIndex); },
    syncGlobals(){ try{ window.activeSlot=this.state.slotIndex; activeSlot=this.state.slotIndex; }catch(e){} try{ window.deckAddMode=this.isDeckAdd(); deckAddMode=this.isDeckAdd(); }catch(e){} window.searchScope=this.state.scope; },
    defaultScope(){ if(this.isDeckAdd()) return 'all'; if(this.isColorlessOnlySlot()) return 'colorless'; return 'current'; },
    openReward(slotIndex){ this.state.flow='reward'; this.state.slotIndex=Number(slotIndex); this.state.scope=this.defaultScope(); this.openModal(t('search.slotLabel',{label:((typeof getSlotLabel==='function')?getSlotLabel(this.state.slotIndex):t('search.fallbackLabel'))})); },
    openDeckAdd(){ this.state.flow='deckAdd'; this.state.slotIndex=-1; this.state.scope='all'; this.openModal(t('search.addToDeck')); },
    close(){ const modal=document.getElementById(modalId); if(modal) modal.classList.remove('open'); this.state.flow='reward'; this.state.slotIndex=-1; this.state.scope='current'; this.syncGlobals(); if(typeof updateBodyLock==='function') updateBodyLock(); },
    openModal(title){ const modal=document.getElementById(modalId), titleEl=document.getElementById(titleId), input=document.getElementById(inputId); if(titleEl) titleEl.textContent=title; if(input) input.value=''; if(modal) modal.classList.add('open'); this.syncGlobals(); if(typeof updateBodyLock==='function') updateBodyLock(); this.bindInput(); this.renderScopeTabs(); this.render(); if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus(); },
    scopeItems(){ const current=getCurChar(); return [{key:'all',label: t('scope.all'),icon:'',hotkey:'ALT+1'},{key:'current',label: tn(CLASS_LABELS[current])||t('scope.currentClass'),icon:CLASS_ICONS[current]||'',hotkey:'ALT+2'},{key:'colorless',label: t('scope.colorless'),icon:'',hotkey:'ALT+3'},{key:'other',label: t('scope.other'),icon:'',hotkey:'ALT+4'}]; },
    allowedPool(){
      if(this.isColorlessOnlySlot()) this.state.scope='colorless';
      let pool=buildPool(this.state.scope).filter(card=>!!displayName(card));
      pool=pool.filter(card=>{
        if(this.isDeckAdd()) return true;
        if(isStatusOrCurse(card)) return false;
        if(this.isColorlessOnlySlot()) return isPurchasableColorless(card);
        return true;
      });
      return dedupeByName(pool, this.state.scope);
    },
    filteredList(){
      const input=document.getElementById(inputId);
      const q=String(input && input.value || '');
      const excluded=new Set();
      if(!this.isDeckAdd()){
        const arr=Array.isArray(window.picks)?window.picks:((typeof picks!=='undefined' && Array.isArray(picks))?picks:[]);
        arr.forEach((name, idx)=>{ if(name && idx!==this.state.slotIndex) excluded.add(norm(name)); });
      }
      return this.allowedPool()
        .filter(card=>!excluded.has(norm(displayName(card))))
        .map(card=>({card, rank: (typeof getSearchRank==='function' ? getSearchRank(displayName(card), q) : (q ? (norm(displayName(card)).includes(norm(q)) ? 1 : -1) : 0))}))
        .filter(x=>x.rank>-1)
        .sort((a,b)=>(b.rank-a.rank)||((displayName(a.card)||'').length-(displayName(b.card)||'').length)||String(displayName(a.card)||'').localeCompare(String(displayName(b.card)||''),'ko'))
        .map(x=>x.card);
    },
    progressHtml(){
      if(this.isDeckAdd() || typeof getNeedCount!=='function') return '';
      const need=getNeedCount();
      if(!need) return '';
      let html='<div class="slot-progress">'+Array.from({length:need},(_,i)=>`<span class="slot-dot${i===this.state.slotIndex?' on':''}${(this.isShop()&&typeof isShopColorlessSlot==='function'&&isShopColorlessSlot(i))?' colorless':''}"></span>`).join('')+`<span class="slot-text">${(typeof getSlotLabel==='function'?getSlotLabel(this.state.slotIndex):t('search.title'))} ${t('slot.selecting')}</span></div>`;
      if(this.isShop()) html += `<div class="slot-hint">${this.isColorlessOnlySlot() ? t('search.shopColorlessOnly') : t('search.classOnly')}</div>`;
      return html;
    },
    makeCardImage(card){
      const img=document.createElement('img');
      img.loading='lazy'; img.decoding='async'; img.className='img-loading';
      const exact=fileOf(card);
      const owner=ownerOf(card);
      const suffix=owner==='colorless' ? '_Colorless' : (OWNER_SUFFIX[owner] ? '_' + OWNER_SUFFIX[owner] : '');
      const base=String(displayName(card)||'').replace(/\s+/g,'');
      const candidates=[];
      if(exact) candidates.push(CDN + exact);
      if(base) candidates.push(CDN + base + suffix + '.webp');
      if(base) candidates.push(CDN + encodeURIComponent(base) + '.webp');
      let idx=0;
      img.onload=()=>img.classList.remove('img-loading');
      img.onerror=()=>{ idx+=1; if(idx < candidates.length){ img.src=candidates[idx]; return; } const ph=document.createElement('div'); ph.className='sg-ph'; ph.textContent=displayName(card)||''; img.replaceWith(ph); };
      img.src=candidates[idx] || '';
      return img;
    },
    renderScopeTabs(){
      const top=document.querySelector('#'+modalId+' .modal-top');
      if(!top) return;
      let box=document.getElementById('searchScopeTabs');
      if(!box){ box=document.createElement('div'); box.id='searchScopeTabs'; box.className='search-scope-tabs'; top.appendChild(box); }
      box.innerHTML='';
      const forceColorless=this.isColorlessOnlySlot();
      if(forceColorless) this.state.scope='colorless';
      this.scopeItems().forEach(item=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='search-scope-chip'+(this.state.scope===item.key?' on':'');
        btn.disabled=forceColorless && item.key!=='colorless';
        btn.style.opacity=btn.disabled ? '.55' : '1';
        btn.onclick=()=>{ if(btn.disabled) return; this.state.scope=item.key; this.syncGlobals(); this.render(); };
        if(item.icon){ const icon=document.createElement('img'); icon.src=item.icon; icon.onerror=()=>icon.remove(); btn.appendChild(icon); }
        const label=document.createElement('span'); label.textContent=item.label; btn.appendChild(label);
        const keycap=document.createElement('span'); keycap.className='search-scope-keycap'; keycap.textContent=item.hotkey; btn.appendChild(keycap);
        box.appendChild(btn);
      });
    },
    render(){
      const wrap=document.getElementById(wrapId);
      if(!wrap) return;
      this.syncGlobals();
      this.renderScopeTabs();
      const list=this.filteredList();
      window.searchResultList=list.slice(); try{ searchResultList=list.slice(); }catch(e){}
      window.searchResultAction=[]; try{ searchResultAction=[]; }catch(e){}
      wrap.innerHTML=this.progressHtml();
      if(!list.length){ wrap.innerHTML += `<div class="search-empty">${t('common.noResult')}</div>`; return; }
      const grid=document.createElement('div'); grid.className='search-grid';
      const input=document.getElementById(inputId); const hasQuery=!!String(input && input.value || '').trim();
      list.forEach((card, idx)=>{
        const el=document.createElement('div'); el.className='sg-card';
        const choose=()=>this.pick(card, idx);
        el.onclick=choose;
        window.searchResultAction[idx]=choose;
        try{ searchResultAction[idx]=choose; }catch(e){}
        el.appendChild(this.makeCardImage(card));
        if(window.innerWidth>768 && hasQuery && idx<9){ const kc=document.createElement('span'); kc.className='search-keycap'; kc.textContent=String(idx+1); el.appendChild(kc); }
        const tier=document.createElement('span'); tier.className='sg-tier tier-'+(card.tier || 'C'); tier.textContent=card.tier || 'C'; el.appendChild(tier);
        const nameBox=document.createElement('div'); nameBox.className='sg-name'; nameBox.textContent=tn(displayName(card)||'');
        el.appendChild(nameBox);
        grid.appendChild(el);
      });
      wrap.appendChild(grid);
    },
    pick(card){
      if(window.__searchFlowStableLock) return;
      // Clear search input on card selection to prevent leftover characters
      try {
        const __input__ = document.getElementById('modalInput');
        if(__input__){
          __input__.value = '';
          if(typeof __input__.__searchQuery === 'string') __input__.__searchQuery = '';
        }
      } catch(__err__){ }
      window.__searchFlowStableLock=true;
      const release=()=>setTimeout(()=>{ window.__searchFlowStableLock=false; },0);
      try{
        const name=displayName(card);
        if(this.isDeckAdd()){
          if(typeof pushDeckCard==='function') pushDeckCard(name); else if(Array.isArray(window.deck)) window.deck.push(name);
          this.close();
          if(typeof renderAll==='function') renderAll();
          return;
        }
        if(Array.isArray(window.picks)) window.picks[this.state.slotIndex]=name;
        else if(typeof picks!=='undefined' && Array.isArray(picks)) picks[this.state.slotIndex]=name;
        if(typeof renderRewardRow==='function') renderRewardRow();
        const need=(typeof getNeedCount==='function') ? getNeedCount() : 0;
        const arr=Array.isArray(window.picks)?window.picks:((typeof picks!=='undefined' && Array.isArray(picks))?picks:[]);
        const next=Array.from({length:need},(_,i)=>i).find(i=>!arr[i]);
        if(next!==undefined){
          this.state.slotIndex=next; this.syncGlobals();
          const titleEl=document.getElementById(titleId); if(titleEl) titleEl.textContent=t('search.slotLabel',{label:((typeof getSlotLabel==='function')?getSlotLabel(next):t('search.fallbackLabel'))});
          const input=document.getElementById(inputId); if(input) input.value='';
          this.render();
          if(typeof ensureSearchInputFocus==='function') ensureSearchInputFocus();
        } else {
          this.close();
          if(typeof renderAll==='function') renderAll('to-result');
        }
      } finally { release(); }
    },
    bindInput(){
      const input=document.getElementById(inputId);
      if(!input || input.__searchFlowStableBound) return;
      input.__searchFlowStableBound=true;
      input.addEventListener('compositionstart',()=>{ input.__isComposingSearch=true; },true);
      input.addEventListener('compositionupdate',()=>{ this.render(); },true);
      input.addEventListener('compositionend',()=>{ input.__isComposingSearch=false; this.render(); },true);
      input.oninput=()=>this.render();
    },
    bindKeys(){
      // 숫자키/Alt+숫자 단축키는 js/12-hotkeys.js에서 통합 처리
    },
    init(){ this.syncGlobals(); this.bindInput(); this.bindKeys(); }
  };
  SearchFlow.init();
  window.__searchFlowStableV4=SearchFlow;
  window.openSearch=function(i){ SearchFlow.openReward(i); };
  window.openDeckAdd=function(){ SearchFlow.openDeckAdd(); };
  window.closeSearch=function(){ SearchFlow.close(); };
  window.renderSearchGrid=function(){ SearchFlow.render(); };
  window.pickSearchCard=function(card){ SearchFlow.pick(card); };
})();
/* === script: search-input-aggr-fix-20260420 === */
(() => {
      /**
       * In some contexts, the search input resets on every keystroke. This helper
       * stores a running query string (romanization or otherwise) on the input
       * element itself and restores it after each keydown. It only activates
       * when the search modal is open and the input is focused. Composition
       * events (Korean IME) bypass this handler so that multi‑stroke Hangul
       * input works natively. Alt/Meta/Ctrl keys are ignored.
       */
      function initAggregator(){
        const input = document.getElementById('modalInput');
        if(!input || input.__aggrBound) return;
        input.__aggrBound = true;
        input.__searchQuery = '';

        function isSearchOpen(){
          const modal = document.getElementById('searchModal');
          return !!(modal && modal.classList.contains('open'));
        }

        // ── 타이핑 핸들러: 검색어 텍스트 입력 전용 ──
        // Backspace, 일반 문자 입력, IME 바이패스 등 순수 텍스트 입력만 처리.
        // 단축키(숫자, Alt 등)는 관여하지 않음.
        function onSearchTyping(e){
          if(!isSearchOpen()) return;
          if(e.isComposing) return;
          if(e.ctrlKey || e.metaKey || e.altKey) return;
          const key = e.key;
          // Backspace: 선택 영역 or 커서 앞 한 글자 삭제
          if(key === 'Backspace'){
            const cur = input.value || '';
            const start = input.selectionStart;
            const end = input.selectionEnd;
            let next, newPos;
            if(start !== end){
              next = cur.substring(0, start) + cur.substring(end);
              newPos = start;
            } else {
              next = cur.substring(0, Math.max(0, start - 1)) + cur.substring(start);
              newPos = Math.max(0, start - 1);
            }
            input.value = next;
            input.__searchQuery = next;
            try { input.setSelectionRange(newPos, newPos); } catch(_){}
            if(typeof window.renderSearchGrid === 'function')
              setTimeout(() => window.renderSearchGrid(), 0);
            e.preventDefault();
            e.stopPropagation();
            if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
            return;
          }
          // 단일 인쇄 가능 문자
          if(key && key.length === 1){
            // 비-ASCII(한글 자모 등)는 네이티브 IME에 맡김
            if(key.charCodeAt(0) > 0x7F) return;
            // 숫자(0-9)는 타이핑하지 않음 → 단축키 핸들러에서 처리
            if(/^[0-9]$/.test(key)) return;
            // 검색어 버퍼에 추가
            input.__searchQuery = (input.__searchQuery || '') + key;
            input.value = input.__searchQuery;
            if(typeof window.renderSearchGrid === 'function')
              setTimeout(() => window.renderSearchGrid(), 0);
            e.preventDefault();
            e.stopPropagation();
            if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
            return;
          }
        }

        // ── 단축키 핸들러: input 내 단축키 제어 전용 ──
        // Alt+숫자 스코프 전환 차단, 숫자키 카드 선택 전파 허용 등
        // 타이핑 로직에는 관여하지 않음.
        function onSearchShortcut(e){
          if(!isSearchOpen()) return;
          if(e.isComposing) return;
          // Alt+키: input 내에서는 스코프 전환 차단 (전파 중단)
          if(e.altKey){
            e.stopPropagation();
            if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
            return;
          }
          // 숫자키(1-9): 타이핑 핸들러에서 이미 무시하므로
          // 여기서 별도 처리 없이 document의 카드 선택 핸들러로 전파됨.
        }

        input.addEventListener('keydown', onSearchTyping, true);
        input.addEventListener('keydown', onSearchShortcut, true);

        // __searchQuery 동기화: 네이티브 수정(Cmd+Backspace 등) 반영
        input.addEventListener('input', () => {
          input.__searchQuery = input.value || '';
        });
        input.addEventListener('focus', () => {
          input.__searchQuery = input.value || '';
        });
      }
      // run after DOM load or immediately if DOM is already ready
      if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', initAggregator);
      } else {
        initAggregator();
      }
    })();
/* === script: search-unify-hotfix-20260411-b === */
(function(){
  const COMPAT_MAP = {'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
  const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

  // Mapping of QWERTY keys to Hangul jamo for a standard 2-set Korean keyboard.
  // This allows users to search card names using English keys without switching
  // input modes. For example, typing "vaxr" becomes "ㅍㅁㅌㄱ" and will match
  // the card "폼멜타격" via its initial consonants.
  const ROMAN_KEY_MAP = {
    q:'ㅂ', w:'ㅈ', e:'ㄷ', r:'ㄱ', t:'ㅅ', y:'ㅛ', u:'ㅕ', i:'ㅑ', o:'ㅐ', p:'ㅔ',
    a:'ㅁ', s:'ㄴ', d:'ㅇ', f:'ㄹ', g:'ㅎ', h:'ㅗ', j:'ㅓ', k:'ㅏ', l:'ㅣ',
    z:'ㅋ', x:'ㅌ', c:'ㅊ', v:'ㅍ', b:'ㅠ', n:'ㅜ', m:'ㅡ'
  };

  /**
   * Convert a query typed on a QWERTY keyboard to Hangul jamo.  Characters
   * without a mapping are returned unchanged.  This is used to support
   * romanized input in the card search.
   *
   * @param {string} str The user query
   * @returns {string} The query converted to Hangul jamo
   */
  function romanToHangul(str){
    return Array.from(String(str || '')).map(ch => {
      const lower = ch.toLowerCase();
      return ROMAN_KEY_MAP[lower] || ch;
    }).join('');
  }
  const clean = s => String(s||'').replace(/\s+/g,'').toLowerCase();
  function decomposeCompatFinal(s){
    return Array.from(String(s||'')).map(ch => COMPAT_MAP[ch] || ch).join('');
  }
  function normalizeLoose(s){
    return clean(decomposeCompatFinal(s));
  }
  function initialsLooseFinal(name){
    const raw = Array.from(String(name||'')).map(ch => {
      const code = ch.charCodeAt(0) - 44032;
      if(code < 0 || code > 11171) return ch.toLowerCase();
      return INITIALS[Math.floor(code/588)] || ch;
    }).join('');
    return normalizeLoose(raw);
  }
  function getSearchRankFinal(name, q){
    // English mode: match against English translated name only (no Korean consonant matching)
    if(window.I18N && window.I18N.lang === 'en' && typeof tn === 'function'){
      var qLow = String(q||'').replace(/\s/g,'').toLowerCase();
      if(!qLow) return 0;
      var en = tn(name);
      var enLow = (en || String(name||'')).replace(/\s/g,'').toLowerCase();
      var enIdx = enLow.indexOf(qLow);
      if(enIdx === 0) return 1000 - qLow.length;
      if(enIdx > 0) return 700 - enIdx;
      return -1;
    }

    // Convert romanized (QWERTY) input to Hangul jamo before normalizing.
    // Without this, queries like "vaxr" would not match "폼멜타격" via initial
    // consonant search.
    const rq = romanToHangul(q);
    const qq = normalizeLoose(rq);
    if(!qq) return 0;
    const nn = normalizeLoose(name);
    const idx = nn.indexOf(qq);
    if(idx === 0) return 1000 - qq.length;
    if(idx > 0) return 700 - idx;
    const initials = initialsLooseFinal(name);
    const iIdx = initials.indexOf(qq);
    if(iIdx === 0) return 950 - qq.length;
    if(iIdx > 0) return 650 - iIdx;

    return -1;
  }
  function matchSearchFinal(name, q){
    return getSearchRankFinal(name, q) > -1;
  }
  /* removed romanization wrapper from unify script – romanization support is provided in final-search-fix */
  window.decomposeCompat = decomposeCompatFinal;
  window.getInitialsLoose = initialsLooseFinal;
  // Preserve any existing window.getSearchRank (e.g. romanization wrapper) by not overwriting it here.
  // Expose the final ranking function separately as getSearchRankFinal.
  window.getSearchRankFinal = getSearchRankFinal;
  window.matchSearch = matchSearchFinal;
  window.matchesLoose = matchSearchFinal;

  function bindCompositionGuards(){
    const input = document.getElementById('modalInput');
    if(!input || input.__searchComposeBound) return;
    input.__searchComposeBound = true;
    input.__isComposingSearch = false;
    input.addEventListener('compositionstart', function(){ input.__isComposingSearch = true; });
    input.addEventListener('compositionend', function(){
      input.__isComposingSearch = false;
      if(typeof window.renderSearchGrid === 'function') window.renderSearchGrid();
    });
  }

  window.__searchPickLock = false;
  window.pickSearchCard = function(card, idx){
    if(window.__searchPickLock) return;
    window.__searchPickLock = true;

    // Always clear the search input immediately when a card is selected.  This
    // prevents leftover characters from sticking in the search box across
    // deck‑add, reward and shop contexts.  Reset any saved query stored on
    // the input element as well.
    try {
      const __si = document.getElementById('modalInput');
      if(__si){
        __si.value = '';
        if(typeof __si.__searchQuery === 'string') __si.__searchQuery = '';
      }
    } catch(__err__) { /* ignore */ }
    const release = () => setTimeout(() => { window.__searchPickLock = false; }, 0);
    try{
      if(typeof deckAddMode !== 'undefined' && deckAddMode){
        if(typeof pushDeckCard === 'function') pushDeckCard(card.n);
        else if(Array.isArray(window.deck)) window.deck.push(card.n);
        if(typeof closeSearch === 'function') closeSearch();
        if(typeof renderAll === 'function') renderAll();
        release();
        return;
      }
      if(Array.isArray(window.picks)) window.picks[window.activeSlot] = card.n;
      else if(typeof picks !== 'undefined' && Array.isArray(picks)) picks[activeSlot] = card.n;
      const need = (typeof getNeedCount === 'function') ? getNeedCount() : 0;
      const currentPicks = Array.isArray(window.picks) ? window.picks : (typeof picks !== 'undefined' && Array.isArray(picks) ? picks : []);
      const next = Array.from({length:need}, (_,i)=>i).find(i => !currentPicks[i]);
      if(next !== undefined){
        window.activeSlot = next;
        try{ activeSlot = next; }catch(e){}
        const title = document.getElementById('modalTitle');
        if(title) title.textContent = t('search.slotLabel',{label:((typeof getSlotLabel === 'function') ? getSlotLabel(next) : t('search.fallbackLabel'))});
        const input = document.getElementById('modalInput');
        if(input){
          input.value = '';
          if(typeof input.__searchQuery === 'string') input.__searchQuery = '';
        }
        if(typeof renderRewardRow === 'function') renderRewardRow();
        if(typeof window.renderSearchGrid === 'function') window.renderSearchGrid();
        if(typeof ensureSearchInputFocus === 'function') ensureSearchInputFocus();
      } else {
        if(typeof closeSearch === 'function') closeSearch();
        if(typeof renderAll === 'function') renderAll('to-result');
      }
    } finally {
      release();
    }
  };

  function buildProgressHtmlFinal(){
    if(typeof deckAddMode !== 'undefined' && deckAddMode) return '';
    if(typeof getNeedCount !== 'function') return '';
    const need = getNeedCount();
    if(!need) return '';
    let prog = '<div class="slot-progress">' + Array.from({length:need}, (_,i)=>{
      const on = i===activeSlot ? ' on' : '';
      const colorless = (typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(i)) ? ' colorless' : '';
      return `<span class="slot-dot${on}${colorless}"></span>`;
    }).join('') + `<span class="slot-text">${(typeof getSlotLabel==='function' ? getSlotLabel(activeSlot) : t('search.title')).replace(/"/g,'&quot;')} ${t('slot.selecting')}</span></div>`;
    if(typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function'){
      prog += `<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.shopColorlessOnly'):t('search.shopClassOnly')}</div>`;
    }
    return prog;
  }

  function rebuildFinal(filtered){
    const wrap = document.getElementById('searchGridWrap');
    const input = document.getElementById('modalInput');
    if(!wrap) return;
    if(typeof window.renderSearchScopeTabs === 'function') window.renderSearchScopeTabs();
    const prog = buildProgressHtmlFinal();
    if(!filtered.length){
      wrap.innerHTML = prog + `<div class="search-empty">${t('common.noResult')}</div>`;
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'search-grid';
    window.searchResultList = filtered.slice();
    try{ searchResultList = filtered.slice(); }catch(e){}
    window.searchResultAction = [];
    try{ searchResultAction = []; }catch(e){}

    filtered.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'sg-card';
      const choose = function(){ return window.pickSearchCard(card, idx); };
      window.searchResultAction[idx] = choose;
      try{ searchResultAction[idx] = choose; }catch(e){}
      el.onclick = choose;

      const img = document.createElement('img');
      img.src = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/' + (card.filename || (encodeURIComponent(String(card.n||'').replace(/\s+/g,'')) + '.webp'));
      img.className = 'img-loading';
      img.onload = () => img.classList.remove('img-loading');
      img.onerror = () => {
        img.onerror = null;
        const ph = document.createElement('div');
        ph.className = 'sg-ph';
        ph.textContent = card.n || '';
        img.replaceWith(ph);
      };
      el.appendChild(img);

      if(window.innerWidth > 768 && String(input && input.value || '').trim().length > 0 && idx < 9){
        const kc = document.createElement('span');
        kc.className = 'search-keycap';
        kc.textContent = String(idx + 1);
        el.appendChild(kc);
      }
      el.insertAdjacentHTML('beforeend', `<div class="sg-name">${tn(card.n||'')}</div><span class="sg-tier tier-${card.tier||'C'}">${card.tier||'C'}</span>`);
      grid.appendChild(el);
    });
    wrap.innerHTML = prog;
    wrap.appendChild(grid);
  }

  function getBasePoolFinal(){
    if(typeof window.getActiveBasePool === 'function'){
      const base = window.getActiveBasePool();
      if(Array.isArray(base)) return base.slice();
    }
    return [];
  }

  function renderSearchGridFinal(){
    bindCompositionGuards();
    const input = document.getElementById('modalInput');
    const q = input ? (input.value || '') : '';
    if(input && input.__isComposingSearch) return;
    let filtered = getBasePoolFinal();
    if(typeof window.shouldIncludeInCurrentContext === 'function') filtered = filtered.filter(window.shouldIncludeInCurrentContext);
    filtered = filtered
      .map(card => {
        let r = -1;
        // Prefer the global getSearchRank wrapper (which includes romanization support) when available
        if(typeof window.getSearchRank === 'function'){
          r = window.getSearchRank(card && card.n, q);
        } else if(typeof getSearchRankFinal === 'function'){
          r = getSearchRankFinal(card && card.n, q);
        }
        return {card, rank: r};
      })
      .filter(x => x.rank > -1)
      .sort((a,b) => { const locale = (window.I18N && window.I18N.lang === 'en') ? 'en' : 'ko'; const nameA = locale === 'en' && typeof tn === 'function' ? tn(a.card.n) || a.card.n : a.card.n; const nameB = locale === 'en' && typeof tn === 'function' ? tn(b.card.n) || b.card.n : b.card.n; return (b.rank - a.rank) || (nameA.length - nameB.length) || nameA.localeCompare(nameB, locale); })
      .map(x => x.card);
    rebuildFinal(filtered);
  }

  window.renderSearchGrid = renderSearchGridFinal;
  bindCompositionGuards();
})();
/* === script: search-scope-stale-fix-20260411b === */
(function(){
  const CDN='https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';
  let renderSeq = 0;
  let rafId = 0;

  function norm(v){ return String(v||'').replace(/\s+/g,''); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
  function getAllClassCards(){
    const order = Array.isArray(window.CLASS_ORDER) ? window.CLASS_ORDER : ['ironclad','silent','defect','necro','regent'];
    const pools = window.REPO_POOLS || {};
    return order.flatMap(k => Array.isArray(pools[k]) ? pools[k] : []);
  }
  function getContextColorless(){
    const pools = window.REPO_POOLS || {};
    const arr = Array.isArray(pools.colorless) ? pools.colorless.slice() : [];
    if(deckAddMode) return arr;
    const inRewardOrShop = (typeof mode !== 'undefined') && (mode === 'reward' || mode === 'shop');
    if(inRewardOrShop && typeof window.isPurchasableColorlessCard === 'function'){
      return arr.filter(window.isPurchasableColorlessCard);
    }
    return arr;
  }
  function uniqueByFilename(list){
    const seen = new Set();
    const out = [];
    for(const c of (Array.isArray(list)?list:[])){
      const key = String((c && (c.filename || c.n)) || '');
      if(seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }
  function getBasePool(){
    const pools = window.REPO_POOLS || {};
    const current = (typeof curChar !== 'undefined' && curChar) ? curChar : 'ironclad';
    const isShop = (typeof mode !== 'undefined' && mode === 'shop');
    const forceColorless = !deckAddMode && isShop && typeof isShopColorlessSlot === 'function' && isShopColorlessSlot(activeSlot);
    const scope = forceColorless ? 'colorless' : (window.searchScope || (deckAddMode ? 'all' : 'current'));

    if(scope === 'current') return Array.isArray(pools[current]) ? pools[current].slice() : [];
    if(scope === 'other'){
      const order = Array.isArray(window.CLASS_ORDER) ? window.CLASS_ORDER : ['ironclad','silent','defect','necro','regent'];
      return order.filter(k => k !== current).flatMap(k => Array.isArray(pools[k]) ? pools[k] : []);
    }
    const colorless = getContextColorless();
    if(scope === 'colorless') return colorless;
    return [...getAllClassCards(), ...colorless];
  }
  function getProgressHtml(){
    if(deckAddMode) return '';
    const need = (typeof getNeedCount === 'function') ? getNeedCount() : ((Array.isArray(picks) && picks.length) ? picks.length : 0);
    const label = (typeof getSlotLabel === 'function') ? getSlotLabel(activeSlot) : t('search.title');
    let html = '<div class="slot-progress">';
    for(let i=0;i<need;i++){
      const on = i===activeSlot ? ' on' : '';
      const colorless = (typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function' && isShopColorlessSlot(i)) ? ' colorless' : '';
      html += `<span class="slot-dot${on}${colorless}"></span>`;
    }
    html += `<span class="slot-text">${esc(label)} ${t('slot.selecting')}</span></div>`;
    if(typeof mode!=='undefined' && mode==='shop' && typeof isShopColorlessSlot==='function' && activeSlot > -1){
      html += `<div class="slot-hint">${isShopColorlessSlot(activeSlot)?t('search.shopColorlessOnly'):t('search.classOnly')}</div>`;
    }
    return html;
  }
  function renderNow(seq){
    const wrap = document.getElementById('searchGridWrap');
    const input = document.getElementById('modalInput');
    if(!wrap || !input) return;
    const q = input.value || '';
    const prog = getProgressHtml();
    const rankFn = (typeof window.getSearchRankFinal === 'function') ? window.getSearchRankFinal : (typeof getSearchRank === 'function' ? getSearchRank : null);
    let pool = uniqueByFilename(getBasePool());
    if(!deckAddMode && Array.isArray(picks)){
      const ex = picks.filter((p,j)=>p && j!==activeSlot);
      pool = pool.filter(c => !ex.includes(c.n));
    }
    if(!deckAddMode && typeof window.shouldIncludeInCurrentContext === 'function'){
      pool = pool.filter(window.shouldIncludeInCurrentContext);
    }
    let filtered = pool;
    if(rankFn){
      filtered = pool
        .map(card => ({card, rank: rankFn(card && card.n, q)}))
        .filter(x => x.rank > -1)
        .sort((a,b)=>(b.rank-a.rank)||((a.card.n||'').length-(b.card.n||'').length)||String(a.card.n||'').localeCompare(String(b.card.n||''),'ko'))
        .map(x => x.card);
    }
    if(seq !== renderSeq) return;
    window.searchResultList = filtered.slice();
    try{ searchResultList = filtered.slice(); }catch(e){}
    window.searchResultAction = [];
    try{ searchResultAction = []; }catch(e){}
    wrap.innerHTML = prog;
    if(!filtered.length){
      wrap.innerHTML = prog + `<div class="search-empty">${t('common.noResult')}</div>`;
      return;
    }
    const grid = document.createElement('div');
    grid.className='search-grid';
    filtered.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className='sg-card';
      const choose = function(){ return window.pickSearchCard(card, idx); };
      el.onclick = choose;
      window.searchResultAction[idx] = choose;
      try{ searchResultAction[idx] = choose; }catch(e){}
      const img = document.createElement('img');
      img.loading='lazy';
      img.decoding='async';
      img.src = CDN + (card.filename || (encodeURIComponent(norm(card.n)) + '.webp'));
      img.className='img-loading';
      img.onload=()=>img.classList.remove('img-loading');
      img.onerror=()=>{ img.onerror=null; const ph=document.createElement('div'); ph.className='sg-ph'; ph.textContent=card.n||''; img.replaceWith(ph); };
      el.appendChild(img);
      if(window.innerWidth > 768 && norm(q).length > 0 && idx < 9){
        const kc=document.createElement('span'); kc.className='search-keycap'; kc.textContent=String(idx+1); el.appendChild(kc);
      }
      el.insertAdjacentHTML('beforeend', `<div class="sg-name">${esc(tn(card.n||''))}</div><span class="sg-tier tier-${esc(card.tier||'C')}">${esc(card.tier||'C')}</span>`);
      grid.appendChild(el);
    });
    wrap.appendChild(grid);
  }
  function scheduleRender(){
    renderSeq += 1;
    const seq = renderSeq;
    if(rafId){ cancelAnimationFrame(rafId); rafId = 0; }
    renderNow(seq);
  }

  window.renderSearchGrid = function(){
    if(typeof window.renderSearchScopeTabs === 'function') window.renderSearchScopeTabs();
    scheduleRender();
  };

  const input = document.getElementById('modalInput');
  if(input){
    input.addEventListener('compositionstart', function(){ input.__isComposingSearch = true; window.renderSearchGrid(); }, true);
    input.addEventListener('compositionupdate', function(){ window.renderSearchGrid(); }, true);
    input.addEventListener('compositionend', function(){ input.__isComposingSearch = false; window.renderSearchGrid(); }, true);
    input.oninput = function(){ window.renderSearchGrid(); };
  }
})();
/* === script: reward-shop-colorless-filter-fix-v2 === */
(function(){
  const PURCHASABLE_COLORLESS = new Set([
    '강철의섬광','극적인입장','난사','만물절단','고동치는도끼','궁극의타격','정신공격','주먹다짐','탐색타격',
    '능숙','미래예지','비상단추','생산','성급함','순수','어둠의족쇄','연장','초조함','팔방미인','궁극의수비','발견','착수','재난','충격파','평형','폭탄',
    '위풍당당','고정시키기','기량','자동화','준비시간','책략',
    '사냥돌','집중포화','황금도끼','쥐어뜯기','탐욕의손','잭팟',
    '비밀기술','비밀병기','전략의천재','포석','숨겨진보석','연금','임명','휘갈김','두들겨패기',
    '엔트로피','향수','대혼란','굴러가는바위','영원의갑옷','재앙'
  ].map(v => String(v).replace(/\s+/g,'')));
  window.isPurchasableColorlessCard = function(card){
    if(!card) return false;
    const key = String(card.n || '').replace(/\s+/g,'');
    return PURCHASABLE_COLORLESS.has(key);
  };
})();
/* === script: explicit-status-curse-policy-fix-20260414 === */
(function(){
  const BLOCKED = new Set([
    '감염','공허','그을음','나태','부상','분해','쇠퇴','어지러움','정신오염','화상','유독성','유인','잔해','점액투성이','필사적인도주',
    '규칙준수','등반가의골칫거리','몸부림','방울의저주','부패','불운','빚','상처','서투름','수면부족','수치','어리석음','의심','죄책감','탐욕','후회','포자잠식','매료됨'
  ].map(v => String(v).replace(/\s+/g,'')));
  window.isStatusOrCurseCard = function(card){
    if(!card) return false;
    const raw = String(card.n || '');
    const key = raw.replace(/\s+/g,'');
    const rarity = String(card.r || '').trim();
    const type = String(card.t || '').trim();
    return BLOCKED.has(key) || rarity==='상태' || rarity==='저주' || type==='상태' || type==='저주';
  };
  const prevShould = window.shouldIncludeInCurrentContext;
  window.shouldIncludeInCurrentContext = function(card){
    if(typeof deckAddMode !== 'undefined' && deckAddMode) return true;
    const inRewardOrShop = (typeof mode !== 'undefined') && (mode === 'reward' || mode === 'shop');
    if(!inRewardOrShop) return true;
    if(!card) return false;
    if(window.isStatusOrCurseCard(card)) return false;
    if(typeof prevShould === 'function') return prevShould(card);
    return true;
  };
})();
/* === script: search-flow-refactor-authoritative-20260414 === */
(function(){
  const modalId = 'searchModal';
  const titleId = 'modalTitle';
  const inputId = 'modalInput';
  const wrapId = 'searchGridWrap';

  const SearchFlow = {
    state: {
      type: 'reward', // reward | deckAdd
      slotIndex: -1,
      scope: 'current'
    },

    syncToGlobals(){
      try{ window.activeSlot = this.state.slotIndex; activeSlot = this.state.slotIndex; }catch(e){}
      try{ const isDeckAdd = this.state.type === 'deckAdd'; window.deckAddMode = isDeckAdd; deckAddMode = isDeckAdd; }catch(e){}
      window.searchScope = this.state.scope;
    },

    isDeckAdd(){ return this.state.type === 'deckAdd'; },
    isShop(){ return (typeof mode !== 'undefined' && mode === 'shop'); },
    isColorlessOnlySlot(slotIndex=this.state.slotIndex){
      return !this.isDeckAdd() && this.isShop() && typeof isShopColorlessSlot === 'function' && isShopColorlessSlot(slotIndex);
    },

    getScopeConfig(){
      const current = (typeof curChar !== 'undefined' && curChar) ? curChar : 'ironclad';
      const CDN = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';
      const labels = {
        ironclad:'아이언클래드',
        silent:'사일런트',
        defect:'디펙트',
        necro:'네크로바인더',
        regent:'리젠트'
      };
      const icons = {
        ironclad: CDN + 'profile_Ironclad.webp',
        silent: CDN + 'profile_Silent.webp',
        defect: CDN + 'profile_Defect.webp',
        necro: CDN + 'profile_Necrobinder.webp',
        regent: CDN + 'profile_Regent.webp'
      };
      return [
        {key:'all', label: t('scope.all'), icon:'', hotkey:'ALT+1'},
        {key:'current', label:tn(labels[current]) || t('scope.currentClass'), icon:icons[current] || '', hotkey:'ALT+2'},
        {key:'colorless', label: t('scope.colorless'), icon:'', hotkey:'ALT+3'},
        {key:'other', label: t('scope.other'), icon:'', hotkey:'ALT+4'}
      ];
    },

    resetScope(){
      if(this.isDeckAdd()){
        this.state.scope = 'all';
      } else if(this.isColorlessOnlySlot()){
        this.state.scope = 'colorless';
      } else {
        this.state.scope = 'current';
      }
      this.syncToGlobals();
    },

    openReward(slotIndex){
      this.state.type = 'reward';
      this.state.slotIndex = Number(slotIndex);
      this.resetScope();
      this.openModal(t('search.slotLabel',{label:(typeof getSlotLabel === 'function' ? getSlotLabel(this.state.slotIndex) : t('search.fallbackLabel'))}));
    },

    openDeckAdd(){
      this.state.type = 'deckAdd';
      this.state.slotIndex = -1;
      this.resetScope();
      this.openModal(t('search.addToDeck'));
    },

    close(){
      const modal = document.getElementById(modalId);
      if(modal) modal.classList.remove('open');
      this.state.slotIndex = -1;
      this.state.type = 'reward';
      this.syncToGlobals();
      if(typeof updateBodyLock === 'function') updateBodyLock();
    },

    openModal(title){
      this._pickClearPending = false;
      const modal = document.getElementById(modalId);
      const input = document.getElementById(inputId);
      const titleEl = document.getElementById(titleId);
      if(titleEl) titleEl.textContent = title;
      if(input) input.value = '';
      if(modal) modal.classList.add('open');
      this.syncToGlobals();
      if(typeof updateBodyLock === 'function') updateBodyLock();
      this.renderScopeTabs();
      this.render();
      if(typeof ensureSearchInputFocus === 'function') ensureSearchInputFocus();
    },

    getPoolByScope(scope){
      const current = (typeof curChar !== 'undefined' && curChar) ? curChar : 'ironclad';
      if(typeof REPO_POOLS !== 'undefined' && REPO_POOLS){
        const classOrder = (typeof CLASS_ORDER !== 'undefined' && Array.isArray(CLASS_ORDER)) ? CLASS_ORDER : ['ironclad','silent','defect','necro','regent'];
        if(scope === 'current') return (REPO_POOLS[current] || []).slice();
        if(scope === 'colorless') return (REPO_POOLS.colorless || []).slice();
        if(scope === 'other') return classOrder.filter(k => k !== current).flatMap(k => REPO_POOLS[k] || []);
        return classOrder.flatMap(k => REPO_POOLS[k] || []).concat((REPO_POOLS.colorless || []).slice());
      }

      const classCards = (typeof ALL !== 'undefined' && ALL[current] && Array.isArray(ALL[current].cards)) ? ALL[current].cards.slice() : [];
      const colorless = (typeof COLORLESS_CARDS !== 'undefined' && Array.isArray(COLORLESS_CARDS)) ? COLORLESS_CARDS.slice() : [];
      const classOrder = (typeof ALL !== 'undefined' && ALL) ? Object.keys(ALL) : [];
      if(scope === 'current') return classCards;
      if(scope === 'colorless') return colorless;
      if(scope === 'other') return classOrder.filter(k => k !== current).flatMap(k => (ALL[k] && Array.isArray(ALL[k].cards)) ? ALL[k].cards : []);
      return classOrder.flatMap(k => (ALL[k] && Array.isArray(ALL[k].cards)) ? ALL[k].cards : []).concat(colorless);
    },

    getBasePool(){
      if(this.isColorlessOnlySlot()) {
        this.state.scope = 'colorless';
        this.syncToGlobals();
      }
      let pool = this.getPoolByScope(this.state.scope);
      const current = (typeof curChar !== 'undefined' && curChar) ? curChar : 'ironclad';
      // scope 'all'/'other'일 때 동명 카드(예: Strike)를 이름 기준으로 dedup,
      // 현재 클래스 카드 우선
      const multiClass = (this.state.scope === 'all' || this.state.scope === 'other');
      if(multiClass){
        const nameMap = new Map();
        pool.forEach(card => {
          if(!card || !card.n) return;
          const nKey = String(card.n).replace(/\s+/g,'').toLowerCase();
          const existing = nameMap.get(nKey);
          if(!existing){
            nameMap.set(nKey, card);
          } else {
            // 현재 클래스 카드를 우선
            const existingClass = (existing.__kind || existing.cls || '').toLowerCase();
            const thisClass = (card.__kind || card.cls || '').toLowerCase();
            if(thisClass === current && existingClass !== current){
              nameMap.set(nKey, card);
            }
          }
        });
        pool = Array.from(nameMap.values());
      }
      const seen = new Set();
      pool = pool.filter(card => {
        if(!card || !card.n) return false;
        if(!this.isDeckAdd() && typeof isStatusOrCurseCard === 'function' && isStatusOrCurseCard(card)) return false;
        if(this.isColorlessOnlySlot() && typeof isPurchasableColorlessCard === 'function' && !isPurchasableColorlessCard(card)) return false;
        if(typeof shouldIncludeInCurrentContext === 'function' && !shouldIncludeInCurrentContext(card)) return false;
        const key = String((card && (card.filename || card.n)) || '').replace(/\s+/g,'').toLowerCase();
        if(seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return pool;
    },

    getFilteredList(){
      const input = document.getElementById(inputId);
      const q = input ? String(input.value || '') : '';
      let pool = this.getBasePool();
      if(!this.isDeckAdd()){
        const ex = Array.isArray(window.picks) ? window.picks.filter((p, idx) => p && idx !== this.state.slotIndex) : ((typeof picks !== 'undefined' && Array.isArray(picks)) ? picks.filter((p, idx) => p && idx !== this.state.slotIndex) : []);
        pool = pool.filter(card => !ex.includes(card.n));
      }
      return pool
        .map(card => ({ card, rank: (typeof getSearchRank === 'function' ? getSearchRank(card.n, q) : 0) }))
        .filter(x => x.rank > -1)
        .sort((a, b) => (b.rank - a.rank) || ((a.card.n || '').length - (b.card.n || '').length) || String(a.card.n || '').localeCompare(String(b.card.n || ''), 'ko'))
        .map(x => x.card);
    },

    buildProgressHtml(){
      if(this.isDeckAdd() || typeof getNeedCount !== 'function') return '';
      const need = getNeedCount();
      if(!need) return '';
      let prog = '<div class="slot-progress">' + Array.from({length:need}, (_,i) => {
        const on = i === this.state.slotIndex ? ' on' : '';
        const colorless = this.isShop() && this.isColorlessOnlySlot(i) ? ' colorless' : '';
        return `<span class="slot-dot${on}${colorless}"></span>`;
      }).join('') + `<span class="slot-text">${(typeof getSlotLabel === 'function' ? getSlotLabel(this.state.slotIndex) : t('search.title'))} ${t('slot.selecting')}</span></div>`;
      if(this.isShop()) {
        prog += `<div class="slot-hint">${this.isColorlessOnlySlot() ? t('search.shopColorlessOnly') : t('search.classOnly')}</div>`;
      }
      return prog;
    },

    makeCardImage(card){
      try{
        if(typeof makeImg === 'function'){
          const owner = String(card.__owner || card.owner || '').toLowerCase();
          const preferred = owner || ((typeof curChar !== 'undefined' && curChar) ? curChar : 'ironclad');
          const img = makeImg(card.n, 'sg', preferred);
          if(img) return img;
        }
      }catch(e){}
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/' + (card.filename || (encodeURIComponent(String(card.n||'').replace(/\s+/g,'')) + '.webp'));
      img.className = 'img-loading';
      img.onload = () => img.classList.remove('img-loading');
      img.onerror = () => {
        img.onerror = null;
        const ph = document.createElement('div');
        ph.className = 'sg-ph';
        ph.textContent = card.n || '';
        img.replaceWith(ph);
      };
      return img;
    },

    renderScopeTabs(){
      const top = document.querySelector('#' + modalId + ' .modal-top');
      if(!top) return;
      let box = document.getElementById('searchScopeTabs');
      const forceColorless = this.isColorlessOnlySlot();
      if(forceColorless && this.state.scope !== 'colorless'){
        this.state.scope = 'colorless';
        this.syncToGlobals();
      }
      // 이미 탭이 존재하면 active 상태만 업데이트 (DOM 재생성 방지)
      if(box && box.children.length > 0 && box.__scopeBuilt){
        const btns = box.querySelectorAll('.search-scope-chip');
        btns.forEach(btn => {
          const key = btn.dataset.scopeKey;
          btn.classList.toggle('on', this.state.scope === key);
          btn.disabled = forceColorless && key !== 'colorless';
          btn.style.opacity = btn.disabled ? '.55' : '1';
        });
        return;
      }
      if(!box){
        box = document.createElement('div');
        box.id = 'searchScopeTabs';
        box.className = 'search-scope-tabs';
        top.appendChild(box);
      }
      box.innerHTML = '';
      this.getScopeConfig().forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.scopeKey = item.key;
        btn.className = 'search-scope-chip' + (this.state.scope === item.key ? ' on' : '');
        btn.disabled = forceColorless && item.key !== 'colorless';
        btn.style.opacity = btn.disabled ? '.55' : '1';
        btn.onclick = () => {
          if(btn.disabled) return;
          this.state.scope = item.key;
          this.syncToGlobals();
          this.render();
        };
        if(item.icon){
          const icon = document.createElement('img');
          icon.src = item.icon;
          icon.onerror = () => icon.remove();
          btn.appendChild(icon);
        }
        const label = document.createElement('span');
        label.textContent = item.label;
        btn.appendChild(label);
        const keycap = document.createElement('span');
        keycap.className = 'search-scope-keycap';
        keycap.textContent = item.hotkey;
        btn.appendChild(keycap);
        box.appendChild(btn);
      });
      box.__scopeBuilt = true;
    },

    render(){
      const wrap = document.getElementById(wrapId);
      if(!wrap) return;
      // pick 직후 compositionend가 비동기로 input에 텍스트를 되살릴 수 있음 → 강제 클리어
      if(this._pickClearPending){
        const inp = document.getElementById(inputId);
        if(inp){ inp.value = ''; inp.__isComposingSearch = false; }
      }
      const list = this.getFilteredList();
      const progressHtml = this.buildProgressHtml();
      this.renderScopeTabs();
      window.searchResultList = list.slice();
      try{ searchResultList = list.slice(); }catch(e){}
      window.searchResultAction = [];
      try{ searchResultAction = []; }catch(e){}
      wrap.innerHTML = progressHtml;
      if(!list.length){
        wrap.innerHTML = progressHtml + `<div class="search-empty">${t('common.noResult')}</div>`;
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'search-grid';
      const input = document.getElementById(inputId);
      const q = input ? String(input.value || '') : '';
      list.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'sg-card';
        const choose = () => this.pick(card, idx);
        el.onclick = choose;
        window.searchResultAction[idx] = choose;
        try{ searchResultAction[idx] = choose; }catch(e){}
        el.appendChild(this.makeCardImage(card));
        if(window.innerWidth > 768 && idx < 9){
          const kc = document.createElement('span');
          kc.className = 'search-keycap';
          kc.textContent = String(idx + 1);
          el.appendChild(kc);
        }
        el.insertAdjacentHTML('beforeend', `<div class="sg-name">${tn(card.n || '')}</div><span class="sg-tier tier-${card.tier || 'C'}">${card.tier || 'C'}</span>`);
        grid.appendChild(el);
      });
      wrap.appendChild(grid);
    },

    pick(card){
      if(window.__searchFlowPickLock) return;
      window.__searchFlowPickLock = true;
      const release = () => setTimeout(() => { window.__searchFlowPickLock = false; }, 0);
      try{
        // pick 후 compositionend가 비동기로 input에 텍스트를 되살리는 것 방지
        // render() 진입 시 이 플래그를 보고 input을 강제 클리어
        this._pickClearPending = true;
        const __input__ = document.getElementById('modalInput');
        if(__input__){
          __input__.__isComposingSearch = false;
          __input__.value = '';
          if(typeof __input__.__searchQuery === 'string') __input__.__searchQuery = '';
        }
        if(this.isDeckAdd()){
          if(typeof pushDeckCard === 'function') pushDeckCard(card.n);
          else if(Array.isArray(window.deck)) window.deck.push(card.n);
          this.close();
          if(typeof renderAll === 'function') renderAll();
          return;
        }
        if(Array.isArray(window.picks)) window.picks[this.state.slotIndex] = card.n;
        else if(typeof picks !== 'undefined' && Array.isArray(picks)) picks[this.state.slotIndex] = card.n;

        const need = (typeof getNeedCount === 'function') ? getNeedCount() : 0;
        const currentPicks = Array.isArray(window.picks) ? window.picks : ((typeof picks !== 'undefined' && Array.isArray(picks)) ? picks : []);
        const next = Array.from({length:need}, (_,i) => i).find(i => !currentPicks[i]);

        if(next !== undefined){
          this.state.slotIndex = next;
          this.syncToGlobals();
          const titleEl = document.getElementById(titleId);
          if(titleEl) titleEl.textContent = t('search.slotLabel',{label:((typeof getSlotLabel === 'function') ? getSlotLabel(next) : t('search.fallbackLabel'))});
          const input = document.getElementById(inputId);
          if(input){ input.value = ''; input.__isComposingSearch = false; }
          if(typeof renderRewardRow === 'function') renderRewardRow();
          this.render();
          if(typeof ensureSearchInputFocus === 'function') ensureSearchInputFocus();
        } else {
          this.close();
          if(typeof renderAll === 'function') renderAll('to-result');
        }
      } finally {
        // 200ms 동안 compositionend/oninput이 텍스트를 되살려도 render()가 다시 클리어
        const self = this;
        setTimeout(function(){ self._pickClearPending = false; }, 200);
        release();
      }
    },

    bindInput(){
      const input = document.getElementById(inputId);
      if(!input || input.__searchFlowRefactorBound) return;
      input.__searchFlowRefactorBound = true;
      input.addEventListener('compositionstart', () => { input.__isComposingSearch = true; }, true);
      input.addEventListener('compositionupdate', () => { this.render(); }, true);
      input.addEventListener('compositionend', () => { input.__isComposingSearch = false; this.render(); }, true);
      input.oninput = () => this.render();
    },

    bindKeys(){
      // 숫자키/Alt+숫자 단축키는 js/12-hotkeys.js에서 통합 처리
    },

    init(){
      this.syncToGlobals();
      this.bindInput();
      this.bindKeys();
    }
  };

  SearchFlow.init();
  window.__searchFlow = SearchFlow;
  window.openSearch = function(i){ SearchFlow.openReward(i); };
  window.openDeckAdd = function(){ SearchFlow.openDeckAdd(); };
  window.closeSearch = function(){ SearchFlow.close(); };
  window.renderSearchGrid = function(){ SearchFlow.render(); };
  window.pickSearchCard = function(card){ SearchFlow.pick(card); };
})();

/* === script: final-search-fix-20260423 === */
(() => {
  // mapping from QWERTY keys to Hangul jamo for Dubeolsik keyboard
  const keyMap = {
    q:'ㅂ', w:'ㅈ', e:'ㄷ', r:'ㄱ', t:'ㅅ', y:'ㅛ', u:'ㅕ', i:'ㅑ', o:'ㅐ', p:'ㅔ',
    a:'ㅁ', s:'ㄴ', d:'ㅇ', f:'ㄹ', g:'ㅎ', h:'ㅗ', j:'ㅓ', k:'ㅏ', l:'ㅣ',
    z:'ㅋ', x:'ㅌ', c:'ㅊ', v:'ㅍ', b:'ㅠ', n:'ㅜ', m:'ㅡ'
  };
  function romanToHangul(str){
    return Array.from(String(str||''))
      .map(ch => {
        const lower = ch.toLowerCase();
        return keyMap[lower] || ch;
      })
      .join('');
  }
  // wrap getSearchRank to consider romanized input; preserve existing ranking logic
  const origGetSearchRank = window.getSearchRank;
  if(typeof origGetSearchRank === 'function'){
    window.getSearchRank = function(name, q){
      // In English mode, skip QWERTY-to-Hangul romanization — search English names directly
      if(window.I18N && window.I18N.lang === 'en') return origGetSearchRank(name, q);
      let rank = origGetSearchRank(name, q);
      const conv = romanToHangul(q);
      if(conv && conv !== q){
        const r2 = origGetSearchRank(name, conv);
        if(r2 > rank) rank = r2;
      }
      return rank;
    };
  }
  // wrap getSearchRankFinal similarly
  const origFinalRank = window.getSearchRankFinal;
  if(typeof origFinalRank === 'function'){
    window.getSearchRankFinal = function(name, q){
      // In English mode, skip QWERTY-to-Hangul romanization — search English names directly
      if(window.I18N && window.I18N.lang === 'en') return origFinalRank(name, q);
      let rank = origFinalRank(name, q);
      const conv = romanToHangul(q);
      if(conv && conv !== q){
        const r2 = origFinalRank(name, conv);
        if(r2 > rank) rank = r2;
      }
      return rank;
    };
  }
  // ensure search input and internal query buffer are cleared when a card is picked.
  if(typeof window.pickSearchCard === 'function'){
    const origPick = window.pickSearchCard;
    window.pickSearchCard = function(card, idx){
      try {
        const input = document.getElementById('modalInput');
        if(input){
          input.value = '';
          if(typeof input.__searchQuery === 'string') input.__searchQuery = '';
        }
      } catch(e){}
      // schedule a secondary clear to handle any asynchronous updates from other handlers
      setTimeout(() => {
        try {
          const input2 = document.getElementById('modalInput');
          if(input2){
            input2.value = '';
            if(typeof input2.__searchQuery === 'string') input2.__searchQuery = '';
          }
        } catch(_){/*ignore*/}
      }, 0);
      return origPick.call(this, card, idx);
    };
  }
  // Alt+key 차단 및 숫자키 전파는 aggregator의 onSearchShortcut에서 처리됨.
})();
/* === script: ime-leftover-fix-20260419-v5 === */
(function(){
  const GUARD_MS = 300;
  let guardUntil = 0;

  function inGuard(){ return performance.now() < guardUntil; }

  function forceClearInput(input){
    if(!input) return;
    // native setter로 직접 세팅 (value setter가 다른 코드에서 가로채져 있어도 확실히 동작)
    try {
      const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if(desc && desc.set) desc.set.call(input, '');
      else input.value = '';
    } catch(_){ input.value = ''; }
    if(typeof input.__searchQuery === 'string') input.__searchQuery = '';
    input.__isComposingSearch = false;
  }

  // modalInput에 input 이벤트 가드 리스너 부착
  function attachInputGuard(){
    const input = document.getElementById('modalInput');
    if(!input || input.__v5GuardBound) return;
    input.__v5GuardBound = true;

    // capture 단계에서 최우선으로 실행. 가드 중이면 입력된 값을 즉시 0으로.
    // 다른 input 리스너들(renderSearchGrid 트리거 등)보다 먼저 실행되어
    // 빈 값으로 render되도록 함.
    input.addEventListener('input', function(e){
      if(!inGuard()) return;
      if(input.value === '') return;
      forceClearInput(input);
      // 이 input 이벤트는 이미 발생한 것이라 stopPropagation해도 다른 리스너는 돌 수 있음.
      // 하지만 그들이 보는 값은 이미 ""로 바뀌어 있으므로 OK.
    }, true);

    // compositionend로 IME가 뒤늦게 커밋하는 경우도 동일하게
    input.addEventListener('compositionend', function(e){
      if(!inGuard()) return;
      // compositionend 직후 브라우저가 value를 업데이트하므로 다음 tick에 비우기
      setTimeout(function(){
        if(inGuard()) forceClearInput(input);
      }, 0);
      requestAnimationFrame(function(){
        if(inGuard()) forceClearInput(input);
      });
    }, true);
  }

  // pickSearchCard와 selectSearchResultByIndex를 래핑
  // 이 둘 중 하나가 호출되면 가드 활성화
  function activateGuard(reason){
    guardUntil = performance.now() + GUARD_MS;
    const input = document.getElementById('modalInput');
    if(input){
      // 현재 값도 바로 비우기 (조합 중 ㅌ이 이미 들어와 있을 수도 있음)
      forceClearInput(input);
      // 가드 기간 동안 여러 타이밍에 반복 청소
      [0, 16, 50, 100, 180, 260].forEach(function(delay){
        setTimeout(function(){
          if(!inGuard()) return;
          const cur = document.getElementById('modalInput');
          if(cur && cur.value !== '') forceClearInput(cur);
        }, delay);
      });
    }
  }

  function wrapFn(name){
    let current = window[name];
    Object.defineProperty(window, name, {
      configurable: true,
      get(){ return current; },
      set(fn){
        // 원본을 래핑하는 형태로 저장
        current = function(){
          activateGuard(name);
          const ret = fn.apply(this, arguments);
          // 호출 후에도 가드 재활성화 (비동기 동작이 있을 수 있으므로)
          activateGuard(name + ':post');
          return ret;
        };
      }
    });
    // 이미 정의되어 있으면 즉시 래핑
    if(typeof current === 'function'){
      const orig = current;
      current = function(){
        activateGuard(name);
        const ret = orig.apply(this, arguments);
        activateGuard(name + ':post');
        return ret;
      };
    }
  }

  function init(){
    attachInputGuard();
    wrapFn('pickSearchCard');
    // selectSearchResultByIndex도 래핑 (모바일/다른 경로 대비)
    wrapFn('selectSearchResultByIndex');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // modalInput이 재생성되는 경우 대비
  document.addEventListener('focusin', function(ev){
    if(ev.target && ev.target.id === 'modalInput') attachInputGuard();
  }, true);
})();
/* === script: card-alias-search-20260419-v2 === */
(function(){
  // ========== [1] 카드 별칭 ==========
  // 카드명(공백/대소문자 무시) -> 별칭 리스트
  const CARD_ALIASES_RAW = {
    'FTL':     ['ㄹ시', 'ㄽ', 'ftl', '에프티엘', 'ㄹㅅ'],
    '포식자':   ['천적', 'ㅊㅈ', 'ㅊ']
  };

  function normKey(s){ return String(s||'').replace(/\s+/g,'').trim().toLowerCase(); }
  // 정규화 키로 별칭 맵 재구성
  const CARD_ALIASES = {};
  Object.keys(CARD_ALIASES_RAW).forEach(k => { CARD_ALIASES[normKey(k)] = CARD_ALIASES_RAW[k]; });

  // ========== [2] 검색 함수 래핑 ==========
  function makeAliasWrapped(origFn){
    if(typeof origFn !== 'function') return origFn;
    if(origFn.__aliasWrapped) return origFn;
    const wrapped = function(name, q){
      // 원본 검색 먼저
      const direct = origFn(name, q);
      if(direct > -1) return direct;
      // 정규화된 카드명으로 alias 조회
      const aliases = CARD_ALIASES[normKey(name)];
      if(!aliases) return -1;
      let best = -1;
      for(let i = 0; i < aliases.length; i++){
        const r = origFn(aliases[i], q);
        if(r > best) best = r;
      }
      return best;
    };
    wrapped.__aliasWrapped = true;
    return wrapped;
  }

  function installAll(){
    let installed = false;
    // getSearchRank
    if(typeof window.getSearchRank === 'function' && !window.getSearchRank.__aliasWrapped){
      const w = makeAliasWrapped(window.getSearchRank);
      window.getSearchRank = w;
      try { getSearchRank = w; } catch(_){}
      installed = true;
    }
    // getSearchRankFinal (이게 핵심. matchSearch가 이걸 씀)
    if(typeof window.getSearchRankFinal === 'function' && !window.getSearchRankFinal.__aliasWrapped){
      const w2 = makeAliasWrapped(window.getSearchRankFinal);
      window.getSearchRankFinal = w2;
      try { getSearchRankFinal = w2; } catch(_){}
      installed = true;
    }
    // matchSearch도 재설치 (getSearchRankFinal 기반으로)
    if(typeof window.getSearchRankFinal === 'function'){
      window.matchSearch = function(name, q){ return window.getSearchRankFinal(name, q) > -1; };
      window.matchesLoose = window.matchSearch;
    } else if(typeof window.getSearchRank === 'function'){
      window.matchSearch = function(name, q){ return window.getSearchRank(name, q) > -1; };
      window.matchesLoose = window.matchSearch;
    }
    return installed;
  }

  // 여러 타이밍에 반복 시도 (다른 스크립트들이 나중에 함수를 재정의할 수 있음)
  installAll();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', installAll);
  }
  [50, 200, 500, 1000, 2000, 4000].forEach(function(t){ setTimeout(installAll, t); });

  // 방어적: 주기적으로 체크해서 래핑이 풀렸으면 재설치
  let checkCount = 0;
  const interval = setInterval(function(){
    checkCount++;
    if(checkCount > 20){ clearInterval(interval); return; }
    const rankOk = !window.getSearchRank || window.getSearchRank.__aliasWrapped;
    const finalOk = !window.getSearchRankFinal || window.getSearchRankFinal.__aliasWrapped;
    if(!rankOk || !finalOk) installAll();
  }, 500);

  // ========== [3] 이미지 캐시 우회 ==========
  // 이번 업데이트 버전 태그. 새 이미지 올린 뒤에도 캐시된 옛 이미지가 보이면
  // 이 값을 바꾸면 됨 (날짜 같은 걸로 업데이트)
  const IMG_VERSION = '20260419b';

  function addCacheBuster(url){
    if(!url || typeof url !== 'string') return url;
    if(url.indexOf('cdn.jsdelivr.net/gh/elithelucky/sts2-images') === -1) return url;
    if(url.indexOf('?v=') !== -1 || url.indexOf('&v=') !== -1) return url; // 이미 있음
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + IMG_VERSION;
  }

  // HTMLImageElement.src setter를 가로채서 캐시버스터 자동 추가
  try {
    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if(desc && desc.set && !HTMLImageElement.prototype.__cacheBustInstalled){
      HTMLImageElement.prototype.__cacheBustInstalled = true;
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        get: function(){ return desc.get.call(this); },
        set: function(v){ desc.set.call(this, addCacheBuster(v)); },
        configurable: true
      });
    }
  } catch(_){}

  // 이미 DOM에 렌더된 기존 이미지들도 src 갱신
  function updateExistingImages(){
    try{
      const imgs = document.querySelectorAll('img');
      imgs.forEach(function(img){
        const cur = img.getAttribute('src');
        if(cur && cur.indexOf('cdn.jsdelivr.net/gh/elithelucky/sts2-images') !== -1 && cur.indexOf('v=') === -1){
          img.src = cur; // setter가 cache buster 붙임
        }
      });
    }catch(_){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', updateExistingImages);
  } else {
    updateExistingImages();
  }
  [200, 800, 2000].forEach(function(t){ setTimeout(updateExistingImages, t); });
})();
/* === script: pick-compositionend-clear-20260419-v2 === */
(function(){
  // Bug: Korean IME 입력 중(e.isComposing=true) 숫자키로 카드 픽 →
  // keyboard-pick-reset-fix 스킵 → 하위 핸들러가 픽 처리 후 __searchFlowPickLock=true 설정.
  // setTimeout(0)으로 락 해제가 등록되고, 그 다음 macrotask에서 compositionend 발생.
  // 이때 boolean lock은 이미 false → 기존 fix가 동작 안 함.
  //
  // Fix v2: Object.defineProperty로 __searchFlowPickLock / __searchFlowStableLock 할당을
  // 가로채 _pickTs 타임스탬프를 기록. compositionend 핸들러에서는 boolean이 아닌
  // 타임스탬프 기반(500ms 이내)으로 픽 직후 여부를 판별.
  var _pickTs = 0;

  function interceptLock(prop){
    var _val = window[prop];
    try {
      Object.defineProperty(window, prop, {
        configurable: true,
        enumerable: true,
        get: function(){ return _val; },
        set: function(v){
          _val = v;
          if(v === true) _pickTs = Date.now();
        }
      });
    } catch(_){}
  }
  interceptLock('__searchFlowPickLock');
  interceptLock('__searchFlowStableLock');

  function clearAndRender(){
    var inp = document.getElementById('modalInput');
    if(inp){
      try {
        var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if(d && d.set) d.set.call(inp, '');
        else inp.value = '';
      } catch(_){ inp.value = ''; }
      if(typeof inp.__searchQuery === 'string') inp.__searchQuery = '';
      inp.__isComposingSearch = false;
    }
    if(typeof window.renderSearchGrid === 'function') window.renderSearchGrid();
  }

  function bind(){
    var input = document.getElementById('modalInput');
    if(!input || input.__pickCompClearV2) return;
    input.__pickCompClearV2 = true;
    input.addEventListener('compositionend', function(){
      if(Date.now() - _pickTs > 500) return;
      // 픽 직후 compositionend — IME가 커밋한 텍스트를 즉시 지우고 전체 목록 렌더
      try {
        var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if(d && d.set) d.set.call(input, '');
        else input.value = '';
      } catch(_){ input.value = ''; }
      if(typeof input.__searchQuery === 'string') input.__searchQuery = '';
      input.__isComposingSearch = false;
      // bubbling 핸들러들이 이미 q='' 로 렌더되도록 동기로 비우고, setTimeout으로 재확인
      setTimeout(clearAndRender, 0);
    }, true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
  document.addEventListener('focusin', function(e){
    if(e.target && e.target.id === 'modalInput') bind();
  }, true);
})();
