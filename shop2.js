/* ===================== 奶蛙牌 1.8 · 大小王伙伴 / 越刷越好 / 茶包更懂你 ===================== */

/* ---------- 茶包：你常出的牌型，更容易刷到 ---------- */
function teaPickW(n){const ks=Object.keys(TEA);const ty=(G&&G.stats&&G.stats.types)||{};const cnt={};let tot=0;
 for(const t in ty){const k=teaKey(t);if(!TEA[k])continue;cnt[k]=(cnt[k]||0)+ty[t];tot+=ty[t]}
 // 每种牌型底子 1 份；你打得越多，最多再加 8 份
 const w=k=>1+(tot?8*(cnt[k]||0)/tot:0);const left=ks.slice(),out=[];
 for(let i=0;i<n&&left.length;i++){const sum=left.reduce((a,k)=>a+w(k),0);let r=rnd()*sum,j=0;for(;j<left.length-1;j++){r-=w(left[j]);if(r<=0)break}out.push(left.splice(j,1)[0])}
 return out}

/* ---------- 换一批伙伴：这家店里刷得越多，越容易出稀有 / 史诗 / 传说 ---------- */
function ptRoll(pool,b){b=b||0;if(!pool.length)return pick(Object.keys(PARTNERS));
 const W={C:Math.max(.2,.6-.08*b),R:Math.min(.42,.3+.03*b),E:Math.min(.26,.08+.03*b),L:Math.min(.12,.02+.015*b)};
 const has=r=>pool.some(x=>PARTNERS[x].r===r);const rs=Object.keys(W).filter(has);const sum=rs.reduce((a,r)=>a+W[r],0);let x=rnd()*sum,r=rs[rs.length-1];
 for(const k of rs){x-=W[k];if(x<=0){r=k;break}}return pick(pool.filter(id=>PARTNERS[id].r===r))}
{const _sr4=shopRender;shopRender=function(){const r=_sr4.apply(this,arguments);try{const b=$("#shRe");if(b&&G.shop&&G.shop.rr>=1&&!b.querySelector("small")){b.insertAdjacentHTML("beforeend",`<small class="reHint">越刷越容易出好伙伴</small>`)}}catch(e){}return r}}

/* ---------- 大小王流：五个新伙伴 + 王牌套装 ---------- */
Object.assign(PARTNERS,{
 p4_dog:{t:"王牌",n:"捧王的星空奶狗",img:"e_dgar",r:"C",p:5,d:"每张王计分时 筹码 +60",card:(x,c)=>{if(isJoker(c)){x.chips+=60;return"+60"}}},
 p4_horse:{t:"王牌",n:"星马",img:"e_hrar",r:"C",p:5,d:"手里每留着 1 张王，倍率 +8",held:(x,c)=>{if(isJoker(c)){x.mult+=8;return"+8 倍率"}}},
 p4_cat:{t:"王牌",n:"星猫",img:"e_ctar",r:"R",p:6,d:"打出的牌里有王：倍率 ×2",hand:x=>{if(x.cards.some(isJoker)){x.mult*=2;return"×2 倍率"}}},
 p4_chick:{t:"王牌",n:"抓王的星鸡",img:"e_ckar",r:"R",p:7,d:"每关开始，手里没有王的话，从牌堆里摸 1 张王（换走一张最小的牌）",
  start:G=>{if(G.hand.some(isJoker))return;const j=G.draw.findIndex(isJoker);if(j<0)return;const lv=lvNow();let lo=0;G.hand.forEach((c,i)=>{if(!isJoker(c)&&power(c.r,lv)<power(G.hand[lo].r,lv))lo=i});
   const jc=G.draw[j],old=G.hand[lo];G.draw.splice(j,1,old);G.hand.splice(lo,1,jc);try{G.newIds.add(jc.id);sortHand()}catch(e){}}},
 p4_aurora:{t:"王牌",n:"极光奶蛋",img:"e_egar",r:"E",p:9,d:"单出一张王、或者出一对王：按炸弹的筹码和倍率算",hand:x=>{if(x.cards.length<=2&&x.cards.length&&x.cards.every(isJoker)){const a=handBase(x.type),b=handBase("bomb4");const dc=Math.max(0,b.c-a.c),dm=Math.max(0,b.m-a.m);x.chips+=dc;x.mult+=dm;return`按炸弹算 +${dc} 筹码 +${dm} 倍率`}}}});
SETS_OFF["王牌"]={d:"每张王计分时 倍率 ×1.5"};
{const _eh=extraHand;extraHand=function(x,G){const out=_eh.apply(this,arguments)||[];try{if(setOn(G,"王牌")){const k=(x.cards||[]).filter(isJoker).length;if(k){const m=r1(Math.pow(1.5,k));x.mult=r1(x.mult*m);out.push(`王牌凑齐了 ×${m}`)}}}catch(e){}return out}}

/* ---------- 1.9：打 3 起前期稍微难一点（打 2 不变，越往后加得越少，打 10 起和以前一样） ---------- */
const LV_HARD=[1,1.1,1.2,1.25,1.2,1.15,1.1,1.05];
{const _tg=targetOf;targetOf=function(lv,b){const t=_tg(lv,b);if(G&&G.endless&&(G.loop||1)>1)return t;const k=LV_HARD[lv]||1;return k===1?t:Math.round(t*k/10)*10}}
