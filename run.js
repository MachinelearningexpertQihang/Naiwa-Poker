/* ===================== 奶蛙牌 1.0 · 跳过小关 / 站间小事件 / 商店永久升级 / 结算分享图 ===================== */

/* ---------- 1. 跳过小关拿奖励 ---------- */
const TAGS={
 freeRe:{n:"免费刷新",d:"下一家店，第一次换伙伴不要钱",c:"#3fb36b",f:G=>{G.freeRe=(G.freeRe||0)+1}},
 fu:{n:"白送符咒",d:"马上拿到一张随机符咒",c:"#c23b2e",f:G=>{if(!consGive(randFu())){G.gold+=4;toast("符咒栏满了，换成 4 金币")}}},
 bossHand:{n:"首领多一手",d:"这一站的首领关，出牌 +1",c:"#7b4fd6",f:G=>{G.bossHand=(G.bossHand||0)+1}},
 gold:{n:"一袋金币",d:"马上拿 8 金币",c:"#d99a1e",f:G=>{G.gold+=8;SFX.coins()}},
 ptSale:{n:"伙伴半价",d:"下一家店，伙伴全部半价",c:"#2e6fb3",f:G=>{G.ptSale=1}},
 tea:{n:"随手一包茶",d:"随机一种牌型升一级",c:"#a0703a",f:G=>{const k=pick(Object.keys(TEA));G.hl[k]=(G.hl[k]||0)+1;toast(`<b>${k==="bomb"?"炸弹":HANDS[k].n}</b> 升级了`)}},
 goldPack:{n:"金边卡包",d:"马上打开一个金边卡包（3 张挑 1）",c:"#e0a422",f:G=>{setTimeout(()=>openPack({id:"gold",n:3}),350)}}};
function tagFor(G,i){G.tagFor=G.tagFor||{};const k=G.lvIdx+"-"+i;if(!G.tagFor[k])G.tagFor[k]=pick(Object.keys(TAGS));return G.tagFor[k]}
{const _bs=blindSelect;blindSelect=function(){_bs.apply(this,arguments);try{if(!G||G.tut||G.blind>1)return;const card=$("#blinds .bsCard.now");if(!card)return;const T=TAGS[tagFor(G,G.blind)];
  card.insertAdjacentHTML("afterbegin",`<div class="skipTag" style="--tc:${T.c}"><small>跳过奖励</small><b>${T.n}</b><em>${T.d}</em></div>`);const go=$("#bsGo");if(go){const w=document.createElement("div");w.className="bsBtns";go.parentNode.insertBefore(w,go);w.appendChild(go);w.insertAdjacentHTML("beforeend",`<button class="btn dark" id="bsSkip">跳过</button>`)}
  $("#bsSkip").onclick=()=>{const k=tagFor(G,G.blind);SFX.shine();bgKick(.4);G.skips=(G.skips||0)+1;G.blind++;TAGS[k].f(G);toast(`跳过了${BLINDS[G.blind-1].n}，拿到 <b>${TAGS[k].n}</b>`);blindSelect()}}catch(e){console.warn(e)}}}
// 首领多一手、事件带来的下一关加减
{const _sb=startBlind;startBlind=function(){const r=_sb.apply(this,arguments);try{let ch=0;
  if(G.boss&&G.bossHand){G.handsLeft+=G.bossHand;G.bossHand=0;ch=1;toast("跳关奖励：首领关出牌 +1")}
  if(G.nextMod){const m=G.nextMod;G.nextMod=null;G.handsLeft=Math.max(1,G.handsLeft+(m.h||0));G.discLeft=Math.max(0,G.discLeft+(m.d||0));if(m.hp){G.target=Math.round(G.target*m.hp)}ch=1}
  if(ch){renderSide();try{renderUpper()}catch(e){}}}catch(e){console.warn(e)}return r}}
// 物价：越往后越贵（每站 +7%，无尽每轮再 +30%）
const priceK=()=>G?1+.07*(G.lvIdx||0)+.3*((G.endless&&G.loop)||0):1;
{const _pk=packP;packP=it=>Math.max(1,Math.round(_pk(it)*priceK()))}
// 伙伴半价
{const _pp=ptP;ptP=id=>{const v=Math.max(1,Math.round(_pp(id)*priceK()));return G&&G.ptSale?Math.max(1,Math.ceil(v/2)):v}}

