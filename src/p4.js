/* janelas, dado, peões, painel */
function modal(html,setup){return new Promise(res=>{const m=$('#modal'),c=$('#card');c.innerHTML=html;m.hidden=false;c.scrollTop=0;c.onclick=null;let done=false;const close=v=>{if(done)return;done=true;m.hidden=true;c.onclick=null;res(v);};if(setup)setup(c,close);});}
const okModal=(title,text,btn='Beleza!')=>modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn" data-ok type="button">${esc(btn)}</button>`,(c,close)=>{c.onclick=e=>{if(e.target.closest('[data-ok]'))close();};});
async function info(p,title,text){
 if(p.human){await okModal(title,text);}
 else{modal(`<h3>${esc(title)}</h3><p>${esc(text)}</p>`,(c,close)=>setTimeout(close,1700));await sleep(1750);}
}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function showDice(a){$('#dice').innerHTML=a.map(v=>`<div class="die">${Array.from({length:9},(_,i)=>`<s class="${PIPS[v].includes(i)?'p':''}"></s>`).join('')}</div>`).join('');}
async function rollAnim(n){sfx.roll();const d=$('#dice');d.classList.add('rolling');for(let i=0;i<9;i++){showDice(Array.from({length:n},()=>1+rnd(6)));await sleep(75);}d.classList.remove('rolling');}
function chooseDie(p){
 if(!p.human)return Promise.resolve(6);
 return new Promise(res=>{const b=$('#pick');b.hidden=false;b.innerHTML=`<p>Escolha o número do dado:</p><div class="pn6">${[1,2,3,4,5,6].map(n=>`<button class="btn alt" data-n="${n}" type="button">${n}</button>`).join('')}</div>`;b.onclick=e=>{const x=e.target.closest('[data-n]');if(!x)return;b.hidden=true;b.onclick=null;res(+x.dataset.n);};});
}
function rival(p,title){
 const rs=S.players.filter(q=>q!==p&&q.pos<N);
 if(!rs.length)return Promise.resolve(null);
 if(rs.length===1)return Promise.resolve(rs[0]);
 if(!p.human)return Promise.resolve(rs.reduce((a,b)=>b.pos>a.pos?b:a));
 return modal(`<h3>${esc(title)}</h3><div class="rv">${rs.map((q,i)=>`<button class="rb" data-i="${i}" type="button" style="--pc:${q.color}"><span class="av">${heroSVG(q.hero)}</span><b>${esc(q.name)}</b><small>casa ${q.pos}</small></button>`).join('')}</div>`,(c,close)=>{c.onclick=e=>{const b=e.target.closest('.rb');if(b)close(rs[+b.dataset.i]);};});
}
function place(){
 const g={};S.players.forEach(p=>{(g[p.pos]=g[p.pos]||[]).push(p);});
 const OFF=[[0,0],[-26,-18],[26,-18],[-26,22],[26,22]];
 for(const k in g){const arr=g[k],{x,y}=pct(+k);arr.forEach((p,i)=>{const o=arr.length>1?OFF[i+1]:OFF[0];p.el.style.left=x+'%';p.el.style.top=y+'%';p.el.style.setProperty('--dx',o[0]+'%');p.el.style.setProperty('--dy',o[1]+'%');p.el.style.zIndex=Math.round(y);});}
}
function makeTokens(){
 const box=$('#tokens');box.innerHTML='';
 S.players.forEach(p=>{const el=document.createElement('div');el.className='tok';el.style.setProperty('--pc',p.color);el.innerHTML=`<span class="sh"></span><div class="pawn"><div class="hd">${heroSVG(p.hero,true)}</div><div class="bd"></div></div>`;box.appendChild(el);p.el=el;p.pawn=$('.pawn',el);});
 place();
}
function pop(p,text){const st=$('#stage'),a=p.pawn.getBoundingClientRect(),b=st.getBoundingClientRect(),d=document.createElement('div');d.className='pop';d.textContent=text;d.style.left=(a.left-b.left+a.width/2)+'px';d.style.top=(a.top-b.top)+'px';st.appendChild(d);setTimeout(()=>d.remove(),1300);}
function fxHit(){const st=$('#stage');st.classList.remove('fx-hit');void st.offsetWidth;st.classList.add('fx-hit');}
function confetti(){const f=$('#fx'),cols=['#ff4d5e','#ffd23f','#2ee6d6','#4cd964','#ff6fb5','#4ca3ff'];f.innerHTML='';for(let i=0;i<80;i++){const d=document.createElement('i');d.style.left=Math.random()*100+'%';d.style.background=cols[i%6];d.style.animationDelay=Math.random()*1.2+'s';d.style.animationDuration=2.6+Math.random()*2+'s';f.appendChild(d);}setTimeout(()=>{f.innerHTML='';},7000);}
function renderStrip(){
 $('#strip').innerHTML=S.players.map(p=>`<div class="chip${p===S.cur?' me':''}" style="--pc:${p.color}"><span class="av">${heroSVG(p.hero,true)}</span><div><b>${esc(p.name)}</b><small>casa ${p.pos}${p.skip?', congelado':''}${p.shield>0?', escudo':''}</small></div></div>`).join('');
}
const canPower=p=>p.charge>=p.hero.cd&&!p.armed&&!p.used&&p.left>0;
function setBtns(){
 const p=S.cur;if(!p)return;const me=p.human&&S.wait,rb=$('#btnRoll'),pb=$('#btnPower');
 rb.disabled=!me;pb.disabled=!(me&&canPower(p));
 rb.textContent=p.human?(p.armed?'Rolar com poder':'Rolar o dado'):'Vez do robô';
 pb.textContent=p.left<=0?'Poder esgotado':(p.charge>=p.hero.cd?'Usar poder':`Poder ${p.charge}/${p.hero.cd}`);
}
function renderAll(){
 const p=S.cur;if(!p)return;
 S.players.forEach(q=>q.pawn.classList.toggle('on',q===p));
 $('#turnLabel').innerHTML=`Vez de <span style="color:${p.color}">${esc(p.name)}</span>`;
 $('#who').innerHTML=`<div class="av" style="--pc:${p.color}">${heroSVG(p.hero)}</div><div><h2>${esc(p.name)}</h2><small>${p.hero.name}, ${p.hero.g==='f'?'heroína':'herói'}${p.human?'':', robô'}</small></div>`;
 const h=p.hero,ready=p.charge>=h.cd;
 const psym=(SYM[h.sym]||'').replace(/@I/g,h.ink).replace(/@C/g,h.color);
 $('#power').innerHTML=`<div class="pn"><div class="pico" style="background:${h.color}"><svg viewBox="-12 -12 24 24" aria-hidden="true">${psym}</svg></div><div><b>${esc(h.power)}</b><span>${esc(h.desc)}</span></div></div><div class="pips">${Array.from({length:h.cd},(_,i)=>`<i class="${i<p.charge?'f':''}"></i>`).join('')}<em>${p.left<=0?'Esgotado':(ready?'Pronto!':'Carregando')} · restam ${p.left}</em></div>`;
 setBtns();renderStrip();
}

