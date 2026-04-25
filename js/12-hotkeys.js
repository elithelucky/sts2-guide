// ═══════════════════════════════════════
// 단축키 시스템 (단일 소스)
// ═══════════════════════════════════════
(function(){
  /* ── 유틸리티 ── */
  function digitFromEvent(e){
    if(!e) return '';
    if(e.code && /^Digit[1-9]$/.test(e.code)) return e.code.replace('Digit','');
    if(e.code && /^Numpad[1-9]$/.test(e.code)) return e.code.replace('Numpad','');
    var k = String(e.key || '');
    return /^[1-9]$/.test(k) ? k : '';
  }
  function altDigitFromEvent(e){
    if(!e) return '';
    if(e.code && /^Digit[1-4]$/.test(e.code)) return e.code.replace('Digit','');
    if(e.code && /^Numpad[1-4]$/.test(e.code)) return e.code.replace('Numpad','');
    if(/^[1-4]$/.test(e.key)) return e.key;
    return '';
  }
  function isSearchModalOpen(){
    var modal = document.getElementById('searchModal');
    return !!(modal && modal.classList.contains('open'));
  }
  function blockEvent(e){
    if(!e) return;
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  }
  function now(){
    return (window.performance && typeof performance.now === 'function') ? performance.now() : Date.now();
  }

  /* ── 상태 (dedup guard) ── */
  var state = {
    keyHeld: new Set(),
    dispatchLockUntil: 0,
    lastEventStamp: null
  };

  var scopeMap = {'1':'all','2':'current','3':'colorless','4':'other'};

  /* ── window capture: 숫자키 1-9 카드 선택 + Alt+1-4 스코프 전환 ── */
  // window capture은 document/input capture보다 먼저 실행되므로
  // input의 onSearchShortcut이 Alt를 먹기 전에 여기서 처리
  window.addEventListener('keydown', function(e){
    if(!isSearchModalOpen()) return;
    if(e.ctrlKey || e.metaKey) return;

    // ── Alt+숫자 → 스코프 전환 ──
    if(e.altKey){
      var altDigit = altDigitFromEvent(e);
      var nextScope = altDigit ? scopeMap[altDigit] : null;
      if(!nextScope) return;

      blockEvent(e);

      // colorless-only 슬롯 제약 체크
      var sf = window.__searchFlow || window.__searchFlowStableV4;
      if(sf && typeof sf.isColorlessOnlySlot === 'function'){
        if(sf.isColorlessOnlySlot() && nextScope !== 'colorless') return;
      } else if(typeof mode !== 'undefined' && mode === 'shop' &&
                typeof isShopColorlessSlot === 'function' &&
                typeof activeSlot !== 'undefined' &&
                isShopColorlessSlot(activeSlot) &&
                nextScope !== 'colorless'){
        return;
      }

      // SearchFlow 상태 업데이트 (slotIndex 건드리지 않음)
      if(sf && sf.state){
        sf.state.scope = nextScope;
        if(typeof sf.syncToGlobals === 'function') sf.syncToGlobals();
        else if(typeof sf.syncGlobals === 'function') sf.syncGlobals();
        if(typeof sf.render === 'function') sf.render();
      } else {
        window.searchScope = nextScope;
        if(typeof window.renderSearchGrid === 'function') window.renderSearchGrid();
      }
      return;
    }

    // ── 숫자키 1-9 → 카드 선택 ──
    // IME 조합 중(ㄱㅌ + 1)에도 숫자키는 카드 선택 우선
    // e.code로 물리 키를 판별하므로 isComposing 무시
    var digit = digitFromEvent(e);
    if(!digit) return;

    // 항상 이벤트를 소유하여 하위 중복 핸들러 차단
    blockEvent(e);

    // auto-repeat / held key / duplicate dispatch 방지
    if(e.repeat) return;
    if(state.keyHeld.has(digit)) return;
    var stamp = String(e.timeStamp || '') + '|' + digit;
    if(state.lastEventStamp === stamp) return;
    var t = now();
    if(t < state.dispatchLockUntil) return;

    state.keyHeld.add(digit);
    state.lastEventStamp = stamp;
    state.dispatchLockUntil = t + 60;

    var idx = Number(digit) - 1;
    var acts = Array.isArray(window.searchResultAction) ? window.searchResultAction : [];
    var fn = acts[idx];
    if(typeof fn !== 'function') return;

    try {
      fn();
    } finally {
      setTimeout(function(){
        state.dispatchLockUntil = 0;
      }, 0);
    }
  }, true);

  window.addEventListener('keyup', function(e){
    var digit = digitFromEvent(e);
    if(digit) state.keyHeld.delete(digit);
  }, true);

  window.addEventListener('blur', function(){
    state.keyHeld.clear();
    state.lastEventStamp = null;
    state.dispatchLockUntil = 0;
  }, true);

  /* ── export ── */
  window.HotkeyMap = {
    digitKeys: '1-9: 검색 결과 카드 선택',
    altScope: 'Alt+1: 전체, Alt+2: 현재 클래스, Alt+3: 중립, Alt+4: 기타',
    global: 'Q: 보상, W: 상점, E: 검색, R: 덱추가, `: 스킵, Esc: 닫기'
  };
  window.Hotkeys = {
    digitFromEvent: digitFromEvent,
    isSearchModalOpen: isSearchModalOpen,
    blockEvent: blockEvent
  };
})();
