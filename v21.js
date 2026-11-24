/* ===================== 奶蛙牌 2.1 · 牌会长大 / 流畅模式 ===================== */

/* ---------- 1. 画质：流畅（手机默认）/ 高清 ---------- */
const LITE_DEF=(()=>{try{return matchMedia("(pointer:coarse)").matches||("ontouchstart" in window)}catch(e){return false}})();
const liteOn=()=>SET.lite===undefined?LITE_DEF:!!SET.lite;
function liteApply(){try{document.body.classList.toggle("lite",liteOn());BGFX.lite=liteOn()}catch(e){}}
{const _a=applySet;applySet=function(){const r=_a.apply(this,arguments);liteApply();return r}}
{const _h=settingsHTML;settingsHTML=function(){const L=liteOn();return _h().replace(/<\/div>$/,`<div class="setRow"><span>画质</span><button class="btn sm ${L?"gold":"dark"}" id="stLite1">流畅</button><button class="btn sm ${L?"dark":"gold"}" id="stLite0">高清</button></div></div>`)}}
{const _b=bindSettings;bindSettings=function(redraw){_b(redraw);const s=(v)=>()=>{SET.lite=v;applySet();SFX.click();redraw()};const a=$("#stLite1"),b=$("#stLite0");if(a)a.onclick=s(true);if(b)b.onclick=s(false)}}
if(document.body)liteApply();else addEventListener("DOMContentLoaded",liteApply);

/* ---------- 2. 牌会长大：同一张牌打出计分 4 次变闪光，10 次变彩虹 ---------- */
const upNeed=()=>G&&G.partners.includes("u_lg")?[3,9]:[4,10];
function polyX(G){return G&&setOn(G,"升级")?2:1.5}
function xpFrac(c){if(!c||c.ed==="poly")return -1;const [a,b]=upNeed(),x=c.xp||0;if(!x)return -1;return c.ed==="foil"||c.ed==="gold"?Math.max(0,Math.min(1,(x-a)/(b-a))):Math.min(1,x/a)}
function xpPaint(el,c){if(!el)return;const f=xpFrac(c);let e=el.querySelector(".cXp");if(f<0){if(e)e.remove();return}
 if(!e){const ci=el.querySelector(".cIn");if(!ci)return;e=document.createElement("i");e.className="cXp";ci.appendChild(e)}e.style.setProperty("--p",f.toFixed(3));e.classList.toggle("t2",c.ed==="foil"||c.ed==="gold")}
async function cardXP(c,el,x,n){if(!G||!c||c.s===undefined||c.ed==="poly")return null;
 n=n||(1+(x&&x.first&&G.partners.includes("u_sf")?1:0));c.xp=(c.xp||0)+n;const [a,b]=upNeed();let up=null;
 if(c.xp>=b){c.ed="poly";up="poly"}else if(c.xp>=a&&!c.ed){c.ed="foil";up="foil"}
 xpPaint(el,c);
 if(up){G.ups=(G.ups||0)+1;if(up==="poly")G.rainbows=(G.rainbows||0)+1;
  if(el){el.classList.remove("ed-foil","ed-gold","lvUp");void el.offsetWidth;el.classList.add("ed-"+up,"lvUp");popOn(el,up==="poly"?"变成彩虹牌了！":"升级：闪光牌","xm")}
  try{SFX.shine()}catch(e){}
  if(up==="poly"&&G.partners.includes("u_by")){G.gold+=4;try{partnerPulse("u_by","+4 金币");renderSide2()}catch(e){}}
  if(el)await sleep(380)}
 return up}
// 牌面右下角一圈小进度
{const _c=cardHTML;cardHTML=function(c,opt={}){let h=_c(c,opt);try{if(c&&!(c.hid&&opt.inHand)&&c.s!==undefined){const f=xpFrac(c);if(f>=0)h=h.replace('<i class="cFoil">',`<i class="cXp ${c.ed==="foil"||c.ed==="gold"?"t2":""}" style="--p:${f.toFixed(3)}"></i><i class="cFoil">`)}}catch(e){}return h}}
// 长按说明里写上进度
{const _ci=cardInfoHTML;cardInfoHTML=function(c){let h=_ci(c);try{if(c&&c.s!==undefined&&c.s<5){const [a,b]=upNeed(),x=c.xp||0;
 const t=c.ed==="poly"?`已经是彩虹牌了，打出时 倍率 ×${polyX(G)}。`:c.ed==="foil"||c.ed==="gold"?`再打出计分 ${Math.max(1,b-x)} 次变成彩虹牌（倍率 ×1.5）。`:`打出计分 ${Math.max(1,a-x)} 次变成闪光牌，${Math.max(1,b-x)} 次变成彩虹牌。`;
 h+=`<p class="ciTag up">长大</p><p>${t}</p>`}}catch(e){}return h}}
// 偷学奶蛙：弃掉的牌也长进度
{const _d=discardSel;discardSel=async function(){const cs=G&&G.partners.includes("u_tx")?selCards():[];const r=await _d.apply(this,arguments);
 if(cs.length){let k=0;for(const c of cs){if(await cardXP(c,null,null,1))k++}if(k)toast(`偷学奶蛙：${k} 张弃掉的牌升级了`)}return r}}