/* ---------- 2. 站与站之间的小事件：打完首领、进下一站之前 ---------- */
const lowCards=G=>G.deck.filter(c=>c.s<4&&c.r>=2&&c.r<=6&&!c.ed&&!c.en&&!c.seal);
const EVENTS=[
 {id:"tea",img:"cup",n:"路边茶摊",t:"一位老奶蛙在路边摆了个茶摊，壶里还冒着热气。",o:[
  {t:"喝一杯（-3 金币）",d:"随机一种牌型升一级",ok:G=>G.gold>=3,f:G=>{G.gold-=3;TAGS.tea.f(G);return"茶是甜的。手上好像更有劲了。"}},
  {t:"买一壶带走（-6 金币）",d:"拿一张随机符咒",ok:G=>G.gold>=6,f:G=>{G.gold-=6;if(!consGive(randFu()))G.gold+=6;return"老奶蛙把壶盖拧紧：「路上慢点喝。」"}},
  {t:"谢谢，不用了",d:"什么也不发生",f:()=>"你点点头，继续赶路。"}]},
 {id:"gamble",img:"ct",n:"赌一把的老奶蛙",t:"树底下蹲着一只老奶蛙，手里抛着骰子：「猜大小，敢不敢？」",o:[
  {t:"押 6 金币",d:"一半几率拿回 15，一半几率输光",ok:G=>G.gold>=6,f:G=>{G.gold-=6;if(rnd()<.5){G.gold+=15;SFX.coins();return"骰子停在六点。「……再来一把？」你已经走远了。"}SFX.bad();return"骰子停在一点。老奶蛙笑得很开心。"}},
  {t:"押一个伙伴",d:"一半几率多拿一个稀有伙伴，一半几率随机丢掉一个伙伴",ok:G=>G.partners.length>0,f:G=>{if(rnd()<.5){const own=new Set(G.partners);const pool=Object.keys(PARTNERS).filter(k=>!own.has(k)&&isUnlocked(k)&&PARTNERS[k].r==="R");if(pool.length&&G.partners.length<(G.pmax||5)){const k=pick(pool);G.partners.push(k);return`赢了！「${PARTNERS[k].n}」跟着你走了。`}G.gold+=10;return"赢了！可是伙伴位满了，老奶蛙给了你 10 金币。"}const i=ri(G.partners.length);const k=G.partners.splice(i,1)[0];return`输了。「${PARTNERS[k].n}」被老奶蛙领走了。`}},
  {t:"不赌",d:"什么也不发生",f:()=>"「胆小鬼。」它在背后嘟囔。"}]},
 {id:"errand",img:"m6",n:"帮首领跑腿",t:"一只小奶蛙拦住你：「下一站的首领让我送信，可我腿短……你帮我送吗？」",o:[
  {t:"帮它送",d:"下一站首领血量 -15%，但下一关弃牌 -1",f:G=>{G.bossHp=.85;G.nextMod={d:-1};return"首领拆开信，脸都红了。好像是封情书。"}},
  {t:"顺手拆开看看",d:"+8 金币，但下一站首领血量 +10%",f:G=>{G.gold+=8;G.bossHp=1.1;return"信封里夹着几个金币。……首领好像知道是你干的。"}},
  {t:"没空",d:"什么也不发生",f:()=>"小奶蛙抱着信，一摇一摆地走远了。"}]},
 {id:"egg",img:"eg",n:"迷路的奶蛋",t:"草丛里滚出来一只奶蛋，眨巴着眼睛看你。",o:[
  {t:"收留它",d:"牌组加一张随机彩卡，但下一关出牌 -1",f:G=>{const c=rollCard(true);c.ed="poly";G.deck.push(c);G.nextMod={h:-1};return"它钻进你的牌堆里，变成了一张亮闪闪的牌。"}},
  {t:"送它回家",d:"+5 金币",f:G=>{G.gold+=5;return"奶蛋妈妈塞给你一把金币，又塞了一把。"}}]},
 {id:"fortune",img:"m5",n:"算命奶蛙",t:"一只戴头巾的奶蛙摸着水晶球：「下一站的首领……我看得见。」",o:[
  {t:"算一卦（-4 金币）",d:"看到下一站首领的本事，首领关出牌 +1",ok:G=>G.gold>=4,f:G=>{G.gold-=4;G.bossHand=(G.bossHand||0)+1;const B=BOSSES[bossOf(G.lvIdx)];return`「${B.n}。${B.d}」它收起水晶球：「去吧，多留一手。」`}},
  {t:"不信这个",d:"什么也不发生",f:()=>"水晶球里闪过一道光，你没回头。"}]},
 {id:"trim",img:"nw",n:"牌桌残局",t:"路边一张旧牌桌，上面摊着一副没打完的牌。",o:[
  {t:"把小牌收走",d:"牌组里随机删掉 3 张 2～6 的小牌",ok:G=>lowCards(G).length>=3,f:G=>{const L=shuffleArr(lowCards(G)).slice(0,3);G.deck=G.deck.filter(c=>!L.includes(c));return`你收走了 ${L.length} 张小牌，牌组更精了（还剩 ${G.deck.length} 张）。`}},
  {t:"拿走两张 A",d:"牌组加 2 张 A",f:G=>{for(let i=0;i<2;i++){G.deck.push({id:1e5+ri(1e9),s:ri(4),r:14,ed:null,seal:null})}return"两张 A，揣进兜里。"}},
  {t:"不动别人的牌",d:"什么也不发生",f:()=>"你把椅子推回原位。"}]},
 {id:"rain",img:"c3",n:"一场大雨",t:"天一下子黑了，雨点砸下来。",o:[
  {t:"冒雨赶路",d:"+8 金币，但下一关弃牌 -1",f:G=>{G.gold+=8;G.nextMod={d:-1};return"你浑身湿透，在泥里捡到了别人掉的钱袋。"}},
  {t:"找个屋檐躲雨",d:"下一关出牌 +1",f:G=>{G.nextMod={h:1};return"雨停的时候，你已经想好了下一手怎么出。"}}]},
 {id:"stray",img:"ck",n:"流浪的伙伴",t:"一只奶鸡蹲在路口，看起来很久没吃饭了。",o:[
  {t:"给它 4 金币",d:"一个随机普通伙伴加入（伙伴位要有空）",ok:G=>G.gold>=4&&G.partners.length<(G.pmax||5),f:G=>{G.gold-=4;const own=new Set(G.partners);const pool=Object.keys(PARTNERS).filter(k=>!own.has(k)&&isUnlocked(k)&&PARTNERS[k].r==="C");const k=pick(pool);G.partners.push(k);return`「${PARTNERS[k].n}」吃饱了，决定跟着你。`}},
  {t:"摸摸头走开",d:"什么也不发生",f:()=>"它在后面跟了一小段路，又回去了。"}]}];
