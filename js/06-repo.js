// ═══════════════════════════════════════
// GitHub repo 기반 카드 보강 / 유물 이미지
// ═══════════════════════════════════════
const REPO_API='https://api.github.com/repos/elithelucky/sts2-images/contents/';
let REPO_LOADED=false;
let REPO_CARD_NAMES_BY_CHAR={ironclad:[],silent:[],defect:[],necro:[],regent:[]};
let REPO_RELIC_NAMES=[];
let REPO_RELIC_SET=new Set();
function normalizeCardName(s){return (s||'').replace(/\s+/g,'').replace(/[!'?.,:+\-]/g,'')}

// 유물 이미지 매핑: 한글 유물명(공백제거) → 이미지 파일명
const RELIC_IMG_BASE = isLocalLang ? '../images/common/sts2_relics_only/' : 'images/common/sts2_relics_only/';
const RELIC_IMG_MAP = {
  '종이개구리':'StS2 PaperPhrog.webp',
  '구슬주머니':'StS2 BagofMarbles.webp',
  '핸드드릴':'StS2 HandDrill.webp',
  '타격용인형':'StS2 StrikeDummy.webp',
  '펀치대거':'StS2 PunchDagger.webp',
  '멈추지않는팽이':'StS2 UnceasingTop.webp',
  '카론의재':'StS2 CharonsAshes.webp',
  '데드브랜치':'StS2 Driftwood.png',
  '마른가지':'StS2 Driftwood.png',
  '텅스텐막대':'StS2 TungstenRod.webp',
  '붉은해골':'StS2 RedSkull.webp',
  '피가담긴병':'StS2 BloodVial.webp',
  '악마의혓바닥':'StS2 DemonTongue.webp',
  '병법서':'StS2 ArtofWar.webp',
  '얼어붙은알':'StS2 FrozenEgg.webp',
  '기묘하게매끄러운돌':'StS2 OddlySmoothStone.webp',
  '완갑':'StS2 Gorget.webp',
  '팅샤':'StS2 Tingsha.webp',
  '도박용칩':'StS2 GamblingChip.webp',
  '질긴붕대':'StS2 ToughBandages.webp',
  '편지칼':'StS2 LetterOpener.webp',
  '꼬인깔때기':'StS2 TwistedFunnel.webp',
  '사슬낫':'StS2 Kusarigama.webp',
  '장식용부채':'StS2 OrnamentalFan.webp',
  '수리검':'StS2 Shuriken.webp',
  '표창':'StS2 Kunai.webp',
  '나선형다트':'StS2 HelicalDart.webp',
  '뱀머리해골':'StS2 SneckoSkull.webp',
  '독병':'StS2 RoyalPoison.webp',
  '데이터디스크':'StS2 DataDisk.webp',
  '삽입케이블':'StS2 Gold-PlatedCables.webp',
  '냉각코어':'StS2 CrackedCore.webp',
  '닌자계란':'StS2 NinjaScroll.webp',
  '게임용말':'StS2 GamePiece.webp',
  '뼈피리':'StS2 BoneFlute.webp',
  '장례가면':'StS2 FuneraryMask.webp',
  '책수리용칼':'StS2 BookRepairKnife.webp',
  '상아타일':'StS2 IvoryTile.webp',
  '큰모자':'StS2 BigHat.webp',
  '책갈피':'StS2 Bookmark.webp',
  '저주인형':'StS2 MrStruggles.webp',
  '은하먼지':'StS2 GalacticDust.webp',
  '달모양페스츄리':'StS2 LunarPastry.webp',
  '미니리젠트':'StS2 MiniRegent.webp',
  '검술안내서':'StS2 FencingManual.webp',
  '날카로운이빨':'StS2 RazorTooth.webp',
};
function relicImgSrc(name){
  const norm=(name||'').replace(/\s+/g,'').replace(/[!'?.,:+\-]/g,'');
  const mapped=RELIC_IMG_MAP[norm];
  if(mapped) return RELIC_IMG_BASE+encodeURIComponent(mapped);
  return RELIC_IMG_BASE+encodeURIComponent('StS2 '+norm)+'.webp';
}
function makeRelicImg(name){const img=document.createElement('img');img.className='relic-tile-img';img.loading='lazy';img.onerror=function(){const ph=document.createElement('div');ph.className='relic-tile-ph';ph.textContent=t('relic.name');this.replaceWith(ph)};img.src=relicImgSrc(name);return img}
async function enrichCardsFromRepo(){
  if(REPO_LOADED) return;
  try{
    const res=await fetch(REPO_API);
    if(!res.ok) return;
    const files=await res.json();
    const suffixToChar={Ironclad:'ironclad',Silent:'silent',Defect:'defect',Necrobinder:'necro',Regent:'regent'};
    const byChar={ironclad:IC_CARDS,silent:SI_CARDS,defect:DE_CARDS,necro:NE_CARDS,regent:RE_CARDS};
    const repoNames={ironclad:[],silent:[],defect:[],necro:[],regent:[]};
    const relicNames=[];

    (files||[]).forEach(f=>{
      if(!f.name || !/\.webp$/i.test(f.name)) return;
      const base=f.name.replace(/\.webp$/i,'');
      const m=base.match(/^(.+?)_(Ironclad|Silent|Defect|Necrobinder|Regent)$/);
      if(m){
        const rawName=m[1];
        const charKey=suffixToChar[m[2]];
        repoNames[charKey].push(rawName);
      }else{
        relicNames.push(base);
      }
    });

    REPO_RELIC_NAMES=[...new Set(relicNames)];
    REPO_RELIC_SET=new Set(REPO_RELIC_NAMES.map(normalizeCardName));

    Object.entries(byChar).forEach(([charKey,arr])=>{
      const metaByNorm=new Map(arr.map(c=>[normalizeCardName(c.n),c]));
      const unique=[];
      const seen=new Set();
      repoNames[charKey].forEach(name=>{
        const clean=normalizeCardName(name);
        if(seen.has(clean)) return;
        seen.add(clean);
        unique.push(metaByNorm.get(clean)||{n:name,c:'?',t:'카드',r:'기타',tier:'B',tip:'정보 준비중'});
      });
      arr.splice(0,arr.length,...unique.sort((a,b)=>a.n.localeCompare(b.n,'ko')));
      REPO_CARD_NAMES_BY_CHAR[charKey]=unique.map(c=>c.n);
    });
    REPO_LOADED=true;
  }catch(e){console.warn('repo enrich failed',e)}
}
function buildRelicItems(build){
  const relics=BUILD_RELICS[build.id]||[];
  return relics.map(r=>{
    const parts=r.split(' — ');
    return {name:parts[0].trim(),desc:parts.slice(1).join(' — ').trim()};
  }).filter(r=>!REPO_LOADED || REPO_RELIC_SET.has(normalizeCardName(r.name)));
}
function openRelicDetail(name,desc=''){
  const modal=document.getElementById('detailModal');
  detailStack=[];
  const body=document.getElementById('detailBody');
  if(modal.classList.contains('open')){
    detailStack.push({html:body.innerHTML,mode:modal.dataset.mode||''});
  }
  let h='';
  h+=`<img class="detail-img" src="${relicImgSrc(name)}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div class=\'relic-tile-ph\' style=\'width:100%;height:140px;margin-bottom:14px\'>${t('relic.name')}</div>')"><div class="detail-name">${tn(name)}</div>`;
  h+=`<div class="detail-meta"><span class="detail-chip" style="background:var(--bd2);color:var(--sub)">${t('relic.recommended')}</span></div>`;
  if(desc)h+=`<div class="detail-section"><div class="detail-label">${t('guide.effectReason')}</div><div class="detail-text">${td(desc)}</div></div>`;
  h+=`<button class="detail-close" onclick="closeDetail()">${t('common.close')}</button>`;
  body.innerHTML=h;
  modal.classList.add('open');
  modal.dataset.mode='relic';
  updateBodyLock();
}

function attachCharRowDrag(){
  const row=document.getElementById('charRow');
  if(!row || row.dataset.dragBound==='1') return;
  row.dataset.dragBound='1';
  let isDown=false,startX=0,startLeft=0,moved=false;
  const end=()=>{isDown=false;row.classList.remove('dragging')};
  row.addEventListener('mousedown',e=>{
    isDown=true; moved=false; startX=e.pageX; startLeft=row.scrollLeft; row.classList.add('dragging');
  });
  row.addEventListener('mousemove',e=>{
    if(!isDown) return;
    const dx=e.pageX-startX;
    if(Math.abs(dx)>4) moved=true;
    row.scrollLeft=startLeft-dx;
  });
  row.addEventListener('mouseleave',end);
  window.addEventListener('mouseup',end);
  row.addEventListener('click',e=>{ if(moved) { e.preventDefault(); e.stopPropagation(); moved=false; } }, true);
}

