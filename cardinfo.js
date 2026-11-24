/* ===================== 奶蛙牌 1.7 · 长按扑克牌看说明 =====================
   手牌、牌组、卡包、首领进贡……任何一张牌，按住半秒就弹出说明：
   它是什么牌、有什么增强 / 品质 / 印、是不是级牌或逢人配、是不是首领进贡的 */
const CARD_REG=new Map();
{const _ch=cardHTML;cardHTML=function(c){try{if(c&&c.id!=null)CARD_REG.set(String(c.id),c)}catch(e){}return _ch.apply(this,arguments)}}
// 首领进贡的牌：记住是谁进贡的
{const _tc=tribCards;tribCards=function(k){const cs=_tc.apply(this,arguments);try{const kk=k==="bx2"?"bx":k;cs.forEach(c=>c.trib=kk)}catch(e){}return cs}}
function cardInfoHTML(c){const lv=lvNow(),J=isJoker(c),L=[];
 const name=J?(c.r===17?"大王":"小王"):`${SUITS[c.s]||""} ${rankName(c.r)}`;
 L.push(`<b class="ciN">${name}</b><small class="ciC">算 ${cardChips(c,lv)} 个筹码</small>`);
 if(c.trib){const B=BOSSES[c.trib];L.push(`<p class="ciTag trib">首领进贡</p><p>${B?B.n:"首领"}被打败以后献上的牌，比普通的牌多一点本事。</p>`)}
 if(!J&&isWild(c,lv))L.push(`<p class="ciTag wild">逢人配</p><p>${c.wild?"这张牌永远是逢人配。":`这一站打 ${rankName(lv)}，红桃 ${rankName(lv)} 就是逢人配。`}能当王以外的任何一张牌，凑牌型很好用。</p>`);
 else if(!J&&c.r===lv)L.push(`<p class="ciTag lv">级牌</p><p>这一站打 ${rankName(lv)}，所有的 ${rankName(lv)} 都是级牌：比 A 还大，算 15 个筹码。</p>`);
 if(J)L.push(`<p>王比级牌还大。两张大王两张小王一起出是「天王炸」，最大的牌。</p>`);
 if(c.en&&ENH[c.en])L.push(`<p class="ciTag en">${ENH[c.en].n}</p><p>${ENH[c.en].d}${c.en==="ice"&&c.age?`（已经在手里留了 ${c.age} 手）`:""}</p>`);
 if(c.ed&&EDS[c.ed])L.push(`<p class="ciTag ed">${EDS[c.ed].n}</p><p>${EDS[c.ed].d}</p>`);
 if(c.seal&&SEALS[c.seal])L.push(`<p class="ciTag seal">${SEALS[c.seal].n}</p><p>${SEALS[c.seal].d}</p>`);
 if(c.frz)L.push(`<p class="ciTag bad">冻住了</p><p>还要 ${c.frz} 手才化开，化开之前打不出去。</p>`);
 if(c.mud)L.push(`<p class="ciTag bad">糊了泥巴</p><p>这一手打不出去。</p>`);
 if(c.peek)L.push(`<p class="ciTag bad">刚翻开</p><p>这一手还出不了，下一手就能出。</p>`);
 if(L.length===1&&!J)L.push(`<p>普通的牌，没有特别的效果。</p>`);
 return L.join("")}
function cardInfoShow(el){const c=CARD_REG.get(el.dataset.id);if(!c)return false;if(c.hid&&el.classList.contains("back")){tip(el,`<b class="ciN">盖着的牌</b><p>点一下翻开看看。</p>`);return true}
 tip(el,`<div class="cardInfo">${cardInfoHTML(c)}</div>`);const d=$("#tip");if(d){d.classList.add("ciTip");const R=toStage(el.getBoundingClientRect());const h=d.offsetHeight;let y=R.y+R.h+10;if(y+h>710)y=Math.max(10,R.y-h-10);d.style.top=y+"px";
  let x=R.x+R.w/2-d.offsetWidth/2;d.style.left=Math.max(10,Math.min(1270-d.offsetWidth,x))+"px"}
 try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}SFX.click();return true}
// 按住半秒：弹说明，这一下不算点牌
{let lp=null,eat=0;
 document.addEventListener("pointerdown",e=>{const el=e.target.closest&&e.target.closest(".card[data-id]");if(!el||(e.button&&e.button!==0))return;clearTimeout(lp&&lp.t);
  lp={el,x:e.clientX,y:e.clientY,pid:e.pointerId,t:setTimeout(()=>{if(!lp||!lp.el.isConnected)return;if(cardInfoShow(lp.el)){eat=Date.now();if(!M.lpSeen){M.lpSeen=1;saveMeta()}}lp=null},480)}},true);
 addEventListener("pointermove",e=>{if(lp&&e.pointerId===lp.pid&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10){clearTimeout(lp.t);lp=null}},{passive:true});
 const stop=e=>{if(lp&&(!e||e.pointerId===lp.pid)){clearTimeout(lp.t);lp=null}};addEventListener("pointerup",stop);addEventListener("pointercancel",stop);
 document.addEventListener("click",e=>{if(eat&&Date.now()-eat<800&&e.target.closest&&e.target.closest(".card[data-id]")){e.stopPropagation();e.preventDefault();eat=0}},true);
 document.addEventListener("contextmenu",e=>{if(e.target.closest&&e.target.closest(".card[data-id]"))e.preventDefault()},true)}
// 第一次手里有特殊的牌时，提醒一句「长按看说明」
{const _rh=renderHand;renderHand=function(){const r=_rh.apply(this,arguments);try{if(!M.lpSeen&&!M.lpTold&&G&&!G.tut){const lv=lvNow();if(G.hand.some(c=>c.en||c.ed||c.seal||c.trib||isWild(c,lv))){M.lpTold=1;saveMeta();setTimeout(()=>toast("<b>小提示</b>：按住一张牌不放，可以看它有什么特别"),900)}}}catch(e){}return r}}
