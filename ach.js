/* ===================== 奶蛙牌 · 首领进贡 / 成就 / 牌背 / 图鉴 ===================== */

/* ---------- 长线记录 ---------- */
["ach","metFoe","beatBoss","gotC","winHero"].forEach(k=>{if(!Array.isArray(M[k]))M[k]=[]});
M.cnt=Object.assign({fu:0,mb:0,trib:0},M.cnt||{});
const addTo=(k,v)=>{if(!M[k].includes(v)){M[k].push(v);saveMeta();return true}return false};

/* ---------- 首领进贡：打败首领后，它献上 3 张带它特色的牌，挑 1 张 ---------- */
const rr=()=>2+Math.floor(rnd()*13),rs=()=>Math.floor(rnd()*4);
const TRIB={
 pp:  {d:"守护印：不怕泥巴、冰冻、烧牌",mk:()=>({s:rs(),r:rr(),seal:"guard"})},
 vp:  {d:"红桃 + 回响印：计分两次",mk:()=>({s:1,r:rr(),seal:"echo"})},
 dghw:{d:"变色牌：算任何花色",mk:()=>({s:rs(),r:rr(),en:"cham"})},
 v_bfallen:{d:"永久逢人配",mk:()=>({s:rs(),r:rr(),wild:true})},
 xsh: {d:"幸运牌",mk:()=>({s:rs(),r:rr(),en:"lucky"})},
 xch: {d:"冰心牌：留得越久越值钱",mk:()=>({s:rs(),r:rr(),en:"ice",age:0})},
 v_snowk2:{d:"双生牌：一张算两张",mk:()=>({s:rs(),r:rr(),en:"twin"})},
 v_brock:{d:"钢牌：留在手里 ×1.5",mk:()=>({s:rs(),r:rr(),en:"steel"})},
 sny: {d:"玻璃牌：计分 ×2",mk:()=>({s:rs(),r:rr(),en:"glass"})},
 egf: {d:"召唤印：弃掉送符咒",mk:()=>({s:rs(),r:rr(),seal:"summon"})},
 snf: {d:"金卡 + 金币印",mk:()=>({s:rs(),r:rr(),ed:"gold",seal:"coin"})},
 v_curser:{d:"彩卡 + 压印",mk:()=>({s:rs(),r:rr(),ed:"poly",seal:"press"})},
 bx:  {d:"阿岳的私藏",mk:i=>i===0?{s:4,r:17,ed:"poly"}:i===1?{s:rs(),r:14,ed:"poly",en:"glass"}:{s:rs(),r:rr(),seal:"echo",ed:"foil"}}};
function tribCards(k){const T=TRIB[k]||TRIB[pick(Object.keys(TRIB))];const seen=new Set();
 return[0,1,2].map(i=>{let c;for(let t=0;t<9;t++){c=T.mk(i);if(!seen.has(c.s+"-"+c.r))break}seen.add(c.s+"-"+c.r);return Object.assign({id:1e5+Math.floor(rnd()*1e9),ed:null,seal:null},c)})}
function tribute(k){return new Promise(res=>{k=k==="bx2"?"bx":k;const B=BOSSES[k]||{n:"首领",img:"pp"};const T=TRIB[k]||{d:""};const cs=tribCards(k);
 ov(`<div class="box packBox tribBox"><div class="trHead"><img src="${IMG(B.img)}"><div><h2>${B.n} 进贡</h2><p>它服气了，献上三张牌。挑一张收进牌组。<br><em>${T.d}</em></p></div></div>
  <div class="pkRow">${cs.map((c,i)=>`<div class="flip" data-i="${i}" style="--i:${i}"><div class="fIn"><div class="fBack"><b>贡</b></div><div class="fFront">${cardHTML(c)}</div></div></div>`).join("")}</div><button class="btn dark" id="trSkip">都不要</button></div>`);
 SFX.shine();
 $$(".tribBox .flip").forEach((e,i)=>{setTimeout(()=>{if(!e.isConnected)return;e.classList.add("open");SFX.flip();setTimeout(()=>{e.classList.add("shine");const c=cs[i];const tag=[c.wild?"逢人配":"",c.en?ENH[c.en].n:"",c.ed?EDS[c.ed].n:"",c.seal?SEALS[c.seal].n:""].filter(Boolean).join(" · ");if(tag){const t=document.createElement("div");t.className="fTag";t.textContent=tag;e.appendChild(t)}tiltOn(e.querySelector(".card"))},380)},250+i*260);
  e.onclick=()=>{if(!e.classList.contains("open")||e.classList.contains("taken"))return;const c=cs[+e.dataset.i];G.deck.push(c);SFX.pick();bgKick(.4);e.classList.add("taken");M.cnt.trib++;saveMeta();achCheck();setTimeout(()=>{closeOv();res(c)},450)}});
 $("#trSkip").onclick=()=>{SFX.click();closeOv();res(null)}})}
{const _bw=blindWin;blindWin=async function(){const bk=G.blind===2?G.boss:null;const r=await _bw.apply(this,arguments);
  if(bk){addTo("beatBoss",bk==="bx2"?"bx":bk);achCheck();const b=$("#wGo");const lastSt=!G.endless&&G.lvIdx>=LV_LIST.length-1;
   if(b&&!lastSt){const f=b.onclick;b.textContent="收下进贡 ▶";b.onclick=async()=>{if(G._trib)return;G._trib=1;closeOv();await tribute(bk);G._trib=0;f()}}}
  return r}}

