/* ===================== 奶蛙牌 · 背景和声音 ===================== */

/* ---------- 背景：一路冒险的地方（奶蛙之塔的场景图）+ 会动的雾和光点
   底下是场景画（慢慢推近），上面一层 WebGL 只画雾气和飘的东西（萤火、火星、雪、气泡、星星） */
const LOCS=[
 {k:"swamp",n:"泥沼回廊",fog:[.45,.6,.45],p:0,pc:[.85,1,.45]},
 {k:"forest",n:"迷雾森林",fog:[.35,.55,.4],p:0,pc:[.7,1,.6]},
 {k:"low0",n:"蘑菇遗迹",fog:[.45,.5,.6],p:0,pc:[.8,.6,1]},
 {k:"castle",n:"月夜古堡",fog:[.55,.3,.35],p:1,pc:[1,.5,.3]},
 {k:"gate",n:"古堡大门",fog:[.45,.35,.6],p:4,pc:[.9,.7,1]},
 {k:"ice",n:"极光冰原",fog:[.6,.75,.9],p:2,pc:[1,1,1]},
 {k:"low2",n:"冰封神殿",fog:[.6,.7,.8],p:2,pc:[.9,.95,1]},
 {k:"gears",n:"齿轮荒漠",fog:[.8,.6,.35],p:5,pc:[1,.85,.5]},
 {k:"lava",n:"熔岩深渊",fog:[.7,.3,.15],p:1,pc:[1,.55,.2]},
 {k:"sea",n:"海底神殿",fog:[.25,.55,.7],p:3,pc:[.7,1,1]},
 {k:"sky",n:"星空之顶",fog:[.5,.5,.8],p:4,pc:[1,1,.85]},
 {k:"void",n:"虚空裂隙",fog:[.5,.3,.7],p:4,pc:[.9,.6,1]},
 {k:"final",n:"终焉之地",fog:[.5,.5,.6],p:1,pc:[1,.6,.4]}];
const BG_SP={title:{k:"castle",fog:[.55,.3,.35],p:1,pc:[1,.5,.3]},shop:{k:"low3",n:"炼金茶铺",fog:[.7,.45,.25],p:1,pc:[1,.7,.35]},
 tut:{k:"swamp",fog:[.45,.6,.45],p:0,pc:[.85,1,.45]}};
