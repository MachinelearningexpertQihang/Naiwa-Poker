/* ===================== 奶蛙牌 · 内容表 ===================== */

/* 花色 → 奶蛙家族（奶蛙池用） */
const FAMS=[
 {k:"frog",n:"奶蛙",img:"i5",c:"#7bd06b",burst:"倍率 +4"},   // ♠
 {k:"cat",n:"奶猫",img:"ct",c:"#ff8fb1",burst:"弃牌 +1"},    // ♥
 {k:"chick",n:"奶鸡",img:"ck",c:"#ffd23f",burst:"出牌 +1"},  // ♣
 {k:"horse",n:"奶马",img:"hr",c:"#f0a54a",burst:"筹码 +30"}, // ♦
 {k:"any",n:"王",img:"mg",c:"#c89bff",burst:"跟谁都能凑"}];   // 王
const JOKER_IMG={16:"mg",17:"bx"};

/* 牌的品质 */
const EDS={
 foil:{n:"闪卡",d:"计分时 筹码 +30"},
 gold:{n:"金卡",d:"留在手里过关，+3 金币"},
 poly:{n:"彩卡",d:"计分时 倍率 ×1.5"}};
const SEALS={frog:{n:"奶蛙印",d:"打出时，往奶蛙池多放一只奶蛙"}};

/* 伙伴（相当于小丑牌的小丑）
   hand(ctx)：整手牌算分时；card(ctx,c)：每张牌计分时；held(ctx,c)：每张留在手里的牌；after(ctx)：这手算完以后；end()：过关时 */
const PARTNERS={
 nw:{t:"基础",n:"奶蛙",img:"nw",r:"C",p:4,d:"每一手 倍率 +4",hand:x=>{x.mult+=4;return"+4 倍率"}},
 dg:{t:"对子",n:"奶狗",img:"dg",r:"C",p:4,d:"打出对子或两对时 筹码 +40",hand:x=>{if(x.type==="pair"||x.type==="twopair"){x.chips+=40;return"+40 筹码"}}},
 eg:{t:"基础",n:"奶蛋",img:"eg",r:"C",p:5,d:"每一关第一手，倍率 ×2",hand:x=>{if(x.first){x.mult*=2;return"×2 倍率"}}},
 c7:{t:"三张",n:"冰封奶蛙王",img:"c7",r:"C",p:5,d:"三张、三带二、钢板 倍率 +8",hand:x=>{if(["triple","fullhouse","plate"].includes(x.type)){x.mult+=8;return"+8 倍率"}}},
 v_ablue:{t:"经济",n:"阿蓝",img:"v_ablue",r:"C",p:4,d:"过关时多拿 4 金币",end:()=>4},
 cup:{t:"压牌",n:"茶杯",img:"cup",r:"C",p:4,d:"这一手没压住上家，倍率 +5",hand:x=>{if(!x.beat){x.mult+=5;return"+5 倍率"}}},
 n1:{t:"连牌",n:"功夫奶蛙",img:"n1",r:"R",p:6,d:"打出顺子、三连对时 倍率 +10",hand:x=>{if(["straight","tube","sflush"].includes(x.type)){x.mult+=10;return"+10 倍率"}}},
 kn:{t:"压牌",n:"骑士奶蛙",img:"kn",r:"R",p:6,d:"压牌成功时 筹码 +60",hand:x=>{if(x.beat){x.chips+=60;return"+60 筹码"}}},
 mg:{t:"级牌",n:"奶蛙魔法师",img:"mg",r:"R",p:6,d:"每张级牌计分时 倍率 +4",card:(x,c)=>{if(c.r===x.lv){x.mult+=4;return"+4 倍率"}}},
 v_gushi:{t:"花色",n:"蛊师奶蛙",img:"v_gushi",r:"R",p:6,d:"打出的牌里每有一种花色，倍率 +3",hand:x=>{const n=new Set(x.cards.filter(c=>c.s<4).map(c=>c.s)).size;if(n){x.mult+=3*n;return`+${3*n} 倍率`}}},
 m6:{t:"级牌",n:"奶蛙长老",img:"m6",r:"R",p:6,d:"手里每留着一张级牌，倍率 +5",held:(x,c)=>{if(c.r===x.lv){x.mult+=5;return"+5 倍率"}}},
 xcf:{t:"奶蛙池",n:"锅炉火龙",img:"xcf",r:"R",p:7,d:"这一手每触发一次奶蛙池消除，倍率 +6",hand:x=>{if(x.bursts){x.mult+=6*x.bursts;return`+${6*x.bursts} 倍率`}}},
 dm:{t:"品质",n:"礼帽先生",img:"dm",r:"R",p:7,d:"每张闪卡、金卡、彩卡计分时 倍率 +5",card:(x,c)=>{if(c.ed){x.mult+=5;return"+5 倍率"}}},
 v_vamp:{t:"炸弹",n:"吸血鬼奶蛙",img:"v_vamp",r:"E",p:8,d:"每打出一次炸弹，自己永久 倍率 +3（现在 +{v}）",hand:x=>{const P=x.self;if(/^bomb|rocket/.test(x.type))P.v=(P.v||0)+3;if(P.v){x.mult+=P.v;return`+${P.v} 倍率`}}},
 vp:{t:"炸弹",n:"月夜伯爵",img:"vp",r:"E",p:8,d:"打出炸弹时 倍率 ×2",hand:x=>{if(/^bomb|rocket/.test(x.type)){x.mult*=2;return"×2 倍率"}}},
 an:{t:"连牌",n:"天使奶蛙",img:"an",r:"E",p:9,d:"同花顺、天王炸 倍率 ×3",hand:x=>{if(x.type==="sflush"||x.type==="rocket"){x.mult*=3;return"×3 倍率"}}},
 bx:{t:"成长",n:"奶蛙大魔王",img:"bx",r:"L",p:12,d:"倍率 ×1.5；每升一级，再 +0.25",hand:x=>{const m=1.5+.25*(x.lvIdx||0);x.mult*=m;return`×${m} 倍率`}}};


