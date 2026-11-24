/* ===================== 奶蛙牌 · 拖动排序（和小丑牌一样）=====================
   伙伴：按住拖到想要的位置（伙伴从左往右依次生效）；凑齐的同流派伙伴三个一起移动
   手牌：按住拖到想要的位置；拖过以后新摸的牌接在后面，点「按大小 / 按花色」恢复自动排序 */
function ptStage(x,y){return toStage({left:x,top:y,right:x,bottom:y,width:0,height:0})}
function dragSort(o){let d=null,eat=false;
 const box=()=>$(o.box);
 document.addEventListener("pointerdown",e=>{const b=box();if(!b||!b.contains(e.target)||(o.ok&&!o.ok()))return;const el=e.target.closest(o.item);if(!el||!b.contains(el))return;
  d={el,x:e.clientX,y:e.clientY,on:false,pid:e.pointerId}},true);
 addEventListener("pointermove",e=>{if(!d||e.pointerId!==d.pid)return;
  if(!d.on){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<10)return;d.on=true;
   const its=[...box().querySelectorAll(o.item)];d.its=its;d.grp=(o.group?o.group(d.el,its):null)||[d.el];
   const rs=d.grp.map(g=>toStage(g.getBoundingClientRect()));const L=Math.min(...rs.map(r=>r.x)),T=Math.min(...rs.map(r=>r.y)),Rr=Math.max(...rs.map(r=>r.x+r.w)),B=Math.max(...rs.map(r=>r.y+r.h));
   const g=document.createElement("div");g.className="dragGhost";g.style.cssText=`position:absolute;left:${L}px;top:${T}px;width:${Rr-L}px;height:${B-T}px;z-index:300;pointer-events:none;transform:scale(1.06) rotate(-2deg);transform-origin:50% 50%`;
   d.grp.forEach((el,i)=>{const c=el.cloneNode(true);c.style.cssText+=`;position:absolute;left:${rs[i].x-L}px;top:${rs[i].y-T}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;margin:0;animation:none`;g.appendChild(c);el.classList.add("dragSrc")});
   $("#stage").appendChild(g);d.g=g;d.R={x:L,y:T,w:Rr-L};const p=ptStage(d.x,d.y);d.dx=p.x-L;d.dy=p.y-T;try{closeTip()}catch(err){}}
  const p=ptStage(e.clientX,e.clientY);d.g.style.left=(p.x-d.dx)+"px";d.g.style.top=(p.y-d.dy)+"px";
  // 落在哪：拖着的这一组的中心，排在其他牌的第几个前面
  const cx=p.x-d.dx+d.R.w/2,others=d.its.filter(x=>!d.grp.includes(x));let k=0;others.forEach(it=>{const r=toStage(it.getBoundingClientRect());if(cx>r.x+r.w/2)k++});d.k=k;d.others=others;
  d.its.forEach(it=>it.classList.remove("dropL","dropR"));if(k<others.length)others[k].classList.add("dropL");else if(others.length)others[others.length-1].classList.add("dropR")},{passive:true});
 const end=e=>{if(!d||(e&&e.pointerId!==d.pid))return;const dd=d;d=null;if(!dd.on)return;eat=true;setTimeout(()=>eat=false,60);if(dd.g)dd.g.remove();dd.grp.forEach(x=>x.classList.remove("dragSrc"));dd.its.forEach(x=>x.classList.remove("dropL","dropR"));
  const ord=[...dd.others.slice(0,dd.k),...dd.grp,...dd.others.slice(dd.k)].map(x=>dd.its.indexOf(x));
  if(ord.some((v,i)=>v!==i)){o.move(ord);SFX.click()}};
 addEventListener("pointerup",end);addEventListener("pointercancel",end);
 document.addEventListener("click",e=>{if(eat&&box()&&box().contains(e.target)){e.stopPropagation();e.preventDefault();eat=false}},true)}
const reord=(a,ord)=>{const o=ord.map(i=>a[i]);a.splice(0,a.length,...o)};
addEventListener("load",()=>{
 dragSort({box:"#partners",item:".pCard",ok:()=>G&&!G.busy&&!$("#ov.on"),
  group:(el,its)=>{if(!el.classList.contains("setOn"))return null;const t=el.dataset.t;return its.filter(x=>x.classList.contains("setOn")&&x.dataset.t===t)},
  move:ord=>{reord(G.partners,ord);renderPartners();if($("#shop.on")){try{saveRun("shop")}catch(e){}}toast("伙伴换了位置（从左往右依次生效）")}});
 dragSort({box:"#hand",item:".card",ok:()=>G&&!G.busy&&$("#play.on")&&!$("#ov.on"),move:ord=>{reord(G.hand,ord);G.manualSort=1;renderHand();renderPreview()}});
 const bs=$("#bSort");if(bs){const f0=bs.onclick;bs.onclick=function(){if(G)G.manualSort=0;return f0.apply(this,arguments)}}});
// 自己排过手牌：新摸的牌接在后面（它们之间按当前方式排），不打乱你排好的顺序
{const _sh=sortHand;sortHand=function(){if(!G||!G.manualSort)return _sh.apply(this,arguments);const nw=G.hand.filter(c=>G.newIds&&G.newIds.has(c.id)),old=G.hand.filter(c=>!nw.includes(c));G.hand=nw;_sh.apply(this,arguments);G.hand=old.concat(G.hand)}}