/* ---------- 成就 ---------- */
const typed=t=>x=>x&&x.type===t;
const ACH=[
 {id:"b4",n:"第一声炸响",d:"打出一个炸弹",hx:x=>x&&x.isBomb},
 {id:"b6",n:"六六大顺",d:"打出六炸或更大",hx:x=>x&&/bomb[678]/.test(x.type)},
 {id:"b8",n:"八方来贺",d:"打出八炸",hx:typed("bomb8")},
 {id:"rk",n:"天王驾到",d:"打出天王炸",hx:typed("rocket")},
 {id:"sf",n:"一条龙",d:"打出同花顺",hx:typed("sflush")},
 {id:"pl",n:"钢板",d:"打出钢板（两个连着的三张）",hx:typed("plate")},
 {id:"tb",n:"木板",d:"打出三连对",hx:typed("tube")},
 {id:"h1",n:"有点疼",d:"一手打出 1,000 伤害",hx:x=>x&&x.total>=1e3},
 {id:"h2",n:"很疼",d:"一手打出 10,000 伤害",hx:x=>x&&x.total>=1e4},
 {id:"h3",n:"疼死了",d:"一手打出 100,000 伤害",hx:x=>x&&x.total>=1e5},
 {id:"h4",n:"百万一击",d:"一手打出 1,000,000 伤害",hx:x=>x&&x.total>=1e6},
 {id:"sk",n:"压着打",d:"连续 5 手压住对手",hx:x=>x&&x.streak>=5},
 {id:"bu",n:"池子开花",d:"一手里奶蛙池消除 3 次",hx:x=>x&&x.bursts>=3},
 {id:"os",n:"一手送走",d:"第一手就打空首领的血",hx:x=>x&&x.first&&G.boss&&G.score>=G.target},
 {id:"tw",n:"双生炸弹",d:"用双生牌凑出炸弹",hx:x=>x&&x.isBomb&&x.cards.some(c=>c.en==="twin")},
 {id:"s4",n:"出了村子",d:"走到第 4 站",ok:()=>G&&G.lvIdx>=3},
 {id:"s8",n:"半路英雄",d:"走到第 8 站",ok:()=>G&&G.lvIdx>=7},
 {id:"wn",n:"从 2 打到 A",d:"通关一次",ok:()=>M.wins>0},
 {id:"w3",n:"老手",d:"难度 3 以上通关",ok:()=>M.maxDiff>=4},
 {id:"h2w",n:"换个主角也行",d:"用 2 个不同的主角通关",ok:()=>M.winHero.length>=2},
 {id:"en",n:"停不下来",d:"无尽模式走到第 2 轮",ok:()=>G&&G.endless&&(G.loop||0)>=2},
 {id:"fu",n:"画符的",d:"一共用掉 10 张符咒",ok:()=>M.cnt.fu>=10},
 {id:"mb",n:"秘宝开光",d:"用一次秘宝",ok:()=>M.cnt.mb>=1},
 {id:"p5",n:"满员",d:"同时有 5 个伙伴",ok:()=>G&&G.partners&&G.partners.length>=5},
 {id:"lg",n:"传说来了",d:"拥有一个传说伙伴",ok:()=>G&&G.partners&&G.partners.some(id=>PARTNERS[id]&&PARTNERS[id].r==="L")},
 {id:"gl",n:"碎碎平安",d:"碎掉一张玻璃牌",ok:()=>G&&(G.glassBroken||0)>0},
 {id:"g50",n:"小金库",d:"同时攒下 50 金币",ok:()=>G&&G.gold>=50},
 {id:"dS",n:"精兵",d:"牌组少于 80 张",ok:()=>G&&G.deck&&G.deck.length>0&&G.deck.length<80},
 {id:"dL",n:"大军",d:"牌组多于 130 张",ok:()=>G&&G.deck&&G.deck.length>130},
 {id:"tr5",n:"收贡专业户",d:"一共收下 5 次首领进贡",ok:()=>M.cnt.trib>=5},
 {id:"bb",n:"首领克星",d:"打败过 12 种不同的首领",ok:()=>M.beatBoss.length>=12}];