/* ===== 第一批新伙伴：按流派 ===== */
const bombN=t=>{const m=/^bomb(\d)/.exec(t);return m?+m[1]:t==="rocket"?4:0};
const sameSuit=cs=>{const p=cs.filter(c=>c.s<4&&c.en!=="cham");return p.length&&p.every(c=>c.s===p[0].s)};
Object.assign(PARTNERS,{
 /* 炸弹流：炸掉牌换力量 */
 egn:{t:"炸弹",n:"臭蛋炸弹",img:"egn",r:"R",p:6,d:"打出炸弹时，炸掉其中 1 张牌（永久移出牌组），自己永久 倍率 +4（现在 +{v}）",hand:x=>{const P=x.self;if(x.isBomb){x.destroy.push(x.cards[0]);P.v=(P.v||0)+4}if(P.v){x.mult+=P.v;return`+${P.v} 倍率`}}},
 v_lava:{t:"炸弹",n:"熔岩巨无霸",img:"v_lava",r:"E",p:9,d:"炸弹每比四张多 1 张，倍率 ×1.5",hand:x=>{const n=bombN(x.type)-4;if(n>0){const m=r1(Math.pow(1.5,n));x.mult*=m;return`×${m} 倍率`}}},
 imp:{t:"炸弹",n:"小恶魔奶蛙",img:"imp",r:"R",p:6,d:"炸弹里的每张牌计分时，筹码再加一遍",card:(x,c,G)=>{if(x.isBomb){const v=cardChips(c,x.lv);x.chips+=v;return`+${v}`}}},
 v_bthunder:{t:"炸弹",n:"雷霆奶蛙王",img:"v_bthunder",r:"R",p:7,d:"打出炸弹后，下一手 倍率 ×2",hand:x=>{const P=x.self;let t;if(P.ch){x.mult*=2;P.ch=0;t="×2 倍率"}if(x.isBomb)P.ch=1;return t}},
 plague:{t:"炸弹",n:"瘟疫奶蛙",img:"plague",r:"R",p:6,d:"牌组每比 108 张少 1 张，倍率 +2",hand:(x,G)=>{const v=Math.max(0,108-G.deck.length)*2;if(v){x.mult+=v;return`+${v} 倍率`}}},
 v_bfour:{t:"炸弹",n:"四头奶蛙",img:"v_bfour",r:"C",p:5,d:"正好四张的炸弹 筹码 +150",hand:x=>{if(x.type==="bomb4"){x.chips+=150;return"+150 筹码"}}},
 /* 级牌流：每一站级牌都不一样 */
 hg:{t:"级牌",n:"金身奶蛙",img:"hg",r:"C",p:4,d:"每张级牌计分时 筹码 +30",card:(x,c)=>{if(c.r===x.lv&&c.s<4){x.chips+=30;return"+30"}}},
 v_sage:{t:"级牌",n:"沼泽圣者",img:"v_sage",r:"R",p:7,d:"每走过一站，倍率 +4（现在 +{v}）",hand:(x,G)=>{const v=4*G.lvIdx;x.self.v=v;if(v){x.mult+=v;return`+${v} 倍率`}}},
 v_bishop:{t:"级牌",n:"骸骨主教",img:"v_bishop",r:"R",p:6,d:"打出的牌里有级牌：倍率 ×1.5",hand:x=>{if(x.cards.some(c=>c.r===x.lv&&c.s<4)){x.mult*=1.5;return"×1.5 倍率"}}},
 timefrog:{t:"级牌",n:"时之奶蛙",img:"timefrog",r:"C",p:5,d:"过关时，手里每张级牌 +2 金币",end:G=>G.hand.filter(c=>c.r===LV_LIST[G.lvIdx]&&c.s<4).length*2},
 /* 逢人配流：把牌变成万能牌 */
 xsw:{t:"逢人配",n:"雾里的白奶蛙",img:"xsw",r:"R",p:7,d:"每关第一手：打出的牌里随机 1 张永久变成逢人配",hand:x=>{if(x.first){const c=x.cards.filter(c=>c.s<4&&!c.wild);if(c.length){c[Math.floor(rnd()*c.length)].wild=1;return"变出一张逢人配"}}}},
 fask:{t:"逢人配",n:"没有颜色的奶蛙",img:"fask",r:"C",p:5,d:"每张逢人配计分时 倍率 +5",card:(x,c)=>{if(isWild(c,x.lv)){x.mult+=5;return"+5 倍率"}}},
 yjx:{t:"逢人配",n:"异世界奶蛙",img:"yjx",r:"E",p:8,d:"手里每留着 1 张逢人配，倍率 ×1.5",held:(x,c)=>{if(isWild(c,x.lv)){x.mult*=1.5;return"×1.5 倍率"}}},
 m4:{t:"逢人配",n:"换牌的旅人",img:"m4",r:"C",p:4,d:"打出的牌里每有 1 张逢人配，筹码 +40",hand:x=>{const n=x.cards.filter(c=>isWild(c,x.lv)).length;if(n){x.chips+=40*n;return`+${40*n} 筹码`}}},
 /* 压牌流：一直压着对手打 */
 v_champ:{t:"压牌",n:"不灭的斗士",img:"v_champ",r:"R",p:7,d:"连续压住：每连 1 次 倍率 +6",hand:x=>{if(x.streak){const v=6*x.streak;x.mult+=v;return`连压 ${x.streak}：+${v} 倍率`}}},
 v_shielder:{t:"压牌",n:"盾斗士",img:"v_shielder",r:"C",p:5,d:"没压住时不打七五折",hand:x=>{if(!x.beat){x.noMiss=1;return"顶住了"}}},
 v_archer:{t:"压牌",n:"弓斗士",img:"v_archer",r:"R",p:7,d:"压住时的 ×1.25 变成 ×1.75",hand:x=>{if(x.beat){x.beatX=Math.max(x.beatX||1.25,1.75);return"压住 ×1.75"}}},
 ckr:{t:"压牌",n:"斗鸡",img:"ckr",r:"C",p:5,d:"用炸弹压住对手：倍率 +15",hand:x=>{if(x.beat&&x.isBomb){x.mult+=15;return"+15 倍率"}}},
 v_mcolo:{t:"压牌",n:"老斗兽场",img:"v_mcolo",r:"C",p:4,d:"这一关压住 3 次以上，过关 +5 金币",end:G=>(G.beatsThis||0)>=3?5:0},
 /* 奶蛙池流 */
 ck:{t:"奶蛙池",n:"奶鸡妈妈",img:"ck",r:"C",p:5,d:"奶鸡（♣）消除时，再 +1 出牌",burst:(x,f,G)=>{if(f===2){G.handsLeft++;return"+1 出牌"}}},
 ctcc:{t:"奶蛙池",n:"招财猫",img:"ctcc",r:"C",p:5,d:"奶猫（♥）消除时 +3 金币",burst:(x,f,G)=>{if(f===1){G.gold+=3;return"+3 金币"}}},
 n3:{t:"奶蛙池",n:"青蛙合唱团",img:"n3",r:"R",p:7,d:"奶蛙（♠）消除时 倍率 ×2",burst:(x,f)=>{if(f===0){x.mult*=2;return"×2 倍率"}}},
 hrd:{t:"奶蛙池",n:"独角马",img:"hrd",r:"C",p:5,d:"奶马（♦）消除时 筹码 +100",burst:(x,f)=>{if(f===3){x.chips+=100;return"+100 筹码"}}},
 v_seakeeper:{t:"奶蛙池",n:"海底守墓者",img:"v_seakeeper",r:"R",p:6,d:"奶蛙池里每有 1 只奶蛙，倍率 +3",hand:(x,G)=>{const n=G.pool.length;if(n){x.mult+=3*n;return`+${3*n} 倍率`}}},
 egt:{t:"奶蛙池",n:"漂着的蛋",img:"egt",r:"R",p:6,d:"每打出 1 张牌，往奶蛙池多放 1 只",poolX:1},
 /* 花色流 */
 ctf:{t:"花色",n:"占卜奶猫",img:"ctf",r:"R",p:7,d:"打出的牌全是同一花色：倍率 ×2",hand:x=>{if(x.cards.length>1&&sameSuit(x.cards)){x.mult*=2;return"×2 倍率"}}},
 ct:{t:"花色",n:"奶猫铁匠",img:"ct",r:"C",p:4,d:"每张红桃 ♥ 计分时 倍率 +3",card:(x,c)=>{if(c.s===1){x.mult+=3;return"+3 倍率"}}},
 ckh:{t:"花色",n:"彩羽奶鸡",img:"ckh",r:"C",p:4,d:"每张梅花 ♣ 计分时 筹码 +25",card:(x,c)=>{if(c.s===2){x.chips+=25;return"+25"}}},
 hrl:{t:"花色",n:"练武的奶马",img:"hrl",r:"C",p:4,d:"每张方块 ♦ 计分时 筹码 +12，倍率 +2",card:(x,c)=>{if(c.s===3){x.chips+=12;x.mult+=2;return"+12 · +2 倍率"}}},
 c1:{t:"花色",n:"泥潭奶蛙",img:"c1",r:"C",p:4,d:"每张黑桃 ♠ 计分时 筹码 +15，倍率 +2",card:(x,c)=>{if(c.s===0){x.chips+=15;x.mult+=2;return"+15 · +2 倍率"}}},
 xb:{t:"花色",n:"奶蛙新娘",img:"xb",r:"R",p:6,d:"打出 5 张以上同一花色的牌（不用连着）：筹码 +120",hand:x=>{if(x.cards.length>=5&&sameSuit(x.cards)){x.chips+=120;return"+120 筹码"}}},
 /* 连牌流 */
 hrn:{t:"连牌",n:"雷蹄奶马",img:"hrn",r:"R",p:7,d:"三连对 倍率 ×2",hand:x=>{if(x.type==="tube"){x.mult*=2;return"×2 倍率"}}},
 xsk:{t:"连牌",n:"沼泽之王",img:"xsk",r:"E",p:8,d:"钢板 倍率 ×2.5",hand:x=>{if(x.type==="plate"){x.mult*=2.5;return"×2.5 倍率"}}},
 snb:{t:"连牌",n:"斑纹奶蛇",img:"snb",r:"C",p:5,d:"顺子里的每张牌计分时 筹码 +15",card:x=>{if(x.type==="straight"||x.type==="sflush"){x.chips+=15;return"+15"}}},
 msj:{t:"连牌",n:"卖糖的小奶鼠",img:"msj",r:"C",p:4,d:"打出顺子 +2 金币",hand:(x,G)=>{if(x.type==="straight"||x.type==="sflush"){G.gold+=2;return"+2 金币"}}},
 hrz:{t:"连牌",n:"斑纹奶马",img:"hrz",r:"R",p:6,d:"连着两手都出连牌（顺子、三连对、钢板）：倍率 ×2",hand:x=>{const L=t=>/straight|tube|plate|sflush/.test(t||"");if(L(x.type)&&L(x.prev)){x.mult*=2;return"×2 倍率"}}},
 /* 品质流 */
 ckik:{t:"品质",n:"铁公鸡",img:"ckik",r:"C",p:5,d:"手里每留着 1 张金卡，倍率 +4",held:(x,c)=>{if(c.ed==="gold"){x.mult+=4;return"+4 倍率"}}},
 egh:{t:"品质",n:"彩虹蛋",img:"egh",r:"R",p:7,d:"彩卡计分时，再 ×1.5",card:(x,c)=>{if(c.ed==="poly"){x.mult*=1.5;return"×1.5 倍率"}}},
 v_horn:{t:"品质",n:"报幕喇叭",img:"v_horn",r:"R",p:6,d:"每关第一手：打出的 1 张牌永久变成闪卡",hand:x=>{if(x.first){const c=x.cards.filter(c=>!c.ed);if(c.length){c[0].ed="foil";return"变出一张闪卡"}}}},
 xg:{t:"品质",n:"流浪商人",img:"xg",r:"C",p:5,d:"卡包里的牌一定有品质，卡包便宜 2 金币"},
 m2:{t:"品质",n:"铁匠奶蛙",img:"m2",r:"C",p:4,d:"闪卡计分时 筹码再 +50",card:(x,c)=>{if(c.ed==="foil"){x.chips+=50;return"+50"}}},
 /* 经济 / 弃牌 / 小牌 / 成长 */
 egq:{t:"经济",n:"存钱蛋",img:"egq",r:"C",p:5,d:"利息上限从 5 变成 10"},
 gb:{t:"经济",n:"礼物盒奶蛙",img:"gb",r:"R",p:6,d:"过关时，随机一个牌型升 1 级",end:G=>{const k=Object.keys(TEA);const t=k[Math.floor(rnd()*k.length)];G.hl[t]=(G.hl[t]||0)+1;return 0}},
 m3:{t:"经济",n:"赌徒奶蛙",img:"m3",r:"C",p:4,d:"倍率随机 ×1 ～ ×3",hand:x=>{const m=[1,1.5,2,2.5,3][Math.floor(rnd()*5)];x.mult*=m;return`×${m} 倍率`}},
 msx:{t:"弃牌",n:"村里的信使",img:"msx",r:"C",p:4,d:"弃牌时，每弃 1 张 +1 金币",disc:(cs,G)=>{G.gold+=cs.length;return`+${cs.length} 金币`}},
 dv:{t:"弃牌",n:"缝里的小恶魔",img:"dv",r:"R",p:6,d:"每弃掉 1 张牌，自己永久 倍率 +1（现在 +{v}）",disc:(cs,G,P)=>{P.v=(P.v||0)+cs.length;return`+${cs.length}`},hand:x=>{if(x.self.v){x.mult+=x.self.v;return`+${x.self.v} 倍率`}}},
 v_cup:{t:"小牌",n:"迷你奶茶杯",img:"v_cup",r:"C",p:4,d:"出单张：倍率 +20",hand:x=>{if(x.type==="single"){x.mult+=20;return"+20 倍率"}}},
 n4:{t:"小牌",n:"以小博大",img:"n4",r:"R",p:6,d:"打出的牌都不大于 6：倍率 ×2.5",hand:x=>{if(x.cards.every(c=>c.s<4&&c.r<=6&&c.r!==x.lv||isWild(c,x.lv))){x.mult*=2.5;return"×2.5 倍率"}}},
 egl:{t:"小牌",n:"冰蛋",img:"egl",r:"C",p:4,d:"手里每留着 1 张牌，筹码 +8",held:x=>{x.chips+=8;return"+8"}},
 v_bdragon2:{t:"成长",n:"深渊龙蛙",img:"v_bdragon2",r:"L",p:12,d:"每打出一手，自己永久 倍率 ×1.05（现在 ×{v}）",hand:x=>{const P=x.self;P.v=r1((P.v||1)*1.05*100)/100;x.mult*=P.v;return`×${P.v} 倍率`}},
 v_chairwill:{t:"成长",n:"魔椅的意志",img:"v_chairwill",r:"L",p:12,d:"每关最后一次出牌：伤害 ×3",hand:x=>{if(x.last){x.mult*=3;return"最后一手 ×3"}}},
 v_twin_white:{t:"压牌",n:"无尽恶魔·恒",img:"v_twin_white",r:"L",p:12,d:"压住对手时，这一手的筹码翻倍",hand:x=>{if(x.beat){x.chips*=2;return"筹码 ×2"}}}});

