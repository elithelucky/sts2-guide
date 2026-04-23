// ═══════════════════════════════════════
// 상태
// ═══════════════════════════════════════
let curChar='ironclad';
let buildId=null;
let deck=[...START_DECKS.ironclad];
let picks=['','',''];
var mode='reward';
let currentTab='live';
let detailStack=[];
let __lockY=0;
function updateBodyLock(){
  const opened=!!document.querySelector('.modal-bg.open');
  if(opened && !document.body.classList.contains('modal-lock')){
    window.__scrollY=window.scrollY||window.pageYOffset||0;
    document.body.classList.add('modal-lock');
    document.body.style.top=`-${window.__scrollY}px`;
  }else if(!opened && document.body.classList.contains('modal-lock')){
    const y=Math.abs(parseInt(document.body.style.top||'0',10))||window.__scrollY||0;
    document.body.classList.remove('modal-lock');
    document.body.style.top='';
    window.scrollTo(0,y);
  }
}
let deckAddMode=false;
let activeSlot=-1;
let hist=[];
let __deckSeq=1;
let deckIds=(START_DECKS[curChar]||[]).map(()=>__deckSeq++);
let lastActionMessage='';
let lastActionKind='';
let recentAddedDeckId=null;
var upgradedIds = new Set();
window.upgradedIds = upgradedIds;
let deckOpen=true;
let selectedDeckIdx=-1;
function josa(word,a='와',b='과'){const s=String(word||''); if(!s) return a; const ch=s.charCodeAt(s.length-1)-44032; if(ch<0||ch>11171) return a; return (ch%28===0)?a:b;}
function isUpgradedCardIdx(idx){
  if(!(upgradedIds instanceof Set)){
    upgradedIds = new Set(Array.isArray(upgradedIds) ? upgradedIds : []);
    window.upgradedIds = upgradedIds;
  }
  return upgradedIds.has(idx);
}
function pushDeckCard(name){ deck.push(name); const newId=__deckSeq++; deckIds.push(newId); recentAddedDeckId=newId; }
function setLastAction(message, kind='info'){ lastActionMessage=message; lastActionKind=kind; }
function clearLastAction(){ lastActionMessage=''; lastActionKind=''; }
function removeDeckCardAt(idx){
  deck.splice(idx,1);
  if(!(upgradedIds instanceof Set)){
    upgradedIds = new Set(Array.isArray(upgradedIds) ? upgradedIds : []);
    window.upgradedIds = upgradedIds;
  }
  upgradedIds = new Set(
    Array.from(upgradedIds)
      .filter(x => x !== idx)
      .map(x => x > idx ? x - 1 : x)
  );
  selectedDeckIdx=-1;
  renderAll();
}
function josa(word,a='와',b='과'){const s=String(word||''); if(!s) return a; const ch=s.charCodeAt(s.length-1)-44032; if(ch<0||ch>11171) return a; return (ch%28===0)?a:b;}
function BA(){return BASIC_CARDS[curChar]}

