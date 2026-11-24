/* ===================== 奶蛙牌 · B站 Toy 平台 =====================
   和奶蛙之塔同一套接口：toy.submitScore / getRankList / getMyRank（排行榜），getCloudStorage / setCloudStorage（云存档）
   直接打开网页（没有平台）时全部自动跳过，游戏照常运行 */
const TOY={ok:false,
 async wait(){if(!window.toy&&!document.querySelector('script[src*="toy-sdk"]'))return(this.ok=false);for(let i=0;i<60&&!window.toy;i++)await new Promise(r=>setTimeout(r,300));this.ok=!!window.toy;
  if(this.ok){try{if(toy.setContainerMode)toy.setContainerMode({orientation:"landscape"})}catch(e){}}return this.ok},
 lim(e){return !!(e&&(e.code===307044||String(e.message||"").indexOf("307044")>=0))},
 timeout(p,ms){return Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error("timeout")),ms))])}};

/* ---------- 排行榜 ----------
   1：走得最远（无尽模式接着算）　2：最痛一手（一局里单手最高伤害） */
const LB={cache:{},CAP:99999999,
 BOARDS:{1:{n:"走得最远",u:"关",d:"一局里一共打过几关（3 关一站；无尽模式接着往上算）"},2:{n:"最痛一手",u:"点",d:"一局里打出的单手最高伤害"}},
 ok(){return !!(window.toy&&toy.getRankList&&toy.submitScore)},
 far(){if(!G)return 0;return ((G.endless?G.loop*13:0)+G.lvIdx)*3+G.blind+(G.won?1:0)},
 submit(b,score){score=Math.min(this.CAP,Math.floor(+score||0));if(score<=0)return false;M.lbBest=M.lbBest||{};let rec=false;if(score>(M.lbBest[b]||0)){rec=true;M.lbBest[b]=score;saveMeta()}if(this.ok())this.send(b,score);return rec},
 send(b,score){M.lbPend=M.lbPend||{};if(score>(M.lbPend[b]||0))M.lbPend[b]=score;saveMeta();
  TOY.timeout(toy.submitScore({board:b,score}),10000).then(()=>{if(M.lbPend&&M.lbPend[b]<=score)delete M.lbPend[b];saveMeta();for(const k in this.cache)if(k.indexOf(b+"|")===0)delete this.cache[k]}).catch(()=>{})},
 resend(){if(!this.ok())return;M.lbPend=M.lbPend||{};for(const b in M.lbPend)this.send(+b,M.lbPend[b]);for(const b in (M.lbBest||{}))if(!(M.lbSync||{})[b]){M.lbSync=M.lbSync||{};M.lbSync[b]=1;this.send(+b,M.lbBest[b])}},
 onRunEnd(){try{const r=[];const f=this.far();if(this.submit(1,f))r.push(`走得最远 ${f} 关`);const h=(G.stats&&G.stats.best)||0;if(this.submit(2,h))r.push(`最痛一手 ${h.toLocaleString()}`);
  if(r.length)setTimeout(()=>{toast(`<b>新纪录！</b>${r.join("　")}`);SFX.shine()},1200)}catch(e){}},
 async get(b,per){const k=b+"|"+per,c=this.cache[k];if(c&&Date.now()-c.t<60000)return c;const o={t:Date.now(),list:[],me:null};
  try{const R=await Promise.all([TOY.timeout(toy.getRankList({board:b,period:per,limit:50}),8000).then(x=>x||[],()=>null),toy.getMyRank?TOY.timeout(toy.getMyRank({board:b,period:per}),8000).catch(()=>null):Promise.resolve(null)]);if(R[0]===null)o.err=1;else o.list=R[0];o.me=R[1]}catch(e){o.err=1}if(!o.err)this.cache[k]=o;return o}};
