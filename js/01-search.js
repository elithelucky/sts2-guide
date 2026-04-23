/* === script === */
// ═══════════════════════════════════════
// 초성 검색
// ═══════════════════════════════════════
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const CHO_SET=new Set(CHO);
const COMPOUND={ㄳ:'ㄱㅅ',ㄵ:'ㄴㅈ',ㄶ:'ㄴㅎ',ㄺ:'ㄹㄱ',ㄻ:'ㄹㅁ',ㄼ:'ㄹㅂ',ㄽ:'ㄹㅅ',ㄾ:'ㄹㅌ',ㄿ:'ㄹㅍ',ㅀ:'ㄹㅎ',ㅄ:'ㅂㅅ'};
function decompose(s){return[...s].map(c=>COMPOUND[c]||c).join('')}
function getChosung(s){return[...s].map(c=>{const d=c.charCodeAt(0)-0xAC00;return d<0||d>11171?c:CHO[Math.floor(d/588)]}).join('')}
function isChosungLike(s){return[...s].every(c=>CHO_SET.has(c)||c in COMPOUND)}
function matchSearch(name,q){return getSearchRank(name,q)>-1}
function getSearchRank(name,q){
  if(!q) return 0;
  q=q.replace(/\s/g,'');
  const n=name.replace(/\s/g,'');
  const nLow=n.toLowerCase(), qLow=q.toLowerCase();
  const idx=nLow.indexOf(qLow);
  if(idx===0) return 1000-q.length;
  if(idx>0) return 700-idx;
  const chosung=getChosung(n), dq=decompose(q);
  if(isChosungLike(q)){
    const cidx=chosung.indexOf(dq);
    if(cidx===0) return 950-dq.length;
    if(cidx>0) return 650-cidx;
  }
  return -1;
}

