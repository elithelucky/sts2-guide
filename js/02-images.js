// ═══════════════════════════════════════
// 이미지
// ═══════════════════════════════════════
// 로컬 이미지 사용 감지 (ko/ 또는 en/ 폴더에서 실행 시)
const isLocalLang = window.location.pathname.includes('/ko/') || window.location.pathname.includes('/en/');
const currentLang = window.location.pathname.includes('/ko/') ? 'ko' : window.location.pathname.includes('/en/') ? 'en' : '';
const IMG = isLocalLang ? `../images/${currentLang}/` : 'https://cdn.jsdelivr.net/gh/elithelucky/sts2-images@latest/';

// 이미지 로드 실패 추적
const IMAGE_LOAD_FAILURES = [];
function trackImageFailure(cardName, charKey, attemptedPaths) {
  const failure = {
    cardName,
    charKey,
    attemptedPaths,
    timestamp: new Date().toISOString()
  };
  IMAGE_LOAD_FAILURES.push(failure);
  console.warn('🖼️ 이미지 로드 실패:', cardName, '('+charKey+')', attemptedPaths);
}

// 실패 리포트 출력
window.getImageFailureReport = function() {
  console.log('\n=== 이미지 로드 실패 리포트 ===');
  console.log('총 실패 카드 수:', IMAGE_LOAD_FAILURES.length);

  if (IMAGE_LOAD_FAILURES.length === 0) {
    console.log('✅ 모든 이미지가 정상적으로 로드되었습니다!');
    return;
  }

  // MANIFEST에 없는 카드만 필터링
  const missingFromManifest = IMAGE_LOAD_FAILURES.filter(fail => {
    if(!fail.attemptedPaths || fail.attemptedPaths.length === 0) return true;
    return fail.attemptedPaths.length === 0; // 빈 배열 = MANIFEST 없음
  });

  console.log('MANIFEST에 없는 카드:', missingFromManifest.length, '개');
  console.log('\n실패한 카드 목록:');
  IMAGE_LOAD_FAILURES.forEach((fail, idx) => {
    const inManifest = fail.attemptedPaths && fail.attemptedPaths.length > 0;
    console.log(`\n${idx + 1}. ${fail.cardName} (${fail.charKey}) ${inManifest ? '📁' : '❌ MANIFEST 없음'}`);
    if(fail.attemptedPaths && fail.attemptedPaths.length > 0) {
      console.log('   시도한 경로:', fail.attemptedPaths[0]);
    }

    // MANIFEST 확인
    if (typeof _CARD_IMAGE_MAP !== 'undefined' && _CARD_IMAGE_MAP) {
      const key1 = fail.cardName + '__' + fail.charKey;
      const key2 = fail.cardName;
      const mapped1 = _CARD_IMAGE_MAP[key1];
      const mapped2 = _CARD_IMAGE_MAP[key2];
      if(!mapped1 && !mapped2) {
        console.log('   ❌ MANIFEST에 없음');
      }
    }
  });

  console.log('\n=== 📋 MANIFEST에 추가 필요한 카드 ===');
  const uniqueCards = [...new Set(IMAGE_LOAD_FAILURES.map(f => `${f.cardName} (${f.charKey})`))];
  console.log(uniqueCards.join('\n'));

  return IMAGE_LOAD_FAILURES;
};
const SUFFIX_MAP={ironclad:'Ironclad',silent:'Silent',defect:'Defect',necro:'Necrobinder',regent:'Regent',colorless:'Colorless'};
function imgBaseName(name){return (name||'').replace(/\s+/g,'').replace(/[''!?]/g,'')}
function getCardOwner(name, preferredChar=curChar){
  const preferred=ALL[preferredChar];
  if(preferred&&preferred.cards&&preferred.cards.some(x=>x.n===name)) return preferredChar;
  if(typeof COLORLESS_CARDS!=='undefined' && COLORLESS_CARDS.some(x=>x.n===name)) return 'colorless';
  for(const [charKey,data] of Object.entries(ALL)){
    if(data&&data.cards&&data.cards.some(x=>x.n===name)) return charKey;
  }
  return preferredChar||'ironclad';
}
function findRepoCardByName(name, preferredChar=curChar){
  try{
    if(!(typeof REPO_POOLS!=='undefined' && REPO_POOLS)) return null;
    const nn = (typeof norm==='function') ? norm(name) : String(name||'').replace(/\s+/g,'').trim().toLowerCase();
    const same = (c) => (c && (c.__norm===nn || ((c.n||'').replace(/\s+/g,'').toLowerCase()===nn)));
    const preferredOrder = [];
    if(preferredChar && preferredChar !== 'colorless') preferredOrder.push(preferredChar);
    preferredOrder.push('ironclad','silent','defect','necro','regent');
    const classOrder = [...new Set(preferredOrder)];
    for(const k of classOrder){
      const exactClass = (REPO_POOLS[k]||[]).find(same);
      if(exactClass && exactClass.filename) return exactClass;
    }
    const exactColorless = (REPO_POOLS.colorless||[]).find(same);
    if(exactColorless && exactColorless.filename) return exactColorless;
  }catch(e){}
  return null;
}
function findLocalFilename(name, charKey){
  if(!isLocalLang) return null;

  // MANIFEST 사용 (우선순위)
  if(typeof findManifestByName === 'function'){
    const manifest = findManifestByName(name, charKey);
    if(manifest && manifest.final_filename){
      const filename = currentLang === 'en' ? manifest.final_filename : manifest.final_filename.replace(/\.png$/, '.webp');
      return manifest.folder + '/' + filename;
    }
  }

  // fallback: LOCAL_FILENAMES 사용
  if(typeof LOCAL_FILENAMES === 'undefined') return null;
  const files = LOCAL_FILENAMES[currentLang];
  if(!files) return null;

  const charFolder = charKey === 'colorless' ? 'colorless_playable' : charKey;
  const charFiles = files[charFolder];
  if(!charFiles) return null;

  const normalized = (name||'').replace(/\s+/g,'').toLowerCase();

  for(const filename of charFiles){
    const filepart = filename.replace('card_'+charKey+'_', '').toLowerCase();
    if(filepart === normalized || filename.toLowerCase().includes(normalized)){
      const fallbackExt = currentLang === 'en' ? '.png' : '.webp';
      return charFolder + '/' + filename + fallbackExt;
    }
  }
  return null;
}