const BGFX={on:true,t0:performance.now(),hot:0,fog:[.45,.6,.45],pc:[.85,1,.45],tf:null,p:0,boss:0,tb:0,img:null};
function locOf(lv){return LOCS[Math.min(lv||0,LOCS.length-1)]}
function bgInit(){const st=document.getElementById("stage"),cv=document.getElementById("bgfx");if(!cv)return;
 if(!document.getElementById("bgimg")){const d=document.createElement("div");d.id="bgimg";d.innerHTML=`<i class="bgL"></i><i class="bgL"></i><b class="bgTint"></b><b class="bgShade"></b>`;st.insertBefore(d,cv)}
 const gl=cv.getContext("webgl",{antialias:false,premultipliedAlpha:false,alpha:true});if(!gl){cv.style.display="none";return}
 const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
 const fs=`precision mediump float;uniform vec2 R;uniform float T,H,B;uniform int P;uniform vec3 F,C;
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
 // 一层飘的点：每个格子一个点，按种类往上飘/往下落/闪
 float parts(vec2 uv,float sc,float t,float spd,float dir){vec2 q=uv*sc;q.y-=t*spd*dir;q.x+=sin(t*.3+q.y*.5)*.3;vec2 id=floor(q),g=fract(q)-.5;float r=h(id);if(r<.55)return 0.;
  vec2 o=vec2(h(id+3.)-.5,h(id+7.)-.5)*.6;float d=length(g-o);float tw=.5+.5*sin(t*(1.+r*3.)+r*20.);return smoothstep(.12,.0,d)*tw;}
 void main(){vec2 uv=gl_FragCoord.xy/R.y;float t=T;
  // 雾：从下往上淡淡飘
  float fg=fbm(uv*vec2(2.2,3.)+vec2(t*.04,-t*.025))*fbm(uv*1.3-vec2(t*.02,0.));float low=smoothstep(.75,0.,uv.y/(R.x/R.y)*1.6);
  float fa=fg*(.32+.25*low)*(.9+B*.4);
  vec3 col=F*fa;float a=fa*.85;
  // 飘的东西
  float pt=0.;
  if(P==0){pt=parts(uv,9.,t,.25,1.)+parts(uv+3.1,14.,t,.18,1.)*.7;}        // 萤火
  else if(P==1){pt=parts(uv,10.,t,.55,1.)+parts(uv+1.7,16.,t,.8,1.)*.6;}     // 火星
  else if(P==2){pt=parts(uv,10.,t,.35,-1.)+parts(uv+5.3,18.,t,.25,-1.)*.8;}  // 雪
  else if(P==3){pt=parts(uv,7.,t,.3,1.)*.8+parts(uv+2.2,12.,t,.45,1.)*.6;}   // 气泡
  else if(P==4){pt=parts(uv,12.,t*.2,.05,1.)+parts(uv+9.,20.,t*.2,.03,1.)*.8;}// 星光
  else {pt=parts(uv,11.,t,.12,1.)*.7+parts(uv+4.,6.,t,.08,-1.)*.5;}          // 沙尘
  pt*=1.+H*1.5;col+=C*pt;a=max(a,pt*.95);
  // 首领：四周泛紫红
  vec2 c=gl_FragCoord.xy/R-.5;float vg=smoothstep(.25,.75,length(c));col+=vec3(.5,.05,.4)*vg*B*.9;a=max(a,vg*B*.55);
  col+=vec3(1.,.8,.4)*H*.12;a=max(a,H*.12);
  gl_FragColor=vec4(col/max(a,.001),clamp(a,0.,1.));}`;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.warn(gl.getShaderInfoLog(o));return o};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
 const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const lp=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
 const U=n=>gl.getUniformLocation(pr,n);const uR=U("R"),uT=U("T"),uH=U("H"),uB=U("B"),uP=U("P"),uF=U("F"),uC=U("C");
 cv.width=480;cv.height=270;gl.viewport(0,0,480,270);gl.clearColor(0,0,0,0);
 const lerp=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
 let last=0;const loop=now=>{requestAnimationFrame(loop);if(document.hidden||!BGFX.on)return;if(now-last<40)return;last=now;
  BGFX.hot*=.95;if(BGFX.tf){BGFX.fog=lerp(BGFX.fog,BGFX.tf[0],.05);BGFX.pc=lerp(BGFX.pc,BGFX.tf[1],.05)}BGFX.boss+=(BGFX.tb-BGFX.boss)*.05;
  gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uR,480,270);gl.uniform1f(uT,(now-BGFX.t0)/1000);gl.uniform1f(uH,Math.min(1,BGFX.hot));gl.uniform1f(uB,BGFX.boss);gl.uniform1i(uP,BGFX.p);
  gl.uniform3fv(uF,BGFX.fog);gl.uniform3fv(uC,BGFX.pc);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)};
 requestAnimationFrame(loop)}
function bgImage(k){if(BGFX.img===k)return;BGFX.img=k;const L=[...document.querySelectorAll("#bgimg .bgL")];if(L.length<2)return;const on=L.find(x=>x.classList.contains("on"))||L[1],nx=on===L[0]?L[1]:L[0];
 const im=new Image();im.onload=()=>{if(BGFX.img!==k)return;nx.style.backgroundImage=`url(${im.src})`;nx.classList.remove("kb");void nx.offsetWidth;nx.classList.add("on","kb");on.classList.remove("on")};im.src="img/bg/"+k+".jpg"}
/* 场景：title / lv / boss / shop */
function bgScene(k,lv){const S=k==="lv"||k==="boss"?locOf(lv):BG_SP[k]||BG_SP.title;bgImage(S.k);BGFX.tf=[S.fog,S.pc];BGFX.p=S.p;BGFX.tb=k==="boss"?1:0;
 const tint=document.querySelector("#bgimg .bgTint");if(tint)tint.className="bgTint "+(k==="boss"?"boss":k==="shop"?"warm":"")}
function bgTheme(){}function bgMode(){}
function bgKick(v){BGFX.hot=Math.min(1.2,BGFX.hot+v)}

/* ---------- 声音：奶蛙之塔里的真实音效（CC0） + 合成的牌声
   吸取奶蛙之塔的教训：
   1. iPhone/iPad 静音键会把网页声音当铃声 → 告诉系统这是「播放」
   2. 切到后台再回来，有的手机声音会坏掉 → 发现异常就整套重建
   3. 每次点屏幕都检查一次声音是不是还在 */
