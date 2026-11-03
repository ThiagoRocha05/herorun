/* puzzles e mini jogos */
const SH={circle:c=>`<circle cx="50" cy="50" r="38" fill="${c}"/>`,square:c=>`<rect x="14" y="14" width="72" height="72" rx="10" fill="${c}"/>`,tri:c=>`<polygon points="50,10 92,88 8,88" fill="${c}"/>`,star:c=>`<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" fill="${c}"/>`};
const svgS=(k,c)=>`<svg viewBox="0 0 100 100" aria-hidden="true">${SH[k](c)}</svg>`;
const SHC=['#ff4d5e','#4ca3ff','#4cd964','#ffd23f','#ff6fb5','#2ee6d6'];
const KC={circle:'#4ca3ff',square:'#ff4d5e',tri:'#4cd964',star:'#ffd23f'};
const KN={circle:'círculos',square:'quadrados',tri:'triângulos',star:'estrelas'};
const WORDS={B:['bola','banana','bebê'],C:['casa','cavalo','carro'],D:['dado','dente','dedo'],F:['faca','flor','foca'],G:['gato','girafa','goiaba'],L:['lua','leão','livro'],M:['mala','mesa','macaco'],P:['pato','pizza','peixe'],S:['sapo','sol','sino'],T:['tigre','tatu','taça']};
function finish(box,win,msg,close,extra){
 box.onclick=null;
 box.innerHTML=`<p class="res ${win?'ok':'no'}">${msg}</p><button class="btn" id="mgGo" type="button">Continuar</button>`;
 (win?sfx.good:sfx.bad)();
 $('#mgGo',box).onclick=()=>close({win,extra:extra||0});
}
const options=(ans,cands)=>{const s=new Set([ans]);for(const c of shuffle(cands)){if(s.size>=3)break;if(c>=0)s.add(c);}let k=1;while(s.size<3){s.add(ans+k);k++;}return shuffle([...s]);};
const optBtns=(arr,cls='')=>`<div class="opts ${cls}">${arr.map(o=>`<button class="opt" data-v="${o}" type="button">${o}</button>`).join('')}</div>`;
const pickOne=(box,fn)=>{box.addEventListener('click',function h(e){const b=e.target.closest('.opt');if(!b)return;box.removeEventListener('click',h);fn(b);});};