/* movimento e efeitos */
async function walk(p,n){for(let i=0;i<n&&p.pos<N;i++){p.pos++;place();hop(p);sfx.step();await sleep(210);}}
function hop(p){p.el.classList.remove('hop');void p.el.offsetWidth;p.el.classList.add('hop');}
async function jump(p,to){p.pos=Math.max(1,Math.min(N,to));place();await sleep(700);}
async function push(q,n){
 if(q.shield>0){say(`${q.name} está com escudo e não sofreu nada!`);pop(q,'Escudo!');sfx.good();await sleep(1000);return false;}
 fxHit();pop(q,'-'+n);sfx.hit();say(`${q.name} volta ${n} casas.`);await sleep(500);await jump(q,q.pos-n);return true;
}
async function freeze(q){
 if(q.shield>0){say(`${q.name} está com escudo e não congelou!`);pop(q,'Escudo!');sfx.good();await sleep(1000);return;}
 q.skip++;pop(q,'Gelo!');sfx.freeze();say(`${q.name} foi congelado e perde a próxima vez!`);await sleep(1100);
}
async function swap(p,q){
 const a=p.pos,b=q.pos;
 if(q.shield>0&&b>a){say(`${q.name} está com escudo, nada acontece.`);pop(q,'Escudo!');await sleep(1000);return;}
 say(`${p.name} e ${q.name} trocaram de lugar!`);sfx.swap();p.pos=b;q.pos=a;place();hop(p);hop(q);await sleep(1000);
}
async function playGame(p,g,title){
 const lv=p.pos>N/2?2:1;
 if(p.human)return modal(`<h3>${esc(title)}: ${esc(g.name)}</h3><p class="sub">${esc(p.name)}, ${esc(g.hint)}</p><div id="mg"></div>`,(c,close)=>g.run($('#mg',c),close,lv));
 say(`${p.name} está resolvendo o desafio...`);await sleep(1100);
 return{win:Math.random()<.68,extra:0};
}
async function puzzle(p,b){
 const r=await playGame(p,nextGame(),'Desafio');
 if(r.win){const n=b+(r.extra||0);say(`${p.name} resolveu! Avança ${n}.`);pop(p,'+'+n);sfx.good();await sleep(600);await walk(p,n);}
 else{say(`Quase! ${p.name} fica onde está.`);sfx.bad();await sleep(1000);}
}
async function villain(p){
 const vi=rnd(VILLAINS.length),v=VILLAINS[vi];
 if(p.shield>0){say(`${v} apareceu, mas o escudo de ${p.name} protegeu!`);pop(p,'Escudo!');sfx.good();await showCard({kicker:`CASA ${p.pos}: ESCUDO!`,title:v,sub:`O escudo de ${p.name} protegeu do vilão!`,icon:villainSVG(vi),cls:'hero',color:'#4cd964',auto:p.human?0:3200});return;}
 await showCard({kicker:`CASA ${p.pos}: VILÃO NO CAMINHO!`,title:v,sub:`${v} bloqueou ${p.name}. Vença o desafio para passar!`,icon:villainSVG(vi),cls:'hero',color:'#ff4d5e',buttons:[{label:'Encarar o vilão!',v:'ok'}],auto:p.human?0:3600});
 const r=await playGame(p,nextGame(),`Contra ${v}`);
 if(r.win){say(`${p.name} derrotou ${v} e avança 2!`);pop(p,'+2');sfx.good();await sleep(600);await walk(p,2);}
 else{say(`${v} venceu! ${p.name} volta 3 casas.`);fxHit();pop(p,'-3');sfx.bad();await sleep(600);await jump(p,p.pos-3);}
}
async function duel(p){
 const q=await rival(p,'Quem vai duelar com você?');
 if(!q){say('Não tem ninguém para duelar.');await sleep(1000);return;}
 const g=nextGame();
 await info(p,'Duelo!',`${p.name} contra ${q.name}. Jogo: ${g.name}.`);
 const r1=await playGame(p,g,'Duelo');
 if(p.human&&q.human)await okModal('Passe o aparelho',`Agora é a vez de ${q.name}.`,'Estou pronto');
 const r2=await playGame(q,g,'Duelo');
 let msg,w=null,l=null;
 if(r1.win&&!r2.win){w=p;l=q;}else if(!r1.win&&r2.win){w=q;l=p;}
 msg=w?`${w.name} venceu o duelo! Avança 3 e ${l.name} volta 2.`:'Empate! Ninguém se mexe.';
 await info(p,'Resultado do duelo',msg);say(msg);
 if(w){sfx.good();pop(w,'+3');await walk(w,3);await push(l,2);}
}
const WHEEL=[
 {d:'Avança 2 casas.',t:'+2',c:'#4cd964',f:p=>walk(p,2)},
 {d:'Avança 4 casas.',t:'+4',c:'#2ee6d6',f:p=>walk(p,4)},
 {d:'Volta 2 casas.',t:'Volta 2',c:'#ff4d5e',f:p=>push(p,2)},
 {d:'Joga o dado de novo!',t:'Dado ouro',c:'#ffd23f',f:async p=>{p.extra=true;}},
 {d:'Avança 6 casas!',t:'+6',c:'#ff9f1c',f:p=>walk(p,6)},
 {d:'Fica protegido por 3 jogadas.',t:'Escudo',c:'#4ca3ff',f:async p=>{p.shield=3;}},
 {d:'Avança 3 casas.',t:'+3',c:'#b79bff',f:p=>walk(p,3)},
 {d:'O superpoder está pronto!',t:'Recarga',c:'#ff6fb5',f:async p=>{p.charge=p.hero.cd;}}
];
async function wheel(p){
 const k=rnd(8),R=360*5-(k*45+22.5);
 const conic=WHEEL.map((w,i)=>`${w.c} ${i*45}deg ${(i+1)*45}deg`).join(',');
 const labels=WHEEL.map((w,i)=>`<span style="transform:rotate(${i*45+22.5-90}deg)">${w.t}</span>`).join('');
 const res=await modal(`<h3>Roleta da sorte</h3><div class="wheelwrap"><i class="wp"></i><div class="wheel" id="wh" style="background:conic-gradient(${conic})">${labels}<div class="hub"></div></div></div><button class="btn" id="spin" type="button">Girar!</button>`,(c,close)=>{
  const wh=$('#wh',c),btn=$('#spin',c);
  const go=()=>{btn.disabled=true;sfx.spin();wh.style.transform=`rotate(${R}deg)`;
   setTimeout(()=>{btn.disabled=false;btn.textContent=`Saiu: ${WHEEL[k].t}. Continuar`;sfx.good();btn.onclick=()=>close(k);if(!p.human)setTimeout(()=>close(k),1300);},3900);};
  btn.onclick=go;if(!p.human)setTimeout(go,700);
 });
 const w=WHEEL[res],bad=w.t==='Volta 2';say(`Roleta da sorte: ${w.t}. ${w.d}`);pop(p,w.t);
 (bad?sfx.bad:sfx.good)();
 await showCard({kicker:bad?'OPS, AZAR!':'A ROLETA DEU...',title:w.t,sub:w.d,icon:ICON.wheel,cls:'k-wheel',color:bad?'#ff4d5e':w.c,who:{name:p.name,av:heroSVG(p.hero,true),color:p.color},auto:p.human?0:3800});
 await w.f(p);
}
const wpick=a=>{const tot=a.reduce((s,x)=>s+x.w,0);let r=Math.random()*tot;for(const x of a){r-=x.w;if(r<0)return x;}return a[0];};
const CARDS=[
 {w:3,t:'Foguete! Avança 5 casas.',f:p=>walk(p,5)},
 {w:3,t:'Vento a favor! Avança 3 casas.',f:p=>walk(p,3)},
 {w:2,t:'Dado de ouro! Joga de novo.',f:async p=>{p.extra=true;}},
 {w:2,t:'Escudo de luz! Protege por 2 jogadas.',f:async p=>{p.shield=3;}},
 {w:2,t:'Recarga! O poder está pronto.',f:async p=>{p.charge=p.hero.cd;}},
 {w:2,t:'Congelante! Escolha um rival para perder a vez.',f:async p=>{const q=await rival(p,'Quem vai congelar?');if(q)await freeze(q);}},
 {w:2,t:'Troca-troca! Troque de lugar com um rival.',f:async p=>{const q=await rival(p,'Com quem vai trocar?');if(q)await swap(p,q);}},
 {w:2,t:'Mini desafio bônus! Resolva e avance 4.',f:p=>puzzle(p,4)},
 {w:1,t:'Duelo relâmpago! Escolha um rival.',f:p=>duel(p)},
 {w:1,t:'Ventania! Todos os outros voltam 1 casa.',f:async p=>{for(const q of S.players){if(q!==p&&q.shield<=0&&q.pos>1)await jump(q,q.pos-1);}}},
 {w:1,bad:true,t:'Casca de banana! Volta 2 casas.',f:p=>push(p,2)}
];
async function gift(p){
 const c=wpick(CARDS),i=c.t.indexOf('!'),title=c.t.slice(0,i+1),sub=c.t.slice(i+1).trim();
 say(c.t);
 (c.bad?sfx.bad:sfx.good)();
 await showCard({kicker:c.bad?'OPS, AZAR!':'VOCÊ GANHOU!',title,sub,icon:ICON.gift,cls:'k-gift',color:c.bad?'#ff4d5e':'#4cd964',who:{name:p.name,av:heroSVG(p.hero,true),color:p.color},auto:p.human?0:3800});
 await c.f(p);
}
async function land(p){
 if(p.pos>=N)return;
 const t=TILE[p.pos];
 await where(p);
 if(!t)return;
 switch(t.k){
  case 'portal':{say(`${p.name} entrou no portal ${t.l} e vai para a casa ${t.to}!`);await sleep(300);await jump(p,t.to);flashTile(t.to);hop(p);
   sfx.land('exit');
   await showCard({kicker:`CASA ${t.to}`,title:`Saída ${t.l}`,sub:`${p.name} saiu do portal ${t.l} na casa ${t.to}!`,icon:ICON.exit,cls:'k-exit',color:p.color,who:{name:p.name,av:heroSVG(p.hero,true),color:p.color},auto:p.human?0:3500});break;}
  case 'turbo':say(`Turbo! ${p.name} avança 3 casas.`);pop(p,'Turbo!');await walk(p,3);break;
  case 'energy':p.charge=Math.min(p.hero.cd,p.charge+Math.ceil(p.hero.cd/2));pop(p,'Energia!');say(`Energia! O poder de ${p.name} carregou mais.`);sfx.power();await sleep(900);break;
  case 'villain':await villain(p);break;
  case 'gift':await gift(p);break;
  case 'wheel':await wheel(p);break;
  case 'duel':await duel(p);break;
  case 'puzzle':await puzzle(p,3);break;
 }
}

