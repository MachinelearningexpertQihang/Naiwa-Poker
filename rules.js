/* ===================== 奶蛙牌 · 掼蛋牌型 =====================
   一张牌：{s:花色, r:点数}
     花色 s：0♠ 1♥ 2♣ 3♦，王是 s:4（r:16 小王，r:17 大王）
     点数 r：2..14（11=J 12=Q 13=K 14=A）
   级牌：这一关「打几」。级牌比 A 大、比王小；红桃级牌是「逢人配」，可以当除王以外的任何牌。
*/
const SUITS=["♠","♥","♣","♦"];
const RN={11:"J",12:"Q",13:"K",14:"A",16:"小王",17:"大王"};
const rankName=r=>RN[r]||String(r);

/* 牌型表：基础筹码、倍率。比小丑牌多了「炸弹越大越值钱」 */
const HANDS={
 single:{n:"单张",c:5,m:1},
 pair:{n:"对子",c:10,m:2},
 triple:{n:"三张",c:25,m:3},
 fullhouse:{n:"三带二",c:40,m:4},
 straight:{n:"顺子",c:35,m:4},
 tube:{n:"三连对",c:50,m:5},
 plate:{n:"钢板",c:65,m:6},
 bomb4:{n:"炸弹",c:60,m:7},
 bomb5:{n:"五炸",c:90,m:10},
 sflush:{n:"同花顺",c:110,m:12},
 bomb6:{n:"六炸",c:130,m:14},
 bomb7:{n:"七炸",c:180,m:18},
 bomb8:{n:"八炸",c:250,m:24},
 rocket:{n:"天王炸",c:400,m:40}};
const HAND_ORDER=["single","pair","triple","fullhouse","straight","tube","plate","bomb4","bomb5","sflush","bomb6","bomb7","bomb8","rocket"];

let NOWILD=false,INVERT=false;
const isWild=(c,lv)=>!NOWILD&&c.s!==4&&(c.wild||(c.s===1&&c.r===lv));
const isJoker=c=>c.s===4;

/* 在「级牌」规则下的大小：2..A 原样，级牌 15，小王 16，大王 17 */
function power(r,lv){return r===lv?15:r}

/* 顺子、连对、钢板用的「自然点数」：A 可以当 1 也可以当 14，级牌按本来的点数 */
const STRAIGHT_STARTS=[1,2,3,4,5,6,7,8,9,10,11,12,13]; // 1 表示 A 当 1（A2345）；长度不够的在下面挡掉
const nat=r=>r===14?[14,1]:[r];

/* 判牌：返回 {type, key, used:[被当成什么]} 或 null。
   key 用来比大小（同牌型之间） */
