/* ===================== 奶蛙牌 · 牌的增强、印、符咒、秘宝 ===================== */

/* ---------- 牌的增强（一张牌最多一个） ---------- */
const ENH={
 glass:{n:"玻璃牌",g:"玻",d:"计分时 倍率 ×2；出完有 1/4 几率碎掉"},
 steel:{n:"钢牌",g:"钢",d:"留在手里时 倍率 ×1.5"},
 twin:{n:"双生牌",g:"双",d:"凑牌型时这一张算两张（一张 K 加一张双生 K 就是三张）"},
 cham:{n:"变色牌",g:"变",d:"算作任何花色：凑同花顺不拦路，进奶蛙池跟谁都能凑"},
 lucky:{n:"幸运牌",g:"运",d:"计分时 1/5 几率 倍率 +20，1/15 几率 +20 金币"},
 ice:{n:"冰心牌",g:"冰",d:"每在手里多留一手，打出时筹码 +15（留得越久越值钱）"}};
/* ---------- 印（一张牌最多一个） ---------- */
Object.assign(SEALS,{
 coin:{n:"金币印",g:"金",d:"打出时 +3 金币"},
 echo:{n:"回响印",g:"回",d:"这张牌计分两次"},
 press:{n:"压印",g:"压",d:"这一手压住对手时，倍率 +10"},
 guard:{n:"守护印",g:"守",d:"不会被冻住、糊泥、抗贡、烧掉，玻璃也不会碎"},
 summon:{n:"召唤印",g:"召",d:"弃掉这张牌时，送你一张符咒"}});
SEALS.frog.g="蛙";
const SEAL_KEYS=Object.keys(SEALS),ENH_KEYS=Object.keys(ENH);

