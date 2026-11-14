/* =====================================================================
 Latent Terrarium v1.0 (Shared Engine)
 - Zero external network calls / zero LLM APIs at runtime.
 - Local storage only (localStorage + IndexedDB).
===================================================================== */
(()=>{
const LP=window.LT_PACK;
if(!LP)return;
const UI=LP.ui,V=LP.V,PL=LP.PL,LW=LP.LW,TOP=LP.topics;
const KEY=LP.saveKey||'latent_terrarium',DBN='latent_terrarium_db',SND_KEY='latent_terrarium_snd',LIT_KEY='latent_terrarium_lit';
const SCHEMA=6,N=5,DAY=86400,MS_DAY=DAY*1000,$=id=>document.getElementById(id);
const TAU_AFF=600,TAU_BED=3*DAY,TAU_RUT=7*DAY,TAU_FAT=480;
const DEBUG=/[?&]debug=1/.test(location.search);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[Math.random()*a.length|0];
const capFirst=s=>s?s[0].toUpperCase()+s.slice(1):s;
const fmtLine=(s,xName,yName,topic)=>{const tCap=capFirst(topic);return s.replaceAll('{x}',()=>xName).replaceAll('{y}',()=>yName).replaceAll('{t}',()=>topic).replaceAll('{T}',()=>tCap)};
const cv=$('cv'),ctx=cv.getContext('2d'),feed=$('feed');
let dpr=Math.min(2,devicePixelRatio||1),W=640,H=380,ret=null,hist=[],sub='#8089a0',isLight=false,busy=0,lastSp=-1,lastTrouble=-1;
let drops=[],bubbles=[],motes=[],echoes=[],born=Date.now(),total=0,reborn=0,noSave=false,draining=false,drainAt=0,loading=false,tids=[];
let dropKind='topic',litMode='auto',hoverX=-1,hoverY=-1,hoverChar=-1,holdTid=0,holdTriggered=false,lastBondSnd=0;
const dead=[0,0,0,0,0],fade=[1,1,1,1,1];

function later(fn,ms){const id=setTimeout(()=>{tids=tids.filter(x=>x!==id);fn()},ms);tids.push(id);return id}
function clearTimers(){tids.forEach(clearTimeout);tids=[]}

const CH=[10,16,8,23,21],TIDE=[5,3.5,6,4,7],KEEP=[2*DAY,5*DAY,.4*DAY,6*DAY,1.5*DAY];
const COLS=['#6b9ac4','#d48c70','#7fb27a','#a98ad0','#c9b45a'];
const E=LP.names.map((n,i)=>({n,c:COLS[i],t:rnd(10,65),period:rnd(13,34),x:0,y:0,vx:0,vy:0,speak:0,w:TOP[i],ph:rnd(0,6.28),ph2:rnd(0,6.28),fat:0,lv:.6,mem:[]}));

const P=[],PR=Array.from({length:N},()=>[]);
for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const b=rnd(-.45,.55),p={i,j,aff:b,bed:b,rut:rnd(.04,.18),count:0,pulse:0,flash:0,bound:b>.3};P.push(p);PR[i][j]=PR[j][i]=p}

// ===== Web Audio Underwater Ambience & Chime Engine =====
const Sound=(()=>{
  const ROOTS=[587.33,392.00,659.25,329.63,783.99];
  let enabled=false,ctxA=null,master=null,ambFilter=null,ambGain=null;
  try{enabled=localStorage.getItem(SND_KEY)==='1'}catch(e){}

  function updateBtn(){
    const b=$('bSnd');
    if(!b)return;
    b.textContent=enabled?UI.sndOn:UI.sndOff;
    b.classList.toggle('on',enabled);
  }

  function init(){
    if(ctxA)return true;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return false;
    try{
      ctxA=new AC();
      master=ctxA.createGain();
      master.gain.value=enabled&&!draining?.85:.0001;
      master.connect(ctxA.destination);

      const len=ctxA.sampleRate*4,buf=ctxA.createBuffer(1,len,ctxA.sampleRate),ch=buf.getChannelData(0);
      let lastOut=0;
      for(let i=0;i<len;i++){
        const white=Math.random()*2-1;
        lastOut=(lastOut+.02*white)/1.02;
        ch[i]=lastOut*2.4;
      }
      const src=ctxA.createBufferSource();src.buffer=buf;src.loop=true;
      ambFilter=ctxA.createBiquadFilter();ambFilter.type='lowpass';ambFilter.frequency.value=210;ambFilter.Q.value=.8;
      const lfo=ctxA.createOscillator(),lfoG=ctxA.createGain();
      lfo.frequency.value=.07;lfoG.gain.value=85;
      lfo.connect(lfoG);lfoG.connect(ambFilter.frequency);lfo.start();

      ambGain=ctxA.createGain();ambGain.gain.value=.045;
      src.connect(ambFilter);ambFilter.connect(ambGain);ambGain.connect(master);src.start();

      const padF=ctxA.createBiquadFilter();padF.type='lowpass';padF.frequency.value=380;
      const padG=ctxA.createGain();padG.gain.value=.014;
      padF.connect(padG);padG.connect(master);
      [110,165].forEach((f,idx)=>{
        const o=ctxA.createOscillator();o.type='sine';o.frequency.value=f;
        const g=ctxA.createGain();g.gain.value=idx===0?1:.55;
        o.connect(g);g.connect(padF);o.start();
      });
      return true;
    }catch(e){ctxA=null;return false}
  }

  function setEnabled(on){
    enabled=!!on;
    try{localStorage.setItem(SND_KEY,enabled?'1':'0')}catch(e){}
    updateBtn();
    if(enabled){
      if(init()&&ctxA){
        if(ctxA.state==='suspended')ctxA.resume().catch(()=>{});
        if(master&&!draining)master.gain.setTargetAtTime(.85,ctxA.currentTime,.08);
      }
    }else if(ctxA){
      if(master)master.gain.setTargetAtTime(.0001,ctxA.currentTime,.06);
      setTimeout(()=>{if(!enabled&&ctxA&&ctxA.state==='running')ctxA.suspend().catch(()=>{})},160);
    }
  }

  function unlock(){
    if(!enabled)return;
    if(!ctxA)init();
    if(ctxA&&ctxA.state==='suspended'&&!draining&&document.visibilityState!=='hidden'){
      ctxA.resume().catch(()=>{});
    }
  }

  function onVisibility(visible){
    if(!ctxA)return;
    if(!visible){
      if(ctxA.state==='running')ctxA.suspend().catch(()=>{});
    }else if(enabled&&!draining&&ctxA.state==='suspended'){
      ctxA.resume().catch(()=>{});
    }
  }

  function connectPan(node,xNorm){
    if(typeof ctxA.createStereoPanner==='function'){
      const p=ctxA.createStereoPanner();
      p.pan.value=clamp(xNorm,-.85,.85);
      node.connect(p);p.connect(master);
    }else{
      node.connect(master);
    }
  }

  function bloop(delay,gainVal,fStart,fEnd,dur,xNorm,cutoff){
    const t0=ctxA.currentTime+delay;
    const o=ctxA.createOscillator(),f=ctxA.createBiquadFilter(),g=ctxA.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(fStart,t0);
    o.frequency.exponentialRampToValueAtTime(fEnd,t0+dur);
    f.type='lowpass';f.frequency.value=cutoff;
    g.gain.setValueAtTime(.0001,t0);
    g.gain.linearRampToValueAtTime(gainVal,t0+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t0+dur+.12);
    o.connect(f);f.connect(g);connectPan(g,xNorm);
    o.start(t0);o.stop(t0+dur+.15);
  }

  function playDrop(xNorm,yNorm,kind){
    if(!enabled||!ctxA||ctxA.state!=='running')return;
    const ym=1+(.5-clamp(yNorm,0,1))*.14;
    if(kind==='warm'){
      bloop(0,.09,290*ym,640*ym,.11,xNorm,1450);
      bloop(.18,.032,330*ym,720*ym,.10,xNorm,1250);
    }else if(kind==='clear'){
      bloop(0,.082,540*ym,1280*ym,.085,xNorm,2800);
      bloop(.18,.028,620*ym,1420*ym,.08,xNorm,2500);
    }else{
      bloop(0,.085,380*ym,920*ym,.095,xNorm,2100);
      bloop(.18,.03,440*ym,1040*ym,.09,xNorm,1850);
    }
  }

  function playVoice(charIdx,mood,isReply){
    if(!enabled||!ctxA||ctxA.state!=='running')return;
    const root=ROOTS[charIdx]||523.25,t0=ctxA.currentTime;
    const xNorm=W>0?(E[charIdx].x/W)*1.2-.6:(isReply?.25:-.25);
    const f=ctxA.createBiquadFilter(),g=ctxA.createGain();
    f.type='lowpass';f.frequency.value=mood==='e'?950:mood==='c'?2400:1750;
    g.gain.setValueAtTime(.0001,t0);
    g.gain.linearRampToValueAtTime(.045,t0+.015);
    g.gain.exponentialRampToValueAtTime(.0001,t0+.65);
    f.connect(g);connectPan(g,xNorm);

    const o1=ctxA.createOscillator();o1.type='sine';o1.frequency.value=root;
    o1.connect(f);o1.start(t0);o1.stop(t0+.7);

    const o2=ctxA.createOscillator(),g2=ctxA.createGain();
    o2.type='triangle';
    o2.frequency.value=mood==='c'?root*2:mood==='e'?root:root*1.5;
    g2.gain.value=mood==='w'?.38:mood==='c'?.24:.18;
    o2.connect(g2);g2.connect(f);o2.start(t0);o2.stop(t0+.7);
  }

  function playBond(){
    if(!enabled||!ctxA||ctxA.state!=='running')return;
    const nowMs=Date.now();
    if(nowMs-lastBondSnd<1200)return;
    lastBondSnd=nowMs;
    [523.25,783.99].forEach((freq,idx)=>{
      const t0=ctxA.currentTime+idx*.14;
      const o=ctxA.createOscillator(),g=ctxA.createGain();
      o.type='sine';o.frequency.value=freq;
      g.gain.setValueAtTime(.0001,t0);
      g.gain.linearRampToValueAtTime(.036,t0+.02);
      g.gain.exponentialRampToValueAtTime(.0001,t0+.95);
      o.connect(g);g.connect(master);
      o.start(t0);o.stop(t0+1);
    });
  }

  function playDrainStart(){
    if(!enabled||!ctxA)return;
    const t0=ctxA.currentTime;
    if(ambFilter){
      ambFilter.frequency.cancelScheduledValues(t0);
      ambFilter.frequency.setValueAtTime(ambFilter.frequency.value,t0);
      ambFilter.frequency.linearRampToValueAtTime(85,t0+10.5);
    }
    if(ambGain){
      ambGain.gain.cancelScheduledValues(t0);
      ambGain.gain.setValueAtTime(ambGain.gain.value,t0);
      ambGain.gain.linearRampToValueAtTime(.0001,t0+10.5);
    }
  }

  function playFarewell(charIdx){
    if(!enabled||!ctxA||ctxA.state!=='running')return;
    const root=ROOTS[charIdx]||523.25,t0=ctxA.currentTime;
    const f=ctxA.createBiquadFilter(),g=ctxA.createGain();
    f.type='lowpass';f.frequency.value=1500;
    g.gain.setValueAtTime(.0001,t0);
    g.gain.linearRampToValueAtTime(.048,t0+.04);
    g.gain.exponentialRampToValueAtTime(.0001,t0+2.5);
    f.connect(g);g.connect(master);
    [1,1.5].forEach((mul,idx)=>{
      const o=ctxA.createOscillator(),og=ctxA.createGain();
      o.type='sine';o.frequency.value=root*mul;
      og.gain.value=idx===0?1:.32;
      o.connect(og);og.connect(f);o.start(t0);o.stop(t0+2.6);
    });
  }

  return{updateBtn,setEnabled,unlock,onVisibility,playDrop,playVoice,playBond,playDrainStart,playFarewell,isEnabled:()=>enabled};
})();

// ===== Lighting Phases =====
const LIT_ORDER=['auto','dawn','day','dusk','night'];
const LIT_NAMES=LP.litNames;
const PHASE_NAMES=LP.phaseNames;
const PHASE_PAL={
  dark:{
    dawn:{top:'rgba(116,134,178,.15)',bot:'rgba(18,24,38,.25)',ray:'rgba(180,198,240,.085)',surf:'rgba(196,212,248,.34)',mote:'rgba(218,228,250,.55)',sed:'rgba(54,62,82,.32)',caustic:.075,tilt:.18},
    day:{top:'rgba(128,178,214,.16)',bot:'rgba(18,28,40,.22)',ray:'rgba(186,224,252,.095)',surf:'rgba(198,232,255,.38)',mote:'rgba(220,242,255,.58)',sed:'rgba(58,72,88,.30)',caustic:.09,tilt:.06},
    dusk:{top:'rgba(198,126,98,.16)',bot:'rgba(26,20,32,.28)',ray:'rgba(236,162,120,.085)',surf:'rgba(244,178,140,.35)',mote:'rgba(248,202,166,.52)',sed:'rgba(74,56,62,.32)',caustic:.07,tilt:-.18},
    night:{top:'rgba(78,102,148,.12)',bot:'rgba(12,14,22,.34)',ray:'rgba(128,158,216,.055)',surf:'rgba(148,178,232,.25)',mote:'rgba(176,204,248,.42)',sed:'rgba(40,46,62,.34)',caustic:.045,tilt:-.05}
  },
  light:{
    dawn:{top:'rgba(130,156,208,.16)',bot:'rgba(186,200,224,.12)',ray:'rgba(255,255,255,.36)',surf:'rgba(98,124,172,.34)',mote:'rgba(108,128,168,.40)',sed:'rgba(154,166,192,.28)',caustic:.12,tilt:.18},
    day:{top:'rgba(116,178,224,.15)',bot:'rgba(182,212,234,.10)',ray:'rgba(255,255,255,.42)',surf:'rgba(88,144,194,.36)',mote:'rgba(92,142,184,.38)',sed:'rgba(146,168,188,.25)',caustic:.14,tilt:.06},
    dusk:{top:'rgba(218,148,114,.18)',bot:'rgba(196,174,178,.14)',ray:'rgba(255,224,196,.34)',surf:'rgba(182,112,86,.36)',mote:'rgba(168,114,96,.40)',sed:'rgba(172,152,148,.28)',caustic:.11,tilt:-.18},
    night:{top:'rgba(88,112,164,.18)',bot:'rgba(142,156,188,.20)',ray:'rgba(202,218,250,.22)',surf:'rgba(74,96,142,.35)',mote:'rgba(88,108,152,.42)',sed:'rgba(128,140,166,.30)',caustic:.07,tilt:-.05}
  }
};
try{const lm=localStorage.getItem(LIT_KEY);if(LIT_ORDER.includes(lm))litMode=lm}catch(e){}
function getActivePhase(){
  if(litMode!=='auto')return litMode;
  const h=new Date().getHours();
  if(h>=5&&h<9)return'dawn';
  if(h>=9&&h<17)return'day';
  if(h>=17&&h<20)return'dusk';
  return'night';
}
function updateLitUI(){
  const ph=getActivePhase();
  $('bLit').textContent=UI.litPrefix+LIT_NAMES[litMode];
  $('litBadge').textContent=PHASE_NAMES[ph];
  updateTankStatus();
}
function updateTankStatus(){
  const days=(Math.max(0,Date.now()-born)/MS_DAY+1)|0;
  const ph=PHASE_NAMES[getActivePhase()];
  $('tankStatus').textContent=UI.tankStatus(days,ph,drops.length);
}

function initMotes(){
  motes=[];
  for(let k=0;k<28;k++){
    motes.push({x:rnd(10,W-10),y:rnd(12,H-16),r:rnd(.8,2.1),z:rnd(.4,1.2),ph:rnd(0,6.28)});
  }
}
function spawnBubbles(x,y,cnt,col){
  if(draining)return;
  for(let k=0;k<cnt;k++){
    if(bubbles.length>=36)bubbles.shift();
    bubbles.push({x:x+rnd(-8,8),y:y+rnd(-4,4),r:rnd(1.4,3.1),vy:rnd(14,28),ph:rnd(0,6.28),age:0,maxAge:rnd(2.2,4.6),c:col||null});
  }
}

function say(i,t,r,mood){
  if(draining)return;
  Array.from(feed.children).forEach(el=>el.classList.remove('latest'));
  const d=document.createElement('div');d.className='b'+(r?' r':'')+' latest';d.style.setProperty('--c',E[i].c);
  const n=document.createElement('b');n.textContent=E[i].n;d.append(n,t);feed.append(d);
  requestAnimationFrame(()=>d.classList.add('show'));
  while(feed.children.length>6)feed.firstChild.remove();
  Sound.playVoice(i,mood||'m',!!r);
  spawnBubbles(E[i].x,E[i].y-4,2,E[i].c);
  later(()=>{if(draining)return;d.classList.remove('show','latest');later(()=>d.remove(),600)},10500);
}
function fresh(a){let q,n=0;do q=pick(a);while(hist.includes(q)&&++n<6);hist.push(q);if(hist.length>45)hist.shift();return q}

function pushEcho(entry){
  echoes.unshift(entry);
  if(echoes.length>8)echoes.length=8;
  renderEchoes();
}
function renderEchoes(){
  const box=$('echoes');
  if(!box)return;
  if(!echoes.length){box.innerHTML=`<div class="echo-title">${UI.echoTitle}</div><div>${UI.noEcho}</div>`;return}
  box.innerHTML=`<div class="echo-title">${UI.echoTitle}</div>`;
  echoes.forEach(ec=>{
    const item=document.createElement('div');item.className='echo-item';
    const tm=document.createElement('span');tm.className='echo-time';tm.textContent=ec.time;item.appendChild(tm);
    ec.lines.forEach((ln,idx)=>{
      if(idx>0)item.appendChild(document.createTextNode(UI.echoSep));
      const sp=document.createElement('span');sp.className='echo-sp';sp.style.color=E[ln.i].c;sp.textContent=E[ln.i].n;
      item.append(sp,document.createTextNode(UI.echoQuote(ln.text)));
    });
    box.appendChild(item);
  });
}

function updateLevels(dt){
  const d=new Date(),hr=d.getHours()+d.getMinutes()/60,ts=Date.now()/1000;
  E.forEach((e,i)=>{
    const circ=.5+.5*Math.cos(2*Math.PI*(hr-CH[i])/24),tide=.5+.5*Math.sin(2*Math.PI*ts/(3600*TIDE[i])+e.ph2);
    e.fat*=Math.exp(-dt/TAU_FAT);e.lv=clamp(.12+.55*circ+.33*tide-e.fat,.05,1);
  });
}
function remember(i,j,w,amt){
  const M=E[i].mem;let m=M.find(q=>q.j===j&&q.w===w);
  if(m){m.n++;m.s=Math.min(1,m.s+amt)}else M.push({w,j,n:1,s:amt});
  M.sort((a,b)=>b.s-a.s);if(M.length>8)M.length=8;
}
function recall(i,j,w){const m=E[i].mem.find(q=>q.j===j&&q.w===w);return m?m.s:0}
function grudge(i,j){return E[i].mem.find(q=>q.j===j&&q.n>=3&&q.s>=.5)}
function decayMem(dt){E.forEach((e,i)=>{const k=Math.exp(-dt/KEEP[i]);e.mem.forEach(q=>q.s*=k);e.mem=e.mem.filter(q=>q.s>=.05)})}
function carve(p,d,deep){p.aff=clamp(p.aff+d,-1,1);p.bed=clamp(p.bed+d*.02,-1,1);p.rut=clamp(p.rut+(deep?.02:.006)*(1-p.rut),0,1);p.count++;total++}

function pickGossipTarget(si,sj){
  const mx=(E[si].x+E[sj].x)/2,my=(E[si].y+E[sj].y)/2;let bk=-1,bs=-1e9;
  for(let m=0;m<N;m++){if(m===si||m===sj)continue;
    let iso=0;for(let o=0;o<N;o++)if(o!==m)iso+=Math.hypot(E[m].x-E[o].x,E[m].y-E[o].y);
    const sc=Math.hypot(E[m].x-mx,E[m].y-my)*.6+iso/(N-1)*.5+(m===lastTrouble?90:0)-(PR[si][m].aff+PR[sj][m].aff)*40+rnd(-15,15);
    if(sc>bs){bs=sc;bk=m}}
  return bk;
}

function fire(i,j,cat){
  if(draining)return;
  const now=Date.now(),e=E[i];e.t=0;e.period=clamp(e.period*rnd(.88,1.16),12,36);
  if(j==null){
    const w=E.map((o,k)=>{if(k===i)return 0;const p=PR[i][k],dist=Math.hypot(o.x-e.x,o.y-e.y),near=clamp(1-dist/(Math.hypot(W,H)*.55),.1,1);
      return (.18+Math.abs(p.aff)*.65+p.rut*.55)*near*(k===lastSp?.3:1)*(grudge(i,k)?1.6:1)*(.4+.6*o.lv)});
    const s=w.reduce((a,b)=>a+b,0);let r=Math.random()*s;j=w.findIndex(x=>(r-=x)<=0);if(j<0||j===i)j=(i+1)%N;
  }
  const p=PR[i][j],a=p.aff,m=(p.rut>.38&&Math.random()<p.rut*.82)?'e':(a>.3?'w':a<-.3?'c':'m');
  const pl=PL[p.i+'-'+p.j],r=Math.random(),silP=.12+(1-E[j].lv)*.22;
  let si=i,sj=j,k=-1,x,y,z3=null,d=0,sil=0,tp=0,deep=0,topic=E[i].w;
  const nearDrop=drops.find(dr=>Math.hypot(dr.x-e.x,dr.y-e.y)<95),gr=grudge(i,j);
  if(cat==='ret'){x=fresh(V[si].ret);y=fresh(V[sj].r[m]);if(Math.random()<.65)z3=fresh(V[si].c3[m]);d=.06;tp=1}
  else if(e.lv<.28&&Math.random()<.6){x=fresh(V[si].lo);if(Math.random()<.5){y=UI.silence;sil=1}else y=fresh(V[sj].r[m])}
  else if(gr&&Math.random()<.35){topic=gr.w;deep=1;x=fresh(V[si].mm);
    if(recall(sj,si,topic)>.3){y=fresh(V[sj].mr1);d=a>.3?.03:-.05;if(Math.random()<.5)z3=fresh(V[si].c3[m])}
    else{y=fresh(V[sj].mr0);z3=fresh(V[si].mf);d=-.03}
    remember(si,sj,topic,.2);remember(sj,si,topic,.25);Sound.playBond()}
  else if(nearDrop&&Math.random()<.48){x=fresh(V[si].dr);y=fresh(V[sj].r[m]);if(Math.random()<.5)z3=fresh(V[i].c3[m]);d=nearDrop.kind==='warm'?.09:.06}
  else if(r<silP){x=fresh(V[i].o[m]);y=UI.silence;d=-.05;sil=1}
  else if(r<silP+.22&&pl&&p.i!==lastSp){const q=fresh(pl);si=p.i;sj=p.j;x=q[0];y=q[1];z3=q[2];d=q[3]}
  else if(r<silP+.42){x=fresh(V[i].tp);y=fresh(V[j].r[m]);if(Math.random()<.52)z3=fresh(V[i].c3[m]);d=rnd(-.08,.08);tp=1;
    remember(si,sj,topic,.35);remember(sj,si,topic,.35)}
  else if(r<silP+.56){k=pickGossipTarget(si,sj);x=V[i].g;y=fresh(V[j].r[m]);if(Math.random()<.4)z3=fresh(V[i].c3[m]);d=.06}
  else{x=fresh(V[i].o[m]);y=fresh(V[j].r[m]);if(Math.random()<.5)z3=fresh(V[i].c3[m]);
    d=m==='e'?rnd(-.06,.05):m==='w'?rnd(-.18,.08):m==='c'?rnd(-.08,.18):rnd(-.1,.1)}
  if(z3&&!deep&&E[si].lv<.35)z3=null;

  busy=now+(z3?4600:3100);lastSp=si;E[si].t=0;E[si].fat+=.06;
  const dtNow=new Date(),hhmm=String(dtNow.getHours()).padStart(2,'0')+':'+String(dtNow.getMinutes()).padStart(2,'0');
  const yName=k>=0?E[k].n:'',t1=fmtLine(x,E[sj].n,yName,topic),t2=fmtLine(y,E[sj].n,yName,topic),t3=z3?fmtLine(z3,E[sj].n,yName,topic):null;
  const echoEntry={time:hhmm,lines:[{i:si,text:t1,r:0}]};
  pushEcho(echoEntry);

  say(si,t1,0,m);
  later(()=>{
    if(draining)return;
    say(sj,t2,1,m);echoEntry.lines.push({i:sj,text:t2,r:1});renderEchoes();
    lastSp=sj;E[sj].fat+=.04;
    carve(p,d,deep);p.pulse=1;if(cat==='ret')p.flash=1;
    if(sil||d<=-.1)lastTrouble=sil?sj:si;
    if(!sil&&(tp||deep||p.aff>0||p.rut>.45||Math.random()<.42))E[sj].w=topic;
    if(Math.random()<.1)E[si].w=pick(TOP);
    E[sj].t=clamp(E[sj].t+8,15,65);E[si].speak=E[sj].speak=1;
    if(k>=0){const q=PR[sj][k];q.aff=clamp(q.aff-.12,-1,1);q.flash=1;lastTrouble=k}
    if(!sil&&t3){
      later(()=>{if(draining)return;say(si,t3,0,m);echoEntry.lines.push({i:si,text:t3,r:0});renderEchoes();E[si].speak=1;E[si].fat+=.03;lastSp=si;if(E[si].t>65)E[si].t=55},1450);
    }else if(!sil&&Math.random()<.26){
      const cand=[];for(let z=0;z<N;z++)if(z!==si&&z!==sj&&z!==k&&E[z].lv>.2)cand.push(z);
      if(cand.length){
        cand.sort((a,b)=>Math.hypot(E[a].x-E[si].x,E[a].y-E[si].y)-Math.hypot(E[b].x-E[si].x,E[b].y-E[si].y));
        const z=cand[0];if(tp&&Math.random()<.45)E[z].w=topic;busy=Date.now()+1800;
        later(()=>{if(draining)return;say(z,V[z].tic,0,m);echoEntry.lines.push({i:z,text:V[z].tic,r:0});renderEchoes();E[z].speak=1;lastSp=z;if(E[z].t>68)E[z].t=62},1150);
      }
    }
  },1700);
}

function step(dt){
  const tm=Date.now()/1000;
  const drainProg=draining?clamp((Date.now()-drainAt)/11500,0,1):0;
  const waterY=6+(H-10)*drainProg;

  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];b.age+=dt;b.y-=b.vy*dt;b.x+=Math.sin(tm*3+b.ph)*8*dt;
    if(b.y<=waterY+2||b.age>=b.maxAge)bubbles.splice(i,1);
  }
  motes.forEach(m=>{
    m.x+=(Math.sin(tm*.25+m.ph)*4+2*m.z)*dt;
    m.y+=Math.cos(tm*.19+m.ph*1.3)*3*dt;
    if(m.x<6)m.x=W-8;if(m.x>W-6)m.x=8;
    const minY=Math.min(H-14,waterY+6);
    if(m.y<minY)m.y=H-18;if(m.y>H-12)m.y=minY;
  });

  if(draining){
    E.forEach((e,i)=>{e.vx*=1-2.5*dt;e.vy*=1-2.5*dt;e.x=clamp(e.x+e.vx*dt,26,W-26);e.y=clamp(e.y+e.vy*dt,26,H-30);
      e.speak*=Math.pow(.25,dt);if(dead[i])fade[i]=Math.max(0,fade[i]-dt*.85)});
    P.forEach(p=>{p.pulse*=Math.pow(.2,dt);p.flash*=Math.pow(.2,dt)});
    return;
  }
  updateLevels(dt);decayMem(dt);
  const S=Math.min(W,H*1.35),cx=W/2,cy=H/2;
  const kAff=1-Math.exp(-dt/TAU_AFF),kBed=1-Math.exp(-dt/TAU_BED),kRut=Math.exp(-dt/TAU_RUT);
  for(let i=drops.length-1;i>=0;i--){const dr=drops[i];dr.age+=dt;
    dr.y=clamp(dr.y+Math.sin(tm*1.5+dr.seed)*2*dt,24,H-24);dr.x=clamp(dr.x+Math.cos(tm*1.2+dr.seed)*2*dt,24,W-24);
    if(dr.age>=dr.maxAge)drops.splice(i,1)}
  P.forEach(p=>{
    const a=E[p.i],b=E[p.j];let dx=b.x-a.x,dy=b.y-a.y;const d=Math.hypot(dx,dy)||1;
    const tg=S*(.16+.52*(1-p.aff)/2)*(1-p.rut*.52)+S*.26*p.rut*.52;
    const str=(p.aff>.25||p.rut>.45)?2.5:(d>S*.48?.65:1.5),f=(d-tg)*str*dt/d;
    a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f;
    p.aff=clamp(p.aff+(p.bed-p.aff)*kAff+rnd(-1,1)*.02*dt,-1,1);
    drops.forEach(dr=>{
      if(dr.kind==='warm'){
        const da=Math.hypot(a.x-dr.x,a.y-dr.y),db=Math.hypot(b.x-dr.x,b.y-dr.y);
        if(da<140&&db<140)p.aff=clamp(p.aff+.015*dt,-1,1);
      }
    });
    p.bed+=(p.aff-p.bed)*kBed;p.rut*=kRut;
    p.pulse*=Math.pow(.35,dt);p.flash*=Math.pow(.3,dt);
  });
  E.forEach((e,i)=>{
    const amp=.6+.4*e.lv;
    const wx=cx+(Math.sin(tm/9+e.ph)*W*.28+Math.cos(tm/21+i*2)*W*.1)*amp;
    const wy=cy+(Math.cos(tm/11+e.ph)*H*.28+Math.sin(tm/17+i*2)*H*.1)*amp;
    e.vx+=(wx-e.x)*(.25+.25*e.lv)*dt;e.vy+=(wy-e.y)*(.3+.25*e.lv)*dt;
    drops.forEach(dr=>{const dx=dr.x-e.x,dy=dr.y-e.y,dist=Math.hypot(dx,dy)||1;
      if(dist<260&&dr.age>.8){const pull=clamp(1-dist/260,0,1)*(1-dr.age/dr.maxAge)*26*(.4+.6*e.lv);
        e.vx+=dx/dist*pull*dt;e.vy+=dy/dist*pull*dt;if(dist<90)e.t+=dt*2.4}
      if(dr.kind==='clear'&&dist<140){
        e.fat=Math.max(0,e.fat-.04*dt);
        e.lv=clamp(e.lv+.02*dt,.05,1);
      }
    });
    e.vx*=1-1.85*dt;e.vy*=1-1.85*dt;
    e.x=clamp(e.x+e.vx*dt,26,W-26);e.y=clamp(e.y+e.vy*dt,26,H-30);
    const fr=E.reduce((s,o,k)=>k===i?s:s+Math.abs(PR[i][k].aff)+PR[i][k].rut*.4,0)/(N-1);
    e.t+=dt*100/e.period*(1+.4*fr)*(.45+.9*e.lv);e.speak*=Math.pow(.2,dt);
  });
  if(Date.now()>busy){
    if(ret){const p=ret.p;ret=null;fire(p.i,p.j,'ret')}
    else{const ready=E.map((e,i)=>[e.t,i]).filter(q=>q[0]>=100).sort((a,b)=>b[0]-a[0]);
      if(ready.length)fire(ready[0][1])}
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);ctx.lineCap='round';const tm=Date.now(),S=Math.min(W,H*1.35),maxD=S*.56;
  const lineFade=draining?clamp(1-(tm-drainAt)/3600,0,1):1;
  const drainProg=draining?clamp((tm-drainAt)/11500,0,1):0;
  const waterY=6+(H-10)*drainProg;
  const ph=getActivePhase(),pal=(isLight?PHASE_PAL.light:PHASE_PAL.dark)[ph];

  const rayCenters=[];
  for(let k=0;k<4;k++)rayCenters.push(W*(.16+k*.22)+Math.sin(tm/4200+k*1.7)*26);

  if(waterY<H-3){
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0,waterY);
    for(let x=0;x<=W;x+=24){
      const wy=waterY+Math.sin(x/42+tm/1100)*1.3+Math.cos(x/21-tm/800)*.7;
      ctx.lineTo(x,wy);
    }
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    ctx.clip();

    const wg=ctx.createLinearGradient(0,waterY,0,H);
    wg.addColorStop(0,pal.top);wg.addColorStop(1,pal.bot);
    ctx.fillStyle=wg;ctx.fillRect(0,waterY-3,W,H-waterY+3);

    const rayH=Math.max(40,(H-waterY)*.92);
    rayCenters.forEach((rx,k)=>{
      const w1=24+k*6,w2=w1*2.35,dx=rayH*pal.tilt;
      const rg=ctx.createLinearGradient(rx,waterY,rx+dx,waterY+rayH);
      rg.addColorStop(0,pal.ray);rg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rg;
      ctx.beginPath();
      ctx.moveTo(rx-w1*.5,waterY-2);
      ctx.lineTo(rx+w1*.5,waterY-2);
      ctx.lineTo(rx+dx+w2*.5,waterY+rayH);
      ctx.lineTo(rx+dx-w2*.5,waterY+rayH);
      ctx.closePath();ctx.fill();
    });

    ctx.strokeStyle=pal.surf;ctx.lineWidth=1;
    for(let c=0;c<3;c++){
      ctx.globalAlpha=pal.caustic*(.7+.3*Math.sin(tm/1700+c));
      ctx.beginPath();
      for(let x=0;x<=W;x+=20){
        const cy=waterY+12+c*11+Math.sin(x/34+tm/1300+c*2)*3.2;
        if(x===0)ctx.moveTo(x,cy);else ctx.lineTo(x,cy);
      }
      ctx.stroke();
    }

    ctx.fillStyle=pal.mote;
    motes.forEach(m=>{
      if(m.y<waterY+2)return;
      let glimmer=0;
      for(let k=0;k<4;k++){
        const dRay=Math.abs(m.x-(rayCenters[k]+(m.y-waterY)*pal.tilt));
        if(dRay<42)glimmer=Math.max(glimmer,1-dRay/42);
      }
      ctx.globalAlpha=(.18+.22*m.z+glimmer*.48)*(1-drainProg*.6)*(0.75+0.25*Math.sin(tm/900+m.ph));
      ctx.beginPath();ctx.arc(m.x,m.y,m.r*(1+glimmer*.35),0,7);ctx.fill();
    });
    ctx.restore();
  }

  if(waterY<H-4){
    ctx.save();
    ctx.strokeStyle=pal.surf;ctx.lineWidth=1.2;ctx.globalAlpha=1-drainProg*.5;
    ctx.beginPath();
    for(let x=0;x<=W;x+=16){
      let wy=waterY+Math.sin(x/42+tm/1100)*1.3+Math.cos(x/21-tm/800)*.7;
      drops.forEach(dr=>{if(dr.age<2.2){const dx=Math.abs(x-dr.x);if(dx<54)wy+=Math.sin(dx/5-dr.age*8)*(1-dr.age/2.2)*1.6}});
      if(x===0)ctx.moveTo(x,wy);else ctx.lineTo(x,wy);
    }
    ctx.stroke();
    ctx.restore();
  }

  const sedRich=clamp(total/80,.18,1),avgRut=P.reduce((s,p)=>s+p.rut,0)/P.length;
  ctx.save();
  ctx.fillStyle=pal.sed;
  for(let layer=0;layer<2;layer++){
    ctx.globalAlpha=(.48+.42*sedRich)*(layer===0?.65:.95)*(1+avgRut*.25);
    ctx.beginPath();
    ctx.moveTo(0,H);
    for(let x=0;x<=W;x+=24){
      const baseH=H-(layer===0?16:9)-sedRich*4;
      const sy=baseH+Math.sin(x/(layer===0?95:68)+layer*2.1)*4.5+Math.cos(x/43-layer)*2;
      ctx.lineTo(x,sy);
    }
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }
  ctx.restore();

  bubbles.forEach(b=>{
    const fadeB=1-b.age/b.maxAge;
    ctx.globalAlpha=.42*fadeB;
    ctx.strokeStyle=b.c||pal.mote;ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.stroke();
  });

  if(!draining){
    drops.forEach(dr=>{const life=1-dr.age/dr.maxAge;
      const dropCol=dr.kind==='warm'?(isLight?'#c86a46':'#f2aa82'):dr.kind==='clear'?(isLight?'#2b86ad':'#80d8f8'):(isLight?'#3b485e':'#eef2f8');
      const ripCol=dr.kind==='warm'?'#e5a27a':dr.kind==='clear'?'#7bc6e8':(isLight?'#5c6b82':'#dce0e8');
      if(dr.age<2.2){const rp=dr.age/2.2;ctx.globalAlpha=(1-rp)*(isLight?.44:.38);ctx.strokeStyle=ripCol;ctx.lineWidth=1;ctx.beginPath();ctx.arc(dr.x,dr.y,4+rp*44,0,7);ctx.stroke()}
      if(dr.kind!=='topic'){
        ctx.globalAlpha=.14*life*(.7+Math.sin(tm/450+dr.seed)*.3);ctx.strokeStyle=ripCol;ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(dr.x,dr.y,11+Math.sin(tm/550+dr.seed)*2.5,0,7);ctx.stroke();
      }
      ctx.globalAlpha=Math.min(1,life*1.2)*(isLight?.85:.78)*(.75+Math.sin(tm/350+dr.seed)*.25);ctx.fillStyle=dropCol;ctx.shadowColor=ripCol;ctx.shadowBlur=isLight?4:9;
      ctx.beginPath();ctx.arc(dr.x,dr.y,3,0,7);ctx.fill();ctx.shadowBlur=0});
  }

  if(lineFade>.01){
    P.forEach(p=>{
      const a=E[p.i],b=E[p.j],d=Math.hypot(b.x-a.x,b.y-a.y),df=clamp(1-(d-S*.24)/(maxD-S*.24),0,1);
      const bd=p.aff>.3&&df>.15,cd=p.aff<-.3&&df>.2,en=p.rut>.42&&df>.18;
      if(!draining&&bd!==p.bound){p.bound=bd;if(df>.2){p.flash=1;if(bd)Sound.playBond()}}
      const alpha=Math.min(1,(bd?(.18+.52*p.aff)*df:cd?(.1-.16*p.aff)*df:en?(.12+p.rut*.22)*df:(df>.45?.05*df:0))+p.pulse*.5+p.flash*.35)*lineFade*Math.min(fade[p.i],fade[p.j]);
      if(alpha<.012)return;
      const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,a.c);g.addColorStop(1,b.c);
      const w=Math.sin(tm/2500+p.i*3+p.j)*.12,mx=(a.x+b.x)/2+(b.y-a.y)*w,my=(a.y+b.y)/2-(b.x-a.x)*w;
      ctx.strokeStyle=g;ctx.setLineDash(cd?[2,6]:(en&&!bd)?[7,5]:[]);ctx.globalAlpha=alpha;
      ctx.lineWidth=(bd?.8+1.8*p.aff:en?.9+p.rut*.8:1)*Math.max(.5,df)+p.flash*1.8;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.stroke();
    });
  }
  ctx.setLineDash([]);

  E.forEach((e,i)=>{
    const fd=fade[i];if(fd<=.01)return;
    const tr=(!draining&&e.t>=84)?1.4:0,x=e.x+rnd(-tr,tr),y=e.y+rnd(-tr,tr)+(draining?(1-fd)*14:0);
    const haloR=10+8*e.lv+Math.sin(tm/900+e.ph)*1.5;
    const hg=ctx.createRadialGradient(x,y,1,x,y,haloR);
    hg.addColorStop(0,e.c);hg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.globalAlpha=(.15+.16*e.lv)*fd;ctx.fillStyle=hg;
    ctx.beginPath();ctx.arc(x,y,haloR,0,7);ctx.fill();

    if(e.speak>.02){
      ctx.globalAlpha=e.speak*.48*fd;ctx.strokeStyle=e.c;ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(x,y,6+(1-e.speak)*24,0,7);ctx.stroke();
      if(e.speak<.82){
        ctx.globalAlpha=e.speak*.26*fd;
        ctx.beginPath();ctx.arc(x,y,4+(1-e.speak)*36,0,7);ctx.stroke();
      }
    }

    ctx.globalAlpha=(.42+.58*e.lv)*fd;ctx.fillStyle=e.c;ctx.shadowColor=e.c;ctx.shadowBlur=(4+9*e.lv)*fd;
    ctx.beginPath();ctx.arc(x,y,tr?6:5,0,7);ctx.fill();ctx.shadowBlur=0;

    ctx.globalAlpha=.8*fd;ctx.fillStyle=sub;ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText(e.n,x,y+19);
    if(!draining&&(hoverChar===i||e.t>=80)){
      ctx.globalAlpha=(hoverChar===i?.66:.44)*fd;ctx.fillStyle=sub;ctx.font='9.5px sans-serif';
      ctx.fillText('['+e.w+']',x,y-13);
    }
  });
  ctx.globalAlpha=1;
}

