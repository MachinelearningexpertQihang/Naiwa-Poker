/* ===================== 奶蛙牌 2.1 流畅模式 / 2.2 彩虹伙伴 ===================== */

/* ---------- 1. 画质：流畅（手机默认）/ 高清 ---------- */
const LITE_DEF=(()=>{try{return matchMedia("(pointer:coarse)").matches||("ontouchstart" in window)}catch(e){return false}})();
const liteOn=()=>SET.lite===undefined?LITE_DEF:!!SET.lite;
function liteApply(){try{document.body.classList.toggle("lite",liteOn());BGFX.lite=liteOn()}catch(e){}}
{const _a=applySet;applySet=function(){const r=_a.apply(this,arguments);liteApply();return r}}
{const _h=settingsHTML;settingsHTML=function(){const L=liteOn();return _h().replace(/<\/div>$/,`<div class="setRow"><span>画质</span><button class="btn sm ${L?"gold":"dark"}" id="stLite1">流畅</button><button class="btn sm ${L?"dark":"gold"}" id="stLite0">高清</button></div></div>`)}}
{const _b=bindSettings;bindSettings=function(redraw){_b(redraw);const s=(v)=>()=>{SET.lite=v;applySet();SFX.click();redraw()};const a=$("#stLite1"),b=$("#stLite0");if(a)a.onclick=s(true);if(b)b.onclick=s(false)}}
if(document.body)liteApply();else addEventListener("DOMContentLoaded",liteApply);

/* ---------- 2.2 伙伴品质：闪光 / 水墨 / 星空 / 负色 / 彩虹（只给伙伴，不给扑克牌） ----------
   闪光最好拿，彩虹最难拿也最贵 */
const PED={
 foil:{n:"闪光",p:.07,add:2,d:"每出一手 倍率 +10"},
 ink:{n:"水墨",p:.045,add:3,d:"每出一手 筹码 +60"},
 star:{n:"星空",p:.03,add:0,d:"出了{f}牌 倍率 +30"},
 neg:{n:"负色",p:.02,add:5,d:"不占伙伴位"},
 rb:{n:"彩虹",p:.015,add:0,d:"每出一手，这一手最后的倍率再 ×{x}"}};
const PED_K=["foil","ink","star","neg","rb"];
const SUIT_FAM=["♠奶蛙","♥奶猫","♣奶鸡","♦奶马"];
// 一个伙伴可以同时有好几种品质：G.ped[id]=["foil","rb"]
const pedArr=v=>Array.isArray(v)?v.filter(k=>PED[k]):v&&PED[v]?[v]:[];
function pedMig(){if(!G)return;G.ped=G.ped||{};G.pedF=G.pedF||{};for(const k in G.ped)G.ped[k]=pedArr(G.ped[k]);if(G.rb){for(const k in G.rb)if(G.rb[k]){G.ped[k]=pedArr(G.ped[k]);if(!G.ped[k].includes("rb"))G.ped[k].push("rb")}delete G.rb}}
const pedOf=id=>{pedMig();return G.ped[id]||[]};
const pedHas=(id,k)=>pedOf(id).includes(k);
function rbOwn(G){if(!G||!G.partners)return[];pedMig();const out=G.partners.filter(id=>pedHas(id,"rb"));
 // 沾光奶蛙：它左边挨着的伙伴也算彩虹
 G.partners.forEach((id,i)=>{if(id==="r_tx"&&i>0){const l=G.partners[i-1];if(!out.includes(l))out.push(l)}});return out}
const rbX=G=>1.5+(G.partners.includes("r_qc")?.25:0)+(setOn(G,"彩虹")?.5:0);
function pedTxt(k,id,fam){const f=fam!=null?fam:((G.pedF||{})[id]||0);return PED[k].d.replace("{f}",SUIT_FAM[f]).replace("{x}",G?rbX(G):1.5)}
function pedPrice(ks,base){ks=pedArr(ks);if(!ks.length)return base;let p=ks.includes("rb")?base*2+3:base;ks.forEach(k=>{if(k!=="rb")p+=PED[k].add});if(G&&G.partners.includes("r_by"))p-=3;return Math.max(base,p)}
// 第 7 站起品质更容易刷到：每站 +15%（彩虹只 +8%，还是难拿）
const pedLate=k=>{const n=Math.max(0,((G&&G.lvIdx)||0)-5);return 1+n*(k==="rb"?.08:.15)};
function pedRoll(){const m=G&&G.partners.includes("r_lg")?2:1;return PED_K.filter(k=>rnd()<PED[k].p*m*pedLate(k))}
// 伙伴丢了：清掉品质；负色走了伙伴位也收回
function pedClean(){if(!G)return;pedMig();for(const k in G.ped)if(!G.partners.includes(k)){delete G.ped[k];delete G.pedF[k]}
 const n=G.partners.filter(id=>pedHas(id,"neg")).length;if((G._negN||0)>n){G.pmax=Math.max(5,(G.pmax||5)-((G._negN||0)-n))}G._negN=Math.min(G._negN||0,n)}
