/* ===================== 奶蛙牌 · 存档（照奶蛙之塔 6.0）=====================
   三层：① 本机 localStorage（np-meta / np-run）
         ② 本机备份：IndexedDB + Cache Storage 各存一份，localStorage 被清了也能找回
         ③ B站 云存档：进度 + 这一局，切成小块上传；换设备、换地址都能找回
   还有：在线时长、手动「立即存档」 */

/* ---------- 在线时长 ---------- */
const fmtPlay=ms=>{const m=Math.floor((ms||0)/60000),h=Math.floor(m/60);return h?`${h} 小时 ${m%60} 分`:`${m} 分钟`};
setInterval(()=>{try{if(document.hidden||!M)return;M.playMs=(M.playMs||0)+5000;if(G)G.playMs=(G.playMs||0)+5000;M._pt=(M._pt||0)+1;if(M._pt>=12){M._pt=0;saveMeta()}const e=$("#tPlay");if(e)e.textContent="在线 "+fmtPlay(M.playMs)}catch(e){}},5000);
addEventListener("pagehide",()=>{try{saveMeta();NPB.save();CL2.up(true)}catch(e){}});
document.addEventListener("visibilitychange",()=>{if(document.hidden){try{saveMeta();NPB.save();CL2.up(true)}catch(e){}}});

/* 进度有多少：用来比较哪一份存档更新、更多 */
function npProg(m){if(!m)return 0;const n=o=>Array.isArray(o)?o.length:o&&typeof o==="object"?Object.keys(o).length:0;
 return Math.round((m.best||0)*10+(m.wins||0)*100+(m.maxDiff||0)*50+(m.endBest||0)*5+n(m.ach)*3+n(m.beatBoss)*2+n(m.gotC)+n(m.dailyTry)*5+(m.playMs||0)/60000)}
const runRaw=()=>{try{return localStorage.getItem("np-run")}catch(e){return null}};