function catchUp(sec){
  if(draining||sec<0)return;
  clearTimers();busy=0;
  Array.from(feed.children).forEach(el=>{el.classList.remove('show','latest');later(()=>el.remove(),500)});
  const M=Math.min(240,Math.max(1,Math.ceil(sec/600))),h=sec/M,ns=Math.min(1,Math.sqrt(h/600)),cnt=P.map(()=>0),before=P.map(p=>p.aff);
  for(let s=0;s<M;s++){
    P.forEach((p,k)=>{
      const rate=(.3+3*Math.pow(.5+.5*p.aff,2)+(grudge(p.i,p.j)||grudge(p.j,p.i)?1:0))/3600;
      const n=Math.min(20,Math.floor(rate*h+Math.random()));
      for(let c=0;c<n;c++){carve(p,rnd(-.12,.12),0);cnt[k]++;
        if(Math.random()<.25){const a=Math.random()<.5?p.i:p.j,b=a===p.i?p.j:p.i;E[b].w=E[a].w;remember(a,b,E[a].w,.3);remember(b,a,E[a].w,.3)}}
      p.aff=clamp(p.aff+(p.bed-p.aff)*(1-Math.exp(-h/TAU_AFF))+rnd(-.1,.1)*ns,-1,1);
      p.bed+=(p.aff-p.bed)*(1-Math.exp(-h/TAU_BED));p.rut*=Math.exp(-h/TAU_RUT);
    });
    decayMem(h);
  }
  E.forEach(e=>e.fat=0);
  let bi=0,best=-1;P.forEach((p,k)=>{const sc=cnt[k]+Math.abs(p.aff-before[k])*10;if(sc>best){best=sc;bi=k}});
  if(sec>=10){E.forEach(e=>e.t=rnd(20,60));ret={p:P[bi]};E[P[bi].i].t=96;E[P[bi].j].w=E[P[bi].i].w;lastSp=-1}
  settle();updateTankStatus();
}
function settle(){for(let s=0;s<80;s++)step(.05);E.forEach(e=>e.t=Math.min(e.t,96))}

