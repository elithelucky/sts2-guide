// ═══════════════════════════════════════
// 점수
// ═══════════════════════════════════════

function getComboMatches(name,d){
  const full=[],partial=[];
  (d.combos||[]).forEach(cb=>{
    if(!listHasCard(cb.cards,name)) return;
    const others=cb.cards.filter(x=>x!==name);
    const have=others.filter(x=>deck.includes(x));
    if(have.length===others.length) full.push({cb,have,missing:[]});
    else if(have.length>0) partial.push({cb,have,missing:others.filter(x=>!deck.includes(x))});
  });
  return {full,partial};
}
function getCardBuildRefs(name,d){
  return (d.archs||[]).filter(a=>listHasCard(a.must,name)||listHasCard(a.rec,name));
}
function getRunStage(){
  const base=(START_DECKS[curChar]||[]).length||10;
  const added=Math.max(0,deck.length-base);
  const shopRuns=hist.filter(h=>Array.isArray(h.f)&&h.f.length===SHOP_SLOT_COUNT).length;
  const picked=hist.filter(h=>h.p && h.p!=='스킵').length;
  let score=added*10 + shopRuns*12 + picked*4;
  if(added<=4) score-=10;
  if(added>=10) score+=10;
  const stage=score<45?'early':(score<95?'mid':'late');
  return {score,added,shopRuns,picked,stage};
}
function isAct1Like(){
  return getRunStage().stage==='early';
}
const BUILD_COMPLETION_MEM={};

function buildScoreToPct(score,maxScore){
  if(!maxScore || maxScore<=0) return 0;
  return Math.round(Math.max(0, Math.min(100, (score/maxScore)*100)));
}
function normalizeCardName(name){
  return String(name||'').replace(/\s+/g,'').trim();
}
function sameCardName(a,b){
  return normalizeCardName(a)===normalizeCardName(b);
}
function deckHasCard(name, deckArr=deck){
  return Array.isArray(deckArr) && deckArr.some(x=>sameCardName(x,name));
}
function listHasCard(list, name){
  return Array.isArray(list) && list.some(x=>sameCardName(x,name));
}
function countDeckMatches(list, deckArr=deck){
  if(!Array.isArray(list) || !Array.isArray(deckArr)) return 0;
  return list.filter(n=>deckHasCard(n, deckArr)).length;
}
function getBuildScoreMap(){
  const map={};
  detectBuildScores().forEach(x=>{ map[x.id]=x; });
  return map;
}
function getBuildCompletionState(a,mh,rh){
  const d=D();
  const owned=new Set((Array.isArray(deck)?deck:[]).map(normalizeCardName));
  const must=(a.must||[]);
  const rec=(a.rec||[]);
  const uniqueNames=[...new Set([...must,...rec])];
  let score=0, maxScore=0;

  uniqueNames.forEach(name=>{
    const c=d.cards.find(x=>x.n===name)||{};
    const isMust=must.includes(name);
    const base = isMust ? 100 : 56;
    const impact = Math.min(38, Math.round((BUILD_POWER_BONUS[name]||0)*0.45));
    const tier = ({S:24,A:16,B:10,C:4,D:0}[c.tier]||0);
    const part = base + impact + tier;
    maxScore += part;
    if(owned.has(normalizeCardName(name))) score += part;
  });

  if(must.length && mh>=must.length) score += 10;
  if(must.length && mh>=must.length) maxScore += 10;

  let pct=buildScoreToPct(score,maxScore||1);
  if(score>0 && pct<6) pct=6;
  let level=1;
  if(pct>=100) level=5;
  else if(pct>=85) level=4;
  else if(pct>=60) level=3;
  else if(pct>=40) level=2;
  return {pct,level,score,maxScore};
}
function renderBuildCompletion(a,mh,rh){
  const st=getBuildCompletionState(a,mh,rh);
  const key=`${curChar}:${a.id}`;
  const prev=BUILD_COMPLETION_MEM[key];
  const rankUp=!!prev && st.level>prev.level;
  BUILD_COMPLETION_MEM[key]=st;
  const suffix=rankUp?'!':'';
  const perfect=st.pct>=100;
  return `<span class="build-completion level-${st.level}${rankUp?' rank-up':''}${perfect?' perfect':''}"><span class="flame-wrap"><span class="flame-burst"></span><span class="flame-ring"></span><span class="flame-sparks"></span><span class="flame-icon"></span></span><span class="completion-text">${t('guide.completion',{name:tn(a.name)})} <span class="percent">${st.pct}%</span>${suffix}</span>${perfect?'<span class="fireworks"></span>':''}</span>`;
}


