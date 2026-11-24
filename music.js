/* ===================== 奶蛙牌 · 背景音乐 =====================
   乐器采样用奶蛙之塔那套（sf/*.js），旋律是给奶蛙牌新写的。
   每首 8 小节循环（圆舞曲每小节 6 拍，其它 8 拍）；第二遍会加一层乐器，第 8 小节有鼓的加花。
   旋律写法：数字=音阶第几个音，' 高八度，, 低八度，# 升半音，- 延长，. 休止，| 分小节
   吸取奶蛙之塔的教训：首领曲不能软（鼓要重、速度要快）；切后台回来要能自己接上（见 fx.js 的 au） */
const MU={on:true,vol:.55,cur:null,want:null,step:0,next:0,loop:0,timer:null,out:null,rev:null,sf:{},loaded:0};
try{const v=JSON.parse(localStorage.getItem("np-music")||"null");if(v===false)MU.on=false}catch(e){}

const TRK={
 title:{vol:1.5,n:"茶馆午后",bpm:84,sw:.12,key:65,minor:0,lead:"acoustic_grand_piano",lead2:"kalimba",comp:"piano",bass:"soft",dr:"lofi",
  ch:[[53,"M7"],[50,"m7"],[46,"M7"],[48,"7"],[53,"M7"],[50,"m7"],[46,"M7"],[48,"sus"]],
  mel:"3 - 5 - 6 5 3 - | 2 - 1 - 2 3 - . | 4 - 3 - 4 5 6 - | 5 - - - . . . . | 3 - 5 - 1' - 7 6 | 6 - 5 - 3 - 2 1 | 2 - 3 4 3 - 2 - | 1 - - - . . . ."},
 play:{vol:1.1,n:"牌桌（泥沼、森林）",bpm:112,sw:.2,key:62,minor:0,lead:"marimba",lead2:"flute",comp:"pizz",bass:"walk",dr:"play",
  ch:[[50,"M"],[47,"m"],[43,"M"],[45,"M"],[50,"M"],[54,"m"],[43,"M"],[45,"7"]],
  mel:"1 3 5 3 6 5 3 . | 5 . 3 . 2 1 2 . | 1 2 3 5 6 . 5 3 | 2 . . 3 2 . 7, . | 1 3 5 1' 7 . 6 5 | 3 . 5 . 3 2 1 . | 6, 1 2 3 5 . 3 2 | 1 . . . 5, . . ."},
 castle:{vol:1.4,n:"古堡圆舞曲",bpm:138,bar:6,sw:0,key:62,minor:1,lead:"harpsichord",lead2:"string_ensemble_1",comp:"waltz",bass:"waltz",dr:"waltz",
  ch:[[50,"m"],[45,"7"],[50,"m"],[43,"m"],[46,"M"],[45,"M"],[50,"m"],[45,"7"]],
  mel:"5 - 4 3 2 1 | #7, - 1 2 3 - | 5 - 6 5 4 3 | 4 - - 2 - - | 4 - 5 6 1' - | #7 - 6 5 4 - | 5 4 3 2 1 3 | 2 - - - - -"},
 ice:{vol:1.7,n:"极光冰原",bpm:78,sw:0,key:64,minor:0,lead:"celesta",lead2:"tubular_bells",comp:"harp",bass:"soft",dr:"shaker",
  ch:[[52,"M"],[49,"m"],[45,"M"],[47,"M"],[52,"M"],[56,"m"],[45,"M"],[47,"sus"]],
  mel:"5 - 3 - 1' - 7 6 | 6 - 5 - 3 - - . | 4 - 6 - 1' - 2' 1' | 7 - - - 5 - - . | 5 - 3 - 1' - 3' 2' | 2' - 1' - 7 - 5 . | 4 - 6 - 1' 7 6 4 | 5 - - - - - - ."},
 lava:{vol:2.2,n:"熔岩深渊",bpm:146,sw:0,key:61,minor:1,lead:"trumpet",lead2:"french_horn",comp:"pad",bass:"drive",dr:"epic",
  ch:[[49,"m"],[45,"M"],[47,"M"],[44,"7"],[49,"m"],[45,"M"],[42,"m"],[44,"7"]],
  mel:"1 . 1 . 3 . 5 . | 6 - 5 - 3 . 1 . | 7, . 7, . 2 . 4 . | #7, - - - 2 - 1 - | 1 . 3 . 5 . 1' - | 7 - 6 - 5 . 3 . | 4 - 3 - 2 - 4 - | #7, - - - - - . ."},
 sea:{vol:2.6,n:"海底神殿",bpm:70,sw:0,key:62,minor:0,lead:"flute",lead2:"celesta",comp:"harp",bass:"soft",dr:"none",
  ch:[[50,"M7"],[47,"m7"],[43,"M7"],[45,"sus"],[50,"M7"],[54,"m7"],[43,"M7"],[45,"7"]],
  mel:"3 - - 2 1 - 5, - | 6, - - - 1 - 2 - | 3 - 5 - 6 - 5 3 | 2 - - - - - . . | 3 - - 5 6 - 1' - | 7 - 6 - 5 - 3 - | 4 - 3 - 2 - 6, - | 1 - - - - - . ."},
 sky:{vol:1.6,n:"星空之顶",bpm:104,sw:0,key:65,minor:0,lead:"string_ensemble_1",lead2:"flute",comp:"harp",bass:"walk",dr:"epic",
  ch:[[53,"M"],[48,"M"],[50,"m"],[46,"M"],[53,"M"],[48,"M"],[46,"M"],[48,"7"]],
  mel:"1 - - 2 3 - 5 - | 5 - - 4 3 - 2 - | 6, - 1 - 2 - 3 4 | 4 - - - 3 - - . | 1 - - 2 3 - 5 - | 1' - - 7 6 - 5 - | 4 - 6 - 5 - 2 - | 1 - - - - - - ."},
 boss:{vol:2.4,n:"首领",bpm:138,sw:0,key:57,minor:1,lead:"trumpet",lead2:"french_horn",comp:"pad",bass:"drive",dr:"boss",
  ch:[[45,"m"],[41,"M"],[43,"M"],[40,"M"],[45,"m"],[41,"M"],[38,"m"],[40,"7"]],
  mel:"1 . 1 . 3 . 5 - | 6 - 5 - 3 - 1 . | 2 . 2 . 4 . 5 - | #7, - - - 2 - #7, - | 1 . 3 . 5 . 1' - | 7 - 6 - 5 - 3 . | 4 - 5 - 6 - 5 4 | 2 - 1 - #7, - - -"},
 final:{vol:2.3,n:"大魔王",bpm:152,sw:0,key:57,minor:1,lead:"church_organ",lead2:"trumpet",comp:"pad",bass:"drive",dr:"boss",
  ch:[[45,"m"],[45,"m"],[41,"M"],[43,"M"],[45,"m"],[50,"m"],[40,"M"],[40,"7"]],
  mel:"1 1 1 . 3 . 1 . | 5 - 4 3 2 - 1 . | 6, . 1 . 4 . 6 . | 5 - - - 7, - 2 - | 1 . 3 . 5 . 1' . | 2' - 1' 7 6 - 4 . | 3 - 2 - #7, - 2 - | #7, - - - - . . ."},
 final2:{vol:2.0,n:"阿岳",bpm:96,sw:0,key:57,minor:1,lead:"acoustic_grand_piano",lead2:"string_ensemble_1",comp:"pad",bass:"soft",dr:"epic",
  ch:[[45,"m"],[41,"M"],[48,"M"],[43,"M"],[45,"m"],[41,"M"],[50,"m"],[40,"M"]],
  mel:"5 - - 6 5 - 3 - | 4 - - 3 2 - 1 . | 3 - - 4 5 - 1' - | 7 - - - 5 - . . | 5 - - 6 5 - 3 - | 6 - - 5 4 - 3 - | 2 - 3 - 4 - 2 - | #7, - - - - - . ."},
 forest:{vol:1.6,n:"迷雾森林",bpm:96,sw:.12,key:67,minor:0,lead:"fiddle",lead2:"flute",comp:"guitar",bass:"walk",dr:"wood",
  ch:[[43,"M"],[48,"M"],[50,"M"],[43,"M"],[40,"m"],[48,"M"],[50,"sus"],[50,"7"]],
  mel:"5 . 6 5 3 . 2 . | 1 . 3 . 5 - . . | 6 . 5 . 6 . 1' . | 7 - 5 - - - . . | 3 . 5 . 6 . 5 3 | 2 . 1 . 2 3 5 . | 6 5 3 2 1 . 2 . | 2 - - - . . . ."},
 desert:{vol:1.6,n:"齿轮荒漠",bpm:120,sw:0,key:62,minor:1,lead:"kalimba",lead2:"fiddle",comp:"pizz",bass:"drive",dr:"play",
  ch:[[50,"m"],[46,"M"],[48,"M"],[45,"7"],[50,"m"],[43,"m"],[45,"M"],[45,"7"]],
  mel:"1 . 2 . 3 . 5 4 | 3 . 2 . 1 - . . | 6, . 1 . 2 . 3 . | 2 - #7, - 5, - . . | 1 . 2 . 3 . 5 . | 6 . 5 4 3 . 1 . | 4 . 3 . 2 . #7, . | 1 - - - . . . ."},
 void:{vol:1.3,n:"虚空裂隙",bpm:80,sw:0,key:57,minor:1,lead:"celesta",lead2:"cello",comp:"pad",bass:"soft",dr:"shaker",
  ch:[[45,"m"],[41,"M7"],[43,"M"],[40,"sus"],[45,"m"],[38,"m7"],[41,"M7"],[40,"7"]],
  mel:"5 - - - 3 - - - | 4 - 3 - 2 - - . | 1 - - 2 3 - 5 - | 4 - - - - - . . | 5 - - - 1' - - - | 7 - 6 - 5 - - . | 4 - 3 - 2 - 3 - | #7, - - - - - . ."},
 boss2:{vol:2.4,n:"首领 · 风暴",bpm:150,sw:0,key:50,minor:1,lead:"french_horn",lead2:"trumpet",comp:"pad",bass:"drive",dr:"boss",
  ch:[[50,"m"],[50,"m"],[46,"M"],[45,"7"],[50,"m"],[48,"M"],[46,"M"],[45,"7"]],
  mel:"1 . 1 . 5 . 1 . | 6 . 5 . 4 . 3 . | 4 . 4 . 6 . 1' . | #7 - - - 5 - . . | 1' . 7 . 6 . 5 . | 4 . 5 . 6 . 3 . | 4 - 3 - 2 - #7, - | 1 - - - . . . ."},
 shop2:{vol:2.4,n:"茶铺夜话",bpm:92,sw:.15,key:65,minor:0,lead:"kalimba",lead2:"music_box",comp:"harp",bass:"soft",dr:"lofi",
  ch:[[41,"M"],[45,"m"],[46,"M"],[48,"7"],[50,"m"],[45,"m"],[46,"M"],[48,"sus"]],
  mel:"1 . 3 . 5 . 6 5 | 3 . . . 2 . 1 . | 4 . 6 . 1' . 6 . | 5 . . . 3 . . . | 6 . 5 . 3 . 5 . | 2 . 3 . 4 . 3 . | 4 . 6 . 5 . 2 . | 1 . . . . . . ."},
 endless:{vol:1.5,n:"无尽",bpm:128,sw:0,key:55,minor:1,lead:"harpsichord",lead2:"string_ensemble_1",comp:"pizz",bass:"drive",dr:"epic",
  ch:[[43,"m"],[39,"M"],[41,"M"],[38,"7"],[43,"m"],[46,"M"],[39,"M"],[38,"7"]],
  mel:"5 . 1' . 7 . 5 . | 6 . 5 . 3 - . . | 4 . 6 . 5 . 3 . | #7, . 2 . 5 - . . | 5 . 1' . 2' . 1' . | 7 . 6 . 5 . 3 . | 4 . 3 . 2 . #7, . | 1 - - - . . . ."},
 shop:{vol:1.5,n:"小卖部",bpm:100,sw:.15,key:67,minor:0,lead:"music_box",lead2:"celesta",comp:"guitar",bass:"soft",dr:"wood",
  ch:[[43,"M"],[40,"m"],[48,"M"],[50,"M"],[43,"M"],[40,"m"],[48,"M"],[50,"7"]],
  mel:"5 . 3 . 5 . 1' . | 7 . 5 . 3 . . . | 4 . 6 . 1' . 6 . | 5 . . . 2 . . . | 5 3 5 1' 2' . 1' 7 | 6 . 3 . 5 . . . | 4 6 1' 6 4 . 3 2 | 1 . . . . . . ."}};