const ACH_ICON='<svg viewBox="0 0 40 40"><path d="M12 2h16l-3 12H15z" fill="var(--a2)"/><circle cx="20" cy="25" r="12" fill="var(--a1)" stroke="#1d1418" stroke-width="3"/><path d="M20 18l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#fff7d6"/></svg>';
const achQ=[];let achBusy=false;
function achPop(A){achQ.push(A);if(achBusy)return;const next=()=>{const a=achQ.shift();if(!a){achBusy=false;return}achBusy=true;let d=$("#achT");if(!d){d=document.createElement("div");d.id="achT";$("#stage").appendChild(d)}
  d.innerHTML=`<i>${ACH_ICON}</i><div><small>达成成就</small><b>${a.n}</b><em>${a.d}</em></div>`;d.classList.remove("on");void d.offsetWidth;d.classList.add("on");try{SFX.chain(6);setTimeout(()=>SFX.shine(),160)}catch(e){}
  const nb=BACKS.find(b=>b.need===M.ach.length);if(nb)setTimeout(()=>toast(`<b>新牌背！</b>「${nb.n}」　在「成就」里换上`),2700);
  setTimeout(()=>{d.classList.remove("on");setTimeout(next,300)},achQ.length?1500:2400)};next()}
function achCheck(x){let got=0;for(const A of ACH){if(M.ach.includes(A.id))continue;let ok=false;try{ok=A.hx?!!A.hx(x):!!(A.ok&&A.ok())}catch(e){}if(ok){M.ach.push(A.id);got++;achPop(A)}}if(got)saveMeta()}

/* 挂到游戏流程上 */
{const _p=playSel;playSel=async function(){if(G)G.lastX=null;const r=await _p.apply(this,arguments);try{if(G&&G.lastX&&G.tut!==2){achCheck(G.lastX);achCheck()}}catch(e){}if(G)G.lastX=null;return r}}
{const _s=shopRender;shopRender=function(){_s.apply(this,arguments);achCheck()}}
{const _b=blindSelect;blindSelect=function(){_b.apply(this,arguments);achCheck()}}
{const _w=runWin;runWin=function(){if(G&&G.hero)addTo("winHero",G.hero);const r=_w.apply(this,arguments);achCheck();return r}}
{const _u=consUse;consUse=function(i){const k=G.cons[i];const n=G.cons.length;_u.apply(this,arguments);if(G.cons.length<n){if(MB[k])M.cnt.mb++;else M.cnt.fu++;addTo("gotC",k);saveMeta();achCheck()}}}
{const _g=consGive;consGive=function(k){const r=_g.apply(this,arguments);if(r)addTo("gotC",k);return r}}
{const _sb=startBlind;startBlind=function(){const r=_sb.apply(this,arguments);try{if(G.tut!==2)addTo("metFoe",G.boss?(G.boss==="bx2"?"bx":G.boss):foeKey(G.lvIdx,G.blind))}catch(e){}return r}}

/* ---------- 牌背：成就攒到 5 / 10 / 15 / 20 / 25 个各解锁一款 ---------- */
const BACKS=[
 {id:"red",n:"红条纹",need:0,bg:"repeating-linear-gradient(45deg,#d4141c 0 9px,#a3101a 9px 18px)"},
 {id:"tea",n:"奶茶格",need:5,bg:"repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 3px,transparent 3px 14px),repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 3px,transparent 3px 14px),linear-gradient(#b27a4a,#8a5a34)"},
 {id:"jade",n:"青瓷",need:10,bg:"radial-gradient(circle at 50% 50%,transparent 0 6px,rgba(255,255,255,.18) 6px 8px,transparent 8px) 0 0/18px 18px,linear-gradient(135deg,#2f8f86,#1d5f66)"},
 {id:"night",n:"夜空",need:15,bg:"radial-gradient(circle at 20% 30%,#fff 0 1.5px,transparent 2px) 0 0/22px 22px,radial-gradient(circle at 70% 70%,#ffe28a 0 1.5px,transparent 2px) 0 0/30px 30px,linear-gradient(160deg,#2b2a6e,#141236)"},
 {id:"gold",n:"金箔",need:20,bg:"repeating-linear-gradient(45deg,rgba(255,255,255,.22) 0 4px,transparent 4px 12px),linear-gradient(135deg,#f6d56a,#c8902a 55%,#f3cf63)"},
 {id:"rain",n:"彩虹",need:25,bg:"repeating-linear-gradient(45deg,rgba(255,255,255,.18) 0 6px,transparent 6px 14px),linear-gradient(135deg,#ff6b6b,#ffb84d,#ffe66d,#6bd68a,#5ab8ff,#a77bff)"}];
