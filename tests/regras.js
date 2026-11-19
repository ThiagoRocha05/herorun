/* Regras e vazamentos, usando o gancho window.__HR (so existe com ?teste na URL) */
const {chromium}=require('playwright');
const URL=process.env.HR_URL||'file://'+process.cwd()+'/index.html?teste';
const falhas=[],passou=[];
const t=(nome,cond,det='')=>{(cond?passou:falhas).push(nome+(cond?'':'  '+det));};
const fast=()=>{const st=window.setTimeout.bind(window);window.setTimeout=(f,d,...a)=>st(f,Math.min(d||0,d>2000?60:2),...a);};
const cfg=(n,humans=0)=>JSON.stringify({n,size:60,theme:'cidade',tut:true,slots:[0,3,5,7].map((h,i)=>({hero:h,human:i<humans,name:''}))});
async function novaPagina(b,{semFast=false,humans=0,n=2}={}){
 const pg=await b.newPage({viewport:{width:1024,height:768}});const erros=[];
 pg.on('pageerror',e=>erros.push(e.message));
 await pg.addInitScript(()=>{window.__osc=0;const o=AudioContext.prototype.createOscillator;AudioContext.prototype.createOscillator=function(){window.__osc++;return o.call(this);};
  window.__iv=new Set();const si=window.setInterval.bind(window),ci=window.clearInterval.bind(window);window.setInterval=(f,d,...a)=>{const id=si(f,d,...a);window.__iv.add(id);return id;};window.clearInterval=id=>{window.__iv.delete(id);return ci(id);};
  window.__raf=0;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=f=>{window.__raf++;return raf(f);};});
 if(!semFast)await pg.addInitScript(fast);
 await pg.addInitScript(c=>localStorage.setItem('herorun.v1',c),cfg(n,humans));
 await pg.goto(URL);
 return {pg,erros};
}
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});

 /* 1. duelo: o rival que ganha e chega ao castelo vence na hora (antes a vitoria so saia na vez dele) */
 {const {pg,erros}=await novaPagina(b);
  await pg.click('#btnStart');
  const r=await pg.evaluate(async()=>{const H=window.__HR;H.stopLoop();const S=H.S,[p,q]=S.players;
   p.pos=10;q.pos=H.N-1;let k=0;H.setRobotWin(()=>k++===1); /* p perde, q ganha */
   await H.duel(p);
   const antes={qpos:q.pos,over:S.over};const v=H.winCheck(p);
   return {antes,v,over:S.over,nome:q.name,card:document.querySelector('#card').textContent};});
  t('duelo: rival chega ao castelo',r.antes.qpos>=60,JSON.stringify(r.antes));
  t('duelo: vitoria do rival e detectada na hora',r.v===true&&r.over===true,JSON.stringify(r));
  t('duelo: quem aparece como vencedor e o rival',r.card.includes(r.nome+' venceu!'),r.card.slice(0,80));
  t('duelo: sem erro de script',erros.length===0,erros.join('|'));await pg.close();}

 /* 2. escudo: o numero de jogadas prometido no texto e o que de fato protege (valor = jogadas + 1, porque a jogada atual gasta 1) */
 {const {pg}=await novaPagina(b);await pg.click('#btnStart');
  const r=await pg.evaluate(async()=>{const H=window.__HR;H.stopLoop();const p=H.S.players[0];const out={};
   const jog=s=>+(s.match(/(\d+) jogadas/)||[])[1];
   const w=H.WHEEL.find(x=>x.t==='Escudo');p.shield=0;await w.f(p);out.roleta={prom:jog(w.d),val:p.shield};
   const c=H.CARDS.find(x=>/Escudo/.test(x.t));p.shield=0;await c.f(p);out.caixa={prom:jog(c.t),val:p.shield};
   p.hero=H.HEROES.find(h=>h.id==='luma');p.left=2;p.shield=0;await H.usePower(p);out.poder={prom:jog(p.hero.desc),val:p.shield};return out;});
  for(const k in r)t(`escudo (${k}): promete ${r[k].prom} jogadas`,r[k].val===r[k].prom+1,`valor ${r[k].val}`);
  await pg.close();}

 /* 3. congelar nao acumula (antes dois gelos seguidos faziam perder duas vezes) */
 {const {pg}=await novaPagina(b);await pg.click('#btnStart');
  const sk=await pg.evaluate(async()=>{const H=window.__HR;H.stopLoop();const q=H.S.players[1];await H.freeze(q);await H.freeze(q);return q.skip;});
  t('congelar: segundo gelo nao acumula',sk===1,'skip='+sk);await pg.close();}

 /* 4. musica: depois de um salto grande no relogio nao agenda milhares de notas de uma vez; aba oculta silencia */
 {const {pg}=await novaPagina(b,{semFast:true});await pg.click('#btnStart');
  await pg.waitForTimeout(700);
  const r=await pg.evaluate(async()=>{const H=window.__HR,A=H.AC;const base=A.currentTime;
   const antes=window.__osc;Object.defineProperty(A,'currentTime',{configurable:true,get:()=>base+600+(performance.now()/1000)});
   await new Promise(r=>setTimeout(r,500));const gerados=window.__osc-antes;
   Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
   await new Promise(r=>setTimeout(r,200));const oculto=A.state;
   return {gerados,oculto};});
  t('musica: salto de 10 min nao gera rajada de notas',r.gerados<120,'osciladores criados: '+r.gerados);
  t('musica: aba oculta suspende o audio',r.oculto==='suspended','estado: '+r.oculto);await pg.close();}

 /* 5. mini game abandonado pelo menu nao deixa loops nem temporizadores vivos */
 {const {pg}=await novaPagina(b,{semFast:true,humans:1});await pg.click('#btnStart');
  const r=await pg.evaluate(async()=>{const H=window.__HR;H.stopLoop();const p=H.S.players[0];const esp=ms=>new Promise(r=>setTimeout(r,ms));const out={};
   const g1=H.GAMES.find(g=>g.name==='Pare no verde');H.playGame(p,g1,'t');await esp(300);H.toMenu();window.__raf=0;await esp(600);out.raf=window.__raf;
   const g2=H.GAMES.find(g=>g.name==='Pega-estrelas');H.startGame();H.stopLoop();H.playGame(H.S.players[0],g2,'t');await esp(300);H.toMenu();await esp(1500);out.iv=window.__iv.size;
   const osc=window.__osc;await esp(100);out.somDepois=window.__osc-osc;return out;});
  t('mini game abandonado: sem loop de animacao (Pare no verde)',r.raf<=3,'quadros: '+r.raf);
  t('mini game abandonado: sem temporizador vivo (Pega-estrelas)',r.iv===0,'intervalos vivos: '+r.iv);
  await pg.close();}

 await b.close();
 console.log(passou.map(x=>'ok   '+x).join('\n'));
 if(falhas.length){console.log('\nFALHAS:\n'+falhas.map(x=>'FALHA '+x).join('\n'));process.exitCode=1;}else console.log('\nregras ok ('+passou.length+' verificacoes)');
})();