/* poderes */
async function usePower(p){
 const h=p.hero;p.charge=0;p.used=true;sfx.power();say(`${p.name} usou ${h.power}!`);pop(p,h.power);
 p.left--;S.pw=(S.pw||0)+1;
 await showCard({kicker:`SUPERPODER! (restam ${p.left})`,title:h.power,sub:h.desc,icon:`<svg viewBox="-12 -12 24 24" fill="${h.ink}">${(SYM[h.sym]||'').replace(/@I/g,h.ink).replace(/@C/g,h.color)}</svg>`,cls:'pw',color:h.color,who:{name:p.name,av:heroSVG(h,true),color:p.color},auto:p.human?0:3800});
 switch(h.id){
  case 'fagulha':p.armed='dash';say('Super Velocidade! O próximo dado vale +3.');break;
  case 'pluma':p.armed='fly';say('Voo Livre! Ao rolar, voa 6 casas.');break;
  case 'trovao':p.armed='twin';say('Raio Duplo! Vai rolar dois dados.');break;
  case 'mira':p.armed='mind';say('Mente Mestra! Escolha o número do dado.');break;
  case 'luma':p.shield=4;say('Escudo de Luz ligado por 3 jogadas.');break;
  case 'granito':{const q=await rival(p,'Quem vai levar o soco?');if(q)await push(q,4);break;}
  case 'nevasco':{const q=await rival(p,'Quem vai congelar?');if(q)await freeze(q);break;}
  case 'gravito':for(const q of S.players){if(q!==p&&q.pos<N)await push(q,2);}break;
 }
 await sleep(400);
}
async function doRoll(p){
 const arm=p.armed;p.armed=null;let r;
 if(arm==='fly'){showDice([6]);say(`${p.name} voa 6 casas!`);pop(p,'+6');await sleep(500);await walk(p,6);return;}
 if(arm==='mind'){say('Escolha o número do dado.');r=await chooseDie(p);showDice([r]);}
 else if(arm==='twin'){await rollAnim(2);const a=1+rnd(6),b=1+rnd(6);showDice([a,b]);r=a+b;}
 else{await rollAnim(1);r=1+rnd(6);showDice([r]);}
 if(arm==='dash')r+=3;
 say(`${p.name} tirou ${r}${arm==='dash'?' (com turbo)':''}.`);pop(p,'+'+r);await sleep(500);await walk(p,r);
}
function winCheck(p){if(p.pos>=N&&!S.over){S.over=true;win(p);return true;}return false;}
function win(p){
 sfx.win();confetti();say(`${p.name} venceu a corrida!`);
 const rank=[...S.players].sort((a,b)=>(b===p)-(a===p)||b.pos-a.pos);
 const pod=rank.map((q,i)=>`<div class="pd p${i}" style="--pc:${q.color}"><span class="pn">${i+1}º</span><span class="av">${heroSVG(q.hero,true)}</span><b>${esc(q.name)}</b><small>${q===p?'Chegou primeiro!':'casa '+q.pos}</small></div>`).join('');
 modal(`<h3>${esc(p.name)} venceu!</h3><p>${esc(p.hero.name)} chegou primeiro ao castelo da casa ${N}.</p><div class="podium">${pod}</div><p class="sub">${S.rounds||0} jogadas na corrida e ${S.pw||0} superpoder${(S.pw||0)===1?'':'es'} usado${(S.pw||0)===1?'':'s'}.</p><div class="btnrow"><button class="btn" data-a="again" type="button">Jogar de novo</button><button class="btn ghost" data-a="menu" type="button">Menu</button></div>`,(c,close)=>{c.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;close();if(b.dataset.a==='again')startGame();else toMenu();};});
}