const backOk=b=>M.ach.length>=b.need;
function applyBack(){const b=BACKS.find(x=>x.id===lsGet("back"))||BACKS[0];document.documentElement.style.setProperty("--bk",backOk(b)?b.bg:BACKS[0].bg)}
addEventListener("load",applyBack);

/* ---------- 成就界面 ---------- */
function achScreen(){SFX.click();const cur=lsGet("back")||"red";
 ov(`<div class="box achBox"><h2>成就 <small>${M.ach.length} / ${ACH.length}</small></h2>
  <div class="bkRow"><span>牌背</span>${BACKS.map(b=>{const ok=backOk(b);return`<button class="bkC ${ok?"":"lock"} ${b.id===cur&&ok?"on":""}" data-b="${b.id}" title="${b.n}"><i style="background:${b.bg}"></i><em>${ok?b.n:b.need+" 个成就"}</em></button>`}).join("")}</div>
  <div class="achGrid">${ACH.map(A=>{const ok=M.ach.includes(A.id);return`<div class="achC ${ok?"ok":""}"><i>${ACH_ICON}</i><div><b>${A.n}</b><p>${A.d}</p></div></div>`}).join("")}</div>
  <button class="btn" onclick="closeOv()">关上</button></div>`);
 $$(".bkC").forEach(e=>e.onclick=()=>{const b=BACKS.find(x=>x.id===e.dataset.b);if(!backOk(b)){SFX.bad();toast(`攒够 ${b.need} 个成就解锁`);return}lsSet("back",b.id);applyBack();SFX.pick();achScreen()})}

/* ---------- 图鉴：伙伴 / 符咒秘宝 / 首领 / 对手 ---------- */
function cdxTop(on){return`<div class="cdxTop">${[["p","伙伴"],["c","符咒 · 秘宝"],["b","首领"],["f","对手"]].map(([k,n])=>`<button class="cdxT ${k===on?"on":""}" data-k="${k}">${n}</button>`).join("")}</div>`}
function cdxBind(){$$(".cdxTop .cdxT").forEach(b=>b.onclick=()=>{SFX.click();const k=b.dataset.k;if(k==="p")codex();else cdxOther(k)})}
function cdxOther(k){let items=[],title="";
 if(k==="c"){title=`符咒 · 秘宝 · ${Object.keys(FU).length+Object.keys(MB).length} 张`;items=[...Object.keys(FU),...Object.keys(MB)].map(id=>{const D=FU[id]||MB[id],ok=M.gotC.includes(id);return`<div class="cdxC cdxK ${ok?"":"lock"} ${MB[id]?"rE":"rC"}"><span class="cdxIc">${consHTML(id)}</span><div><b>${ok?D.n:"？？？"}</b><em>${MB[id]?"秘宝":"符咒"}</em><p>${ok?D.d:"拿到一次就会记下来"}</p></div></div>`})}
 if(k==="b"){const ks=[...new Set(STATION_BOSS)];title=`首领 · 打败过 ${M.beatBoss.length} / ${ks.length}`;items=ks.map(id=>{const B=BOSSES[id],met=M.metFoe.includes(id),won=M.beatBoss.includes(id),i=STATION_BOSS.indexOf(id);return`<div class="cdxC ${met?"":"lock"} ${won?"rL":"rR"}"><img src="${IMG(B.img)}"><div><b>${met?B.n:"？？？"}</b><em>第 ${i+1} 站首领${won?" · 打败过":""}</em><p>${met?B.d:"还没遇到过"}</p>${won&&TRIB[id]?`<p class="cdxTr">进贡：${TRIB[id].d}</p>`:""}</div></div>`})}
 if(k==="f"){const ks=Object.keys(FOES);title=`对手 · 遇到过 ${ks.filter(x=>M.metFoe.includes(x)).length} / ${ks.length}`;items=ks.map(id=>{const F=FOES[id],met=M.metFoe.includes(id);return`<div class="cdxC ${met?"":"lock"} rC"><img src="${IMG(F.img)}"><div><b>${met?F.n:"？？？"}</b><em>${met?"对手":"还没遇到过"}</em><p>${met?F.d:"往后走会遇到"}</p></div></div>`})}
 ov(`<div class="box cdx">${cdxTop(k)}<h2>${title}</h2><div class="cdxGrid">${items.join("")}</div><button class="btn" onclick="closeOv()">关上</button></div>`);cdxBind()}
{const _c=codex;codex=function(){_c();const bx=$(".cdx");if(bx){bx.insertAdjacentHTML("afterbegin",cdxTop("p"));cdxBind()}}}

/* ---------- 主页按钮 ---------- */
{const _t=titleScreen;titleScreen=function(){_t();const b=document.createElement("button");b.className="btn dark tAch";b.innerHTML=`成就 <small>${M.ach.length}/${ACH.length}</small>`;b.onclick=()=>{au();achScreen()};$("#title").appendChild(b)}}
