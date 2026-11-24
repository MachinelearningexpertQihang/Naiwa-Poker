/* ===================== 奶蛙牌 · 主程序 ===================== */
"use strict";
const VER="1.9";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const IMG=k=>"img/"+k+".webp";
let SPEED=1;
const sleep=ms=>new Promise(r=>setTimeout(r,ms/SPEED));
/* 随机数：平时用 Math.random；每日挑战用固定种子（G.rs），大家拿到一样的牌和商店 */
function rnd(){if(typeof G!=="undefined"&&G&&G.daily&&G.rs!=null){let t=(G.rs=(G.rs+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}return Math.random()}
const ri=n=>Math.floor(rnd()*n),pick=a=>a[ri(a.length)];
let G=null; // 这一局
SFX.drop=SFX.slide;SFX.bigwin=SFX.win;

/* ---------- 画面适配：1280×720 的舞台，按窗口缩放 ---------- */
/* 屏幕适配（照奶蛙之塔）：用真正看得见的那块区域（visualViewport），避开刘海和圆角；竖着拿手机时整个转过来 */
function safeIn(){let p=document.getElementById("safeProbe");if(!p){p=document.createElement("div");p.id="safeProbe";p.style.cssText="position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";document.body.appendChild(p)}const c=getComputedStyle(p);return{t:parseFloat(c.paddingTop)||0,r:parseFloat(c.paddingRight)||0,b:parseFloat(c.paddingBottom)||0,l:parseFloat(c.paddingLeft)||0}}
function fit(){const vv=window.visualViewport;let W=innerWidth,H=innerHeight,ox=0,oy=0;if(vv&&vv.width>0&&vv.height>0){W=Math.min(W,vv.width);H=Math.min(H,vv.height);ox=vv.offsetLeft||0;oy=vv.offsetTop||0}
 const de=document.documentElement;if(de.clientWidth>0)W=Math.min(W,de.clientWidth);if(de.clientHeight>0)H=Math.min(H,de.clientHeight);
 const st=$("#stage");if(!st)return;const port=H>W*1.05;let sf={t:0,r:0,b:0,l:0};try{sf=safeIn()}catch(e){}
 const aw=Math.max(100,W-sf.l-sf.r),ah=Math.max(100,H-sf.t-sf.b);st.style.left=(ox+sf.l+aw/2)+"px";st.style.top=(oy+sf.t+ah/2)+"px";
 const s=port?Math.min(aw/720,ah/1280):Math.min(aw/1280,ah/720);st.style.transform=port?`translate(-50%,-50%) rotate(90deg) scale(${s})`:`translate(-50%,-50%) scale(${s})`;
 document.body.classList.toggle("port",port);fit._k=innerWidth+"x"+innerHeight+(vv?"|"+vv.width+"x"+vv.height:"")}
function fitSoon(){[60,250,600,1200,2500].forEach(t=>setTimeout(fit,t))}
setInterval(()=>{const vv=window.visualViewport;if(fit._k!==innerWidth+"x"+innerHeight+(vv?"|"+vv.width+"x"+vv.height:""))fit()},700);
if(window.visualViewport)visualViewport.addEventListener("resize",fit);addEventListener("orientationchange",fitSoon);
addEventListener("load",()=>{try{if(window.toy&&toy.onContainerChange)toy.onContainerChange(()=>{fit();fitSoon()})}catch(e){}fitSoon()});
/* 屏幕上的一块区域 → 舞台里的坐标（转过来的时候也算对） */
function toStage(r){const st=$("#stage").getBoundingClientRect();if(document.body.classList.contains("port")){const s=st.height/1280;return{x:(r.top-st.top)/s,y:(st.right-r.right)/s,w:r.height/s,h:r.width/s}}const s=st.width/1280;return{x:(r.left-st.left)/s,y:(r.top-st.top)/s,w:r.width/s,h:r.height/s}}
addEventListener("resize",fit);

/* ---------- 牌 ---------- */
const lvNow=()=>G&&G.lvOff?0:LV_LIST[G?G.lvIdx:0];
const famOf=c=>c.s===4||c.en==="cham"?4:c.s;
/* 扑克牌面：2～10 按标准位置摆花色，J Q K 是奶蛙宫廷像，A 一个大花色，王是整张立绘 */
const PIPS={2:[[50,12],[50,88]],3:[[50,14],[50,50],[50,86]],4:[[29,14],[71,14],[29,86],[71,86]],5:[[29,14],[71,14],[50,50],[29,86],[71,86]],
 6:[[29,14],[71,14],[29,50],[71,50],[29,86],[71,86]],7:[[29,14],[71,14],[50,32],[29,50],[71,50],[29,86],[71,86]],8:[[29,14],[71,14],[50,32],[29,50],[71,50],[50,68],[29,86],[71,86]],
 9:[[29,14],[71,14],[29,38],[71,38],[50,50],[29,62],[71,62],[29,86],[71,86]],10:[[29,14],[71,14],[50,26],[29,38],[71,38],[29,62],[71,62],[50,74],[29,86],[71,86]]};
const COURT={11:"J",12:"Q",13:"K"};
/* 每一张牌都有自己的奶蛙：♠ 奶蛙一家、♥ 奶猫一家、♣ 奶鸡一家、♦ 奶马一家。点数 2..10、J、Q、K、A 各是一只（"!" 结尾表示翻个面） */
const CARD_ART={
 0:{2:"nw",3:"m2",4:"n2",5:"n3",6:"m4",7:"m5",8:"c2",9:"c3",10:"fj",11:"n1",12:"c4",13:"timefrog",14:"i5"},
 1:{2:"ct",3:"ctm",4:"ctl",5:"cty",6:"ctcc",7:"ct!",8:"ctm!",9:"ctl!",10:"cty!",11:"ctcc!",12:"ctar",13:"ctf",14:"ct"},
 2:{2:"ck",3:"ckg",4:"ckt",5:"ckb",6:"ckik",7:"cki",8:"ckr",9:"ckg!",10:"ckt!",11:"ckh",12:"ckar",13:"ckf",14:"ck"},
 3:{2:"hr",3:"hrg",4:"hrl",5:"hra",6:"hrc",7:"hrd",8:"hrw",9:"hrn",10:"hrz",11:"hrl!",12:"hrr",13:"hrar",14:"hr"}};
function cardArt(c){const k=((CARD_ART[c.s]||{})[c.r])||FAMS[famOf(c)].img;return k.endsWith("!")?[k.slice(0,-1),1]:[k,0]}
/* 数字牌的花色点：分在左右两列，单数多出来的那个放在最下面中间 */
function sidePips(n){const out=[],h=Math.floor(n/2),col=(x,k)=>{for(let i=0;i<k;i++)out.push([x,k===1?52:30+46*i/(k-1)])};col(12,h);col(88,h);if(n%2)out.push([50,91]);return out}
const suitSVG=(s,cls="")=>`<svg class="sv ${cls}" viewBox="0 0 100 100"><use href="#su${s}"/></svg>`;
function cardHTML(c,opt={}){const lv=lvNow();if(c.hid&&opt.inHand)return`<div class="card back ${c.frz?"frz":""} ${opt.cls||""}" data-id="${c.id}" style="${opt.st||""}"><div class="cWob"><i class="cSh"></i><div class="cIn"><b>？</b></div></div></div>`;
 const W=isWild(c,lv),J=c.s===4,red=c.s===1||c.s===3||c.r===17;const F=FAMS[famOf(c)];
 const rk=J?(c.r===17?"大王":"小王"):rankName(c.r);let mid;
 const art=cardArt(c);
 if(J)mid=`<div class="cArt"><img src="${IMG(JOKER_IMG[c.r])}" draggable="false"></div>`;
 else if(COURT[c.r])mid=`<div class="cCourt k${c.r}"><img src="${IMG(art[0])}" draggable="false"${art[1]?' class="fl"':""}></div>`;
 else if(c.r===14)mid=`<div class="cAce"><span class="cAceS">${suitSVG(c.s,"big")}</span><img src="${IMG(art[0])}" draggable="false"></div>`;
 else mid=`<div class="cFrog"><img src="${IMG(art[0])}" draggable="false"${art[1]?' class="fl"':""}></div>`;
 const kind=J?"jk":COURT[c.r]?"ct":c.r===14?"ac":"nm";
 return`<div class="card ${kind} ${red?"red":""} ${c.ed?"ed-"+c.ed:""} ${W?"wild":""} ${c.r===lv&&!J?"lvc":""} ${J?"joker":""} ${c.frz?"frz":""} ${c.mud?"mud":""} ${c.peek&&opt.inHand?"peek":""} ${opt.cls||""}" data-id="${c.id}" style="--fc:${F.c};${opt.st||""}">
 <div class="cWob"><i class="cSh"></i><div class="cIn"><i class="cBg"></i>
  <div class="cTL"><b>${rk}</b>${J?"":suitSVG(c.s,"cs")}</div>${mid}
  <div class="cBR"><b>${rk}</b>${J?"":suitSVG(c.s,"cs")}</div>
  ${W?`<em class="cTag">逢人配</em>`:c.r===lv&&!J?`<em class="cTag lv">级牌</em>`:""}
  ${c.seal?`<i class="cSeal"></i>`:""}${c.frz&&opt.inHand?`<i class="cFrz">${c.frz}</i>`:""}${c.mud&&opt.inHand?`<i class="cMud">泥</i>`:""}
  <i class="cFoil"></i><i class="cGlare"></i></div></div></div>`}
function sortHand(){const lv=lvNow();const key=c=>G.sortBy==="suit"?c.s*100+power(c.r,lv):power(c.r,lv)*10+c.s;G.hand.sort((a,b)=>key(b)-key(a))}

/* ---------- 一局开始 ---------- */
function newRun(hero,diff){hero=hero||"naiwa";diff=diff||0;G={hero,diff,lvIdx:0,blind:0,gold:diff>=3?0:4,deck:makeDeck().map(c=>({...c,ed:null,seal:null})),partners:[],hl:{},handsMax:4,discMax:3,handSize:11,sortBy:"rank",reroll:5,stats:{best:0,hands:0,types:{},beats:0},pst:{},foeSeed:ri(100)};
if(typeof HEROES!=="undefined"&&HEROES[hero]&&HEROES[hero].apply)HEROES[hero].apply(G);
 blindSelect()}
function targetOf(lvIdx,b){const d=G&&G.diff||0;return Math.round(LV_BASE[lvIdx]*BLINDS[b].m*(1+(d>=1?.15:0)+(d>=6?.2:0))/10)*10}
function foeKey(lvIdx,b){if(b===2)return bossOf(lvIdx);const Z=ZONE_FOES[Math.min(lvIdx,ZONE_FOES.length-1)];const k=(G.foeSeed||0)+lvIdx*7,L=Z.length;return Z[(k+b*(1+k%(L-1)))%L]}
function hdOf(lvIdx,b){const v=FOE_HD[foeKey(lvIdx,b)]||[0,0];const d=G.diff||0;return[Math.max(2,G.handsMax+v[0]-(d>=2&&b===2?1:0)),Math.max(0,G.discMax+v[1]-(d>=7?1:0))]}
function bossOf(lvIdx){return STATION_BOSS[Math.min(lvIdx,STATION_BOSS.length-1)]}
function foeOf(lvIdx,b){if(b===2){const k=bossOf(lvIdx),B=BOSSES[k];return{n:B.n,img:B.img,d:B.d,boss:1,say:B.say}}return FOES[foeKey(lvIdx,b)]}

/* ---------- 选关 ---------- */
function blindSelect(){show("blinds");const lv=lvNow();bgScene("lv",G.lvIdx);
 $("#blinds").innerHTML=`<div class="bsHead"><div class="bsTop"><span class="bsLoc">第 ${G.lvIdx+1} 站 · ${locOf(G.lvIdx).n}</span><span class="bsLine">${(LOC_LINE[G.lvIdx]||"").replace(/^[^。]*。/,"")}</span></div><h1>打 ${rankName(lv)}</h1><p>这一级 <b>${rankName(lv)}</b> 最大（比 A 还大），<b class="hred">红桃 ${rankName(lv)}</b> 是逢人配</p></div>
 <div class="bsRow">${BLINDS.map((B,i)=>{const boss=i===2?BOSSES[bossOf(G.lvIdx)]:null;return`<div class="bsCard ${boss?"boss":""} ${i===G.blind?"now":i<G.blind?"done":"later"}">
  <div class="bsName">${B.n}</div>${boss?`<img class="bsBoss" src="${IMG(boss.img)}"><b class="bsBn">${boss.n}</b><p class="bsBd">${boss.d}</p>`:(f=>`<img class="bsBoss" src="${IMG(f.img)}"><b class="bsBn">${f.n}</b><p class="bsBd">${f.d}</p>`)(foeOf(G.lvIdx,i))}
  <div class="bsT">血量<b>${targetOf(G.lvIdx,i).toLocaleString()}</b></div><div class="bsHD">${(h=>`出牌 <b class="${h[0]>G.handsMax?"up":h[0]<G.handsMax?"dn":""}">${h[0]}</b> · 弃牌 <b class="${h[1]>G.discMax?"up":h[1]<G.discMax?"dn":""}">${h[1]}</b>`)(hdOf(G.lvIdx,i))}</div><div class="bsG">过关 +${B.gold} 金币</div>
  ${i===G.blind?`<button class="btn gold" id="bsGo">开打</button>`:i<G.blind?`<div class="bsDone">过了</div>`:`<div class="bsDone">　</div>`}</div>`}).join("")}</div>
 <div class="bsFoot"><span>金币 <b>${G.gold}</b></span><span>第 ${G.lvIdx+1} / ${LV_LIST.length} 级</span></div>`;
 $("#bsGo").onclick=()=>{SFX.click();startBlind()}}

/* ---------- 一关开始 ---------- */
function startBlind(){G.target=targetOf(G.lvIdx,G.blind);G.score=0;const hd=hdOf(G.lvIdx,G.blind);G.handsLeft=hd[0];G.discLeft=hd[1];G.pool=[];G.first=true;G.prophecy=null;
 G.taken=[];G.invert=0;G.armor=0;G.curseSuit=-1;G.lvOff=0;G.snow=0;NOWILD=false;INVERT=false;G.deck.forEach(c=>{c.frz=0;c.mud=0;c.hid=0});G.draw=shuffleArr(G.deck.map(c=>c));G.hand=[];G.sel=new Set();G.boss=G.blind===2?bossOf(G.lvIdx):null;G.foe=foeOf(G.lvIdx,G.blind);
 bgScene(G.boss?"boss":"lv",G.lvIdx);
 G.newIds=new Set();G.streak=0;G.beatsThis=0;G.lastType=null;const B=G.boss&&BOSSES[G.boss];
 if(B&&B.start&&G.boss!=="v_bfallen"&&G.boss!=="xch")B.start(G);INVERT=!!G.invert;
 drawTo();G.upper=genUpper();G.nextUp=B&&B.dyn?null:genUpper();for(const id of G.partners){const P=PARTNERS[id];if(P.start){G.pst[id]=G.pst[id]||{};P.start(G,G.pst[id])}}
 if(B&&B.start&&(G.boss==="v_bfallen"||G.boss==="xch"))B.start(G);if(B&&B.turn)B.turn(G);
 show("play");render();SFX.shuffle();setTimeout(()=>{if(G&&G.foe)foeSayT(FOE_HI[foeKey(G.lvIdx,G.blind)],1)},450);if(B)setTimeout(bossSfx,700);if(B){setTimeout(()=>toast(`<b>首领 · ${B.n}</b><br>${B.d}`),500)}}
function drawTo(){let k=0;const got=[];while(G.hand.length<G.handSize&&G.draw.length){const c=G.draw.pop();G.hand.push(c);got.push(c);G.newIds.add(c.id);SFX.deal(k++)}const B=G.boss&&BOSSES[G.boss];if(B&&B.draw&&got.length)B.draw(G,got);sortHand()}

/* 上家的牌：小关小一点，首领关大一点 */
function genUpper(){const lv=lvNow();const tier=G.blind;const BB=G.boss&&BOSSES[G.boss];const lo=[3,6,9][tier],hi=[9,12,14][tier];const R=()=>lo+ri(hi-lo+1);const mk=(r,s)=>({id:"u"+ri(1e9),s:s==null?ri(4):s,r});
 let types=tier===0?["single","pair","pair","triple"]:tier===1?["pair","triple","straight","fullhouse","flush"]:["triple","fullhouse","straight","flush","tube","bomb4"];if(G.foe&&G.foe.like)types=types.concat(G.foe.like,G.foe.like);if(BB&&BB.bombs)types=BB.bombs;if(BB&&BB.snowT)types=[BB.snowT[Math.min(G.snow||0,BB.snowT.length-1)]];
 for(let k=0;k<20;k++){const t=pick(types);let cs=[];const r=R();
  if(t==="single")cs=[mk(r)];else if(t==="pair")cs=[mk(r,0),mk(r,2)];else if(t==="triple")cs=[mk(r,0),mk(r,2),mk(r,3)];
  else if(t==="fullhouse"){let p=R();if(p===r)p=r>3?r-1:r+1;cs=[mk(r,0),mk(r,2),mk(r,3),mk(p,0),mk(p,3)]}
  else if(t==="straight"){const st=Math.min(r,10);cs=[0,1,2,3,4].map(i=>mk(st+i,[0,2,3,0,2][i]))}
  else if(t==="flush"){const su=ri(4);const rs=shuffleArr([2,3,4,5,6,7,8,9,10,11,12,13,14].filter(x=>x!==lv)).slice(0,5);cs=rs.map(x=>mk(x,su))}
  else if(t==="tube"){const st=Math.min(r,12);cs=[0,1,2].flatMap(i=>[mk(st+i,0),mk(st+i,2)])}
  else if(t==="plate"){const st=Math.min(r,13);cs=[0,1].flatMap(i=>[mk(st+i,0),mk(st+i,2),mk(st+i,3)])}
  else if(/^bomb\d/.test(t)){const n=+t[4];const rr=3+ri(BB&&BB.final?10:7);cs=[...Array(n)].map((_,q)=>mk(rr,[0,2,3,0,1,2,3,0][q]))}
  const j=judge(cs,lv);if(j)return{cards:cs,j}}
 return{cards:[mk(5,0)],j:judge([mk(5,0)],lv)}}

/* ---------- 牌型等级（茶包升级） ---------- */
function handBase(t){const H=HANDS[t],L=G.hl[teaKey(t)]||0,T=TEA[teaKey(t)];return{c:H.c+L*T[0],m:H.m+L*T[1],L}}

/* ---------- 渲染 ---------- */
function show(id){$$(".scr").forEach(e=>e.classList.toggle("on",e.id===id));const inRun=id==="play"||id==="shop";["#side","#partners"].forEach(s=>$(s).style.display=inRun?(s==="#partners"?"flex":"block"):"none");$("#lvBox").style.display="none";if(inRun){renderSide();renderPartners();renderLv()}}
function render(){renderSide();renderPartners();renderLv();renderUpper();renderPool();renderHand();renderDeck();renderPreview()}
function renderSide(){const B=BLINDS[G.blind],boss=G.boss&&BOSSES[G.boss];const inShop=$("#shop.on");
 $("#side").innerHTML=`<div class="sdBlind ${boss?"boss":""}"><div class="sdBl"><img src="${IMG((G.foe||foeOf(G.lvIdx,G.blind)).img)}"></div><div class="sdBlInfo"><small>${inShop?"下一关":B.n}</small><div>${(G.foe||foeOf(G.lvIdx,G.blind)).n}</div><b>${(G.target||targetOf(G.lvIdx,G.blind)).toLocaleString()}<i style="font-style:normal;font-size:12px"> 血</i></b></div></div>
 ${boss&&!inShop?`<div class="sdBoss">${boss.d}</div>`:""}
 <div class="sdScore pan"><small>已经<br>打掉</small><div class="num"><span id="scoreN">${(inShop?0:G.score||0).toLocaleString()}</span><i class="bar" style="width:${inShop?0:Math.min(100,(G.score||0)/(G.target||1)*100)}%"></i></div><div class="runDmg">本局总伤害 <b id="runDmgN">${((G.stats&&G.stats.dmg)||0).toLocaleString()}</b></div></div>
 <div class="sdHand"><div id="hName">${inShop?"商店":"选几张牌"}</div><div class="cm"><b class="c" id="hChips">0</b><i>×</i><b class="m" id="hMult">0</b></div></div>
 <div class="sdRow"><div class="sdCnt h"><small>出牌</small><b>${inShop?G.handsMax:G.handsLeft}</b></div><div class="sdCnt d"><small>弃牌</small><b>${inShop?G.discMax:G.discLeft}</b></div></div>
 <div class="sdRow"><div class="sdGold"><small>金币</small><b>${G.gold}</b></div><div class="sdLv"><small>打几 · 第 ${G.lvIdx+1}/${LV_LIST.length} 级</small><b>${rankName(LV_LIST[G.lvIdx])}</b><em>${G.lvOff?"级牌失效了":"红桃"+rankName(LV_LIST[G.lvIdx])+" 逢人配"}</em></div></div>
 <div class="sdBtns"><button class="btn dark sm" id="sdHands">牌型</button><button class="btn dark sm" id="sdDeck">牌组</button><button class="btn dark sm" id="sdMenu">菜单</button></div>`;
 $("#sdHands").onclick=handTable;$("#sdDeck").onclick=deckView;$("#sdMenu").onclick=()=>gameMenu()}
function renderLv(){const lv=lvNow();$("#lvBox").innerHTML=`<div class="lvT"><span>打</span><b>${rankName(lv)}</b><span style="font-size:12px;opacity:.8">第 ${G.lvIdx+1} 级 · ${BLINDS[G.blind].n}</span></div><p><b>${rankName(lv)}</b> 是级牌，比 A 大，算 15 个筹码。<br><em>红桃 ${rankName(lv)}</em> 是逢人配，能当王以外的任何一张牌。</p>`}
/* 伙伴卡：像小丑牌一样是一张牌 */
const RAR_C={C:"#8fa3b8",R:"#4f8cff",E:"#b05aff",L:"#ffb800"};
function partnerCard(id,cls=""){const P=PARTNERS[id];return`<div class="pc r${P.r} ${cls}" style="--rc:${RAR_C[P.r]}"><div class="pcIn"><i class="pcBg"></i><img src="${IMG(P.img)}" draggable="false"><b class="pcN">${P.n}</b><i class="pcGem"></i>${P.r==="E"||P.r==="L"?`<i class="pcHolo"></i>`:""}${P.r==="L"?`<i class="pcSpk"><b></b><b></b><b></b></i>`:""}<i class="pcShine"></i><i class="cGlare"></i></div><em class="pcR">${RAR_N[P.r]}</em></div>`}
function renderPartners(){$("#partners").innerHTML=[...Array(Math.max(5,G.pmax||5)).keys()].map(i=>{const id=G.partners[i];if(!id)return`<div class="pSlot"></div>`;return`<div class="pCard" data-i="${i}" style="--i:${i};--rc:${RAR_C[PARTNERS[id].r]}">${partnerCard(id)}</div>`}).join("")+`<span class="pCnt">伙伴 ${G.partners.length}/${G.pmax||5}</span>`;
 $$("#partners .pCard").forEach(e=>{e.onclick=()=>partnerTip(+e.dataset.i,e);tiltOn(e.querySelector(".pc"))})}
function partnerDesc(id){const st=G.pst[id]||{};return PARTNERS[id].d.replace("{v}",st.v||0)}
function partnerTip(i,el){const id=G.partners[i],P=PARTNERS[id];SFX.click();tip(el,`<b>${P.n}</b><em class="ptT">${P.t}流</em><p>${partnerDesc(id)}</p><button class="btn sm" id="pSell">卖掉 +${Math.floor(P.p/2)}</button>`);$("#pSell").onclick=()=>{G.partners.splice(i,1);G.gold+=Math.floor(P.p/2);SFX.coin();closeTip();renderSide();renderPartners();if($("#shop.on"))shopRender()}}
function renderUpper(){const u=G.upper,f=G.foe;const BB=G.boss&&BOSSES[G.boss];if(!u||!f){$("#upper").innerHTML="";return}const hp=Math.max(0,G.target-G.score);
 $("#upper").innerHTML=`<div class="foe ${f.boss?"boss":""}"><div class="foeImg"><img src="${IMG(f.img)}"><i class="foeSay"></i></div><div class="foeInfo"><b class="foeN">${f.boss?`<em>首领</em>`:""}${f.n}</b><div class="hpBar"><i style="width:${hp/G.target*100}%"></i><span>${hp.toLocaleString()}</span></div></div></div>
 <div class="upR"><div class="upLbl">它出了<b>${HANDS[u.j.type].n}</b><span class="upInt">${G.nextUp?`下一手：<b>${HANDS[G.nextUp.j.type].n}</b>`:BB&&BB.dyn?"下一手：<b>更大</b>":""}</span></div><div class="upCards">${u.cards.map((c,k)=>cardHTML(c,{cls:"mini up2"+(G.upFresh?" upIn":""),st:"--i:"+k})).join("")}</div>
 <div class="upMeta"><span class="upHint">压住 <b>×${(G.partners.includes("v_archer")?2:1.5)}</b> · 压不住 <b class="m">×${BB&&BB.missX||G.eMiss||((G.diff||0)>=8?.6:.75)}</b></span>${BB&&BB.line?`<span class="upPro">${BB.line(G)}</span>`:""}${INVERT?`<span class="upPro">倒转：越小越大</span>`:""}</div></div>`}
function renderPool(fresh){G.upFresh=0;const P=G.pool||[];$("#pool").innerHTML=`<div class="plTop"><span>奶蛙池</span><span>同一家凑齐 3 只就消除</span></div><div class="plSlots">${[...Array(7)].map((_,i)=>{const t=P[i];return t==null?`<i class="tok e"></i>`:`<i class="tok ${fresh&&i===P.length-1?"new":""}" style="--fc:${FAMS[t].c}"><img src="${IMG(FAMS[t].img)}"></i>`}).join("")}</div>
 <div class="plFam">${FAMS.slice(0,4).map((F,i)=>`<span style="--fc:${F.c}"><i></i>${SUITS[i]}${F.n} ${F.burst}</span>`).join("")}</div>`}
function renderDeck(){const n=G.draw.length;$("#deck").innerHTML=[0,1,2,3].slice(0,Math.max(1,Math.ceil(n/27))).map(k=>`<i style="--k:${k}"></i>`).join("")+`<b>${n} / ${G.deck.length}</b>`;$("#deck").onclick=deckView}
function renderHand(){const h=$("#hand");const n=G.hand.length;h.innerHTML=G.hand.map((c,i)=>{const a=i-(n-1)/2;const nw=G.newIds&&G.newIds.has(c.id);return cardHTML(c,{inHand:1,cls:(G.sel.has(c.id)?"sel ":"")+(nw?"deal":""),st:`--i:${i};--a:${a};--aa:${Math.abs(a)};--d:${nw?[...G.newIds].indexOf(c.id):0};--dx:${700-i*60}px`})}).join("");G.newIds=new Set();
 $$("#hand .card").forEach(e=>{e.onclick=()=>{const id=+e.dataset.id;const c=G.hand.find(x=>x.id===id);if(!c||G.busy)return;if(c.hid){c.hid=0;c.peek=1;SFX.peek();renderHand();renderPreview();return}if(c.peek){toast("刚翻开的牌，这一手还出不了");SFX.bad();return}if(c.frz){toast(`这张牌被冻住了，还要 ${c.frz} 手才化开`);SFX.bad();return}if(c.mud){toast("这张牌被泥巴糊住了，这一手出不了");SFX.bad();return}if(G.sel.has(id)){G.sel.delete(id);SFX.unpick()}else{if(G.sel.size>=8){toast("一次最多出 8 张");return}G.sel.add(id);SFX.pick()}e.classList.toggle("sel",G.sel.has(id));renderPreview()};tiltOn(e)})}
function selCards(){return G.hand.filter(c=>G.sel.has(c.id))}
function renderPreview(){const cs=selCards();const hidSel=cs.some(c=>c.hid);const j=cs.length&&!hidSel?judgeX(cs,lvNow()):null;const pv=$("#hName");if(!pv)return;
 if(!cs.length){pv.innerHTML="选几张牌";setCMv(0,0)}
 else if(hidSel){pv.innerHTML=`<span class="bad">有看不见的牌</span>`;setCMv("?","?")}
 else if(!j){pv.innerHTML=`<span class="bad">不是牌型</span>`;setCMv(0,0)}
 else{const b=handBase(j.type);const bt=beats(j,G.upper&&G.upper.j);pv.innerHTML=`${HANDS[j.type].n}${b.L?` <small>Lv${b.L+1}</small>`:""}${bt?`<span class="beat">压得住</span>`:""}`;setCMv(b.c,b.m)}
 $("#selN").textContent=cs.length?`选了 ${cs.length} 张`:"";
 $("#bPlay").disabled=!(j||hidSel)||G.handsLeft<=0||G.busy;$("#bDisc").disabled=!cs.length||G.discLeft<=0||G.busy}
function setCMv(c,m){$("#hChips").textContent=c;$("#hMult").textContent=m;$("#hChips").classList.remove("fire");$("#hMult").classList.remove("fire")}

/* ---------- 出牌 ---------- */
async function playSel(){const cs=selCards();const lv=lvNow();if(!cs.length||G.busy||G.handsLeft<=0)return;const hidSel=cs.some(c=>c.hid);const j=judgeX(cs,lv);if(!j&&!hidSel)return;G.busy=1;cs.forEach(c=>c.hid=0);renderPreview();
 G.handsLeft--;G.sel.clear();
 const order=G.hand.filter(c=>cs.includes(c));G.hand=G.hand.filter(c=>!cs.includes(c));renderHand();renderSide();
 const tb=$("#table");tb.innerHTML=`<div class="tbCards">${order.map((c,k)=>cardHTML(c,{cls:"played",st:`--k:${k};--i:${k}`})).join("")}</div>`;SFX.slam();G.chainN=0;if(j)bigHandFx(j,order);await sleep(360);
 if(!j){SFX.bad();bigPop("凑错了！这一手作废","miss");await sleep(900);tb.classList.add("out");await sleep(300);tb.innerHTML="";tb.classList.remove("out");G.first=false;G.streak=0;G.busy=0;return nextTurn(null)}
 const x={type:j.type,cards:order,lv,lvIdx:G.lvIdx,first:G.first,beat:beats(j,G.upper&&G.upper.j),bursts:0,destroy:[],last:G.handsLeft===0,isBomb:/^bomb|rocket/.test(j.type),prev:G.lastType};x.streak=x.beat?(G.streak||0)+1:0;const b=handBase(j.type);x.chips=b.c;x.mult=b.m;
 const B=G.boss&&BOSSES[G.boss];
 setCM(x);$("#hName").innerHTML=`${HANDS[j.type].n}${x.beat?`<span class="beat">压住了</span>`:""}`;await sleep(260);
 let k=0;for(const c of order){const el=$$("#table .card")[k++];
  if(B&&B.skip&&B.skip(c,G)){popOn(el,"不计分","bad");SFX.bad();await sleep(240);continue}
  const reps=c.seal==="echo"?(G.partners.includes("egsk")?3:2):1;for(let rp=0;rp<reps;rp++){if(rp){popOn(el,"回响！","xm");SFX.xmult();await sleep(200)}
  el&&el.classList.remove("hit");void(el&&el.offsetWidth);el&&el.classList.add("hit");
  const cc=cardChips(c,lv)+(c.en==="ice"?(G.partners.includes("nx")?30:15)*(c.age||0):0);x.chips+=cc;popOn(el,"+"+cc,"chip");SFX.chip(k);setCM(x);await sleep(190);
  if(c.ed==="foil"){x.chips+=30;popOn(el,"+30","chip");SFX.chip(k+2);setCM(x);await sleep(190)}
  if(c.ed==="poly"){x.mult=r1(x.mult*1.5);popOn(el,"×1.5","xm");SFX.xmult();setCM(x);await sleep(220)}
  if(c.en==="glass"){x.mult=r1(x.mult*2);popOn(el,"×2","xm");SFX.xmult();setCM(x);await sleep(220)}
  if(c.en==="lucky"){if(rnd()<.2){x.mult+=20;popOn(el,"幸运 +20 倍率","mult");SFX.mult(4);setCM(x);await sleep(220)}if(rnd()<1/15){G.gold+=20;popOn(el,"幸运 +20 金币","gold");SFX.coins();renderSide2();await sleep(220)}}
  if(c.seal==="press"&&x.beat){x.mult+=10;popOn(el,"压印 +10 倍率","mult");SFX.mult(3);setCM(x);await sleep(200)}
  if(c.seal==="coin"&&!rp){const gv=G.partners.includes("ckg")?6:3;G.gold+=gv;popOn(el,`+${gv} 金币`,"gold");SFX.coin();await sleep(180)}
  }
  c.age=0;const n=1+(c.seal==="frog"?1:0)+G.partners.filter(id=>PARTNERS[id].poolX).length;for(let q=0;q<n;q++){const got=poolAdd(famOf(c));renderPool(true);for(const f of got){x.bursts++;applyBurst(f,x);SFX.burst();bgKick(.25);popOn($("#pool"),`${FAMS[f].n}消除：${FAMS[f].burst}`,"burst");renderSide2();setCM(x);await sleep(300);
   for(const id of G.partners){const P=PARTNERS[id];if(P.burst){x.self=G.pst[id]=(G.pst[id]||{});const t=P.burst(x,f,G);if(t){partnerPulse(id,t);SFX.mult(2);renderSide2();setCM(x);await sleep(220)}}}}}}
 for(const c of G.hand){if(c.en==="steel"){x.mult=r1(x.mult*1.5);const el=$(`#hand .card[data-id="${c.id}"]`);popOn(el,"钢 ×1.5","xm");SFX.xmult();setCM(x);await sleep(200)}for(const id of G.partners){const P=PARTNERS[id];if(P.held){x.self=G.pst[id]=(G.pst[id]||{});const t=P.held(x,c,G);if(t){const el=$(`#hand .card[data-id="${c.id}"]`);popOn(el,t,popCls(t));partnerPulse(id);setCM(x);await sleep(190)}}}}
 for(const id of G.partners){const P=PARTNERS[id];if(P.hand){x.self=G.pst[id]=(G.pst[id]||{});const t=P.hand(x,G);if(t){partnerPulse(id,t);t.includes("×")?SFX.xmult():SFX.mult(3);setCM(x);await sleep(260)}}}
 if(typeof extraHand==="function"){for(const t of (extraHand(x,G)||[])){popOn($("#setBar")||$("#partners"),t,popCls(t)+" big");t.includes("×")?SFX.xmult():SFX.mult(4);setCM(x);await sleep(320)}}
 if(B&&B.hand){const t=B.hand(x,G);if(t){toast(t);SFX.bad();setCM(x);await sleep(280)}}
 if(x.beat){const bx=x.beatX||1.5;x.mult=r1(x.mult*bx);SFX.beat();bigPop(`压住了！×${bx}`,"beat");bgKick(.4);foeSay(0);setCM(x);await sleep(460)}
 else if(x.noMiss){bigPop("盾斗士顶住了","beat");setCM(x);await sleep(360)}
 else{const mx=B&&B.missX||G.eMiss||((G.diff||0)>=8?.6:.75);x.mult=Math.max(1,r1(x.mult*mx));SFX.bad();bigPop(`没压住 ×${mx}`,"miss");foeSay(1);setCM(x);await sleep(460)}
 x.total=Math.floor(x.chips*x.mult);
 if(B&&B.after){const t=B.after(x,G);if(t)toast(t)}
 if(G.armor>0&&x.total>0){if(x.isBomb){toast("炸弹无视岩甲！")}else{const hit=x.beat?x.total*2:x.total;const ab=Math.min(G.armor,hit);G.armor-=ab;x.total=Math.max(0,Math.round(x.total-(x.beat?ab/2:ab)));toast(G.armor>0?`岩甲挡住了伤害（护甲还剩 ${G.armor.toLocaleString()}）`:"岩甲碎了！");renderUpper()}}
 const big=x.total>=G.target*.5;if(big){shake();bgKick(.8)}
 SFX.score();bigPop(x.total.toLocaleString(),"score");foeHit(x.total);await countScore(x.total);
 G.lastX=x;G.streak=x.streak;G.lastType=x.type;if(x.beat)G.beatsThis=(G.beatsThis||0)+1;
 {const S=G.stats;S.hands++;S.best=Math.max(S.best,x.total);S.dmg=(S.dmg||0)+x.total;S.types[x.type]=(S.types[x.type]||0)+1;if(x.beat)S.beats++}
 if(B&&B.snowT&&x.beat)G.snow++;
 for(const c of order){if(c.en==="glass"&&c.seal!=="guard"&&rnd()<.25&&!x.destroy.includes(c)){x.destroy.push(c);G.glassBroken=(G.glassBroken||0)+1;toast("玻璃牌碎了")}}
 if(x.destroy.length){const ds=new Set(x.destroy);G.deck=G.deck.filter(c=>!ds.has(c));$$("#table .card").forEach((e,i)=>{if(ds.has(order[i]))e.classList.add("boom")});SFX.bad();bgKick(.6);toast(`${x.destroy.length} 张牌被移出了牌组（还剩 ${G.deck.length} 张）`);await sleep(500)}

 G.first=false;tb.classList.add("out");await sleep(300);tb.innerHTML="";tb.classList.remove("out");
 if(B&&B.post){const t=B.post(G,x);if(t){toast(t);G.boss==="sny"?SFX.burn():SFX.bad();renderPool();renderHand();await sleep(500)}}
 if(G.score>=G.target&&B&&B.final===1){await finalPhase();G.busy=0;return}
 G.busy=0;return nextTurn(x)}
/* 下一手：对手出新牌，抓牌，首领动手 */
function nextTurn(x){const B=G.boss&&BOSSES[G.boss];
 if(G.score>=G.target)return blindWin();
 if(G.handsLeft<=0)return gameOver();
 G.upper=G.nextUp||genUpper();G.nextUp=B&&B.dyn?null:genUpper();G.upFresh=1;
 G.hand.forEach(c=>{c.peek=0;if(c.en==="ice")c.age=(c.age||0)+1});drawTo();if(B&&B.turn){B.turn(G);bossSfx()}render();SFX.foeplay(G.upper.cards.length)}
function bossSfx(){if(G.boss==="pp")SFX.mud();else if(G.boss==="xch")SFX.freeze()}
/* 大魔王：第一形态被打倒以后 */
async function finalPhase(){await foeKO();SFX.bad();await sleep(300);
 await storyPlay([["bx","奶蛙大魔王","……打得不错。"],["bx","奶蛙大魔王","那就不用藏了。"],["e_bx","阿岳","这一局，我想认真打。"]]);
 G.boss="bx2";G.handsLeft=Math.max(2,G.handsMax+1);G.discLeft=G.discMax;const B=BOSSES.bx2;G.foe={n:B.n,img:B.img,d:B.d,boss:1,say:B.say};G.target=Math.round(G.target*.8);G.score=0;G.lvOff=1;NOWILD=true;G.streak=0;
 G.upper=genUpper();G.nextUp=genUpper();G.upFresh=1;drawTo();bgKick(1.2);shake();render();toast(`<b>阿岳·真身</b><br>${B.d}`);setTimeout(()=>foeSayT(FOE_HI.bx2,1),600)}
const r1=v=>Math.round(v*10)/10;
const popCls=t=>t.includes("×")?"xm":t.includes("倍率")?"mult":t.includes("金币")?"gold":"chip";
function renderSide2(){const h=$(".sdCnt.h b"),d=$(".sdCnt.d b");if(h)h.textContent=G.handsLeft;if(d)d.textContent=G.discLeft}
function applyBurst(f,x){if(f===0||f===4)x.mult+=4;else if(f===3)x.chips+=30;else if(f===1)G.discLeft++;else if(f===2)G.handsLeft++}
function poolAdd(f){const P=G.pool;let at=P.length;for(let i=P.length-1;i>=0;i--)if(P[i]===f){at=i+1;break}P.splice(at,0,f);const out=[];
 for(let g=0;g<6;g++){let hit=-1,fam=-1;for(let i=0;i+3<=P.length;i++){const w=P.slice(i,i+3);const real=w.filter(v=>v!==4);if(!real.length||real.every(v=>v===real[0])){hit=i;fam=real.length?real[0]:4;break}}if(hit<0)break;P.splice(hit,3);out.push(fam)}
 while(P.length>7)P.shift();return out}
async function discardSel(){const cs=selCards();if(!cs.length||G.discLeft<=0||G.busy)return;G.busy=1;G.discLeft--;G.sel.clear();for(const id of G.partners){const P=PARTNERS[id];if(P.disc){G.pst[id]=G.pst[id]||{};const t=P.disc(cs,G,G.pst[id]);if(t)partnerPulse(id,t)}}
 cs.forEach(c=>{const e=$(`#hand .card[data-id="${c.id}"]`);if(e)e.classList.add("gone")});SFX.slide();await sleep(260);
 G.hand=G.hand.filter(c=>!cs.includes(c));drawTo();G.busy=0;render()}

/* ---------- 对手 ---------- */
function foeSay(i){if(G.foe)foeSayT(G.foe.say[i])}
function foeSayT(t,long){const el=$(".foeSay");if(!el||!t)return;el.textContent=t;el.classList.remove("on","long");void el.offsetWidth;el.classList.add("on");if(long)el.classList.add("long")}
function foeHit(dmg){const im=$(".foeImg");if(!im)return;im.classList.remove("hit");void im.offsetWidth;im.classList.add("hit");popOn(im,"-"+dmg.toLocaleString(),"dmg");SFX.beat()}
function hpSet(){const b=$(".hpBar i"),s=$(".hpBar span");if(!b)return;const hp=Math.max(0,G.target-G.score);b.style.width=hp/G.target*100+"%";s.textContent=hp.toLocaleString()}
async function foeKO(){const im=$(".foeImg");if(!im)return;foeSay(2);im.classList.add("ko");bgKick(1);shake();await sleep(900)}

/* ---------- 算分动画 ---------- */
function setCM(x){const c=$("#hChips"),m=$("#hMult");c.textContent=Math.round(x.chips).toLocaleString();m.textContent=r1(x.mult).toLocaleString();[c,m].forEach(e=>{e.classList.remove("pump");void e.offsetWidth;e.classList.add("pump")});
 const hot=x.chips*x.mult>=G.target*.5;c.classList.toggle("fire",hot);m.classList.toggle("fire",hot)}
async function countScore(t){const s0=G.score,el=$("#scoreN");const N=22;for(let i=1;i<=N;i++){G.score=Math.round(s0+t*(1-Math.pow(1-i/N,3)));el.textContent=G.score.toLocaleString();hpSet();{const rd=$("#runDmgN");if(rd)rd.textContent=(((G.stats&&G.stats.dmg)||0)+G.score-s0).toLocaleString()}if(i%3===0)SFX.chip(i/3);await sleep(26)}const bar=$(".sdScore .bar");if(bar)bar.style.width=Math.min(100,G.score/G.target*100)+"%"}
function stagePt(el){const R=toStage(el.getBoundingClientRect());return{x:R.x+R.w/2,y:R.y}}
function popOn(el,t,cls){if(!el)return;const p=stagePt(el);const d=document.createElement("div");d.className="pop "+cls;d.textContent=t;d.style.left=p.x+"px";d.style.top=(p.y-6)+"px";$("#fx").appendChild(d);setTimeout(()=>d.remove(),900)}
function bigPop(t,cls=""){const d=document.createElement("div");d.className="bigPop "+cls;d.textContent=t;$("#fx").appendChild(d);setTimeout(()=>d.remove(),1150)}
function partnerPulse(id,t){const i=G.partners.indexOf(id);const el=$$("#partners .pCard")[i];if(!el)return;el.classList.remove("pulse");void el.offsetWidth;el.classList.add("pulse");G.chainN=(G.chainN||0)+1;SFX.chain(G.chainN);if(t)popOn(el,t,popCls(t)+" big")}
function shake(){if(typeof SET!=="undefined"&&!SET.shake)return;const s=$("#stage");s.classList.remove("shake");void s.offsetWidth;s.classList.add("shake")}

/* ---------- 过关 / 输了 ---------- */
async function blindWin(){const x0={};await foeKO();SFX.win();bgKick(1);const B=BLINDS[G.blind];const left=G.handsLeft;const gl=G.hand.filter(c=>c.ed==="gold").length*3;let extra=0;for(const id of G.partners){const P=PARTNERS[id];if(P.end){x0.self=G.pst[id]=(G.pst[id]||{});extra+=P.end(G,x0)||0}}
 const interest=Math.min(G.partners.includes("egq")?6:(G.diff||0)>=5?2:3,Math.floor(G.gold/(G.partners.includes("egy")?4:5)));const tot=B.gold+left+gl+extra+interest;
 ov(`<div class="box"><h2>${B.n} · 过了</h2><div class="wRows"><p><span>过关</span><b>+${B.gold}</b></p>${left?`<p><span>剩下 ${left} 次出牌</span><b>+${left}</b></p>`:""}${gl?`<p><span>手里的金卡</span><b>+${gl}</b></p>`:""}${extra?`<p><span>伙伴</span><b>+${extra}</b></p>`:""}${interest?`<p><span>利息（每 5 金币 +1，最多 3）</span><b>+${interest}</b></p>`:""}</div><div class="wTot">金币 +${tot}</div><button class="btn gold" id="wGo">去商店</button></div>`);
 $("#wGo").onclick=()=>{closeOv();G.gold+=tot;SFX.coins();G.blind++;if(G.blind>2){G.blind=0;G.lvIdx++;if(G.lvIdx>=LV_LIST.length){if(G.endless)return endlessNext();G.lvIdx=LV_LIST.length-1;G.won=1;return runWin()}}G.reroll=5;G.target=targetOf(G.lvIdx,G.blind);G.boss=G.blind===2?bossOf(G.lvIdx):null;shopOpen()}}
function statsHTML(){const S=G.stats;const top=Object.entries(S.types).sort((a,b)=>b[1]-a[1])[0];
 return`<div class="stG"><div><small>走到</small><b>第 ${G.lvIdx+1} 站</b><em>${locOf(G.lvIdx).n}</em></div><div><small>总伤害</small><b>${(S.dmg||0).toLocaleString()}</b>${dmgNote()}</div><div><small>最大一手</small><b>${S.best.toLocaleString()}</b></div><div><small>一共出了</small><b>${S.hands} 手</b><em>压住 ${S.beats} 次</em></div><div><small>最常出</small><b>${top?HANDS[top[0]].n:"—"}</b></div></div>
 ${G.partners.length?`<div class="stP">${G.partners.map(id=>`<img src="${IMG(PARTNERS[id].img)}" title="${PARTNERS[id].n}">`).join("")}</div>`:""}`}
function gameOver(){SFX.bad();runEnd(false);ov(`<div class="box lose endBox"><h2>被 ${G.foe.n} 打败了</h2><p class="msg">在 <b>${locOf(G.lvIdx).n} · 打 ${rankName(LV_LIST[G.lvIdx])}</b> 的${BLINDS[G.blind].n}<br>它还剩 ${(G.target-G.score).toLocaleString()} 血</p>${statsHTML()}<button class="btn" id="goAgain">再来一局</button><button class="btn dark" id="goHome">回主页</button></div>`);$("#goAgain").onclick=()=>{closeOv();newRun()};$("#goHome").onclick=()=>{closeOv();titleScreen()}}
async function runWin(){runEnd(true);SFX.win();
 await storyPlay([["e_bx","阿岳","……输了。"],["e_bx","阿岳","很久没有人陪我把一局打完了。"],["nw","奶蛙","下次还来打吗？"],["e_bx","阿岳","嗯。叫上大家一起。"],["m6","奶蛙长老","奶茶泉边，又热闹起来了。"]]);
 ov(`<div class="box endBox"><h2>通关！从打 2 打到了打 A</h2><p class="msg">你打败了阿岳。</p>${statsHTML()}<button class="btn gold" id="goEnd">无尽模式 ▶</button><button class="btn" id="goAgain">再来一局</button><button class="btn dark" id="goHome">回主页</button><p class="endTip">无尽模式：带着这一局的牌组和伙伴继续打下去，对手越来越强</p></div>`);$("#goEnd").onclick=()=>{closeOv();startEndless()};$("#goAgain").onclick=()=>{closeOv();newRun()};$("#goHome").onclick=()=>{closeOv();titleScreen()}}
function runEnd(win){}

/* ---------- 商店 ---------- */
function shopOpen(){const own=new Set(G.partners);const pool=Object.keys(PARTNERS).filter(k=>!own.has(k)&&isUnlocked(k));const rar=()=>{const r=rnd();return r<.6?"C":r<.9?"R":r<.98?"E":"L"};
 G.shop={items:[]};const pp=()=>{for(let k=0;k<30;k++){const r=rar();const c=pool.filter(x=>PARTNERS[x].r===r&&!G.shop.items.some(y=>y.id===x));if(c.length)return pick(c)}return pick(pool)};
 G.shop.items.push({k:"partner",id:pp()});G.shop.items.push({k:"partner",id:pp()});
 G.shop.items.push({k:"tea",id:teaPickW(1)[0],p:3});G.shop.items.push({k:"pack",id:"card",p:4,n:4});G.shop.items.push({k:"teapack",p:4,n:3});G.shop.items.push({k:"pack",id:"gold",p:6,n:3});
 show("shop");bgScene("shop");shopRender()}
let ptP=id=>PARTNERS[id].p+((G.diff||0)>=4?1:0);let packP=it=>Math.max(1,it.p-(it.k!=="tea"&&G.partners.includes("xg")?2:0)+((G.diff||0)>=4?1:0));
function shopRender(){const S_=G.shop;
 $("#shop").innerHTML=`<div class="shWrap pan"><div class="shHead"><h2>商店</h2><span>金币 <b>${G.gold}</b></span></div>
 <div class="shRow">${S_.items.map((it,i)=>{if(it.sold)return`<div class="shItem sold">卖掉了</div>`;
  if(it.k==="partner"){const P=PARTNERS[it.id];return`<div class="shItem pt" data-i="${i}">${partnerCard(it.id,"big")}<span class="ptTag">${P.t}流</span><p>${P.d.replace("{v}",0)}</p><div class="price">${ptP(it.id)}</div></div>`}
  if(it.k==="tea"){const H=HANDS[it.id==="bomb"?"bomb4":it.id],L=(G.hl[it.id]||0);return`<div class="shItem tea" data-i="${i}"><span class="kind">茶包</span><img src="${IMG("cup")}"><b>${it.id==="bomb"?"炸弹":H.n}茶包</b><p>${it.id==="bomb"?"所有炸弹":H.n} 升到 Lv${L+2}<br>筹码 +${TEA[it.id][0]}　倍率 +${TEA[it.id][1]}</p><div class="price">${packP(it)}</div></div>`}
  if(it.k==="teapack")return`<div class="shItem pack teapack" data-i="${i}"><span class="kind">茶包礼盒</span><div class="pkArt">${[0,1,2].map(q=>`<i style="--q:${q}"></i>`).join("")}</div><b>茶包礼盒</b><p>打开看 ${it.n} 个茶包<br>挑 1 个，升级牌型</p><div class="price">${packP(it)}</div></div>`;
  return`<div class="shItem pack ${it.id}" data-i="${i}"><span class="kind">卡包</span><div class="pkArt">${[0,1,2].map(q=>`<i style="--q:${q}"></i>`).join("")}</div><b>${it.id==="gold"?"金边卡包":"卡包"}</b><p>翻 ${it.n} 张牌<br>挑 1 张放进牌组${it.id==="gold"?"<br>一定有品质":""}</p><div class="price">${packP(it)}</div></div>`}).join("")}</div>
 <div class="shFoot"><button class="btn green" id="shRe">换一批伙伴 · ${G.partners.includes("dgy")?2:G.reroll}</button><button class="btn" id="shNext">下一关</button></div></div>`;
 renderSide();renderPartners();
 $$("#shop .shItem[data-i]").forEach(e=>e.onclick=()=>shopBuy(+e.dataset.i));
 $("#shRe").onclick=()=>{const rc=G.partners.includes("dgy")?2:G.reroll;if(G.gold<rc){toast("金币不够");SFX.bad();return}G.gold-=rc;if(rc===G.reroll)G.reroll++;const own=new Set(G.partners);const pool=Object.keys(PARTNERS).filter(k=>!own.has(k)&&isUnlocked(k)&&!G.shop.items.some(y=>y.id===k));const rb=(G.shop.rr=(G.shop.rr||0)+1);G.shop.items.forEach(it=>{if(it.k==="partner"){it.id=ptRoll(pool.filter(x=>!G.shop.items.some(y=>y!==it&&y.id===x)),rb);it.sold=0}});SFX.coin();shopRender()};
 $("#shNext").onclick=()=>{SFX.click();blindSelect()}}
async function shopBuy(i){const it=G.shop.items[i];if(it.sold)return;const price=it.k==="partner"?ptP(it.id):packP(it);if(G.gold<price){toast("金币不够");SFX.bad();return}
 if(it.k==="partner"){if(G.partners.length>=(G.pmax||5)){toast(`伙伴最多带 ${G.pmax||5} 个，先卖掉一个`);return}G.gold-=price;G.partners.push(it.id);it.sold=1;SFX.coin();shopRender();return}
 if(it.k==="tea"){G.gold-=price;G.hl[it.id]=(G.hl[it.id]||0)+1;it.sold=1;SFX.shine();toast(`<b>${it.id==="bomb"?"炸弹":HANDS[it.id].n}</b> 升级了`);shopRender();return}
 if(it.k==="pack"){G.gold-=price;it.sold=1;SFX.coin();shopRender();await openPack(it)}
 if(it.k==="teapack"){G.gold-=price;it.sold=1;SFX.coin();shopRender();await openTeaPack(it.n)}}

/* ---------- 卡包：一张张翻开，跟奶蛙之塔拆卡包一样 ---------- */
function rollCard(guarantee){const s=rnd()<.06?4:ri(4);const c=s===4?{s:4,r:rnd()<.5?16:17}:{s,r:2+ri(13)};c.id=1e5+ri(1e9);c.ed=null;c.seal=null;
 if(guarantee||rnd()<.45){const q=rnd();c.ed=q<.5?"foil":q<.78?"gold":"poly"}if(rnd()<.18)c.seal="frog";return c}
function openPack(it){return new Promise(res=>{const cs=[...Array(it.n)].map(()=>rollCard(it.id==="gold"||G.partners.includes("xg")));let opened=0;
 ov(`<div class="box packBox"><h2>${it.id==="gold"?"金边卡包":"卡包"}</h2><p class="pkHint">点牌翻开</p><div class="pkRow">${cs.map((c,i)=>`<div class="flip" data-i="${i}" style="--i:${i}"><div class="fIn"><div class="fBack"><b>蛙</b></div><div class="fFront">${cardHTML(c)}</div></div></div>`).join("")}</div><button class="btn dark" id="pkSkip">都不要</button></div>`);
 $$(".flip").forEach(e=>{e.onclick=()=>{const i=+e.dataset.i,c=cs[i];if(!e.classList.contains("open")){e.classList.add("open");SFX.flip();opened++;if(c.ed){setTimeout(()=>{e.classList.add("shine");SFX.shine();bgKick(.3)},380)}
   const tag=[c.ed?EDS[c.ed].n:"",c.seal?SEALS[c.seal].n:""].filter(Boolean).join(" · ");if(tag)setTimeout(()=>{const t=document.createElement("div");t.className="fTag";t.textContent=tag;e.appendChild(t)},420);tiltOn(e.querySelector(".card"));
   if(opened===cs.length)$(".pkHint").textContent="挑一张放进牌组";return}
  if(opened<cs.length){toast("先把牌都翻开");return}
  G.deck.push(c);SFX.pick();e.classList.add("taken");setTimeout(()=>{closeOv();res(c)},450)}});
 $("#pkSkip").onclick=()=>{closeOv();res(null)}})}

/* ---------- 茶包（相当于小丑牌的星球牌）：升级一种牌型 ---------- */
const TEA_COL={single:"#8a8a9a",pair:"#4fa3ff",triple:"#3fae6b",fullhouse:"#f0a54a",straight:"#c86bff",tube:"#ff6b9a",plate:"#2ec4c4",bomb:"#e8333d",sflush:"#ffb800",rocket:"#7a3cff"};
const TEA_N={single:"清茶",pair:"双拼奶茶",triple:"三分糖",fullhouse:"芋泥波波",straight:"杨枝甘露",tube:"三层奶盖",plate:"钢板烤奶",bomb:"爆爆珠",sflush:"满杯水果",rocket:"王炸霸气"};
function teaCardHTML(id,i){const H=HANDS[id==="bomb"?"bomb4":id],L=G.hl[id]||0,T=TEA[id];return`<div class="teaC" data-id="${id}" style="--tc:${TEA_COL[id]};--i:${i}"><div class="tcTop">${TEA_N[id]}</div><img src="${IMG("cup")}"><b>${id==="bomb"?"所有炸弹":H.n}</b><div class="lvUp">Lv${L+1} → <i>Lv${L+2}</i></div><div class="gain"><span class="c">+${T[0]}</span><span class="m">+${T[1]}</span></div></div>`}
function openTeaPack(n){return new Promise(res=>{const ids=teaPickW(n);
 ov(`<div class="box"><h2>茶包礼盒</h2><p class="msg">挑一个茶包，喝了这个牌型就升一级</p><div class="tpRow">${ids.map((id,i)=>teaCardHTML(id,i)).join("")}</div><button class="btn dark" id="tpSkip">都不要</button></div>`);
 $$(".teaC").forEach(e=>{tiltOn(e);e.onclick=()=>{const id=e.dataset.id;G.hl[id]=(G.hl[id]||0)+1;SFX.shine();bgKick(.4);e.classList.add("taken");toast(`<b>${id==="bomb"?"炸弹":HANDS[id].n}</b> 升到 Lv${G.hl[id]+1}`);setTimeout(()=>{closeOv();res(id)},450)}});
 $("#tpSkip").onclick=()=>{closeOv();res(null)}})}

/* ---------- 闪卡的光：手指（鼠标）在牌上移动，光跟着走，牌跟着歪 ---------- */
function tiltOn(el){if(!el||el._tilt)return;el._tilt=1;const mv=e=>{const r=el.getBoundingClientRect();const p=e.touches?e.touches[0]:e;const x=(p.clientX-r.left)/r.width,y=(p.clientY-r.top)/r.height;el.style.setProperty("--mx",(x*100)+"%");el.style.setProperty("--my",(y*100)+"%");el.style.setProperty("--hyp",Math.min(1,Math.hypot(x-.5,y-.5)*2).toFixed(2));el.style.setProperty("--rx",((.5-y)*16)+"deg");el.style.setProperty("--ry",((x-.5)*16)+"deg")};
 el.addEventListener("pointermove",mv);el.addEventListener("pointerleave",()=>{["--rx","--ry"].forEach(k=>el.style.setProperty(k,"0deg"));el.style.setProperty("--hyp",".15")})}

/* ---------- 小窗、提示 ---------- */
function ov(h){const o=$("#ov");o.innerHTML=h;o.classList.add("on")}
function closeOv(){const o=$("#ov");o.classList.remove("on");o.innerHTML=""}
function toast(h){const t=$("#toast");t.innerHTML=h;t.classList.remove("on");void t.offsetWidth;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2200)}
function tip(el,h){closeTip();const R=toStage(el.getBoundingClientRect());const d=document.createElement("div");d.id="tip";d.innerHTML=h;d.style.left=Math.min(1010,R.x+R.w/2-60)+"px";d.style.top=(R.y+R.h+10)+"px";$("#stage").appendChild(d);setTimeout(()=>addEventListener("pointerdown",tipOff,true),10)}
function tipOff(e){if(e.target.closest("#tip"))return;closeTip()}
function closeTip(){const d=$("#tip");if(d)d.remove();removeEventListener("pointerdown",tipOff,true)}
function handTable(){SFX.click();ov(`<div class="box htBox"><h2>牌型</h2><table>${HAND_ORDER.map(t=>{const b=handBase(t);return`<tr><td>${HANDS[t].n}</td><td class="l">Lv${b.L+1}</td><td class="c">${b.c}</td><td>×</td><td class="m">${b.m}</td></tr>`}).join("")}</table><p class="htN">炸弹张数越多越大；同花顺在五炸和六炸之间。<br>压住上家（同牌型更大，或者用炸弹）：这一手倍率 ×1.5。</p><button class="btn" onclick="closeOv()">知道了</button></div>`)}
function deckView(){SFX.click();const lv=lvNow();const all=G.deck.slice().sort((a,b)=>a.s-b.s||power(b.r,lv)-power(a.r,lv));const left=new Set((G.draw||[]).map(c=>c.id));const inRun=$("#play.on");
 ov(`<div class="box dvBox"><h2>牌组 ${G.deck.length} 张${inRun?` · 牌堆里还剩 ${left.size} 张`:""}</h2><div class="dvGrid">${all.map((c,k)=>cardHTML(c,{cls:"mini",st:(inRun&&!left.has(c.id)?"opacity:.3;":"")+"--i:"+k})).join("")}</div><button class="btn" onclick="closeOv()">关上</button></div>`)}

/* ---------- 伙伴图鉴：按流派排 ---------- */
const TAG_ORDER=["炸弹","级牌","逢人配","压牌","奶蛙池","花色","连牌","品质","增强","印","符咒","牌型","对子","三张","小牌","弃牌","经济","成长","基础"];
const RAR_N={C:"普通",R:"稀有",E:"史诗",L:"传说"};
function codex(){SFX.click();const by={};for(const k in PARTNERS){const P=PARTNERS[k];(by[P.t]=by[P.t]||[]).push(k)}
 ov(`<div class="box cdx"><h2>伙伴图鉴 · ${Object.keys(PARTNERS).length} 个</h2><div class="cdxTabs">${TAG_ORDER.filter(t=>by[t]).map((t,i)=>`<button class="btn sm ${i?"dark":"gold"}" data-t="${t}">${t} ${by[t].length}</button>`).join("")}</div><div class="cdxGrid"></div><button class="btn" onclick="closeOv()">关上</button></div>`);
 const draw=t=>{$(".cdxGrid").innerHTML=by[t].map(k=>{const P=PARTNERS[k];return`<div class="cdxC r${P.r}"><img src="${IMG(P.img)}"><div><b>${P.n}</b><em>${RAR_N[P.r]} · ${P.p} 金币</em><p>${P.d.replace("{v}","0")}</p></div></div>`}).join("");$$(".cdxTabs .btn").forEach(b=>b.className="btn sm "+(b.dataset.t===t?"gold":"dark"))};
 $$(".cdxTabs .btn").forEach(b=>b.onclick=()=>{SFX.click();draw(b.dataset.t)});draw(TAG_ORDER.find(t=>by[t]))}

/* ---------- 主页 ---------- */
const CONTACT_MAIL=""; // 反馈邮箱：等作者给了填上
function sponsor(){SFX.click();ov(`<div class="box"><div class="zsBox"><div class="zsL"><img src="img/zanshang.jpg" alt="赞赏码"><p>微信扫一扫</p></div><div class="zsR"><h2 style="text-align:left">作者的话</h2><p>做《奶蛙牌》的时候，我们白天上班，晚上熬夜，一张牌一张牌地画，一个伙伴一个伙伴地调。</p><p>如果你喜欢《奶蛙牌》，可以扫左边的码<b>支持</b>我们。也非常欢迎<b>提建议</b>，每一条我们都会认真看。</p>${CONTACT_MAIL?`<p>邮箱：<b>${CONTACT_MAIL}</b></p>`:""}<p>B站搜索<b>乔乔 奶蛙工作室</b>、<b>龙井茉莉 奶蛙工作室</b>，继续关注我们。</p><button class="btn" onclick="closeOv()">关闭</button></div></div></div>`)}
/* 信箱：给新人的一封信 */
const LETTERS=[{id:"hello",t:"给新来的你",from:"奶蛙工作室",body:["欢迎来到《奶蛙牌》！","这是奶蛙工作室做的第三个游戏。前两个是《奶蛙之塔》和《抓奶蛙》，如果你玩过，会在牌桌上遇到很多老朋友。","《奶蛙牌》用掼蛋的牌型来打：凑牌型、压住对手的牌、攒一队伙伴，从打 2 一路打到打 A。","不会掼蛋也没关系，第一局长老会手把手教你。","游戏还在一点点做。有什么想法、遇到 bug，都欢迎告诉我们。","B站关注我们：<b>乔乔 奶蛙工作室</b>　<b>龙井茉莉 奶蛙工作室</b>"]}];
function lsGet(k){try{return JSON.parse(localStorage.getItem("np-"+k)||"null")}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem("np-"+k,JSON.stringify(v))}catch(e){}}
function mailUnread(){const r=lsGet("mailRead")||{};return LETTERS.some(l=>!r[l.id])}
function mailBox(){SFX.click();const r=lsGet("mailRead")||{};const show1=L=>{r[L.id]=1;lsSet("mailRead",r);const d=$("#tMb .dot");if(d&&!mailUnread())d.remove();
  ov(`<div class="box letter"><div class="ltHead"><b>${L.t}</b><span>来自 ${L.from}</span></div>${L.body.map(p=>`<p>${p}</p>`).join("")}<div class="ltSig">—— ${L.from}</div><button class="btn" onclick="closeOv()">收好了</button></div>`)};
 if(LETTERS.length===1)return show1(LETTERS[0]);
 ov(`<div class="box"><h2>信箱</h2>${LETTERS.map((L,i)=>`<button class="btn dark mlI" data-i="${i}">${r[L.id]?"":"● "}${L.t}</button>`).join("")}</div>`);$$(".mlI").forEach(e=>e.onclick=()=>show1(LETTERS[+e.dataset.i]))}