try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
const AU={ctx:null,buf:{},on:true,vol:.85,fxVol:1,bad:0};
function auBuild(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;const c=new AC;AU.ctx=c;
 const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(c.destination);
 AU.out=c.createGain();AU.out.gain.value=AU.vol;AU.out.connect(comp);AU.fx=c.createGain();AU.fx.gain.value=AU.fxVol;AU.fx.connect(AU.out);AU.nb=null;
 c.onstatechange=()=>{if(AU.ctx===c&&c.state!=="running"&&!document.hidden&&!AU.sus)AU.bad=1};
 sxLoad();if(c.resume)c.resume().catch(()=>{});if(typeof muReset==="function")muReset();return c}
function auRebuild(){const old=AU.ctx;AU.ctx=null;try{old&&old.close&&old.close().catch(()=>{})}catch(e){}AU.bad=0;auBuild()}
function au(){if(!AU.ctx){try{auBuild()}catch(e){}return AU.ctx}if(document.hidden)return AU.ctx;
 if(AU.bad){auRebuild();return AU.ctx}
 if(AU.ctx.state!=="running"){AU.ctx.resume().catch(()=>{});clearTimeout(AU._chk);AU._chk=setTimeout(()=>{if(AU.ctx&&AU.ctx.state!=="running"&&!document.hidden)AU.bad=1},400)}return AU.ctx}
document.addEventListener("visibilitychange",()=>{const c=AU.ctx;if(!c)return;if(document.hidden){AU.hidAt=Date.now();AU.sus=1;c.suspend&&c.suspend().catch(()=>{})}else{if(Date.now()-(AU.hidAt||0)>800)AU.bad=1;c.resume&&c.resume().then(()=>{AU.sus=0}).catch(()=>{});AU.sus=0;au()}});
addEventListener("pageshow",e=>{if(e.persisted&&AU.ctx)AU.bad=1});
addEventListener("pagehide",()=>{if(AU.ctx)AU.bad=1});
addEventListener("blur",()=>{AU.blurAt=Date.now()});addEventListener("focus",()=>{if(AU.ctx&&AU.blurAt&&Date.now()-AU.blurAt>800)AU.bad=1;AU.blurAt=0});
setInterval(()=>{const n=Date.now();if(AU.beat&&n-AU.beat>2500&&AU.ctx)AU.bad=1;AU.beat=n},1000);   // 页面被冻过（计时器断了一大截）
["pointerdown","touchend","click","keydown"].forEach(ev=>addEventListener(ev,()=>au(),true));
function sxLoad(){const W=window.__NP_SX||{};for(const k in W){if(AU.buf[k])continue;try{const bin=atob(W[k]);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);AU.ctx.decodeAudioData(a.buffer,b=>AU.buf[k]=b,()=>{})}catch(e){}}}
function sx(k,vol=1,rate=1,delay=0){const c=AU.ctx;if(!c||!AU.on)return;let b=AU.buf[k];if(!b){const alt=Object.keys(AU.buf).filter(x=>x.startsWith(k));if(alt.length)b=AU.buf[alt[Math.floor(Math.random()*alt.length)]]}if(!b)return;
 const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.playbackRate.value=rate;g.gain.value=vol;s.connect(g);g.connect(AU.fx||AU.out);s.start(c.currentTime+delay)}