const CHQ={M:[0,4,7],m:[0,3,7],7:[0,4,7,10],m7:[0,3,7,10],M7:[0,4,7,11],sus:[0,5,7]};
/* 每一站平时放什么 */
const ZONE_TRK=["play","forest","forest","castle","castle","ice","ice","desert","lava","sea","sky","void","sky"];

function muParse(T){const sc=T.minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];const bars=T.mel.split("|").map(b=>b.trim().split(/\s+/));
 return bars.map(b=>b.map(tk=>{if(tk==="."||tk==="-")return tk;let s=0,o=0;const m=tk.match(/^([#b]?)(\d)([',]*)$/);if(!m)return".";if(m[1]==="#")s=1;if(m[1]==="b")s=-1;for(const ch of m[3])o+=ch==="'"?12:-12;return T.key+sc[+m[2]-1]+s+o}))}

/* ---- 采样 ---- */
function muLoad(){if(MU.loaded)return;MU.loaded=1;for(let i=0;i<4;i++){const s=document.createElement("script");s.src="sf/sf"+i+".js";s.onload=muDecode;document.head.appendChild(s)}}
function muDecode(){const W=window.__NWT_SF||{},c=AU.ctx;if(!c)return;for(const inst in W){if(MU.sf[inst])continue;const I=MU.sf[inst]={keys:[],buf:{}};const notes=W[inst];
  for(const m in notes){const bin=atob(notes[m]);const a=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)a[j]=bin.charCodeAt(j);
   const done=b=>{I.buf[m]=b;I.keys=Object.keys(I.buf).map(Number).sort((x,y)=>x-y)};try{const p=c.decodeAudioData(a.buffer,done,()=>{});if(p&&p.then)p.then(done).catch(()=>{})}catch(e){}}delete W[inst]}}
function samp(inst,m,t,dur,vol,wet){const I=MU.sf[inst],c=AU.ctx;if(!I||!I.keys.length||!c||!MU.out)return false;let k=I.keys[0];for(const x of I.keys)if(Math.abs(x-m)<Math.abs(k-m))k=x;const b=I.buf[k];if(!b)return false;
 const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.playbackRate.value=Math.pow(2,(m-k)/12);const end=Math.min(t+Math.max(.08,dur),t+b.duration/s.playbackRate.value);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.setValueAtTime(vol,Math.max(t+.01,end-.1));g.gain.linearRampToValueAtTime(0,end+.03);
 s.connect(g);g.connect(MU.out);if(wet&&MU.rev){const w=c.createGain();w.gain.value=wet;g.connect(w);w.connect(MU.rev)}s.start(t);s.stop(end+.06);return true}
function syn(f,t,d,v,type="triangle",f2){const c=AU.ctx;if(!c||!MU.out)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(MU.out);o.start(t);o.stop(t+d+.02)}
function nz(t,d,v,hp){const c=AU.ctx;if(!c||!MU.out)return;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=nzb();f.type="highpass";f.frequency.value=hp;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);s.connect(f);f.connect(g);g.connect(MU.out);s.start(t,Math.random()*.4);s.stop(t+d+.02)}
const hz=m=>440*Math.pow(2,(m-69)/12);
const note=(inst,m,t,d,v,wet=.15,fb="triangle")=>{if(!samp(inst,m,t,d,v,wet))syn(hz(m),t,Math.min(d,.5),v*.25,fb)};
const kick=(t,v=.5)=>syn(150,t,.2,v,"sine",42),snare=(t,v=.14)=>{nz(t,.14,v,1800);syn(190,t,.08,.08,"triangle",140)},hat=(t,v=.04)=>nz(t,.035,v,7500);
const tom=(t,f,v=.3)=>syn(f,t,.22,v,"sine",f*.55);

/* ---- 每一步 ---- */
const LEADV={trumpet:.32,marimba:.5,acoustic_grand_piano:.42,music_box:.36,harpsichord:.34,celesta:.4,flute:.36,string_ensemble_1:.26,church_organ:.22,fiddle:.3,kalimba:.45,french_horn:.3,cello:.3};
function muStep(T,P,st,t,sd){const BAR=T.bar||8;const bar=Math.floor(st/BAR)%8,s=st%BAR;const C=T.ch[bar],tones=CHQ[C[1]].map(i=>C[0]+i);const alt=MU.loop%2===1;
 // 旋律
 const tk=P[bar][s];if(typeof tk==="number"){let n=1;for(let k=s+1;k<BAR&&P[bar][k]==="-";k++)n++;const d=n*sd*.98;
  const lv=LEADV[T.lead]||.4;note(T.lead,tk,t,d,lv,.22);
  if(alt&&T.lead2)note(T.lead2,T.lead2==="french_horn"||T.lead2==="string_ensemble_1"?tk-12:tk+(T.lead2==="flute"?0:12),t,d,lv*.7,.3);
  else if(T.lead2==="french_horn")note("french_horn",tk-12,t,d,.2,.25)}
 // 伴奏
 const lo=tones.map(m=>m+12);
 if(T.comp==="piano"){if(s===0)lo.forEach((m,i)=>note("acoustic_grand_piano",m,t+i*.012,sd*7,.16,.3));if(s===4)lo.slice(1).forEach(m=>note("acoustic_grand_piano",m+12,t,sd*3,.08,.3))}
 if(T.comp==="pizz"&&s%2===1)note("pizzicato_strings",lo[(s>>1)%lo.length]+12,t,sd*.8,.22,.12);
 if(T.comp==="guitar"){const arp=[lo[0],lo[1],lo[2],lo[0]+12,lo[2],lo[1],lo[0]+12,lo[2]];note("acoustic_guitar_nylon",arp[s],t,sd*2,.2,.2)}
 if(T.comp==="harp"){const arp=[lo[0],lo[1],lo[2],lo[0]+12,lo[1]+12,lo[2],lo[1],lo[0]+12];note("orchestral_harp",arp[s%8],t,sd*3,.2,.3)}
 if(T.comp==="pad"&&s===0)lo.forEach(m=>note("string_ensemble_1",m,t,sd*BAR,.12,.35,"sawtooth"));
 if(T.comp==="waltz"&&(s===2||s===4))lo.forEach(m=>note("pizzicato_strings",m+12,t,sd*.9,.13,.15));
 // 低音
 const R=C[0]-12;
 if(T.bass==="soft"){if(s===0)note("acoustic_bass",R,t,sd*4,.5,0);if(s===4)note("acoustic_bass",R+7,t,sd*3,.38,0)}
 if(T.bass==="walk"&&s%2===0){const nx=T.ch[(bar+1)%8][0]-12;const w=[R,R+tones[1]-C[0],R+7,nx+(nx>R?-1:1)][s>>1];note("acoustic_bass",w,t,sd*1.8,.5,0)}
 if(T.bass==="drive"){note("acoustic_bass",s%4===3?R+12:R,t,sd*.9,.45,0)}
 if(T.bass==="waltz"&&s===0)note("acoustic_bass",R,t,sd*2,.55,0);
 // 鼓（第 8 小节加花）
 const fill=bar===7;
 if(T.dr==="lofi"){if(s===0||s===5)kick(t,.3);if(s===4)snare(t,.07);if(s%2===0)hat(t,.022)}
 if(T.dr==="play"){if(s===0||s===4)kick(t,.38);if(s===2||s===6)snare(t,.1);hat(t,s%2?.02:.035);if(s===3||s===7)samp("woodblock",72,t,.1,.18,0);if(fill&&s>=6)snare(t+sd/2,.08)}
 if(T.dr==="boss"){if(s===0||s===3||s===4||(fill&&s===6))samp("taiko_drum",48,t,.4,.6,.1)||kick(t,.55);kick(t,s%2?0:.32);if(s===2||s===6)snare(t,.18);hat(t,.045);if(s===0&&bar%4===0)samp("timpani",45,t,1.2,.45,.2);if(fill&&s>=4)tom(t,220-s*15,.3)}
 if(T.dr==="epic"){if(s===0||s===4)samp("taiko_drum",48,t,.4,.5,.12)||kick(t,.5);if(s===2||s===6)snare(t,.12);if(s%2===0)hat(t,.03);if(fill&&s>=4)tom(t,200-s*12,.32);if(s===0&&bar===0)samp("timpani",45,t,1.4,.4,.25)}
 if(T.dr==="wood"){if(s===0||s===4)kick(t,.25);if(s%2===1)samp("woodblock",s===3||s===7?84:72,t,.1,.14,0);if(s%2===0)hat(t,.018)}
 if(T.dr==="waltz"){if(s===0)kick(t,.32);if(s===2||s===4)hat(t,.035);if(fill&&s===5)snare(t,.08)}
 if(T.dr==="shaker"){hat(t,s%2?.012:.022);if(s===0&&bar%2===0)samp("tubular_bells",T.key+12,t,2,.08,.4)}}

function muTick(){const c=AU.ctx;if(!c||!MU.cur||!MU.out||document.hidden)return;const T=TRK[MU.cur],P=MU.P;const sd=60/T.bpm/2;const L=(T.bar||8)*8;
 if(MU.next<c.currentTime-.5)MU.next=c.currentTime+.05;   // 被卡住过：别一口气补一堆音
 while(MU.next<c.currentTime+.25){const st=MU.step;const t=MU.next+(st%2?T.sw*sd:0);try{muStep(T,P,st,t,sd)}catch(e){}
  MU.step++;if(MU.step%L===0)MU.loop++;MU.next+=sd;
  if(MU.want&&MU.want!==MU.cur&&MU.step%(T.bar||8)===0){muSwitch();return}}}
function muSwitch(){const c=AU.ctx;if(!c||!MU.out)return;MU.cur=MU.want;MU.P=muParse(TRK[MU.cur]);MU.step=0;MU.loop=0;MU.next=Math.max(MU.next,c.currentTime+.05);
 MU.out.gain.cancelScheduledValues(c.currentTime);MU.out.gain.setValueAtTime(0,c.currentTime);MU.out.gain.linearRampToValueAtTime(MU.on?MU.vol*(TRK[MU.cur].vol||1):0,c.currentTime+.6)}
function muInit(){const c=AU.ctx;if(!c||MU.out)return;MU.out=c.createGain();MU.out.gain.value=0;MU.out.connect(AU.out);
 const n=c.sampleRate*1.6,ir=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const a=ir.getChannelData(ch);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6)}
 MU.rev=c.createConvolver();MU.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.5;MU.rev.connect(rg);rg.connect(MU.out);
 muLoad();muDecode();MU.next=c.currentTime+.1;if(!MU.timer)MU.timer=setInterval(muTick,40)}
/* 声音被系统弄坏、整套重建以后：音乐接着原来那首、原来的位置放 */
function muReset(){MU.out=null;MU.rev=null;const k=MU.cur||MU.want;MU.cur=null;if(k){MU.want=k;bgm(k)}}
function bgm(k){if(!TRK[k])k="play";MU.want=k;const c=AU.ctx;if(!c)return;muInit();if(!MU.cur){muSwitch()}}
function muToggle(){MU.on=!MU.on;try{localStorage.setItem("np-music",JSON.stringify(MU.on))}catch(e){}const c=AU.ctx;if(c&&MU.out){MU.out.gain.cancelScheduledValues(c.currentTime);MU.out.gain.linearRampToValueAtTime(MU.on?MU.vol*((TRK[MU.cur]||{}).vol||1):0,c.currentTime+.3)}return MU.on}
/* 过关、通关、输了的小段旋律（不循环） */
function jingle(kind){const c=AU.ctx;if(!c||!MU.out||!MU.on)return;const t=c.currentTime+.05;
 const seq=kind==="lose"?[[64,0,.3],[63,.3,.3],[62,.6,.3],[59,.9,.9]]:kind==="end"?[[60,0,.2],[64,.2,.2],[67,.4,.2],[72,.6,.4],[67,1,.2],[72,1.2,.2],[76,1.4,.8]]:[[67,0,.12],[71,.12,.12],[74,.24,.12],[79,.36,.5]];
 const inst=kind==="lose"?"acoustic_grand_piano":"music_box";seq.forEach(([m,dt,d])=>note(inst,m,t+dt,d,.45,.3));if(kind!=="lose")samp("tubular_bells",seq[seq.length-1][0],t+seq[seq.length-1][1],1.5,.12,.4)}

/* ---- 接到各个画面 ---- */
{const _au=au;au=function(){const c=_au();if(c&&MU.want&&!MU.out)bgm(MU.want);return c}}
{const _t=titleScreen;titleScreen=function(){_t();bgm("title");const b=document.createElement("button");b.className="btn dark sm tMus";b.textContent=MU.on?"音乐：开":"音乐：关";b.onclick=()=>{au();b.textContent=muToggle()?"音乐：开":"音乐：关";SFX.click()};$("#title").appendChild(b)}}
const shopTrk=()=>G&&G.lvIdx%2?"shop2":"shop";
{const _b=blindSelect;blindSelect=function(){_b();bgm(shopTrk())}}
function playTrack(){if(!G)return"play";if(G.boss==="bx")return"final";if(G.boss==="bx2")return"final2";if(G.boss)return G.lvIdx>=5?"boss2":"boss";if(G.endless&&G.blind===1)return"endless";return ZONE_TRK[Math.min(G.lvIdx,ZONE_TRK.length-1)]}
{const _s=startBlind;startBlind=function(){_s();bgm(playTrack())}}
{const _o=shopOpen;shopOpen=function(){_o();bgm(shopTrk())}}
{const _f=finalPhase;finalPhase=async function(){await _f.apply(this,arguments);bgm("final2")}}
{const _w=blindWin;blindWin=async function(){jingle("win");return _w.apply(this,arguments)}}
{const _g=gameOver;gameOver=function(){jingle("lose");return _g.apply(this,arguments)}}