/* turnos */
function turnCard(p){
 const h=p.hero,ready=canPower(p);
 const pw=p.left<=0?'Superpoder esgotado.':ready?`Poder pronto! ${p.left===1?'Resta 1 uso':'Restam '+p.left+' usos'}.`:`Poder carregando: ${p.charge}/${h.cd}. ${p.left===1?'Resta 1 uso':'Restam '+p.left+' usos'}.`;
 const btn=p.human?[{label:'Rolar o dado',v:'roll'}].concat(ready?[{label:`Usar ${h.power}`,v:'power',alt:true}]:[]):null;
 return showCard({kicker:p.human?'SUA VEZ!':'VEZ DO ROBÔ',title:p.name,sub:`Casa ${p.pos}. ${pw}`,icon:heroSVG(h,true),cls:'hero',color:p.color,buttons:btn,auto:p.human?0:2400});
}
async function takeTurn(p){
 const v=await turnCard(p);
 if(p.human){
  if(v==='power'&&canPower(p)){await usePower(p);renderAll();}
  if(v!=='roll'){S.wait=true;setBtns();await new Promise(r=>{S.go=r;});S.wait=false;setBtns();}
 }else{await sleep(300);if(canPower(p)&&Math.random()<.65)await usePower(p);await sleep(300);}
 await doRoll(p);if(winCheck(p))return;
 await land(p);winCheck(p);
}
async function turnLoop(){
 try{
  while(!S.over){
   const p=S.players[S.turn];S.cur=p;p.used=false;S.rounds=(S.rounds||0)+1;renderAll();
   if(p.skip>0){p.skip--;say(`${p.name} está congelado e perde a vez.`);sfx.freeze();await showCard({kicker:'CONGELADO!',title:p.name,sub:'Perde esta vez por causa do gelo.',icon:heroSVG(p.hero,true),cls:'hero',color:'#2ee6d6',auto:p.human?0:2600});S.turn=(S.turn+1)%S.players.length;continue;}
   say(p.human?`Vez de ${p.name}. Role o dado!`:`Vez de ${p.name}. O robô está jogando.`);
   await takeTurn(p);
   if(S.over)break;
   if(p.shield>0)p.shield--;
   if(!p.used)p.charge=Math.min(p.hero.cd,p.charge+1);
   if(p.extra){p.extra=false;say(`Dado de ouro! ${p.name} joga de novo.`);await sleep(1000);}
   else S.turn=(S.turn+1)%S.players.length;
  }
 }catch(e){if(e.message!=='dead')console.error(e);}
}