/* ---------- 符咒（相当于小丑牌的塔罗牌）：大多要先在手牌里选牌再用 ---------- */
const SUIT_N=["黑桃","红桃","梅花","方块"];
const FU={
 tear:{n:"撕牌符",need:[1,2],d:"删掉选中的最多 2 张牌（永久移出牌组）",use:cs=>{cs.forEach(c=>{G.deck=G.deck.filter(x=>x!==c);G.hand=G.hand.filter(x=>x!==c)});return`删掉了 ${cs.length} 张牌`}},
 s0:{n:"黑桃符",need:[1,3],d:"选中的最多 3 张变成黑桃 ♠",use:cs=>{cs.forEach(c=>{if(c.s<4)c.s=0});return"变成了黑桃"}},
 s1:{n:"红桃符",need:[1,3],d:"选中的最多 3 张变成红桃 ♥",use:cs=>{cs.forEach(c=>{if(c.s<4)c.s=1});return"变成了红桃"}},
 s2:{n:"梅花符",need:[1,3],d:"选中的最多 3 张变成梅花 ♣",use:cs=>{cs.forEach(c=>{if(c.s<4)c.s=2});return"变成了梅花"}},
 s3:{n:"方块符",need:[1,3],d:"选中的最多 3 张变成方块 ♦",use:cs=>{cs.forEach(c=>{if(c.s<4)c.s=3});return"变成了方块"}},
 copy:{n:"复印符",need:[1,1],d:"复制选中的 1 张牌（连品质、增强、印一起），放进牌组和手里",use:cs=>{const c={...cs[0],id:1e6+Math.floor(rnd()*1e9)};G.deck.push(c);G.hand.push(c);return"复制了一张"}},
 wild:{n:"万能符",need:[1,1],d:"选中的 1 张永久变成逢人配",use:cs=>{cs[0].wild=1;return"变成了逢人配"}},
 up:{n:"升点符",need:[1,2],d:"选中的最多 2 张点数 +1（A 变成 2）",use:cs=>{cs.forEach(c=>{if(c.s<4)c.r=c.r>=14?2:c.r+1});return"点数 +1"}},
 same:{n:"照影符",need:[2,2],d:"选 2 张：右边那张变成左边那张的点数（凑炸弹好帮手）",use:cs=>{cs.sort((a,b)=>G.hand.indexOf(a)-G.hand.indexOf(b));if(cs[1].s<4&&cs[0].s<4)cs[1].r=cs[0].r;return"点数变得一样了"}},
 glass:{n:"琉璃符",need:[1,1],d:"选中的 1 张变成玻璃牌（倍率 ×2，可能会碎）",use:cs=>{cs[0].en="glass";return"变成了玻璃牌"}},
 steel:{n:"铁甲符",need:[1,2],d:"选中的最多 2 张变成钢牌（留在手里 倍率 ×1.5）",use:cs=>{cs.forEach(c=>c.en="steel");return"变成了钢牌"}},
 twin:{n:"双生符",need:[1,1],d:"选中的 1 张变成双生牌（凑牌型时算两张）",use:cs=>{cs[0].en="twin";return"变成了双生牌"}},
 cham:{n:"变色符",need:[1,2],d:"选中的最多 2 张变成变色牌（算作任何花色）",use:cs=>{cs.forEach(c=>c.en="cham");return"变成了变色牌"}},
 lucky:{n:"幸运符",need:[1,2],d:"选中的最多 2 张变成幸运牌",use:cs=>{cs.forEach(c=>c.en="lucky");return"变成了幸运牌"}},
 ice:{n:"冰心符",need:[1,1],d:"选中的 1 张变成冰心牌（留得越久越值钱）",use:cs=>{cs[0].en="ice";cs[0].age=0;return"变成了冰心牌"}},
 seal:{n:"盖印符",need:[1,1],d:"给选中的 1 张盖一个随机的印",use:cs=>{const k=["coin","echo","press","guard","summon","frog"][Math.floor(rnd()*6)];cs[0].seal=k;return`盖上了${SEALS[k].n}`}},
 ed:{n:"镀光符",need:[1,1],d:"选中的 1 张随机变成闪卡、金卡或彩卡",use:cs=>{const q=rnd();cs[0].ed=q<.5?"foil":q<.8?"gold":"poly";return`变成了${EDS[cs[0].ed].n}`}},
 money:{n:"财神符",need:[0,0],d:"金币翻倍（最多 +20）",any:1,use:()=>{const v=Math.min(20,G.gold);G.gold+=v;return`+${v} 金币`}},
 tea:{n:"茶道符",need:[0,0],d:"上一次出的牌型升 1 级（没出过就升对子）",any:1,use:()=>{const t=teaKey(G.lastType||G.lastTea||"pair");G.hl[t]=(G.hl[t]||0)+1;return`${t==="bomb"?"炸弹":HANDS[t].n} 升级了`}},
 friend:{n:"招友符",need:[0,0],d:"随机得到一个普通伙伴（要有空位）",any:1,ok:()=>G.partners.length<(G.pmax||5),use:()=>{const p=Object.keys(PARTNERS).filter(k=>PARTNERS[k].r==="C"&&!G.partners.includes(k)&&isUnlocked(k));const k=p[Math.floor(rnd()*p.length)];G.partners.push(k);return`${PARTNERS[k].n} 加入了`}},
 more:{n:"续命符",need:[0,0],d:"这一关出牌 +1（只能在打牌时用）",play:1,use:()=>{G.handsLeft++;return"出牌 +1"}},
 redraw:{n:"洗牌符",need:[0,0],d:"把整手牌换掉重新抓，不花弃牌次数（只能在打牌时用）",play:1,use:()=>{const keep=G.hand.filter(c=>c.frz||c.mud);G.hand.filter(c=>!keep.includes(c)).forEach(c=>G.draw.unshift(c));G.hand=keep;G.newIds=new Set();drawTo();return"换了一手新牌"}}};
