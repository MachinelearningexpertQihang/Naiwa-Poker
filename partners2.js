/* ===================== 奶蛙牌 1.6 · 第三批伙伴（20 个）=====================
   路上打过的对手，有一些愿意跟你走了。按流派补齐：小牌、牌型、成长、弃牌、花色、印、逢人配这几家人少，多补几个 */
const isRed=c=>c.s===1||c.s===3,isBlack=c=>c.s===0||c.s===2;
Object.assign(PARTNERS,{
 /* 小牌 */
 p3_rat:{t:"小牌",n:"奶鼠",img:"e_v_ms",r:"C",p:4,d:"打出的牌里每有 1 张 2～6，筹码 +15",hand:x=>{const n=x.cards.filter(c=>c.s<4&&c.r>=2&&c.r<=6).length;if(n){x.chips+=15*n;return`+${15*n} 筹码`}}},
 p3_icehorse:{t:"小牌",n:"冰晶奶马",img:"e_hrl",r:"R",p:6,d:"这一手只出了 1～2 张牌：倍率 ×2",hand:x=>{if(x.cards.length<=2){x.mult*=2;return"×2 倍率"}}},
 /* 牌型 */
 p3_mutt:{t:"牌型",n:"泥巴奶狗",img:"e_dga",r:"C",p:4,d:"打出两对时 倍率 +12",hand:x=>{if(x.type==="twopair"){x.mult+=12;return"+12 倍率"}}},
 p3_crawl:{t:"牌型",n:"沼泽爬行奶蛙",img:"e_xcs",r:"R",p:6,d:"打出三带二时 倍率 ×2",hand:x=>{if(x.type==="fullhouse"){x.mult*=2;return"×2 倍率"}}},
 /* 成长 */
 p3_egg:{t:"成长",n:"斑点奶蛋",img:"e_egs",r:"C",p:5,d:"每打出一次对子或两对，自己永久 筹码 +8（现在 +{v}）",hand:x=>{const P=x.self;if(x.type==="pair"||x.type==="twopair")P.v=(P.v||0)+8;if(P.v){x.chips+=P.v;return`+${P.v} 筹码`}}},
 p3_snowegg:{t:"成长",n:"雪蛋",img:"e_egl",r:"R",p:7,d:"过关时每剩 1 次出牌，自己永久 倍率 +2（现在 +{v}）",end:(G,x0)=>{const P=x0&&x0.self;if(P&&G.handsLeft>0)P.v=(P.v||0)+2*G.handsLeft;return 0},hand:x=>{if(x.self.v){x.mult+=x.self.v;return`+${x.self.v} 倍率`}}},
 p3_seven:{t:"成长",n:"小七",img:"i5",r:"E",p:8,d:"每关第一手：等级最低的牌型 +1 级",hand:(x,G)=>{if(!x.first)return;G.hl=G.hl||{};const ks=Object.keys(TEA);const k=ks.reduce((a,b)=>(G.hl[b]||0)<(G.hl[a]||0)?b:a,ks[0]);G.hl[k]=(G.hl[k]||0)+1;return`${k==="bomb"?"炸弹":HANDS[k].n} 升级`}},
 /* 弃牌 */
 p3_snowchick:{t:"弃牌",n:"雪地奶鸡",img:"e_ckt",r:"C",p:4,d:"弃牌后，下一手 筹码 +20 × 弃掉的张数（现在 +{v}）",disc:(cs,G,P)=>{P.v=(P.v||0)+20*cs.length;return`+${20*cs.length}`},hand:x=>{const P=x.self;if(P.v){const v=P.v;P.v=0;x.chips+=v;return`+${v} 筹码`}}},
 p3_greedy:{t:"经济",n:"偷吃奶鸡",img:"e_v_ck",r:"C",p:4,d:"过关时每剩 1 次弃牌 +1 金币",end:G=>Math.max(0,G.discLeft||0)},
 /* 花色 */
 p3_ghostcat:{t:"花色",n:"幽灵奶猫",img:"e_ctw",r:"C",p:5,d:"打出的牌全是红色（♥♦）：倍率 +12",hand:x=>{const p=x.cards.filter(c=>c.s<4);if(p.length&&p.every(isRed)){x.mult+=12;return"+12 倍率"}}},
 p3_mudhorse:{t:"花色",n:"泥巴奶马",img:"e_hrcc",r:"C",p:5,d:"打出的牌全是黑色（♠♣）：筹码 +80",hand:x=>{const p=x.cards.filter(c=>c.s<4);if(p.length&&p.every(isBlack)){x.chips+=80;return"+80 筹码"}}},
 /* 连牌 */
 p3_snake:{t:"连牌",n:"泥沼奶蛇",img:"e_sne",r:"C",p:5,d:"打出顺子、三连对时 筹码 +70",hand:x=>{if(x.type==="straight"||x.type==="tube"){x.chips+=70;return"+70 筹码"}}},
 /* 炸弹 */
 p3_scream:{t:"炸弹",n:"尖叫奶蛙",img:"e_hs",r:"C",p:5,d:"打出炸弹时 +3 金币",hand:(x,G)=>{if(x.isBomb){G.gold+=3;return"+3 金币"}}},
 /* 印 / 增强 */
 p3_painting:{t:"印",n:"名画奶蛙",img:"e_ml",r:"R",p:6,d:"每张带印的牌计分时 筹码 +30",card:(x,c)=>{if(c.seal){x.chips+=30;return"+30"}}},
 p3_china:{t:"增强",n:"瓷器奶鸡",img:"e_cki",r:"R",p:6,d:"每张玻璃牌计分时 倍率 ×1.3",card:(x,c)=>{if(c.en==="glass"){x.mult=r1(x.mult*1.3);return"×1.3 倍率"}}},
 /* 逢人配 */
 p3_icecat:{t:"逢人配",n:"冰原奶猫",img:"e_ctl",r:"R",p:7,d:"打出的牌里有逢人配：倍率 ×1.5",hand:x=>{if(x.cards.some(c=>isWild(c,x.lv))){x.mult*=1.5;return"×1.5 倍率"}}},
 /* 压牌 */
 p3_laugh:{t:"压牌",n:"狂笑奶蛙",img:"e_v_m3",r:"R",p:6,d:"连续压住对手，每多连一次 倍率 +6（现在连 {v} 次）",hand:x=>{const P=x.self;P.v=x.beat?(P.v||0)+1:0;if(P.v>1){const m=6*(P.v-1);x.mult+=m;return`+${m} 倍率`}}},
 p3_glow:{t:"压牌",n:"发光奶蛙",img:"e_hn",r:"E",p:9,d:"压住对手时 倍率 ×1.75",hand:x=>{if(x.beat){x.mult*=1.75;return"×1.75 倍率"}}},
 /* 符咒 / 奶蛙池 / 经济 */
 p3_icesnake:{t:"符咒",n:"冰蛇",img:"e_snl",r:"C",p:5,d:"符咒栏里每有 1 张符咒，倍率 +4",hand:(x,G)=>{const n=(G.cons||[]).length;if(n){x.mult+=4*n;return`+${4*n} 倍率`}}},
 p3_crow:{t:"奶蛙池",n:"乌鸡",img:"e_ckb",r:"C",p:5,d:"奶蛙池每消除一次 +2 金币",burst:(x,f,G)=>{G.gold+=2;return"+2 金币"}},
 p3_clock:{t:"经济",n:"钟楼奶鼠",img:"e_msl",r:"R",p:6,d:"身上每有 10 金币，倍率 +2（最多 +20）",hand:(x,G)=>{const v=Math.min(20,Math.floor((G.gold||0)/10)*2);if(v){x.mult+=v;return`+${v} 倍率`}}},
 /* 传说 */
 p3_cosmos:{t:"基础",n:"宇宙奶蛙",img:"e_n4",r:"L",p:12,d:"队伍里每有一个不同流派的伙伴，倍率 ×1.2",hand:(x,G)=>{const n=new Set(G.partners.map(k=>PARTNERS[k]&&PARTNERS[k].t)).size;if(n){const m=r1(Math.pow(1.2,n));x.mult*=m;return`×${m} 倍率`}}}});
