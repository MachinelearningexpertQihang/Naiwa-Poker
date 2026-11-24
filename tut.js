/* ===================== 奶蛙牌 · 开场剧情 + 新手教程 =====================
   第一次点「开始」：先看一段长老的开场，然后第一关一步一步教 */

const INTRO=[
 ["m6","奶蛙长老","塔上的事，都过去了。"],
 ["m6","奶蛙长老","现在奶茶泉边的奶蛙们有了矛盾，不打架了——坐下来，打掼蛋。"],
 ["nw","奶蛙","打掼蛋？"],
 ["m6","奶蛙长老","从打 2 打到打 A。每一桌都有一只奶蛙坐在你对面。"],
 ["m6","奶蛙长老","压住它的牌，把它的血打空，它就服气了。"],
 ["nw","奶蛙","打 A 那一桌坐的是谁？"],
 ["m6","奶蛙长老","……阿岳。他说，想再和大家好好打一局。"],
 ["nw","奶蛙","那我先去打 2！"],
 ["m6","奶蛙长老","别急。第一桌，我坐你旁边看着。"]];

function storyPlay(lines){return new Promise(res=>{let i=0;const st=$("#stage");const d=document.createElement("div");d.id="story";st.appendChild(d);
 const draw=()=>{const L=lines[i];const left=L[0]!=="nw";d.innerHTML=`<div class="stBg"></div><img class="stPic ${left?"l":"r"}" src="${IMG(L[0])}"><div class="stBox ${left?"l":"r"}"><b>${L[1]}</b><p>${L[2]}</p><i class="stNext">▼</i></div><button class="btn dark sm stSkip">跳过</button>`;
  d.querySelector(".stSkip").onclick=e=>{e.stopPropagation();end()}};
 const end=()=>{d.classList.add("out");setTimeout(()=>{d.remove();res()},300)};
 d.onclick=()=>{SFX.click();i++;if(i>=lines.length)end();else draw()};draw()})}

/* ---------- 教程 ---------- */
const TUT=[
 {el:".foe",t:"这是你的对手。它有 <b>300 血</b>，把血打空，这一桌就赢了。"},
 {el:".upR",t:"它出了一对 6。<br>你出<b>同样的牌型、而且更大</b>，就叫「压住」，伤害 <b>×1.5</b>。<br>压不住也能出，但伤害只有 ×0.75。"},
 {el:"#hand",t:"从手牌里点两张<b>一样的牌</b>，凑一对比 6 大的对子。",wait:"pair"},
 {el:".sdHand",t:"左边显示这手牌的伤害：<b class='c'>筹码</b> × <b class='m'>倍率</b>。<br>牌型越大，筹码和倍率越高。"},
 {el:"#bPlay",t:"点「出牌」！",wait:"play"},
 {el:"#pool",t:"打出去的牌会变成小奶蛙，跳进右上角的<b>奶蛙池</b>。<br>同一家凑齐 3 只就消除，给你额外奖励。"},
 {el:"#partners",t:"这一排是<b>伙伴</b>。过关后在商店里买，它们会让每一手更厉害。"},
 {el:".sdRow",t:"<b>出牌</b>和<b>弃牌</b>的次数有限。<br>手牌不好，就选几张点「弃牌」换掉。"},
 {el:"#lvBox,.sdLv",t:"最后一件事：这一级是<b>打 2</b>，所以 2 比 A 还大。<br><b style='color:#ff8a8a'>红桃 2</b> 是「逢人配」，能当任何一张牌用。<br>好了，去把它打倒吧！",last:1}];
