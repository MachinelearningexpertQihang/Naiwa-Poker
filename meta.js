/* ===================== 奶蛙牌 · 长线：主角 / 解锁 / 难度 ===================== */

/* ---------- 长线数据（不随一局清空） ---------- */
let M=Object.assign({best:0,wins:0,maxDiff:0,bomb5:0,seen:[]},lsGet("meta")||{});
function saveMeta(){lsSet("meta",M)}

/* ---------- 开局主角：每个人偏向一个流派 ---------- */
const HEROES={
 naiwa:{n:"奶蛙",img:"nw",d:"最普通的开局。什么流派都能走。",need:"一开始就有",ok:()=>1},
 knight:{n:"骑士奶蛙",img:"kn",d:"开局带「盾斗士」（压不住也不打折）。弃牌 +1。",need:"走到第 4 站",ok:()=>M.best>=3,
  apply:G=>{G.partners.push("v_shielder");G.discMax++}},
 mage:{n:"奶蛙魔法师",img:"mg",d:"牌组里有 4 张永久逢人配，开局带「没有颜色的奶蛙」。但出牌 -1。",need:"走到第 6 站",ok:()=>M.best>=5,
  apply:G=>{shuffleArr(G.deck.filter(c=>c.s<4)).slice(0,4).forEach(c=>c.wild=1);G.partners.push("fask");G.handsMax--}},
 vamp:{n:"吸血鬼奶蛙",img:"v_vamp",d:"开局带「臭蛋炸弹」，牌组多 8 张 7（更好凑炸弹）。",need:"打出一次五炸",ok:()=>M.bomb5,
  apply:G=>{let id=9000;for(let i=0;i<8;i++)G.deck.push({id:++id,s:i%4,r:7,ed:null,seal:null});G.partners.push("egn")}},
 kungfu:{n:"功夫奶蛙",img:"n1",d:"手牌 +1，开局带「斑纹奶马」（连着出连牌 ×2）。",need:"走到第 8 站",ok:()=>M.best>=7,
  apply:G=>{G.handSize++;G.partners.push("hrz")}},
 gushi:{n:"蛊师奶蛙",img:"v_gushi",d:"牌组只有 ♠ 和 ♥ 两种花色，开局带「占卜奶猫」（同花色 ×2）。",need:"通关一次",ok:()=>M.wins>=1,
  apply:G=>{G.deck.forEach(c=>{if(c.s===2)c.s=0;else if(c.s===3)c.s=1});G.partners.push("ctf")}}};

/* ---------- 难度阶梯：通关一次开下一级，效果叠加 ---------- */
const DIFFS=["标准","对手血量 +15%","首领关少 1 次出牌","开局没有金币","商店每样贵 1 金币","利息最多 3","对手血量再 +20%","弃牌 -1","没压住 ×0.5"];

/* ---------- 伙伴解锁：走得越远，解锁越多 ---------- */
const UNLOCK_AT={};
(()=>{let r=0,e=0;for(const k in PARTNERS){const P=PARTNERS[k];
  if(P.r==="C"||["n1","kn","mg","v_gushi","m6","xcf","dm"].includes(k))UNLOCK_AT[k]=0;
  else if(P.r==="R")UNLOCK_AT[k]=1+(r++%6);
  else if(P.r==="E")UNLOCK_AT[k]=6+(e++%4);
  else UNLOCK_AT[k]=13}})();      // 传说：通关解锁
function isUnlocked(k){const n=UNLOCK_AT[k]||0;return n>=13?M.wins>0:M.best>=n}
function unlockText(k){const n=UNLOCK_AT[k]||0;return n>=13?"通关一次解锁":`走到第 ${n+1} 站解锁`}

/* 记录进度，看看有没有新东西解锁 */
function metaProgress(){if(!G||G.tut===2)return;const before=new Set(Object.keys(PARTNERS).filter(isUnlocked)),hb=new Set(Object.keys(HEROES).filter(h=>HEROES[h].ok()));
 if(G.lvIdx>M.best)M.best=G.lvIdx;saveMeta();
 const np=Object.keys(PARTNERS).filter(k=>isUnlocked(k)&&!before.has(k)),nh=Object.keys(HEROES).filter(h=>HEROES[h].ok()&&!hb.has(h));
 if(np.length||nh.length)setTimeout(()=>{SFX.shine();toast(`<b>解锁了！</b> ${nh.map(h=>"主角「"+HEROES[h].n+"」").concat(np.map(k=>PARTNERS[k].n)).join("、")}`)},600)}
{const _b=blindSelect;blindSelect=function(){_b();metaProgress()}}
{const _w=runWin;runWin=function(){const hb=new Set(Object.keys(HEROES).filter(h=>HEROES[h].ok()));M.wins++;M.maxDiff=Math.max(M.maxDiff,Math.min(DIFFS.length-1,(G.diff||0)+1));M.best=Math.max(M.best,12);saveMeta();return _w()}}
{const _p=playSel;playSel=async function(){const r=await _p.apply(this,arguments);if(G&&G.stats&&!M.bomb5){const t=G.stats.types;if(t.bomb5||t.bomb6||t.bomb7||t.bomb8){M.bomb5=1;saveMeta();toast("<b>解锁了！</b> 主角「吸血鬼奶蛙」")}}return r}}
addEventListener("load",()=>{$("#bPlay").onclick=()=>playSel()});