function pedGive(id,k,fam){pedMig();const a=G.ped[id]=pedArr(G.ped[id]);if(a.includes(k))return false;a.push(k);
 if(k==="star")G.pedF[id]=fam!=null?fam:Math.floor(rnd()*4);if(k==="neg"){G.pmax=(G.pmax||5)+1;G._negN=(G._negN||0)+1}return true}
const pedName=(ks,id,fam)=>pedArr(ks).map(k=>k==="star"?"星空"+SUIT_FAM[fam!=null?fam:((G.pedF||{})[id]||0)].slice(0,1):PED[k].n).join("·");
// 伙伴卡外观：彩虹是整张卡变彩色
function pedDeco(el,ks,id,fam){if(!el)return;ks=pedArr(ks);PED_K.forEach(q=>el.classList.toggle("ped-"+q,ks.includes(q)));
 const ci=el.querySelector(".pcIn")||el;let rb=ci.querySelector(".pedRb");if(ks.includes("rb")&&!rb){rb=document.createElement("i");rb.className="pedRb";ci.appendChild(rb)}else if(!ks.includes("rb")&&rb)rb.remove();
 let t=ci.querySelector(".pedTag");if(!ks.length){if(t)t.remove();return}if(!t){t=document.createElement("i");t.className="pedTag";ci.appendChild(t)}t.textContent=pedName(ks,id,fam)}
{const _rp=renderPartners;renderPartners=function(){pedClean();const r=_rp.apply(this,arguments);try{const own=rbOwn(G);document.querySelectorAll("#partners .pCard").forEach(e=>{const id=G.partners[+e.dataset.i];const pc=e.querySelector(".pc");const ks=pedOf(id).slice();if(own.includes(id)&&!ks.includes("rb"))ks.push("rb");pedDeco(pc,ks,id)})}catch(e){console.warn(e)}return r}}
{const _pd=partnerDesc;partnerDesc=function(id){let d=_pd(id);try{const ks=pedOf(id).slice();const lend=rbOwn(G).includes(id)&&!ks.includes("rb");if(lend)ks.push("rb");ks.forEach(k=>{d+=`<br><span class="rbTxt">${PED[k].n}：${pedTxt(k,id)}${k==="rb"&&lend?"（沾光）":""}</span>`})}catch(e){}return d}}
// 每出一手：按伙伴从左到右，先加后乘
{const _eh=extraHand;extraHand=function(x,G){const out=_eh.apply(this,arguments)||[];try{pedMig();const cs=x.cards||[];const own=rbOwn(G);
 for(const id of G.partners){const ks=pedOf(id),N=PARTNERS[id]?PARTNERS[id].n:"伙伴";
  if(ks.includes("foil")){x.mult+=10;out.push(`闪光${N} +10 倍率`)}
  if(ks.includes("ink")){x.chips+=60;out.push(`水墨${N} +60 筹码`)}
  if(ks.includes("star")){const f=G.pedF[id]||0;if(cs.some(c=>famOf(c)===f)){x.mult+=30;out.push(`星空${N} +30 倍率`)}}}
 if(own.length){if(G.partners.includes("r_sf")){x.mult+=8*own.length;out.push(`彩虹信徒 +${8*own.length} 倍率`)}const m=rbX(G);own.forEach(id=>{x.mult=r1(x.mult*m);out.push(`彩虹${PARTNERS[id]?PARTNERS[id].n:"伙伴"} ×${m}`)})}}catch(e){console.warn(e)}return out}}