function resize(){
  dpr=Math.min(2,devicePixelRatio||1);
  W=Math.max(120,(cv.parentElement?.clientWidth||innerWidth)-24);H=innerWidth<=520?330:380;
  cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const cs=getComputedStyle(document.documentElement);
  sub=cs.getPropertyValue('--sub').trim()||sub;
  isLight=cs.colorScheme==='light'||!!matchMedia?.('(prefers-color-scheme: light)').matches;
  if(!motes.length)initMotes();
}

// ===== Riverbed / Sediment View =====
const bars=[],cells=[];
E.forEach(e=>{const r=document.createElement('div');r.className='row';r.style.setProperty('--c',e.c);r.innerHTML='<i>'+e.n+'</i><div class="bar"><div></div></div><span></span>';$('rows').append(r);bars.push(r)});
(function(){const g=$('grid');g.append(document.createElement('span'));E.forEach(e=>{const s=document.createElement('span');s.textContent=e.n;s.style.color=e.c;g.append(s)});
  for(let i=0;i<N;i++){const s=document.createElement('span');s.textContent=E[i].n;s.style.color=E[i].c;g.append(s);
    for(let j=0;j<N;j++){const c=document.createElement('span');g.append(c);cells.push(c)}}})();
function grudgeList(){const L=[];E.forEach((e,i)=>e.mem.forEach(q=>{if(q.n>=3&&q.s>=.5)L.push(UI.grudgeFmt(e.n,E[q.j].n,q.w,q.n,recall(q.j,i,q.w)>.3))}));return L}
function xray(){
  E.forEach((e,i)=>{bars[i].querySelector('.bar div').style.width=Math.min(100,e.t)+'%';bars[i].querySelector('span').textContent=UI.lvText(e.lv,e.w)});
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const c=cells[i*N+j];if(i===j){c.textContent='·';c.className='';continue}
    const p=PR[i][j],a=p.aff,badge=p.bound?UI.badges.bound:p.rut>.42?UI.badges.rut:a<-.3?UI.badges.cold:'';
    c.textContent=Math.round(a*100)+badge;
    c.className=(p.bound?'bound ':'')+(p.rut>.42?'rut':'');
    c.title=UI.cellTitle(E[i].n,E[j].n,a,p.bed,p.rut);
    c.style.background=(a>0?'rgba(212,140,112,':'rgba(107,154,196,')+Math.abs(a)*.6+')'}
  const g=grudgeList();$('mems').textContent=g.length?UI.grudgeTitle+'\n'+g.join('\n'):UI.noGrudge;
  $('meta').textContent=UI.meta((Math.max(0,Date.now()-born)/MS_DAY+1)|0,total,P.filter(p=>p.rut>.42).length,P.filter(p=>p.bound).length,P.length);
}