/* ---------- 秘宝（相当于幽灵牌）：很强，但都有代价 ---------- */
const MB={
 mirror:{n:"魔镜",d:"复制一个随机伙伴（要有空位），但金币清零",any:1,ok:()=>G.partners.length&&G.partners.length<(G.pmax||5),use:()=>{const k=G.partners[Math.floor(rnd()*G.partners.length)];G.partners.push(k);G.gold=0;return`复制了 ${PARTNERS[k].n}`}},
 hole:{n:"黑洞",d:"所有牌型都升 1 级",any:1,use:()=>{Object.keys(TEA).forEach(t=>G.hl[t]=(G.hl[t]||0)+1);return"所有牌型升级了"}},
 alch:{n:"炼金炉",need:[1,1],d:"选 1 张：复制 2 张一样的，但随机删掉手里另外 1 张",use:cs=>{for(let i=0;i<2;i++){const c={...cs[0],id:1e6+Math.floor(rnd()*1e9)};G.deck.push(c);G.hand.push(c)}const o=G.hand.filter(c=>c!==cs[0]&&c.id!==cs[0].id&&!G.hand.slice(-2).includes(c));if(o.length){const d=o[Math.floor(rnd()*o.length)];G.deck=G.deck.filter(x=>x!==d);G.hand=G.hand.filter(x=>x!==d)}return"复制了 2 张"}},
 soul:{n:"灵魂",d:"随机得到一个传说伙伴，但手牌上限 -1",any:1,ok:()=>G.partners.length<(G.pmax||5),use:()=>{const p=Object.keys(PARTNERS).filter(k=>PARTNERS[k].r==="L"&&!G.partners.includes(k));const k=p[Math.floor(rnd()*p.length)];G.partners.push(k);G.handSize=Math.max(6,G.handSize-1);return`${PARTNERS[k].n} 来了`}},
 ruin:{n:"毁灭",d:"随机删掉牌组里 6 张牌，+15 金币",any:1,use:()=>{for(let i=0;i<6;i++){const c=G.deck[Math.floor(rnd()*G.deck.length)];G.deck=G.deck.filter(x=>x!==c);G.hand=G.hand.filter(x=>x!==c)}G.gold+=15;return"牌组少了 6 张，+15 金币"}},
 midas:{n:"点金手",need:[1,1],d:"选 1 张变成金卡，并盖上金币印",use:cs=>{cs[0].ed="gold";cs[0].seal="coin";return"变成了金卡"}},
 void:{n:"无相",need:[1,1],d:"选 1 张：变成逢人配，也变成双生牌",use:cs=>{cs[0].wild=1;cs[0].en="twin";return"它什么都能当了"}},
 throne:{n:"王座",d:"出牌永久 +1，弃牌永久 -1",any:1,use:()=>{G.handsMax++;G.discMax=Math.max(0,G.discMax-1);return"出牌 +1，弃牌 -1"}},
 pact:{n:"盟约",d:"伙伴上限永久 +1，但金币清零",any:1,use:()=>{G.pmax=(G.pmax||5)+1;G.gold=0;return"伙伴上限 +1"}},
 suitall:{n:"星门",need:[1,1],d:"选 1 张：牌组里和它同点数的牌，全部变成它的花色",use:cs=>{const t=cs[0];G.deck.forEach(c=>{if(c.r===t.r&&c.s<4)c.s=t.s});return`所有 ${rankName(t.r)} 都变成了${SUIT_N[t.s]}`}}};
const consDef=k=>FU[k]||MB[k];
const CONS_MAX=2;