function titleScreen(){show("title");bgScene("title");$("#title").innerHTML=`<div class="tLogo"><b>奶蛙牌</b><small>掼蛋 · 肉鸽</small></div><div class="tFan">${[{s:1,r:2},{s:0,r:14},{s:4,r:17},{s:3,r:13},{s:2,r:10}].map((c,i)=>cardHTML({...c,id:"t"+i,ed:i===2?"poly":i===1?"foil":i===3?"gold":null},{st:"--i:"+i})).join("")}</div><button class="btn big gold" id="tGo">开始</button><p class="tVer">v${VER} · 奶蛙工作室</p><button class="btn dark tCdx" id="tCdx">图鉴</button><button class="tZs" id="tZs"><img src="img/zanshang.jpg"><span>赞赏作者</span></button><button class="tMb" id="tMb"><svg viewBox="0 0 40 32"><rect x="2" y="4" width="36" height="25" rx="3" fill="#fff6e0" stroke="#1d1418" stroke-width="3"/><path d="M4 7 L20 19 L36 7" fill="none" stroke="#1d1418" stroke-width="3"/></svg><span>信箱</span>${mailUnread()?`<i class="dot"></i>`:""}</button>${CONTACT_MAIL?`<p class="tMail">反馈邮箱：<b>${CONTACT_MAIL}</b></p>`:""}`;$("#tZs").onclick=sponsor;$("#tCdx").onclick=codex;$("#tMb").onclick=mailBox;
 $$("#title .card").forEach(tiltOn);$("#tGo").onclick=()=>{au();SFX.click();newRun()}}

addEventListener("load",()=>{fit();bgInit();$("#bPlay").onclick=playSel;$("#bDisc").onclick=discardSel;$("#bSort").onclick=()=>{G.sortBy=G.sortBy==="rank"?"suit":"rank";$("#bSort").textContent=G.sortBy==="rank"?"按大小":"按花色";SFX.click();sortHand();renderHand()};addEventListener("pointerdown",()=>au(),{once:true});titleScreen()});