// ===== Drain Ceremony & Relic JSON =====
function buildDrainScript(){
  const items=[];
  for(let i=0;i<N;i++){
    const e=E[i],set=LW[i];
    let key='d',other=-1,topic=e.w,score=e.mem.length*15;
    const gs=e.mem.filter(q=>q.n>=3&&q.s>=.5).sort((a,b)=>b.s-a.s);
    const unreq=gs.find(q=>recall(q.j,i,q.w)<=.3);
    const shared=gs.find(q=>recall(q.j,i,q.w)>.3);
    const fb=(i+1)%N;let maxRut=0,rutJ=fb,maxAbsBed=0,bedJ=fb,bedVal=0;
    for(let k=0;k<N;k++){if(k===i)continue;const p=PR[i][k];
      if(p.rut>maxRut){maxRut=p.rut;rutJ=k}
      if(Math.abs(p.bed)>maxAbsBed){maxAbsBed=Math.abs(p.bed);bedJ=k;bedVal=p.bed}}
    score+=maxRut*300+maxAbsBed*100;
    if(total<15){key='s'}
    else if(unreq){key='u';other=unreq.j;topic=unreq.w;score+=1000}
    else if(shared){key='m';other=shared.j;topic=shared.w;score+=600}
    else if(maxRut>=.42){key='r';other=rutJ;score+=350}
    else if(maxAbsBed>=.3){key=bedVal>0?'w':'c';other=bedJ;score+=120}
    const pair=pick(set[key]),xName=other>=0?E[other].n:UI.fallbackName;
    items.push({i,name:e.n,lines:[fmtLine(pair[0],xName,'',topic),fmtLine(pair[1],xName,'',topic)],score:score+rnd(0,5)});
  }
  return items.sort((a,b)=>a.score-b.score);
}