/* ---------- 符咒栏 ---------- */
function consInit(){if(!$("#cons")){const d=document.createElement("div");d.id="cons";$("#stage").appendChild(d)}}
/* 封面图标（64×64，用当前颜色画） */
const CARDP=(x,y,r=0)=>`<rect x="${x}" y="${y}" width="22" height="30" rx="3" transform="rotate(${r} ${x+11} ${y+15})"/>`;
const FU_ICON={
 tear:`<path d="M18 10h28v20l-4 4 4 4-4 4 4 4v8H18v-8l4-4-4-4 4-4-4-4z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M10 30 L22 34 M54 30 L42 34" stroke="currentColor" stroke-width="3"/>`,
 copy:`<g fill="none" stroke="currentColor" stroke-width="5">${CARDP(14,12)}${CARDP(28,22)}</g><path d="M39 33v8M35 37h8" stroke="currentColor" stroke-width="3"/>`,
 wild:`<g fill="none" stroke="currentColor" stroke-width="5">${CARDP(21,14)}</g><path d="M32 20l3 7 7 .6-5.4 4.6 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.6 7-.6z"/>`,
 up:`<g fill="none" stroke="currentColor" stroke-width="5">${CARDP(21,18)}</g><path d="M32 6l10 11h-6v12h-8V17h-6z"/>`,
 same:`<g fill="none" stroke="currentColor" stroke-width="5">${CARDP(6,18)}${CARDP(36,18)}</g><path d="M28 31h8M33 27l4 4-4 4" fill="none" stroke="currentColor" stroke-width="3"/><text x="17" y="38" font-size="12" text-anchor="middle" fill="currentColor">7</text><text x="47" y="38" font-size="12" text-anchor="middle" fill="currentColor">7</text>`,
 glass:`<path d="M32 6l16 14-16 38-16-38z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M16 20h32M26 20l6 38 6-38M32 6l-6 14M32 6l6 14" fill="none" stroke="currentColor" stroke-width="2"/>`,
 steel:`<path d="M32 6l20 7v16c0 14-9 23-20 29-11-6-20-15-20-29V13z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M24 26h16M24 34h16" stroke="currentColor" stroke-width="3"/>`,
 twin:`<g fill="none" stroke="currentColor" stroke-width="5">${CARDP(14,16,-10)}${CARDP(28,16,10)}</g>`,
 cham:`<path d="M32 6C26 18 16 26 16 38a16 16 0 0032 0C48 26 38 18 32 6z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M24 38a8 8 0 0016 0" fill="none" stroke="currentColor" stroke-width="3"/>`,
 lucky:`<g><circle cx="24" cy="22" r="9"/><circle cx="40" cy="22" r="9"/><circle cx="24" cy="36" r="9"/><circle cx="40" cy="36" r="9"/></g><path d="M32 30c4 10 8 18 14 24" fill="none" stroke="currentColor" stroke-width="4"/>`,
 ice:`<g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 6v52M9.5 19l45 26M9.5 45l45-26"/><path d="M26 10l6 6 6-6M26 54l6-6 6 6" fill="none" stroke-width="3"/></g>`,
 seal:`<circle cx="32" cy="36" r="19" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="36" r="8"/><path d="M32 4v13" stroke="currentColor" stroke-width="6"/>`,
 ed:`<path d="M32 4l6 20 20 8-20 8-6 20-6-20-20-8 20-8z"/><circle cx="50" cy="12" r="4"/><circle cx="14" cy="52" r="3"/>`,
 money:`<circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="5"/><rect x="25" y="25" width="14" height="14" fill="none" stroke="currentColor" stroke-width="4"/>`,
 more:`<path d="M32 54C14 40 8 32 8 22a12 12 0 0124-4 12 12 0 0124 4c0 10-6 18-24 32z" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 22v16M24 30h16" stroke="currentColor" stroke-width="4"/>`,
 redraw:`<path d="M50 26A19 19 0 0016 22M14 38a19 19 0 0034 4" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M8 14l8 9 9-6M56 50l-8-9-9 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>`,
 mirror:`<ellipse cx="32" cy="24" rx="15" ry="18" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 42v16M24 58h16" stroke="currentColor" stroke-width="5"/><path d="M25 16c3-4 7-5 10-5" fill="none" stroke="currentColor" stroke-width="3"/>`,
 hole:`<path d="M32 32m-4 0a4 4 0 108 0 8 8 0 10-16 0 12 12 0 1024 0 16 16 0 10-32 0 20 20 0 1040 0" fill="none" stroke="currentColor" stroke-width="3.5"/>`,
 alch:`<path d="M26 6h12M28 6v16L14 50a4 4 0 004 6h28a4 4 0 004-6L36 22V6" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M19 42h26l3 8H16z"/>`,
 soul:`<path d="M32 4c4 10 14 14 14 28a14 14 0 01-28 0c0-8 4-12 6-16 2 6 4 8 6 8-2-8 0-14 2-20z"/>`,
 ruin:`<path d="M32 8a20 20 0 00-20 20c0 8 4 12 8 14v10h24V42c4-2 8-6 8-14A20 20 0 0032 8z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="24" cy="28" r="5"/><circle cx="40" cy="28" r="5"/><path d="M32 8l-4 10 6 6-4 8" fill="none" stroke="currentColor" stroke-width="3"/>`,
 midas:`<path d="M8 50l6-14h14l6 14zM30 50l6-14h14l6 14zM19 34l6-14h14l6 14z"/>`,
 void:`<path d="M4 32c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18S12 44 4 32z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="9"/>`,
 throne:`<path d="M8 22l12 10 12-18 12 18 12-10-6 26H14z"/><rect x="14" y="52" width="36" height="6" rx="2"/>`,
 pact:`<g fill="none" stroke="currentColor" stroke-width="5"><circle cx="24" cy="32" r="13"/><circle cx="40" cy="32" r="13"/></g>`,
 tea:`<path d="M12 24h36v10a18 18 0 01-36 0z"/><path d="M48 28h4a6 6 0 010 12h-6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M22 8c-3 4 3 6 0 11M32 6c-3 4 3 7 0 12M42 8c-3 4 3 6 0 11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="10" y="54" width="40" height="4" rx="2"/>`,
 friend:`<circle cx="22" cy="20" r="8"/><path d="M8 50a14 14 0 0128 0z"/><circle cx="44" cy="22" r="7"/><path d="M33 52a11 11 0 0122 0z"/><path d="M50 6v10M45 11h10" stroke="currentColor" stroke-width="3.5"/>`,
 suitall:`<path d="M32 4l7 18 19 1-15 12 5 19-16-11-16 11 5-19L6 23l19-1z"/>`};