function tone(f,d=.08,type="triangle",v=.1,f2,delay=0){const c=AU.ctx;if(!c||!AU.on)return;const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(AU.fx||AU.out);o.start(t);o.stop(t+d+.02)}
/* 合成的牌声：纸牌「啪」= 一小段过滤过的噪声 */
function nzb(){const c=AU.ctx;if(!AU.nb||AU.nb.sampleRate!==c.sampleRate){const n=c.sampleRate,b=c.createBuffer(1,n,n),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;AU.nb=b}return AU.nb}
function noise(t,d,v,type,f,q=1,f2){const c=AU.ctx;if(!c||!AU.on)return;const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=nzb();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+d);s.connect(fl);fl.connect(g);g.connect(AU.fx||AU.out);s.start(t,Math.random()*.5);s.stop(t+d+.02)}
function snap(delay=0,v=.35,f=3200){const c=AU.ctx;if(!c)return;const t=c.currentTime+delay;noise(t,.035,v,"bandpass",f*(.85+Math.random()*.3),1.4);noise(t,.012,v*.6,"highpass",6000)}
const SFX={
 pick:()=>{snap(0,.32,3600);sx("place",.28,1.3)},unpick:()=>{snap(0,.22,2600)},
 deal:i=>{snap(i*.045,.26,3000+i*60);if(i%3===0)sx("card",.18,1.1,i*.045)},
 shuffle:()=>{for(let i=0;i<16;i++)snap(i*.028+Math.random()*.01,.16+.1*Math.sin(i/16*Math.PI),2600+Math.random()*1400)},
 slide:()=>sx("whoosh",.3,1.3),
 slam:()=>{const c=AU.ctx;if(!c)return;snap(0,.45,2400);tone(130,.12,"sine",.28,55);noise(c.currentTime,.09,.18,"lowpass",900)},
 foeplay:n=>{for(let i=0;i<Math.min(n||2,6);i++)snap(.1+i*.05,.22,2200)},
 boom:()=>{const c=AU.ctx;if(!c)return;const t=c.currentTime;tone(95,.7,"sine",.55,28);noise(t,.9,.5,"lowpass",2400,.7,120);noise(t,.18,.3,"highpass",2000);sx("thud",.6,.7)},
 freeze:()=>{tone(1800,.25,"sine",.07,2600);tone(2400,.3,"triangle",.05,3400,.05);sx("glass",.35,1.6,.03)},
 mud:()=>{const c=AU.ctx;if(!c)return;noise(c.currentTime,.28,.3,"lowpass",700,4,120);noise(c.currentTime+.12,.22,.22,"lowpass",500,4,90)},
 burn:()=>{const c=AU.ctx;if(!c)return;noise(c.currentTime,.5,.28,"bandpass",900,.8,2600);tone(300,.3,"sawtooth",.05,120)},
 peek:()=>{snap(0,.3,2000);sx("flip",.35,1.3)},
 chip:n=>{sx("tick",.5,1+n*.08);tone(700+n*55,.05,"square",.03)},
 mult:n=>{sx("knock",.6,1+n*.05);tone(240+n*30,.08,"sawtooth",.035)},
 xmult:()=>{sx("glass",.6,1.2);tone(520,.16,"triangle",.07,1040)},
 burst:()=>{sx("gem",.7,1);tone(880,.12,"triangle",.07,1760)},
 beat:()=>{sx("punchH",.5,1);sx("bell",.35,1.4,.05)},
 coin:()=>sx("coin",.6,1),coins:()=>sx("coins",.6,1),
 flip:()=>{snap(0,.3,2400);sx("flip",.5,1)},shine:()=>{sx("levelup",.45,1.3);sx("bell",.3,1.6,.08)},
 click:()=>sx("click",.5,1),bad:()=>{sx("thud",.6,.8);tone(160,.22,"sawtooth",.06,80)},
 /* 伙伴连锁：五声音阶一级级往上爬 */
 chain:n=>{const sc=[0,2,4,7,9];const k=n-1;const m=72+sc[k%5]+12*Math.floor(k/5);const fq=440*Math.pow(2,(Math.min(m,103)-69)/12);tone(fq,.18,"triangle",.09);tone(fq*2,.12,"sine",.04,null,.02);if(n%5===0)sx("bell",.4,1+n*.03)},
 bigBomb:lv=>{const c=AU.ctx;if(!c)return;const t=c.currentTime;tone(70,1.1,"sine",.6,22);noise(t,1.3,.55,"lowpass",3000,.7,90);noise(t+.05,.4,.35,"highpass",1500);sx("thud",.7,.55);for(let i=0;i<lv;i++)tone(220*Math.pow(1.26,i),.35,"sawtooth",.05,null,.12+i*.07);sx("levelup",.45,.8+lv*.08,.15+lv*.07)},
 rocket:()=>{SFX.bigBomb(5);for(let i=0;i<6;i++)sx("bell",.35,1+i*.15,.25+i*.08);sx("tri",.5,1.4,.7)},
 longHand:n=>{for(let i=0;i<n;i++)tone(523*Math.pow(1.122,i),.16,"triangle",.06,null,i*.045);sx("whoosh",.35,1.1)},
 score:()=>sx("combo",.55,1),win:()=>{sx("levelup",.6,1);sx("tri",.5,1.2,.15)}};