// 商店：伙伴格子偶尔带品质（每种品质分开抽，可能同时有好几种）
{const _p=ptP;ptP=id=>{const b=_p(id);try{const it=G&&G.shop&&G.shop.items.find(x=>x.k==="partner"&&x.id===id&&!x.sold);if(it&&pedArr(it.ped).length)return pedPrice(it.ped,b)}catch(e){}return b}}
{const _r=shopRender;shopRender=function(){try{(G.shop.items||[]).forEach((it,i)=>{if(it.k==="bath")G.shop.items[i]={k:"pack",id:"card",p:4,n:4};
  if(it.k!=="partner")return;if(it.rb&&!it.ped)it.ped=["rb"];delete it.rb;if(it.rbFor!==it.id){it.rbFor=it.id;it.ped=pedRoll();it.pedF=Math.floor(rnd()*4)}it.ped=pedArr(it.ped)})}catch(e){}
 const r=_r.apply(this,arguments);
 try{const row=$("#shop .shRow");if(row)G.shop.items.forEach((it,i)=>{if(it.k!=="partner"||it.sold||!pedArr(it.ped).length)return;const el=row.children[i];if(!el)return;el.classList.add("rbItem");
  pedDeco(el.querySelector(".pc"),it.ped,it.id,it.pedF);
  const d=el.querySelector("p");if(d&&!d.querySelector(".rbTxt"))d.insertAdjacentHTML("beforeend",`<br><span class="rbTxt sh">${it.ped.length===1?pedShort(it.ped[0],it.pedF):pedName(it.ped,it.id,it.pedF)+"（点开看）"}</span>`);
  const p=el.querySelector(".price");if(p)p.textContent=ptP(it.id)})}catch(e){console.warn(e)}return r}}
// 负色伙伴：伙伴位满了也能买
const itNeg=it=>it&&it.k==="partner"&&pedArr(it.ped).includes("neg");
{const _a=shopAsk;shopAsk=function(i){const it=G.shop.items[i];let r;if(itNeg(it)){G.pmax=(G.pmax||5)+1;try{r=_a.apply(this,arguments)}finally{G.pmax--}}else r=_a.apply(this,arguments);
 try{const ks=it&&it.k==="partner"?pedArr(it.ped):[];const d=document.querySelector(".askBox .askD");if(ks.length&&d)d.insertAdjacentHTML("beforeend",ks.map(k=>`<br><span class="rbTxt">${PED[k].n}：${pedTxt(k,it.id,it.pedF)}</span>`).join(""))}catch(e){}return r}}
{const _b=shopBuy;shopBuy=async function(i){const it=G.shop.items[i];const pt=it&&it.k==="partner"&&!it.sold,ks=pt?pedArr(it.ped):[],id=it&&it.id,neg=ks.includes("neg");
 if(neg)G.pmax=(G.pmax||5)+1;const r=await _b.apply(this,arguments);if(neg)G.pmax--;
 try{if(pt&&it.sold&&G.partners.includes(id)){pedMig();delete G.ped[id];ks.forEach(k=>pedGive(id,k,it.pedF));if(ks.length){SFX.shine();toast(`<b>${pedName(ks,id)}${PARTNERS[id].n}</b> 加入了！`)}renderPartners()}}catch(e){console.warn(e)}return r}}
const pedShort=(k,f)=>({foil:"闪光 倍率+10",ink:"水墨 筹码+60",star:`星空 出${SUIT_FAM[f||0].slice(0,1)}牌倍率+30`,neg:"负色 不占位",rb:`彩虹 倍率×${G?rbX(G):1.5}`})[k];
const pedCand=k=>G.partners.filter(id=>!pedHas(id,k));
// 秘宝「彩虹颜料」：只在秘宝里出（秘宝卡包、商店偶尔的秘宝）
MB.rbpaint={n:"彩虹颜料",d:"随机把一个伙伴染成彩虹（原来的品质还在，可以叠加）",any:1,ok:()=>pedCand("rb").length>0,use:()=>{const id=pick(pedCand("rb"));pedGive(id,"rb");try{renderPartners()}catch(e){}return`${PARTNERS[id].n} 变成彩虹了`}};
// 首领进贡：偶尔多一个"给伙伴上品质"的选项
{const _t=tribute;tribute=function(k){return new Promise(res=>{_t(k).then(res);try{if(!G||!G.partners.length)return;const r=rnd();const q=r<.06?"rb":r<.36?"foil":null;if(!q)return;const c=pedCand(q);if(!c.length)return;const id=pick(c);
 const box=document.querySelector(".tribBox");const sk=$("#trSkip");if(!box||!sk)return;sk.insertAdjacentHTML("beforebegin",`<button class="btn ${q==="rb"?"rbBtn":"gold"}" id="trPed">不要牌，让 ${PARTNERS[id].n} ${q==="rb"?"染成彩虹":"镀上闪光"}</button>`);
 $("#trPed").onclick=()=>{pedGive(id,q);SFX.shine();closeOv();try{renderPartners()}catch(e){}toast(`<b>${PARTNERS[id].n}</b> ${q==="rb"?"变成彩虹了":"镀上了闪光"}`);res(null)}}catch(e){console.warn(e)}})}}