const BUILD_POWER_BONUS={
  '지옥검무':90,'바리케이드':48,'창의적인 인공지능':44,'서브루틴':34,'카운트다운':42,'도망칠 수 없다':42,
  '서류 폭풍':38,'장막 관통자':38,'잿빛 혼령':34,'장송가':32,'무덤지기':32,'냉정함':26,'조각모음':26,
  '제압':26,'포악함':24,'파열':30,'불타는조약':30,'어둠의포옹':30,'창의적인 인공지능':44,'바리케이드':48
};
function buildTierBonus(t){ return ({S:36,A:18,B:8,C:0,D:-8}[t]||0); }
function buildRarityBonus(r){ return ({'레어':22,'언커먼':10,'커먼':0,'시작':-28}[r]||0); }
function buildStarterFactor(name,count){
  const starter=(START_DECKS[curChar]||[]).filter(x=>x===name).length;
  if(!starter) return count;
  const starterSeen=Math.min(count, starter);
  const extra=Math.max(0, count-starter);
  return starterSeen*0.12 + extra*1.0;
}
function detectBuildScores(){
  const d=D();
  const stage=getRunStage();
  const counts=deck.reduce((m,n)=>{ const k=normalizeCardName(n); m[k]=(m[k]||0)+1; return m; },{});
  return d.archs.map(a=>{
    let score=0, mh=0, rh=0, touched=0, anchor=0;
    const names=[...new Set([...(a.must||[]), ...(a.rec||[])])];
    names.forEach(name=>{
      const cnt=counts[normalizeCardName(name)]||0;
      if(!cnt) return;
      const card=d.cards.find(x=>x.n===name) || {};
      const inMust=(a.must||[]).includes(name);
      const factor=buildStarterFactor(name,cnt);
      if(!factor) return;
      if(inMust) mh += cnt; else rh += cnt;
      touched += factor;
      let w=(inMust?72:30) + buildTierBonus(card.tier) + buildRarityBonus(card.r) + (BUILD_POWER_BONUS[name]||0);
      if(stage.stage==='early'){
        if(inMust) w += 10;
        if(card.tier==='S') w += 8;
      }else if(stage.stage==='mid'){
        if(inMust) w += 4;
      }else{
        if(inMust) w += 8;
        if((a.rec||[]).includes(name)) w += 4;
      }
      if((BUILD_POWER_BONUS[name]||0) >= 60) anchor += 1;
      score += w * factor;
    });

    if(mh>0 && rh>0) score += 18;
    else if(mh>0) score += 10;
    else if(rh>=2) score += 8;

    // build density: cards already leaning into same build should matter
    score += touched * (stage.stage==='early' ? 5 : 8);

    // early sensitive start: a single strong S/필수 should already open the build
    if(stage.stage==='early' && mh>0) score += 12;
    if(stage.stage==='early' && anchor>0) score += 18 * anchor;

    return {id:a.id,score,mh,rh,touched,anchor};
  }).sort((a,b)=>b.score-a.score);
}
function detectBuild(){
  const scored=detectBuildScores();
  const top=scored[0];
  if(!top) return null;
  const minScore = getRunStage().stage==='early' ? 26 : 34;
  if(top.score < minScore) return null;
  return top.id;
}

function getActiveBuild(){return buildId||detectBuild()}


