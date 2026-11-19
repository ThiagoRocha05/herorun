/* Modo offline: manifesto valido, icones e todos os arquivos do service worker existem, index aponta para eles */
const fs=require('fs'),path=require('path');const raiz=path.join(__dirname,'..');const falhas=[];const ok=(c,m)=>{if(!c)falhas.push(m);};
const ex=f=>fs.existsSync(path.join(raiz,f));
const man=JSON.parse(fs.readFileSync(path.join(raiz,'manifest.webmanifest'),'utf8'));
ok(man.start_url&&man.display==='standalone'&&man.lang==='pt-BR','manifesto incompleto');
for(const i of man.icons)ok(ex(i.src),'icone do manifesto nao existe: '+i.src);
const sw=fs.readFileSync(path.join(raiz,'sw.js'),'utf8');
const lista=JSON.parse(sw.match(/const FILES = (\[.*?\]);/s)[1].replace(/'/g,'"'));
for(const f of lista){const p=f.replace(/^\.\//,'');if(p!=='')ok(ex(p),'arquivo do service worker nao existe: '+f);}
ok(/const V = 'herorun-v\d+'/.test(sw),'versao do cache ausente');
const html=fs.readFileSync(path.join(raiz,'index.html'),'utf8');
for(const t of ['rel="manifest"','rel="apple-touch-icon"',"register('sw.js')"])ok(html.includes(t),'index.html sem '+t);
const fontes=[...html.matchAll(/url\((fonts\/[^)]+)\)/g)].map(m=>m[1]);
for(const f of fontes){ok(ex(f),'fonte do CSS nao existe: '+f);ok(lista.includes('./'+f),'fonte fora do cache offline: '+f);}
console.log(falhas.length?'FALHAS:\n - '+falhas.join('\n - '):`pwa ok (${lista.length} arquivos no cache, ${fontes.length} fontes)`);process.exitCode=falhas.length?1:0;
