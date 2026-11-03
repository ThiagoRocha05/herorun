const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)];
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nap=ms=>new Promise(r=>setTimeout(r,ms));
let S=null,EPOCH=0;
const sleep=async ms=>{const e=EPOCH;await nap(ms);if(e!==EPOCH)throw new Error('dead');};
const HIST=[];
const say=t=>{HIST.push(t);if(HIST.length>3)HIST.shift();$('#log').innerHTML=HIST.map((x,i)=>`<div${i===HIST.length-1?' class="cur"':''}>${esc(x)}</div>`).join('');const w=$('#bnWhat');if(w)w.textContent=t;};

/* som: sintetizador próprio (efeitos por casa + música de fundo) */
let AC=null,SND=true,MUS=true,MG=null,MG2=null;
function ac(){if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.9;MG.connect(AC.destination);MG2=AC.createGain();MG2.gain.value=.5;MG2.connect(MG);}if(AC.state==='suspended')AC.resume();return AC;}
function tone(f,d=.15,t='square',v=.05,at=0,to=null){if(!SND)return;try{const a=ac(),T=a.currentTime+at,o=a.createOscillator(),g=a.createGain();o.type=t;o.frequency.setValueAtTime(f,T);if(to)o.frequency.exponentialRampToValueAtTime(to,T+d);g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+Math.min(.02,d/3));g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(MG);o.start(T);o.stop(T+d+.03);}catch(e){}}
function noise(d=.2,v=.05,f=1200,at=0,to=null,q=1){if(!SND)return;try{const a=ac(),T=a.currentTime+at,n=Math.max(1,Math.floor(a.sampleRate*d)),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f,T);if(to)fl.frequency.exponentialRampToValueAtTime(to,T+d);const g=a.createGain();g.gain.setValueAtTime(v,T);g.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(fl);fl.connect(g);g.connect(MG);s.start(T);}catch(e){}}
const beep=(f=440,d=.12,t='square',v=.05)=>tone(f,d,t,v);
const seqb=(a,t='triangle',gap=110,d=.14,v=.05)=>a.forEach((f,i)=>tone(f,d,t,v,i*gap/1000));
const sfx={
 step:()=>{tone(520+rnd(5)*30,.07,'triangle',.06);},
 roll:()=>{for(let i=0;i<9;i++){noise(.05,.06,1800+rnd(1200),i*.075,null,2);tone(180+rnd(120),.05,'square',.025,i*.075);}},
 good:()=>{[523,659,784,1046].forEach((f,i)=>{tone(f,.2,'triangle',.07,i*.08);tone(f*2,.12,'sine',.025,i*.08);});},
 bad:()=>{tone(330,.35,'sawtooth',.06,0,160);tone(247,.4,'square',.04,.12,110);},
 power:()=>{tone(300,.5,'sawtooth',.05,0,1200);[523,659,784,1046].forEach((f,i)=>tone(f,.16,'square',.05,.12+i*.07));noise(.4,.04,3000,0,6000,1);},
 win:()=>{[[523,0],[523,.13],[523,.26],[659,.42],[784,.62],[659,.82],[784,.98],[1046,1.2]].forEach(([f,t])=>{tone(f,.28,'square',.05,t);tone(f/2,.28,'triangle',.06,t);});},
 hit:()=>{noise(.2,.14,300,0,80,1);tone(140,.22,'sawtooth',.09,0,50);},
 freeze:()=>{[1568,1319,1175,988,784,659].forEach((f,i)=>tone(f,.22,'sine',.05,i*.06));},
 swap:()=>{tone(400,.25,'triangle',.06,0,900);tone(900,.25,'triangle',.06,.12,400);},
 spin:()=>{for(let i=0;i<30;i++){tone(1000,.03,'square',.035,3.9*(1-Math.pow(1-i/30,1.9)));}},
 card:()=>{noise(.25,.05,500,0,3500,1);tone(740,.09,'square',.04,.05);tone(988,.16,'square',.04,.14);},
 land:k=>{const f=({
  puzzle:()=>{[392,523,659].forEach((n,i)=>tone(n,.13,'triangle',.07,.05+i*.12));tone(740,.35,'sine',.06,.45);},
  villain:()=>{tone(110,.7,'sawtooth',.08,0,70);tone(116,.7,'sawtooth',.06,0,74);tone(55,.8,'square',.05,.05);},
  gift:()=>{[1046,1318,1568,2093,1568,2093].forEach((n,i)=>tone(n,.13,'sine',.05,i*.06));},
  wheel:()=>{for(let i=0;i<8;i++)tone(1000,.03,'square',.04,i*.07);},
  duel:()=>{noise(.12,.1,4000,0,1500,3);tone(880,.35,'triangle',.05,.02,700);noise(.12,.1,4000,.18,1500,3);tone(1175,.3,'triangle',.05,.2,900);},
  energy:()=>{tone(250,.4,'sawtooth',.05,0,1500);tone(1500,.18,'square',.05,.4);},
  turbo:()=>{noise(.5,.08,400,0,5000,1);tone(200,.5,'sawtooth',.04,0,800);},
  portal:()=>{tone(300,.7,'sine',.08,0,1400);tone(1400,.5,'sine',.06,.3,300);noise(.6,.03,2000,0,300,1);},
  exit:()=>{tone(1400,.6,'sine',.07,0,300);noise(.5,.03,300,0,2000,1);},
  plain:()=>tone(440,.07,'sine',.04)
 })[k];if(f)f();}
};
/* música de fundo: arpejo alegre em loop, agendado com antecedência */
const music={tm:null,next:0,step:0,
 PROG:[[0,[0,4,7]],[-3,[0,3,7]],[-7,[0,4,7]],[-5,[0,4,7]]],
 midi:n=>261.63*Math.pow(2,n/12),
 mt(f,d,t,v,T){try{const a=AC,o=a.createOscillator(),g=a.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+.02);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(MG2);o.start(T);o.stop(T+d+.03);}catch(e){}},
 mstep(T,s){const bar=Math.floor(s/8)%4,i=s%8,[root,ch]=this.PROG[bar],m=this.midi;
  if(i%4===0)this.mt(m(root-12),.34,'triangle',.09,T);
  this.mt(m(root+ch[[0,1,2,1,2,1,0,1][i]]+12),.16,'square',.025,T);
  if(i===0||i===4)this.mt(m(root+ch[2]+24),.3,'sine',.04,T);
  if(i%2===1){try{const a=AC,n=Math.floor(a.sampleRate*.03),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let k=0;k<n;k++)x[k]=Math.random()*2-1;const sr=a.createBufferSource();sr.buffer=b;const fl=a.createBiquadFilter();fl.type='highpass';fl.frequency.value=6000;const g=a.createGain();g.gain.value=.03;sr.connect(fl);fl.connect(g);g.connect(MG2);sr.start(T);}catch(e){}}},
 start(){if(!SND||!MUS||this.tm)return;try{ac();}catch(e){return;}this.next=AC.currentTime+.1;this.tm=setInterval(()=>{if(!AC)return;while(this.next<AC.currentTime+.4){this.mstep(this.next,this.step++);this.next+=.2;}},90);},
 stop(){clearInterval(this.tm);this.tm=null;}
};