// 路上事件：彩虹泉
EVENTS.push({id:"rbspring",img:"u_qh",n:"彩虹泉",t:"山脚下有一眼泉水，水面上浮着一层七彩的光。",o:[
 {t:"往泉里扔 12 金币",d:"随机一个伙伴镀上闪光（每出一手 倍率 +10）",ok:G=>G.gold>=12&&pedCand("foil").length>0,f:G=>{G.gold-=12;const id=pick(pedCand("foil"));pedGive(id,"foil");return`${PARTNERS[id].n} 在泉水里扑腾了两下，出来的时候亮闪闪的。`}},
 {t:"把一个伙伴留在泉边",d:"随机丢掉一个伙伴，另一个随机伙伴染成彩虹",ok:G=>G.partners.length>=2,f:G=>{const out=pick(G.partners);G.partners=G.partners.filter(x=>x!==out);pedClean();const c=pedCand("rb");if(!c.length)return`${PARTNERS[out].n} 留下了，泉水没什么反应。`;const id=pick(c);pedGive(id,"rb");return`${PARTNERS[out].n} 坐在泉边不走了。${PARTNERS[id].n} 回头看了它一眼，整只都变成了彩虹色。`}},
 {t:"喝口水就走",d:"什么也不发生",f:()=>"水是甜的，没别的了。"}]});
// 2.2 第一版的彩虹奶马太强，下架；存档里有它的，换成 4 金币
{const _l=loadRun;loadRun=function(){const r=_l.apply(this,arguments);try{if(G&&G.partners){const n=G.partners.length;G.partners=G.partners.filter(id=>PARTNERS[id]);if(G.partners.length<n)G.gold+=4*(n-G.partners.length);pedMig()}}catch(e){}return r}}

/* ---------- 彩虹流：5 个伙伴 + 套装 ---------- */
Object.assign(PARTNERS,{
 r_lg:{t:"彩虹",n:"寻彩奶蛙",img:"u_lg",r:"C",p:5,d:"商店里刷出带品质伙伴（闪光、水墨、星空、负色、彩虹）的几率翻倍"},
 r_sf:{t:"彩虹",n:"彩虹信徒",img:"u_sf",r:"R",p:6,d:"每有 1 个彩虹伙伴，倍率 +8"},
 r_by:{t:"彩虹",n:"富贵奶狗",img:"u_by",r:"C",p:5,d:"带品质的伙伴便宜 3 金币"},
 r_qc:{t:"彩虹",n:"七彩奶鸡",img:"u_qc",r:"E",p:9,d:"彩虹伙伴的 ×1.5 变成 ×1.75"},
 r_tx:{t:"彩虹",n:"沾光奶蛙",img:"u_tx",r:"R",p:6,d:"它左边挨着的那个伙伴也算彩虹（可以拖动调位置）"}});
SETS_OFF["彩虹"]={d:"彩虹伙伴的 ×1.5 再 +0.5"};

/* ---------- 2.2 后期首领更难 ---------- */
// 第 7 站起首领再大加：第 7 站 +50%，一路加到最后一站 +150%（在上面逐站 7% 的基础上）
const BOSS_LATE=[1.5,1.6,1.7,1.8,1.95,2.15,2.5];
{const _tg=targetOf;targetOf=function(lv,b){const t=_tg(lv,b);if(b!==2||lv<6||(G&&G.endless&&(G.loop||1)>1))return t;return Math.round(t*(1+.07*(lv-5))*(BOSS_LATE[lv-6]||2.5)/10)*10}}
try{FU_G.rbpaint="彩";FU_ICON.rbpaint='<path d="M8 46a24 24 0 0 1 48 0" fill="none" stroke="#ff5ad2" stroke-width="5"/><path d="M14 46a18 18 0 0 1 36 0" fill="none" stroke="#ffd23f" stroke-width="5"/><path d="M20 46a12 12 0 0 1 24 0" fill="none" stroke="#5aff8a" stroke-width="5"/><path d="M26 46a6 6 0 0 1 12 0" fill="none" stroke="#3fd0ff" stroke-width="5"/>'}catch(e){}
