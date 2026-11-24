/* ===================== 奶蛙牌 · 无尽模式的目标 + 总伤害排行榜 =====================
   无尽：每打完一轮，三选一一个奖励带进下一轮；横幅上写着下一个目标；加几个无尽成就
   排行榜：4 号榜「总伤害」，一局里所有出牌加起来（无尽接着算） */

/* ---------- 无尽：打完一轮，三选一 ---------- */
const E_REWARDS=[
 {id:"slot",n:"伙伴栏 +1",d:"多带一个伙伴（最多 8 个）",ok:()=>(G.pmax||5)<8,f:()=>{G.pmax=(G.pmax||5)+1}},
 {id:"tea",n:"所有牌型升 1 级",d:"每种牌型的筹码和倍率都涨一档",ok:()=>true,f:()=>{G.hl=G.hl||{};Object.keys(TEA).forEach(k=>G.hl[k]=(G.hl[k]||0)+1)}},
 {id:"hand",n:"每关出牌 +1",d:"无尽里一直有效，可以叠",ok:()=>(G.eHandsB||0)<3,f:()=>{G.eHandsB=(G.eHandsB||0)+1}},
 {id:"legend",n:"一个传说伙伴",d:"随机来一个传说伙伴（伙伴栏要有空位）",ok:()=>G.partners.length<(G.pmax||5)&&eLegendPool().length>0,f:()=>{const id=pick(eLegendPool());G.partners.push(id);toast(`<b>${PARTNERS[id].n}</b> 加入了队伍`)}},
 {id:"gold",n:"金币 +40",d:"下一轮的东西更贵，先攒着",ok:()=>true,f:()=>{G.gold+=40}}];
function eLegendPool(){return Object.keys(PARTNERS).filter(k=>PARTNERS[k].r==="L"&&!G.partners.includes(k)&&isUnlocked(k))}
function endlessReward(){return new Promise(res=>{const L=shuffleArr(E_REWARDS.filter(r=>{try{return r.ok()}catch(e){return false}})).slice(0,3);
 if(!L.length)return res();SFX.shine();
 ov(`<div class="box eRwBox"><h2>无尽 第 ${G.loop} 轮 打完了</h2><p class="msg">选一个奖励，带进第 ${G.loop+1} 轮</p><div class="eRw">${L.map((r,i)=>`<button class="eRwO" data-i="${i}"><b>${r.n}</b><small>${r.d}</small></button>`).join("")}</div></div>`);
 $$("#ov .eRwO").forEach(b=>b.onclick=()=>{const r=L[+b.dataset.i];SFX.coin();try{r.f()}catch(e){console.warn(e)}G.eGot=(G.eGot||0)+1;closeOv();try{renderSide();renderPartners()}catch(e){}res()})})}
{const _en=endlessNext;endlessNext=async function(){try{if(G&&G.endless&&G.loop>=1)await endlessReward()}catch(e){console.warn(e)}return _en.apply(this,arguments)}}
{const _h=hdOf;hdOf=function(lv,b){const r=_h(lv,b);if(G&&G.endless&&G.eHandsB)r[0]+=G.eHandsB;return r}}
// 选关页的横幅：写上下一个目标
{const _s=blindSelect;blindSelect=function(){const r=_s.apply(this,arguments);try{if(G&&G.endless){const e=$(".bsHead .eBan");if(e)e.insertAdjacentHTML("beforeend",`<div class="eGoal">下一个目标：打完这一轮（还剩 ${Math.max(1,LV_LIST.length-G.lvIdx)} 站）→ <b>三选一奖励</b>${eNextAch()}</div>`)}}catch(e){}return r}}
function eNextAch(){const n=[3,5,8].find(k=>(G.loop||0)<k);return n?`　·　走到第 ${n} 轮有成就`:""}

/* ---------- 无尽成就 + 总伤害成就 ---------- */
ACH.push(
 {id:"en3",n:"越打越远",d:"无尽模式走到第 3 轮",ok:()=>G&&G.endless&&(G.loop||0)>=3},
 {id:"en5",n:"不回家了",d:"无尽模式走到第 5 轮",ok:()=>G&&G.endless&&(G.loop||0)>=5},
 {id:"en8",n:"住在牌桌上",d:"无尽模式走到第 8 轮",ok:()=>G&&G.endless&&(G.loop||0)>=8},
 {id:"dm6",n:"百万伤害",d:"一局总伤害破 100 万",ok:()=>G&&G.stats&&(G.stats.dmg||0)>=1e6},
 {id:"dm8",n:"一个亿",d:"一局总伤害破 1 亿",ok:()=>G&&G.stats&&(G.stats.dmg||0)>=1e8});

/* ---------- 4 号榜：总伤害 ---------- */
LB.BOARDS[4]={n:"总伤害",u:"点",d:"一局里所有出牌加起来的伤害（无尽模式接着算）"};
LB.CAP4=2000000000;
{const _sb=LB.submit;LB.submit=function(b,score){if(b!==4)return _sb.apply(this,arguments);const cap=this.CAP;this.CAP=this.CAP4;try{return _sb.call(this,b,score)}finally{this.CAP=cap}}}
{const _o=LB.onRunEnd;LB.onRunEnd=function(){const r=_o.apply(this,arguments);try{const d=Math.floor((G&&G.stats&&G.stats.dmg)||0);if(d>0)this.submit(4,d)}catch(e){}return r}}