function buildRelicPayload(lw){
  const snap=snapshot();
  snap.drainedAt=new Date().toISOString();
  return LP.buildRelicPayload({E,P,born,MS_DAY,total,grudgeList,recall,snap,DEBUG},lw);
}

function downloadRelic(payload){
  try{
    const a=document.createElement('a'),d=new Date(),ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    a.download='latent-terrarium-'+ds+'.json';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),10000);
  }catch(e){}
}

function copyText(txt,cb){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>cb(true)).catch(()=>fallbackCopy(txt,cb));
  }else fallbackCopy(txt,cb);
}
function fallbackCopy(txt,cb){
  try{const ta=document.createElement('textarea');ta.value=txt;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;top:0;left:-9999px;opacity:0;font-size:16px';
    document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,txt.length);
    const ok=document.execCommand('copy');ta.remove();cb(ok)}catch(e){cb(false)}
}

function sayDrain(i,line1,line2,r){
  Array.from(feed.children).forEach(el=>el.classList.remove('latest'));
  const d=document.createElement('div');d.className='b'+(r?' r':'')+' latest';d.style.setProperty('--c',E[i].c);
  const n=document.createElement('b');n.textContent=E[i].n;
  const s1=document.createElement('span');s1.textContent=line1;
  const s2=document.createElement('span');s2.className='b2';s2.textContent=line2;
  d.append(n,s1,s2);feed.append(d);
  requestAnimationFrame(()=>d.classList.add('show'));
  Sound.playFarewell(i);
  later(()=>{s2.classList.add('show')},850);
}