/* ---------- 选主角 + 难度 ---------- */
function heroSelect(){show("none");bgScene("title");let pickH=lsGet("lastHero")||"naiwa";if(!HEROES[pickH]||!HEROES[pickH].ok())pickH="naiwa";let d=Math.min(lsGet("lastDiff")||0,M.maxDiff);
 const draw=()=>{ov(`<div class="box hsBox"><h2>选一个主角</h2><div class="hsRow">${Object.keys(HEROES).map(h=>{const H=HEROES[h],ok=H.ok();return`<div class="hsC ${ok?"":"lock"} ${h===pickH?"on":""}" data-h="${h}"><img src="${IMG(H.img)}"><b>${ok?H.n:"？？？"}</b><p>${ok?H.d:H.need}</p></div>`}).join("")}</div>
  <div class="hsDiff"><button class="btn dark sm" id="dL" ${d<=0?"disabled":""}>◀</button><div><small>难度 ${d}</small><b>${DIFFS[d]}</b>${d?`<em>（包括前面所有难度的限制）</em>`:""}</div><button class="btn dark sm" id="dR" ${d>=M.maxDiff?"disabled":""}>▶</button></div>
  ${M.maxDiff<DIFFS.length-1?`<p class="hsTip">用当前最高难度通关一次，就能开下一级难度</p>`:""}
  <div><button class="btn big gold" id="hsGo">出发！</button> <button class="btn dark" id="hsBack">回主页</button></div></div>`);
  $$(".hsC").forEach(e=>e.onclick=()=>{if(e.classList.contains("lock")){SFX.bad();toast(`还没解锁：${HEROES[e.dataset.h].need}`);return}SFX.click();pickH=e.dataset.h;draw()});
  $("#dL").onclick=()=>{d=Math.max(0,d-1);SFX.click();draw()};$("#dR").onclick=()=>{d=Math.min(M.maxDiff,d+1);SFX.click();draw()};
  $("#hsGo").onclick=()=>{SFX.click();lsSet("lastHero",pickH);lsSet("lastDiff",d);closeOv();newRun(pickH,d)};$("#hsBack").onclick=()=>{closeOv();titleScreen()}};
 draw()}
/* 主页「开始」→ 先选主角（第一次玩直接进教程） */
{const _n=newRun;newRun=function(h,d){if(h===undefined&&lsGet("tutDone"))return heroSelect();return _n(h,d)}}

/* ---------- 图鉴：没解锁的显示成剪影 ---------- */
{const _c=codex;codex=function(){_c();const draw0=()=>$$(".cdxC").forEach(e=>{const nm=e.querySelector("b").textContent;const k=Object.keys(PARTNERS).find(x=>PARTNERS[x].n===nm);if(k&&!isUnlocked(k)){e.classList.add("lock");e.querySelector("b").textContent="？？？";e.querySelector("p").textContent=unlockText(k)}});
 draw0();$$(".cdxTabs .btn").forEach(b=>{const f=b.onclick;b.onclick=()=>{f();draw0()}});const h=$(".cdx h2");if(h)h.innerHTML+=` <small>已解锁 ${Object.keys(PARTNERS).filter(isUnlocked).length}</small>`}}

/* ---------- 伙伴换位置：算分是从左到右，先加后乘更划算 ---------- */
{const _t=partnerTip;partnerTip=function(i,el){_t(i,el);const tp=$("#tip");if(!tp)return;const row=document.createElement("div");row.className="ptMove";
 row.innerHTML=`<button class="btn dark sm" id="pmL" ${i<=0?"disabled":""}>◀ 往左</button><button class="btn dark sm" id="pmR" ${i>=G.partners.length-1?"disabled":""}>往右 ▶</button>`;tp.appendChild(row);
 const mv=dx=>{if(G.busy)return;const j=i+dx;[G.partners[i],G.partners[j]]=[G.partners[j],G.partners[i]];SFX.click();closeTip();renderPartners();if($("#shop.on"))saveRun("shop")};
 $("#pmL").onclick=()=>mv(-1);$("#pmR").onclick=()=>mv(1)}}
