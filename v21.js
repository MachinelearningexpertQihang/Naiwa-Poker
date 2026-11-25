/* ===================== 奶蛙牌 2.1 流畅模式 / 2.2 彩虹伙伴 ===================== */

/* ---------- 1. 画质：流畅（手机默认）/ 高清 ---------- */
const LITE_DEF=(()=>{try{return matchMedia("(pointer:coarse)").matches||("ontouchstart" in window)}catch(e){return false}})();
const liteOn=()=>SET.lite===undefined?LITE_DEF:!!SET.lite;
function liteApply(){try{document.body.classList.toggle("lite",liteOn());BGFX.lite=liteOn()}catch(e){}}
{const _a=applySet;applySet=function(){const r=_a.apply(this,arguments);liteApply();return r}}
{const _h=settingsHTML;settingsHTML=function(){const L=liteOn();return _h().replace(/<\/div>$/,`<div class="setRow"><span>画质</span><button class="btn sm ${L?"gold":"dark"}" id="stLite1">流畅</button><button class="btn sm ${L?"dark":"gold"}" id="stLite0">高清</button></div></div>`)}}
{const _b=bindSettings;bindSettings=function(redraw){_b(redraw);const s=(v)=>()=>{SET.lite=v;applySet();SFX.click();redraw()};const a=$("#stLite1"),b=$("#stLite0");if(a)a.onclick=s(true);if(b)b.onclick=s(false)}}
if(document.body)liteApply();else addEventListener("DOMContentLoaded",liteApply);

/* ---------- 2.2 彩虹伙伴：商店偶尔刷出彩虹版伙伴（很少、很贵），每出一手 倍率 ×1.5 ---------- */
const RB_P=.03;   // 每个伙伴格子是彩虹版的几率
function rbOwn(G){if(!G||!G.partners)return[];const rb=G.rb||{};const out=G.partners.filter(id=>rb[id]);
 // 沾光奶蛙：它左边相邻的伙伴也算彩虹
 G.partners.forEach((id,i)=>{if(id==="r_tx"&&i>0){const l=G.partners[i-1];if(!out.includes(l))out.push(l)}});return out}
const rbX=G=>1.5+(G.partners.includes("r_qc")?.25:0)+(setOn(G,"彩虹")?.5:0);
const rbPrice=(base,G)=>base*2+3-(G&&G.partners.includes("r_by")?4:0);
function rbClean(){if(!G||!G.rb)return;for(const k in G.rb)if(!G.partners.includes(k))delete G.rb[k]}
// 伙伴卡：彩虹边
{const _pc=partnerCard;partnerCard=function(id,cls=""){let h=_pc(id,cls);try{if(G&&G.rb&&G.rb[id]&&G.partners.includes(id)&&!/big/.test(cls))h=h.replace('<div class="pc ','<div class="pc rbw ')}catch(e){}return h}}
{const _rp=renderPartners;renderPartners=function(){rbClean();const r=_rp.apply(this,arguments);try{const own=rbOwn(G);document.querySelectorAll("#partners .pCard").forEach(e=>{const id=G.partners[+e.dataset.i];const pc=e.querySelector(".pc");if(pc)pc.classList.toggle("rbw",own.includes(id))})}catch(e){}return r}}
{const _pd=partnerDesc;partnerDesc=function(id){let d=_pd(id);try{if(rbOwn(G).includes(id))d+=`<br><span class="rbTxt">彩虹：每出一手 倍率 ×${rbX(G)}</span>`}catch(e){}return d}}
// 每出一手：每个彩虹伙伴 倍率 ×1.5
{const _eh=extraHand;extraHand=function(x,G){const out=_eh.apply(this,arguments)||[];try{const own=rbOwn(G);if(own.length){const m=rbX(G);
 own.forEach(id=>{x.mult=r1(x.mult*m);out.push(`彩虹${PARTNERS[id]?PARTNERS[id].n:"伙伴"} ×${m}`)});
 if(G.partners.includes("r_sf")){x.mult+=8*own.length;out.push(`彩虹信徒 +${8*own.length} 倍率`)}}}catch(e){console.warn(e)}return out}}