function startDrain(){
  if(draining)return;
  if(!confirm(UI.confirmDrain))return;
  draining=true;noSave=true;clearTimers();drops=[];bubbles=[];drainAt=Date.now();
  Sound.playDrainStart();
  $('xray').classList.add('hidden');$('bX').textContent=UI.seeBed;
  $('bX').style.pointerEvents='none';$('bX').style.opacity='.35';$('bX').tabIndex=-1;
  $('dropBar').style.pointerEvents='none';$('dropBar').style.opacity='.4';
  Array.from(feed.children).forEach(el=>{el.classList.remove('show','latest');later(()=>el.remove(),480)});

  const lw=buildDrainScript(),payload=buildRelicPayload(lw);
  lw.forEach((item,idx)=>{
    const t0=700+idx*2200;
    later(()=>{E[item.i].speak=1;sayDrain(item.i,item.lines[0],item.lines[1],idx%2===1)},t0);
    later(()=>{dead[item.i]=1},t0+1650);
  });

  const endMs=700+4*2200+1650+3500;
  later(()=>{
    wipeStorage();
    downloadRelic(payload);
    feed.style.opacity='0';
    later(()=>{
      feed.innerHTML='';
      const ep=document.createElement('div');ep.className='epitaph';
      ep.innerHTML=`<div>${UI.epitaphText}</div><div class="epitaph-btns"><button id="bPick">${UI.btnPick}</button><button id="bCopy">${UI.btnCopy}</button><button id="bShare">${UI.btnShare}</button><button id="bFresh">${UI.btnFresh}</button></div>`;
      feed.appendChild(ep);feed.style.opacity='1';
      requestAnimationFrame(()=>ep.classList.add('show'));
      $('bPick').onclick=()=>downloadRelic(payload);
      $('bCopy').onclick=ev=>copyText(LP.buildStoryPromptText(payload),ok=>{
        ev.target.textContent=ok?UI.btnCopyOk:UI.btnCopyErr;
      });
      $('bShare').onclick=ev=>copyText(LP.buildShareText(payload,born,MS_DAY),ok=>{
        ev.target.textContent=ok?UI.btnShareOk:UI.btnShareErr;
      });
      $('bFresh').onclick=()=>location.reload();
    },600);
  },endMs);
}