const GAMES=[
{name:'Conta relâmpago',hint:'escolha a resposta certa.',run(box,close,lv){
 const t=rnd(3),big=lv>1;let q,ans;
 if(t===0){const a=1+rnd(big?20:10),b=1+rnd(big?15:9);q=`${a} + ${b}`;ans=a+b;}
 else if(t===1){const a=5+rnd(big?20:10),b=1+rnd(Math.min(a-1,big?14:8));q=`${a} - ${b}`;ans=a-b;}
 else{const a=2+rnd(big?9:6);q=`Dobro de ${a}`;ans=a*2;}
 box.innerHTML=`<div class="q">${q} = ?</div>${optBtns(options(ans,[ans-1,ans+1,ans-2,ans+2,ans+10,ans-10]))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===ans;finish(box,ok,ok?'Acertou!':`Era ${ans}.`,close);});
}},
{name:'Qual é a maior?',hint:'ache a conta com o maior resultado.',run(box,close,lv){
 let ex;do{ex=Array.from({length:3},()=>{const a=2+rnd(lv>1?14:8),b=1+rnd(lv>1?12:6);return{t:`${a} + ${b}`,v:a+b};});}while(new Set(ex.map(e=>e.v)).size<3);
 const best=Math.max(...ex.map(e=>e.v));
 box.innerHTML=`<div class="words">${ex.map(e=>`<button class="opt" data-v="${e.v}" type="button">${e.t}</button>`).join('')}</div>`;
 pickOne(box,b=>{const ok=+b.dataset.v===best;finish(box,ok,ok?'Isso aí, é a maior!':`A maior era ${best}.`,close);});
}},
{name:'Qual número vem?',hint:'descubra a regra e complete.',run(box,close,lv){
 const st=pick(lv>1?[2,3,5,10]:[1,2,5]),s0=1+rnd(6),seq=[0,1,2,3].map(i=>s0+i*st),ans=s0+4*st;
 box.innerHTML=`<div class="seq">${seq.join(', ')}, ?</div>${optBtns(options(ans,[ans+st,ans-st,ans+1,ans-1,ans+2]))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===ans;finish(box,ok,ok?'Descobriu a regra!':`Era ${ans}.`,close);});
}},
{name:'Quem é diferente?',hint:'toque no que não combina.',run(box,close,lv){
 const ks=Object.keys(SH),k=pick(ks),c=pick(SHC),n=lv>1?9:6,odd=rnd(n);let ok2,oc=c,ok=k;
 if(Math.random()<.5)ok=pick(ks.filter(x=>x!==k));else oc=pick(SHC.filter(x=>x!==c));
 box.innerHTML=`<div class="opts">${Array.from({length:n},(_,i)=>`<button class="opt" data-i="${i}" type="button" style="background:#fff">${i===odd?svgS(ok,oc):svgS(k,c)}</button>`).join('')}</div>`;
 pickOne(box,b=>{ok2=+b.dataset.i===odd;finish(box,ok2,ok2?'Olho de águia!':'Quase! Era outro.',close);});
}},
{name:'Conte as formas',hint:'quantas aparecem?',run(box,close,lv){
 const ks=Object.keys(KC),tk=pick(ks),want=2+rnd(lv>1?6:4),total=lv>1?20:15,cells=[];
 for(let i=0;i<want;i++)cells.push(tk);
 while(cells.length<total)cells.push(pick(ks.filter(x=>x!==tk)));
 box.innerHTML=`<p class="sub">Conte os <b>${KN[tk]}</b>.</p><div class="cnt">${shuffle(cells).map(k=>svgS(k,KC[k])).join('')}</div>${optBtns(options(want,[want-1,want+1,want+2,want-2]))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===want;finish(box,ok,ok?'Contou direitinho!':`Eram ${want}.`,close);});
}},
{name:'Na ordem certa',hint:'toque do menor para o maior.',run(box,close,lv){
 const n=lv>1?8:6,nums=shuffle(Array.from({length:40},(_,i)=>i+1)).slice(0,n),sorted=[...nums].sort((a,b)=>a-b);let idx=0,err=0;
 box.innerHTML=`<div class="num">${nums.map(v=>`<button class="opt" data-v="${v}" type="button">${v}</button>`).join('')}</div>`;
 box.onclick=e=>{const b=e.target.closest('.opt');if(!b||b.classList.contains('done'))return;
  if(+b.dataset.v===sorted[idx]){b.classList.add('done');idx++;beep(500+idx*60,.07,'triangle');if(idx===n)finish(box,true,'Tudo na ordem!',close,err===0?1:0);}
  else{err++;beep(180,.15,'sawtooth');if(err>=3)finish(box,false,'Embaralhou! Tente de novo na próxima.',close);}};
}},
{name:'Qual começa com...',hint:'ache a palavra pela primeira letra.',run(box,close){
 const letters=Object.keys(WORDS),l=pick(letters),right=pick(WORDS[l]);
 const others=shuffle(letters.filter(x=>x!==l)).slice(0,2).map(x=>pick(WORDS[x]));
 box.innerHTML=`<div class="q">Letra ${l}</div><div class="words">${shuffle([right,...others]).map(w=>`<button class="opt" data-v="${w}" type="button">${w}</button>`).join('')}</div>`;
 pickOne(box,b=>{const ok=b.dataset.v===right;finish(box,ok,ok?'Muito bem!':`Era ${right}.`,close);});
}},
{name:'Siga as cores',hint:'olhe a sequência e repita.',run(box,close,lv){
 const cols=['#ff4d5e','#4ca3ff','#4cd964','#ffd23f'],len=(lv>1?4:3)+rnd(2),seq=Array.from({length:len},()=>rnd(4));let inp=[],lock=true;
 box.innerHTML=`<p id="sm" class="sub">Olhe com atenção...</p><div class="simon">${cols.map((c,i)=>`<button class="pad" data-i="${i}" type="button" style="background:${c}"></button>`).join('')}</div>`;
 const pads=$$('.pad',box),sm=$('#sm',box);
 const flash=async(i,ms=450)=>{pads[i].classList.add('lit');beep(300+i*130,.25,'triangle');await nap(ms);pads[i].classList.remove('lit');await nap(160);};
 (async()=>{await nap(800);for(const i of seq)await flash(i);sm.textContent='Agora é a sua vez!';lock=false;})();
 box.onclick=e=>{const b=e.target.closest('.pad');if(!b||lock)return;const i=+b.dataset.i;flash(i,180);inp.push(i);
  if(seq[inp.length-1]!==i){lock=true;finish(box,false,'Errou a sequência!',close);}
  else if(inp.length===len){lock=true;nap(300).then(()=>finish(box,true,'Acertou todas!',close,len>3?1:0));}};
}},
{name:'Pares de heróis',hint:'vire as cartas e ache os pares.',run(box,close,lv){
 const pairs=lv>1?4:3,kinds=Object.keys(SH),cols=shuffle(SHC),deck=shuffle(Array.from({length:pairs*2},(_,i)=>i%pairs));let open=[],found=0,flips=0,lock=false;
 box.innerHTML=`<p class="sub">Jogadas: <b id="fl">0</b></p><div class="mem" style="grid-template-columns:repeat(${pairs===4?4:3},1fr)">${deck.map((d,i)=>`<button class="mc" data-i="${i}" type="button"><span class="back">?</span><span class="face">${svgS(kinds[d%4],cols[d])}</span></button>`).join('')}</div>`;
 box.onclick=async e=>{const b=e.target.closest('.mc');if(!b||lock||b.classList.contains('up')||b.classList.contains('got'))return;
  b.classList.add('up');open.push(b);beep(500,.06);if(open.length<2)return;
  flips++;$('#fl',box).textContent=flips;lock=true;const[x,y]=open;open=[];
  if(deck[+x.dataset.i]===deck[+y.dataset.i]){x.classList.add('got');y.classList.add('got');found++;lock=false;beep(760,.12,'triangle');
   if(found===pairs)nap(500).then(()=>finish(box,true,flips<=pairs+1?'Memória de herói!':'Achou todos os pares!',close,flips<=pairs+1?1:0));}
  else{await nap(800);x.classList.remove('up');y.classList.remove('up');lock=false;}};
}},
{name:'Pega-estrelas',hint:'toque nas estrelas antes que o tempo acabe.',run(box,close,lv){
 const need=lv>1?6:5;let got=0,left=10,done=false,cur=-1,tm,sp;
 box.innerHTML=`<p class="sub">Estrelas: <b id="gt">0</b> de ${need}. Tempo: <b id="tl">10</b></p><div class="whack">${Array.from({length:9},(_,i)=>`<button class="hole" data-i="${i}" type="button" aria-label="buraco ${i+1}"></button>`).join('')}</div>`;
 const holes=$$('.hole',box);
 const end=win=>{if(done)return;done=true;clearInterval(tm);clearInterval(sp);finish(box,win,win?'Que reflexo! Estrelas coletadas!':`Pegou ${got} de ${need}.`,close,win?1:0);};
 tm=setInterval(()=>{left--;$('#tl',box).textContent=left;if(left<=0)end(got>=need);},1000);
 sp=setInterval(()=>{if(cur>=0)holes[cur].classList.remove('star');cur=rnd(9);holes[cur].classList.add('star');},720);
 box.onclick=e=>{const h=e.target.closest('.hole');if(!h||done||!h.classList.contains('star'))return;h.classList.remove('star');cur=-1;got++;$('#gt',box).textContent=got;beep(700,.08,'triangle');if(got>=need)end(true);};
}},
{name:'Pare no verde',hint:'toque quando o marcador estiver na faixa verde.',run(box,close,lv){
 const w=lv>1?22:30,z=8+rnd(Math.round(84-w)),sp=lv>1?70:52;let x=0,done=false,raf;const t0=performance.now();
 box.innerHTML=`<div class="meter"><div class="zone" style="left:${z}%;width:${w}%"></div><div class="mk" id="mk"></div></div><button class="btn" id="stop" type="button">PARAR!</button>`;
 const mk=$('#mk',box);
 const tick=n=>{x=Math.abs((((n-t0)/1000*sp)%200)-100);mk.style.left=x+'%';if(!done)raf=requestAnimationFrame(tick);};
 raf=requestAnimationFrame(tick);
 $('#stop',box).onclick=()=>{done=true;cancelAnimationFrame(raf);const ok=x>=z&&x<=z+w;finish(box,ok,ok?'No alvo!':'Passou perto!',close,ok&&x>=z+w*.3&&x<=z+w*.7?1:0);};
}},
{name:'Que dia vem depois?',hint:'escolha o dia da semana que vem a seguir.',run(box,close){
 const dias=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
 const i=rnd(7),diaAtual=dias[i],prox=dias[(i+1)%7];
 const errados=dias.filter(d=>d!==prox);
 const opts=shuffle([prox,...shuffle(errados).slice(0,2)]);
 box.innerHTML=`<div class="q">Depois de <b>${diaAtual}</b> vem...</div>${optBtns(opts,'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===prox;finish(box,ok,ok?'Mandou bem!':`Era ${prox}!`,close);});
}},
{name:'Animal e filhote',hint:'encontre o filhote certo para cada animal.',run(box,close){
 const pares=[['gata','gatinho'],['cadela','filhotinho'],['vaca','bezerro'],['égua','potro'],['galinha','pintinho'],['pata','patinho'],['leoa','filhote de leão'],['ursa','filhote de urso']];
 const[animal,filhote]=pick(pares);
 const outros=shuffle(pares.filter(p=>p[1]!==filhote)).slice(0,2).map(p=>p[1]);
 const opts=shuffle([filhote,...outros]);
 box.innerHTML=`<div class="q">Qual é o filhote da <b>${animal}</b>?</div>${optBtns(opts,'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===filhote;finish(box,ok,ok?'Que fofinho! Certo!':`Era ${filhote}!`,close);});
}},
{name:'Vogal ou consoante?',hint:'diga se a letra é vogal ou consoante.',run(box,close){
 const vogais=['A','E','I','O','U'];
 const consoantes=['B','C','D','F','G','H','J','L','M','N','P','R','S','T','V'];
 const isVogal=Math.random()<.5;
 const letra=pick(isVogal?vogais:consoantes);
 const certa=isVogal?'Vogal':'Consoante';
 box.innerHTML=`<div class="q" style="font-size:3em">${letra}</div><div class="opts">${['Vogal','Consoante'].map(o=>`<button class="opt" data-v="${o}" type="button">${o}</button>`).join('')}</div>`;
 pickOne(box,b=>{const ok=b.dataset.v===certa;finish(box,ok,ok?'Correto!':`Era ${certa}!`,close);});
}},
{name:'Quantas sílabas?',hint:'conte as sílabas da palavra.',run(box,close){
 const palavras=[['bola',2],['casa',2],['cachorro',3],['banana',3],['pé',1],['flor',1],['borboleta',4],['avião',3],['gato',2],['elefante',4],['sol',1],['porta',2],['escola',3],['maçã',2],['tartaruga',4]];
 const[palavra,qtd]=pick(palavras);
 const set=new Set([qtd]);for(const c of shuffle([qtd-1,qtd+1,qtd+2,qtd-2,qtd+3])){if(set.size>=3)break;if(c>0&&c<=6)set.add(c);}
 box.innerHTML=`<div class="q">Quantas sílabas tem<br><b style="font-size:1.5em">${palavra}</b>?</div>${optBtns(shuffle([...set]))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===qtd;finish(box,ok,ok?'Bateu palma certinho!':`Tem ${qtd} sílaba${qtd>1?'s':''}!`,close);});
}},
{name:'Que cor forma?',hint:'misture as cores e descubra o resultado.',run(box,close){
 const misturas=[['vermelho','azul','roxo'],['vermelho','amarelo','laranja'],['azul','amarelo','verde'],['vermelho','branco','rosa'],['azul','branco','azul claro'],['amarelo','verde','verde limão']];
 const[c1,c2,res]=pick(misturas);
 const outras=misturas.filter(m=>m[2]!==res).map(m=>m[2]);
 const opts=shuffle([res,...shuffle(outras).slice(0,2)]);
 box.innerHTML=`<div class="q"><b>${c1}</b> + <b>${c2}</b> = ?</div>${optBtns(opts,'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===res;finish(box,ok,ok?'Que mistura legal!':`Forma ${res}!`,close);});
}},
{name:'Parte do corpo',hint:'toque na parte do corpo que aparece na tela.',run(box,close){
 const partes=[['cabeça','A parte mais alta do corpo'],['nariz','Usamos para cheirar'],['olho','Vemos com ele'],['orelha','Ouvimos com ela'],['boca','Falamos e comemos por ela'],['mão','Temos 5 dedos em cada'],['joelho','Dobra quando chutamos'],['barriga','Fica no meio do corpo'],['pé','Pisamos no chão com ele'],['ombro','Une o braço ao tronco']];
 const[parte,dica]=pick(partes);
 const outras=partes.filter(p=>p[0]!==parte).map(p=>p[0]);
 const opts=shuffle([parte,...shuffle(outras).slice(0,2)]);
 box.innerHTML=`<div class="q" style="font-size:.95em">${dica}</div>${optBtns(opts,'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===parte;finish(box,ok,ok?'Você conhece seu corpo!':`Era ${parte}!`,close);});
}},
{name:'Que horas são?',hint:'olhe os ponteiros do relógio.',run(box,close,lv){
 const h=1+rnd(12),meia=lv>1&&Math.random()<.5;
 const ang=(h%12+(meia?.5:0))*30,mang=meia?180:0;
 const nums=Array.from({length:12},(_,i)=>{const a=(i+1)*30*Math.PI/180;return `<text x="${(50+36*Math.sin(a)).toFixed(1)}" y="${(54-36*Math.cos(a)).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="#0d1130">${i+1}</text>`;}).join('');
 const clock=`<svg viewBox="0 0 100 100" style="width:150px;height:150px" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#0d1130" stroke-width="4"/>${nums}<line x1="50" y1="50" x2="50" y2="26" stroke="#ff4d5e" stroke-width="5" stroke-linecap="round" transform="rotate(${ang} 50 50)"/><line x1="50" y1="50" x2="50" y2="14" stroke="#0d1130" stroke-width="3" stroke-linecap="round" transform="rotate(${mang} 50 50)"/><circle cx="50" cy="50" r="4" fill="#0d1130"/></svg>`;
 const fmt=(x,m)=>m?`${x} e meia`:`${x} horas`;
 const ans=fmt(h,meia);const opts=new Set([ans]);
 while(opts.size<3){const x=1+rnd(12);opts.add(fmt(x,meia&&Math.random()<.6));}
 box.innerHTML=`<div class="q" style="font-size:1.1em">Que horas o relógio marca?</div><div style="text-align:center">${clock}</div>${optBtns(shuffle([...opts]),'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===ans;finish(box,ok,ok?'Sabe ver as horas!':`Eram ${ans}.`,close);});
}},
{name:'O contrário',hint:'ache a palavra com sentido oposto.',run(box,close){
 const P=[['grande','pequeno'],['quente','frio'],['dia','noite'],['alto','baixo'],['cheio','vazio'],['rápido','devagar'],['feliz','triste'],['claro','escuro'],['aberto','fechado'],['subir','descer'],['dentro','fora'],['leve','pesado'],['perto','longe'],['molhado','seco']];
 const[w,a]=pick(P),outros=shuffle(P.filter(x=>x[1]!==a)).slice(0,2).map(x=>x[1]);
 box.innerHTML=`<div class="q">O contrário de <b>${w}</b> é...</div>${optBtns(shuffle([a,...outros]),'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===a;finish(box,ok,ok?'Isso mesmo!':`Era ${a}.`,close);});
}},
{name:'Quem rima?',hint:'ache a palavra que termina com o mesmo som.',run(box,close){
 const G=[['gato','pato','rato'],['bola','cola','sola'],['mão','pão','chão'],['casa','asa','brasa'],['balão','feijão','limão'],['cadeira','bandeira','poeira'],['dedo','medo','cedo'],['pião','leão','avião'],['rei','lei','grei'],['sapo','capo','papo']];
 const g=pick(G),w=g[0],r=pick(g.slice(1));
 const others=shuffle(G.filter(x=>x!==g)).slice(0,2).map(x=>pick(x));
 box.innerHTML=`<div class="q">Qual rima com <b>${w}</b>?</div>${optBtns(shuffle([r,...others]),'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===r;finish(box,ok,ok?'Que rima linda!':`Rima com ${r}.`,close);});
}},
{name:'Letra que falta',hint:'complete a palavra.',run(box,close){
 const W=['BOLA','GATO','SAPO','MESA','DEDO','PATO','FACA','VACA','CASA','BOCA','MALA','SINO','LUA','SOL','FLOR','NAVIO','PEIXE','LIVRO'];
 const w=pick(W),i=rnd(w.length),c=w[i],alfa='ABCDEFGHIJLMNOPRSTUV'.split('').filter(x=>x!==c);
 const opts=shuffle([c,...shuffle(alfa).slice(0,2)]);
 box.innerHTML=`<div class="q" style="letter-spacing:.15em;font-size:2.2em">${w.slice(0,i)}<span style="color:#ffd23f">_</span>${w.slice(i+1)}</div>${optBtns(opts)}`;
 pickOne(box,b=>{const ok=b.dataset.v===c;finish(box,ok,ok?`${w}! Muito bem!`:`Faltava a letra ${c}: ${w}.`,close);});
}},
{name:'Par ou ímpar?',hint:'o número é par ou ímpar?',run(box,close,lv){
 const n=1+rnd(lv>1?99:20),ans=n%2?'Ímpar':'Par';
 box.innerHTML=`<div class="q" style="font-size:3em">${n}</div><div class="opts">${['Par','Ímpar'].map(o=>`<button class="opt" data-v="${o}" type="button">${o}</button>`).join('')}</div>`;
 pickOne(box,b=>{const ok=b.dataset.v===ans;finish(box,ok,ok?'Certo!':`${n} é ${ans.toLowerCase()}.`,close);});
}},
{name:'Dezenas e unidades',hint:'olhe os dois algarismos do número.',run(box,close,lv){
 const n=10+rnd(lv>1?89:40),d=Math.floor(n/10),u=n%10,askD=Math.random()<.5,ans=askD?d:u;
 box.innerHTML=`<div class="q" style="font-size:1.1em">No número <b style="font-size:1.6em">${n}</b>, quantas ${askD?'dezenas':'unidades'} existem?</div>${optBtns(options(ans,[ans+1,ans-1,askD?u:d,ans+2]))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===ans;finish(box,ok,ok?'Perfeito!':`${n} tem ${d} dezena${d>1?'s':''} e ${u} unidade${u!==1?'s':''}.`,close);});
}},
{name:'Alfabeto',hint:'descubra a letra vizinha.',run(box,close,lv){
 const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ',depois=lv===1||Math.random()<.5,i=depois?rnd(24):1+rnd(24)+1-1;
 const idx=depois?rnd(25):1+rnd(25),ref=A[idx],ans=A[idx+(depois?1:-1)];
 const opts=shuffle([ans,...shuffle(A.split('').filter(x=>x!==ans&&x!==ref)).slice(0,2)]);
 box.innerHTML=`<div class="q">Qual letra vem <b>${depois?'depois':'antes'}</b> do <b style="font-size:1.6em;color:#ffd23f">${ref}</b>?</div>${optBtns(opts)}`;
 pickOne(box,b=>{const ok=b.dataset.v===ans;finish(box,ok,ok?'Sabe o alfabeto!':`Era ${ans}.`,close);});
}},
{name:'Quantos lados?',hint:'conte os lados da figura.',run(box,close){
 const F=[['triângulo',3],['quadrado',4],['retângulo',4],['pentágono',5],['hexágono',6]];
 const[nome,n]=pick(F);let pts;
 if(nome==='retângulo')pts='14,30 86,30 86,70 14,70';
 else pts=Array.from({length:n},(_,k)=>{const a=(k/n)*2*Math.PI-Math.PI/2+(n===4?Math.PI/4:0);return `${(50+38*Math.cos(a)).toFixed(1)},${(52+38*Math.sin(a)).toFixed(1)}`;}).join(' ');
 const col=pick(SHC);
 box.innerHTML=`<div style="text-align:center"><svg viewBox="0 0 100 100" style="width:140px;height:140px" aria-hidden="true"><polygon points="${pts}" fill="${col}" stroke="#0d1130" stroke-width="3" stroke-linejoin="round"/></svg></div><div class="q" style="font-size:1.1em">Quantos lados tem esta figura?</div>${optBtns(options(n,[3,4,5,6,n+1].filter(x=>x!==n)))}`;
 pickOne(box,b=>{const ok=+b.dataset.v===n;finish(box,ok,ok?`É o ${nome}!`:`O ${nome} tem ${n} lados.`,close);});
}},
{name:'Que mês vem depois?',hint:'pense na ordem dos meses do ano.',run(box,close){
 const M=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
 const i=rnd(12),ans=M[(i+1)%12],outros=shuffle(M.filter(m=>m!==ans&&m!==M[i])).slice(0,2);
 box.innerHTML=`<div class="q">Depois de <b>${M[i]}</b> vem...</div>${optBtns(shuffle([ans,...outros]),'words')}`;
 pickOne(box,b=>{const ok=b.dataset.v===ans;finish(box,ok,ok?'Sabe os meses!':`Vem ${ans}.`,close);});
}},
{name:'Forme a palavra',hint:'toque nas letras na ordem certa.',run(box,close,lv){
 const W=lv>1?['BANANA','JANELA','CAVALO','TIGRE','PEIXE','LIVRO']:['GATO','BOLA','SAPO','LUA','PATO','CASA','MESA'];
 const w=pick(W);let letras=shuffle(w.split(''));let tries=0;while(letras.join('')===w&&tries++<9)letras=shuffle(w.split(''));
 let idx=0,err=0;
 box.innerHTML=`<p class="sub">Forme a palavra: <b id="fw" style="letter-spacing:.2em;font-size:1.4em">${'_'.repeat(w.length).split('').join(' ')}</b></p><div class="num">${letras.map((c,k)=>`<button class="opt" data-k="${k}" data-v="${c}" type="button">${c}</button>`).join('')}</div>`;
 box.onclick=e=>{const b=e.target.closest('.opt');if(!b||b.classList.contains('done'))return;
  if(b.dataset.v===w[idx]){b.classList.add('done');b.style.opacity='.35';idx++;beep(500+idx*70,.07,'triangle');$('#fw',box).textContent=w.slice(0,idx).split('').concat(Array(w.length-idx).fill('_')).join(' ');if(idx===w.length)finish(box,true,`${w}! Muito bem!`,close,err===0?1:0);}
  else{err++;beep(180,.15,'sawtooth');if(err>=3)finish(box,false,`A palavra era ${w}.`,close);}};
}}
];

const RECENT=[];
function nextGame(){let g,t=0;do{g=pick(GAMES);}while(RECENT.includes(g)&&t++<30);RECENT.push(g);if(RECENT.length>8)RECENT.shift();return g;}