/* 首领关：每一站一个，机制都不一样
   start(G) 开局；turn(G) 每一手之前；draw(G,cs) 抓牌时；skip(c,G) 不计分；hand(x,G) 算分时；after(x,G) 算完伤害；post(G,x) 这一手结束后；line(G) 对手栏里显示的当前状态 */
const hand0=G=>G.hand.filter(c=>!c.frz&&!c.mud&&c.seal!=="guard");
const BOSSES={
 pp:{n:"泥巴奶屎",img:"pp",d:"每一手之前，随机 2 张手牌被泥巴糊住，这一手出不了",say:["呕——泥巴不够了","糊你一脸！","化成泥了……"],
  turn:G=>{G.hand.forEach(c=>c.mud=0);shuffleArr(hand0(G)).slice(0,2).forEach(c=>c.mud=1)}},
 xsh:{n:"影子刺客",img:"xsh",d:"迷雾：新抓的牌有三分之一背面朝上。点一下才能翻开看，翻开的牌这一手不能出",say:["被看穿了？","你看不清我","雾……散了"],
  draw:(G,cs)=>{cs.forEach(c=>{if(rnd()<.34)c.hid=1})}},
 v_bfallen:{n:"堕天奶蛙",img:"v_bfallen",d:"抗贡：开局拿走你手里最大的 2 张牌，之后每一手前再拿走 1 张",say:["还我！","这张归我了","翅膀……断了"],
  start:G=>{for(let i=0;i<2;i++)bossTake(G)},turn:G=>{if(!G.first)bossTake(G)}},
 vp:{n:"月夜伯爵",img:"vp",d:"吸血：每一手的伤害被它吸走 25%",say:["我的血……","嗯，美味","月亮……落了"],
  after:x=>{const t=Math.floor(x.total*.25);x.total-=t;return t?`伯爵吸走了 ${t} 点伤害`:""}},
 dghw:{n:"古堡女巫",img:"dghw",d:"花色诅咒：每一手之前诅咒一种花色，这种花色的牌不计分",say:["咯咯？","这个花色是我的了","我的扫帚呢……"],
  turn:G=>{G.curseSuit=Math.floor(rnd()*4)},skip:(c,G)=>c.s===G.curseSuit&&!isWild(c,lvNow()),line:G=>`诅咒：<b class="hred">${SUITS[G.curseSuit]}</b> 不计分`},
 xch:{n:"冰原血兽",img:"xch",d:"冰冻：开局冻住 2 张手牌，之后每一手再冻 1 张。冻住的牌 2 手以后才化开",say:["吼？！","冻住你！","好冷……"],
  start:G=>{shuffleArr(hand0(G)).slice(0,2).forEach(c=>c.frz=3)},turn:G=>{G.hand.forEach(c=>{if(c.frz)c.frz--});if(!G.first)shuffleArr(hand0(G)).slice(0,1).forEach(c=>c.frz=2)}},
 v_snowk2:{n:"雪球大王",img:"v_snowk2",d:"越滚越大：每被你压住一次，它下一手就大一档。没压住伤害只剩三分之一",say:["不可能！","滚起来！","化……了"],dyn:1,missX:.35,
  start:G=>{G.snow=0},snowT:["pair","triple","fullhouse","tube","plate","bomb4","bomb5","bomb6","bomb7"],line:G=>`雪球第 <b>${G.snow+1}</b> 档`},
 v_brock:{n:"岩甲奶蛙",img:"v_brock",d:"岩甲：先要打穿 25% 血量的护甲。压住时打护甲 ×2，炸弹直接无视护甲",say:["甲……裂了？","你打不动我","碎了……"],
  start:G=>{G.armor=Math.round(G.target*.25)},line:G=>G.armor>0?`护甲 <b>${G.armor.toLocaleString()}</b>`:"护甲碎了"},
 sny:{n:"熔岩奶蛇",img:"sny",d:"烧牌：每出完一手，烧掉你手里最大的 1 张牌（这一关拿不回来）",say:["嘶！好烫","烧掉你的大牌","凉了……"],
  post:G=>{const h=hand0(G);if(!h.length)return"";const lv=lvNow();h.sort((a,b)=>power(b.r,lv)-power(a.r,lv));const c=h[0];G.hand.splice(G.hand.indexOf(c),1);return`熔岩奶蛇烧掉了你的 ${cardName(c)}`}},
 egf:{n:"深海巨蛋",img:"egf",d:"水压：4 张以下的牌型（单张、对子、三张）伤害只剩 1/4",say:["咕噜？","压扁你","浮……上去了"],
  hand:x=>{if(x.cards.length<4){x.mult=Math.max(1,x.mult/4);return"水压：伤害只剩 1/4"}}},
 snf:{n:"星蛇",img:"snf",d:"倒转：这一关同牌型比大小时，越小越大（3 最大）。炸弹照常",say:["嘶？","星星倒过来了","嘶……回家了"],
  start:G=>{G.invert=1}},
 v_curser:{n:"灭却诅咒师",img:"v_curser",d:"预言：每一手之前预言一个牌型。你出了这个牌型，伤害只剩 1/4",say:["预言……错了？","应验了","终于……可以停下了"],
  turn:G=>{const pool=["single","pair","triple","fullhouse","straight","tube"];G.prophecy=pool[Math.floor(rnd()*pool.length)]},
  hand:(x,G)=>{if(G.prophecy&&x.type===G.prophecy){x.mult=Math.max(1,x.mult/4);return"预言应验：伤害只剩 1/4"}},line:G=>`预言：<b class="hred">${HANDS[G.prophecy].n}</b>`},
 bx:{n:"奶蛙大魔王",img:"bx",d:"第一形态：只出炸弹，每一手掀桌清空奶蛙池。打倒它之后……",say:["有点意思","压不住吧","……还没完"],final:1,
  bombs:["bomb4","bomb4","bomb5"],post:G=>{if(G.pool.length){G.pool=[];return"大魔王掀桌：奶蛙池清空了"}return""}},
 bx2:{n:"阿岳·真身",img:"e_bx",d:"第二形态：级牌和逢人配都不管用了。只出炸弹",say:["……","我想再打一局","谢谢你陪我打完"],final:2,
  bombs:["bomb4","bomb5","bomb5","bomb6"]}};