// ===== Persistence (localStorage + IndexedDB) =====
function idbOp(mode,fn,done){
  let called=false,db=null;
  const end=()=>{if(db){try{db.close()}catch(e){}db=null}if(!called){called=true;done&&done()}};
  try{if(typeof indexedDB==='undefined')return end();const rq=indexedDB.open(DBN,1);
    rq.onupgradeneeded=()=>{if(!rq.result.objectStoreNames.contains('kv'))rq.result.createObjectStore('kv')};
    rq.onerror=end;rq.onblocked=end;
    rq.onsuccess=()=>{db=rq.result;try{const tx=db.transaction('kv',mode);tx.oncomplete=end;tx.onerror=end;tx.onabort=end;fn(tx.objectStore('kv'))}catch(e){end()}};
  }catch(e){end()}
}
function snapshot(){return{schema:SCHEMA,born,seen:Date.now(),total,reborn,
  p:P.map(p=>[+p.aff.toFixed(3),+p.bed.toFixed(3),+p.rut.toFixed(4),p.count]),
  e:E.map(e=>({per:+e.period.toFixed(1),w:e.w,ph2:+e.ph2.toFixed(3),mem:e.mem.map(q=>[q.w,q.j,q.n,+q.s.toFixed(3)])})),
  echoes:echoes.slice(0,8).map(ec=>({time:ec.time,lines:ec.lines.map(l=>({i:l.i,text:l.text,r:l.r?1:0}))}))}}
function apply(s){
  born=Number.isFinite(s.born)?s.born:Date.now();total=Number.isFinite(s.total)&&s.total>=0?s.total:0;reborn=Number.isFinite(s.reborn)&&s.reborn>=0?s.reborn:0;
  P.forEach((p,k)=>{p.aff=clamp(s.p[k][0],-1,1);p.bed=clamp(s.p[k][1],-1,1);p.rut=clamp(s.p[k][2],0,1);p.count=Math.max(0,s.p[k][3]|0);p.bound=p.aff>.3});
  s.e.forEach((q,i)=>{const e=E[i];e.period=Number.isFinite(q.per)?clamp(q.per,10,40):e.period;e.w=typeof q.w==='string'&&q.w?q.w:e.w;
    e.ph2=Number.isFinite(q.ph2)?q.ph2:e.ph2;
    e.mem=Array.isArray(q.mem)?q.mem.filter(m=>Array.isArray(m)&&typeof m[0]==='string'&&Number.isInteger(m[1])&&m[1]>=0&&m[1]<N&&m[1]!==i&&Number.isFinite(m[2])&&Number.isFinite(m[3])).map(([w,j,n,sv])=>({w,j,n:Math.max(1,n|0),s:clamp(sv,0,1)})):[]});
  if(Array.isArray(s.echoes)){
    echoes=s.echoes.slice(0,8).filter(ec=>ec&&typeof ec.time==='string'&&Array.isArray(ec.lines))
      .map(ec=>({time:ec.time,lines:ec.lines.filter(l=>l&&Number.isInteger(l.i)&&l.i>=0&&l.i<N&&typeof l.text==='string').map(l=>({i:l.i,text:l.text,r:l.r?1:0}))}))
      .filter(ec=>ec.lines.length>0);
    renderEchoes();
  }
}
const valid=s=>Boolean(s&&(s.schema===5||s.schema===SCHEMA)&&Array.isArray(s.p)&&s.p.length===P.length&&s.p.every(x=>Array.isArray(x)&&x.length>=4&&x.slice(0,4).every(Number.isFinite))&&Array.isArray(s.e)&&s.e.length===N&&s.e.every(x=>x&&typeof x==='object'));
function save(){if(noSave||draining||loading)return;const s=snapshot();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}idbOp('readwrite',st=>st.put(s,KEY))}
function wipeStorage(){try{localStorage.removeItem(KEY)}catch(e){}idbOp('readwrite',st=>st.delete(KEY))}
function load(){
  let s=null;try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(valid(s)){apply(s);const sec=Number.isFinite(s.seen)?Math.max(0,(Date.now()-s.seen)/1000):0;if(sec>=10)catchUp(sec);else settle()}
  else{
    settle();
    if(typeof indexedDB!=='undefined'){
      loading=true;
      let db=null,doneCalled=false;
      const timer=setTimeout(()=>done(),3000);
      function done(){if(doneCalled)return;doneCalled=true;clearTimeout(timer);if(db){try{db.close()}catch(e){}db=null}loading=false}
      try{
        const rq=indexedDB.open(DBN,1);
        rq.onupgradeneeded=()=>{if(!rq.result.objectStoreNames.contains('kv'))rq.result.createObjectStore('kv')};
        rq.onerror=done;rq.onblocked=done;
        rq.onsuccess=()=>{
          db=rq.result;
          try{
            const tx=db.transaction('kv','readonly');
            tx.onerror=done;tx.onabort=done;
            const r=tx.objectStore('kv').get(KEY);
            r.onerror=done;
            r.onsuccess=()=>{
              const bk=r.result;
              if(!draining&&!noSave&&total===0&&valid(bk)){
                clearTimers();busy=0;feed.innerHTML='';apply(bk);
                const sec=Number.isFinite(bk.seen)?Math.max(0,(Date.now()-bk.seen)/1000):0;
                if(sec>=10)catchUp(sec);else settle();
              }
              done();
            };
          }catch(e){done()}
        };
      }catch(e){done()}
    }
  }
}