/* abertura e controles */
const cfg={n:2,size:100,theme:'espaco',tut:false,slots:[{hero:0,human:true,name:''},{hero:1,human:true,name:''},{hero:2,human:false,name:''},{hero:3,human:false,name:''}]};
const KEY='herorun.v1';
function saveCfg(){try{localStorage.setItem(KEY,JSON.stringify({n:cfg.n,size:cfg.size,theme:cfg.theme,tut:cfg.tut,slots:cfg.slots}));}catch(e){}}
function loadCfg(){try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(!j)return;
 if([2,3,4].includes(j.n))cfg.n=j.n;if(LAYOUTS[j.size])cfg.size=j.size;if(THEMES[j.theme])cfg.theme=j.theme;cfg.tut=!!j.tut;
 if(Array.isArray(j.slots)&&j.slots.length===4){const hs=j.slots.map(s=>+s.hero);if(hs.every(h=>h>=0&&h<8)&&new Set(hs).size===4)cfg.slots=j.slots.map(s=>({hero:+s.hero,human:!!s.human,name:String(s.name||'').slice(0,14)}));}
}catch(e){}}
loadCfg();
function renderSetup(){
 $$('#countSeg .btn').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.n===cfg.n)));
 $$('#sizeSeg .btn').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.s===cfg.size)));
 $$('#themeSeg .btn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===cfg.theme)));
 saveCfg();
 const used=cfg.slots.slice(0,cfg.n).map(s=>s.hero);
 $('#slots').innerHTML=cfg.slots.slice(0,cfg.n).map((s,i)=>{const h=HEROES[s.hero];
  return `<div class="slot" style="--pc:${PCOL[i]}"><div class="slot-h"><b>Jogador ${i+1}</b><button class="tg" data-i="${i}" type="button">${s.human?'Pessoa':'Robô'}</button></div><input type="text" maxlength="14" placeholder="Nome (opcional)" value="${esc(s.name)}" data-i="${i}" aria-label="Nome do jogador ${i+1}"><div class="hgrid">${HEROES.map((x,j)=>`<button class="hbtn" type="button" data-i="${i}" data-h="${j}" aria-pressed="${j===s.hero}" ${used.some((u,k)=>u===j&&k!==i)?'disabled':''}>${heroSVG(x)}<span>${x.name}</span></button>`).join('')}</div><p class="pdesc"><b>${h.power}</b>: ${h.desc}</p></div>`;}).join('');
}
async function tutorial(){
 const ep=EPOCH;
 const dado=`<div class="die" style="width:74px;height:74px;margin:auto">${Array.from({length:9},(_,i)=>`<s class="${PIPS[5].includes(i)?'p':''}"></s>`).join('')}</div>`;
 const steps=[
  {t:'Role o dado',s:'Toque em "Rolar o dado" e ande as casas que saírem.',icon:dado,cls:'hero',c:'#ffd23f'},
  {t:'Casas especiais',s:'Cada cor faz uma coisa: desafio, vilão, caixa surpresa, roleta, duelo, energia, turbo e portal.',icon:ICON.gift,cls:'k-gift',c:'#ff9f1c'},
  {t:'Superpoder',s:'Cada herói tem um poder que carrega a cada jogada. Só dá para usar 2 vezes na corrida!',icon:`<svg viewBox="-12 -12 24 24" fill="#0d1130">${SYM.bolt}</svg>`,cls:'pw',c:'#4ca3ff'},
  {t:`Chegue na casa ${N}`,s:'Quem chegar primeiro ao castelo ganha a corrida. Boa sorte!',icon:ICON.goal,cls:'k-goal',c:'#ffd23f'}
 ];
 for(let i=0;i<steps.length;i++){
  const st=steps[i];
  const v=await showCard({kicker:`COMO JOGAR ${i+1}/${steps.length}`,title:st.t,sub:st.s,icon:st.icon,cls:st.cls,color:st.c,buttons:[{label:i<steps.length-1?'Próximo':'Vamos jogar!',v:'ok'}].concat(i<steps.length-1?[{label:'Pular',v:'skip',alt:true}]:[])});
  if(ep!==EPOCH)return false;
  if(v==='skip')break;
 }
 cfg.tut=true;saveCfg();return true;
}
function startGame(){
 EPOCH++;dropCard();
 THEME=cfg.theme;setBoard(cfg.size);fillLegend();music.start();HIST.length=0;{const b=$('#banner');if(b){$('#bnIcon').className='sw t k-start';$('#bnIcon').innerHTML='<b>1</b>';$('#bnWhere').textContent='A corrida vai começar!';$('#bnWhat').textContent='Role o dado para andar.';}}
 const players=cfg.slots.slice(0,cfg.n).map((s,i)=>({id:i,hero:HEROES[s.hero],name:s.name.trim()||HEROES[s.hero].name,human:s.human,color:PCOL[i],pos:1,charge:0,skip:0,shield:0,extra:false,armed:null,used:false,left:2}));
 S={players,turn:0,cur:null,over:false,wait:false,go:null};
 $('#setup').hidden=true;$('#game').hidden=false;$('#modal').hidden=true;$('#fx').innerHTML='';$('#pick').hidden=true;
 buildBoard();makeTokens();showDice([1]);window.scrollTo(0,0);
 if(!cfg.tut){const ep=EPOCH;tutorial().then(ok=>{if(ok&&ep===EPOCH&&S&&!S.over)turnLoop();});}else turnLoop();
}
function toMenu(){EPOCH++;S=null;music.stop();dropCard();$('#modal').hidden=true;$('#fx').innerHTML='';$('#game').hidden=true;$('#setup').hidden=false;window.scrollTo(0,0);}

