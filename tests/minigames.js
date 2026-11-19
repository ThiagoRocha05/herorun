/* Jogador-robo: resolve cada um dos 27 mini games lendo so a tela, certo e errado, nos 2 niveis.
   Prova que a resposta certa existe, e unica, e que o jogo a aceita (e recusa as erradas). */
const {chromium}=require('playwright');
const URL=process.env.HR_URL||'file://'+process.cwd()+'/index.html?teste';
const N=+process.env.ITER||10;
const LENTOS={'Pare no verde':3,'Pega-estrelas':2,'Siga as cores':5};

const speed=()=>{const st=window.setTimeout.bind(window),si=window.setInterval.bind(window);
 window.setTimeout=(f,d,...a)=>st(f,d>2000?60:Math.max(2,(d||0)/6),...a);
 window.setInterval=(f,d,...a)=>si(f,Math.max(5,(d||0)/6),...a);};

const runOne=async([idx,lv,mode])=>{
 const H=window.__HR,D=H.D,g=H.GAMES[idx];
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const esp=ms=>new Promise(r=>setTimeout(r,ms));
 const espera=async(fn,ms=8000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=fn();if(v)return v;await esp(3);}throw new Error('tempo esgotado');};
 const sem=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
 let box;const feito=H.modal('<div id="mg"></div>',(c,close)=>{box=$('#mg',c);g.run(box,close,lv);});
 const certo=mode==='right';
 try{
  const opts=()=>$$('.opt',box),dv=e=>e.dataset.v;
  const unicas=()=>{const v=opts().map(dv);if(new Set(v).size!==v.length)throw new Error('alternativas repetidas: '+v);};
  const pick1=r=>{unicas();const rs=opts().filter(e=>dv(e)===String(r));if(rs.length!==1)throw new Error(`resposta certa ${JSON.stringify(r)} aparece ${rs.length}x entre ${opts().map(dv)}`);return{right:rs[0],wrong:opts().filter(e=>dv(e)!==String(r))};};
  const clica=({right,wrong})=>(certo?right:wrong[0]).click();
  const q=()=>$('.q',box),qb=()=>$$('.q b',box);
  const DIAS=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ehPalavra=s=>D.LEXCOL.has(s)||D.FALTA.includes(s);
  let pulou=false;
  switch(g.name){
   case 'Conta relâmpago':{const t=q().textContent;let m,a;if(m=t.match(/^(\d+) ([+-]) (\d+) = \?$/))a=m[2]==='+'?+m[1]+ +m[3]:+m[1]- +m[3];else if(m=t.match(/^Dobro de (\d+) = \?$/))a=2*m[1];else throw new Error('texto '+t);clica(pick1(a));break;}
   case 'Qual é a maior?':{const bs=opts(),v=bs.map(b=>{const m=b.textContent.match(/(\d+) \+ (\d+)/);return +m[1]+ +m[2];});
    v.forEach((x,i)=>{if(String(x)!==dv(bs[i]))throw new Error('valor do botao nao confere com a conta');});if(new Set(v).size!==3)throw new Error('empate na maior');
    const i=v.indexOf(Math.max(...v));(certo?bs[i]:bs[(i+1)%3]).click();break;}
   case 'Qual número vem?':{const n=$('.seq',box).textContent.split(',').slice(0,4).map(Number),p=n[1]-n[0];if(!(n[2]-n[1]===p&&n[3]-n[2]===p))throw new Error('sequencia sem regra '+n);clica(pick1(n[3]+p));break;}
   case 'Quem é diferente?':{const bs=opts(),h=bs.map(b=>b.innerHTML),odd=bs.filter((b,i)=>h.filter(x=>x===h[i]).length===1);if(odd.length!==1)throw new Error('diferentes: '+odd.length);
    (certo?odd[0]:bs.find(b=>b!==odd[0])).click();break;}
   case 'Conte as formas':{const k=Object.keys(D.KN).find(x=>D.KN[x]===$('.sub b',box).textContent),cor=D.KC[k];const n=$$('.cnt svg',box).filter(s=>s.innerHTML.includes(cor)).length;clica(pick1(n));break;}
   case 'Na ordem certa':{const bs=opts().sort((a,b)=>dv(a)-dv(b));if(certo)for(const b of bs)b.click();else for(let i=0;i<3;i++)bs[bs.length-1].click();break;}
   case 'Qual começa com...':{const l=q().textContent.replace('Letra','').trim().toLowerCase();const c=opts().filter(o=>sem(dv(o))[0]===l);if(c.length!==1)throw new Error(`palavras com ${l}: ${c.length}`);unicas();(certo?c[0]:opts().find(o=>o!==c[0])).click();break;}
   case 'Siga as cores':{const pads=$$('.pad',box),seq=[];const mo=new MutationObserver(ms=>{for(const m of ms)if(m.target.classList.contains('lit')&&!(m.oldValue||'').includes('lit'))seq.push(pads.indexOf(m.target));});
    pads.forEach(p=>mo.observe(p,{attributes:true,attributeFilter:['class'],attributeOldValue:true}));
    await espera(()=>/sua vez/.test($('#sm',box).textContent),10000);mo.disconnect();if(seq.length<3||seq.length>5)throw new Error('sequencia de '+seq.length);
    if(certo)for(const i of seq){pads[i].click();await esp(1);}else pads[(seq[0]+1)%4].click();break;}
   case 'Pares de heróis':{if(!certo){pulou=true;break;}const cs=$$('.mc',box),f=cs.map(c=>$('.face',c).innerHTML),gr={};f.forEach((x,i)=>(gr[x]=gr[x]||[]).push(cs[i]));
    for(const k in gr){if(gr[k].length!==2)throw new Error('par com '+gr[k].length+' cartas');gr[k][0].click();gr[k][1].click();}break;}
   case 'Pega-estrelas':{if(certo){while(!$('#mgGo',box)){const h=$('.hole.star',box);if(h)h.click();await esp(1);}}break;}
   case 'Pare no verde':{const z=parseFloat($('.zone',box).style.left),w=parseFloat($('.zone',box).style.width),mk=$('#mk',box);
    await new Promise(res=>{const f=()=>{const x=parseFloat(mk.style.left);if(certo?(x>z+4&&x<z+w-4):(x<z-4||x>z+w+4)){$('#stop',box).click();res();}else requestAnimationFrame(f);};f();});break;}
   case 'Que dia vem depois?':{const i=DIAS.indexOf(qb()[0].textContent);if(i<0)throw new Error('dia?');const o=pick1(DIAS[(i+1)%7]);if(opts().some(e=>dv(e)===DIAS[i]))throw new Error('o proprio dia virou alternativa');clica(o);break;}
   case 'Animal e filhote':{const f=D.FILHOTES.find(x=>x[0]===qb()[0].textContent);clica(pick1(f[1]));break;}
   case 'Vogal ou consoante?':{const l=q().textContent.trim();clica(pick1('AEIOU'.includes(l)?'Vogal':'Consoante'));break;}
   case 'Quantas sílabas?':{const s=D.SILABAS.find(x=>x[0]===qb()[0].textContent);clica(pick1(s[1]));break;}
   case 'Que cor forma?':{const [a,b]=qb().map(x=>x.textContent);const m=D.MISTURAS.find(x=>x[0]===a&&x[1]===b);clica(pick1(m[2]));break;}
   case 'Parte do corpo':{const c=D.CORPO.find(x=>x[1]===q().textContent);if(!c)throw new Error('dica desconhecida '+q().textContent);clica(pick1(c[0]));break;}
   case 'Que horas são?':{const ls=$$('svg line',box),hh=ls.find(l=>l.getAttribute('stroke')==='#ff4d5e'),mm=ls.find(l=>l.getAttribute('stroke-width')==='3');
    const ang=l=>parseFloat(l.getAttribute('transform').match(/rotate\(([-\d.]+)/)[1]);const meia=ang(mm)===180;let h=Math.floor(ang(hh)/30)%12;if(h===0)h=12;
    clica(pick1(meia?`${h} e meia`:(h===1?'1 hora':`${h} horas`)));break;}
   case 'O contrário':{const w=qb()[0].textContent,a=D.OPOSTOS.find(x=>x[0]===w)[1],o=pick1(a);const gi=x=>D.CONFUSOS.findIndex(g=>g.includes(x));
    for(const e of o.wrong){const par=D.OPOSTOS.find(x=>x[1]===dv(e));if(gi(w)>=0&&gi(par[0])===gi(w))throw new Error(`${dv(e)} confunde com ${w}`);}clica(o);break;}
   case 'Quem rima?':{const w=qb()[0].textContent,fim=x=>sem(x).slice(-2),c=opts().filter(o=>fim(dv(o))===fim(w));if(c.length!==1)throw new Error(`rimam com ${w}: ${c.map(dv)}`);unicas();(certo?c[0]:opts().find(o=>o!==c[0])).click();break;}
   case 'Letra que falta':{const t=q().textContent;unicas();const rs=opts().filter(o=>D.FALTA.includes(t.replace('_',dv(o))));if(rs.length!==1)throw new Error(`${t}: ${rs.length} alternativas viram palavra da lista`);
    for(const o of opts())if(o!==rs[0]&&ehPalavra(t.replace('_',dv(o))))throw new Error(`${t}: ${dv(o)} forma outra palavra`);(certo?rs[0]:opts().find(o=>o!==rs[0])).click();break;}
   case 'Par ou ímpar?':{const n=+q().textContent;clica(pick1(n%2?'Ímpar':'Par'));break;}
   case 'Dezenas e unidades':{const n=+qb()[0].textContent,d=/dezenas/.test(q().textContent);clica(pick1(d?Math.floor(n/10):n%10));break;}
   case 'Alfabeto':{const [dir,ref]=qb().map(x=>x.textContent);const a=A[A.indexOf(ref)+(dir==='depois'?1:-1)];const o=pick1(a);if(opts().some(e=>dv(e)===ref))throw new Error('a letra de referencia virou alternativa');clica(o);break;}
   case 'Quantos lados?':{const n=$('svg polygon',box).getAttribute('points').trim().split(/\s+/).length;clica(pick1(n));break;}
   case 'Que mês vem depois?':{const i=MESES.indexOf(qb()[0].textContent);if(i<0)throw new Error('mes?');const o=pick1(MESES[(i+1)%12]);if(opts().some(e=>dv(e)===MESES[i]))throw new Error('o proprio mes virou alternativa');clica(o);break;}
   case 'Forme a palavra':{const L=opts().map(dv),ch=L.slice().sort().join('');const c=D.FORME[lv>1?2:1].filter(w=>[...w].sort().join('')===ch);if(c.length!==1)throw new Error('anagramas: '+c);const w=c[0];
    if(certo){for(const x of w){const b=opts().find(o=>dv(o)===x&&!o.classList.contains('done'));if(!b)throw new Error('sem botao para '+x);b.click();}}else{const b=opts().find(o=>dv(o)!==w[0]);for(let i=0;i<3;i++)b.click();}break;}
   default:throw new Error('jogo sem oraculo: '+g.name);
  }
  if(pulou){$('#modal').hidden=true;return {skip:true};}
  await espera(()=>$('#mgGo',box),10000);
  const win=$('.res',box).classList.contains('ok'),msg=$('.res',box).textContent;
  $('#mgGo',box).click();const r=await feito;
  return {nome:g.name,lv,mode,esperado:certo,ganhou:win,retorno:r&&r.win,msg};
 }catch(e){try{$('#modal').hidden=true;}catch(_){}return {nome:g.name,lv,mode,erro:e.message};}
};