function cleanName(s){return String(s||"奶蛙").replace(/[<>&"]/g,"").slice(0,12)}
async function rankScreen(){let b=1,per="week";try{LB.resend()}catch(e){}SFX.click();
 const draw=async()=>{const B0=LB.BOARDS[b];const mine=(M.lbBest||{})[b]||0;
  ov(`<div class="box lbBox"><h2>排行榜</h2><div class="lbTabs">${Object.entries(LB.BOARDS).map(([k,v])=>`<button class="btn sm ${+k===b?"gold":"dark"}" data-b="${k}">${v.n}</button>`).join("")}<span class="lbSep"></span>${[["week","本周"],["all","总榜"]].map(([k,v])=>`<button class="btn sm ${k===per?"gold":"dark"}" data-p="${k}">${v}</button>`).join("")}</div>
  <p class="lbD">${B0.d}</p><div class="lbMe">我的最好成绩：<b>${mine.toLocaleString()}</b> ${B0.u}</div>
  <div class="lbList" id="lbList">${LB.ok()?`<p class="lbMsg">正在读取全服排行……</p>`:`<p class="lbMsg">在 B站 里打开游戏，就能看到全服排行榜。<br>现在只显示你自己的成绩。</p>`}</div><button class="btn" onclick="closeOv()">关上</button></div>`);
  $$("#ov .lbTabs [data-b]").forEach(x=>x.onclick=()=>{b=+x.dataset.b;SFX.click();draw()});$$("#ov .lbTabs [data-p]").forEach(x=>x.onclick=()=>{per=x.dataset.p;SFX.click();draw()});
  if(!LB.ok())return;const o=await LB.get(b,per);const el=$("#lbList");if(!el)return;
  if(o.err){el.innerHTML=`<p class="lbMsg">全服榜暂时连不上，稍后再试。</p>`;return}
  if(!o.list.length){el.innerHTML=`<p class="lbMsg">还没有人上榜。打一局，你就是第一名。</p>`;return}
  el.innerHTML=o.list.map((r,i)=>{const nm=cleanName(r.nickname),a=r.avatar?(String(r.avatar).indexOf("//")===0?"https:"+r.avatar:r.avatar):"";return`<div class="lbRow ${i<3?"top"+(i+1):""}"><b class="lbR">${r.rank||i+1}</b><span class="lbAv">${a?`<img referrerpolicy="no-referrer" src="${a.replace(/"/g,"")}" onerror="this.remove()">`:nm.slice(0,1)}</span><span class="lbN">${nm}</span><b class="lbS">${Number(r.score).toLocaleString()} <small>${B0.u}</small></b></div>`}).join("");
  const me=$("#ov .lbMe");if(me&&o.me&&o.me.ranked)me.innerHTML+=`　全服第 <b>${o.me.rank}</b> 名`};
 draw()}

/* ---------- 云存档：只存长线进度（解锁、纪录、难度），换设备也在 ---------- */
const CLOUD={st:"off",last:"",
 has(){return !!(window.toy&&toy.getCloudStorage&&toy.setCloudStorage)},
 prog(m){return m?((m.ach||[]).length)+(m.best||0)*10+(m.wins||0)*100+(m.maxDiff||0)*50+(m.endBest||0)*5+(m.bomb5?5:0):0},
 merge(a,b){const m=Object.assign({},a);["best","wins","maxDiff","endBest","bomb5"].forEach(k=>{m[k]=Math.max(+a[k]||0,+b[k]||0)});m.lbBest=Object.assign({},b.lbBest||{});for(const k in (a.lbBest||{}))m.lbBest[k]=Math.max(a.lbBest[k],m.lbBest[k]||0);["ach","metFoe","beatBoss","gotC","winHero"].forEach(k=>{m[k]=[...new Set([...(a[k]||[]),...(b[k]||[])])]});m.cnt=Object.assign({},b.cnt||{});for(const k in (a.cnt||{}))m.cnt[k]=Math.max(a.cnt[k],m.cnt[k]||0);return m},
 async init(){if(this.st!=="off")return;this.st="wait";if(!await TOY.wait()||!this.has()){this.st="none";return}
  try{const r=await TOY.timeout(toy.getCloudStorage(["np_meta"]),8000);const cm=r&&r.np_meta?JSON.parse(r.np_meta):null;
   if(cm&&this.prog(cm)>0){const nm=this.merge(M,cm);const changed=JSON.stringify(nm)!==JSON.stringify(M);Object.assign(M,nm);saveMeta();if(changed&&$("#title.on"))toast("已从云端找回你的进度")}}catch(e){}
  this.st="on";this.up();setTimeout(()=>{try{LB.resend()}catch(e){}},3000)},
 up(){if(this.st!=="on")return;const s=JSON.stringify({best:M.best,wins:M.wins,maxDiff:M.maxDiff,endBest:M.endBest,bomb5:M.bomb5,lbBest:M.lbBest,ach:M.ach,metFoe:M.metFoe,beatBoss:M.beatBoss,gotC:M.gotC,winHero:M.winHero,cnt:M.cnt}).replace(/[\u007f-￿]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
  if(s===this.last)return;this.last=s;TOY.timeout(toy.setCloudStorage({np_meta:s}),10000).catch(()=>{this.last=""})}};
{const _s=saveMeta;saveMeta=function(){_s();clearTimeout(CLOUD._t);CLOUD._t=setTimeout(()=>CLOUD.up(),3000)}}

/* ---------- 接到游戏 ---------- */
{const _g=gameOver;gameOver=function(){LB.onRunEnd();return _g.apply(this,arguments)}}
{const _w=runWin;runWin=function(){G.won=1;LB.onRunEnd();return _w.apply(this,arguments)}}
{const _t=titleScreen;titleScreen=function(){_t();const b=document.createElement("button");b.className="btn dark tRank";b.textContent="排行榜";b.onclick=()=>{au();rankScreen()};$("#title").appendChild(b)}}
addEventListener("load",()=>{CLOUD.init()});