EDS.foil.d="计分时 筹码 +30（同一张牌打出 4 次就会变成闪光牌）";
EDS.poly.d="计分时 倍率 ×1.5（同一张牌打出 10 次就会变成彩虹牌）";EDS.poly.n="彩虹牌";EDS.foil.n="闪光牌";

/* ---------- 3. 升级流：6 个伙伴 + 套装 ---------- */
Object.assign(PARTNERS,{
 u_lg:{t:"升级",n:"练功奶蛙",img:"u_lg",r:"C",p:5,d:"牌长得更快：3 次变闪光，9 次变彩虹"},
 u_sf:{t:"升级",n:"老师父",img:"u_sf",r:"R",p:6,d:"每关第一手：打出的牌每张多长 1 次"},
 u_qh:{t:"升级",n:"彩虹奶马",img:"u_qh",r:"R",p:6,d:"手里每留着 1 张彩虹牌，倍率 +6",held:(x,c)=>{if(c.ed==="poly"){x.mult+=6;return"+6 倍率"}}},
 u_by:{t:"升级",n:"毕业奶狗",img:"u_by",r:"C",p:5,d:"每有一张牌长成彩虹牌，+4 金币"},
 u_qc:{t:"升级",n:"七彩奶鸡",img:"u_qc",r:"E",p:8,d:"每张彩虹牌计分时，倍率再 ×1.2",card:(x,c)=>{if(c.ed==="poly"){x.mult=r1(x.mult*1.2);return"×1.2 倍率"}}},
 u_tx:{t:"升级",n:"偷学奶蛙",img:"u_tx",r:"C",p:4,d:"弃掉的牌也算长 1 次"}});
SETS_OFF["升级"]={d:"彩虹牌的 ×1.5 变成 ×2"};

/* ---------- 4. 商店：奶蛙澡堂（花钱把一张牌泡升一档） ---------- */
{const _o=shopOpen;shopOpen=function(){const r=_o.apply(this,arguments);try{const its=G.shop.items;let j=-1;its.forEach((it,i)=>{if(/pack/.test(it.k))j=i});
 if(j>=0&&!its.some(it=>it.k==="bath")){its[j]={k:"bath",p:4+Math.floor(G.lvIdx/4)};shopRender()}}catch(e){console.warn(e)}return r}}
{const _r=shopRender;shopRender=function(){const r=_r.apply(this,arguments);try{const row=$("#shop .shRow");if(row)G.shop.items.forEach((it,i)=>{if(it.k!=="bath"||it.sold)return;const el=row.children[i];if(!el)return;
 el.className="shItem bath";el.innerHTML=`<span class="kind">澡堂</span><div class="bathArt"><i></i><i></i><i></i><b></b></div><b>奶蛙澡堂</b><p>挑 1 张牌泡一泡<br>直接长一档：普通 → 闪光 → 彩虹</p><div class="price">${packP(it)}</div>`})}catch(e){console.warn(e)}return r}}
{const _b=shopBuy;shopBuy=async function(i){const it=G.shop.items[i];if(!it||it.k!=="bath")return _b.apply(this,arguments);if(it.sold)return;
 const price=packP(it);if(G.gold<price){toast("金币不够");SFX.bad();return}bathPick(it,price)}}
function bathPick(it,price){const lv=lvNow();const cs=G.deck.filter(c=>c.s!==undefined&&c.ed!=="poly").sort((a,b)=>(b.xp||0)-(a.xp||0)||a.s-b.s||power(b.r,lv)-power(a.r,lv));
 if(!cs.length){toast("牌组里的牌都已经是彩虹牌了");return}
 ov(`<div class="box bathBox"><h2>奶蛙澡堂</h2><p class="bathSub">挑一张牌泡一泡（${price} 金币）。长得快的排在前面。</p><div class="bathGrid">${cs.map(c=>`<div class="bathC" data-id="${c.id}">${cardHTML(c)}</div>`).join("")}</div><div class="askBtns"><button class="btn dark" id="bathNo">算了</button></div></div>`);
 $("#bathNo").onclick=()=>{SFX.click();closeOv()};
 $$(".bathC").forEach(e=>e.onclick=()=>{const c=cs.find(q=>String(q.id)===e.dataset.id);if(!c||G.gold<price)return;G.gold-=price;it.sold=1;const [a,b]=upNeed();
  if(c.ed==="foil"||c.ed==="gold"){c.ed="poly";c.xp=Math.max(c.xp||0,b);G.rainbows=(G.rainbows||0)+1;if(G.partners.includes("u_by"))G.gold+=4}else{c.ed="foil";c.xp=Math.max(c.xp||0,a)}
  G.ups=(G.ups||0)+1;SFX.shine();closeOv();shopRender();toast(`<b>${c.s===4?(c.r===17?"大王":"小王"):(SUITS[c.s]||"")+" "+rankName(c.r)}</b> 泡成了${c.ed==="poly"?"彩虹牌":"闪光牌"}`)})}

