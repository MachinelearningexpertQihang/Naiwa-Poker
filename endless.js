/* ===================== 奶蛙牌 · 无尽模式 =====================
   通关以后可以带着这一局的牌组和伙伴继续打：从第 1 站重新走一圈，对手血量翻好几倍，
   每一轮随机加一条额外规则，首领顺序也打乱。看能走多远（会上排行榜） */
const EMODS=[{n:"对手血量 +25%",hp:1.25},{n:"每关出牌 -1",hands:-1},{n:"压不住只有 ×0.5",miss:.5},{n:"商店每样贵 2 金币",shop:2},{n:"弃牌 -1，对手血量 +10%",disc:-1,hp:1.1}];
function startEndless(){G.endless=1;G.won=0;endlessLoop();shopOpen()}
function endlessLoop(){G.loop=(G.loop||0)+1;G.lvIdx=0;G.blind=0;const m=EMODS[Math.floor(rnd()*EMODS.length)];G.eMod=m;G.eMiss=m.miss||0;G.eShop=m.shop||0;
 G.eBoss=shuffleArr(STATION_BOSS.slice(0,12));endlessRecord();toast(`<b>无尽 · 第 ${G.loop} 轮</b><br>这一轮的额外规则：${m.n}`)}
function endlessNext(){endlessLoop();shopOpen()}
function endlessScore(){return G&&G.endless?G.loop*13+G.lvIdx+1:0}
function endlessRecord(){if(!G||!G.endless)return;const s=endlessScore();if(s>(M.endBest||0)){M.endBest=s;saveMeta()}}
{const _t=targetOf;targetOf=function(lv,b){const t=_t(lv,b);if(!G||!G.endless)return t;return Math.round(t*100*Math.pow(3,G.loop-1)*(G.eMod&&G.eMod.hp||1)/10)*10}}
{const _b=bossOf;bossOf=function(lv){if(G&&G.endless&&G.eBoss&&lv<12)return G.eBoss[lv];return _b(lv)}}
{const _h=hdOf;hdOf=function(lv,b){const r=_h(lv,b);if(G&&G.endless&&G.eMod){r[0]=Math.max(2,r[0]+(G.eMod.hands||0));r[1]=Math.max(0,r[1]+(G.eMod.disc||0))}return r}}
{const _p=ptP;ptP=function(id){return _p(id)+(G.eShop||0)}}
{const _p=packP;packP=function(it){return _p(it)+(G.eShop||0)}}
{const _s=blindSelect;blindSelect=function(){_s();endlessRecord();if(G&&G.endless){const h=$(".bsHead");if(h)h.insertAdjacentHTML("afterbegin",`<div class="eBan">无尽 · 第 ${G.loop} 轮　<b>${G.eMod.n}</b>　最远纪录 第 ${M.endBest||0} 站</div>`)}}}
/* 无尽里输了：记录走到哪 */
{const _g=gameOver;gameOver=function(){endlessRecord();const r=_g.apply(this,arguments);if(G&&G.endless){const m=$("#ov .msg");if(m)m.insertAdjacentHTML("afterbegin",`<b>无尽 第 ${G.loop} 轮</b>，一共走了 <b>${endlessScore()}</b> 站<br>`)}return r}}