(async()=>{
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:900}});const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(speed);
 await pg.addInitScript(()=>localStorage.setItem('herorun.v1',JSON.stringify({n:2,size:60,theme:'espaco',tut:true,slots:[0,1,2,3].map((h,i)=>({hero:h,human:false,name:''}))})));
 await pg.goto(URL);await pg.click('#btnStart');await pg.evaluate(()=>window.__HR.stopLoop());
 const nomes=await pg.evaluate(()=>window.__HR.GAMES.map(g=>g.name));
 const falhas=[];let total=0,pulados=0;const porJogo={};
 for(let i=0;i<nomes.length;i++){
  if(process.env.ONLY&&!nomes[i].includes(process.env.ONLY))continue;
  const it=Math.min(N,LENTOS[nomes[i]]||N);porJogo[nomes[i]]=0;
  for(const lv of [1,2])for(const mode of ['right','wrong'])for(let k=0;k<it;k++){
   const r=await pg.evaluate(runOne,[i,lv,mode]);
   if(r.skip){pulados++;continue;}total++;porJogo[nomes[i]]++;
   if(r.erro)falhas.push(`${nomes[i]} n${lv} ${mode}: ${r.erro}`);
   else if(r.ganhou!==r.esperado||r.retorno!==r.esperado)falhas.push(`${nomes[i]} n${lv} ${mode}: esperava ${r.esperado?'acerto':'erro'} e veio ${r.ganhou?'acerto':'erro'} (${r.msg})`);
  }
 }
 if(errs.length)falhas.push('erros de script: '+[...new Set(errs)].join(' | '));
 const unicas=[...new Set(falhas)];
 console.log(`${nomes.length} jogos, ${total} partidas simuladas (${pulados} puladas sem caminho de derrota)`);
 console.log(unicas.length?'FALHAS ('+falhas.length+' ocorrencias):\n - '+unicas.slice(0,25).join('\n - '):'minigames ok: toda resposta certa existe, e unica e e aceita; toda errada e recusada');
 process.exitCode=unicas.length?1:0;await b.close();
})();