function imgSrcs(name, preferredChar=curChar){
  // 로컬 이미지 경로 (ko/ 또는 en/ 폴더) - MANIFEST 사용
  if(isLocalLang && typeof _buildCardImageMap === 'function'){
    if(!_CARD_IMAGE_MAP) _buildCardImageMap();
    const normalized = (typeof _normalizeKorean === 'function') ? _normalizeKorean(name) : name;
    const key = normalized + '__' + preferredChar;
    const filename = _CARD_IMAGE_MAP[key] || _CARD_IMAGE_MAP[normalized];
    if(filename){
      // MANIFEST에서 folder 정보 찾기
      const manifest = findManifestByName(name, preferredChar);
      if(manifest && manifest.folder){
        return [IMG + manifest.folder + '/' + filename];
      }
      // folder 정보 없으면 추측
      const charFolder = preferredChar === 'colorless' ? 'colorless_playable' : (preferredChar === 'necro' ? 'necrobinder' : preferredChar);
      return [IMG + charFolder + '/' + filename];
    }
  }

  // CDN 방식 (원본)
  const base=imgBaseName(name);
  const exact = findRepoCardByName(name, preferredChar);
  if(exact && exact.filename){
    if(exact.__kind==='colorless') return [IMG + encodeURIComponent(exact.filename)];
    return [IMG + encodeURIComponent(exact.filename), IMG+encodeURIComponent(base+'_Colorless')+'.webp'];
  }
  const owner=getCardOwner(name,preferredChar);
  if(owner==='colorless'){
    return [IMG+encodeURIComponent(base+'_Colorless')+'.webp'];
  }
  const suf=SUFFIX_MAP[owner]||SUFFIX_MAP[preferredChar]||SUFFIX_MAP[curChar]||'Ironclad';
  return [IMG+encodeURIComponent(base+'_'+suf)+'.webp', IMG+encodeURIComponent(base+'_Colorless')+'.webp'];
}
function imgSrcsForChar(name,charKey){
  return imgSrcs(name, charKey);
}
function getCardByChar(charKey,name){
  if(charKey==='colorless') return (typeof COLORLESS_CARDS!=='undefined'?COLORLESS_CARDS:[]).find(x=>x.n===name)||null;
  const data=ALL[charKey];return data&&data.cards?data.cards.find(x=>x.n===name):null
}
function openCoopGuide(id){
  const guide=COOP_GUIDES.find(x=>x.id===id); if(!guide) return;
  detailStack=[];
  const body=document.getElementById('detailBody');
  const modal=document.getElementById('detailModal');
  const esc=(s='')=>String(s).replace(/'/g,'&#39;');
  const byChar=(guide.must||[]).concat(guide.rec||[]).reduce((acc,item)=>{(acc[item.char]=acc[item.char]||[]).push(item);return acc;},{});
  const cardTile=(item)=>{
    const srcs=imgSrcsForChar(item.name,item.char);
    const charName=(CHARS[item.char]&&CHARS[item.char].name)||item.char;
    const unlockCond=UNLOCK[item.name];
    return `<button class="mini-card" onclick="showAnyCardDetail('${esc(item.name)}','${item.char}')"><img src="${srcs[0]}" onerror="if(!this.dataset.f1){this.dataset.f1='1';this.src='${srcs[1]}';return;} this.onerror=null;this.src='${srcs[2]||srcs[1]}'"><div class="mini-name">${unlockCond?'<div class=\"mini-lock\">🔒</div>':''}<div>${tn(item.name)}</div><div class="mini-meta-pill"><span class="coop-pill sm" style="--cc:${(CHARS[item.char]&&CHARS[item.char].color)||'#888'}"><img src="${profileImgSrc(item.char)}" onerror="this.onerror=null;this.style.display='none'"></span></div></div></button>`;
  };
  let h='';
  h+=`<button class="detail-top-close" onclick="closeDetail()">✕</button>`;
  h+=renderCoopTitleButtons(guide);
  h+=`<div class="detail-text" style="margin-top:8px">${td(guide.desc||'')}</div>`;
  h+=`<div class="detail-chip-row" style="margin-top:10px;margin-bottom:18px"><span class="badge good">${td(guide.meta||'')}</span></div>`;
  h+=`<div class="detail-two-col">`;
  h+=`<div class="guide-group core" style="margin-top:0;"><div class="guide-group-title">${t('guide.coreCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('multi.mustDesc')}</div><div class="mini-grid">${(guide.must||[]).map(cardTile).join('')}</div></div>`;
  h+=`<div class="guide-group key" style="margin-top:0;"><div class="guide-group-title">${t('guide.synergyCards')}</div><div class="ref-mini-desc" style="color:color-mix(in srgb,var(--sub) 88%, #000 12%);margin-bottom:18px">${t('guide.synergyDesc')}</div><div class="mini-grid">${(guide.rec||[]).map(cardTile).join('')}</div></div>`;
  h+=`</div>`;
  const sections=Object.entries(byChar).map(([charKey,items])=>`<div class="guide-group compact-section" style="border-width:2px"><div class="guide-group-title">${t('multi.sideFromChar',{name:tn(CHARS[charKey]?.name||charKey)})}</div><div class="mini-grid">${items.map(cardTile).join('')}</div></div>`).join('');
  if(sections){h+=`<div class="guide-divider"></div><div class="detail-secondary-grid">${sections}</div>`;}
  if((guide.tips||[]).length){
    h+=`<div class="guide-divider"></div><div class="guide-group"><div class="guide-group-title">${t('guide.ops')}</div><div class="detail-section" style="padding:0;border:none;background:none">${guide.tips.map(tip=>`<div class="detail-text" style="margin-top:0;margin-bottom:10px">• ${td(tip)}</div>`).join('')}</div></div>`;
  }
  h+=`<button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
  body.innerHTML=h; modal.classList.add('open'); updateBodyLock();
}
function showAnyCardDetail(name,charKey){
  const prev=curChar;
  curChar=charKey;
  showDetail(name);
  curChar=prev;
}
function makeImg(name,el,preferredChar=curChar){
  const srcs=imgSrcs(name, preferredChar);
  const img=document.createElement('img');
  img.loading='lazy';
  img.classList.add('img-loading');
  img.dataset.tries='0';
  img.dataset.cardName=name;
  img.dataset.charKey=preferredChar;

  img.onload=function(){
    this.classList.remove('img-loading');
  };

  img.onerror=function(){
    const t=parseInt(this.dataset.tries)+1;
    if(t<srcs.length){
      this.dataset.tries=t;
      this.src=srcs[t];
    }else{
      // 모든 경로 시도 실패 - 추적
      trackImageFailure(this.dataset.cardName, this.dataset.charKey, srcs);

      const ph=document.createElement('div');
      ph.className=el==='sg'?'sg-ph':el==='dk'?'dk-ph':'';
      ph.textContent=name.slice(0,2);
      this.replaceWith(ph);
    }
  };

  img.src=srcs[0];
  return img;
}
function profileImgSrc(charKey){
  const f=(CHARS[charKey]&&CHARS[charKey].profile)||'';
  // 로컬 이미지일 경우 프로필 이미지도 로컬 경로 사용
  if(isLocalLang && f){
    return IMG+encodeURIComponent(f);
  }
  return IMG+encodeURIComponent(f);
}
function getCoopChars(guide){const seen=[];[...(guide.must||[]),...(guide.rec||[])].forEach(item=>{if(item&&item.char&&!seen.includes(item.char))seen.push(item.char)});return seen}
function renderCoopTitleButtons(guide){const keys=getCoopChars(guide);if(!keys.length) return `<div class="coop-title">${tn(guide.name)}</div>`;return `<div class="coop-title-bar">`+keys.map((key,idx)=>{const v=CHARS[key]||{name:key,color:'#888'};return `<div class="coop-pill" style="--cc:${v.color}"><img src="${profileImgSrc(key)}" onerror="this.onerror=null;this.style.display='none'"><span>${tn(v.name)}</span></div>`+(idx<keys.length-1?`<span class="coop-title-plus">+</span>`:'')}).join('')+`</div>`}
function getVisibleCoopGuides(){return COOP_GUIDES.filter(g=>getCoopChars(g).includes(curChar))}