/* heróis (todos originais) */
const HEROES=[
 {id:'fagulha',name:'Centelha',g:'f',color:'#ff9f1c',cape:'#c1121f',ink:'#0d1130',skin:'#c68642',hairc:'#2b1a12',hair:'ponytail',sym:'bolt',power:'Super Velocidade',desc:'O próximo dado vale +3 casas.',cd:3},
 {id:'granito',name:'Titã',g:'m',color:'#ff4d5e',cape:'#7a1f2b',ink:'#fff',skin:'#8d5524',hairc:'#111',hair:'short',sym:'diamond',power:'Soco Gigante',desc:'Um rival à sua escolha volta 4 casas.',cd:4},
 {id:'pluma',name:'Alada',g:'f',color:'#4ca3ff',cape:'#e8f1ff',ink:'#fff',skin:'#ffdbac',hairc:'#f2c14e',hair:'long',sym:'wing',power:'Voo Livre',desc:'No lugar do dado, voa 6 casas.',cd:4},
 {id:'nevasco',name:'Boreal',g:'m',color:'#2ee6d6',cape:'#1b6f8a',ink:'#0d1130',skin:'#f1c27d',hairc:'#e8f4ff',hair:'spiky',sym:'snow',power:'Rajada de Gelo',desc:'Um rival à sua escolha perde a próxima vez.',cd:4},
 {id:'luma',name:'Lumina',g:'f',color:'#ffd23f',cape:'#8a6bff',ink:'#0d1130',skin:'#b9794b',hairc:'#1a1a2e',hair:'afro',sym:'sun',power:'Escudo de Luz',desc:'Protege contra vilões e ataques por 3 jogadas.',cd:4},
 {id:'trovao',name:'Volt',g:'m',color:'#8a6bff',cape:'#3b2a8c',ink:'#fff',skin:'#e0ac69',hairc:'#7a4a21',hair:'short',sym:'twin',power:'Raio Duplo',desc:'Rola dois dados e soma os dois.',cd:3},
 {id:'mira',name:'Orácula',g:'f',color:'#ff6fb5',cape:'#7a2a5a',ink:'#fff',skin:'#ffdbac',hairc:'#6b2d8c',hair:'bun',sym:'eye',power:'Mente Mestra',desc:'Escolhe o número do dado, de 1 a 6.',cd:4},
 {id:'gravito',name:'Vórtex',g:'m',color:'#4cd964',cape:'#1d6b34',ink:'#0d1130',skin:'#d9a066',hairc:'#222',hair:'spiky',sym:'magnet',power:'Campo Magnético',desc:'Todos os rivais voltam 2 casas.',cd:5}
];
const PCOL=['#ff4d5e','#4ca3ff','#4cd964','#ffd23f'];
const SYM={
 bolt:'<polygon points="3,-11 -7,1 -1.5,1 -4,11 7,-2 1.5,-2"/>',
 diamond:'<polygon points="0,-11 10,0 0,11 -10,0"/>',
 wing:'<path d="M-11,6L-3,-9L0,-1L3,-9L11,6L0,2Z"/>',
 snow:'<path d="M0-10V10M-8.7-5L8.7 5M-8.7 5L8.7-5" stroke="@I" stroke-width="2.6" stroke-linecap="round" fill="none"/>',
 sun:'<circle r="4.6"/><path d="M0-11V-7.5M0 7.5V11M-11 0H-7.5M7.5 0H11M-7.8-7.8l2.3 2.3M5.5 5.5l2.3 2.3M7.8-7.8l-2.3 2.3M-5.5 5.5l-2.3 2.3" stroke="@I" stroke-width="2.2" stroke-linecap="round" fill="none"/>',
 twin:'<polygon points="-2,-11 -9,0 -4.5,0 -6.5,10 1,-2 -3,-2"/><polygon points="4,-9 -1,0 3,0 1.5,9 9,-1 5,-1"/>',
 eye:'<ellipse rx="11" ry="6.5"/><circle r="3.4" fill="@C"/>',
 magnet:'<path d="M-9-9V2a9 9 0 0 0 18 0V-9H4V2a4 4 0 0 1-8 0V-9Z"/>'
};
const HAIR={
 short:{b:'',f:'<path d="M24 40Q23 13 50 13Q77 13 76 40Q68 24 50 24Q32 24 24 40Z"/>'},
 spiky:{b:'',f:'<path d="M23 40L24 11L34 24L40 4L50 20L60 4L66 24L76 11L77 40Q68 26 50 26Q32 26 23 40Z"/>'},
 long:{b:'<path d="M23 40Q17 84 33 90L67 90Q83 84 77 40Z"/>',f:'<path d="M23 42Q21 10 50 10Q79 10 77 42Q67 23 50 23Q33 23 23 42Z"/>'},
 ponytail:{b:'<path d="M72 24Q100 26 92 60Q88 44 74 40Z"/>',f:'<path d="M24 40Q23 13 50 13Q77 13 76 40Q68 24 50 24Q32 24 24 40Z"/>'},
 bun:{b:'<circle cx="50" cy="7" r="11"/>',f:'<path d="M24 40Q23 14 50 14Q77 14 76 40Q68 25 50 25Q32 25 24 40Z"/>'},
 afro:{b:'<circle cx="50" cy="33" r="32"/>',f:'<path d="M27 38Q29 18 50 18Q71 18 73 38Q65 28 50 28Q35 28 27 38Z"/>'}
};
function heroSVG(h,tok){
 const hs=HAIR[h.hair],sym=(SYM[h.sym]||'').replace(/@I/g,h.ink).replace(/@C/g,h.color);
 const K='#0d1130';
 const irisC=h.color==='#0d1130'?'#4ca3ff':h.color;
 /* pontilhado de quadrinho: linhas de pontos redondos */
 const dots=(pts,c='rgba(0,0,0,.32)',w=1.5,gap=3)=>pts.map(([x1,y,x2])=>`<path d="M${x1} ${y}H${x2}" stroke="${c}" stroke-width="${w}" stroke-dasharray="0 ${gap}" stroke-linecap="round" fill="none"/>`).join('');
 let rays='';for(let k=0;k<12;k++){const a=k*30*Math.PI/180,b=6*Math.PI/180;rays+=`<polygon points="50,52 ${(50+90*Math.cos(a-b)).toFixed(1)},${(52+90*Math.sin(a-b)).toFixed(1)} ${(50+90*Math.cos(a+b)).toFixed(1)},${(52+90*Math.sin(a+b)).toFixed(1)}"/>`;}
 const brow=h.g==='f'
  ?`<path d="M32 32Q39 28 45 31.5M55 31.5Q61 28 68 32" stroke="${K}" stroke-width="3.4" stroke-linecap="round" fill="none"/><path d="M33 32.4Q39 29 44.5 32M55.5 32Q61 29 67 32.4" stroke="${h.hairc}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`
  :`<path d="M31 34Q39 29 46 32.5M54 32.5Q61 29 69 34" stroke="${K}" stroke-width="4.6" stroke-linecap="round" fill="none"/><path d="M32.5 34Q39 30.4 45 32.6M55 32.6Q61 30.4 67.5 34" stroke="${h.hairc}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
 return `<svg viewBox="${tok?'12 5 76 84':'0 0 100 100'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`+
  /* fundo: brilho de cor, raios e anel pontilhado */
  `<circle cx="50" cy="50" r="62" fill="${h.color}" opacity=".30"/>`+
  `<g fill="rgba(255,255,255,.13)">${rays}</g>`+
  `<circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-dasharray="0 4.4" stroke-linecap="round"/>`+
  /* capa: forro escuro, corpo, dobras e luz */
  `<path d="M8 100L20 62Q50 46 80 62L92 100Z" fill="${h.cape}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`+
  `<path d="M8 100L20 62Q26 70 30 100Z" fill="rgba(0,0,0,.35)"/><path d="M92 100L80 62Q74 70 70 100Z" fill="rgba(0,0,0,.35)"/>`+
  `<path d="M20 62Q50 46 80 62L77 70Q50 55 23 70Z" fill="rgba(255,255,255,.26)"/>`+
  `<path d="M36 74L32 100M64 74L68 100" stroke="${K}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`+
  /* tronco: ombros fortes, sombra lateral e brilho de borda */
  `<path d="M14 100Q16 70 50 66Q84 70 86 100Z" fill="${h.color}" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`+
  `<path d="M86 100Q84 70 50 66Q74 72 72 100Z" fill="rgba(0,0,0,.22)"/>`+
  dots([[60,80,82],[62,85,84],[64,90,84],[66,95,85]],'rgba(0,0,0,.4)',1.5,3.2)+
  `<path d="M20 90Q22 76 36 70" stroke="rgba(255,255,255,.55)" stroke-width="2.4" fill="none" stroke-linecap="round"/>`+
  `<path d="M38 68Q50 78 62 68" fill="none" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`+
  /* escudo do peito */
  `<path d="M50 71L61 75V85Q61 94 50 99Q39 94 39 85V75Z" fill="${h.color}" stroke="${K}" stroke-width="2.8" stroke-linejoin="round"/>`+
  `<path d="M50 74L58 77V85Q58 91 50 95Q42 91 42 85V77Z" fill="rgba(255,255,255,.18)"/>`+
  `<g transform="translate(50 85) scale(.46)" fill="${h.ink}" stroke="${K}" stroke-width="1.2">${sym}</g>`+
  /* pescoço */
  `<path d="M42 62H58V72Q50 77 42 72Z" fill="${h.skin}" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/>`+
  `<path d="M42 70Q50 75 58 70L58 66Q50 71 42 66Z" fill="rgba(0,0,0,.18)"/>`+
  /* cabelo de trás com contorno */
  `<g fill="${h.hairc}" stroke="${K}" stroke-width="2.6" stroke-linejoin="round">${hs.b}</g>`+
  /* cabeça com tinta grossa */
  `<circle cx="50" cy="40" r="28.5" fill="${K}"/>`+
  `<circle cx="50" cy="40" r="26" fill="${h.skin}"/>`+
  /* sombra cel + pontinhos do lado direito */
  `<path d="M50 14A26 26 0 0 1 50 66A15 26 0 0 0 50 14Z" fill="rgba(0,0,0,.17)"/>`+
  dots([[66,36,74],[68,41,75],[68,46,74],[66,51,72],[62,56,69]],'rgba(0,0,0,.3)',1.3,3)+
  `<ellipse cx="50" cy="58" rx="15" ry="5" fill="rgba(0,0,0,.12)"/>`+
  `<ellipse cx="40" cy="27" rx="9" ry="5" fill="rgba(255,255,255,.34)" transform="rotate(-20 40 27)"/>`+
  /* cabelo da frente com contorno e mecha de brilho */
  `<g fill="${h.hairc}" stroke="${K}" stroke-width="2.6" stroke-linejoin="round">${hs.f}</g>`+
  `<path d="M34 25Q42 17 55 18" stroke="rgba(255,255,255,.6)" stroke-width="2.6" fill="none" stroke-linecap="round"/>`+
  `<path d="M60 20Q66 22 69 28" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none" stroke-linecap="round"/>`+
  /* máscara */
  `<path d="M25 36Q50 21 75 36L73 48Q62 42 50 47Q38 42 27 48Z" fill="${h.color}" stroke="${K}" stroke-width="2.6" stroke-linejoin="round"/>`+
  `<path d="M27 37Q50 24 73 37" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none" stroke-linecap="round"/>`+
  brow+
  /* olhos grandes de HQ: cílio superior grosso, íris, brilho duplo */
  `<ellipse cx="38" cy="40.5" rx="6.6" ry="5.4" fill="#fff" stroke="${K}" stroke-width="1.8"/>`+
  `<ellipse cx="62" cy="40.5" rx="6.6" ry="5.4" fill="#fff" stroke="${K}" stroke-width="1.8"/>`+
  `<circle cx="38.8" cy="41.2" r="4.2" fill="${irisC}"/><circle cx="62.8" cy="41.2" r="4.2" fill="${irisC}"/>`+
  `<circle cx="39" cy="41.4" r="2.2" fill="${K}"/><circle cx="63" cy="41.4" r="2.2" fill="${K}"/>`+
  `<circle cx="40.6" cy="39.6" r="1.4" fill="#fff"/><circle cx="64.6" cy="39.6" r="1.4" fill="#fff"/>`+
  `<circle cx="37.6" cy="43" r=".8" fill="#fff" opacity=".8"/><circle cx="61.6" cy="43" r=".8" fill="#fff" opacity=".8"/>`+
  `<path d="M30.6 38.6Q38 33.6 45.2 38.4M54.8 38.4Q62 33.6 69.4 38.6" stroke="${K}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`+
  /* nariz, bochechas e boca */
  `<path d="M49.4 44.6Q47.8 49 51.2 49.2" stroke="rgba(0,0,0,.5)" stroke-width="1.6" stroke-linecap="round" fill="none"/>`+
  `<ellipse cx="29" cy="49" rx="5.6" ry="3" fill="#ff7a7a" opacity=".42"/><ellipse cx="71" cy="49" rx="5.6" ry="3" fill="#ff7a7a" opacity=".42"/>`+
  `<path d="M40.5 53Q50 64 59.5 53Z" fill="#6b1d2a" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>`+
  `<path d="M43 53.4Q50 57 57 53.4V55Q50 58.4 43 55Z" fill="#fff"/>`+
  `</svg>`;
}