const STATION_BOSS=["pp","vp","dghw","v_bfallen","xsh","xch","v_snowk2","v_brock","sny","egf","snf","v_curser","bx"];
function cardName(c){return c.s===4?(c.r===17?"大王":"小王"):SUITS[c.s]+rankName(c.r)}
function bossTake(G){const h=hand0(G).filter(c=>c.s<4);if(!h.length)return;const lv=lvNow();h.sort((a,b)=>power(b.r,lv)-power(a.r,lv));const c=h[0];G.hand.splice(G.hand.indexOf(c),1);(G.taken=G.taken||[]).push(c);toast(`堕天奶蛙抗贡：拿走了你的 ${cardName(c)}`)}

/* 茶包：升级牌型（每一级加的筹码、倍率） */
const TEA={single:[10,1],pair:[15,1],twopair:[20,1],triple:[20,2],fullhouse:[25,2],straight:[30,3],flush:[30,3],tube:[30,3],plate:[35,3],bomb:[40,4],sflush:[40,4],rocket:[60,6]};
const teaKey=t=>/^bomb/.test(t)?"bomb":t;

/* 每一级（打 2 ～ 打 A）的基础血量 */
const LV_LIST=[2,3,4,5,6,7,8,9,10,11,12,13,14];
const LV_BASE=[250,450,800,1400,2300,3600,5400,8000,11500,16000,22000,30000,40000];
const BLINDS=[{n:"小关",m:1,gold:3},{n:"大关",m:1.5,gold:4},{n:"首领关",m:2,gold:5}];
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor((typeof rnd==="function"?rnd():rnd())*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

/* 对手（小关、大关坐在对面的奶蛙）。like：它爱出的牌型；say：被压住 / 压住你 / 被打倒时说的话 */
const FOES={
 rat:{n:"奶鼠",img:"e_v_ms",d:"爱出单张，牌都不大",like:["single","single","pair"],say:["吱！","嘿嘿，压不住吧","吱……我回洞里了"]},
 mutt:{n:"泥巴奶狗",img:"e_dga",d:"爱出对子",like:["pair","pair"],say:["汪呜！","汪！这对你接不住","呜……"]},
 chick:{n:"偷吃奶鸡",img:"e_v_ck",d:"爱出顺子",like:["straight","straight"],say:["咯咯！","咯咯咯，顺下去！","我的米……"]},
 egg:{n:"斑点奶蛋",img:"e_egs",d:"爱出三张",like:["triple","triple"],say:["蛋壳裂了！","滚过去咯","碎了……"]},
 laugh:{n:"狂笑奶蛙",img:"e_v_m3",d:"什么都出，笑得很大声",like:["pair","triple","fullhouse"],say:["哈哈哈……哈？","哈哈哈哈哈！","哈……不好笑了"]},
 ghostcat:{n:"幽灵奶猫",img:"e_ctw",d:"爱出三连对",like:["tube","pair"],say:["喵——！","飘过去了喵","我会回来的喵"]},
 butler:{n:"管家奶蛙",img:"e_v_xg",d:"出牌规规矩矩",like:["pair","straight"],say:["失礼了","请您接招","今天就到这里吧"]},
 mudhorse:{n:"泥巴奶马",img:"e_hrcc",d:"爱出顺子和对子",like:["straight","pair"],say:["咴儿！","跑得比你快！","跑不动了……"]},
 snowchick:{n:"雪地奶鸡",img:"e_ckt",d:"爱出三张",like:["triple","pair"],say:["好冷！","冻住你！","我去钟楼取暖了"]},
 bride:{n:"幽灵新娘",img:"e_xb",d:"爱出三带二",like:["fullhouse","triple"],say:["啊……","你接不住的","花……谢了"]},
 giant:{n:"巨无霸奶蛙",img:"e_v_m4",d:"牌大，偶尔出炸弹",like:["triple","bomb4"],say:["哼！","压扁你！","我……躺一会"]},
 china:{n:"瓷器奶鸡",img:"e_cki",d:"爱出三连对",like:["tube","triple"],say:["叮！","硬吧？","碎……碎了"]},
 snake:{n:"泥沼奶蛇",img:"e_sne",d:"爱出顺子",like:["straight","single"],say:["嘶——","绕晕你","嘶……溜了"]}};
Object.assign(FOES,{
 crawl:{n:"沼泽爬行奶蛙",img:"e_xcs",d:"爱出对子和三张",like:["pair","triple"],say:["呱？！","爬过去！","爬不动了……"]},
 scream:{n:"尖叫奶蛙",img:"e_hs",d:"爱出单张，叫得很响",like:["single","pair"],say:["啊啊啊！","听我叫！","嗓子……哑了"]},
 painting:{n:"名画奶蛙",img:"e_ml",d:"爱出三带二",like:["fullhouse","pair"],say:["画框裂了！","请欣赏","回画里去了"]},
 icehorse:{n:"冰晶奶马",img:"e_hrl",d:"爱出顺子",like:["straight","straight"],say:["咴！","冰上滑过去","化成水了"]},
 frostcat:{n:"冰原奶猫",img:"e_ctl",d:"爱出对子",like:["pair","tube"],say:["喵！冷！","冻住你喵","去烤火了喵"]},
 snowegg:{n:"雪蛋",img:"e_egl",d:"爱出三张",like:["triple","triple"],say:["咕噜","滚过去","化了……"]},
 bellrat:{n:"钟楼奶鼠",img:"e_msl",d:"爱出单张和对子",like:["single","pair"],say:["当！","敲钟了！","钟……停了"]},
 icesnake:{n:"冰蛇",img:"e_snl",d:"爱出顺子",like:["straight","pair"],say:["嘶——冷","缠住你","冬眠了"]},
 blackchick:{n:"乌鸡",img:"e_ckb",d:"爱出三带二",like:["fullhouse","triple"],say:["咯？！","黑吃黑","羽毛掉光了"]},
 starchick:{n:"星鸡",img:"e_ckar",d:"爱出三连对",like:["tube","pair"],say:["咯咯？","星星落下来！","飞回天上了"]},
 starcat:{n:"星猫",img:"e_ctar",d:"爱出顺子",like:["straight","tube"],say:["喵？","踩着星星过去","回银河了喵"]},
 starhorse:{n:"星马",img:"e_hrar",d:"爱出钢板",like:["plate","triple"],say:["咴！","踏碎星河！","跑不动了"]},
 stardog:{n:"星空奶狗",img:"e_dgar",d:"爱出三带二，偶尔出炸弹",like:["fullhouse","bomb4"],say:["汪？","汪！接住！","呜……"]},
 auroraegg:{n:"极光奶蛋",img:"e_egar",d:"爱出三连对",like:["tube","triple"],say:["亮了一下？","照花你的眼","光……灭了"]},
 glow:{n:"发光奶蛙",img:"e_hn",d:"爱出钢板",like:["plate","fullhouse"],say:["好刺眼！","闪你一下","暗下去了"]},
 cosmic:{n:"宇宙奶蛙",img:"e_n4",d:"牌很大，偶尔出炸弹",like:["plate","bomb4","tube"],say:["……嗯？","宇宙的重量","回到星空了"]}});
/* 每一站会遇到的对手 */
const ZONE_FOES=[["rat","mutt","chick","egg","snake","crawl"],["rat","laugh","snake","crawl","chick","scream"],["egg","laugh","scream","mudhorse","giant","mutt"],
 ["ghostcat","butler","bride","painting","scream"],["bride","china","butler","ghostcat","painting"],["snowchick","icehorse","frostcat","snowegg","bellrat"],["icesnake","snowegg","bellrat","frostcat","icehorse"],
 ["mudhorse","blackchick","giant","china"],["blackchick","giant","laugh","stardog"],["auroraegg","glow","starcat","icesnake"],["starchick","starcat","starhorse","stardog"],["glow","cosmic","auroraegg","starhorse"],["cosmic","giant","stardog","glow"]];

/* 每个对手、首领自带的出牌、弃牌次数变化 [出牌, 弃牌] */
const FOE_HD={"rat":[1,-1],"chick":[0,1],"egg":[-1,1],"laugh":[1,-1],"ghostcat":[0,1],"mudhorse":[1,-1],"snowchick":[-1,1],"giant":[0,-1],"china":[-1,2],"snake":[0,1],"scream":[1,-1],"painting":[0,1],"icehorse":[1,-1],"snowegg":[-1,1],"bellrat":[1,0],"icesnake":[0,1],"blackchick":[0,-1],"starchick":[1,-1],"starcat":[0,1],"stardog":[-1,1],"auroraegg":[0,2],"glow":[1,-1],"cosmic":[-1,1],"pp":[0,1],"xsh":[0,1],"v_bfallen":[1,0],"xch":[0,1],"v_snowk2":[1,-1],"v_brock":[1,0],"egf":[0,1],"v_curser":[1,-1],"bx":[1,0],"bx2":[1,0]};

/* 开打前说的一句话（自动冒出来，不用点） */
const FOE_HI={rat:"吱吱，来一局？输了不许哭！",mutt:"汪！我出对子可厉害了。",chick:"咯咯，我的顺子顺得很。",egg:"咕噜……先说好，别把我打碎。",snake:"嘶——牌桌上见真章。",crawl:"呱。慢慢来，我爬得慢，牌出得快。",
 laugh:"哈哈哈！光看你的脸我就想笑！",scream:"啊啊啊——开打了开打了！",giant:"哼，你这么小，牌也小吧。",ghostcat:"喵……古堡里好久没人陪我打牌了。",butler:"请坐。规矩照旧，输了要收拾桌子。",
 bride:"今天是我的大日子，可别让我输。",painting:"请保持安静，看我出牌就好。",china:"小心点，我很贵的。",mudhorse:"咴儿！我跑得快，出牌也快！",snowchick:"好冷……打完这局我要去烤火。",
 icehorse:"冰上打牌，手别抖哦。",frostcat:"喵，冻住你的好牌！",snowegg:"雪球滚起来，就停不下来。",bellrat:"当！钟响了，开局！",icesnake:"嘶……冷血的打法见过吗？",
 blackchick:"黑吃黑，懂吗？",starchick:"星星说今天我手气好。",starcat:"喵，我是从银河掉下来的。",starhorse:"踏碎星河，压你一手！",stardog:"汪！在星空下打牌最开心了。",
 auroraegg:"等我亮起来，你就看不清牌了。",glow:"别直视我，会晃眼的。",cosmic:"……宇宙很大，你的牌很小。",
 pp:"嘿嘿，泥巴可是糊上就掉不了的。",vp:"欢迎来到我的古堡。你的分……我收下了。",dghw:"挑一个花色吧。……算了，我替你挑。",v_bfallen:"抗贡，懂规矩吗？把大牌交出来。",
 xsh:"看得清自己的牌吗？",xch:"吼——这里只有冰和血。",v_snowk2:"每压我一次，我就滚得更大！",v_brock:"来啊，打穿我的甲试试。",sny:"你手里最大的那张，我先烧了。",
 egf:"深海里，小牌是浮不起来的。",snf:"今晚星星倒过来了，牌也是。",v_curser:"我已经看到你要出什么了。",bx:"终于走到这一桌了。坐吧。",bx2:"……这一局，我想认真打。"};
/* 每到一站，旁白说一句 */
const LOC_LINE=["泥沼回廊。奶茶泉边的第一张牌桌，泥巴有点黏脚。","迷雾森林。雾太大了，连自己的牌都要凑近了看。","蘑菇遗迹。发光的蘑菇底下，好像有人等了很久。",
 "月夜古堡。烛台亮了，管家已经把牌摆好了。","古堡大门。门后传来女巫的笑声。","极光冰原。手指冻得有点僵，可别出错牌。","冰封神殿。冰里封着的，好像是一副很老的牌。",
 "齿轮荒漠。风沙里，齿轮咔嗒咔嗒地转。","熔岩深渊。桌子是烫的，牌也是烫的。","海底神殿。在水里出牌，要用力一点。","星空之顶。离天上很近了。",
 "虚空裂隙。这里的规则，好像都不太一样。","终焉之地。最后一张牌桌。阿岳在等你。"];

/* ===== 第二批伙伴：配合增强、印、符咒，补到 120 个 ===== */
const RED=c=>c.s===1||c.s===3,BLK=c=>c.s===0||c.s===2;
Object.assign(PARTNERS,{
 /* 符咒流 */
 v_evq:{t:"符咒",n:"命运骰",img:"v_evq",r:"R",p:6,d:"每关开始送你一张随机符咒（符咒栏要有空位）",start:G=>{if((G.cons||[]).length<2){G.cons.push(randFu());setTimeout(()=>toast("命运骰：送你一张符咒"),900)}}},
 c4:{t:"符咒",n:"沉思紫蛙",img:"c4",r:"R",p:6,d:"每用一张符咒或秘宝，自己永久 倍率 +3（现在 +{v}）",onCons:(P)=>{P.v=(P.v||0)+3},hand:x=>{if(x.self.v){x.mult+=x.self.v;return`+${x.self.v} 倍率`}}},
 fj:{t:"符咒",n:"思考者",img:"fj",r:"C",p:4,d:"过关时，符咒栏每空一格 +2 金币",end:G=>(2-(G.cons||[]).length)*2},
 v_mhood:{t:"符咒",n:"兜帽人",img:"v_mhood",r:"R",p:6,d:"每用一张秘宝 +8 金币",onCons:(P,k,G)=>{if(MB[k])G.gold+=8}},
 pot:{t:"符咒",n:"奶茶壶奶蛙",img:"pot",r:"C",p:5,d:"每用一张符咒，有一半几率随机升级一个牌型",onCons:(P,k,G)=>{if(rnd()<.5){const t=Object.keys(TEA);const z=t[Math.floor(rnd()*t.length)];G.hl[z]=(G.hl[z]||0)+1;setTimeout(()=>toast(`奶茶壶：${z==="bomb"?"炸弹":HANDS[z].n} 升级了`),600)}}},
 /* 增强流 */
 cki:{t:"增强",n:"青花瓷奶鸡",img:"cki",r:"R",p:7,d:"每碎掉一张玻璃牌，倍率 ×0.25 永久加成（现在 ×{v}）",hand:(x,G)=>{const v=1+.25*(G.glassBroken||0);x.self.v=v;if(v>1){x.mult*=v;return`×${v} 倍率`}}},
 ckb:{t:"增强",n:"铁皮乌鸡",img:"ckb",r:"C",p:5,d:"手里每张钢牌，倍率再 +6",held:(x,c)=>{if(c.en==="steel"){x.mult+=6;return"+6 倍率"}}},
 hrr:{t:"增强",n:"独角兽",img:"hrr",r:"E",p:8,d:"双生牌计分时 倍率 ×1.5",card:(x,c)=>{if(c.en==="twin"){x.mult*=1.5;return"×1.5 倍率"}}},
 xsr:{t:"增强",n:"彩虹奶蛙",img:"xsr",r:"R",p:6,d:"打出的牌里每有一张变色牌，倍率 +6",hand:x=>{const n=x.cards.filter(c=>c.en==="cham").length;if(n){x.mult+=6*n;return`+${6*n} 倍率`}}},
 egj:{t:"增强",n:"金蛋",img:"egj",r:"C",p:4,d:"每张幸运牌计分时 +1 金币",card:(x,c,G)=>{if(c.en==="lucky"){G.gold+=1;return"+1 金币"}}},
 nx:{t:"增强",n:"星尘奶蛙",img:"nx",r:"R",p:6,d:"冰心牌每多留一手，筹码从 +15 变成 +30"},
 c3:{t:"增强",n:"蓝调奶蛙",img:"c3",r:"C",p:4,d:"手里每张有增强的牌，筹码 +12",held:(x,c)=>{if(c.en){x.chips+=12;return"+12"}}},
 /* 印流 */
 v_pot:{t:"印",n:"紫砂奶茶壶",img:"v_pot",r:"R",p:6,d:"带印的牌计分时 倍率 +4",card:(x,c)=>{if(c.seal){x.mult+=4;return"+4 倍率"}}},
 egsk:{t:"印",n:"蛋王",img:"egsk",r:"E",p:9,d:"回响印的牌计分三次（不是两次）"},
 m5:{t:"印",n:"嘘——",img:"m5",r:"R",p:6,d:"召唤印送的不是符咒，是秘宝"},
 ckg:{t:"印",n:"金奶鸡",img:"ckg",r:"C",p:4,d:"金币印打出时 +6 金币（不是 +3）"},
 fgsk:{t:"印",n:"站岗的奶蛙",img:"fgsk",r:"C",p:5,d:"手里每张守护印的牌，倍率 +5",held:(x,c)=>{if(c.seal==="guard"){x.mult+=5;return"+5 倍率"}}},
 /* 压牌 */
 dgcc:{t:"压牌",n:"老猎犬",img:"dgcc",r:"C",p:4,d:"每关第一次压住对手 +4 金币",hand:(x,G)=>{if(x.beat&&!G.huntGold){G.huntGold=1;G.gold+=4;return"+4 金币"}},start:G=>{G.huntGold=0}},
 hra:{t:"压牌",n:"绿奶马",img:"hra",r:"C",p:4,d:"没压住时 筹码 +80（安慰奖）",hand:x=>{if(!x.beat){x.chips+=80;return"+80 筹码"}}},
 v_vamps:{t:"压牌",n:"星夜吸血鬼",img:"v_vamps",r:"E",p:9,d:"连续压住时，每连一次伤害再 ×1.2（叠乘）",hand:x=>{if(x.streak>1){const m=Math.round(Math.pow(1.2,x.streak-1)*100)/100;x.mult*=m;return`连压 ×${m}`}}},
 /* 奶蛙池 */
 ckar:{t:"奶蛙池",n:"极光奶鸡",img:"ckar",r:"R",p:6,d:"奶蛙池消除时，往池里放一只王（跟谁都能凑）",burst:(x,f,G)=>{if(G.pool.length<7){G.pool.push(4);renderPool(true);return"放进一只王"}}},
 ctar:{t:"奶蛙池",n:"极光奶猫",img:"ctar",r:"R",p:6,d:"奶猫（♥）消除时，倍率 +5，弃牌 +1",burst:(x,f,G)=>{if(f===1){x.mult+=5;G.discLeft++;return"+5 倍率 · 弃牌 +1"}}},
 hrar:{t:"奶蛙池",n:"极光奶马",img:"hrar",r:"R",p:7,d:"奶马（♦）消除时 筹码 ×2",burst:(x,f)=>{if(f===3){x.chips*=2;return"筹码 ×2"}}},
 c2:{t:"奶蛙池",n:"薄荷奶蛙",img:"c2",r:"C",p:4,d:"奶蛙池里有 5 只以上时，倍率 +10",hand:(x,G)=>{if(G.pool.length>=5){x.mult+=10;return"+10 倍率"}}},
 /* 花色 */
 ctm:{t:"花色",n:"薄荷奶猫",img:"ctm",r:"C",p:4,d:"打出的牌里有红桃也有黑桃：倍率 +8",hand:x=>{if(x.cards.some(c=>c.s===1)&&x.cards.some(c=>c.s===0)){x.mult+=8;return"+8 倍率"}}},
 cty:{t:"花色",n:"橘奶猫",img:"cty",r:"C",p:4,d:"打出的牌全是红色（♥♦）：筹码 +60",hand:x=>{const p=x.cards.filter(c=>c.s<4);if(p.length&&p.every(RED)){x.chips+=60;return"+60 筹码"}}},
 dga:{t:"花色",n:"绿奶狗",img:"dga",r:"C",p:4,d:"打出的牌全是黑色（♠♣）：倍率 +8",hand:x=>{const p=x.cards.filter(c=>c.s<4);if(p.length&&p.every(BLK)){x.mult+=8;return"+8 倍率"}}},
 ckf:{t:"花色",n:"星空奶鸡",img:"ckf",r:"E",p:8,d:"同一花色的三带二、三连对、钢板：倍率 ×2",hand:x=>{if(["fullhouse","tube","plate"].includes(x.type)&&sameSuit(x.cards)){x.mult*=2;return"×2 倍率"}}},
 hrc:{t:"花色",n:"彩虹奶马",img:"hrc",r:"C",p:5,d:"打出的牌里四种花色都有：倍率 +15",hand:x=>{if(new Set(x.cards.filter(c=>c.s<4).map(c=>c.s)).size===4){x.mult+=15;return"+15 倍率"}}},
 /* 级牌 / 逢人配 */
 n2:{t:"逢人配",n:"害羞奶蛙",img:"n2",r:"C",p:4,d:"逢人配计分时 筹码 +50",card:(x,c)=>{if(isWild(c,x.lv)){x.chips+=50;return"+50"}}},
 xs:{t:"级牌",n:"胖奶蛙",img:"xs",r:"R",p:6,d:"打出的牌里同时有级牌和逢人配：倍率 ×2",hand:x=>{if(x.cards.some(c=>c.r===x.lv&&!isWild(c,x.lv)&&c.s<4)&&x.cards.some(c=>isWild(c,x.lv))){x.mult*=2;return"×2 倍率"}}},
 snn:{t:"成长",n:"深蓝奶蛇",img:"snn",r:"R",p:6,d:"每关第一手如果是单张，就复制这张牌放进牌组",hand:(x,G)=>{if(x.first&&x.type==="single"){const c={...x.cards[0],id:1e6+Math.floor(rnd()*1e9)};G.deck.push(c);return"复制了一张"}}},
 /* 炸弹 */
 hrw:{t:"炸弹",n:"白马",img:"hrw",r:"C",p:4,d:"打出五炸以上 +4 金币",hand:(x,G)=>{if(bombN(x.type)>=5){G.gold+=4;return"+4 金币"}}},
 xc:{t:"炸弹",n:"蹲蹲奶蛙",img:"xc",r:"C",p:5,d:"炸弹里每有一张逢人配，倍率 +10",hand:x=>{if(x.isBomb){const n=x.cards.filter(c=>isWild(c,x.lv)).length;if(n){x.mult+=10*n;return`+${10*n} 倍率`}}}},
 v_bdragon:{t:"炸弹",n:"龙蛙祭坛",img:"v_bdragon",r:"E",p:9,d:"打出炸弹后，随机一张手牌变成和炸弹一样的点数",hand:(x,G)=>{if(x.isBomb){const r=(x.cards.find(c=>c.s<4&&!isWild(c,x.lv))||{}).r;const h=G.hand.filter(c=>c.s<4&&c.r!==r&&!isWild(c,x.lv));if(r&&h.length){h[Math.floor(rnd()*h.length)].r=r;return"手里多了一张同点数的牌"}}}},
 xcs:{t:"炸弹",n:"癞蛤蟆",img:"xcs",r:"C",p:4,d:"四炸 倍率 +12",hand:x=>{if(x.type==="bomb4"){x.mult+=12;return"+12 倍率"}}},
 /* 牌型 */
 sn:{t:"牌型",n:"黄奶蛇",img:"sn",r:"C",p:4,d:"三带二 筹码 +50",hand:x=>{if(x.type==="fullhouse"){x.chips+=50;return"+50 筹码"}}},
 sna:{t:"牌型",n:"绿奶蛇",img:"sna",r:"C",p:4,d:"三张 筹码 +40",hand:x=>{if(x.type==="triple"){x.chips+=40;return"+40 筹码"}}},
 msb:{t:"牌型",n:"奶牛鼠",img:"msb",r:"C",p:4,d:"对子、两对 倍率 +6",hand:x=>{if(x.type==="pair"||x.type==="twopair"){x.mult+=6;return"+6 倍率"}}},
 msg:{t:"牌型",n:"灰奶鼠",img:"msg",r:"C",p:4,d:"单张 筹码 +40",hand:x=>{if(x.type==="single"){x.chips+=40;return"+40 筹码"}}},
 msy:{t:"牌型",n:"橙奶鼠",img:"msy",r:"C",p:4,d:"顺子 倍率 +8",hand:x=>{if(x.type==="straight"){x.mult+=8;return"+8 倍率"}}},
 snt:{t:"牌型",n:"青奶蛇",img:"snt",r:"C",p:4,d:"三连对 筹码 +60",hand:x=>{if(x.type==="tube"){x.chips+=60;return"+60 筹码"}}},
 snx:{t:"牌型",n:"粉奶蛇",img:"snx",r:"C",p:4,d:"钢板 筹码 +80",hand:x=>{if(x.type==="plate"){x.chips+=80;return"+80 筹码"}}},
 /* 经济 */
 egx:{t:"经济",n:"红蛋",img:"egx",r:"C",p:4,d:"过关时 +1 金币，每走过一站再多 +1",end:G=>1+G.lvIdx},
 egy:{t:"经济",n:"橙蛋",img:"egy",r:"C",p:5,d:"利息每 4 金币算 1 个（不是 5 个）"},
 dgy:{t:"经济",n:"橙奶狗",img:"dgy",r:"C",p:5,d:"商店里「换一批伙伴」永远只要 2 金币"},
 hrg:{t:"经济",n:"金马",img:"hrg",r:"R",p:6,d:"过关时，手里每张金卡再 +2 金币",end:G=>G.hand.filter(c=>c.ed==="gold").length*2},
 /* 小牌 / 弃牌 / 成长 */
 mst:{t:"小牌",n:"青奶鼠",img:"mst",r:"C",p:4,d:"打出的牌都是 2～5：筹码 ×2",hand:x=>{if(x.cards.every(c=>c.s<4&&c.r>=2&&c.r<=5)){x.chips*=2;return"筹码 ×2"}}},
 fhsk:{t:"弃牌",n:"做鬼脸的奶蛙",img:"fhsk",r:"C",p:4,d:"每弃一次牌，下一手 倍率 +3（出完清零，现在 +{v}）",disc:(cs,G,P)=>{P.v=(P.v||0)+3;return`+3`},hand:x=>{const v=x.self.v||0;x.self.v=0;if(v){x.mult+=v;return`+${v} 倍率`}}},
 fbsk:{t:"弃牌",n:"吃手手",img:"fbsk",r:"C",p:4,d:"弃掉的牌里每有一对，+2 金币",disc:(cs,G)=>{const n={};cs.forEach(c=>n[c.r]=(n[c.r]||0)+1);const k=Object.values(n).reduce((a,b)=>a+Math.floor(b/2),0);if(k){G.gold+=2*k;return`+${2*k} 金币`}}},
 ppt:{t:"弃牌",n:"奶油冰淇淋",img:"ppt",r:"C",p:4,d:"每关开始时 弃牌 +1",start:G=>{G.discLeft++}},
 v_proto:{t:"成长",n:"残破的初号机",img:"v_proto",r:"L",p:12,d:"每关第一手打出的牌，全部复制一份放进牌组",hand:(x,G)=>{if(x.first){x.cards.forEach(c=>G.deck.push({...c,id:1e6+Math.floor(rnd()*1e9)}));return`复制了 ${x.cards.length} 张`}}},
 v_twin_black:{t:"压牌",n:"无尽恶魔·蚀",img:"v_twin_black",r:"L",p:12,d:"没压住时，伤害反而 ×2",hand:x=>{if(!x.beat){x.noMiss=1;x.mult*=2;return"没压住 ×2"}}}});
