/* ===================== 奶蛙牌 · 存档 / 提示 / 牌型表 ===================== */

/* ---------- 存档：每次到选关、商店时自动存 ---------- */
const SAVE_KEY="run";
function saveRun(where){if(!G||G.tut===2)return;G.where=where;const keep={};for(const k in G){if(["sel","newIds","draw","hand","upper","nextUp","pool","busy","foe"].includes(k))continue;keep[k]=G[k]}lsSet(SAVE_KEY,keep)}
function clearRun(){lsSet(SAVE_KEY,null)}
function hasSave(){const s=lsGet(SAVE_KEY);return s&&s.deck&&s.deck.length?s:null}
function loadRun(){const s=hasSave();if(!s)return false;G=s;G.sel=new Set();G.newIds=new Set();G.hand=[];G.draw=[];G.pool=[];G.busy=0;NOWILD=false;INVERT=false;G.lvOff=0;
 if(G.where==="shop"&&G.shop){show("shop");bgScene("shop");shopRender()}else blindSelect();return true}
{const _b=blindSelect;blindSelect=function(){_b();saveRun("blinds")}}
{const _r=shopRender;shopRender=function(){_r();saveRun("shop")}}
{const _go=gameOver;gameOver=function(){clearRun();_go()}}
{const _w=runWin;runWin=function(){clearRun();return _w()}}
/* 主页：有存档就显示「继续」 */
{const _t=titleScreen;titleScreen=function(){_t();const s=hasSave();if(!s)return;const go=$("#tGo");go.textContent="新的一局";go.classList.remove("big","gold");go.classList.add("dark","tNew");
 const c=document.createElement("button");c.className="btn big gold tCont";c.innerHTML=`继续 <small>第 ${s.lvIdx+1} 站 · 打 ${rankName(LV_LIST[s.lvIdx])}</small>`;go.parentNode.insertBefore(c,go);
 c.onclick=()=>{au();SFX.click();loadRun()};
 go.onclick=()=>{au();SFX.click();ov(`<div class="box"><h2>重新开始？</h2><p class="msg">现在这一局（第 ${s.lvIdx+1} 站）会被覆盖。</p><button class="btn" id="nwY">重新开始</button> <button class="btn dark" id="nwN">算了</button></div>`);$("#nwY").onclick=()=>{closeOv();clearRun();newRun()};$("#nwN").onclick=closeOv}}}

/* ---------- 提示：帮你找能出的牌 ---------- */
function hintList(){const lv=lvNow();const H=G.hand.filter(c=>!c.frz&&!c.mud&&!c.hid&&!c.peek);const n=Math.min(H.length,13);const best={};
 for(let m=1;m<(1<<n);m++){let k=0,mm=m;while(mm){k+=mm&1;mm>>=1}if(k>8)continue;const cs=[];for(let i=0;i<n;i++)if(m>>i&1)cs.push(H[i]);
  const j=judgeX(cs,lv);if(!j)continue;const b=handBase(j.type);const bt=beats(j,G.upper&&G.upper.j);const est=(b.c+cs.reduce((s,c)=>s+cardChips(c,lv),0))*b.m*(bt?1.5:((G.diff||0)>=8?.5:.6));
  const key=j.type+":"+j.key;if(!best[key]||best[key].est<est||(best[key].est===est&&best[key].cs.length>cs.length))best[key]={cs,j,bt,est}}
 const all=Object.values(best);all.sort((a,b)=>(b.bt-a.bt)||(b.est-a.est));return all.slice(0,12)}
function hintNext(){if(!G||G.busy)return;SFX.click();if(!G.hints||G.hintHand!==G.hand.map(c=>c.id).join()){G.hints=hintList();G.hintI=0;G.hintHand=G.hand.map(c=>c.id).join()}
 if(!G.hints.length){toast("手里凑不出能看见的牌型");return}const h=G.hints[G.hintI%G.hints.length];G.hintI++;G.sel=new Set(h.cs.map(c=>c.id));renderHand();renderPreview();
 toast(`${h.bt?"能压住：":"压不住，但能出："}<b>${HANDS[h.j.type].n}</b>（${(G.hintI-1)%G.hints.length+1}/${G.hints.length}）`)}

/* ---------- 牌型表：例子 + 谁压谁 ---------- */
const HAND_EX={single:"5",pair:"8 8",twopair:"5 5 + 9 9",triple:"J J J",fullhouse:"9 9 9 + 4 4",straight:"3 4 5 6 7",flush:"同一个花色的任意 5 张",tube:"5 5 6 6 7 7",plate:"8 8 8 9 9 9",bomb4:"7 7 7 7",bomb5:"Q×5",sflush:"同花色 3 4 5 6 7",bomb6:"K×6",bomb7:"A×7",bomb8:"2×8",rocket:"小王 小王 大王 大王"};
handTable=function(){SFX.click();const lv=G?LV_LIST[G.lvIdx]:2;
 ov(`<div class="box htBox"><h2>牌型</h2><div class="htWrap"><table><tr class="hd"><td>牌型</td><td>例子</td><td>等级</td><td class="c">筹码</td><td></td><td class="m">倍率</td></tr>${HAND_ORDER.map(t=>{const b=G?handBase(t):{c:HANDS[t].c,m:HANDS[t].m,L:0};return`<tr class="${/^bomb|rocket|sflush/.test(t)?"bm":""}"><td>${HANDS[t].n}</td><td class="ex">${HAND_EX[t]}</td><td class="l">Lv${b.L+1}</td><td class="c">${b.c}</td><td>×</td><td class="m">${b.m}</td></tr>`}).join("")}</table>
 <div class="htN"><b>谁压谁</b><p>同一种牌型，点数大的压小的。</p><p>炸弹能压任何不是炸弹的牌。</p><p>炸弹之间：张数多的大；四炸 &lt; 五炸 &lt; 同花顺 &lt; 六炸 &lt; 七炸 &lt; 八炸 &lt; 天王炸。</p><p><b>大小</b>：2 3 … K A &lt; <b>级牌</b>（这一站是 ${rankName(lv)}）&lt; 小王 &lt; 大王</p><p><b class="hred">红桃${rankName(lv)}</b> 是逢人配，能当王以外的任何一张牌。</p><p>压住对手：倍率 ×1.5<br>压不住：×0.6</p></div></div><button class="btn" onclick="closeOv()">知道了</button></div>`)};

addEventListener("load",()=>{const b=document.createElement("button");b.className="btn dark";b.id="bHint";b.textContent="提示";$("#acts").insertBefore(b,$("#bPlay"));b.onclick=hintNext});