const CLASS_INTRO={
  ironclad:'전투 후 회복 능력을 가진 전사. 힘을 키우거나 카드를 소멸시켜 이득을 만든다.',
  silent:'',
  defect:'전기·냉기·암흑 구체와 집중으로 자동 피해와 방어를 쌓는다.',
  necro:'오스티, 혈마법, 무덤(소멸 더미) 조작으로 고점을 만든다.',
  regent:'별과 제련으로 장기전 고점을 만들고 통치자의 검을 피니셔로 쓴다.'
};
const COOP_GUIDES=[
  {
    id:'ic_si',
    name:'아이언클래드 + 사일런트',
    desc:'아이언클래드가 앞에서 맞아주고, 사일런트가 뒤에서 드로우·버리기·독으로 누적 딜을 만든다.',
    meta:'탱킹 + 드로우 순환 + 독 마무리',
    must:[
      {name:'바리케이드',char:'ironclad'},
      {name:'몸통박치기',char:'ironclad'},
      {name:'촉진제',char:'silent'},
      {name:'유독 가스',char:'silent'}
    ],
    rec:[
      {name:'격노',char:'ironclad'},
      {name:'화염장벽',char:'ironclad'},
      {name:'곡예',char:'silent'},
      {name:'계산된 도박',char:'silent'},
      {name:'다리 걸기',char:'silent'},
      {name:'맹독',char:'silent'}
    ],
    tips:[
      '아이언클래드는 방어도 엔진으로 시간을 벌고 사일런트는 독 누적에 집중',
      '앞라인이 안정적일수록 사일런트의 드로우/버리기 카드 가치가 커짐'
    ]
  },
  {
    id:'ic_re',
    name:'아이언클래드 + 리젠트',
    desc:'아이언클래드가 취약과 전열을 맡고, 리젠트가 별 자원을 모아 혜성·감마 세례로 마무리한다.',
    meta:'취약 셋업 + 별 자원 + 폭딜 피니시',
    must:[
      {name:'제압',char:'ironclad'},
      {name:'포악함',char:'ironclad'},
      {name:'광채',char:'regent'},
      {name:'혜성',char:'regent'}
    ],
    rec:[
      {name:'도발',char:'ironclad'},
      {name:'거상',char:'ironclad'},
      {name:'빅뱅',char:'regent'},
      {name:'수렴',char:'regent'},
      {name:'네 주제를 알라',char:'regent'},
      {name:'감마 세례',char:'regent'}
    ],
    tips:[
      '아이언클래드가 취약 창구를 열어주면 리젠트의 혜성 가치가 급격히 올라감',
      '리젠트는 별 수급, 아이언클래드는 탱킹과 디버프라는 역할 분담이 선명함'
    ]
  },
  {
    id:'si_ne',
    name:'사일런트 + 네크로바인더',
    desc:'사일런트의 버리기 순환과 네크로바인더의 에너지/무덤 엔진이 맞물려 턴 회전이 매우 빨라진다.',
    meta:'버리기 엔진 + 무덤/에너지 루프',
    must:[
      {name:'예비',char:'silent'},
      {name:'설계의 대가',char:'silent'},
      {name:'무덤지기',char:'necro'},
      {name:'연명',char:'necro'}
    ],
    rec:[
      {name:'곡예',char:'silent'},
      {name:'전략가',char:'silent'},
      {name:'계산된 도박',char:'silent'},
      {name:'부름',char:'necro'},
      {name:'분석',char:'necro'},
      {name:'장송가',char:'necro'}
    ],
    tips:[
      '사일런트는 패를 순환시키고 네크로는 연명/부름으로 에너지 템포를 보완',
      '긴 턴을 만들 수 있어서 고점이 높지만 초반 생존 카드 비중은 꼭 챙겨야 함'
    ]
  },
  {
    id:'si_re',
    name:'사일런트 + 리젠트',
    desc:'사일런트가 저코스트 순환과 드로우를 담당하고, 리젠트가 별 자원을 폭발시켜 한 턴 고점을 만든다.',
    meta:'저코 순환 + 별 폭발 + 단일 턴 고점',
    must:[
      {name:'예비',char:'silent'},
      {name:'곡예',char:'silent'},
      {name:'광채',char:'regent'},
      {name:'수렴',char:'regent'}
    ],
    rec:[
      {name:'계산된 도박',char:'silent'},
      {name:'아드레날린',char:'silent'},
      {name:'빅뱅',char:'regent'},
      {name:'정렬',char:'regent'},
      {name:'방출',char:'regent'},
      {name:'혜성',char:'regent'}
    ],
    tips:[
      '사일런트가 패를 정리해주면 리젠트의 시너지 카드 타이밍이 빨라진다',
      '탱킹이 약한 조합이므로 사일런트 방어 카드와 리젠트의 별의 망토를 같이 챙기는 편이 안정적'
    ]
  },
  {
    id:'de_si',
    name:'디펙트 + 사일런트',
    desc:'사일런트가 드로우와 디버프로 숨통을 틔우고, 디펙트가 오브 엔진과 에너지로 장기전 우위를 만든다.',
    meta:'디버프 보조 + 오브 엔진 + 장기전 안정성',
    must:[
      {name:'곡예',char:'silent'},
      {name:'귀를 찢는 비명',char:'silent'},
      {name:'조각모음',char:'defect'},
      {name:'냉정함',char:'defect'}
    ],
    rec:[
      {name:'다리 걸기',char:'silent'},
      {name:'아드레날린',char:'silent'},
      {name:'축전기',char:'defect'},
      {name:'반복',char:'defect'},
      {name:'임계 초과',char:'defect'},
      {name:'메아리의 형상',char:'defect'}
    ],
    tips:[
      '사일런트가 적 화력을 눌러주는 동안 디펙트가 세팅을 마치는 구조',
      '빠른 덱 순환 덕분에 디펙트 강화 파워를 제때 찾기 쉬워진다'
    ]
  },
  {
    id:'de_ne',
    name:'디펙트 + 네크로바인더',
    desc:'디펙트가 에너지와 지속 엔진을 깔아주고, 네크로바인더가 소환·휘발성·종말 카드로 전장을 정리한다.',
    meta:'에너지 생성 + 장기전 엔진 + 광역 정리',
    must:[
      {name:'냉정함',char:'defect'},
      {name:'조각모음',char:'defect'},
      {name:'서류 폭풍',char:'necro'},
      {name:'장막 관통자',char:'necro'}
    ],
    rec:[
      {name:'축전기',char:'defect'},
      {name:'반복',char:'defect'},
      {name:'임계 초과',char:'defect'},
      {name:'잿빛 혼령',char:'necro'},
      {name:'밴시의 외침',char:'necro'},
      {name:'정신 폭주',char:'necro'}
    ],
    tips:[
      '디펙트는 안정성, 네크로는 폭발력을 맡는 조합이라 역할 분리가 선명함',
      '준비 턴만 확보되면 광역과 보스전 둘 다 대응력이 좋음'
    ]
  }
];


