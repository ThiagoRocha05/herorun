const {chromium}=require('playwright');
const URL='file://'+process.cwd()+'/index.html';
const fast=()=>{const st=window.setTimeout.bind(window);window.setTimeout=(f,d,...a)=>st(f,Math.min(d||0,d>2000?60:2),...a);};
const cfgOf=(n,size,theme,humans)=>JSON.stringify({n,size,theme,tut:true,slots:[0,1,2,3].map(i=>({hero:[0,3,5,7][i],human:i<humans,name:''}))});
const out=[];const fail=[];
async function robotGame(b,n,size,theme){
 const pg=await b.newPage({viewport:{width:1024,height:768}});const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(fast);await pg.addInitScript(c=>localStorage.setItem('herorun.v1',c),cfgOf(n,size,theme,0));
 await pg.goto(URL);await pg.click('#btnStart');
 const t0=Date.now();let w=null;
 while(Date.now()-t0<170000){const c=await pg.$eval('#card',e=>e.textContent).catch(()=>'');const m=c.match(/(\S+) venceu!/);if(m){w=m[1];break;}await pg.waitForTimeout(200);}
 await pg.close();
 const tag=`robôs n=${n} size=${size} tema=${theme}`;
 if(!w||errs.length)fail.push(tag+' '+(w?'':'SEM VENCEDOR ')+errs.join('|'));else out.push(tag+' ok '+w);
}
async function humanGame(b,size){
 const pg=await b.newPage({viewport:{width:768,height:1024},hasTouch:true});const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(fast);await pg.addInitScript(c=>localStorage.setItem('herorun.v1',c),cfgOf(2,size,'cidade',2));
 await pg.goto(URL);await pg.click('#btnStart');
 const t0=Date.now();let w=false,powers=0;
 while(Date.now()-t0<170000){
  const c=await pg.$eval('#card',e=>e.textContent).catch(()=>'');
  if(/venceu!/.test(c)){w=true;break;}
  // cartões
  const bs=await pg.$$('#landcard:not([hidden]) .lcbtns button');
  if(bs.length){let pick=bs[0];
   for(const x of bs){const tx=(await x.textContent()).trim();if(/poder/i.test(tx)&&powers<2&&Math.random()<.4){pick=x;powers++;break;}}
   await pick.click({force:true,timeout:2000}).catch(()=>{});await pg.waitForTimeout(40);continue;}
  // modal: puzzles/escolhas
  const opts=await pg.$$('#card .opt, #card button.opt');
  if(opts.length){await opts[Math.floor(Math.random()*opts.length)].click({force:true,timeout:2000}).catch(()=>{});await pg.waitForTimeout(40);continue;}
  const cb=await pg.$$('#card button');
  if(cb.length){await cb[0].click({force:true,timeout:2000}).catch(()=>{});await pg.waitForTimeout(40);continue;}
  const r=await pg.$('#btnRoll:not([disabled])');
  if(r){await r.click({force:true,timeout:2000}).catch(()=>{});}
  await pg.waitForTimeout(40);
 }
 await pg.close();
 const tag=`humanos size=${size}`;
 if(!w||errs.length)fail.push(tag+' '+(w?'':'NÃO TERMINOU ')+errs.join('|'));else out.push(tag+' ok');
}
(async()=>{
 const b=await chromium.launch();
 const jobs=[];
 for(const size of [60,100])for(const n of [2,4])jobs.push(()=>robotGame(b,n,size,['espaco','cidade','floresta'][(size/20+n)%3|0]));
 for(const size of [60])jobs.push(()=>humanGame(b,size));
 let i=0;await Promise.all(Array.from({length:4},async()=>{while(i<jobs.length){const j=jobs[i++];await j().catch(e=>fail.push('EXC '+e.message.slice(0,120)));}}));
 console.log(out.join('\n'));console.log('FALHAS:',fail.length?fail:'nenhuma');if(fail.length)process.exitCode=1;
 await b.close();
})();