/* 封面：符咒是黄符纸 + 红色朱砂字，每张一个字；改花色的符直接画花色；秘宝是星空里发光的法阵 */
const FU_G={tear:"撕",s0:"♠",s1:"♥",s2:"♣",s3:"♦",copy:"复",wild:"万",up:"升",same:"影",glass:"琉",steel:"铁",twin:"双",cham:"变",lucky:"运",ice:"冰",seal:"印",ed:"光",money:"财",tea:"茶",friend:"友",more:"续",redraw:"洗",
 mirror:"镜",hole:"洞",alch:"炼",soul:"魂",ruin:"灭",midas:"金",void:"无",throne:"座",pact:"盟",suitall:"星"};
const FU_CAT=k=>/^s\d$/.test(k)?"suit":["money","tea","friend","more","redraw"].includes(k)?"gold":["glass","steel","twin","cham","lucky","ice","seal","ed"].includes(k)?"enh":"red";
function consHTML(k,cls=""){const D=consDef(k);const mb=!!MB[k];const g=FU_G[k]||"符";
 if(mb)return`<div class="fu mb ${cls}"><div class="fuIn"><i class="mbStars"></i><i class="mbRing"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="34"/><path d="M50 8 L87 71 L13 71 Z M50 92 L13 29 L87 29 Z"/></svg></i><i class="mbG">${FU_ICON[k]?`<svg viewBox="0 0 64 64">${FU_ICON[k]}</svg>`:g}</i><b>${D.n}</b><i class="cGlare"></i></div></div>`;
 const suit=/^s\d$/.test(k)?+k[1]:-1;
 return`<div class="fu tal t-${FU_CAT(k)} ${cls}"><div class="fuIn"><i class="talTop"></i><i class="talG ${suit>=0?"su":""}">${suit>=0?`<svg class="sv" viewBox="0 0 100 100" style="fill:${suit===1||suit===3?"#c8141e":"#1d1418"}"><use href="#su${suit}"/></svg>`:FU_ICON[k]?`<svg class="ic" viewBox="4 4 56 56">${FU_ICON[k]}</svg>`:g}</i><i class="talLines"></i><b>${D.n}</b><i class="cGlare"></i></div></div>`}
function renderCons(){consInit();const el=$("#cons");const show_=G&&($("#play.on")||$("#shop.on"));el.style.display=show_?"flex":"none";if(!show_)return;el.classList.toggle("inShop",!!$("#shop.on"));const C=G.cons||[];
 el.innerHTML=[0,1].map(i=>C[i]?`<div class="consSlot has" data-i="${i}">${consHTML(C[i])}</div>`:`<div class="consSlot"></div>`).join("")+`<span class="consCnt">符咒 ${C.length}/${CONS_MAX}</span>`;
 $$("#cons .consSlot.has").forEach(e=>{e.onclick=()=>consTip(+e.dataset.i,e);tiltOn(e.querySelector(".fu"))})}
function consCanUse(k){const D=consDef(k);const inPlay=!!$("#play.on")&&!G.busy;if(D.play&&!inPlay)return[false,"打牌时才能用"];if(D.ok&&!D.ok())return[false,"现在用不了"];
 const nd=D.need||[0,0];if(nd[1]>0){if(!inPlay)return[false,"打牌时选好手牌再用"];const n=selCards().length;if(n<nd[0]||n>nd[1])return[false,nd[0]===nd[1]?`先选 ${nd[0]} 张手牌`:`先选 ${nd[0]}～${nd[1]} 张手牌`]}return[true,""]}
function consTip(i,el){const k=G.cons[i],D=consDef(k);SFX.click();const [ok,why]=consCanUse(k);
 tip(el,`<b>${D.n}</b><em class="ptT">${MB[k]?"秘宝":"符咒"}</em><p>${D.d}</p>${ok?"":`<p class="tipWhy">${why}</p>`}<div class="tipBtns"><button class="btn sm gold" id="cUse" ${ok?"":"disabled"}>使用</button><button class="btn sm" id="cSell">卖掉 +1</button></div>`);
 $("#cUse").onclick=()=>{closeTip();consUse(i)};$("#cSell").onclick=()=>{G.cons.splice(i,1);G.gold+=1;SFX.coin();closeTip();renderCons();renderSide();if($("#shop.on"))shopRender()}}
function consUse(i){const k=G.cons[i],D=consDef(k);const [ok,why]=consCanUse(k);if(!ok){toast(why);SFX.bad();return}
 const cs=(D.need&&D.need[1]>0)?selCards():[];const t=D.use(cs);G.cons.splice(i,1);for(const id of G.partners){const P=PARTNERS[id];if(P.onCons){G.pst[id]=G.pst[id]||{};P.onCons(G.pst[id],k,G);partnerPulse(id)}}G.sel.clear();SFX.shine();bgKick(.5);toast(`<b>${D.n}</b>：${t}`);
 if($("#play.on")){sortHand();render()}else{renderSide();renderPartners();if($("#shop.on"))shopRender()}renderCons()}
function consGive(k){G.cons=G.cons||[];if(G.cons.length>=CONS_MAX){toast("符咒栏满了");return false}G.cons.push(k);renderCons();return true}
const randFu=()=>{const k=Object.keys(FU);return k[Math.floor(rnd()*k.length)]};
const randMb=()=>{const k=Object.keys(MB);return k[Math.floor(rnd()*k.length)]};

/* 打开符咒卡包 / 秘宝卡包：挑一张，直接用或者收进符咒栏 */
function openFuPack(it){return new Promise(res=>{const mb=it.k==="mbpack";const ks=[];while(ks.length<it.n){const k=mb?randMb():randFu();if(!ks.includes(k))ks.push(k)}
 ov(`<div class="box"><h2>${mb?"秘宝卡包":"符咒卡包"}</h2><p class="msg">挑一张收进符咒栏（最多放 ${CONS_MAX} 张）</p><div class="fuRow">${ks.map((k,i)=>`<div class="fuPick" data-k="${k}">${consHTML(k,"big")}<p>${consDef(k).d}</p></div>`).join("")}</div><button class="btn dark" id="fpSkip">都不要</button></div>`);
 $$(".fuPick").forEach(e=>{tiltOn(e.querySelector(".fu"));e.onclick=()=>{if(!consGive(e.dataset.k)){SFX.bad();return}SFX.shine();closeOv();res(e.dataset.k)}});$("#fpSkip").onclick=()=>{closeOv();res(null)}})}

/* ---------- 接进游戏 ---------- */
// 卡包里的牌：有时带增强、带新的印
{const _r=rollCard;rollCard=function(g){const c=_r(g);if(c.s<4&&rnd()<.22)c.en=ENH_KEYS[Math.floor(rnd()*ENH_KEYS.length)];if(c.seal&&rnd()<.7)c.seal=SEAL_KEYS[Math.floor(rnd()*SEAL_KEYS.length)];return c}}
// 牌面上显示增强和印
{const _c=cardHTML;cardHTML=function(c,opt={}){let h=_c(c,opt);if(c.hid&&opt.inHand)return h;
 if(c.en)h=h.replace('class="card ',`class="card en-${c.en} `).replace('<i class="cFoil">',`<i class="cEn">${ENH[c.en].g}${c.en==="ice"&&c.age?`<small>${c.age}</small>`:""}</i><i class="cFoil">`);
 if(c.seal)h=h.replace('<i class="cSeal"></i>',`<i class="cSeal s-${c.seal}">${(SEALS[c.seal]||{}).g||""}</i>`);return h}}
// 弃牌：召唤印送符咒
{const _d=discardSel;discardSel=async function(){const cs=selCards();const n=cs.filter(c=>c.seal==="summon").length;const r=await _d.apply(this,arguments);for(let i=0;i<n;i++){const mb=G.partners.includes("m5");if(consGive(mb?randMb():randFu()))toast(mb?"召唤印：送你一张秘宝":"召唤印：送你一张符咒")}return r}}
// 商店：多一张符咒、偶尔有秘宝，卡包种类轮换
{const _o=shopOpen;shopOpen=function(){_o();const S_=G.shop;S_.items=S_.items.filter(it=>it.k==="partner"||it.k==="tea");
 S_.items.push({k:"fu",id:randFu(),p:3});
 const packs=[{k:"pack",id:"card",p:4,n:4},{k:"pack",id:"gold",p:6,n:3},{k:"teapack",p:4,n:3},{k:"fupack",p:4,n:3}];if(rnd()<.22)packs.push({k:"mbpack",p:7,n:2});
 shuffleArr(packs).slice(0,2).forEach(p=>S_.items.push(p));if(rnd()<.08)S_.items[4]={k:"mb",id:randMb(),p:6};shopRender()}}
{const _r=shopRender;shopRender=function(){_r();const row=$("#shop .shRow");if(!row)return;
 G.shop.items.forEach((it,i)=>{if(it.sold)return;if(!["fu","mb","fupack","mbpack"].includes(it.k))return;const el=row.children[i];if(!el)return;
  if(it.k==="fu"||it.k==="mb"){const D=consDef(it.id);el.className="shItem fuItem";el.innerHTML=`${consHTML(it.id,"big")}<p>${D.d}</p><div class="price">${packP(it)}</div>`}
  else{const mb=it.k==="mbpack";el.className="shItem pack "+(mb?"mbpack":"fupack");el.innerHTML=`<span class="kind">${mb?"秘宝卡包":"符咒卡包"}</span><div class="pkArt">${[0,1,2].map(q=>`<i style="--q:${q}"></i>`).join("")}</div><b>${mb?"秘宝卡包":"符咒卡包"}</b><p>打开看 ${it.n} 张<br>挑 1 张收进符咒栏</p><div class="price">${packP(it)}</div>`}
  el.onclick=()=>shopBuy(i)});renderCons()}}
{const _b=shopBuy;shopBuy=async function(i){const it=G.shop.items[i];if(!it||it.sold)return;if(!["fu","mb","fupack","mbpack"].includes(it.k))return _b(i);
 const price=packP(it);if(G.gold<price){toast("金币不够");SFX.bad();return}
 if(it.k==="fu"||it.k==="mb"){if((G.cons||[]).length>=CONS_MAX){toast("符咒栏满了，先用掉或卖掉一张");SFX.bad();return}G.gold-=price;it.sold=1;consGive(it.id);SFX.coin();shopRender();return}
 if((G.cons||[]).length>=CONS_MAX){toast("符咒栏满了，先用掉或卖掉一张");SFX.bad();return}
 G.gold-=price;it.sold=1;SFX.coin();shopRender();await openFuPack(it);shopRender()}}
// 画面切换时刷新符咒栏；新的一局清空
{const _s=show;show=function(id){_s(id);if(G)renderCons();else{const e=$("#cons");if(e)e.style.display="none"}}}
{const _rr=render;render=function(){_rr();renderCons()}}
{const _n=newRun;newRun=function(h,d){const r=_n(h,d);if(G&&!G.cons)G.cons=[];return r}}
// 记住最近出的牌型（茶道符用）
{const _p=playSel;playSel=async function(){const r=await _p.apply(this,arguments);if(G&&G.lastType)G.lastTea=G.lastType;return r}}
addEventListener("load",()=>{consInit();$("#bPlay").onclick=()=>playSel();$("#bDisc").onclick=()=>discardSel()});

/* 1.8：符咒牌面多一点细节：内框线、上下两颗小菱形、图案后面的淡圆环、细斜纹、名字上面一道短线 */
{const _ch2=consHTML;consHTML=function(k,cls){const h=_ch2.apply(this,arguments);return h.replace('<div class="fuIn">','<div class="fuIn"><i class="fuDeco"></i>')}}