function scoreCard(name){
  const d=D();const c=getCardMeta(name);
  if(!c)return{score:0,reasons:['정보 없음'],tier:'?',warn:false,summary:'정보 없음',chips:[['mid','판단 보류']]};
  const activeBid=getActiveBuild();
  const activeBuild=activeBid?d.archs.find(x=>x.id===activeBid):null;
  const runStage=getRunStage();
  const ctx=detectRewardContext();
  let s=TS[c.tier]||0;const R=[];const chips=[];let warn=false;
  const dupes=deck.filter(x=>x===name).length;
  const totalCards=deck.length;
  const early=runStage.stage==='early';
  const mid=runStage.stage==='mid';
  const late=runStage.stage==='late';
  const combo=getComboMatches(name,d);
  const buildRefs=getCardBuildRefs(name,d);
  const inActive=!!(activeBuild&&(listHasCard(activeBuild.must,name)||listHasCard(activeBuild.rec,name)));
  const basicSet=new Set(BA());
  const cost=(typeof c.c==='number') ? c.c : (c.c==='X'?1:1);
  const cheap=cost<=1;
  const hasAny=(arr)=>arr.some(n=>deck.includes(n));
  const soulEnablers=['강탈','장송가','출몰','혼령 포획','강령회','분리'];
  const buildRefsAll=getCardBuildRefs(name,d);
  const mustRefs=buildRefsAll.filter(a=>listHasCard(a.must,name));
  const recRefs=buildRefsAll.filter(a=>listHasCard(a.rec,name));
  const anchorBonus=(BUILD_POWER_BONUS[name]||0);
  const highPowerSingles=new Set(['불사','지옥검무','바리케이드','창의적인 인공지능','권역']);
  const buildCommit=getBuildCommitLevel(activeBuild);

  if(curChar==='necro' && name==='영혼 폭풍' && !hasAny(soulEnablers)){
    s-=26; warn=true; chips.push(['bad','엔진 없음']); R.push('영혼 생성 카드가 아직 없어 기대값이 낮음');
  }

  if(activeBuild){
    if(listHasCard(activeBuild.must,name)){
      s += early ? 64 : 74;
      s += Math.round(anchorBonus*0.24);
      s += ({S:18,A:12,B:6,C:0,D:-6}[c.tier]||0);
      if(buildCommit>=4) s += 16;
      if(ctx.isBossReward) s += 34;
      chips.push(['good','필수']);
      R.push(`${activeBuild.name}${josa(activeBuild.name)} 잘 맞습니다`);
    }else if(listHasCard(activeBuild.rec,name)){
      s += early ? 30 : 40;
      s += Math.round(anchorBonus*0.18);
      s += ({S:16,A:12,B:6,C:0,D:-6}[c.tier]||0);
      if(buildCommit>=4) s += 22;
      if(buildCommit>=6) s += 14;
      if(ctx.isBossReward) s += 28;
      chips.push(['good','시너지']);
      R.push(`${activeBuild.name}${josa(activeBuild.name)} 잘 맞습니다`);
    }else if(buildRefs.length && !early){
      s-=12; warn=true; chips.push(['bad','오프빌드']); R.push(`지금 방향과는 거리 있음`);
    }
  }else{
    if(mustRefs.length){
      s+=26 + Math.round(anchorBonus*0.14); chips.push(['mid','빌드 시동']); R.push(t('reason.starterOpens',{name:tn(mustRefs[0].name)}));
    }else if(recRefs.length){
      s+=12 + Math.round(anchorBonus*0.10); chips.push(['mid','빌드 후보']); R.push(t('reason.candidateOf',{name:tn(recRefs[0].name)}));
    }
  }

  // same-build cards: value tier/impact more than just immediate combo
  if(combo.full.length){
    const comboBoost = inActive ? 20 : 58;
    s+=comboBoost;
    chips.push(['good', inActive ? '지금 강함' : '지금 강함']);
    R.push(inActive ? `${activeBuild.name}${josa(activeBuild.name)} 잘 맞습니다` : '지금 뽑으면 바로 강해집니다');
  }else if(combo.partial.length){
    const comboBoost = inActive ? 10 : 24;
    s+=comboBoost;
    chips.push(['mid','나중에 좋아짐']);
    R.push('후속 카드가 붙을수록 더 좋아집니다');
  }

  if(d.uni.includes(name) && dupes===0){
    s+=18; chips.push(['mid','범용']); R.push('단독 성능이 좋은 카드');
  }

  // single-card power exceptions
  if(highPowerSingles.has(name)){
    s += 42;
    if(early) s += 16;
    if(ctx.isBossReward) s += 14;
    chips.push(['mid','고점 카드']);
    R.push('카드 자체 체급이 높은 편');
  }

  if(early){
    if((c.tier==='S'||c.tier==='A') && dupes===0){
      s+=10;
      if(!chips.some(([k,v])=>['지금 강함','필수','강화','빌드 시동'].includes(v))) chips.push(['mid','초반 안정성']);
    }
    if(c.t==='공격' && cheap){ s+=12; if(!chips.some(([k,v])=>v==='초반 안정성')) chips.push(['mid','전투력']); }
    if(c.t==='스킬' && cheap && c.tier==='A') s+=4;
    if(c.t==='파워' && !combo.full.length && !inActive && c.tier!=='S' && !mustRefs.length && !highPowerSingles.has(name)){ s-=14; R.push('지금은 바로 강해지지 않음'); }
  }else if(mid){
    if(c.t==='파워' && inActive) s+=10;
    if(mustRefs.length) s+=8;
  }else if(late){
    if(c.t==='파워' && inActive) s+=12;
    if(combo.partial.length) s+=6;
  }

  // boss rewards should favor commitment over generic safe S picks
  if(ctx.isBossReward){
    if(activeBuild && buildCommit>=4){
      if(inActive) s += 24;
      else if(c.tier==='S') s -= 18;
    }
    if(activeBuild && (listHasCard(activeBuild.must,name) || listHasCard(activeBuild.rec,name))) {
      s += 18;
    }
  }

  if(totalCards>=18 && !inActive && !combo.full.length && c.tier!=='S' && !mustRefs.length && !highPowerSingles.has(name)){
    s-=18; warn=true; chips.push(['bad','덱 오염']); R.push('덱이 커져서 회전이 느려짐');
  }else if(totalCards>=15 && !inActive && !combo.full.length && c.tier==='B' && !mustRefs.length && !highPowerSingles.has(name)){
    s-=8; R.push('지금은 우선순위 낮음');
  }

  if(dupes>=2){
    s-=55; warn=true; chips.push(['bad','중복']); R.push(`이미 ${dupes}장 보유`);
  }else if(dupes===1){
    if(['폼멜타격','촉진제','촉매','계산된 도박','곡예','서류 폭풍','반향'].includes(name)){
      s+=6; R.push('2장째도 고려 가능');
    }else{
      s-=26; warn=true; chips.push(['bad','중복']); R.push('이미 1장 있음');
    }
  }

  if(c.tier==='D'){s-=25;warn=true;chips.push(['bad','기본 카드']);R.push('기본 카드는 줄이는 편이 좋음')}
  if(basicSet.has(name) && totalCards>10){s-=20;warn=true; if(!R.some(r=>r.includes('기본'))) R.push('기본 카드는 교체 대상');}

  if(!R.length) R.push(c.tip||'무난한 카드');
  R.splice(0,2);
  let summary='지금 뽑아도 무난함';
  if(chips.some(c=>c[1]==='필수')) summary='이 카드들이 없으면 빌드가 완성되지 않습니다';
  else if(chips.some(c=>c[1]==='시너지')) summary='이 카드들이 모일수록 빌드가 제대로 굴러가기 시작합니다';
  else if(chips.some(c=>c[1]==='지금 강함')) summary='지금 뽑으면 바로 강해집니다';
  else if(chips.some(c=>c[1]==='빌드 시동')) summary='지금 집으면 한 빌드 방향을 열기 좋음';
  else if(chips.some(c=>c[1]==='빌드 후보')) summary='후속 카드가 붙으면 빌드 후보가 될 수 있음';
  else if(chips.some(c=>c[1]==='오프빌드')) summary='덱과는 다르지만 성능이 강함';
  else if(chips.some(c=>c[1]==='엔진 없음')) summary='핵심 재료가 없어 지금은 기대값이 낮음';
  else if(chips.some(c=>c[1]==='전투력')||chips.some(c=>c[1]==='초반 안정성')) summary='초반 전투력 보강용으로 좋음';
  else if(chips.some(c=>c[1]==='덱 오염')) summary='지금은 넣을수록 덱이 무거워짐';
  return {score:s,reasons:R,tier:c.tier,warn,summary,chips};
}