function stationEvent(){return new Promise(res=>{const seen=G.evSeen=G.evSeen||[];let pool=EVENTS.filter(e=>!seen.includes(e.id));if(!pool.length){G.evSeen=[];pool=EVENTS}const E=pick(pool);G.evSeen.push(E.id);
  const draw=()=>{ov(`<div class="box evBox"><div class="evHead"><img src="${IMG(E.img)}"><div><small>第 ${G.lvIdx} 站 → 第 ${G.lvIdx+1} 站 · 路上</small><h2>${E.n}</h2><p>${E.t}</p></div></div><div class="evOpts">${E.o.map((o,i)=>{const ok=!o.ok||o.ok(G);return`<button class="evOpt ${ok?"":"off"}" data-i="${i}"><b>${o.t}</b><small>${o.d}</small></button>`}).join("")}</div></div>`);
   $$(".evOpt").forEach(b=>b.onclick=()=>{const o=E.o[+b.dataset.i];if(o.ok&&!o.ok(G)){SFX.bad();toast("现在做不到");return}SFX.click();const msg=o.f(G);try{renderSide();renderPartners()}catch(e){}
    ov(`<div class="box evBox"><div class="evHead"><img src="${IMG(E.img)}"><div><h2>${E.n}</h2><p>${msg}</p></div></div><button class="btn gold" id="evGo">继续赶路 ▶</button></div>`);$("#evGo").onclick=()=>{SFX.click();closeOv();res()}})};draw()})}
{const _so=shopOpen;shopOpen=async function(){try{if(G&&!G.endless&&G.blind===0&&G.lvIdx>0&&G.evAt!==G.lvIdx&&G.lvIdx<LV_LIST.length){G.evAt=G.lvIdx;show("none");bgScene("lv",G.lvIdx);await stationEvent()}}catch(e){console.warn(e)}return _so.apply(this,arguments)}}
// 首领血量（跑腿事件）
{const _sb2=startBlind;startBlind=function(){const r=_sb2.apply(this,arguments);try{if(G.boss&&G.bossHp){G.target=Math.round(G.target*G.bossHp);G.bossHp=0;try{renderUpper();renderSide()}catch(e){}}}catch(e){}return r}}

/* ---------- 3. 商店：跳关奖励「免费刷新」「伙伴半价」 ---------- */
{const _sr=shopRender;shopRender=function(){_sr.apply(this,arguments);try{const row=$("#shop .shRow");if(!row)return;
  const b=$("#shRe");if(b&&G.freeRe){b.textContent="换一批伙伴 · 免费";const f0=b.onclick;b.onclick=()=>{G.freeRe--;const g=G.gold,rr=G.reroll;G.gold+=99;f0();G.gold=g;G.reroll=rr;shopRender()}}
  if(G.ptSale)row.insertAdjacentHTML("afterbegin",`<div class="saleTag">伙伴半价中</div>`);
 }catch(e){console.warn(e)}}}