function judge(cards,lv){
 const n=cards.length;if(!n)return null;
 const wild=cards.filter(c=>isWild(c,lv)).length;
 const norm=cards.filter(c=>!isWild(c,lv));
 const jokers=norm.filter(isJoker);
 const plain=norm.filter(c=>!isJoker(c));
 // 按点数数一下
 const cnt={};plain.forEach(c=>cnt[c.r]=(cnt[c.r]||0)+1);
 const ranks=Object.keys(cnt).map(Number);
 const best=[];
 const push=(type,key)=>best.push({type,key});

 // 天王炸：四张王（逢人配不能配王）
 if(n===4&&jokers.length===4)push("rocket",99);
 // 王只能单出、对出（两张一样的王）、或者天王炸
 if(jokers.length&&!(n===4&&jokers.length===4)){
  if(n===1)push("single",jokers[0].r);
  else if(n===2&&jokers.length===2&&jokers[0].r===jokers[1].r)push("pair",jokers[0].r);
  return pickBest(best);
 }
 // 单张
 if(n===1){push("single",power(cards[0].r,lv));return pickBest(best)}
 // 同点数：对子、三张、炸弹
 if(ranks.length<=1){const r=ranks.length?ranks[0]:lv;const p=power(r,lv);
  if(n===2)push("pair",p);if(n===3)push("triple",p);if(n>=4&&n<=8)push("bomb"+n,p)}
 // 三带二：只能带一对
 if(n===5){for(const t of (ranks.length?ranks:[lv])){for(const pr of [...ranks,null]){if(pr===t)continue;const needT=Math.max(0,3-(cnt[t]||0)),needP=pr==null?2:Math.max(0,2-(cnt[pr]||0));
   const extra=ranks.filter(r=>r!==t&&r!==pr).length;if(extra)continue;if((cnt[t]||0)>3||(pr!=null&&(cnt[pr]||0)>2))continue;if(needT+needP===wild){push("fullhouse",power(t,lv));break}}}}
 // 顺子 / 同花顺：正好 5 张，连着的点数
 if(n===5)for(const st of STRAIGHT_STARTS){const want=[0,1,2,3,4].map(i=>st+i);if(want[4]>14)continue;
  if(fitSeq(plain,want,1,wild)){const flush=plain.length&&plain.every(c=>c.s===plain[0].s)&&(!wild||plain.every(c=>c.s===1)||true);
   const ps=plain.filter(c=>!c.cham&&c.en!=="cham");const sameSuit=ps.every(c=>c.s===ps[0].s);push(sameSuit?"sflush":"straight",st+4)}}
 // 三连对：6 张
 if(n===6)for(const st of STRAIGHT_STARTS){const want=[0,1,2].map(i=>st+i);if(want[2]>14)continue;if(fitSeq(plain,want,2,wild))push("tube",st+2)}
 // 钢板：6 张，两个连着的三张
 if(n===6)for(const st of STRAIGHT_STARTS){const want=[0,1].map(i=>st+i);if(want[1]>14)continue;if(fitSeq(plain,want,3,wild))push("plate",st+1)}
 return pickBest(best);
}
// 每个点数要 k 张，看看手里的牌（加上逢人配）能不能正好凑出来
function fitSeq(plain,want,k,wild){const need={};want.forEach(w=>need[w===1?14:w]=k);
 const left={...need};for(const c of plain){const r=c.r;if(left[r]>0){left[r]--;continue}return false}
 const miss=Object.values(left).reduce((a,b)=>a+b,0);return miss===wild}
function pickBest(list){if(!list.length)return null;list.sort((a,b)=>HAND_ORDER.indexOf(b.type)-HAND_ORDER.indexOf(a.type)||b.key-a.key);return list[0]}

/* 压牌：b 能不能压住 a（掼蛋规则） */
function beats(b,a){if(!a)return true;if(!b)return false;
 const bi=HAND_ORDER.indexOf(b.type),ai=HAND_ORDER.indexOf(a.type);
 const bomb=t=>/^bomb|sflush|rocket/.test(t);
 if(bomb(b.type)&&!bomb(a.type))return true;
 if(bomb(b.type)&&bomb(a.type))return bi>ai||(bi===ai&&b.key>a.key);
 return b.type===a.type&&(INVERT?b.key<a.key:b.key>a.key)}

/* 一张牌值几个筹码 */
function cardChips(c,lv){if(isJoker(c))return c.r===17?30:20;if(c.r===lv)return 15;if(c.r>=11&&c.r<=13)return 10;if(c.r===14)return 11;return c.r}

/* 两副牌 */
function makeDeck(){const d=[];let id=0;for(let k=0;k<2;k++){for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({id:++id,s,r});d.push({id:++id,s:4,r:16});d.push({id:++id,s:4,r:17})}return d}

/* 双生牌：判牌型时算两张 */
function judgeX(cards,lv){const ex=[];for(const c of cards){ex.push(c);if(c.en==="twin")ex.push({...c,id:c.id+"~",en:null})}if(ex.length>8)return null;return judge(ex,lv)}
if(typeof module!=="undefined")module.exports={judge,beats,makeDeck,cardChips,HANDS,HAND_ORDER,isWild,power,rankName,SUITS};