/* ---------- ② 本机备份 ---------- */
const NPB={t:0,
 open(){return new Promise((res,rej)=>{try{const r=indexedDB.open("np-backup",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})},
 snap(){let m=null;try{m=JSON.stringify(M)}catch(e){}return m?{t:Date.now(),m,s:runRaw()}:null},
 save(){clearTimeout(this.t);this.t=0;const o=this.snap();if(!o)return Promise.resolve(false);
  const a=this.open().then(db=>new Promise(res=>{const tx=db.transaction("kv","readwrite");tx.objectStore("kv").put(o,"s");tx.oncomplete=()=>{db.close();res(true)};tx.onerror=tx.onabort=()=>{db.close();res(false)}})).catch(()=>false);
  const b=(async()=>{try{if(!window.caches)return false;const c=await caches.open("np-backup");await c.put("np-save.json",new Response(JSON.stringify(o),{headers:{"content-type":"application/json"}}));return true}catch(e){return false}})();
  return Promise.all([a,b]).then(r=>r[0]||r[1])},
 soon(){if(!this.t)this.t=setTimeout(()=>this.save(),1500)},
 load1(){return this.open().then(db=>new Promise(res=>{const tx=db.transaction("kv","readonly");const r=tx.objectStore("kv").get("s");r.onsuccess=()=>{res(r.result||null);db.close()};r.onerror=()=>{res(null);db.close()}})).catch(()=>null)},
 async load2(){try{if(!window.caches)return null;const c=await caches.open("np-backup");const r=await c.match("np-save.json");return r?await r.json():null}catch(e){return null}},
 async load(){const [a,b]=await Promise.all([this.load1(),this.load2()]);if(a&&b)return (b.t||0)>(a.t||0)?b:a;return a||b},
 // 本机存储被清掉了（或者比备份少），就用备份
 async restore(){const o=await TOY.timeout(this.load(),3000).catch(()=>null);if(!o||!o.m)return false;let bm=null;try{bm=JSON.parse(o.m)}catch(e){return false}let ch=false;
  if(npProg(bm)>npProg(M)){Object.keys(M).forEach(k=>delete M[k]);Object.assign(M,bm);lsSet("meta",M);ch=true}
  if(o.s&&o.s!=="null"&&runRaw()===null){try{localStorage.setItem("np-run",o.s);ch=true}catch(e){}}
  return ch}};

/* ---------- ③ 云存档（新版：进度 + 这一局，切块上传） ---------- */
const CL2={st:"off",busy:false,dirty:false,last:"",lastUp:0,t:0,pend:null,
 has(){return !!(window.toy&&toy.getCloudStorage&&toy.setCloudStorage)},
 pack(){let run=null;try{run=JSON.parse(runRaw()||"null")}catch(e){}const s=JSON.stringify({v:2,t:Date.now(),m:M,s:run}).replace(/[\u007f-￿]/g,c=>"\\u"+c.charCodeAt(0).toString(16).padStart(4,"0"));const ch=[];for(let i=0;i<s.length;i+=1000)ch.push(s.slice(i,i+1000));return ch},
 async init(){if(this.st!=="off")return;this.st="wait";
  try{if(await NPB.restore()&&!G&&$("#title.on")){titleScreen();toast("已从本机备份找回你的存档")}}catch(e){}
  if(!await TOY.wait()||!this.has()){this.st="none";return}
  let o=null;try{const r=await TOY.timeout(toy.getCloudStorage(["npv2_m"]),8000);const mt=r&&r.npv2_m?JSON.parse(r.npv2_m):null;
   if(mt&&mt.n&&mt.n<=150){const ks=[...Array(mt.n)].map((_,i)=>"npv2_"+i);const r2=await TOY.timeout(toy.getCloudStorage(ks),10000);try{o=JSON.parse(ks.map(k=>(r2&&r2[k])||"").join(""))}catch(e){o=null}}}
  catch(e){this.st="retry";setTimeout(()=>{this.st="off";this.init()},15000);return}
  if(o&&o.m&&npProg(o.m)>npProg(M)){if(!G&&$("#title.on"))this.apply(o);else this.pend=o}
  else if(o&&o.s&&runRaw()===null&&!G){try{localStorage.setItem("np-run",JSON.stringify(o.s));if($("#title.on"))titleScreen()}catch(e){}}
  this.st="on";this.up()},
 apply(o){const old=JSON.parse(JSON.stringify(M));Object.keys(M).forEach(k=>delete M[k]);Object.assign(M,o.m);
  // 两边各自的最好成绩取大的
  ["best","wins","maxDiff","endBest","playMs","dmgBest","dmgAll"].forEach(k=>{M[k]=Math.max(+M[k]||0,+old[k]||0)});
  lsSet("meta",M);if(o.s&&runRaw()===null){try{localStorage.setItem("np-run",JSON.stringify(o.s))}catch(e){}}
  NPB.save();if(!G&&$("#title.on"))titleScreen();toast("已从云端找回你的存档")},
 soon(){this.dirty=true;clearTimeout(this.t);this.t=setTimeout(()=>this.up(),4000)},
 async up(force){if(this.st!=="on"||this.busy)return false;const ch=this.pack(),key=ch.join("");if(!force&&key===this.last)return true;this.busy=true;
  try{const o={npv2_m:JSON.stringify({n:ch.length,t:Date.now()})};ch.forEach((c,i)=>o["npv2_"+i]=c);await TOY.timeout(toy.setCloudStorage(o),10000);this.last=key;this.lastUp=Date.now();this.dirty=false;return true}
  catch(e){this.last="";return false}finally{this.busy=false}}};
addEventListener("load",()=>{setTimeout(()=>CL2.init(),600)});
// 回到主页时，有等着的云端存档就用上
{const _t=titleScreen;titleScreen=function(){_t.apply(this,arguments);try{if(CL2.pend&&!G){const o=CL2.pend;CL2.pend=null;CL2.apply(o)}
  const p=document.createElement("div");p.id="tPlay";p.className="tPlay";p.textContent="在线 "+fmtPlay(M.playMs);$("#title").appendChild(p)}catch(e){}}}

/* 存一次，三层一起更新 */
{const _sm=saveMeta;saveMeta=function(){const r=_sm.apply(this,arguments);try{NPB.soon();CL2.soon()}catch(e){}return r}}
{const _sr=saveRun;saveRun=function(){const r=_sr.apply(this,arguments);try{NPB.soon();CL2.soon()}catch(e){}return r}}
{const _cr=clearRun;clearRun=function(){const r=_cr.apply(this,arguments);try{NPB.soon();CL2.soon()}catch(e){}return r}}

/* ---------- 手动存档：菜单里点一下，三层都存 ---------- */
async function manualSave(){SFX.click();let okL=false;try{if(G&&!G.tut){saveRun(G.where||"blinds")}lsSet("meta",M);okL=localStorage.getItem("np-meta")!==null}catch(e){}
 let okB=false;try{okB=await NPB.save()}catch(e){}let okC=null;if(CL2.st==="on"){okC=await CL2.up(true)}
 SFX[okL||okB?"shine":"bad"]();toast(okL?(okC===true?"<b>存好了</b>：本机和云端都已保存":okC===false?"<b>本机已保存</b>，云端这次没连上，稍后会自动再传":"<b>本机已保存</b>"+(CL2.st==="none"?"（在 B站 里打开才有云存档）":"")):okB?"<b>存到备份里了</b>：这台设备的普通存储写不进去":"<b>没存上</b>，请不要关闭游戏，稍后再试")}
{const _gm=gameMenu;gameMenu=function(){_gm.apply(this,arguments);try{const row=$("#ov .menuBtns");if(row&&!$("#mnSave")){const b=document.createElement("button");b.className="btn dark";b.id="mnSave";b.textContent="立即存档";b.onclick=manualSave;row.appendChild(b)}
  const tp=$("#ov .menuTip");if(tp)tp.innerHTML=`进度在每次进商店、选关时自动保存，本机、本机备份、云端各存一份。${CL2.st==="on"?"云存档：<b>已连上</b>":CL2.st==="none"?"云存档：在 B站 里打开才有":"云存档：连接中"}　在线 ${fmtPlay(M.playMs)}${M.dmgBest?`<br>最高一局总伤害 ${M.dmgBest.toLocaleString()}　一共打出 ${(M.dmgAll||0).toLocaleString()}`:""}`}catch(e){}}}

/* ---------- 每一局的总伤害：记最高的一局，也记一共打出过多少 ---------- */
function dmgNote(){try{const S=G&&G.stats;if(!S)return"";if(S.dmgRec)return`<em class="dmgRec">新纪录！</em>`;return M.dmgBest?`<em>最高 ${M.dmgBest.toLocaleString()}</em>`:""}catch(e){return""}}
{const _re=runEnd;runEnd=function(){const r=_re.apply(this,arguments);try{const S=G&&G.stats;if(S&&!G.tut){const d=S.dmg||0,add=d-(S.dmgSaved||0);if(add>0){M.dmgAll=(M.dmgAll||0)+add;S.dmgSaved=d}
  if(d>(M.dmgBest||0)){M.dmgBest=d;S.dmgRec=1}else S.dmgRec=0;saveMeta()}}catch(e){console.warn(e)}return r}}

/* ===================== 1.5：存档再向奶蛙之塔看齐 =====================
   ① 连不上云端会按 3s / 8s / 20s / 60s 重试；B站 限流时等 30 秒再试；一直连不上就提示「登录 B站 后可开启云存档」
   ② 上传失败自动隔一会儿再传（限流时越等越久）；只上传有变化的那几块
   ③ 云端和本机合并：每一项取两边更好的（成就、图鉴取并集，纪录取最大），不会互相覆盖丢东西
   ④ 设置里能看到云存档状态和上次同步时间，还有「从云端找回存档」
   ⑤ 本机存储写不进去时，自动改存到备份区并提醒一次 */
function npMerge(a,b,d){d=d||0;if(Array.isArray(a)&&Array.isArray(b))return[...new Set([...b,...a].map(x=>typeof x==="object"?JSON.stringify(x):x))].map(x=>{try{return typeof x==="string"&&/^[\[{]/.test(x)?JSON.parse(x):x}catch(e){return x}});
 if(typeof a==="number"&&typeof b==="number")return Math.max(a,b);if(typeof a==="boolean"||typeof b==="boolean")return !!(a||b);
 if(a&&b&&typeof a==="object"&&typeof b==="object"&&d<3){const m={};new Set([...Object.keys(b),...Object.keys(a)]).forEach(k=>{m[k]=k in a?(k in b?npMerge(a[k],b[k],d+1):a[k]):b[k]});return m}
 return a!==undefined&&a!==null?a:b}
Object.assign(CL2,{tries:0,fail:0,back:0,lastCh:[],
 async init(){if(this.st!=="off"&&this.st!=="retry")return;this.st="wait";
  if(!this._nb){this._nb=1;try{if(await NPB.restore()&&!G&&$("#title.on")){titleScreen();toast("已从本机备份找回你的存档")}}catch(e){}}
  if(!await TOY.wait()||!this.has()){this.st="none";return}
  let o=null;
  try{const r=await TOY.timeout(toy.getCloudStorage(["npv2_m"]),8000);const mt=r&&r.npv2_m?JSON.parse(r.npv2_m):null;
   if(mt&&mt.n&&mt.n<=150){const ks=[...Array(mt.n)].map((_,i)=>"npv2_"+i);const r2=await TOY.timeout(toy.getCloudStorage(ks),10000);const parts=ks.map(k=>(r2&&r2[k])||"");try{o=JSON.parse(parts.join(""))}catch(e){o=null}if(o&&o.m)this.lastCh=parts}}
  catch(e){if(TOY.lim(e)){this.st="retry";setTimeout(()=>{if(this.st==="retry")this.init()},30000);return}
   this.tries++;if(this.tries<5){this.st="retry";setTimeout(()=>{if(this.st==="retry")this.init()},[3000,8000,20000,60000][this.tries-1]);return}this.st="nologin";return}
  this.tries=0;
  if(o&&o.m){if(npProg(o.m)>npProg(M)){if(!G&&$("#title.on"))this.apply(o);else this.pend=o}
   else{try{const lb=o.m.lbBest||{};M.lbBest=M.lbBest||{};let ch=0;for(const k in lb)if((+lb[k]||0)>(M.lbBest[k]||0)){M.lbBest[k]=+lb[k];ch=1}if(ch)lsSet("meta",M)}catch(e){}
    if(o.s&&runRaw()===null&&!G){try{localStorage.setItem("np-run",JSON.stringify(o.s));if($("#title.on"))titleScreen()}catch(e){}}}}
  this.st="on";this.up(true)},
 apply(o){const old=JSON.parse(JSON.stringify(M));Object.keys(M).forEach(k=>delete M[k]);Object.assign(M,npMerge(o.m,old));
  lsSet("meta",M);if(o.s&&runRaw()===null){try{localStorage.setItem("np-run",JSON.stringify(o.s))}catch(e){}}
  NPB.save();if(!G&&$("#title.on"))titleScreen();toast("已从云端找回你的存档")},
 soon(){this.dirty=true;clearTimeout(this.t);this.t=setTimeout(()=>this.up(),Math.max(4000,this.back||0))},
 async up(force){if(this.st!=="on"||this.busy)return false;const ch=this.pack(),key=ch.join("");if(!force&&key===this.last)return true;this.busy=true;
  try{const o={};ch.forEach((c,i)=>{if(force||this.lastCh[i]!==c)o["npv2_"+i]=c});o.npv2_m=JSON.stringify({n:ch.length,t:Date.now(),p:npProg(M)});
   await TOY.timeout(toy.setCloudStorage(o),10000);this.last=key;this.lastCh=ch;this.lastUp=Date.now();this.dirty=false;this.fail=0;this.back=0;return true}
  catch(e){this.last="";if(TOY.lim(e))this.back=Math.min((this.back||15000)*2,600000);else{this.fail++;this.back=15000*this.fail}
   if(this.fail>=6){this.st="nologin";return false}setTimeout(()=>{this.busy||this.up()},this.back);return false}
  finally{this.busy=false}},
 txt(){const t=this.lastUp?new Date(this.lastUp):null;return{on:"云存档：已开启"+(t?"　上次同步 "+t.getHours()+":"+String(t.getMinutes()).padStart(2,"0"):""),wait:"云存档：正在连接",off:"云存档：正在连接",retry:"云存档：正在重新连接",nologin:"云存档：登录 B站 后才能开启（现在只存在这台设备上）",none:"云存档：在 B站 里打开才有"}[this.st]+(this.pend?"　·　云端有进度更多的存档，回到主页会自动恢复":"")}});
// 从后台回来：之前没连上的，重新连一次
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&CL2.st==="nologin"){CL2.st="off";CL2.tries=0;CL2.fail=0;CL2.init()}});
// 菜单里的说明换成带上次同步时间的
{const _gm2=gameMenu;gameMenu=function(){_gm2.apply(this,arguments);try{const tp=$("#ov .menuTip");if(tp)tp.innerHTML=`进度在每次进商店、选关时自动保存，本机、本机备份、云端各存一份。${CL2.txt()}　在线 ${fmtPlay(M.playMs)}${M.dmgBest?`<br>最高一局总伤害 ${M.dmgBest.toLocaleString()}　一共打出 ${(M.dmgAll||0).toLocaleString()}`:""}`}catch(e){}}}

/* 本机存储写不进去：改存到备份区，提醒一次 */
let NP_SAVE_ERR=0;
{const _ls=lsSet;lsSet=function(k,v){_ls.apply(this,arguments);if(k!=="meta"&&k!=="run")return;let ok=true;try{ok=localStorage.getItem("np-"+k)===JSON.stringify(v)}catch(e){ok=false}
 if(!ok){try{NPB.save()}catch(e){}if(!NP_SAVE_ERR){NP_SAVE_ERR=1;setTimeout(()=>{try{toast("这台设备的普通存储写不进去，进度改存到了备份区"+(CL2.st==="on"?"和云端":"")+"，下次打开会自动找回")}catch(e){}},800)}}}}

/* 设置里：云存档状态 + 从云端找回 */
async function cloudRecover(){SFX.click();if(!(window.toy&&toy.getCloudStorage)){toast("要在 B站 里打开游戏，才能用云存档");return}
 if(G){toast("请先回到主页再找回");return}toast("正在读取云存档……");let o=null;
 try{const r=await TOY.timeout(toy.getCloudStorage(["npv2_m"]),8000);const mt=r&&r.npv2_m?JSON.parse(r.npv2_m):null;if(mt&&mt.n&&mt.n<=150){const ks=[...Array(mt.n)].map((_,i)=>"npv2_"+i);const r2=await TOY.timeout(toy.getCloudStorage(ks),10000);o=JSON.parse(ks.map(k=>(r2&&r2[k])||"").join(""))}}
 catch(e){toast("云存档暂时连不上，稍后再试");return}
 if(!o||!o.m){toast("云端还没有你的存档");return}
 const m=o.m,f=x=>(+x||0).toLocaleString(),ac=x=>(x||[]).length;
 ov(`<div class="box setBox"><h2>从云端找回存档</h2><p class="msg">找回后，这台设备上的进度会和云端的合在一起（每一项取两边更好的那份），不会丢东西。</p>
  <table class="cmpT"><tr><td></td><td><b>云端</b></td><td><b>这台设备</b></td></tr><tr><td>通关</td><td>${f(m.wins)} 次</td><td>${f(M.wins)} 次</td></tr><tr><td>最远</td><td>第 ${f(m.best)} 站</td><td>第 ${f(M.best)} 站</td></tr><tr><td>成就</td><td>${ac(m.ach)} 个</td><td>${ac(M.ach)} 个</td></tr><tr><td>在线</td><td>${fmtPlay(m.playMs)}</td><td>${fmtPlay(M.playMs)}</td></tr></table>
  <button class="btn gold" id="crGo">找回</button><button class="btn dark" id="crNo">算了</button></div>`);
 $("#crNo").onclick=()=>{SFX.click();closeOv()};$("#crGo").onclick=()=>{closeOv();CL2.apply(o);CL2.up(true)}}
{const _bs=bindSettings;bindSettings=function(){const r0=_bs.apply(this,arguments);try{const ok=$("#stOk");if(ok&&!$("#stCloud")){const p=document.createElement("p");p.className="cloudSt";p.textContent=CL2.txt();ok.before(p);
  if(!G){const b=document.createElement("button");b.className="btn dark";b.id="stCloud";b.textContent="从云端找回存档";b.onclick=cloudRecover;ok.before(b)}}}catch(e){}return r0}}