// 商店：伙伴格子偶尔是彩虹版；价格翻倍再贵 3
{const _p=ptP;ptP=id=>{const b=_p(id);try{const it=G&&G.shop&&G.shop.items.find(x=>x.k==="partner"&&x.id===id&&!x.sold);if(it&&it.rb)return rbPrice(b,G)}catch(e){}return b}}
{const _r=shopRender;shopRender=function(){try{(G.shop.items||[]).forEach((it,i)=>{if(it.k==="bath")G.shop.items[i]={k:"pack",id:"card",p:4,n:4};
  if(it.k==="partner"&&it.rbFor!==it.id){it.rbFor=it.id;it.rb=rnd()<RB_P*(G.partners.includes("r_lg")?2:1)}})}catch(e){}
 const r=_r.apply(this,arguments);
 try{const row=$("#shop .shRow");if(row)G.shop.items.forEach((it,i)=>{if(it.k!=="partner"||it.sold||!it.rb)return;const el=row.children[i];if(!el)return;el.classList.add("rbItem");const pc=el.querySelector(".pc");if(pc)pc.classList.add("rbw");
  if(!el.querySelector(".rbTag"))el.insertAdjacentHTML("afterbegin",`<span class="rbTag">彩虹</span>`);const p=el.querySelector(".price");if(p)p.textContent=ptP(it.id);
  const d=el.querySelector("p");if(d&&!d.querySelector(".rbTxt"))d.insertAdjacentHTML("beforeend",`<br><span class="rbTxt">彩虹：每出一手 倍率 ×1.5</span>`)})}catch(e){console.warn(e)}return r}}
{const _b=shopBuy;shopBuy=async function(i){const it=G.shop.items[i];const pt=it&&it.k==="partner"&&!it.sold,rb=pt&&it.rb,id=it&&it.id;const r=await _b.apply(this,arguments);
 try{if(pt&&it.sold&&G.partners.includes(id)){G.rb=G.rb||{};if(rb){G.rb[id]=1;SFX.shine();toast(`<b>彩虹${PARTNERS[id].n}</b> 加入了！每出一手 倍率 ×${rbX(G)}`)}else delete G.rb[id];renderPartners()}}catch(e){console.warn(e)}return r}}
// 彩虹奶马：打赢首领，随机把一个普通伙伴染成彩虹
{const _bw=blindWin;blindWin=async function(){try{if(G&&G.blind===2&&G.partners.includes("r_qh")){const own=rbOwn(G);const c=G.partners.filter(id=>!own.includes(id));if(c.length){const id=pick(c);G.rb=G.rb||{};G.rb[id]=1;setTimeout(()=>{toast(`彩虹奶马把 <b>${PARTNERS[id].n}</b> 染成了彩虹`);renderPartners()},600)}}}catch(e){}return _bw.apply(this,arguments)}}

/* ---------- 2.2 彩虹流：6 个伙伴 + 套装 ---------- */
Object.assign(PARTNERS,{
 r_lg:{t:"彩虹",n:"寻彩奶蛙",img:"u_lg",r:"C",p:5,d:"商店里刷出彩虹伙伴的几率翻倍"},
 r_sf:{t:"彩虹",n:"彩虹信徒",img:"u_sf",r:"R",p:6,d:"每有 1 个彩虹伙伴，倍率 +8"},
 r_qh:{t:"彩虹",n:"彩虹奶马",img:"u_qh",r:"R",p:7,d:"打赢首领后，随机把一个普通伙伴染成彩虹"},
 r_by:{t:"彩虹",n:"富贵奶狗",img:"u_by",r:"C",p:5,d:"彩虹伙伴便宜 4 金币"},
 r_qc:{t:"彩虹",n:"七彩奶鸡",img:"u_qc",r:"E",p:9,d:"彩虹伙伴的 ×1.5 变成 ×1.75"},
 r_tx:{t:"彩虹",n:"沾光奶蛙",img:"u_tx",r:"R",p:6,d:"它左边挨着的那个伙伴也算彩虹（可以拖动调位置）"}});
SETS_OFF["彩虹"]={d:"彩虹伙伴的 ×1.5 再 +0.5"};