// 伙伴半价只管一家店
{const _bs2=blindSelect;blindSelect=function(){if(G)G.ptSale=0;return _bs2.apply(this,arguments)}}

/* ---------- 4. 结算分享图 ---------- */
function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function shareImage(win){const W=720,H=1080,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");const F='"NPixel","PingFang SC","Microsoft YaHei",sans-serif';
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,win?"#3a1f5c":"#2a1418");g.addColorStop(1,win?"#120a24":"#0c0708");x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){x.fillStyle=`rgba(255,215,106,${Math.random()*.5})`;x.fillRect(Math.random()*W,Math.random()*H*.6,2,2)}
 x.textAlign="center";x.fillStyle="#ffd76a";x.font=`bold 84px ${F}`;x.fillText("奶蛙牌",W/2,120);x.fillStyle="#cdbba0";x.font=`26px ${F}`;x.fillText("掼蛋 · 肉鸽",W/2,162);
 const S=G.stats||{best:0,hands:0,beats:0,types:{}};const hero=(typeof HEROES!=="undefined"&&HEROES[G.hero])||{n:"奶蛙",img:"nw"};
 const hi=await loadImg(IMG(hero.img));if(hi){const s=Math.min(260/hi.width,260/hi.height);x.drawImage(hi,W/2-hi.width*s/2,190,hi.width*s,hi.height*s)}
 x.fillStyle=win?"#ffd76a":"#ff8a8a";x.font=`bold 60px ${F}`;x.fillText(win?(G.endless?`无尽 第 ${G.loop||1} 轮`:"通关！打到了 A"):`倒在第 ${G.lvIdx+1} 站`,W/2,520);
 x.fillStyle="#fff6e0";x.font=`28px ${F}`;x.fillText(`${hero.n} · 难度 ${G.diff||0} · ${locOf(G.lvIdx).n}`,W/2,566);
 const box=(bx,by,lab,val)=>{x.fillStyle="rgba(255,255,255,.07)";x.beginPath();x.roundRect?x.roundRect(bx,by,300,120,16):x.rect(bx,by,300,120);x.fill();x.fillStyle="#cdbba0";x.font=`24px ${F}`;x.fillText(lab,bx+150,by+40);x.fillStyle="#ffd76a";x.font=`bold 46px ${F}`;x.fillText(val,bx+150,by+96)};
 const top=Object.entries(S.types||{}).sort((a,b)=>b[1]-a[1])[0];
 box(50,610,"最痛一手",(S.best||0).toLocaleString());box(370,610,"最常出",top?HANDS[top[0]].n:"—");box(50,750,"一共出了",`${S.hands||0} 手`);box(370,750,"压住对手",`${S.beats||0} 次`);
 const ps=G.partners.slice(0,6);x.fillStyle="#cdbba0";x.font=`24px ${F}`;x.fillText("这一局的伙伴",W/2,912);
 const sz=96,gap=12,x0=W/2-(ps.length*sz+(ps.length-1)*gap)/2;for(let i=0;i<ps.length;i++){const im=await loadImg(IMG(PARTNERS[ps[i]].img));if(im){const s=Math.min(sz/im.width,sz/im.height);x.drawImage(im,x0+i*(sz+gap)+(sz-im.width*s)/2,930+(sz-im.height*s)/2,im.width*s,im.height*s)}}
 x.fillStyle="#8a7a66";x.font=`22px ${F}`;x.fillText("B站搜索「奶蛙牌」 · 奶蛙工作室",W/2,H-30);
 return cv.toDataURL("image/png")}
async function shareShow(win){SFX.click();const box=$("#ov .endBox");let url="";try{url=await shareImage(win)}catch(e){console.warn(e)}if(!url){toast("分享图生成失败");return}
 const d=document.createElement("div");d.id="shareOv";d.innerHTML=`<div class="shBox"><img src="${url}" alt="战绩图"><p>长按图片保存，发给朋友看看</p><button class="btn" id="shClose">关上</button></div>`;$("#stage").appendChild(d);$("#shClose").onclick=()=>{SFX.click();d.remove()}}
function addShareBtn(win){try{const b0=$("#ov .endBox #goHome");if(!b0||$("#goShare"))return;const b=document.createElement("button");b.className="btn green";b.id="goShare";b.textContent="生成战绩图";b.onclick=()=>shareShow(win);b0.parentNode.insertBefore(b,b0)}catch(e){}}
{const _go=gameOver;gameOver=function(){const r=_go.apply(this,arguments);addShareBtn(false);return r}}
{const _rw=runWin;runWin=async function(){const r=await _rw.apply(this,arguments);addShareBtn(true);return r}}