const TU={on:false,i:0};
function tutStart(){TU.on=true;TU.i=0;tutShow()}
function tutEnd(){TU.on=false;const c=$("#coach");if(c)c.remove();lsSet("tutDone",1)}
function stageRect(el){return toStage(el.getBoundingClientRect())}
function tutShow(){const S=TUT[TU.i];let c=$("#coach");if(!c){c=document.createElement("div");c.id="coach";$("#stage").appendChild(c)}
 const el=S.el.split(",").map(s=>$(s)).find(e=>e&&e.offsetParent);const R=el?stageRect(el):{x:640,y:360,w:0,h:0};const pad=8;
 c.className=S.wait?"act":"";
 const bx=Math.min(1280-430,Math.max(20,R.x+R.w/2-210));const below=R.y+R.h+200<700;const by=below?R.y+R.h+pad+14:Math.max(14,R.y-pad-14-170);
 c.innerHTML=`<div class="coHole" style="left:${R.x-pad}px;top:${R.y-pad}px;width:${R.w+pad*2}px;height:${R.h+pad*2}px"></div>
 <div class="coBub ${below?"dn":"up"}" style="left:${bx}px;top:${by}px"><img src="${IMG("m6")}"><div><p>${S.t}</p>${S.wait?`<small>${S.wait==="pair"?"选好了会自动进入下一步":"　"}</small>`:`<button class="btn sm gold coGo">${S.last?"开打！":"知道了"}</button>`}</div><span class="coN">${TU.i+1}/${TUT.length}</span></div>`;
 const b=c.querySelector(".coGo");if(b)b.onclick=e=>{e.stopPropagation();SFX.click();tutNext()}}
function tutNext(){TU.i++;if(TU.i>=TUT.length)return tutEnd();tutShow()}

/* 第一次开局：剧情 → 教程关 */
{const _nr=newRun;newRun=async function(h,d){if(!lsGet("tutDone")){show("none");bgScene("lv",0);await storyPlay(INTRO);_nr("naiwa",0);G.tut=1}else _nr(h,d)}}
{const _sb=startBlind;startBlind=function(){_sb();if(G.tut===1&&G.lvIdx===0&&G.blind===0){G.tut=2;
  // 教学用的牌局：对手出一对 6，手里保证有一对 9
  const u=[{id:"tu1",s:0,r:6,ed:null,seal:null},{id:"tu2",s:2,r:6,ed:null,seal:null}];G.upper={cards:u,j:judge(u,lvNow())};
  const has=G.hand.some(a=>a.s<4&&a.r>6&&a.r!==lvNow()&&G.hand.filter(b=>b.s<4&&b.r===a.r).length>=2);
  if(!has){const pick2=G.draw.filter(c=>c.r===9&&c.s!==1).slice(0,2);if(pick2.length===2){const out=G.hand.filter(c=>c.r!==9).slice(-2);G.hand=G.hand.filter(c=>!out.includes(c));G.draw=G.draw.filter(c=>!pick2.includes(c));G.draw.push(...out);G.hand.push(...pick2);sortHand()}}
  render();setTimeout(tutStart,900)}}}
{const _rp=renderPreview;renderPreview=function(){_rp();if(TU.on&&TUT[TU.i].wait==="pair"){const cs=selCards();const j=cs.length?judgeX(cs,lvNow()):null;if(j&&j.type==="pair"&&beats(j,G.upper&&G.upper.j)&&!TU.adv){TU.adv=1;setTimeout(()=>{TU.adv=0;tutNext()},300)}}}}
{const _ps=playSel;playSel=async function(){const w=TU.on&&TUT[TU.i].wait==="play";if(TU.on&&TUT[TU.i].wait==="pair")return;if(w){const c=$("#coach");if(c)c.style.display="none"}await _ps();if(w&&TU.on){const c=$("#coach");if(c)c.style.display="";if($("#ov.on"))return tutEnd();tutNext()}}}
{const _ts=titleScreen;titleScreen=function(){_ts();if(lsGet("tutDone")){const b=document.createElement("button");b.className="btn dark sm tTut";b.textContent="重看新手教程";b.onclick=()=>{lsSet("tutDone",0);au();SFX.click();newRun()};$("#title").appendChild(b)}}}
addEventListener("load",()=>{$("#bPlay").onclick=()=>playSel()});