/* vilões (todos originais): retratos em vetor para o cartão do vilão */
const VILLAINS=['Dr. Sombra','Capitão Caos','Madame Gelatina','Rei Bagunça','Professor Pegadinha'];
function villainSVG(i){
 const K='#0d1130';
 let rays='';for(let k=0;k<12;k++){const a=k*30*Math.PI/180,b=6*Math.PI/180;rays+=`<polygon points="50,52 ${(50+90*Math.cos(a-b)).toFixed(1)},${(52+90*Math.sin(a-b)).toFixed(1)} ${(50+90*Math.cos(a+b)).toFixed(1)},${(52+90*Math.sin(a+b)).toFixed(1)}"/>`;}
 const bg=`<circle cx="50" cy="50" r="62" fill="#ff4d5e" opacity=".32"/><g fill="rgba(255,255,255,.12)">${rays}</g>`;
 const A=[
  /* Dr. Sombra: capuz roxo, rosto vazio, olhos brilhantes */
  `<path d="M12 100Q8 36 50 10Q92 36 88 100Z" fill="#3b2380" stroke="${K}" stroke-width="3.2" stroke-linejoin="round"/><path d="M12 100Q8 36 50 10" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="50" cy="54" rx="26" ry="29" fill="#120a2e" stroke="${K}" stroke-width="3"/><ellipse cx="39" cy="50" rx="8" ry="5.2" fill="#ffd23f" stroke="${K}" stroke-width="1.6" transform="rotate(-16 39 50)"/><ellipse cx="61" cy="50" rx="8" ry="5.2" fill="#ffd23f" stroke="${K}" stroke-width="1.6" transform="rotate(16 61 50)"/><circle cx="40" cy="51" r="2.6" fill="${K}"/><circle cx="60" cy="51" r="2.6" fill="${K}"/><circle cx="41.4" cy="49.6" r="1" fill="#fff"/><circle cx="61.4" cy="49.6" r="1" fill="#fff"/><path d="M28 40L46 46M72 40L54 46" stroke="${K}" stroke-width="4.4" stroke-linecap="round"/><path d="M28 40L46 46M72 40L54 46" stroke="#6d4ad1" stroke-width="2" stroke-linecap="round"/><path d="M34 66Q50 78 66 66L63 70L58 65L54 71L50 65L46 71L42 65L37 70Z" fill="#fff" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`,
  /* Capitão Caos: chapéu de capitão, tapa-olho, sorriso malandro */
  `<path d="M16 100Q20 72 50 70Q80 72 84 100Z" fill="#c1121f" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M42 70L50 80L58 70" fill="#fff" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="50" cy="52" r="27" fill="${K}"/><circle cx="50" cy="52" r="24.4" fill="#f4a259"/><path d="M50 28A24.4 24.4 0 0 1 50 76A14 24.4 0 0 0 50 28Z" fill="rgba(0,0,0,.17)"/><path d="M14 38Q50 -4 86 38L78 44Q50 28 22 44Z" fill="#1a1a2e" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M22 41Q50 27 78 41" stroke="#c1121f" stroke-width="5" fill="none"/><polygon points="50,24 52.6,30 59,30.4 54,34.4 55.8,40.6 50,37 44.2,40.6 46,34.4 41,30.4 47.4,30" fill="#ffd23f" stroke="${K}" stroke-width="1.2"/><path d="M30 46L44 50M72 44L56 50" stroke="${K}" stroke-width="4.4" stroke-linecap="round"/><ellipse cx="62" cy="55" rx="6.6" ry="5.4" fill="#fff" stroke="${K}" stroke-width="1.8"/><circle cx="62.6" cy="55.6" r="3" fill="${K}"/><circle cx="63.6" cy="54.4" r="1" fill="#fff"/><ellipse cx="38" cy="55" rx="7.4" ry="6.2" fill="${K}"/><path d="M26 49L72 40" stroke="${K}" stroke-width="1.8"/><path d="M38 68Q50 76 64 66" fill="none" stroke="${K}" stroke-width="3.2" stroke-linecap="round"/><rect x="55" y="66" width="4.6" height="5.2" rx="1.2" fill="#ffd23f" stroke="${K}" stroke-width="1.2"/>`,
  /* Madame Gelatina: gelatina verde com coroa rosa */
  `<path d="M14 92Q8 56 28 40Q50 22 72 40Q92 56 86 92Q70 102 50 98Q30 102 14 92Z" fill="#5be37d" stroke="${K}" stroke-width="3.2" stroke-linejoin="round"/><path d="M86 92Q92 56 72 40Q80 60 74 88Z" fill="rgba(0,0,0,.18)"/><ellipse cx="34" cy="50" rx="9" ry="5.4" fill="rgba(255,255,255,.55)" transform="rotate(-24 34 50)"/><path d="M30 34L34 14L44 28L50 10L56 28L66 14L70 34Z" fill="#ff6fb5" stroke="${K}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="34" cy="14" r="3" fill="#ffd23f" stroke="${K}" stroke-width="1.4"/><circle cx="50" cy="10" r="3.2" fill="#ffd23f" stroke="${K}" stroke-width="1.4"/><circle cx="66" cy="14" r="3" fill="#ffd23f" stroke="${K}" stroke-width="1.4"/><ellipse cx="38" cy="60" rx="9" ry="10" fill="#fff" stroke="${K}" stroke-width="2"/><ellipse cx="62" cy="60" rx="9" ry="10" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="40.6" cy="62" r="4.6" fill="${K}"/><circle cx="64.6" cy="62" r="4.6" fill="${K}"/><circle cx="42" cy="60" r="1.5" fill="#fff"/><circle cx="66" cy="60" r="1.5" fill="#fff"/><path d="M28 47Q38 42 46 47M54 47Q62 42 72 47" stroke="${K}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M36 77Q50 90 64 77Z" fill="#a31245" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 98Q22 106 26 108Q30 106 28 98M72 98Q70 106 74 108Q78 106 76 98" fill="#5be37d" stroke="${K}" stroke-width="2"/>`,
  /* Rei Bagunça: coroa torta, bigodão e capa */
  `<path d="M10 100Q14 70 50 68Q86 70 90 100Z" fill="#b3122a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M12 82Q50 66 88 82L90 88Q50 72 10 88Z" fill="#fff" stroke="${K}" stroke-width="2"/><circle cx="50" cy="52" r="29" fill="${K}"/><circle cx="50" cy="52" r="26.4" fill="#e8b88a"/><path d="M50 26A26.4 26.4 0 0 1 50 78A15 26.4 0 0 0 50 26Z" fill="rgba(0,0,0,.17)"/><path d="M22 44Q10 40 12 58Q16 50 24 54Z M78 44Q90 40 88 58Q84 50 76 54Z" fill="#f2f2f2" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/><g transform="rotate(-12 50 28)"><path d="M26 34L28 12L40 24L50 8L60 24L72 12L74 34Z" fill="#ffd23f" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="30" width="48" height="8" rx="2" fill="#f0a500" stroke="${K}" stroke-width="2.4"/><circle cx="38" cy="34" r="2.6" fill="#ff4d5e"/><circle cx="50" cy="34" r="2.6" fill="#4ca3ff"/><circle cx="62" cy="34" r="2.6" fill="#4cd964"/></g><path d="M30 48L44 52M70 48L56 52" stroke="${K}" stroke-width="4.2" stroke-linecap="round"/><ellipse cx="38" cy="55" rx="5.6" ry="4.6" fill="#fff" stroke="${K}" stroke-width="1.6"/><ellipse cx="62" cy="55" rx="5.6" ry="4.6" fill="#fff" stroke="${K}" stroke-width="1.6"/><circle cx="38.6" cy="55.6" r="2.6" fill="${K}"/><circle cx="62.6" cy="55.6" r="2.6" fill="${K}"/><path d="M50 58Q47 62 51 62" stroke="rgba(0,0,0,.5)" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M50 64Q36 58 24 66Q30 74 38 70Q44 68 50 68Q56 68 62 70Q70 74 76 66Q64 58 50 64Z" fill="#f2f2f2" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M44 74Q50 79 56 74" stroke="${K}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  /* Professor Pegadinha: cabelo maluco, óculos redondos, gravata-borboleta */
  `<path d="M16 100Q20 76 50 74Q80 76 84 100Z" fill="#fff" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M50 78L36 72L36 84ZM50 78L64 72L64 84Z" fill="#ff4d5e" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="50" cy="78" r="3.6" fill="#c1121f" stroke="${K}" stroke-width="2"/><path d="M18 40L6 28L22 30L14 14L30 24L30 6L42 22L50 4L58 22L70 6L70 24L86 14L78 30L94 28L82 40Z" fill="#cfd4e8" stroke="${K}" stroke-width="2.8" stroke-linejoin="round"/><circle cx="50" cy="50" r="28" fill="${K}"/><circle cx="50" cy="50" r="25.4" fill="#f3d2b3"/><path d="M50 25A25.4 25.4 0 0 1 50 75A14 25.4 0 0 0 50 25Z" fill="rgba(0,0,0,.15)"/><circle cx="37" cy="49" r="11" fill="rgba(160,220,255,.55)" stroke="${K}" stroke-width="3"/><circle cx="63" cy="49" r="11" fill="rgba(160,220,255,.55)" stroke="${K}" stroke-width="3"/><path d="M48 49H52" stroke="${K}" stroke-width="3"/><circle cx="37.6" cy="50" r="4.6" fill="#fff"/><circle cx="63.6" cy="50" r="4.6" fill="#fff"/><circle cx="38.4" cy="50.6" r="2.4" fill="${K}"/><circle cx="64.4" cy="50.6" r="2.4" fill="${K}"/><path d="M27 36L44 40M74 34L56 40" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M34 64Q50 78 68 62Q58 70 50 70Q42 70 34 64Z" fill="#fff" stroke="${K}" stroke-width="2.4" stroke-linejoin="round"/><path d="M45 71Q50 78 56 70" fill="#ff6fb5" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>`
 ];
 return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${bg}${A[i%A.length]}</svg>`;
}

/* tabuleiro em serpentina: 60, 80 ou 100 casas (10 colunas) */
const LAYOUTS={
 60:{L:{puzzle:[7,15,24,33,42,52],gift:[5,12,20,29,38,47,55],villain:[11,23,36,48],energy:[9,27,44],turbo:[16,31,50],duel:[21,40,56],wheel:[18,35,53]},P:[[4,17,'A'],[14,30,'B'],[25,43,'C'],[37,54,'D']]},
 80:{L:{puzzle:[6,14,23,31,39,47,55,58,63,76],gift:[4,11,19,27,35,43,51,59,67,73,78],villain:[9,21,33,45,57,69,74],energy:[8,16,29,38,48,60,66,77],turbo:[13,25,37,53,65,70,79],duel:[12,30,46,61,72],wheel:[3,22,34,52,64,68,75]},P:[[5,18,'A'],[15,36,'B'],[28,49,'C'],[41,62,'D'],[56,71,'E']]},
 100:{L:{puzzle:[6,14,23,31,39,47,55,63,71,79,87,94],gift:[4,11,19,27,35,43,51,59,67,75,83,91,97],villain:[9,21,33,45,57,69,81,92],energy:[8,16,29,38,48,60,70,85],turbo:[13,25,37,53,65,77,88],duel:[12,30,46,61,76,90],wheel:[3,22,34,52,64,74,80,86]},P:[[5,18,'A'],[15,36,'B'],[28,49,'C'],[41,62,'D'],[56,78,'E'],[72,93,'F']]}
};
let N=100,ROWS=10;const TILE={};
function setBoard(n){
 N=LAYOUTS[n]?n:100;ROWS=N/10;
 for(const k in TILE)delete TILE[k];
 const{L,P}=LAYOUTS[N];
 for(const k in L)L[k].forEach(x=>{TILE[x]={k};});
 P.forEach(([a,b,l])=>{TILE[a]={k:'portal',to:b,l};TILE[b]={k:'exit',l};});
 TILE[1]={k:'start'};TILE[N]={k:'goal'};
}
setBoard(100);
const rc=n=>{const r=Math.floor((n-1)/10);let c=(n-1)%10;if(r%2)c=9-c;return{r,c};};
const pct=n=>{const{r,c}=rc(n);return{x:c*10+5,y:(ROWS-1-r)*100/ROWS+50/ROWS};};
const ICON={
 puzzle:'<svg viewBox="0 0 24 24"><path d="M4 8h4a3 3 0 1 1 6 0h6v4a3 3 0 1 0 0 6v4H4v-6a3 3 0 1 0 0-6z" fill="rgba(255,255,255,.92)" stroke="rgba(255,255,255,.3)" stroke-width=".5"/><path d="M9 14l2 2 4-4" stroke="#5c2fc2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
 gift:'<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="2.5" rx="1" fill="#0d1130"/><rect x="5" y="12.5" width="14" height="9" rx="1" fill="#fff"/><rect x="11.2" y="10" width="1.6" height="11.5" fill="#ff9f1c"/><path d="M12 10C10 5.5 6.5 7.5 9 10zM12 10c2-4.5 5.5-2.5 3 0z" fill="#ff9f1c" stroke="#c1621f" stroke-width=".6"/></svg>',
 villain:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#1a0006"/><path d="M4.5 7.5l5 2.5M19.5 7.5l-5 2.5" stroke="#ff4d5e" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="8.5" cy="12" rx="2.4" ry="2.4" fill="#ff3344"/><ellipse cx="15.5" cy="12" rx="2.4" ry="2.4" fill="#ff3344"/><circle cx="8.5" cy="12" r=".9" fill="#fff"/><circle cx="15.5" cy="12" r=".9" fill="#fff"/><path d="M7.5 18.5q4.5-4.5 9 0" stroke="#ff4d5e" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
 energy:'<svg viewBox="0 0 24 24"><path d="M13.5 2L4.5 14h6l-2 8 11-13H13z" fill="#ffd23f" stroke="#b38800" stroke-width=".6"/><path d="M11.5 3L5 13h5" stroke="rgba(255,255,255,.5)" stroke-width=".9" stroke-linecap="round" fill="none"/></svg>',
 turbo:'<svg viewBox="0 0 24 24"><path d="M3 4l9 8-9 8z" fill="#0d1130"/><path d="M12 4l9 8-9 8z" fill="rgba(0,0,0,.4)"/><path d="M1.5 8h4M1.5 12h5M1.5 16h4" stroke="#0d1130" stroke-width="1.7" stroke-linecap="round" opacity=".45"/></svg>',
 portal:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0a000f"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#ff6fb5" stroke-width="2.6"/><circle cx="12" cy="12" r="5" fill="none" stroke="#b06aff" stroke-width="2.2"/><circle cx="12" cy="12" r="2.2" fill="#ffd23f"/></svg>',
 exit:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3.5 2.5"/><circle cx="12" cy="12" r="5" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M12 7v10M9.5 14.5l2.5 2.5 2.5-2.5" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
 duel:'<svg viewBox="0 0 24 24"><path d="M4.5 4.5l15 15M19.5 4.5l-15 15" stroke="#0d1130" stroke-width="2.8" stroke-linecap="round"/><circle cx="12" cy="12" r="3.2" fill="#fff" stroke="#0d1130" stroke-width="1.4"/><circle cx="12" cy="12" r="1.2" fill="#ff4d5e"/></svg>',
 wheel:'<svg viewBox="0 0 24 24"><path d="M12 12L12 1.5A10.5 10.5 0 0 1 21.1 17.25Z" fill="#ff4d5e"/><path d="M12 12L21.1 17.25A10.5 10.5 0 0 1 2.9 17.25Z" fill="#2ee6d6"/><path d="M12 12L2.9 17.25A10.5 10.5 0 0 1 12 1.5Z" fill="#ffd23f"/><circle cx="12" cy="12" r="3" fill="#0d1130" stroke="rgba(255,255,255,.4)" stroke-width="1.2"/></svg>',
 goal:'<svg viewBox="0 0 24 24"><path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="#0d1130"/><path d="M5.5 3H4a3.5 3.5 0 0 0 3 3.5M18.5 3H20a3.5 3.5 0 0 1-3 3.5" stroke="#0d1130" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M11 13.5v6M13 13.5v6" stroke="#0d1130" stroke-width="1.5" stroke-linecap="round" fill="none"/><rect x="9.5" y="19" width="5" height="1.5" rx=".75" fill="#0d1130"/></svg>'
};
function tileHTML(n){
 const t=TILE[n]||{k:'plain'};let inner='';
 if(t.k==='portal'||t.k==='exit')inner=ICON[t.k]+`<i>${t.l}</i>`;
 else if(t.k==='start')inner='<span class="lbl">Início</span>';
 else if(ICON[t.k])inner=ICON[t.k];
 const alt=t.k==='plain'&&((n+Math.floor((n-1)/10))%2)?' a':'';
 return `<div class="t k-${t.k}${alt}" data-n="${n}"><b>${n}</b>${inner}</div>`;
}
let THEME='espaco';
const THEMES={
 espaco:{name:'Espaço',bg:'radial-gradient(circle at 18% 22%,rgba(255,90,200,.34),transparent 36%),radial-gradient(circle at 82% 74%,rgba(46,230,214,.28),transparent 38%),radial-gradient(circle at 52% 48%,rgba(138,107,255,.38),transparent 58%),#070a25',
  path:['rgba(0,0,0,.55)','rgba(190,170,255,.55)','#fff'],
  decor:(W,H,rn)=>{let s='';for(let i=0;i<Math.round(ROWS*14);i++){const r=.18+rn()*.5;s+=`<circle cx="${(rn()*W).toFixed(1)}" cy="${(rn()*H).toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(.35+rn()*.6).toFixed(2)}"/>`;}
   return s+`<g opacity=".55"><circle cx="${W*.9}" cy="${H*.14}" r="${H*.07}" fill="url(#pl1)"/><ellipse cx="${W*.9}" cy="${H*.14}" rx="${H*.12}" ry="${H*.025}" fill="none" stroke="#ffd1f0" stroke-width=".7" transform="rotate(-18 ${W*.9} ${H*.14})"/><circle cx="${W*.08}" cy="${H*.86}" r="${H*.06}" fill="url(#pl2)"/><circle cx="${W*.5}" cy="${H*.52}" r="${H*.045}" fill="url(#pl3)"/></g>`;}},
 cidade:{name:'Cidade neon',bg:'radial-gradient(circle at 50% 100%,rgba(255,60,160,.5),transparent 56%),radial-gradient(circle at 18% 8%,rgba(60,200,255,.34),transparent 46%),linear-gradient(#0a0630,#1a0b4a 62%,#34106a)',
  path:['rgba(0,0,0,.6)','rgba(60,230,255,.6)','#ffe44d'],
  decor:(W,H,rn)=>{let s='';for(let i=0;i<Math.round(ROWS*6);i++)s+=`<circle cx="${(rn()*W).toFixed(1)}" cy="${(rn()*H*.5).toFixed(1)}" r="${(.2+rn()*.35).toFixed(2)}" fill="#fff" opacity=".6"/>`;
   const cols=['#ff4d9d','#38d9ff','#ffe44d','#8a6bff'];let x=0,n=0;
   while(x<W){const w=5+rn()*8,h=H*(.08+rn()*.2),c=cols[n++%4];s+=`<rect x="${x.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="rgba(12,6,50,.8)" stroke="${c}" stroke-width=".5" opacity=".75"/>`;
    for(let k=0;k<Math.floor(h/3.4);k++)for(let j=0;j<Math.floor(w/3);j++)if(rn()<.5)s+=`<rect x="${(x+1+j*3).toFixed(1)}" y="${(H-h+1.4+k*3.4).toFixed(1)}" width="1.5" height="1.6" fill="${rn()<.7?'#ffe44d':c}" opacity=".7"/>`;
    x+=w+1.2;}
   return s;}},
 floresta:{name:'Floresta mágica',bg:'radial-gradient(circle at 28% 30%,rgba(120,255,160,.32),transparent 46%),radial-gradient(circle at 78% 76%,rgba(255,220,120,.26),transparent 42%),linear-gradient(#06231c,#0c3b2c 70%,#10492f)',
  path:['rgba(0,0,0,.55)','rgba(255,220,130,.62)','#fff7d0'],
  decor:(W,H,rn)=>{let s='';
   for(let i=0;i<Math.round(ROWS*3.2);i++){const x=rn()*W,y=H*(.1+rn()*.85),sc=.7+rn()*.9;s+=`<g opacity=".38" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(2)})"><rect x="-1" y="2" width="2" height="5" fill="#5a3a22"/><polygon points="0,-9 6,2 -6,2" fill="#1f8a4c"/><polygon points="0,-5 7,6 -7,6" fill="#2aa85d"/></g>`;}
   for(let i=0;i<Math.round(ROWS*5);i++)s+=`<circle cx="${(rn()*W).toFixed(1)}" cy="${(rn()*H).toFixed(1)}" r="${(.35+rn()*.4).toFixed(2)}" fill="#ffe27a" opacity="${(.5+rn()*.5).toFixed(2)}"/><circle cx="${(rn()*W).toFixed(1)}" cy="${(rn()*H).toFixed(1)}" r="1.4" fill="#ffe27a" opacity=".12"/>`;
   for(const [mx,my] of [[W*.07,H*.9],[W*.93,H*.1],[W*.5,H*.95]])s+=`<g opacity=".6" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})"><rect x="-1.2" y="0" width="2.4" height="5" fill="#f4e4c8"/><path d="M-6 0A6 5 0 0 1 6 0Z" fill="#ff4d5e"/><circle cx="-2.4" cy="-2" r="1" fill="#fff"/><circle cx="2" cy="-2.6" r="1.2" fill="#fff"/></g>`;
   return s;}}
};
function boardArt(){
 const W=100,H=10*ROWS;let seed=7;const rn=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};
 const T=THEMES[THEME]||THEMES.espaco;
 let s=`<svg class="board-art" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><radialGradient id="pl1" cx="35%" cy="30%"><stop offset="0" stop-color="#ffd1f0"/><stop offset="1" stop-color="#b43aa6"/></radialGradient><radialGradient id="pl2" cx="35%" cy="30%"><stop offset="0" stop-color="#b8fff5"/><stop offset="1" stop-color="#1f8fb0"/></radialGradient><radialGradient id="pl3" cx="35%" cy="30%"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e0792b"/></radialGradient></defs>`;
 s+=T.decor(W,H,rn);
 let pts='';for(let n=1;n<=N;n++){const q=pct(n);pts+=`${(q.x).toFixed(2)},${(q.y*ROWS/10).toFixed(2)} `;}
 s+=`<polyline points="${pts}" fill="none" stroke="${T.path[0]}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${T.path[1]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${T.path[2]}" stroke-opacity=".7" stroke-width=".55" stroke-dasharray="1.2 1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
 PORTAL_LINKS().forEach(([a,b])=>{const p=pct(a),q=pct(b);s+=`<path d="M${p.x} ${p.y*ROWS/10}Q${(p.x+q.x)/2} ${((p.y+q.y)/2)*ROWS/10-6} ${q.x} ${q.y*ROWS/10}" fill="none" stroke="#ff6fb5" stroke-opacity=".55" stroke-width=".7" stroke-dasharray="1 1.4"/>`;});
 return s+'</svg>';
}
const PORTAL_LINKS=()=>LAYOUTS[N].P.map(([a,b])=>[a,b]);
function buildBoard(){
 let h=boardArt();
 $('#board').style.aspectRatio=`10/${ROWS}`;document.documentElement.style.setProperty('--rows',ROWS);$('#grid').style.gridTemplate=`repeat(${ROWS},1fr)/repeat(10,1fr)`;
 for(let row=0;row<ROWS;row++)for(let col=0;col<10;col++){const r=ROWS-1-row,n=r*10+(r%2?10-col:col+1);h+=tileHTML(n);}
 $('#grid').innerHTML=h;$('#grid').style.background=(THEMES[THEME]||THEMES.espaco).bg;
}
const TNAME={plain:'Casa livre',start:'Início',puzzle:'Desafio',villain:'Vilão',gift:'Caixa surpresa',wheel:'Roleta da sorte',duel:'Duelo',energy:'Energia',turbo:'Turbo',portal:'Portal',exit:'Saída do portal'};
const TWHAT={plain:'Nada acontece aqui.',start:'Nada acontece aqui.',puzzle:'Resolva o mini jogo e avance 3 casas.',villain:'Um vilão bloqueou o caminho!',gift:'Vai sortear um efeito surpresa.',wheel:'Hora de girar a roleta.',duel:'Escolha um rival para duelar.',energy:'O superpoder vai carregar mais.',turbo:'Vai avançar 3 casas.',portal:'Vai atravessar o portal.',exit:'Saída do portal. Nada acontece.'};
let LCRES=null,LCT=null,LCA=null;
function hideCard(v='ok'){
 const el=$('#landcard');clearTimeout(LCA);
 if(!LCRES||!el)return;
 const r=LCRES;LCRES=null;el.classList.add('out');clearTimeout(LCT);
 LCT=setTimeout(()=>{el.hidden=true;el.classList.remove('in','out','hold');r(v);},300);
}
/* cartão grande: devolve uma Promise que resolve quando a pessoa toca no botão (ou após "auto" ms) */
function showCard(o){
 return new Promise(res=>{
  const el=$('#landcard');if(!el){res('ok');return;}
  if(LCRES){const r=LCRES;LCRES=null;r('ok');}
  clearTimeout(LCT);clearTimeout(LCA);
  el.style.setProperty('--pc',o.color||'#fff');
  const bt=o.buttons===null?[]:(o.buttons||[{label:'Continuar',v:'ok'}]);
  let sp='';for(let i=0;i<12;i++)sp+=`<i style="--a:${i*30+rnd(20)}deg;--r:${74+rnd(40)}px;--d:${(rnd(100)/100*1.6).toFixed(2)}s"></i>`;
  el.innerHTML=`<div class="lc${o.mini?' mini':''}"><div class="lcray"></div><div class="lcbody"><small class="lck">${esc(o.kicker)}</small><div class="icw"><div class="spk">${sp}</div><div class="ic ${o.cls||''}">${o.icon}</div></div><h3>${esc(o.title)}</h3><p>${esc(o.sub)}</p>${o.who?`<div class="lcwho"><span class="av" style="--pc:${o.who.color}">${o.who.av}</span><b>${esc(o.who.name)}</b></div>`:''}${bt.length?`<div class="lcbtns">${bt.map(x=>`<button class="btn lcb${x.alt?' alt':''}" data-v="${x.v}" type="button">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
  el.onclick=e=>{const x=e.target.closest('.lcb');if(x){beep(660,.06);hideCard(x.dataset.v);}};
  LCRES=res;
  el.hidden=false;el.classList.remove('out','in','hold');void el.offsetWidth;el.classList.add('in');if(bt.length)el.classList.add('hold');
  if(!o.mini)sfx.card();
  if(o.auto)LCA=setTimeout(()=>hideCard('ok'),o.auto);
  if(bt.length)setTimeout(()=>{const x=$('.lcb',el);if(x)x.focus({preventScroll:true});},650);
 });
}
function dropCard(){LCRES=null;clearTimeout(LCA);clearTimeout(LCT);const el=$('#landcard');if(el){el.hidden=true;el.classList.remove('in','out','hold');}}
const TBTN={puzzle:'Vamos lá!',villain:'Encarar o vilão!',gift:'Abrir a caixa!',wheel:'Girar a roleta!',duel:'Chamar para o duelo!',energy:'Carregar!',turbo:'Acelerar!',portal:'Entrar no portal!',exit:'Continuar'};
function flashTile(n){const t=$(`#grid .t[data-n="${n}"]`);if(!t)return;t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash');setTimeout(()=>t.classList.remove('flash'),1400);}
function where(p){
 const t=TILE[p.pos]||{k:'plain'},k=t.k;
 let nm=TNAME[k],wh=TWHAT[k];
 if(k==='portal'){nm=`Portal ${t.l}`;wh=`Entra na porta ${t.l} e sai na casa ${t.to}!`;}
 else if(k==='exit'){const o=(LAYOUTS[N].P.find(x=>x[2]===t.l)||[])[0];nm=`Saída ${t.l}`;wh=`Fim do portal ${t.l}${o?`, que começa na casa ${o}`:''}. Nada acontece.`;}
 const b=$('#banner');if(!b)return 900;
 b.style.setProperty('--bc',p.color);
 $('#bnIcon').className='sw t k-'+k;$('#bnIcon').innerHTML=ICON[k]||'<b>'+p.pos+'</b>';
 $('#bnWhere').textContent=`${p.name} caiu na casa ${p.pos}: ${nm}`;
 b.classList.remove('pulse');void b.offsetWidth;b.classList.add('pulse');
 say(wh);
 flashTile(p.pos);
 const plain=k==='plain';
 sfx.land(k);
 if(k==='villain')return Promise.resolve('ok');
 return showCard({kicker:`CASA ${p.pos}`,title:nm,sub:wh,icon:ICON[k]||`<b class="bignum">${p.pos}</b>`,cls:'k-'+k,color:p.color,who:{name:p.name,av:heroSVG(p.hero,true),color:p.color},mini:plain,buttons:plain?null:[{label:TBTN[k]||'Continuar',v:'ok'}],auto:plain?1500:(p.human?0:4200)});
}
const LEG=[
 ['puzzle','Desafio','Resolva o mini jogo e avance 3 casas. Os desafios mudam toda hora.'],
 ['villain','Vilão','Derrote o vilão num desafio. Se perder, volta 3 casas. Escudo protege.'],
 ['gift','Caixa surpresa','Sorteia um efeito. Pode ajudar ou atrapalhar.'],
 ['wheel','Roleta da sorte','Gira a roleta e vê o que sai.'],
 ['duel','Duelo','Escolha um rival. Os dois jogam o mesmo desafio. Quem vencer ganha casas.'],
 ['energy','Energia','Carrega parte do superpoder. Use a Roleta para recarga total.'],
 ['turbo','Turbo','Avança 3 casas.'],
 ['portal','Portal','Entra na letra e sai na mesma letra, mais à frente.']
];
