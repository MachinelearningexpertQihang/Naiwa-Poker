/* ===================== 奶蛙牌 · 大牌特效 ===================== */
/* 打出大牌型时：牌会发光、震、炸出火花和冲击波；牌型越大越夸张，声音也越大 */
function fxBurst(x,y,n,col,spread=260){const fx=$("#fx");for(let i=0;i<n;i++){const d=document.createElement("i");d.className="spark";const a=Math.random()*Math.PI*2,r=spread*(.4+Math.random()*.6);
 d.style.cssText=`left:${x}px;top:${y}px;--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r-40}px;--c:${col[i%col.length]};--s:${4+Math.random()*8}px;animation-delay:${Math.random()*.08}s`;fx.appendChild(d);setTimeout(()=>d.remove(),1100)}}
function fxRing(x,y,col,big){const d=document.createElement("i");d.className="ring"+(big?" big":"");d.style.cssText=`left:${x}px;top:${y}px;--c:${col}`;$("#fx").appendChild(d);setTimeout(()=>d.remove(),900)}
function fxFlash(col){const d=document.createElement("i");d.className="flash";d.style.background=col;$("#fx").appendChild(d);setTimeout(()=>d.remove(),500)}
function bigHandFx(j,cards){const t=j.type,n=cards.length;const tb=$("#table");const cx=780,cy=420;
 const bomb=/^bomb(\d)/.exec(t);const lv=t==="rocket"?6:t==="sflush"?3:bomb?+bomb[1]-3:0;
 if(t==="rocket"){tb.classList.add("fxRocket");SFX.rocket();shake();setTimeout(shake,250);bgKick(1.2);fxFlash("rgba(255,240,200,.75)");fxRing(cx,cy,"#ffd23f",1);setTimeout(()=>fxRing(cx,cy,"#ff5a5a",1),180);
  fxBurst(cx,cy,60,["#ffd23f","#ff5a5a","#fff","#c89bff"],420);bigPop("天王炸！！","rocket");setTimeout(()=>tb.classList.remove("fxRocket"),1400);return}
 if(lv){tb.classList.add("fxBomb");tb.style.setProperty("--lv",lv);SFX.bigBomb(lv);shake();if(lv>=3)setTimeout(shake,200);bgKick(.6+lv*.12);fxFlash(`rgba(255,${200-lv*20},80,${.25+lv*.08})`);fxRing(cx,cy,"#ff8a3a",lv>=3);
  fxBurst(cx,cy,14+lv*8,["#ffb03a","#ff5a2a","#ffe08a","#fff"],220+lv*40);if(lv>=2)bigPop(HANDS[t].n+"！","bombP");setTimeout(()=>tb.classList.remove("fxBomb"),1100);return}
 if(n>=5){tb.classList.add("fxLong");SFX.longHand(n);fxRing(cx,cy,"#6fd0ff");fxBurst(cx,cy,10+n*2,["#6fd0ff","#c89bff","#fff"],200);setTimeout(()=>tb.classList.remove("fxLong"),900)}}