$('#themeSeg').onclick=e=>{const b=e.target.closest('.btn');if(!b)return;cfg.theme=b.dataset.t;renderSetup();};
$('#sizeSeg').onclick=e=>{const b=e.target.closest('.btn');if(!b)return;cfg.size=+b.dataset.s;renderSetup();};
$('#countSeg').onclick=e=>{const b=e.target.closest('.btn');if(!b)return;cfg.n=+b.dataset.n;renderSetup();};
$('#slots').onclick=e=>{
 const tg=e.target.closest('.tg'),hb=e.target.closest('.hbtn');
 if(tg){const s=cfg.slots[+tg.dataset.i];s.human=!s.human;renderSetup();}
 else if(hb&&!hb.disabled){cfg.slots[+hb.dataset.i].hero=+hb.dataset.h;renderSetup();}
};
$('#slots').oninput=e=>{const t=e.target;if(t.matches('input[data-i]')){cfg.slots[+t.dataset.i].name=t.value;saveCfg();}};
$('#btnStart').onclick=()=>{beep(600,.08);startGame();};
$('#btnRoll').onclick=()=>{if(S&&S.wait&&S.go){const g=S.go;S.go=null;g();}};
$('#btnPower').onclick=async()=>{
 const p=S&&S.cur;if(!p||!S.wait||!p.human||!canPower(p))return;
 S.wait=false;setBtns();
 try{await usePower(p);}catch(e){if(e.message!=='dead')console.error(e);return;}
 S.wait=true;renderAll();
};
$('#btnSound').onclick=e=>{SND=!SND;e.currentTarget.textContent=SND?'Som: ligado':'Som: desligado';if(SND){beep(660,.08);music.start();}else music.stop();};
$('#btnMusic').onclick=e=>{MUS=!MUS;e.currentTarget.textContent=MUS?'Música: ligada':'Música: desligada';if(MUS)music.start();else music.stop();};
$('#btnView').onclick=e=>{const st=$('#stage'),flat=st.classList.toggle('flat');e.currentTarget.textContent=flat?'Vista: plana':'Vista: 3D';};
$('#btnMenu').onclick=async()=>{
 const v=await modal(`<h3>Voltar ao menu?</h3><p>A partida atual será perdida.</p><div class="btnrow"><button class="btn" data-v="1" type="button">Voltar ao menu</button><button class="btn ghost" data-v="0" type="button">Continuar jogando</button></div>`,(c,close)=>{c.onclick=e=>{const b=e.target.closest('[data-v]');if(b)close(b.dataset.v==='1');};});
 if(v)toMenu();
};
function fillLegend(){$('#legend').innerHTML=`<li><span><b>Objetivo</b>: chegue primeiro à casa ${N}. O poder do herói recarrega conforme você joga ou numa casa de energia, e cada herói pode usar o superpoder só 2 vezes na corrida.</span></li>`+LEG.map(([k,n,d])=>`<li><span class="sw t k-${k}">${ICON[k]}</span><span><b>${n}</b>: ${d}</span></li>`).join('');}
renderSetup();