$('bExp').onclick=()=>downloadRelic(buildRelicPayload(buildDrainScript()));
$('bImp').onclick=()=>$('fImp').click();
$('fImp').onchange=ev=>{const f=ev.target.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(String(rd.result).replace(/^\uFEFF/,'')),s=d['地層_復元用']||d.stratum_restore||d.state||d;if(!valid(s))throw 0;
    if(!confirm(UI.confirmImport))return;
    s.seen=Date.now();s.reborn=(s.reborn||0)+1;noSave=true;
    try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}
    let done=false;const go=()=>{if(!done){done=true;location.reload()}};
    idbOp('readwrite',st=>st.put(s,KEY),go);setTimeout(go,450)}catch(e){alert(UI.importErr)}};
  rd.readAsText(f);ev.target.value=''};
$('bRst').onclick=startDrain;

if(DEBUG){$('bExp').classList.remove('hidden');$('bD1').classList.remove('hidden');$('bD2').classList.remove('hidden');
  $('bD1').onclick=()=>{born-=3*3600*1000;catchUp(3*3600);xray();save()};
  $('bD2').onclick=()=>{born-=MS_DAY;catchUp(DAY);xray();save()}}

const INAPP=/Twitter|X-Client|Line\/|Instagram|FBAN|FBAV|Reddit/i.test(navigator.userAgent||'')||/[?&]inapp=1/.test(location.search);
if(INAPP){
  $('bExp').classList.remove('hidden');
  try{if(sessionStorage.getItem('lt_inapp_dim')!=='1')$('inappNote').classList.remove('hidden')}
  catch(e){$('inappNote').classList.remove('hidden')}
}
$('bInappClose').onclick=()=>{
  $('inappNote').classList.add('hidden');
  try{sessionStorage.setItem('lt_inapp_dim','1')}catch(e){}
};

function bindBtn(el,fn){
  el.onclick=fn;
  el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn()}};
}
const toggleX=()=>{if(draining)return;const h=$('xray').classList.toggle('hidden');$('bX').textContent=h?UI.seeBed:UI.hideBed;if(!h){xray();renderEchoes()}};
bindBtn($('bX'),toggleX);
bindBtn($('bSnd'),()=>Sound.setEnabled(!Sound.isEnabled()));
bindBtn($('bLit'),()=>{
  litMode=LIT_ORDER[(LIT_ORDER.indexOf(litMode)+1)%LIT_ORDER.length];
  try{localStorage.setItem(LIT_KEY,litMode)}catch(e){}
  updateLitUI();
});

document.querySelectorAll('.pill[data-drop]').forEach(btn=>{
  btn.onclick=()=>{
    dropKind=btn.dataset.drop||'topic';
    document.querySelectorAll('.pill[data-drop]').forEach(b=>b.classList.toggle('active',b===btn));
  };
});

let persisted=false;
function reqPersist(){if(persisted)return;persisted=true;try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}}

function spawnDroplet(x,y,kind){
  if(drops.length>=2)drops.shift();
  const dr={x,y,age:0,maxAge:22,seed:rnd(0,6.28),topic:pick(TOP),kind:kind||'topic'};
  drops.push(dr);
  E.forEach(e=>{const dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy)||1;
    if(d<90){e.vx+=dx/d*18;e.vy+=dy/d*18;if(dr.kind==='topic')e.w=dr.topic}});
  const col=dr.kind==='warm'?'#e5a27a':dr.kind==='clear'?'#7bc6e8':null;
  spawnBubbles(x,y,3,col);
  Sound.playDrop((x/W)*2-1,y/H,dr.kind);
  updateTankStatus();
}

cv.addEventListener('pointerdown',ev=>{
  if(draining)return;
  reqPersist();Sound.unlock();
  const rect=cv.getBoundingClientRect(),sx=W/(rect.width||W),sy=H/(rect.height||H);
  const x=clamp((ev.clientX-rect.left)*sx,24,W-24),y=clamp((ev.clientY-rect.top)*sy,24,H-24);
  spawnDroplet(x,y,dropKind);
  clearTimeout(holdTid);holdTriggered=false;
  holdTid=setTimeout(()=>{
    if(draining)return;
    holdTriggered=true;
    spawnDroplet(x,y,'warm');
  },460);
});
const endHold=()=>{clearTimeout(holdTid);holdTriggered=false};
cv.addEventListener('pointerup',endHold);
cv.addEventListener('pointercancel',endHold);
cv.addEventListener('pointermove',ev=>{
  const rect=cv.getBoundingClientRect(),sx=W/(rect.width||W),sy=H/(rect.height||H);
  hoverX=(ev.clientX-rect.left)*sx;hoverY=(ev.clientY-rect.top)*sy;
  let bi=-1,bd=38;
  E.forEach((e,i)=>{const d=Math.hypot(e.x-hoverX,e.y-hoverY);if(d<bd){bd=d;bi=i}});
  hoverChar=bi;
});
cv.addEventListener('pointerleave',()=>{hoverX=-1;hoverY=-1;hoverChar=-1;endHold()});
document.addEventListener('keydown',()=>Sound.unlock(),{once:true});

resize();E.forEach((e,i)=>{const a=i/N*Math.PI*2;e.x=W/2+Math.cos(a)*W*.3;e.y=H/2+Math.sin(a)*H*.32});
Sound.updateBtn();updateLitUI();load();reqPersist();renderEchoes();updateTankStatus();
addEventListener('resize',resize);
const mq=matchMedia?.('(prefers-color-scheme: light)');mq?.addEventListener?mq.addEventListener('change',()=>setTimeout(resize,50)):mq?.addListener?.(()=>setTimeout(resize,50));
addEventListener('pagehide',save);
addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{
  const vis=document.visibilityState==='visible';
  Sound.onVisibility(vis);
  if(!vis)save();else updateLitUI();
});
let last=performance.now(),sv=last,xr=last;
function frame(now){
  const raw=(now-last)/1000;last=now;
  if(raw>10&&!draining)catchUp(raw);
  step(Math.min(.05,raw));draw();
  if(now-xr>250){xr=now;updateTankStatus();if(!$('xray').classList.contains('hidden'))xray()}
  if(now-sv>2000){sv=now;save()}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol)){
  navigator.serviceWorker.register(LP.swPath||'./sw.js').catch(()=>{});
}
})();
