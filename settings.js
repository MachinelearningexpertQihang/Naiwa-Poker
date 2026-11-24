/* ===================== 奶蛙牌 · 菜单和设置 ===================== */
const SET=Object.assign({music:55,sfx:100,speed:1,shake:true},lsGet("settings")||{});
function applySet(){SPEED=SET.speed;MU.vol=SET.music/100;MU.on=SET.music>0;AU.fxVol=SET.sfx/100;AU.on=SET.sfx>0;
 if(AU.ctx&&AU.fx)AU.fx.gain.value=AU.fxVol;if(AU.ctx&&MU.out&&MU.cur){MU.out.gain.cancelScheduledValues(AU.ctx.currentTime);MU.out.gain.setValueAtTime(MU.vol*(TRK[MU.cur].vol||1),AU.ctx.currentTime)}lsSet("settings",SET)}
function settingsHTML(){return`<div class="setRows">
 <label><span>音乐</span><input type="range" min="0" max="100" step="5" id="stMu" value="${SET.music}"><b id="stMuV">${SET.music}</b></label>
 <label><span>音效</span><input type="range" min="0" max="100" step="5" id="stFx" value="${SET.sfx}"><b id="stFxV">${SET.sfx}</b></label>
 <div class="setRow"><span>游戏速度</span>${[1,2,4].map(v=>`<button class="btn sm ${SET.speed===v?"gold":"dark"}" data-sp="${v}">${v} 倍</button>`).join("")}</div>
 <div class="setRow"><span>震屏</span><button class="btn sm ${SET.shake?"gold":"dark"}" id="stSh">${SET.shake?"开":"关"}</button></div></div>`}
function bindSettings(redraw){const mu=$("#stMu"),fx=$("#stFx");
 mu.oninput=()=>{SET.music=+mu.value;$("#stMuV").textContent=SET.music;au();applySet()};
 fx.oninput=()=>{SET.sfx=+fx.value;$("#stFxV").textContent=SET.sfx;applySet()};fx.onchange=()=>SFX.chip(3);
 $$("[data-sp]").forEach(b=>b.onclick=()=>{SET.speed=+b.dataset.sp;applySet();SFX.click();redraw()});
 $("#stSh").onclick=()=>{SET.shake=!SET.shake;applySet();SFX.click();redraw()}}
function settingsBox(){const draw=()=>{ov(`<div class="box setBox"><h2>设置</h2>${settingsHTML()}<button class="btn" id="stOk">好了</button></div>`);bindSettings(draw);$("#stOk").onclick=()=>{SFX.click();closeOv()}};SFX.click();draw()}
/* 游戏中的菜单 */
function gameMenu(){if(!G)return;SFX.click();const draw=()=>{ov(`<div class="box setBox menuBox"><h2>暂停</h2>
 <div class="menuBtns"><button class="btn gold" id="mnGo">继续</button><button class="btn dark" id="mnRule">玩法说明</button><button class="btn dark" id="mnHand">牌型表</button><button class="btn dark" id="mnHome">回主页</button></div>
 ${settingsHTML()}<p class="menuTip">进度在每次进商店、选关时自动保存。打到一半回主页，这一关要从头打。</p></div>`);
  bindSettings(draw);$("#mnGo").onclick=()=>{SFX.click();closeOv()};$("#mnHand").onclick=()=>handTable();$("#mnRule").onclick=rulesBox;
  $("#mnHome").onclick=()=>{SFX.click();closeOv();G.busy=0;titleScreen()}};draw()}
function rulesBox(){SFX.click();ov(`<div class="box rulesBox"><h2>玩法说明</h2><div class="rlCols">
 <div><b>怎么赢</b><p>每一关对面坐着一只奶蛙，打出的分数就是伤害，把它的血打空就过关。从打 2 一路打到打 A，打败阿岳就通关。</p>
 <b>出牌</b><p>用掼蛋的牌型出牌：单张、对子、三张、三带二、顺子、三连对、钢板、炸弹、同花顺、天王炸。伤害 = 筹码 × 倍率。</p>
 <b>压牌</b><p>对手每一轮都会出一手牌。你出同一种牌型而且更大（或者出炸弹），就是压住它：伤害 ×1.5。压不住只有 ×0.6。</p>
 <b>级牌和逢人配</b><p>打几，几就是级牌，比 A 还大。红桃的级牌是逢人配，能当王以外的任何一张牌。</p></div>
 <div><b>奶蛙池</b><p>打出去的牌会按花色变成小奶蛙跳进池子。同一家凑齐 3 只就消除，给你额外奖励。</p>
 <b>伙伴</b><p>在商店买，最多 5 个。算分从左到右，先加后乘更划算，点伙伴可以换位置。</p>
 <b>符咒和秘宝</b><p>放在符咒栏里，最多 2 张。大多要先在手牌里选好牌，再点符咒「使用」。可以删牌、改花色、复制牌、加增强和印。</p>
 <b>牌的增强和印</b><p>${Object.values(ENH).map(e=>`${e.n}：${e.d}`).join("；")}。印：${Object.values(SEALS).map(e=>`${e.n}（${e.d}）`).join("；")}。</p></div></div>
 <button class="btn" onclick="closeOv()">知道了</button></div>`)}
/* 主页：音乐开关换成「设置」 */
{const _t=titleScreen;titleScreen=function(){_t();const m=$(".tMus");if(m){m.textContent="设置";m.onclick=()=>{au();settingsBox()}}}}
addEventListener("load",applySet);
