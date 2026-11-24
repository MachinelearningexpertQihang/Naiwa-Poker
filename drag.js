/* ===================== 奶蛙牌 · 拖动排序（和小丑牌一样）=====================
   伙伴：按住拖到想要的位置（伙伴从左往右依次生效）
   手牌：按住拖到想要的位置；拖过以后新摸的牌接在后面，点「按大小 / 按花色」恢复自动排序 */
function ptStage(x,y){return toStage({left:x,top:y,right:x,bottom:y,width:0,height:0})}
function dragSort(o){let d=null,eat=false;
 const box=()=>$(o.box);
 document.addEventListener("pointerdown",e=>{const b=box();if(!b||!b.contains(e.target)||(o.ok&&!o.ok()))return;const el=e.target.closest(o.item);if(!el||!b.contains(el))return;
  d={el,x:e.clientX,y:e.clientY,on:false,from:[...b.querySelectorAll(o.item)].indexOf(el),pid:e.pointerId}},true);
 addEventListener("pointermove",e=>{if(!d||e.pointerId!==d.pid)return;if(!d.on){if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<10)return;d.on=true;
   const R=toStage(d.el.getBoundingClientRect());const g=d.el.cloneNode(true);g.classList.add("dragGhost");g.style.cssText+=`;position:absolute;left:${R.x}px;top:${R.y}px;width:${d.el.offsetWidth}px;height:${d.el.offsetHeight}px;margin:0;z-index:300;pointer-events:none;transform:scale(1.08) rotate(-3deg)`;
   $("#stage").appendChild(g);d.g=g;d.R=R;const p=ptStage(d.x,d.y);d.dx=p.x-R.x;d.dy=p.y-R.y;d.el.classList.add("dragSrc");try{closeTip()}catch(err){}}
  const p=ptStage(e.clientX,e.clientY);d.g.style.left=(p.x-d.dx)+"px";d.g.style.top=(p.y-d.dy)+"px";
  // 放下去会落在哪一格：看拖着的牌的中心在哪两张之间
  const its=[...box().querySelectorAll(o.item)];let to=0;const cx=p.x-d.dx+d.R.w/2;its.forEach((it,i)=>{if(it===d.el)return;const r=toStage(it.getBoundingClientRect());if(cx>r.x+r.w/2)to=i+(i<d.from?1:0)});
  if(cx<0)to=0;d.to=Math.max(0,Math.min(its.length-1,to));its.forEach((it,i)=>it.classList.toggle("dropL",d.on&&i===d.to&&d.to!==d.from))},{passive:true});
 const end=e=>{if(!d||(e&&e.pointerId!==d.pid))return;const dd=d;d=null;if(!dd.on)return;eat=true;setTimeout(()=>eat=false,60);if(dd.g)dd.g.remove();dd.el.classList.remove("dragSrc");box()&&box().querySelectorAll(".dropL").forEach(x=>x.classList.remove("dropL"));
  if(dd.to!=null&&dd.to!==dd.from){o.move(dd.from,dd.to);SFX.click()}};
 addEventListener("pointerup",end);addEventListener("pointercancel",end);
 document.addEventListener("click",e=>{if(eat&&box()&&box().contains(e.target)){e.stopPropagation();e.preventDefault();eat=false}},true)}
const mv=(a,f,t)=>{const x=a.splice(f,1)[0];a.splice(t,0,x)};
addEventListener("load",()=>{
 dragSort({box:"#partners",item:".pCard",ok:()=>G&&!G.busy&&!$("#ov.on"),move:(f,t)=>{mv(G.partners,f,t);renderPartners();if($("#shop.on")){try{saveRun("shop")}catch(e){}}toast("伙伴换了位置（从左往右依次生效）")}});
 dragSort({box:"#hand",item:".card",ok:()=>G&&!G.busy&&$("#play.on")&&!$("#ov.on"),move:(f,t)=>{mv(G.hand,f,t);G.manualSort=1;renderHand();renderPreview()}});
 const bs=$("#bSort");if(bs){const f0=bs.onclick;bs.onclick=function(){if(G)G.manualSort=0;return f0.apply(this,arguments)}}});
// 自己排过手牌：新摸的牌接在后面（它们之间按当前方式排），不打乱你排好的顺序
{const _sh=sortHand;sortHand=function(){if(!G||!G.manualSort)return _sh.apply(this,arguments);const nw=G.hand.filter(c=>G.newIds&&G.newIds.has(c.id)),old=G.hand.filter(c=>!nw.includes(c));G.hand=nw;_sh.apply(this,arguments);G.hand=old.concat(G.hand)}}
